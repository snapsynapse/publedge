#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
    DOCS_DIR,
    withTempBuild,
    collectManagedHtml,
    reportFailures
} = require('./lib/eval-kit');

const failures = [];

withTempBuild(tempDir => {
    const freshFiles = collectManagedHtml(tempDir);
    for (const relPath of freshFiles) {
        const currentPath = path.join(DOCS_DIR, relPath);
        const freshPath = path.join(tempDir, relPath);
        if (!fs.existsSync(currentPath)) {
            failures.push(`checked-in docs missing generated file ${relPath}`);
            continue;
        }
        const current = fs.readFileSync(currentPath);
        const fresh = fs.readFileSync(freshPath);
        if (!current.equals(fresh)) failures.push(`checked-in docs differ from fresh build for ${relPath}`);
    }
});

reportFailures('eval-clean-build', failures);
