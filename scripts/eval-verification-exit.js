#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { ROOT, reportFailures } = require('./lib/eval-kit');

function makeTempRepo() {
    const dir = path.join(os.tmpdir(), `publedge-verify-eval-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    fs.mkdirSync(dir, { recursive: true });
    fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
    fs.cpSync(path.join(ROOT, 'project.yml'), path.join(dir, 'project.yml'));
    fs.cpSync(path.join(ROOT, 'data'), path.join(dir, 'data'), { recursive: true });
    fs.cpSync(path.join(ROOT, 'scripts', 'verify.js'), path.join(dir, 'scripts', 'verify.js'));
    return dir;
}

function runVerify(tempRoot) {
    return spawnSync(process.execPath, [path.join(tempRoot, 'scripts', 'verify.js')], {
        cwd: tempRoot,
        encoding: 'utf-8'
    });
}

const failures = [];

{
    const tempRoot = makeTempRepo();
    try {
        const instrument = path.join(tempRoot, 'data', 'examples', 'instruments', 'us-cfpb-ao-2022-001.md');
        const content = fs.readFileSync(instrument, 'utf-8').replace(/^last_verified:.*\n/m, '');
        fs.writeFileSync(instrument, content);
        const res = runVerify(tempRoot);
        if (res.status === 0) failures.push('verify.js exits successfully when an entity has no last_verified date');
    } finally {
        fs.rmSync(tempRoot, { recursive: true, force: true });
    }
}

{
    const tempRoot = makeTempRepo();
    try {
        const mapping = path.join(tempRoot, 'data', 'examples', 'mapping', 'index.yml');
        const content = fs.readFileSync(mapping, 'utf-8').replace('regulation: us-cfpb-ao-2022-001', 'regulation: does-not-exist');
        fs.writeFileSync(mapping, content);
        const res = runVerify(tempRoot);
        if (res.status === 0) failures.push('verify.js exits successfully when mappings reference an unknown container');
    } finally {
        fs.rmSync(tempRoot, { recursive: true, force: true });
    }
}

reportFailures('eval-verification-exit', failures);
