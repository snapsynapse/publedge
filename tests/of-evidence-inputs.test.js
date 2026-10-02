'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { withEvidenceBoundary } = require('../scripts/lib/obligation-first');
const admission = require('../scripts/lib/source-admission');

const ROOT = path.join(__dirname, '..');
const RECORDS = path.join(ROOT, 'docs/api/v1/of/records');
const records = fs.readdirSync(RECORDS).filter(name => name.endsWith('.json')).map(name => JSON.parse(fs.readFileSync(path.join(RECORDS, name), 'utf8')));
const byId = new Map(records.map(record => [record['@id'], record]));
const digestFile = relative => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, relative))).digest('hex');

test('SB226 R1 generated disclosures carry exact reviewed definition inputs without promoting legacy mapping or roles', () => {
    const receipts = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/admission/receipts.json'), 'utf8'));
    for (const slug of ['disclose-genai-on-request', 'disclose-genai-high-risk-proactive']) {
        const relative = `data/examples/obligations/${slug}.md`;
        const native = fs.readFileSync(path.join(ROOT, relative));
        const summary = native.toString('utf8').split('## Summary\n\n')[1].split('\n## ')[0].trim().replace(/\s+/g, ' ');
        const id = `https://publedge.org/obligation/sb226-disclosure-and-ai-defense-${slug}.json`;
        const record = byId.get(id);
        assert.ok(record, id);
        assert.equal(record.content, summary);
        assert.deepEqual(record['pub:evidence_inputs'].map(input => input.kind), ['instrument', 'mapping-entry', 'obligation-definition']);
        assert.deepEqual(record['pub:evidence_inputs'].map(input => input.admission_status), ['reviewed-changes', 'legacy-unreviewed', 'reviewed-changes']);
        const definition = record['pub:evidence_inputs'][2];
        assert.equal(definition.native_file_sha256, admission.hash(native));
        assert.equal(definition.canonical_sha256, receipts.records[relative].record_sha256);
        assert.equal(definition.review_packet_sha256, receipts.records[relative].review.packet_sha256);
        assert.deepEqual(definition.retained_primary_sha256, ['279184eb1ee69adb7c9ada3e29763f9766b0705c87770b6330c13bada07c60e8']);
        assert.equal(record.admission_status, 'legacy-unreviewed');
        assert.equal(record['pub:source_review_state'], 'known-and-unknown');
        assert.equal(record.verified, '2026-04-21');
        for (const field of ['lifecycle_status', 'operative_status', 'enforcement_status']) assert.equal(record[field], 'unknown');
        assert.equal(Object.hasOwn(record, 'effective'), false);
        assert.equal(Object.hasOwn(record, 'duty_holder'), false);
        assert.ok(record['pub:source_review_unresolved'].some(item => /current-codification bridge.*not validated/.test(item)));
        const mirror = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/obligation', `sb226-disclosure-and-ai-defense-${slug}.json`), 'utf8'));
        assert.deepEqual(mirror, record);
    }
});

test('every OF record declares exact native evidence inputs and explicit review uncertainty', () => {
    assert.equal(records.length, 130);
    for (const record of records) {
        assert.equal(record.projection_basis, 'native-record-projection', record['@id']);
        assert.ok(['legacy-unreviewed', 'source-consistency-reviewed-changes'].includes(record.admission_status), record['@id']);
        assert.ok(Object.hasOwn(record, 'source_review_conflicts'), record['@id']);
        assert.ok(['legacy-unreviewed-source-reference', 'reviewed-source-reference'].includes(record.evidence_type), record['@id']);
        assert.ok(Array.isArray(record['pub:evidence_inputs']) && record['pub:evidence_inputs'].length, record['@id']);
        for (const input of record['pub:evidence_inputs']) {
            assert.equal(input.native_file_sha256, digestFile(input.native_path), `${record['@id']} ${input.native_path}`);
            assert.match(input.canonical_sha256, /^[a-f0-9]{64}$/);
            assert.ok(Object.hasOwn(input, 'canonical_unit'));
            assert.ok(Object.hasOwn(input, 'review_packet_sha256'));
            assert.ok(Object.hasOwn(input, 'retained_primary_sha256'));
            assert.ok(Object.hasOwn(input, 'unresolved'));
        }
    }
});

test('per-kind input chains preserve mixed legacy and reviewed status', () => {
    // A reviewed instrument cannot promote a term whose mapping entry remains legacy-unreviewed.
    const mixed = byId.get('https://publedge.org/term/doctronic-rma-obligations.json');
    assert.deepEqual(mixed['pub:evidence_inputs'].map(input => input.kind), ['instrument', 'mapping-entry']);
    assert.deepEqual(mixed['pub:evidence_inputs'].map(input => input.admission_status), ['reviewed-changes', 'legacy-unreviewed']);
    assert.equal(mixed.admission_status, 'legacy-unreviewed');
    assert.equal(mixed.evidence_type, 'legacy-unreviewed-source-reference');

    // Reviewing every input of the draft JIA term must not promote the draft.
    const term = byId.get('https://publedge.org/term/utah-mental-health-chatbot-disclosure-2026q2-first-session.json');
    assert.deepEqual(term['pub:evidence_inputs'].map(input => input.kind), ['instrument', 'mapping-entry']);
    assert.deepEqual(term['pub:evidence_inputs'].map(input => input.admission_status), ['reviewed-changes', 'reviewed-changes']);
    assert.equal(term.admission_status, 'source-consistency-reviewed-changes');
    assert.equal(term.evidence_type, 'reviewed-source-reference');
    assert.equal(term.source_review_conflicts, null);
    assert.ok(term['pub:source_review_unresolved'].some(item => /30-minute/i.test(item)));
    assert.equal(term.lifecycle_status, 'draft');
    assert.deepEqual(term['pub:evidence_inputs'][1].retained_primary_sha256, ['4a46dfa2524603d0ae5b90b9941c755206c19b16b269add496f55191749c4e9f']);

    const obligation = byId.get('https://publedge.org/obligation/utah-mental-health-chatbot-disclosure-2026q2-first-session-disclose-genai-on-first-session.json');
    assert.deepEqual(obligation['pub:evidence_inputs'].map(input => input.kind), ['instrument', 'mapping-entry', 'obligation-definition']);
    assert.equal(obligation.admission_status, 'source-consistency-reviewed-changes');
    assert.notEqual(obligation.lifecycle_status, 'in-force');

    const instrument = byId.get('https://publedge.org/instrument/us-ut-oaip-rma-2025-002.json');
    assert.deepEqual(instrument['pub:evidence_inputs'].map(input => input.kind), ['instrument']);
    assert.equal(instrument.admission_status, 'source-consistency-reviewed-changes');
    assert.equal(instrument.evidence_type, 'reviewed-source-reference');
    assert.equal(instrument.source_review_conflicts, null);
    assert.ok(instrument['pub:source_review_unresolved'].some(item => /conflict/i.test(item)));

    const sb149Term = byId.get('https://publedge.org/term/sb149-learning-lab-and-ai-defense.json');
    assert.deepEqual(sb149Term['pub:evidence_inputs'].map(input => input.admission_status), ['reviewed-changes', 'reviewed-changes']);
    assert.equal(sb149Term.admission_status, 'source-consistency-reviewed-changes');
    assert.equal(sb149Term.evidence_type, 'reviewed-source-reference');
});

test('invalid or absent evidence input digests fail before projection', () => {
    const valid = { kind: 'instrument', native_path: 'record.md', native_file_sha256: '1'.repeat(64), canonical_unit: null, canonical_sha256: '2'.repeat(64), admission_status: 'legacy-unreviewed', review_packet_sha256: null, retained_primary_sha256: null, unresolved_review_state: 'unknown', unresolved: null };
    const reviewed = { ...valid, admission_status: 'reviewed-changes', review_packet_sha256: '3'.repeat(64), retained_primary_sha256: ['4'.repeat(64)], unresolved_review_state: 'none-declared', unresolved: [] };
    assert.throws(() => withEvidenceBoundary({ '@id': 'https://example.com/record' }, []), /Missing exact native evidence input/);
    assert.throws(() => withEvidenceBoundary({ '@id': 'https://example.com/record' }, [{ ...valid, canonical_sha256: null }]), /Missing exact native evidence input/);
    assert.doesNotThrow(() => withEvidenceBoundary({ '@id': 'https://example.com/record' }, [reviewed]));
    assert.throws(() => withEvidenceBoundary({ '@id': 'https://example.com/record' }, [{ ...reviewed, admission_status: undefined }]), /Missing exact native evidence input/);
    const missingStatus = { ...reviewed };
    delete missingStatus.admission_status;
    assert.throws(() => withEvidenceBoundary({ '@id': 'https://example.com/record' }, [missingStatus]), /Missing exact native evidence input/);
    assert.throws(() => withEvidenceBoundary({ '@id': 'https://example.com/record' }, [{ ...reviewed, review_packet_sha256: null }]), /Missing exact native evidence input/);
    assert.doesNotThrow(() => withEvidenceBoundary({ '@id': 'https://example.com/record' }, [{ ...reviewed, retained_primary_sha256: null }]));
    const missingPrimary = { ...reviewed };
    delete missingPrimary.retained_primary_sha256;
    assert.throws(() => withEvidenceBoundary({ '@id': 'https://example.com/record' }, [missingPrimary]), /Missing exact native evidence input/);
    assert.throws(() => withEvidenceBoundary({ '@id': 'https://example.com/record' }, [{ ...reviewed, unresolved_review_state: 'declared' }]), /Missing exact native evidence input/);
    assert.throws(() => withEvidenceBoundary({ '@id': 'https://example.com/record' }, [{ ...reviewed, unresolved_review_state: 'declared', unresolved: [null] }]), /Missing exact native evidence input/);
    assert.throws(() => withEvidenceBoundary({ '@id': 'https://example.com/record' }, [{ ...reviewed, native_path: 123 }]), /Missing exact native evidence input/);
    assert.throws(() => withEvidenceBoundary({ '@id': 'https://example.com/record' }, [{ ...reviewed, native_file_sha256: { toString: () => '1'.repeat(64) } }]), /Missing exact native evidence input/);
    assert.throws(() => withEvidenceBoundary({ '@id': 'https://example.com/record' }, [{ ...valid, review_packet_sha256: '3'.repeat(64) }]), /Missing exact native evidence input/);
});
