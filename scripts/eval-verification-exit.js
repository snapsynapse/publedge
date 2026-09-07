#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { ROOT, reportFailures } = require('./lib/eval-kit');

function makeTempRepo() {
    const dir = path.join(os.tmpdir(), `publedge-verify-eval-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    fs.mkdirSync(path.join(dir, 'scripts', 'lib'), { recursive: true });
    fs.cpSync(path.join(ROOT, 'project.yml'), path.join(dir, 'project.yml'));
    fs.cpSync(path.join(ROOT, 'data'), path.join(dir, 'data'), { recursive: true });
    fs.cpSync(path.join(ROOT, 'scripts', 'verify.js'), path.join(dir, 'scripts', 'verify.js'));
    for (const module of ['parse.js', 'mapping.js', 'verify-policy.js']) {
        fs.cpSync(path.join(ROOT, 'scripts', 'lib', module), path.join(dir, 'scripts', 'lib', module));
    }
    return dir;
}

function runVerify(tempRoot) {
    return spawnSync(process.execPath, [path.join(tempRoot, 'scripts', 'verify.js')], {
        cwd: tempRoot,
        encoding: 'utf-8'
    });
}

function assertMeaningfulFailure(failures, label, res, requiredText) {
    const output = `${res.stdout || ''}\n${res.stderr || ''}`;
    if (res.error) failures.push(`${label}: verifier could not start: ${res.error.message}`);
    if (res.status === 0) failures.push(`${label}: verify.js exited successfully`);
    if (/MODULE_NOT_FOUND|Cannot find module/i.test(output)) failures.push(`${label}: fixture failed before verifier logic ran`);
    for (const text of requiredText) {
        if (!output.includes(text)) failures.push(`${label}: output omitted ${JSON.stringify(text)}`);
    }
}

function withFixture(failures, label, mutate, requiredText) {
    const tempRoot = makeTempRepo();
    try {
        mutate(tempRoot);
        assertMeaningfulFailure(failures, label, runVerify(tempRoot), requiredText);
    } finally {
        fs.rmSync(tempRoot, { recursive: true, force: true });
    }
}

const failures = [];
const instrumentPath = root => path.join(root, 'data', 'examples', 'instruments', 'us-cfpb-ao-2022-001.md');
const replaceVerified = (root, value) => {
    const file = instrumentPath(root);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf-8').replace(/^last_verified:.*$/m, `last_verified: ${value}`));
};

{
    const tempRoot = makeTempRepo();
    try {
        const res = runVerify(tempRoot);
        const output = `${res.stdout || ''}\n${res.stderr || ''}`;
        if (!output.includes('Staleness policy: active instruments 90d; authorities 180d; obligations 180d; historical demonstrations 365d')) {
            failures.push('baseline verifier output does not preserve the 90/180/365 differentiated cadence policy');
        }
        if (/MODULE_NOT_FOUND|Cannot find module/i.test(output)) failures.push('baseline fixture failed before verifier logic ran');
    } finally {
        fs.rmSync(tempRoot, { recursive: true, force: true });
    }
}

withFixture(failures, 'missing last_verified', root => {
    const file = instrumentPath(root);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf-8').replace(/^last_verified:.*\n/m, ''));
}, ['NEVER VERIFIED (1):', 'us-cfpb-ao-2022-001', 'Result: REVIEW NEEDED']);

withFixture(failures, 'malformed last_verified', root => replaceVerified(root, 'not-a-date'), [
    'INVALID LAST VERIFIED (1):', 'us-cfpb-ao-2022-001', 'Result: REVIEW NEEDED'
]);

withFixture(failures, 'impossible last_verified', root => replaceVerified(root, '2026-02-30'), [
    'INVALID LAST VERIFIED (1):', 'us-cfpb-ao-2022-001', 'Result: REVIEW NEEDED'
]);

withFixture(failures, 'future last_verified', root => replaceVerified(root, '2999-01-01'), [
    'FUTURE LAST VERIFIED (1):', 'us-cfpb-ao-2022-001', 'Result: REVIEW NEEDED'
]);

withFixture(failures, 'invalid verification threshold', root => {
    const config = path.join(root, 'project.yml');
    fs.writeFileSync(config, fs.readFileSync(config, 'utf-8').replace(/^  staleness_days: 90$/m, '  staleness_days: 0'));
}, ['Configuration error: Invalid verification.staleness_days']);

withFixture(failures, 'unknown mapping target', root => {
    const mapping = path.join(root, 'data', 'examples', 'mapping', 'index.yml');
    fs.writeFileSync(mapping, fs.readFileSync(mapping, 'utf-8').replace('regulation: us-cfpb-ao-2022-001', 'regulation: does-not-exist'));
}, ['ERROR: Mapping', 'does-not-exist', 'Result: REVIEW NEEDED']);

reportFailures('eval-verification-exit', failures);
