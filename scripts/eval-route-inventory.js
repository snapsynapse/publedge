#!/usr/bin/env node
'use strict';

const {
    DOCS_DIR,
    withTempBuild,
    collectManagedGeneratedPaths,
    reportFailures
} = require('./lib/eval-kit');

const failures = [];

withTempBuild(tempDir => {
    const expected = collectManagedGeneratedPaths(tempDir);
    const actual = collectManagedGeneratedPaths(DOCS_DIR);
    for (const route of expected) {
        if (!actual.has(route)) failures.push(`missing managed route ${route}`);
    }
    for (const route of actual) {
        if (!expected.has(route)) failures.push(`unexpected managed route ${route}`);
    }
});

reportFailures('eval-route-inventory', failures);
