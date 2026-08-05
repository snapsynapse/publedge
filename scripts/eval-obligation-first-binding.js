#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { DOCS_DIR, loadProjectData, readJson, reportFailures } = require('./lib/eval-kit');

const failures = [];
const apiDir = path.join(DOCS_DIR, 'api', 'v1', 'of');
const recordsDir = path.join(apiDir, 'records');
const companionDirs = {
    authorities: 'authority',
    parties: 'party',
    instruments: 'instrument',
    terms: 'term',
    obligations: 'obligation',
    determinations: 'determination'
};

function localId(record) {
    return record && record['pub:id'];
}

function requireJson(file, label) {
    if (!fs.existsSync(file)) {
        failures.push(`missing ${label}: ${path.relative(DOCS_DIR, file)}`);
        return null;
    }
    return readJson(file);
}

function stableJson(value) {
    return JSON.stringify(value, null, 2);
}

const index = requireJson(path.join(apiDir, 'index.json'), 'Obligation-First index');
const recordsById = new Map();
const expectedFlatFiles = new Set();
const recordsByKind = {};

if (index) {
    for (const [kind, fileName] of Object.entries(index.files || {})) {
        const aggregate = requireJson(path.join(apiDir, fileName), `${kind} aggregate`);
        const records = aggregate ? aggregate[kind] || [] : [];
        recordsByKind[kind] = records;
        if (index.counts?.[kind] !== records.length) {
            failures.push(`${kind} count is ${index.counts?.[kind]}, expected ${records.length}`);
        }

        for (const record of records) {
            if (!localId(record)) {
                failures.push(`${kind} aggregate record missing local id for ${record['@id'] || '(missing @id)'}`);
                continue;
            }
            if (recordsById.has(record['@id'])) {
                failures.push(`duplicate @id in aggregate records: ${record['@id']}`);
            }
            recordsById.set(record['@id'], record);
            expectedFlatFiles.add(`${localId(record)}.json`);

            const flatFile = path.join(recordsDir, `${localId(record)}.json`);
            const flatRecord = requireJson(flatFile, `flat record for ${localId(record)}`);
            if (flatRecord && stableJson(flatRecord) !== stableJson(record)) {
                failures.push(`flat record differs from aggregate record: ${path.relative(DOCS_DIR, flatFile)}`);
            }

            const companionDir = companionDirs[kind];
            if (companionDir) {
                const companionFile = path.join(DOCS_DIR, companionDir, `${localId(record)}.json`);
                const companionRecord = requireJson(companionFile, `companion record for ${localId(record)}`);
                if (companionRecord && stableJson(companionRecord) !== stableJson(record)) {
                    failures.push(`companion record differs from aggregate record: ${path.relative(DOCS_DIR, companionFile)}`);
                }
            }
        }
    }
}

if (fs.existsSync(recordsDir)) {
    for (const fileName of fs.readdirSync(recordsDir).filter(name => name.endsWith('.json'))) {
        if (!expectedFlatFiles.has(fileName)) {
            failures.push(`stale or unindexed flat record: ${path.relative(DOCS_DIR, path.join(recordsDir, fileName))}`);
        }
    }
}

for (const term of recordsByKind.terms || []) {
    for (const obligationId of term.creates || []) {
        const obligation = recordsById.get(obligationId);
        if (!obligation) {
            failures.push(`${localId(term)} creates missing obligation ${obligationId}`);
            continue;
        }
        if (!(obligation.created_by || []).includes(term['@id'])) {
            failures.push(`${localId(term)} creates ${localId(obligation)}, but created_by does not point back`);
        }
        if (!obligation['pub:primary_id']) {
            failures.push(`${localId(obligation)} missing pub:primary_id`);
        }
        if (!localId(obligation).startsWith(`${localId(term)}-`)) {
            failures.push(`${localId(obligation)} is not concrete to creating term ${localId(term)}`);
        }
    }
}

for (const obligation of recordsByKind.obligations || []) {
    if (!obligation['pub:lifecycle_status']) {
        failures.push(`${localId(obligation)} missing pub:lifecycle_status`);
    }
}

for (const instrument of recordsByKind.instruments || []) {
    if (!instrument['pub:editorial_status']) {
        failures.push(`${localId(instrument)} missing pub:editorial_status`);
    }
}

const neverOperative = (recordsByKind.obligations || []).filter(
    obligation => obligation['pub:lifecycle_status'] === 'never-operative'
);
if (neverOperative.length !== 3) {
    failures.push(`expected 3 never-operative concrete obligations, found ${neverOperative.length}`);
}

const jiaTerm = recordsById.get('https://publedge.org/term/utah-mental-health-chatbot-disclosure-2026q2-first-session.json');
if (!jiaTerm) {
    failures.push('missing Utah mental-health chatbot JIA term');
} else if (!jiaTerm.anchors?.includes('https://everyailaw.com/term/utah-sb149-chatbot-disclosure.json')) {
    failures.push('Utah mental-health chatbot JIA term missing EveryAILaw term anchor');
} else if (!Array.isArray(jiaTerm['@type']) || !jiaTerm['@type'].includes('of:Term') || !jiaTerm['@type'].includes('gist:ContractTerm')) {
    failures.push('Utah mental-health chatbot JIA term must assert both of:Term and gist:ContractTerm');
}

for (const term of recordsByKind.terms || []) {
    const parent = recordsById.get(term.parent_instrument);
    const types = Array.isArray(term['@type']) ? term['@type'] : [term['@type']];
    if (['jia', 'rma'].includes(parent?.kind) && !types.includes('gist:ContractTerm')) {
        failures.push(`${localId(term)} is contractual but lacks gist:ContractTerm`);
    }
    if (!['jia', 'rma'].includes(parent?.kind) && types.includes('gist:ContractTerm')) {
        failures.push(`${localId(term)} is not contractual but asserts gist:ContractTerm`);
    }
}

const jiaObligation = recordsById.get('https://publedge.org/obligation/utah-mental-health-chatbot-disclosure-2026q2-first-session-disclose-genai-on-first-session.json');
if (!jiaObligation) {
    failures.push('missing Utah mental-health chatbot concrete disclosure obligation');
} else if (!jiaObligation.anchors?.includes('https://everyailaw.com/obligation-category/transparency.json')) {
    failures.push('Utah mental-health chatbot disclosure obligation missing EveryAILaw transparency category anchor');
}

const { containers } = loadProjectData();
const issuanceContainers = containers.filter(container =>
    container.enacted &&
    container.official_url &&
    container.issuance_event &&
    !['proposed', 'draft'].includes(container.status)
);
const expectedDeterminationIds = new Set(
    issuanceContainers.map(container => `https://publedge.org/determination/${container.id}-issuance.json`)
);

if ((recordsByKind.determinations || []).length !== issuanceContainers.length) {
    failures.push(`expected ${issuanceContainers.length} evidenced issuance determinations, found ${(recordsByKind.determinations || []).length}`);
}

for (const container of issuanceContainers) {
    const determinationId = `https://publedge.org/determination/${container.id}-issuance.json`;
    const instrumentId = `https://publedge.org/instrument/${container.id}.json`;
    const determination = recordsById.get(determinationId);
    const instrument = recordsById.get(instrumentId);
    if (!determination) {
        failures.push(`missing evidenced issuance determination for ${container.id}`);
        continue;
    }
    if (determination.disposition !== 'issued') {
        failures.push(`${localId(determination)} disposition must be issued`);
    }
    if ((determination.decides || []).length !== 0) {
        failures.push(`${localId(determination)} administrative issuance must not decide allegations`);
    }
    if (!determination.resulting_instrument?.includes(instrumentId)) {
        failures.push(`${localId(determination)} resulting_instrument does not identify ${container.id}`);
    }
    if (determination.issued_date !== container.enacted) {
        failures.push(`${localId(determination)} issued_date does not match enacted evidence`);
    }
    if (determination.source !== container.official_url) {
        failures.push(`${localId(determination)} source does not match official issuance evidence`);
    }
    if (!instrument || stableJson(determination.jurisdiction) !== stableJson(instrument.jurisdiction)) {
        failures.push(`${localId(determination)} jurisdiction does not match its resulting instrument`);
    }
}

for (const determination of recordsByKind.determinations || []) {
    if (!expectedDeterminationIds.has(determination['@id'])) {
        failures.push(`${localId(determination)} has no evidenced, non-draft issuance source`);
    }
}

const proposedJiaDetermination = recordsById.get('https://publedge.org/determination/us-ut-oaip-jia-2026-001-issuance.json');
if (proposedJiaDetermination) {
    failures.push('proposed Utah mental-health chatbot JIA must not publish an issuance determination');
}

reportFailures('eval-obligation-first-binding', failures);
