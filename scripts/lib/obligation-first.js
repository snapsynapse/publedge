'use strict';

const fs = require('fs');
const path = require('path');

const OF_CONTEXT = 'https://obligationfirst.org/v1/';

function siteBase(config) {
    return String(config.url || 'https://publedge.org/').replace(/\/$/, '');
}

function ofUri(config, kind, id) {
    return `${siteBase(config)}/${kind}/${id}.json`;
}

function authorityUri(config, id) { return ofUri(config, 'authority', id); }
function instrumentUri(config, id) { return ofUri(config, 'instrument', id); }
function termUri(config, id) { return ofUri(config, 'term', id); }
function obligationUri(config, id) { return ofUri(config, 'obligation', id); }
function determinationUri(config, id) { return ofUri(config, 'determination', id); }

function concreteObligationId(termId, obligationId) {
    return `${termId}-${obligationId}`;
}

function normalizeStatus(status) {
    const map = {
        proposed: 'proposed',
        draft: 'proposed',
        enacted: 'enacted',
        published: 'enacted',
        enforcing: 'in-force',
        'phased-enforcement': 'in-force',
        expired: 'sunset',
        terminated: 'sunset',
        superseded: 'superseded',
        withdrawn: 'withdrawn'
    };
    return map[status] || 'enacted';
}

function enforcementStatus(record) {
    // OF semantics: enforcement_status is orthogonal to lifecycle status.
    // `constrained` specifically means a live instrument whose enforcement
    // is limited by an external Determination (court order, agency
    // forbearance). An instrument that ended on its own terms (expired,
    // terminated, withdrawn) is captured by `status: sunset` and was
    // routinely enforceable during its active life — not constrained.
    if (record.status === 'proposed' || record.status === 'draft') return 'unsignaled';
    return 'routine';
}

function obligationType(group) {
    const normalized = String(group || '').toLowerCase();
    if (normalized === 'restriction') return 'of:Restriction';
    if (normalized === 'permission') return 'of:Permission';
    return 'of:Requirement';
}

function firstSection(body, heading) {
    const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = String(body || '').match(new RegExp(`## ${escaped}\\n\\n([\\s\\S]*?)(?=\\n## |$)`));
    return match ? match[1].trim().replace(/\s+/g, ' ') : '';
}

function provisionText(provision) {
    const requirements = (provision.requirements || [])
        .map(row => [row.requirement, row.details].filter(Boolean).join(': '))
        .filter(Boolean);
    if (requirements.length) return requirements.join(' ');
    return provision.name || provision.source_heading || provision.id;
}

function everyAiLawAnchors(mapping) {
    if (mapping.id === 'utah-mental-health-chatbot-disclosure-2026q2-first-session') {
        return {
            termAnchors: ['https://everyailaw.com/term/utah-sb149-chatbot-disclosure.json'],
            obligationAnchors: ['https://everyailaw.com/obligation/transparency.json']
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
            const mapping = data.mappingIndex.find(item =>
                item.regulation === container.id && item.source_heading === provision.name
            );
            if (mapping) provisionDetails.set(mapping.id, { container, provision });
        }
    }

    return { containersById, primariesById, authoritiesById, provisionDetails };
}

function typedJurisdiction(ref) {
    if (!ref) return undefined;
    return { '@type': 'gist:Jurisdiction', ref };
}

function instrumentCitation(container) {
    const cites = container.publication_citations;
    if (!Array.isArray(cites) || cites.length === 0) return undefined;
    const first = cites[0];
    return (first && typeof first === 'object' && first.cite) ? first.cite : undefined;
}

function buildAuthorityRecords(config, data) {
    return data.authorities.map(authority => {
        const firstInstrument = data.containers.find(container => container.authority === authority.id);
        const sameAs = authority.wikidata_qid
            ? [`https://www.wikidata.org/wiki/${authority.wikidata_qid}`]
            : undefined;
        const record = {
            '@context': OF_CONTEXT,
            '@type': 'of:Authority',
            '@id': authorityUri(config, authority.id),
            id: authority.id,
            organization: {
                '@type': 'gist:GovernmentOrganization',
                name: authority.name || authority.id
            },
            authority_basis: {
                kind: 'statutory',
                instrument_ref: firstInstrument ? instrumentUri(config, firstInstrument.id) : `${authorityUri(config, authority.id)}#authority-basis`
            },
            jurisdiction: typedJurisdiction(authority.jurisdiction),
            website: authority.website || null,
            url_segment: authority.url_segment || null
        };
        if (sameAs) record.sameAs = sameAs;
        return record;
    });
}

function buildInstrumentRecords(config, data) {
    const termsByInstrument = new Map();
    for (const mapping of data.mappingIndex) {
        if (!termsByInstrument.has(mapping.regulation)) termsByInstrument.set(mapping.regulation, []);
        termsByInstrument.get(mapping.regulation).push(termUri(config, mapping.id));
    }

    return data.containers.map(container => ({
        '@context': OF_CONTEXT,
        '@type': 'of:Instrument',
        '@id': instrumentUri(config, container.id),
        id: container.id,
        title: container.title || container.name || container.id,
        short_title: container.title || container.name || container.id,
        issuedBy: authorityUri(config, container.authority),
        kind: container.type || 'instrument',
        enacted: container.enacted || undefined,
        effective: container.effective || undefined,
        status: normalizeStatus(container.status),
        enforcement_status: enforcementStatus(container),
        hasTerm: termsByInstrument.get(container.id) || [],
        source: container.official_url || undefined,
        jurisdiction: typedJurisdiction(container.jurisdiction),
        citation: instrumentCitation(container),
        publedge_status: container.status,
        canonical_url: container._canonicalPath ? `${siteBase(config)}/${container._canonicalPath}` : undefined
    }));
}

function buildTermRecords(config, data) {
    const { provisionDetails } = buildLookups(data);
    const jurByInstrument = new Map(data.containers.map(c => [c.id, c.jurisdiction]));
    return data.mappingIndex.map(mapping => {
        const detail = provisionDetails.get(mapping.id);
        const provision = detail ? detail.provision : mapping;
        const anchors = everyAiLawAnchors(mapping).termAnchors;
        const jur = jurByInstrument.get(mapping.regulation);
        const record = {
            '@context': OF_CONTEXT,
            '@type': 'of:Term',
            '@id': termUri(config, mapping.id),
            id: mapping.id,
            text: provisionText({ ...provision, ...mapping }),
            section: provision.sections || '',
            parent_instrument: instrumentUri(config, mapping.regulation),
            creates: (mapping.obligations || []).map(id => obligationUri(config, concreteObligationId(mapping.id, id))),
            anchors,
            source_heading: mapping.source_heading,
            source_file: mapping.source_file
        };
        if (jur) record.jurisdiction = typedJurisdiction(jur);
        return record;
    });
}

function buildObligationRecords(config, data) {
    const { primariesById, provisionDetails } = buildLookups(data);
    const jurByInstrument = new Map(data.containers.map(c => [c.id, c.jurisdiction]));
    const records = [];

    for (const mapping of data.mappingIndex) {
        const jur = jurByInstrument.get(mapping.regulation);
        for (const obligationId of mapping.obligations || []) {
            const primary = primariesById.get(obligationId) || { id: obligationId, name: obligationId };
            const detail = provisionDetails.get(mapping.id);
            const provision = detail ? detail.provision : {};
            const recordId = concreteObligationId(mapping.id, obligationId);
            const record = {
                '@context': OF_CONTEXT,
                '@type': obligationType(primary.group),
                '@id': obligationUri(config, recordId),
                id: recordId,
                title: primary.name || obligationId,
                content: firstSection(primary._body, 'Summary'),
                created_by: termUri(config, mapping.id),
                duty_holder_type: provision.scope || undefined,
                anchors: everyAiLawAnchors(mapping).obligationAnchors,
                publedge_primary_id: obligationId,
                publedge_group: primary.group || undefined,
                publedge_status: primary.status || undefined,
                search_terms: primary.search_terms || []
            };
            if (jur) record.jurisdiction = typedJurisdiction(jur);
            records.push(record);
        }
    }

    return records;
}

function buildDeterminationRecords(config, data) {
    return data.containers.map(container => ({
        '@context': OF_CONTEXT,
        '@type': 'of:Determination',
        '@id': determinationUri(config, `${container.id}-issuance`),
        id: `${container.id}-issuance`,
        issued_date: container.enacted || container.effective || undefined,
        issuedBy: authorityUri(config, container.authority),
        decides: [],
        disposition: 'issued',
        target_instrument: instrumentUri(config, container.id),
        notes: `Issuance record for ${container.title || container.name || container.id}.`,
        source: container.official_url || undefined
    }));
}

function buildObligationFirstRecords(config, data) {
    return {
        authorities: buildAuthorityRecords(config, data),
        instruments: buildInstrumentRecords(config, data),
        terms: buildTermRecords(config, data),
        obligations: buildObligationRecords(config, data),
        determinations: buildDeterminationRecords(config, data)
    };
}

function writeJson(file, value) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeObligationFirstRecords(config, recordsByKind, docsDir) {
    const generated = new Date().toISOString();
    const apiDir = path.join(docsDir, 'api', 'v1', 'of');
    const recordsDir = path.join(apiDir, 'records');
    fs.rmSync(apiDir, { recursive: true, force: true });
    fs.mkdirSync(apiDir, { recursive: true });
    fs.mkdirSync(recordsDir, { recursive: true });

    const files = {};
    const counts = {};
    for (const [kind, records] of Object.entries(recordsByKind)) {
        files[kind] = `${kind}.json`;
        counts[kind] = records.length;
        writeJson(path.join(apiDir, `${kind}.json`), {
            '@context': OF_CONTEXT,
            generated,
            [kind]: records
        });
        for (const record of records) {
            writeJson(path.join(recordsDir, `${record.id}.json`), record);
        }
    }

    writeJson(path.join(apiDir, 'index.json'), {
        '@context': OF_CONTEXT,
        generated,
        files,
        counts
    });

    const companionDirs = {
        authorities: 'authority',
        instruments: 'instrument',
        terms: 'term',
        obligations: 'obligation',
        determinations: 'determination'
    };

    for (const [kind, records] of Object.entries(recordsByKind)) {
        for (const record of records) {
            writeJson(path.join(docsDir, companionDirs[kind], `${record.id}.json`), record);
        }
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
    determinationUri
};
