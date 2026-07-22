#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

const scripts = [
    'eval-parser.js',
    'eval-instrument-schema.js',
    'eval-record-schema.js',
    'eval-schema-parity.js',
    'eval-authority-response.js',
    'eval-clean-build.js',
    'eval-route-inventory.js',
    'eval-discovery.js',
    'eval-mcp-contract.js',
    'eval-mcp-parser-lockstep.js',
    'eval-content-source.js',
    'eval-verification-allowlist.js',
    'eval-obligation-first-binding.js',
    'eval-redirects.js',
    'eval-deterministic-build.js',
    'eval-generated-tree-parity.js',
    'eval-discovery-contract.js',
    'eval-package-smoke.js',
    'eval-public-claims.js',
    'eval-format-contracts.js',
    'eval-manifest-scope.js',
    'eval-links.js',
    'eval-verification-exit.js'
];

let failed = false;
for (const script of scripts) {
    const res = spawnSync(process.execPath, [path.join(__dirname, script)], {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit'
    });
    if (res.status !== 0) failed = true;
}

process.exit(failed ? 1 : 0);
