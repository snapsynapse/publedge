#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
    collectAllFiles,
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
            const first = fs.readFileSync(path.join(firstDir, relPath));
            const second = fs.readFileSync(path.join(secondDir, relPath));
            if (!first.equals(second)) failures.push(`non-deterministic output for ${relPath}`);
        }
    }, { TZ: 'America/Denver' });
}, { TZ: 'UTC' });

reportFailures('eval-deterministic-build', failures);
