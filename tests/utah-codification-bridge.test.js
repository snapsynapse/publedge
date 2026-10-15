'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const a = require('../scripts/lib/source-admission');
const ROOT = path.join(__dirname, '..');
const BASE = 'd3ee6947a0f479d93f614c38b6cbe8ecc634609b';
const read = f => fs.readFileSync(path.join(ROOT, f));
const before = f => execFileSync('git', ['show', `${BASE}:${f}`], { cwd: ROOT });
const report = JSON.parse(read('ops/evidence/utah-codification-unit-dispositions-2026-10-15.json'));
const receipts = JSON.parse(read('data/admission/receipts.json')).records;
const prior = JSON.parse(before('data/admission/receipts.json')).records;
const files = report.records.map(r => r.file);

test('bridge preserves all prior receipts and unknowns, and changes only the declared native units', () => {
    for (const [file, receipt] of Object.entries(prior)) {
        assert.ok(a.receiptLineage(receipts[file]).some(entry => a.digest(entry) === a.digest(receipt)), file);
        if (!files.includes(file)) assert.deepEqual(receipts[file], receipt, file);
    }
    const allowed = {
        'data/examples/instruments/us-ut-legislature-statute-2025-sb226.md': ['metadata:statute_anchors', 'section:Summary/subsection:Sources/text', 'section:Summary/subsection:Codification bridge (selected sources)/text'],
        'data/examples/obligations/disclose-genai-on-request.md': ['section:Summary/text', 'section:What Does Not Count/text', 'section:Statute Anchors/text'],
        'data/examples/obligations/disclose-genai-high-risk-proactive.md': ['section:Summary/text', 'section:What Does Not Count/text', 'section:Statute Anchors/text'],
        'data/examples/obligations/disclose-genai-on-first-session.md': ['section:Summary/text', 'section:What Counts/text', 'section:Statute Anchors/text', 'section:Statute Anchors/subsection:Codification bridge (selected sources)/text'],
        'data/examples/obligations/ai-defense-elimination.md': ['section:What Counts/text', 'section:Statute Anchors/text', 'section:Statute Anchors/subsection:Codification bridge (selected sources)/text'],
        'data/examples/mapping/index.yml': ['entry:sb226-disclosure-and-ai-defense', 'entry:hb452-mental-health-chatbot-stack']
    };
    for (const file of files) {
        const old = a.nativeSnapshot(file, before(file)), current = a.nativeSnapshot(file, read(file));
        const changed = [...new Set([...Object.keys(old.units), ...Object.keys(current.units)])].filter(k => old.units[k]?.sha256 !== current.units[k]?.sha256).sort();
        assert.deepEqual(changed, allowed[file].slice().sort(), file);
        const receipt = receipts[file];
        assert.equal(receipt.review.actor_type, 'agent');
        assert.equal(receipt.review.human_approved, undefined);
        for (const unknown of prior[file].unresolved) assert.ok(receipt.unresolved.includes(unknown), unknown);
        for (const key of Object.keys(current.metadata)) if (key !== 'statute_anchors') assert.deepEqual(current.metadata[key], old.metadata[key], `${file}:${key}`);
    }
    assert.equal(a.hash(read('data/admission/sources/utah-sb226/SB0226-enrolled.pdf')), '279184eb1ee69adb7c9ada3e29763f9766b0705c87770b6330c13bada07c60e8');
    assert.equal(a.hash(read('data/admission/sources/utah-sb226/SB0226-enrolled.txt')), '088cb7315787b8f1a2c999ab3cdf9527b10eae034d032c7912ad6530441f08d7');
});

test('bridge binds current selectors and original source bytes without applying the future Division version', () => {
    const p = 'data/admission/sources/utah-sb226/2026-10-15/';
    assert.match(read(p+'chapter77-index.html').toString(), /C13-77_2025050820250508.html','Current Version'/);
    assert.match(read(p+'13-77-102-selector.html').toString(), /C13-77-S102_2026050620260506.html','Current Version'/);
    const selector = read(p+'13-2-102-selector.html').toString();
    assert.match(selector, /C13-2-S102_2026050620260701.html','Current Version'/);
    assert.match(selector, /C13-2-S102_2026050620270101.html','Effective 1\/1\/2027'/);
    assert.match(read(p+'13-2-102-body.txt').toString(), /Effective 7\/1\/2026/);
    const file = files[0];
    const options = { current: { [file]: a.nativeSnapshot(file, read(file)) }, legacy: { ...JSON.parse(read('data/admission/legacy.json')), records: { [file]: JSON.parse(read('data/admission/legacy.json')).records[file] } }, admissions: { ...JSON.parse(read('data/admission/receipts.json')), records: { [file]: receipts[file] } }, read };
    const altered = a.validateAdmission({ ...options, read: f => f === p+'chapter77.pdf' ? Buffer.concat([read(f), Buffer.from('tampered')]) : read(f) });
    assert.equal(altered.status, 'failed');
    assert.match(altered.errors.join('\n'), /Original source bytes changed/);
});

test('bridge retains historical numbering and source limits alongside generated current disclosure citations', () => {
    const instrument = read(files[0]).toString();
    const html = read('docs/us/utah/legislature/statute/2025-001/index.html').toString();
    assert.match(html, /id="codification-bridge"/);
    assert.match(html, /future January 1, 2027 version/);
    assert.match(html, /13-75-103 in enrolled SB 226 corresponds to current §13-77-103/);
    for (const slug of ['ai-defense-elimination', 'disclose-genai-on-first-session']) assert.match(read('docs/primary/'+slug+'/index.html').toString(), /id="codification-bridge"/);
    assert.match(instrument, /retained 2025 enrolled SB 226, not independently validated current codification/);
    assert.match(instrument, /full history or effective date of the Chapter 75-to-77 editorial numbering/);
    assert.match(instrument, /future January 1, 2027 version, which this review does not apply/);
    for (const slug of ['disclose-genai-on-request', 'disclose-genai-high-risk-proactive']) {
        const generated = JSON.parse(read('docs/obligation/sb226-disclosure-and-ai-defense-'+slug+'.json'));
        assert.match(generated.content, /§13-77-103/);
        assert.match(generated.content, /remain unverified/);
        assert.equal(generated.verified, '2026-04-21');
    }
});
