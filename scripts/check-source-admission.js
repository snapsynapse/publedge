#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const admission = require('./lib/source-admission');

const ROOT = path.join(__dirname, '..');
const LEGACY_SHA256 = 'ee10ed6991196eb74d899818920a8b00e6759e68bf55d179d01eb759d0328694';
const LIMITS = 'Traceability and declared review only; no automatic legal truth, completeness, authenticated reviewer identity, or currentness certification.';

function sourceFiles(root, directory = 'data/examples') {
    const files = [];
    for (const item of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
        const filename = `${directory}/${item.name}`;
        if (item.isSymbolicLink()) throw new Error(`Source symlink forbidden: ${filename}`);
        if (item.isDirectory()) files.push(...sourceFiles(root, filename));
        else if (admission.protectedPath(filename)) files.push(filename);
    }
    return files.sort();
}

function validateCurrent({ root = ROOT, now = new Date() } = {}) {
    const baselineBytes = admission.readRegular(root, 'data/admission/legacy.json');
    if (admission.hash(baselineBytes) !== LEGACY_SHA256) throw new Error('Frozen legacy debt inventory changed; no bulk rebaseline is permitted');
    const legacy = JSON.parse(baselineBytes);
    const admissions = JSON.parse(admission.readRegular(root, 'data/admission/receipts.json'));
    const current = Object.fromEntries(sourceFiles(root).map(filename => [filename, admission.nativeSnapshot(filename, admission.readRegular(root, filename))]));
    const result = admission.validateAdmission({ current, legacy, admissions, read: filename => admission.readRegular(root, filename), now });
    return { result, admissions, legacy };
}

function publicResult(result) {
    const output = { ...result };
    delete output.emitted;
    return output;
}

function runCurrent(options = {}) {
    return publicResult(validateCurrent(options).result);
}

function assertCurrent(options = {}) {
    const result = process.env.SOURCE_ADMISSION_BASE
        ? run({ ...options, base: process.env.SOURCE_ADMISSION_BASE })
        : runCurrent(options);
    if (result.status !== 'passed') throw new Error(`Source admission failed:\n${result.errors.join('\n')}`);
    return result;
}

function assertForEmission(options = {}) {
    if (process.env.SOURCE_ADMISSION_BASE) assertCurrent(options);
    const result = validateCurrent(options).result;
    if (result.status !== 'passed') throw new Error(`Source admission failed:\n${result.errors.join('\n')}`);
    return result;
}

function retainPriorReceipts(result, admissions, prior) {
    for (const filename of Object.keys(prior?.records || {})) {
        if (!admissions.records[filename]) result.errors.push(`${filename}: previously reviewed record lost its receipt`);
    }
    result.status = result.errors.length ? 'failed' : 'passed';
    return result;
}

function run({ root = ROOT, base = process.env.SOURCE_ADMISSION_BASE || 'HEAD', now = new Date() } = {}) {
    const { result, admissions, legacy } = validateCurrent({ root, now });

    if (!/^(?:HEAD|[a-f0-9]{40})$/.test(base)) throw new Error('Admission base must be HEAD or an exact commit SHA');
    execFileSync('git', ['cat-file', '-e', `${base}^{commit}`], { cwd: root, stdio: 'pipe' });
    let prior = null;
    try {
        prior = JSON.parse(execFileSync('git', ['show', `${base}:data/admission/receipts.json`], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' }));
    } catch {
        const resolved = execFileSync('git', ['rev-parse', base], { cwd: root, encoding: 'utf8' }).trim();
        if (resolved !== legacy.source_commit) {
            try { execFileSync('git', ['merge-base', '--is-ancestor', resolved, legacy.source_commit], { cwd: root, stdio: 'pipe' }); }
            catch { throw new Error('Admission receipts unavailable at comparison base'); }
        }
    }
    return publicResult(retainPriorReceipts(result, admissions, prior));
}

function failure(error) {
    return { status: 'failed', total_records: 0, legacy_unreviewed_records: 0, records_with_reviewed_changes: 0, changed_units_reviewed: 0, errors: [error.message], limits: LIMITS };
}

if (require.main === module) {
    try {
        const result = run();
        if (!process.argv.includes('--quiet') || result.status !== 'passed') console.log(JSON.stringify(result, null, 2));
        process.exitCode = result.status === 'passed' ? 0 : 1;
    } catch (error) {
        console.log(JSON.stringify(failure(error), null, 2));
        process.exitCode = 1;
    }
}

module.exports = { run, runCurrent, assertCurrent, assertForEmission, retainPriorReceipts, validateCurrent, sourceFiles, LEGACY_SHA256, failure };
