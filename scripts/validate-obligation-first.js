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

const obligationFirstDir = candidates.find(dir =>
    fs.existsSync(path.join(dir, 'scripts', 'validate-adopter-records.mjs'))
);

if (!obligationFirstDir) {
    console.error('Could not find obligation-first checkout. Set OBLIGATION_FIRST_DIR or check it out beside PubLedge.');
    process.exit(1);
}

const validator = path.join(obligationFirstDir, 'scripts', 'validate-adopter-records.mjs');
const recordsDir = path.join(ROOT, 'docs', 'api', 'v1', 'of', 'records');
const result = spawnSync(process.execPath, [validator, recordsDir], {
    cwd: ROOT,
    stdio: 'inherit'
});

process.exit(result.status || 0);
