#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, walkFiles, reportFailures } = require('./lib/eval-kit');

const failures = [];

function rel(file) {
    return path.relative(ROOT, file).replace(/\\/g, '/');
}

function listedManifestPaths() {
    const manifest = fs.readFileSync(path.join(ROOT, 'MANIFEST.yaml'), 'utf-8');
    return new Set([...manifest.matchAll(/^\s*-\s+path:\s+(.+)$/gm)].map(m => m[1].trim()));
}

function canonicalSourcePaths() {
    const paths = new Set([
        'LICENSE',
        'LICENSE-APACHE',
        'LICENSE-CC-BY-4.0',
        'ATTRIBUTION.md',
        'CHANGELOG.md',
        'CONTRIBUTING.md',
        'DEFINITIONS.md',
        'mcp-server.js',
        'mcp.json',
        'package.json',
        'PRIOR-ART.md',
        'project.yml',
        'PROTOCOL.md',
        'README.md',
        'ROADMAP.md',
        'SECURITY.md',
        'VERIFICATION.md'
    ]);

    const includeDirs = [
        'data/examples/authorities',
        'data/examples/instruments',
        'data/examples/mapping',
        'data/examples/obligations',
        '_templates',
        'schema',
        'scripts',
        'vendor/gist',
        '.github/workflows'
    ];
    for (const dir of includeDirs) {
        for (const file of walkFiles(path.join(ROOT, dir), p => /\.(md|ya?ml|json|jsonld|ttl|txt|js|sh)$/.test(p))) {
            paths.add(rel(file));
        }
    }
    return paths;
}

const manifestPaths = listedManifestPaths();
const expectedPaths = canonicalSourcePaths();

for (const expected of expectedPaths) {
    if (!manifestPaths.has(expected)) failures.push(`canonical source missing from MANIFEST.yaml: ${expected}`);
}
for (const manifestPath of manifestPaths) {
    if (!fs.existsSync(path.join(ROOT, manifestPath))) failures.push(`MANIFEST.yaml references missing file: ${manifestPath}`);
}
if (manifestPaths.has('MANIFEST.yaml')) failures.push('MANIFEST.yaml must not hash itself');
for (const manifestPath of manifestPaths) {
    if (manifestPath.startsWith('docs/') || manifestPath.startsWith('_workshop/')) {
        failures.push(`excluded generated/scratch path appears in MANIFEST.yaml: ${manifestPath}`);
    }
}

reportFailures('eval-manifest-scope', failures);
