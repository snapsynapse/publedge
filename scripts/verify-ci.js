#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const gates = [
    ['bash', ['scripts/validate-hashes.sh']],
    [npm, ['run', 'validate']],
    [npm, ['run', 'eval:instrument-schema']],
    [npm, ['run', 'eval:obligation-schema']],
    [npm, ['run', 'build']],
    [npm, ['run', 'check:of']],
    [npm, ['run', 'validate:of']],
    [npm, ['run', 'evals']],
    ['git', ['diff', '--check']],
    ['git', ['diff', '--exit-code', '--', 'docs/']]
];

for (const [command, args] of gates) {
    const result = spawnSync(command, args, { stdio: 'inherit', env: process.env });
    if (result.error) {
        console.error(`verify-ci: ${result.error.message}`);
        process.exit(1);
    }
    if (result.status !== 0) process.exit(result.status || 1);
}

console.log('PubLedge canonical CI verification passed.');
