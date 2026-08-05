#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = path.join(__dirname, '..');
const candidates = [process.env.OBLIGATION_FIRST_DIR, path.join(root, '..', 'obligation-first'), path.join(root, 'obligation-first')].filter(Boolean);
const checker = path.join('scripts', 'check-identifier-continuity.mjs');
const obligationFirstDir = candidates.find(dir => fs.existsSync(path.join(dir, checker)));
if (!obligationFirstDir) {
    if (process.env.CHECK_OF_REQUIRED === '1') { console.error(`check-of-continuity: no Obligation-First checkout providing ${checker} was found.`); process.exit(1); }
    console.log('check-of-continuity: no Obligation-First checkout found; skipping.');
    process.exit(0);
}
const args = [path.join(obligationFirstDir, checker), '--records', path.join(root, 'docs', 'api', 'v1', 'of', 'records'), '--baseline', path.join(root, 'tests', 'fixtures', 'of-identifier-continuity.json')];
if (process.argv.includes('--write-baseline')) args.push('--write-baseline', '--adopter', 'PubLedge', '--release', `v${require('../package.json').version}`);
const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
process.exit(result.status || 0);
