'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const admission = require('../scripts/lib/source-admission');
const { parseMappingIndex } = require('../scripts/lib/mapping');
const { sourceOwnedAnchors } = require('../scripts/lib/obligation-first');

const ROOT = path.join(__dirname, '..');
const FILE = 'data/examples/mapping/index.yml';
const bytes = fs.readFileSync(path.join(ROOT, FILE));
const text = bytes.toString('utf8');

test('top-level mapping entries have stable units and malformed input fails closed', () => {
    const parsed = parseMappingIndex(text);
    assert.equal(parsed.length, 16);
    assert.equal(parsed[0].obligations[0], 'disclose-genai-on-first-session');
    const current = admission.nativeSnapshot(FILE, bytes);
    const retargeted = admission.nativeSnapshot(FILE, Buffer.from(text.replace(
        'https://everyailaw.com/term/utah-sb149-chatbot-disclosure.json',
        'https://everyailaw.com/term/unreviewed-retarget.json'
    )));
    const deleted = admission.nativeSnapshot(FILE, Buffer.from(text.replace(/- id: utah-mental-health[\s\S]*?(?=\n# --- Utah statutes ---)/, '')));
    assert.notEqual(retargeted.sha256, current.sha256);
    assert.notEqual(deleted.sha256, current.sha256);
    assert.throws(() => parseMappingIndex('- id: example\n  obligations:\n malformed'), /Malformed mapping line/);
});

test('generic exporter reads explicit reviewed anchor fields and never infers from an id', () => {
    assert.deepEqual(sourceOwnedAnchors({ id: 'utah-mental-health-chatbot-disclosure-2026q2-first-session' }), { termAnchors: [], obligationAnchors: [] });
    const mapping = parseMappingIndex(text)[0];
    assert.deepEqual(sourceOwnedAnchors(mapping), {
        termAnchors: ['https://everyailaw.com/term/utah-sb149-chatbot-disclosure.json'],
        obligationAnchors: ['https://everyailaw.com/obligation-category/transparency.json']
    });
    assert.throws(() => sourceOwnedAnchors({ ...mapping, term_anchors: ['https://example.com/term/retarget.json'] }), /not an exact typed EveryAILaw JSON record/);
    assert.throws(() => sourceOwnedAnchors({ ...mapping, term_anchors: ['https://everyailaw.com/obligation/wrong-kind.json'] }), /not an exact typed EveryAILaw JSON record/);
    assert.throws(() => sourceOwnedAnchors({ ...mapping, term_anchors: ['https://everyailaw.com/term/retarget.json?version=2'] }), /not an exact typed EveryAILaw JSON record/);
    assert.throws(() => sourceOwnedAnchors({ ...mapping, term_anchors: ['https://everyailaw.com:8443/term/retarget.json'] }), /not an exact typed EveryAILaw JSON record/);
    assert.throws(() => sourceOwnedAnchors({ ...mapping, term_anchors: '' }), /anchors must be lists/);
    assert.throws(() => sourceOwnedAnchors({ ...mapping, obligation_anchors: null }), /anchors must be lists/);
    assert.doesNotThrow(() => sourceOwnedAnchors({ ...mapping, anchor_source_url: 'https://statutes.example.gov/section/1' }));
    assert.throws(() => sourceOwnedAnchors({ ...mapping, anchor_qualification: '' }), /require a qualified source URL, locator, and qualification/);
});

test('an unreviewed exact-target retarget invalidates the accepted mapping receipt', () => {
    const legacy = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/admission/legacy.json'), 'utf8'));
    const receipts = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/admission/receipts.json'), 'utf8'));
    const retargeted = admission.nativeSnapshot(FILE, Buffer.from(text.replace(
        'https://everyailaw.com/term/utah-sb149-chatbot-disclosure.json',
        'https://everyailaw.com/term/another-valid-looking-target.json'
    )));
    const result = admission.validateAdmission({
        current: { [FILE]: retargeted },
        legacy: { ...legacy, records: { [FILE]: legacy.records[FILE] } },
        admissions: { ...receipts, records: { [FILE]: receipts.records[FILE] } },
        read: relative => admission.readRegular(ROOT, relative),
        now: new Date('2026-09-09T23:59:59Z')
    });
    assert.equal(result.status, 'failed');
    assert.match(result.errors.join('\n'), /Receipt is stale for current record/);
});
