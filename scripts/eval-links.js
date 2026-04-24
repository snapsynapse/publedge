#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
    DOCS_DIR,
    walkFiles,
    resolveDocsPath,
    reportFailures
} = require('./lib/eval-kit');

const failures = [];
const htmlFiles = walkFiles(DOCS_DIR, p => p.endsWith('.html'));
const attrRegex = /\b(?:href|src)=["']([^"']+)["']/g;

for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf-8');
    const relFile = path.relative(DOCS_DIR, file);
    for (const [index, line] of html.split('\n').entries()) {
        let match;
        while ((match = attrRegex.exec(line)) !== null) {
            const href = match[1];
            if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href.startsWith('data:')) continue;
            let resolved;
            if (href.startsWith('/')) {
                resolved = resolveDocsPath(href);
            } else if (/^https?:\/\//.test(href)) {
                const url = new URL(href);
                if (url.hostname !== 'publedge.org') continue;
                resolved = resolveDocsPath(href);
            } else {
                const candidate = path.resolve(path.dirname(file), href.split('#')[0].split('?')[0]);
                resolved = fs.existsSync(candidate) ? candidate : (fs.existsSync(path.join(candidate, 'index.html')) ? path.join(candidate, 'index.html') : candidate);
            }
            if (resolved && fs.existsSync(resolved)) continue;
            failures.push(`${relFile}:${index + 1} -> ${href}`);
        }
        const canonical = line.match(/<link rel="canonical" href="([^"]+)"/);
        if (canonical) {
            if (/^https?:\/\//.test(canonical[1]) && new URL(canonical[1]).hostname !== 'publedge.org') continue;
            const resolved = resolveDocsPath(canonical[1]);
            if (resolved && fs.existsSync(resolved)) continue;
            failures.push(`${relFile}:${index + 1} -> canonical ${canonical[1]}`);
        }
    }
}

reportFailures('eval-links', failures);
