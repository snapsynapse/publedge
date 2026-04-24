#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
    DOCS_DIR,
    listRedirectHtmlFiles,
    resolveDocsPath,
    reportFailures
} = require('./lib/eval-kit');

const failures = [];

for (const file of listRedirectHtmlFiles()) {
    const html = fs.readFileSync(file, 'utf-8');
    const relPath = path.relative(DOCS_DIR, file);
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
    const refresh = html.match(/http-equiv="refresh" content="0; url=([^"]+)"/);
    const replace = html.match(/window\.location\.replace\((?:"([^"]+)"|'([^']+)')\)/);
    const target = (refresh && refresh[1]) || (replace && (replace[1] || replace[2]));
    if (!canonical) failures.push(`${relPath} missing canonical link`);
    if (!target) {
        failures.push(`${relPath} missing redirect target`);
        continue;
    }
    if (canonical && canonical[1] !== target) failures.push(`${relPath} canonical ${canonical[1]} does not match redirect target ${target}`);
    const resolved = resolveDocsPath(target);
    if (!resolved || !fs.existsSync(resolved)) failures.push(`${relPath} target does not exist: ${target}`);
}

reportFailures('eval-redirects', failures);
