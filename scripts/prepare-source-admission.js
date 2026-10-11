#!/usr/bin/env node
'use strict';

// Produces a pending packet on stdout. It never writes or accepts source data.
const path = require('node:path');
const admission = require('./lib/source-admission');

// With supersede, the packet reviews only units changed since the existing
// receipt, which it embeds verbatim so the earlier review stays immutable.
function prepare(filename, { root = path.join(__dirname, '..'), supersede = false } = {}) {
    if (!admission.protectedPath(filename)) throw new Error('Choose a protected native source path');
    const legacy = JSON.parse(admission.readRegular(root, 'data/admission/legacy.json'));
    const snapshot = admission.nativeSnapshot(filename, admission.readRegular(root, filename));
    const existing = JSON.parse(admission.readRegular(root, 'data/admission/receipts.json')).records[filename];
    let base;
    if (supersede) {
        if (!existing) throw new Error('No existing receipt to supersede');
        base = admission.admittedState(existing, legacy.records[filename], { read: file => admission.readRegular(root, file), now: new Date() });
    } else {
        if (existing) throw new Error('Record already has a receipt; prepare a successor with --supersede');
        base = admission.legacyState(legacy.records[filename]);
    }
    const changed = [...new Set([...Object.keys(base.units), ...Object.keys(snapshot.units)])]
        .filter(key => (base.units[key] || null) !== (snapshot.units[key]?.sha256 || null));
    if (!changed.length) throw new Error('No substantive changes; unchanged information is not accepted by this workflow');
    return {
        record_sha256: snapshot.sha256,
        baseline_sha256: base.sha256,
        whole_record: { before_sha256: base.sha256, after_sha256: snapshot.sha256 },
        ...(supersede ? { supersedes: { packet_sha256: existing.review.packet_sha256, reason: '', receipt: existing } } : {}),
        review: { actor_type: 'agent', actor: '', reviewed_at: '', decision: 'pending', scope: '', packet_sha256: null },
        unresolved: supersede ? [...(existing.unresolved || [])] : [],
        evidence: {},
        units: Object.fromEntries(changed.map(key => [key, {
            before_sha256: base.units[key] || null,
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
        const supersede = args.includes('--supersede');
        const rest = args.filter(arg => arg !== '--supersede');
        if (rest.length !== 2 || rest[0] !== '--file') throw new Error('Usage: prepare-source-admission.js --file data/examples/instruments/record.md [--supersede]');
        console.log(JSON.stringify(prepare(rest[1], { supersede }), null, 2));
    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    }
}

module.exports = { prepare };
