#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { DOCS_DIR, readJson, reportFailures } = require('./lib/eval-kit');

const failures = [];
const apiDir = path.join(DOCS_DIR, 'api', 'v1', 'of');
const recordsDir = path.join(apiDir, 'records');
const companionDirs = {
    authorities: 'authority',
    instruments: 'instrument',
    terms: 'term',
    obligations: 'obligation',
    determinations: 'determination'
};

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
            if (!record.id) {
                failures.push(`${kind} aggregate record missing local id for ${record['@id'] || '(missing @id)'}`);
                continue;
            }
            if (recordsById.has(record['@id'])) {
                failures.push(`duplicate @id in aggregate records: ${record['@id']}`);
            }
            recordsById.set(record['@id'], record);
            expectedFlatFiles.add(`${record.id}.json`);

            const flatFile = path.join(recordsDir, `${record.id}.json`);
            const flatRecord = requireJson(flatFile, `flat record for ${record.id}`);
            if (flatRecord && stableJson(flatRecord) !== stableJson(record)) {
                failures.push(`flat record differs from aggregate record: ${path.relative(DOCS_DIR, flatFile)}`);
            }

            const companionDir = companionDirs[kind];
            if (companionDir) {
                const companionFile = path.join(DOCS_DIR, companionDir, `${record.id}.json`);
                const companionRecord = requireJson(companionFile, `companion record for ${record.id}`);
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
            failures.push(`${term.id} creates missing obligation ${obligationId}`);
            continue;
        }
        if (obligation.created_by !== term['@id']) {
            failures.push(`${term.id} creates ${obligation.id}, but created_by does not point back`);
        }
        if (!obligation.publedge_primary_id) {
            failures.push(`${obligation.id} missing publedge_primary_id`);
        }
        if (!obligation.id.startsWith(`${term.id}-`)) {
            failures.push(`${obligation.id} is not concrete to creating term ${term.id}`);
        }
    }
}

const jiaTerm = recordsById.get('https://publedge.org/term/utah-mental-health-chatbot-disclosure-2026q2-first-session.json');
if (!jiaTerm) {
    failures.push('missing Utah mental-health chatbot JIA term');
} else if (!jiaTerm.anchors?.includes('https://everyailaw.com/term/utah-sb149-chatbot-disclosure.json')) {
    failures.push('Utah mental-health chatbot JIA term missing EveryAILaw term anchor');
}

const jiaObligation = recordsById.get('https://publedge.org/obligation/utah-mental-health-chatbot-disclosure-2026q2-first-session-disclose-genai-on-first-session.json');
if (!jiaObligation) {
    failures.push('missing Utah mental-health chatbot concrete disclosure obligation');
} else if (!jiaObligation.anchors?.includes('https://everyailaw.com/obligation/transparency.json')) {
    failures.push('Utah mental-health chatbot disclosure obligation missing EveryAILaw transparency anchor');
}

reportFailures('eval-obligation-first-binding', failures);
