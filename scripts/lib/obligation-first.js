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

function validEvidenceInput(input) {
    const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
    const kinds = new Set(['authority', 'instrument', 'mapping-entry', 'obligation-definition']);
    const required = ['kind', 'native_path', 'native_file_sha256', 'canonical_unit', 'canonical_sha256', 'admission_status', 'review_packet_sha256', 'retained_primary_sha256', 'unresolved_review_state', 'unresolved'];
    if (!input || required.some(field => !Object.hasOwn(input, field))) return false;
    if (!input || !kinds.has(input.kind) || typeof input.native_path !== 'string' || !input.native_path.trim() || !digest(input.native_file_sha256) || !digest(input.canonical_sha256)) return false;
    if (!(input.canonical_unit === null || (typeof input.canonical_unit === 'string' && input.canonical_unit.length))) return false;
    if (input.admission_status === 'legacy-unreviewed') {
        return input.review_packet_sha256 === null && input.retained_primary_sha256 === null && input.unresolved_review_state === 'unknown' && input.unresolved === null;
    }
    if (input.admission_status !== 'reviewed-changes' || !digest(input.review_packet_sha256)) return false;
    if (!(input.retained_primary_sha256 === null || (Array.isArray(input.retained_primary_sha256) && input.retained_primary_sha256.length && input.retained_primary_sha256.every(digest)))) return false;
    if (!Array.isArray(input.unresolved) || input.unresolved.some(item => typeof item !== 'string' || !item.trim())) return false;
    return input.unresolved.length ? input.unresolved_review_state === 'declared' : input.unresolved_review_state === 'none-declared';
}

function withEvidenceBoundary(record, inputs) {
    if (!Array.isArray(inputs) || !inputs.length || inputs.some(input => !validEvidenceInput(input))) {
        throw new Error(`Missing exact native evidence input for ${record['@id'] || record['pub:id'] || 'record'}`);
    }
    const hasLegacy = inputs.some(input => input.admission_status === 'legacy-unreviewed');
    const unresolved = [...new Set(inputs.flatMap(input => input.unresolved || []))];
    const hasDeclaredUnresolved = inputs.some(input => input.unresolved_review_state === 'declared');
    const hasUnknown = inputs.some(input => input.unresolved_review_state === 'unknown');
    return {
        ...record,
        evidence_type: hasLegacy ? 'legacy-unreviewed-source-reference' : 'reviewed-source-reference',
        projection_basis: 'native-record-projection',
        admission_status: hasLegacy ? 'legacy-unreviewed' : 'source-consistency-reviewed-changes',
        source_review_conflicts: null,
        'pub:source_review_unresolved': unresolved.length ? unresolved : null,
        'pub:source_review_state': hasUnknown && hasDeclaredUnresolved ? 'known-and-unknown' : hasDeclaredUnresolved ? 'declared' : hasUnknown ? 'unknown' : 'none-declared',
        'pub:evidence_inputs': inputs
    };
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

function sourceOwnedAnchors(mapping) {
    const hasTermAnchors = Object.hasOwn(mapping, 'term_anchors');
    const hasObligationAnchors = Object.hasOwn(mapping, 'obligation_anchors');
    if ((hasTermAnchors && !Array.isArray(mapping.term_anchors)) || (hasObligationAnchors && !Array.isArray(mapping.obligation_anchors))) {
        throw new Error(`Mapping ${mapping.id} anchors must be lists`);
    }
    const termAnchors = hasTermAnchors ? mapping.term_anchors : [];
    const obligationAnchors = hasObligationAnchors ? mapping.obligation_anchors : [];
    const all = [...termAnchors, ...obligationAnchors];
    if (!all.length) return { termAnchors: [], obligationAnchors: [] };
    if (mapping.anchor_relation !== 'related-not-equivalent') throw new Error(`Mapping ${mapping.id} anchor relation must preserve relatedness without equivalence`);
    let sourceUrl;
    try { sourceUrl = new URL(mapping.anchor_source_url); } catch { throw new Error(`Mapping ${mapping.id} anchor source must be an absolute URL`); }
    if (sourceUrl.protocol !== 'https:' || sourceUrl.username || sourceUrl.password || sourceUrl.hostname.startsWith('www.') || !String(mapping.anchor_source_locator || '').trim() || !String(mapping.anchor_qualification || '').trim()) {
        throw new Error(`Mapping ${mapping.id} anchors require a qualified source URL, locator, and qualification; source admission owns primary-source eligibility`);
    }
    for (const [kind, targets] of [['term', termAnchors], ['obligation', obligationAnchors]]) for (const target of targets) {
        let url;
        try { url = new URL(target); } catch { throw new Error(`Mapping ${mapping.id} anchor is not an absolute URL`); }
        const typedPath = kind === 'term' ? /^\/term\/[a-z0-9-]+\.json$/ : /^\/(?:obligation|obligation-category)\/[a-z0-9-]+\.json$/;
        if (url.origin !== 'https://everyailaw.com' || url.username || url.password || url.search || url.hash || !typedPath.test(url.pathname)) {
            throw new Error(`Mapping ${mapping.id} ${kind} anchor target is not an exact typed EveryAILaw JSON record`);
        }
    }
    return { termAnchors: [...new Set(termAnchors)], obligationAnchors: [...new Set(obligationAnchors)] };
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
            byId.set(id, withEvidenceBoundary(compact({
                '@context': recordContext(config),
                '@type': 'of:Party',
                '@id': partyUri(config, id),
                'pub:id': id,
                name: party.name,
                party_kind: kind,
                entity: kind === 'organization' ? { '@type': 'gist:Organization', name: party.name } : undefined,
                roles: party.role ? [party.role] : undefined,
                ...provenance(config, container.official_url, undefined, container.last_verified, instrumentCitation(container))
            }), [container._evidence_input]));
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
    return data.authorities.map(authority => withEvidenceBoundary(compact({
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
    }), [authority._evidence_input]));
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
        return withEvidenceBoundary(compact({
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
            enforcement_status: container.enforcement_status || enforcementStatus(container, force),
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
        }), [container._evidence_input]);
    });
}

function buildTermRecords(config, data) {
    const { provisionDetails, containersById } = buildLookups(data);
    return data.mappingIndex.map(mapping => {
        const detail = provisionDetails.get(mapping.id);
        const provision = detail ? detail.provision : mapping;
        const container = containersById.get(mapping.regulation);
        const anchors = sourceOwnedAnchors(mapping).termAnchors;
        const exactTerms = container?.terms || [];
        const force = container ? normativeForce(container) : 'unknown';
        const sourceStatus = provision.status || container?.status;
        return withEvidenceBoundary(compact({
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
            operative_status: container?.operative_status || operativeStatus(sourceStatus, force),
            enforcement_status: container?.enforcement_status || enforcementStatus({ status: sourceStatus, type: container?.type }, force),
            effective: /^\d{4}-\d{2}-\d{2}$/.test(provision.effective || '') ? provision.effective : undefined,
            jurisdiction: typedJurisdiction(container?.jurisdiction),
            ...provenance(config, container?.official_url, provision.sections || mapping.source_heading, provision.verified || container?.last_verified, instrumentCitation(container || {})),
            'pub:source_heading': mapping.source_heading,
            'pub:source_file': mapping.source_file
        }), [container._evidence_input, mapping._evidence_input]);
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
            // A concrete obligation created only by a draft or proposed term is
            // itself unissued: the term's state overrides the definition's
            // generic lifecycle so a draft-derived duty never reads as operative.
            const termStatus = provision.status || container?.status;
            const draftCreated = ['draft', 'proposed'].includes(normalizeStatus(termStatus));
            const lifecycle = draftCreated ? termStatus : primary.lifecycle_status || termStatus;
            records.push(withEvidenceBoundary(compact({
                '@context': recordContext(config),
                '@type': obligationType(primary.group),
                '@id': obligationUri(config, recordId),
                'pub:id': recordId,
                title: primary.name || obligationId,
                content: firstSection(primary._body, 'Summary'),
                created_by: [termUri(config, mapping.id)],
                applicability: provision.scope ? [`scope:${provision.scope}`] : undefined,
                anchors: sourceOwnedAnchors(mapping).obligationAnchors.length ? sourceOwnedAnchors(mapping).obligationAnchors : undefined,
                lifecycle_status: normalizeStatus(lifecycle),
                operative_status: (draftCreated ? undefined : primary.operative_status) || container?.operative_status || operativeStatus(lifecycle, force),
                enforcement_status: (draftCreated ? undefined : primary.enforcement_status) || container?.enforcement_status || enforcementStatus({ status: lifecycle, type: container?.type }, force),
                jurisdiction: typedJurisdiction(container?.jurisdiction),
                ...provenance(config, container?.official_url, provision.sections || mapping.source_heading, primary.last_verified || provision.verified || container?.last_verified, instrumentCitation(container || {})),
                'pub:primary_id': obligationId,
                'pub:group': primary.group || undefined,
                'pub:status': primary.status || undefined,
                'pub:lifecycle_status': primary.lifecycle_status || undefined,
                'pub:search_terms': primary.search_terms || []
            }), [container._evidence_input, mapping._evidence_input, primary._evidence_input]));
        }
    }
    return records;
}

function buildDeterminationRecords(config, data) {
    return data.containers
        .filter(container => container.source !== 'publedge-original-draft' && container.enacted && container.official_url && container.issuance_event && !['proposed', 'draft'].includes(container.status))
        .map(container => withEvidenceBoundary({
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
        }, [container._evidence_input]));
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
    partyUri,
    sourceOwnedAnchors,
    withEvidenceBoundary
};
