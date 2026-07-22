#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
    DOCS_DIR,
    collectAllFiles,
    normalizeGeneratedContent,
    withTempBuild,
    reportFailures
} = require('./lib/eval-kit');

const failures = [];
const preserved = new Set(['CNAME', '.nojekyll']);
const textExtensions = new Set(['.css', '.html', '.ics', '.js', '.json', '.jsonld', '.md', '.txt', '.ttl', '.xml', '.yaml', '.yml']);

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
        let same;
        if (textExtensions.has(path.extname(file))) {
            const expectedText = normalizeGeneratedContent(file, fs.readFileSync(expectedPath, 'utf-8'));
            const actualText = normalizeGeneratedContent(file, fs.readFileSync(actualPath, 'utf-8'));
            same = expectedText === actualText;
        } else {
            same = fs.readFileSync(expectedPath).equals(fs.readFileSync(actualPath));
        }
        if (!same) failures.push(`docs/ differs from a clean build: ${file}`);
    }
});

reportFailures('eval-generated-tree-parity', failures);
