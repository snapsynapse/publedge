'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const admission = require('../scripts/lib/source-admission');
const admissionCheck = require('../scripts/check-source-admission');
const { parseFrontmatter } = require('../scripts/lib/parse');

const ROOT = path.join(__dirname, '..');
const FILE = 'data/examples/instruments/us-ut-legislature-statute-2025-sb226.md';
const read = filename => admission.readRegular(ROOT, filename);
const receipts = JSON.parse(read('data/admission/receipts.json'));
const legacy = JSON.parse(read('data/admission/legacy.json'));
const text = read(FILE).toString('utf8');
const activeReceipt = receipts.records[FILE];
const receipt = admission.receiptLineage(activeReceipt).find(entry => entry.review.packet_sha256 === 'f57211556ad903c24f2b1860a03218bbbb66c58cef9fd29652819c29fde47c9c');
// The 2026-09-24 human-reviewed receipt as accepted on main before succession.
const HUMAN_RECEIPT_DIGEST = '477433cdc9aa83a53073e06246dc52f2914874b80d326b8001ddeb27fa3ccd6b';

test('SB226 Summary successor embeds the human-reviewed receipt verbatim', () => {
    const prior = receipt.supersedes.receipt;
    assert.equal(admission.digest(prior), HUMAN_RECEIPT_DIGEST);
    assert.equal(prior.review.actor_type, 'human');
    assert.equal(prior.review.human_approved, true);
    assert.equal(receipt.supersedes.packet_sha256, prior.review.packet_sha256);
    for (const item of prior.unresolved) assert.ok(receipt.unresolved.includes(item), item);
});

test('SB226 Summary successor is agent-only and changes the Summary text unit alone', () => {
    assert.equal(receipt.review.actor_type, 'agent');
    assert.equal(Object.hasOwn(receipt.review, 'human_approved'), false);
    assert.deepEqual(Object.keys(receipt.units), ['section:Summary/text']);
    const admitted = admission.admittedState(receipt.supersedes.receipt, legacy.records[FILE], { read, now: new Date() });
    const current = admission.admittedState(receipt, legacy.records[FILE], { read, now: new Date() });
    assert.equal(receipt.baseline_sha256, admitted.sha256);
    for (const [key, sha] of Object.entries(current.units)) {
        if (key !== 'section:Summary/text') assert.equal(sha, admitted.units[key], key);
    }
    assert.equal(parseFrontmatter(text).frontmatter.last_verified, '2026-09-23');
    const effective = admission.effectiveUnitReviews(activeReceipt);
    assert.equal(effective['metadata:last_verified'].receipt.review.actor_type, 'human');
    assert.equal(effective['section:Summary/text'].receipt.review.actor_type, 'agent');
    const result = admissionCheck.runCurrent({ root: ROOT });
    assert.equal(result.status, 'passed', result.errors.join('\n'));
});

test('SB226 Summary carries the retained statutory content the comparison found missing', () => {
    const summary = text.split('## Summary\n\n')[1].split('\n### ')[0];
    assert.match(summary, /interacting with generative AI and not a human if the individual asks or otherwise prompts/);
    assert.match(summary, /is generative AI, is not human, or is an AI assistant/);
    assert.match(summary, /alternative safe-harbor forms, not the on-request content/);
    assert.match(summary, /consumer transaction or the provision of regulated services/);
    assert.match(summary, /An individual providing services in a regulated occupation/);
    assert.doesNotMatch(summary, /supplier in a regulated occupation/);
    assert.match(summary, /prominently disclose/);
    assert.match(summary, /comply with all requirements of the occupation/);
    assert.match(summary, /reasonably be relied upon to make significant personal decisions/);
    assert.match(summary, /other applications defined by division rule/);
    assert.match(summary, /verbally at the start of a verbal interaction and in writing before the start of a written interaction/);
    assert.match(summary, /does not itself establish the elements of the underlying violation/);
    assert.match(summary, /retained 2025 enrolled SB 226, not independently validated current codification/);
});
