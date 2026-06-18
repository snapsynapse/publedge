#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { ROOT, readJson, reportFailures } = require('./lib/eval-kit');

const failures = [];
const schema = readJson(path.join(ROOT, 'schema', 'instrument.schema.json'));
const responseSchema = schema.properties?.authority_response;
const positionEnum = responseSchema?.items?.properties?.position?.enum || [];
const expectedPositions = [
    'concurs',
    'disputes',
    'clarifies',
    'declines-to-comment',
    'superseded-by-official'
];

if (!responseSchema) failures.push('instrument schema missing authority_response');
if (responseSchema && !responseSchema.type?.includes?.('array')) failures.push('authority_response must allow array type');
for (const value of expectedPositions) {
    if (!positionEnum.includes(value)) failures.push(`authority_response position enum missing ${value}`);
}
if (!responseSchema?.items?.anyOf?.some(branch => branch.required?.includes('statement'))) {
    failures.push('authority_response schema must accept statement');
}
if (!responseSchema?.items?.anyOf?.some(branch => branch.required?.includes('source'))) {
    failures.push('authority_response schema must accept source');
}

const fixtureSource = path.join(ROOT, 'data', 'examples', 'instruments', 'us-ut-oaip-jia-2026-001.md');
const fixtureTemp = path.join(ROOT, 'data', 'examples', 'instruments', 'tmp-invalid-authority-response.md');

try {
    const original = fs.readFileSync(fixtureSource, 'utf-8');
    const mutated = original.replace(
        /^status: .+$/m,
        `status: draft
authority_response:
  - from: utah-oaip
    date: 2026-05-18
    position: maybe`
    );
    fs.writeFileSync(fixtureTemp, mutated);
    const res = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'validate.js')], {
        cwd: ROOT,
        encoding: 'utf-8'
    });
    if (res.status === 0) {
        failures.push('validate.js accepted invalid authority_response fixture');
    }
    const combined = `${res.stdout || ''}\n${res.stderr || ''}`;
    if (!combined.includes('unknown position "maybe"')) {
        failures.push('validate.js did not report invalid authority_response position');
    }
    if (!combined.includes('requires statement or source')) {
        failures.push('validate.js did not report missing authority_response statement/source');
    }
} finally {
    if (fs.existsSync(fixtureTemp)) fs.unlinkSync(fixtureTemp);
}

reportFailures('eval-authority-response', failures);
