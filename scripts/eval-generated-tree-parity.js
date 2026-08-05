#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
    DOCS_DIR,
    collectAllFiles,
    withTempBuild,
    reportFailures
} = require('./lib/eval-kit');

const failures = [];
const preserved = new Set(['CNAME', '.nojekyll']);

withTempBuild(expectedDir => {
    const expected = new Set(collectAllFiles(expectedDir).filter(file => !preserved.has(file)));
    const actual = new Set(collectAllFiles(DOCS_DIR).filter(file => !preserved.has(file)));

    for (const file of expected) {
        if (!actual.has(file)) failures.push(`docs/ is missing generated file: ${file}`);
    }
    for (const file of actual) {
        if (!expected.has(file)) failures.push(`docs/ contains stale or unmanaged file: ${file}`);
    }
    for (const file of expected) {
        if (!actual.has(file)) continue;
        const expectedPath = path.join(expectedDir, file);
        const actualPath = path.join(DOCS_DIR, file);
        const same = fs.readFileSync(expectedPath).equals(fs.readFileSync(actualPath));
        if (!same) failures.push(`docs/ differs from a clean build: ${file}`);
    }
});

reportFailures('eval-generated-tree-parity', failures);
