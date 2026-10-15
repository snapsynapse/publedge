'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const admission = require('../scripts/lib/source-admission');
const admissionCheck = require('../scripts/check-source-admission');
const { parseFrontmatter } = require('../scripts/lib/parse');
const { parseMappingIndex } = require('../scripts/lib/mapping');

const ROOT = path.join(__dirname, '..');
const sourcePath = 'data/admission/sources/utah-sb226/SB0226-enrolled.txt';
const originalPath = 'data/admission/sources/utah-sb226/SB0226-enrolled.pdf';
const slugs = ['disclose-genai-on-request', 'disclose-genai-high-risk-proactive'];
const read = filename => admission.readRegular(ROOT, filename);
const nativePaths = slugs.map(slug => `data/examples/obligations/${slug}.md`);
const native = nativePaths.map(filename => read(filename).toString('utf8'));
const receipts = JSON.parse(read('data/admission/receipts.json'));
const legacy = JSON.parse(read('data/admission/legacy.json'));
// R1 is an immutable historical checkpoint, now embedded by the codification successor.
const r1Packets = ['ae850f903e66d27eac95d560533460f50cea40532afb8f15ab6d5c6c41e9b98a', '53dc6fff3ee933e85a8596578c3985f836252418b30dc6025349ed3ebdb586bb'];
const r1Receipts = Object.fromEntries(nativePaths.map((filename, i) => [filename, admission.receiptLineage(receipts.records[filename]).find(entry => entry.review.packet_sha256 === r1Packets[i])]));

test('SB226 R1 retained enrolled evidence stays immutable and is not a current-code bridge', () => {
    assert.equal(admission.hash(read(originalPath)), '279184eb1ee69adb7c9ada3e29763f9766b0705c87770b6330c13bada07c60e8');
    assert.equal(admission.hash(read(sourcePath)), '088cb7315787b8f1a2c999ab3cdf9527b10eae034d032c7912ad6530441f08d7');
    for (const filename of nativePaths) {
        const receipt = r1Receipts[filename];
        assert.match(receipt.review.scope, /immutable retained 2025 enrolled SB 226/);
        assert.ok(receipt.unresolved.some(item => /current-codification bridge.*not validated/.test(item)));
        assert.ok(receipt.unresolved.some(item => /Chapter77 is an unverified candidate only, with no retained index evidence and no validated bridge/.test(item)));
        for (const evidence of Object.values(receipt.evidence)) {
            assert.equal(evidence.acquisition, 'retained_snapshot');
            assert.equal(evidence.snapshot_path, sourcePath);
            assert.equal(evidence.original.path, originalPath);
            assert.equal(evidence.version, '2025 General Session enrolled copy');
            assert.equal(Object.hasOwn(evidence, 'retrieval'), false);
            assert.ok(read(sourcePath).toString('utf8').includes(evidence.excerpt));
        }
    }
});

test('SB226 R1 native IDs, metadata, mapping and R3 civil/criminal content are unchanged', () => {
    const metadataHashes = [
        'c1a885befc40f51ff14b50d68ff3bfb134eda17ef1aaf11a819661ef9e015585',
        '04bc7364563c4e2d3ec567bf969e6d09c1dc37d1b0932447d2f8a30f3eeb0a7a'
    ];
    for (const [index, text] of native.entries()) {
        const metadata = parseFrontmatter(text).frontmatter;
        assert.equal(metadata.id, slugs[index]);
        assert.equal(metadata.last_verified, '2026-04-21');
        assert.equal(admission.digest(metadata), metadataHashes[index]);
        assert.match(text, /selected current Chapter 77 code retained on October 15, 2026/);
        assert.match(text, /retained 2025 enrolled SB 226/i);
    }
    // The SB226 instrument Summary moved later under receipt succession; see sb226-summary-succession.test.js.
    const preserved = {
        'data/examples/obligations/ai-defense-elimination.md': 'a55e45923f6c446174676808c25e74c677631fb8550f520ee92ba2786eb08151'
    };
    // Current civil locator changes are tested separately; R1's exact prior review must remain.
    for (const filename of Object.keys(preserved)) assert.ok(admission.receiptLineage(receipts.records[filename]).some(entry => admission.digest(entry) === '468b8029d06d02225a297094b0dcc40becb5c4a139fe4416a5676bac8700f1a3'), filename);
    const mapping = parseMappingIndex(read('data/examples/mapping/index.yml').toString('utf8')).find(entry => entry.id === 'sb226-disclosure-and-ai-defense');
    // HB452 may change its own mapping entry; preserve the entire SB226 entry.
    const { obligation_qualification, ...originalMapping } = mapping;
    assert.equal(admission.digest(originalMapping), '4a99aeb263d40980aeb761d4572a047a19b10322e712878efd9d8c5f3bdda649');
    assert.deepEqual(mapping.obligations, [...slugs, 'ai-defense-elimination']);
    assert.equal(Object.hasOwn(receipts.records['data/examples/mapping/index.yml'].supersedes.receipt.units, 'entry:sb226-disclosure-and-ai-defense'), false);
});

test('SB226 R1 native request content is conjunctive and retains supplier/transaction/request qualifiers', () => {
    const summary = native[0].split('## Summary\n\n')[1].split('\n## ')[0];
    assert.match(summary, /supplier that uses generative artificial intelligence to interact with an individual in connection with a consumer transaction/);
    assert.match(summary, /disclose that the individual is interacting with generative artificial intelligence and not a human/);
    assert.match(summary, /individual asks or otherwise prompts the supplier/);
    assert.match(summary, /clear and unambiguous request to determine whether the interaction is with a human or with artificial intelligence/);
    assert.match(native[0], /not-human-only response as the complete §13-77-103\(1\) disclosure/);
    assert.match(native[0], /not-human alternative does not require the literal word "AI"/);
});

test('SB226 R1 native high-risk scope preserves statutory actor, all branches and channel timing', () => {
    const summary = native[1].split('## Summary\n\n')[1].split('\n## ')[0];
    assert.match(summary, /individual providing services in a regulated occupation must prominently disclose/);
    assert.match(summary, /without a supplier condition/);
    assert.match(summary, /regulated by the Department of Commerce.*license or state certification/);
    assert.match(summary, /verbally at the start of a verbal interaction, and in writing before the start of a written interaction/);
    assert.match(summary, /Written interactions are not limited to electronic messaging/);
    assert.match(summary, /comply with all requirements of the regulated occupation.*not confined to high-risk interactions/);
    assert.match(summary, /sensitive personal information, including health, financial or biometric data/);
    assert.match(summary, /personalized recommendations, advice or information that could reasonably be relied upon to make significant personal decisions/);
    assert.match(summary, /financial, legal, medical or mental health advice or services/);
    assert.match(summary, /Other applications as defined by division rule/);
    assert.match(summary, /inclusive examples, not exhaustive lists/);
});

test('SB226 R1 native safe harbor retains alternatives, full timing and section103-only relief', () => {
    for (const text of native) {
        assert.match(text, /enforcement actions for violating §13-77-103 only/);
        assert.match(text, /clearly and conspicuously disclose[\s\S]*?at the outset and throughout/);
        assert.match(text, /is generative artificial intelligence, is not human, or is an artificial intelligence assistant/);
        assert.match(text, /alternative safe-harbor forms/);
        assert.match(text, /other state and federal remedies/);
    }
    assert.match(native[0], /consumer transaction or the provision of regulated services/);
    assert.match(native[0], /safe harbor has no request prerequisite/);
    assert.match(native[1], /safe harbor also covers the provision of regulated services/);
});

test('SB226 R1 admission binds exactly the new agent-reviewed units without rewriting prior receipts', () => {
    // The SB226 instrument receipt is embedded verbatim by its successor; see sb226-summary-succession.test.js.
    const preservedReceipts = {
        'data/examples/obligations/ai-defense-elimination.md': '468b8029d06d02225a297094b0dcc40becb5c4a139fe4416a5676bac8700f1a3'
    };
    for (const [filename, expected] of Object.entries(preservedReceipts)) assert.ok(admission.receiptLineage(receipts.records[filename]).some(entry => admission.digest(entry) === expected), filename);
    // The HB452 successor must retain the exact R1-era mapping receipt.
    assert.ok(admission.receiptLineage(receipts.records['data/examples/mapping/index.yml']).some(entry => admission.digest(entry) === '0bd582f2ad5ddc22e117ed8fe463db2005702f26336f5ce749dd0284b4bb3c64'));
    for (const filename of nativePaths) {
        const receipt = r1Receipts[filename];
        const snapshot = admission.admittedState(receipt, legacy.records[filename], { read, now: new Date() });
        assert.equal(receipt.review.actor_type, 'agent');
        assert.equal(Object.hasOwn(receipt.review, 'human_approved'), false);
        assert.equal(receipt.review.packet_sha256, admission.packetDigest(receipt));
        assert.equal(receipt.record_sha256, snapshot.sha256);
        assert.equal(receipt.baseline_sha256, legacy.records[filename].sha256);
        assert.deepEqual(Object.keys(receipt.units).sort(), [
            'section:Statute Anchors/text', 'section:Summary/text', 'section:What Counts/text', 'section:What Does Not Count/text'
        ]);
        for (const [key, unit] of Object.entries(receipt.units)) {
            assert.equal(unit.before_sha256, legacy.records[filename].units[key]);
            assert.equal(unit.after_sha256, snapshot.units[key]);
            assert.equal(admission.digest(unit.candidate_content), snapshot.units[key]);
        }
    }
    const result = admissionCheck.runCurrent({ root: ROOT });
    assert.equal(result.status, 'passed', result.errors.join('\n'));
});

test('SB226 R1 admission fails closed for unreviewed wording or altered retained evidence', () => {
    const filename = nativePaths[0];
    const options = {
        current: { [filename]: admission.nativeSnapshot(filename, read(filename)) },
        legacy: { ...legacy, records: { [filename]: legacy.records[filename] } },
        admissions: { ...receipts, records: { [filename]: receipts.records[filename] } },
        read
    };
    const changed = admission.validateAdmission({
        ...options,
        current: { [filename]: admission.nativeSnapshot(filename, Buffer.from(native[0].replace('generative artificial intelligence and not a human', 'not a human'))) }
    });
    assert.equal(changed.status, 'failed');
    assert.match(changed.errors.join('\n'), /Receipt is stale for current record/);
    const alteredSource = admission.validateAdmission({
        ...options,
        read: candidate => candidate === sourcePath ? Buffer.concat([read(candidate), Buffer.from('\nChanged source\n')]) : read(candidate)
    });
    assert.equal(alteredSource.status, 'failed');
    assert.match(alteredSource.errors.join('\n'), /Reviewed source snapshot changed/);
});
