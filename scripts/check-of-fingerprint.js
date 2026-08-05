#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const candidates = [
    process.env.OBLIGATION_FIRST_DIR,
    path.join(ROOT, '..', 'obligation-first'),
    path.join(ROOT, 'obligation-first')
].filter(Boolean);
const CHECKER = path.join('scripts', 'check-adopter-fingerprint.mjs');
const obligationFirstDir = candidates.find(dir => fs.existsSync(path.join(dir, CHECKER)));

if (!obligationFirstDir) {
    if (process.env.CHECK_OF_REQUIRED === '1') {
        console.error(`check-of-fingerprint: no Obligation-First checkout providing ${CHECKER} was found.`);
        console.error(`  searched: ${candidates.join(', ')}`);
        process.exit(1);
    }
    console.log('check-of-fingerprint: no Obligation-First checkout found; skipping.');
    process.exit(0);
}

const args = [
    path.join(obligationFirstDir, CHECKER),
    '--records', path.join(ROOT, 'docs', 'api', 'v1', 'of', 'records'),
    '--profile', path.join(ROOT, 'docs', '.well-known', 'obligation-first-naming-profile.jsonld'),
    '--expected', path.join(ROOT, 'tests', 'fixtures', 'of-contract-fingerprint.json')
];
if (process.argv.includes('--write')) args.push('--write');
const result = spawnSync(process.execPath, args, { cwd: ROOT, stdio: 'inherit' });
process.exit(result.status || 0);
