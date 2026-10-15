'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { parseFrontmatter } = require('../scripts/lib/parse');
const { parseMappingIndex } = require('../scripts/lib/mapping');
const admission = require('../scripts/lib/source-admission');
const ROOT = path.join(__dirname, '..');
const BASE = 'ef3ce5fae6aa4e8c255d1a21a7c0c04a859ca03e';
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const before = file => execFileSync('git', ['show', `${BASE}:${file}`], { cwd: ROOT, encoding: 'utf8' });
const names = ['data/examples/instruments/us-ut-legislature-statute-2025-hb452.md', 'data/examples/obligations/disclose-genai-on-first-session.md', 'data/examples/obligations/chatbot-data-no-third-party-sharing.md'];

test('HB452 keeps human dates, native identities and unrelated clauses/mappings intact', () => {
    for (const name of names) assert.deepEqual(parseFrontmatter(read(name)).frontmatter, parseFrontmatter(before(name)).frontmatter);
    const summary = text => text.split('## Summary\n\n')[1].split('\n### Talking Point')[0].split('\n');
    const unrelated = text => summary(text).filter(line => !line.startsWith('- **Pre-access') && !line.startsWith('- **Data protection'));
    assert.deepEqual(unrelated(read(names[0])), unrelated(before(names[0])));
    assert.equal(read('data/examples/obligations/chatbot-safety-policy-filing.md'), before('data/examples/obligations/chatbot-safety-policy-filing.md'));
    const mapping = 'data/examples/mapping/index.yml';
    const current = parseMappingIndex(read(mapping)), old = parseMappingIndex(before(mapping));
    assert.deepEqual(current.map(({ obligation_qualification, ...entry }) => entry), old.map(({ obligation_qualification, ...entry }) => entry));
    assert.deepEqual(current.filter(entry => entry.id !== 'hb452-mental-health-chatbot-stack'), old.filter(entry => entry.id !== 'hb452-mental-health-chatbot-stack'));
});

test('HB452 new reviews retain exact predecessors and frozen originals', () => {
    const current = JSON.parse(read('data/admission/receipts.json')).records;
    const old = JSON.parse(before('data/admission/receipts.json')).records;
    for (const [file, receipt] of Object.entries(old)) {
        assert.ok(admission.receiptLineage(current[file]).some(entry => admission.digest(entry) === admission.digest(receipt)), file);
        if (![names[0], names[1], 'data/examples/mapping/index.yml'].includes(file)) assert.deepEqual(current[file], receipt);
    }
    for (const name of [...names, 'data/examples/mapping/index.yml']) {
        assert.equal(current[name].review.actor_type, 'agent');
        assert.equal(current[name].review.human_approved, undefined);
        if (old[name]) for (const unknown of old[name].unresolved) assert.ok(current[name].unresolved.includes(unknown));
    }
    assert.equal(admission.hash(Buffer.from(read('data/admission/sources/utah-hb452/HB0452-enrolled.txt'))), '1223a7bd0156baa3d35ce2f93e71df811de442c5e12e4535caceb332595db481');
    assert.equal(admission.hash(fs.readFileSync(path.join(ROOT, 'data/admission/sources/utah-hb452/HB0452-enrolled.pdf'))), '4a46dfa2524603d0ae5b90b9941c755206c19b16b269add496f55191749c4e9f');
});

test('HB452 disclosure distinguishes absence of access, prompts and the unissued proposal', () => {
    const disclosure = read(names[1]);
    assert.match(disclosure, /has not accessed it within the previous seven days/);
    assert.match(disclosure, /asks or otherwise prompts it about whether AI is being used/);
    assert.doesNotMatch(disclosure, /or after a fixed inactivity period/);
    assert.match(disclosure, /statutory seven-day absence-of-access condition remains distinct/);
    const mapping = parseMappingIndex(read('data/examples/mapping/index.yml')).find(entry => entry.id === 'hb452-mental-health-chatbot-stack');
    assert.match(mapping.obligation_qualification, /30-minute re-display condition belongs to the unissued JIA proposal/);
    assert.doesNotMatch(mapping.obligation_qualification, /the obligation's per-session/);
});

test('HB452 generated data restriction carries both protected objects and all functionality conditions', () => {
    const record = JSON.parse(read('docs/obligation/hb452-mental-health-chatbot-stack-chatbot-data-no-third-party-sharing.json'));
    assert.equal(record['@type'], 'of:Restriction');
    for (const clause of ["health information or user input", "exceptions concern individually identifiable health information", "a health care provider requests it with the Utah user's consent", "user's health plan upon the user's request", "necessary for the chatbot's effective functionality", "contract related to that functionality", 'Both parties must comply', 'covered entity', 'business associate', 'not a general consent exception for all user input']) assert.ok(record.content.includes(clause), clause);
    assert.equal(record.verified, '2026-04-21');
    assert.equal(record.lifecycle_status, 'unknown');
    assert.equal(record['pub:evidence_inputs'].find(input => input.kind === 'obligation-definition').admission_status, 'reviewed-changes');
    const data = read(names[2]);
    assert.match(data, /whether particular transformed data remain within either protected object requires evidence and is unresolved here/);
    assert.doesNotMatch(data, /Subprocessor arrangements where the subprocessor operates under HIPAA-equivalent obligations/);
});
