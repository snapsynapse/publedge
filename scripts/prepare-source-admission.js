#!/usr/bin/env node
'use strict';

// Produces a pending packet on stdout. It never writes or accepts source data.
const path = require('node:path');
const admission = require('./lib/source-admission');

function prepare(filename, { root = path.join(__dirname, '..') } = {}) {
    if (!admission.protectedPath(filename)) throw new Error('Choose a protected native source path');
    const legacy = JSON.parse(admission.readRegular(root, 'data/admission/legacy.json'));
    const snapshot = admission.nativeSnapshot(filename, admission.readRegular(root, filename));
    const previous = legacy.records[filename];
    const changed = [...new Set([...Object.keys(previous?.units || {}), ...Object.keys(snapshot.units)])]
        .filter(key => previous?.units[key] !== snapshot.units[key]?.sha256);
    if (!changed.length) throw new Error('No substantive changes; unchanged legacy information is not accepted by this workflow');
    return {
        record_sha256: snapshot.sha256,
        baseline_sha256: previous?.sha256 || null,
        whole_record: { before_sha256: previous?.sha256 || null, after_sha256: snapshot.sha256 },
        review: { actor_type: 'agent', actor: '', reviewed_at: '', decision: 'pending', scope: '', packet_sha256: null },
        unresolved: [],
        evidence: {},
        units: Object.fromEntries(changed.map(key => [key, {
            before_sha256: previous?.units[key] || null,
            after_sha256: snapshot.units[key]?.sha256 || null,
            candidate_content: snapshot.units[key]?.content ?? null,
            reason: '',
            qualifications: { scope: '', exceptions: '', time: '' },
            evidence: []
        }]))
    };
}

if (require.main === module) {
    try {
        const args = process.argv.slice(2);
        if (args.length !== 2 || args[0] !== '--file') throw new Error('Usage: prepare-source-admission.js --file data/examples/instruments/record.md');
        console.log(JSON.stringify(prepare(args[1]), null, 2));
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

module.exports = { prepare };
