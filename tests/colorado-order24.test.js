'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { parseFrontmatter } = require('../scripts/lib/parse');

const ROOT = path.join(__dirname, '..');
const nativePath = path.join(ROOT, 'data/examples/instruments/us-co-legislature-statute-2024-sb24-205.md');
const pdfPath = path.join(ROOT, 'data/admission/sources/colorado-sb24-205/xai-weiser-ecf-24-2026-04-27.pdf');
const textPath = path.join(ROOT, 'data/admission/sources/colorado-sb24-205/xai-weiser-ecf-24-2026-04-27.txt');
const native = fs.readFileSync(nativePath, 'utf8');
const frontmatter = parseFrontmatter(native).frontmatter;

test('retained ECF 24 binds the violation-occurrence cutoff without current-status promotion', () => {
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(pdfPath)).digest('hex'), '59fc68432753abc356065683a23379d0378fbecb811ec30105ca7d28a293587d');
    const order = fs.readFileSync(textPath, 'utf8');
    assert.match(order, /for alleged violations of SB24-205[\s\S]*that occurred or may occur[\s\S]*on or before 14 days after/);
    assert.match(native, /cutoff concerns the occurrence of the alleged violation, not merely the initiation date of enforcement/);
    assert.match(native, /requires xAI to submit its motion within 28 days after final adoption of rulemaking implementing SB 24-205 or legislation that may replace or amend it/);
    assert.match(native, /Public docket completeness, final implementing rules, any preliminary-injunction filing or ruling, and the order's current continued effect remain unknown/);
    assert.equal(frontmatter.status, 'superseded');
    assert.equal(frontmatter.lifecycle_status, 'repealed');
    assert.equal(frontmatter.operative_status, 'unknown');
    assert.equal(frontmatter.enforcement_status, 'unknown');
    assert.equal(frontmatter.effective, '2026-06-30');
    assert.equal(frontmatter.last_verified, '2026-07-25');
});

test('generated native and OF surfaces preserve the same qualified order meaning without source-byte publication', () => {
    const record = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/us/colorado/legislature/statute/2024-001/record.json'), 'utf8'));
    const ofRecord = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/instrument/us-co-legislature-statute-2024-sb24-205.json'), 'utf8'));
    const orderEvent = record.record.timeline.find(event => event.milestone === 'Conditional enforcement restraint (ECF 24)');
    assert.match(orderEvent.notes, /for alleged violations occurring through 14 days after a future preliminary-injunction ruling/);
    assert.match(orderEvent.notes, /xAI's motion is due within 28 days after final rulemaking implementing SB 24-205 or legislation that may replace or amend it/);
    assert.match(ofRecord.notes, /cutoff concerns when the alleged violation occurred, not merely when enforcement begins/);
    assert.equal(ofRecord.verified, '2026-07-25');
    assert.equal(ofRecord.lifecycle_status, 'repealed');
    assert.equal(ofRecord.operative_status, 'unknown');
    assert.equal(ofRecord.enforcement_status, 'unknown');
    const derivedFiles = fs.readdirSync(path.join(ROOT, 'docs/api/v1/of/records')).filter(name => name === 'sb24-205-never-operative-obligations.json' || name.startsWith('sb24-205-never-operative-obligations-'));
    assert.equal(derivedFiles.length, 4);
    for (const file of derivedFiles) {
        const derived = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/api/v1/of/records', file), 'utf8'));
        assert.equal(derived.operative_status, 'unknown', file);
        assert.equal(derived.enforcement_status, 'unknown', file);
    }
    assert.equal(fs.existsSync(path.join(ROOT, 'docs/data/admission/sources/colorado-sb24-205')), false);
    const packageFiles = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).files;
    assert.equal(packageFiles.some(entry => entry === 'data' || entry.startsWith('data/admission')), false);
});
