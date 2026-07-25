#!/usr/bin/env node
'use strict';

const { loadProjectData, reportFailures } = require('./lib/eval-kit');
const { classifyUnmappedContainers, getAllowedUnmappedInstrumentIds } = require('./lib/verify-policy');

const failures = [];
const project = loadProjectData();
// Relationship-only records: superseded before taking effect, amendment-only,
// or sunset-date-only. Operative statutes carry obligation mappings instead and
// must not be listed here — SB 26-189 was removed when its ADMT obligations landed.
const expectedAllowed = [
    'us-co-legislature-statute-2024-sb24-205',
    'us-co-legislature-statute-2025-sb25b-004',
    'us-ut-legislature-statute-2025-sb332'
];
const expectedNotAllowed = ['us-co-legislature-statute-2026-sb26-189'];

const allowedIds = getAllowedUnmappedInstrumentIds(project.config);
for (const id of expectedAllowed) {
    if (!allowedIds.has(id)) failures.push(`verification allowlist missing ${id}`);
}
for (const id of expectedNotAllowed) {
    if (allowedIds.has(id)) failures.push(`operative instrument must not be allowlisted as unmapped: ${id}`);
}

const classified = classifyUnmappedContainers(project.containers, project.mappings, allowedIds);
const allowedActual = new Set(classified.allowed.map(c => c.id));
for (const id of expectedAllowed) {
    if (!allowedActual.has(id)) failures.push(`expected ${id} to be classified as allowed unmapped`);
}
if (classified.errors.length > 0) {
    failures.push(`unexpected unmapped errors: ${classified.errors.map(c => c.id).join(', ')}`);
}

const fixtureContainers = [
    { id: 'mapped-record' },
    { id: 'allowed-relationship-only-record' },
    { id: 'unlisted-unmapped-record' }
];
const fixtureMappings = [{ id: 'mapped-record-obligations', regulation: 'mapped-record', obligations: ['known-obligation'] }];
const fixtureAllowed = new Set(['allowed-relationship-only-record']);
const fixture = classifyUnmappedContainers(fixtureContainers, fixtureMappings, fixtureAllowed);
if (fixture.allowed.map(c => c.id).join(',') !== 'allowed-relationship-only-record') {
    failures.push('fixture allowed unmapped classification failed');
}
if (fixture.errors.map(c => c.id).join(',') !== 'unlisted-unmapped-record') {
    failures.push('fixture unlisted unmapped classification did not fail as expected');
}

reportFailures('eval-verification-allowlist', failures);
