'use strict';

const fs = require('fs');
const path = require('path');

const OF_CONTEXT = 'https://obligationfirst.org/v1/context.jsonld';

function siteBase(config) {
    return String(config.url || 'https://publedge.org/').replace(/\/$/, '');
}

function recordContext(config) {
    return [OF_CONTEXT, { pub: `${siteBase(config)}/vocab/` }];
}

function ofUri(config, kind, id) { return `${siteBase(config)}/${kind}/${id}.json`; }
function authorityUri(config, id) { return ofUri(config, 'authority', id); }
function instrumentUri(config, id) { return ofUri(config, 'instrument', id); }
function termUri(config, id) { return ofUri(config, 'term', id); }
function obligationUri(config, id) { return ofUri(config, 'obligation', id); }
function determinationUri(config, id) { return ofUri(config, 'determination', id); }
function partyUri(config, id) { return ofUri(config, 'party', id); }

function concreteObligationId(termId, obligationId) { return `${termId}-${obligationId}`; }
function localId(record) { return record['pub:id']; }

function compact(value) {
    return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null));
}

function slugify(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeStatus(status) {
    const map = {
        proposed: 'proposed',
        draft: 'draft',
        enacted: 'enacted',
        published: 'enacted',
        enforcing: 'in-force',
        'phased-enforcement': 'in-force',
        expired: 'sunset',
        terminated: 'sunset',
        superseded: 'superseded',
        withdrawn: 'withdrawn',
        'never-operative': 'inactive'
    };
    return map[status] || 'unknown';
}

function normativeForce(record) {
    if (['jia', 'rma'].includes(record.type)) return 'contractual';
    if (record.type === 'statute') return 'binding';
    if (['advisory-opinion', 'interpretive-letter', 'no-action-letter'].includes(record.type)) return 'nonbinding';
    return 'unknown';
}

function operativeStatus(status, force) {
    if (status === 'proposed' || status === 'draft') return 'future';
    if (status === 'expired' || status === 'terminated' || status === 'superseded' || status === 'never-operative') return 'inactive';
    if (status === 'enforcing') return 'operative';
    if (force === 'nonbinding') return 'not-applicable';
    return 'unknown';
}

function enforcementStatus(record, force = normativeForce(record)) {
    if (record.status === 'proposed' || record.status === 'draft') return 'unsignaled';
    if (['expired', 'terminated', 'withdrawn', 'superseded'].includes(record.status)) return 'not-enforceable';
    if (force === 'nonbinding') return 'not-enforceable';
    if (record.status === 'enforcing') return 'enforceable';
    return 'unknown';
}

function obligationType(group) {
    const map = {
        requirement: 'of:Requirement',
        restriction: 'of:Restriction',
        permission: 'of:Permission'
    };
    return map[String(group || '').toLowerCase()] || 'of:Obligation';
}

function firstSection(body, heading) {
    const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = String(body || '').match(new RegExp(`## ${escaped}\\n\\n([\\s\\S]*?)(?=\\n## |$)`));
    return match ? match[1].trim().replace(/\s+/g, ' ') : '';
}

function provisionSummary(provision) {
    const requirements = (provision.requirements || [])
        .map(row => [row.requirement, row.details].filter(Boolean).join(': '))
        .filter(Boolean);
    return requirements.length ? requirements.join(' ') : provision.name || provision.source_heading || provision.id;
}

function everyAiLawAnchors(mapping) {
    if (mapping.id === 'utah-mental-health-chatbot-disclosure-2026q2-first-session') {
        return {
            termAnchors: ['https://everyailaw.com/term/utah-sb149-chatbot-disclosure.json'],
            obligationAnchors: ['https://everyailaw.com/obligation-category/transparency.json']
        };
    }
    return { termAnchors: [], obligationAnchors: [] };
}

function buildLookups(data) {
    const containersById = new Map(data.containers.map(item => [item.id, item]));
    const primariesById = new Map(data.primaries.map(item => [item.id, item]));
    const authoritiesById = new Map(data.authorities.map(item => [item.id, item]));
    const provisionDetails = new Map();
    for (const container of data.containers) {
        for (const provision of container.provisions || []) {
            const mapping = data.mappingIndex.find(item => item.regulation === container.id && item.source_heading === provision.name);
            if (mapping) provisionDetails.set(mapping.id, { container, provision });
        }
    }
    return { containersById, primariesById, authoritiesById, provisionDetails };
}

function typedJurisdiction(ref) {
    return ref ? { '@type': 'of:Jurisdiction', territorial_scope: [ref] } : undefined;
}

function instrumentCitation(container) {
    const cites = container.publication_citations;
    if (!Array.isArray(cites) || cites.length === 0) return undefined;
    const first = cites[0];
    if (first && typeof first === 'object') return first.cite || first.url;
    return typeof first === 'string' ? first : undefined;
}

function provenance(config, source, locator, verified, citation) {
    return compact({
        source,
        source_locator: locator,
        source_citation: citation,
        evidence_type: source ? 'published-source' : 'editorial-record',
        verified,
        asserted_by_adopter: `${siteBase(config)}/`
    });
}

function partyId(container, party, index) {
    return `${container.id}-${slugify(party.name || party.role || `party-${index + 1}`)}`;
}

function partyKind(name) {
    return /\b(office|legislature|division|department|commission|authority|board|llc|llp|inc\.?|corp\.?|company|association|health|oaip|dopl|publedge)\b/i.test(name || '')
        ? 'organization'
        : 'unknown';
}

function buildPartyRecords(config, data) {
    const byId = new Map();
    for (const container of data.containers) {
        for (const [index, party] of (container.parties || []).entries()) {
            const id = partyId(container, party, index);
            const kind = partyKind(party.name);
            byId.set(id, compact({
                '@context': recordContext(config),
                '@type': 'of:Party',
                '@id': partyUri(config, id),
                'pub:id': id,
                name: party.name,
                party_kind: kind,
                entity: kind === 'organization' ? { '@type': 'gist:Organization', name: party.name } : undefined,
                roles: party.role ? [party.role] : undefined,
                ...provenance(config, container.official_url, undefined, container.last_verified, instrumentCitation(container))
            }));
        }
    }
    return [...byId.values()];
}

function containerPartyUris(config, container) {
    return (container.parties || []).map((party, index) => partyUri(config, partyId(container, party, index)));
}

function containerActorRoles(config, container) {
    return (container.parties || [])
        .map((party, index) => party.role ? { party: partyUri(config, partyId(container, party, index)), role: party.role } : undefined)
        .filter(Boolean);
}

function termTypes(container) {
    return ['jia', 'rma'].includes(container?.type)
        ? ['of:Term', 'gist:ContractTerm']
        : 'of:Term';
}

function buildAuthorityRecords(config, data) {
    return data.authorities.map(authority => compact({
        '@context': recordContext(config),
        '@type': 'of:Authority',
        '@id': authorityUri(config, authority.id),
        'pub:id': authority.id,
        organization: {
            '@type': 'gist:GovernmentOrganization',
            name: authority.name || authority.id
        },
        jurisdiction: typedJurisdiction(authority.jurisdiction),
        territorial_scope: authority.jurisdiction ? [authority.jurisdiction] : undefined,
        sameAs: authority.wikidata_qid ? [`https://wikidata.org/wiki/${authority.wikidata_qid}`] : undefined,
        ...provenance(config, authority.website, undefined, authority.last_verified)
    }));
}

function buildInstrumentRecords(config, data, determinations) {
    const termsByInstrument = new Map();
    for (const mapping of data.mappingIndex) {
        if (!termsByInstrument.has(mapping.regulation)) termsByInstrument.set(mapping.regulation, []);
        termsByInstrument.get(mapping.regulation).push(termUri(config, mapping.id));
    }
    const determinationByInstrument = new Map(determinations.map(record => [record.resulting_instrument[0], record['@id']]));
    return data.containers.map(container => {
        const force = normativeForce(container);
        const instrumentId = instrumentUri(config, container.id);
        return compact({
            '@context': recordContext(config),
            '@type': 'of:Instrument',
            '@id': instrumentId,
            'pub:id': container.id,
            title: container.title || container.name || container.id,
            short_title: container.title || container.name || container.id,
            supersedes: container.supersedes ? [].concat(container.supersedes).map(id => instrumentUri(config, id)) : undefined,
            describesSameEntityAs: container.describesSameEntityAs || undefined,
            notes: container.of_notes || undefined,
            issuedBy: container.issued_by ? [authorityUri(config, container.authority)] : undefined,
            parties: containerPartyUris(config, container).length ? containerPartyUris(config, container) : undefined,
            actor_roles: containerActorRoles(config, container).length ? containerActorRoles(config, container) : undefined,
            kind: container.type || 'instrument',
            normative_force: force,
            enacted: container.enacted || undefined,
            effective: container.effective || undefined,
            lifecycle_status: container.lifecycle_status || normalizeStatus(container.status),
            operative_status: container.operative_status || operativeStatus(container.status, force),
            enforcement_status: enforcementStatus(container, force),
            hasTerm: termsByInstrument.get(container.id) || [],
            resulting_instrument: undefined,
            embodies_determination: determinationByInstrument.has(instrumentId) ? [determinationByInstrument.get(instrumentId)] : undefined,
            jurisdiction: typedJurisdiction(container.jurisdiction),
            territorial_scope: container.jurisdiction ? [container.jurisdiction] : undefined,
            citation: instrumentCitation(container),
            ...provenance(config, container.official_url, undefined, container.last_verified, instrumentCitation(container)),
            'pub:status': container.status,
            'pub:editorial_status': container.editorial_status,
            'pub:canonical_url': container._canonicalPath ? `${siteBase(config)}/${container._canonicalPath}` : undefined
        });
    });
}

function buildTermRecords(config, data) {
    const { provisionDetails, containersById } = buildLookups(data);
    return data.mappingIndex.map(mapping => {
        const detail = provisionDetails.get(mapping.id);
        const provision = detail ? detail.provision : mapping;
        const container = containersById.get(mapping.regulation);
        const anchors = everyAiLawAnchors(mapping).termAnchors;
        const exactTerms = container?.terms || [];
        const force = container ? normativeForce(container) : 'unknown';
        const sourceStatus = provision.status || container?.status;
        return compact({
            '@context': recordContext(config),
            '@type': termTypes(container),
            '@id': termUri(config, mapping.id),
            'pub:id': mapping.id,
            text: exactTerms.length === 1 ? exactTerms[0].text : undefined,
            summary: exactTerms.length === 1 ? undefined : provisionSummary({ ...provision, ...mapping }),
            section: provision.sections || mapping.source_heading,
            parent_instrument: instrumentUri(config, mapping.regulation),
            creates: (mapping.obligations || []).map(id => obligationUri(config, concreteObligationId(mapping.id, id))),
            anchors: anchors.length ? anchors : undefined,
            lifecycle_status: normalizeStatus(sourceStatus),
            operative_status: operativeStatus(sourceStatus, force),
            enforcement_status: enforcementStatus({ status: sourceStatus, type: container?.type }, force),
            effective: /^\d{4}-\d{2}-\d{2}$/.test(provision.effective || '') ? provision.effective : undefined,
            jurisdiction: typedJurisdiction(container?.jurisdiction),
            ...provenance(config, container?.official_url, provision.sections || mapping.source_heading, provision.verified || container?.last_verified, instrumentCitation(container || {})),
            'pub:source_heading': mapping.source_heading,
            'pub:source_file': mapping.source_file
        });
    });
}

function buildObligationRecords(config, data) {
    const { primariesById, provisionDetails, containersById } = buildLookups(data);
    const records = [];
    for (const mapping of data.mappingIndex) {
        const container = containersById.get(mapping.regulation);
        const force = container ? normativeForce(container) : 'unknown';
        for (const obligationId of mapping.obligations || []) {
            const primary = primariesById.get(obligationId) || { id: obligationId, name: obligationId };
            const detail = provisionDetails.get(mapping.id);
            const provision = detail ? detail.provision : {};
            const recordId = concreteObligationId(mapping.id, obligationId);
            const lifecycle = primary.lifecycle_status || provision.status || container?.status;
            records.push(compact({
                '@context': recordContext(config),
                '@type': obligationType(primary.group),
                '@id': obligationUri(config, recordId),
                'pub:id': recordId,
                title: primary.name || obligationId,
                content: firstSection(primary._body, 'Summary'),
                created_by: [termUri(config, mapping.id)],
                applicability: provision.scope ? [`scope:${provision.scope}`] : undefined,
                anchors: everyAiLawAnchors(mapping).obligationAnchors.length ? everyAiLawAnchors(mapping).obligationAnchors : undefined,
                lifecycle_status: normalizeStatus(lifecycle),
                operative_status: operativeStatus(lifecycle, force),
                enforcement_status: enforcementStatus({ status: lifecycle, type: container?.type }, force),
                jurisdiction: typedJurisdiction(container?.jurisdiction),
                ...provenance(config, container?.official_url, provision.sections || mapping.source_heading, primary.last_verified || provision.verified || container?.last_verified, instrumentCitation(container || {})),
                'pub:primary_id': obligationId,
                'pub:group': primary.group || undefined,
                'pub:status': primary.status || undefined,
                'pub:lifecycle_status': primary.lifecycle_status || undefined,
                'pub:search_terms': primary.search_terms || []
            }));
        }
    }
    return records;
}

function buildDeterminationRecords(config, data) {
    return data.containers
        .filter(container => container.enacted && container.official_url && container.issuance_event && !['proposed', 'draft'].includes(container.status))
        .map(container => ({
            '@context': recordContext(config),
            '@type': 'of:Determination',
            '@id': determinationUri(config, `${container.id}-issuance`),
            'pub:id': `${container.id}-issuance`,
            issued_date: container.enacted,
            issuedBy: [authorityUri(config, container.authority)],
            jurisdiction: typedJurisdiction(container.jurisdiction),
            decides: [],
            disposition: 'issued',
            resulting_instrument: [instrumentUri(config, container.id)],
            notes: `Issuance record for ${container.title || container.name || container.id}.`,
            ...provenance(config, container.official_url, undefined, container.last_verified, instrumentCitation(container))
        }));
}

function buildObligationFirstRecords(config, data) {
    const determinations = buildDeterminationRecords(config, data);
    return {
        authorities: buildAuthorityRecords(config, data),
        parties: buildPartyRecords(config, data),
        instruments: buildInstrumentRecords(config, data, determinations),
        terms: buildTermRecords(config, data),
        obligations: buildObligationRecords(config, data),
        determinations
    };
}

function writeJson(file, value) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeObligationFirstRecords(config, recordsByKind, docsDir, generated) {
    if (!generated) throw new Error('writeObligationFirstRecords requires a deterministic generated timestamp');
    const apiDir = path.join(docsDir, 'api', 'v1', 'of');
    const recordsDir = path.join(apiDir, 'records');
    fs.rmSync(apiDir, { recursive: true, force: true });
    fs.mkdirSync(recordsDir, { recursive: true });
    const files = {};
    const counts = {};
    for (const [kind, records] of Object.entries(recordsByKind)) {
        files[kind] = `${kind}.json`;
        counts[kind] = records.length;
        writeJson(path.join(apiDir, `${kind}.json`), { '@context': OF_CONTEXT, generated, [kind]: records });
        for (const record of records) writeJson(path.join(recordsDir, `${localId(record)}.json`), record);
    }
    writeJson(path.join(apiDir, 'index.json'), { '@context': OF_CONTEXT, generated, files, counts });

    const companionDirs = {
        authorities: 'authority',
        parties: 'party',
        instruments: 'instrument',
        terms: 'term',
        obligations: 'obligation',
        determinations: 'determination'
    };
    for (const [kind, records] of Object.entries(recordsByKind)) {
        for (const record of records) writeJson(path.join(docsDir, companionDirs[kind], `${localId(record)}.json`), record);
    }
}

module.exports = {
    OF_CONTEXT,
    buildObligationFirstRecords,
    writeObligationFirstRecords,
    authorityUri,
    instrumentUri,
    termUri,
    obligationUri,
    determinationUri,
    partyUri
};
