#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
    collectAllFiles,
    normalizeGeneratedContent,
    withTempBuild,
    reportFailures
} = require('./lib/eval-kit');

const failures = [];

withTempBuild(firstDir => {
    const firstFiles = collectAllFiles(firstDir);
    withTempBuild(secondDir => {
        const secondFiles = collectAllFiles(secondDir);
        const firstSet = new Set(firstFiles);
        const secondSet = new Set(secondFiles);
        for (const relPath of firstSet) {
            if (!secondSet.has(relPath)) failures.push(`second build missing ${relPath}`);
        }
        for (const relPath of secondSet) {
            if (!firstSet.has(relPath)) failures.push(`first build missing ${relPath}`);
        }
        for (const relPath of firstSet) {
            if (!secondSet.has(relPath)) continue;
            const first = normalizeGeneratedContent(relPath, fs.readFileSync(path.join(firstDir, relPath), 'utf-8'));
            const second = normalizeGeneratedContent(relPath, fs.readFileSync(path.join(secondDir, relPath), 'utf-8'));
            if (first !== second) failures.push(`non-deterministic output for ${relPath}`);
        }
    });
});

reportFailures('eval-deterministic-build', failures);
