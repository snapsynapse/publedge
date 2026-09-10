'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { createGeneratedRecordValidator } = require('../scripts/eval-record-schema');

const ROOT = path.join(__dirname, '..');
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/schema/json/record.schema.json'), 'utf8'));
const validateGeneratedRecord = createGeneratedRecordValidator(schema);
const sample = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'docs/us/utah/oaip/rma/2024-001/record.json'),
    'utf8'
));

test('generated-record validation enforces actual JSON Schema formats', () => {
    const mutated = structuredClone(sample);
    mutated.meta.generated = 'not-a-date-time';
    mutated.record.url = 'not-a-uri';
    const failures = validateGeneratedRecord(mutated);
    assert.ok(failures.some(message => message.includes('/meta/generated')), failures.join('\n'));
    assert.ok(failures.some(message => message.includes('/record/url')), failures.join('\n'));
});

test('generated record schema rejects a promoted, issued-looking, or relabelled PubLedge original draft', () => {
    const draft = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/us/utah/oaip/jia/2026-001/record.json'), 'utf8'));
    assert.equal(draft.record.source, 'publedge-original-draft');
    assert.deepEqual(validateGeneratedRecord(draft), []);
    const mutations = {
        'status enforcing': record => { record.status = 'enforcing'; },
        'status enacted and editorial published': record => { record.status = 'enacted'; record.editorial_status = 'published'; },
        'proposed but carrying issuance fields': record => { record.issuance_event = 'Signed by OAIP'; record.enacted = '2026-09-01'; },
        'relabelled authority-issued and enforcing without evidence': record => { record.source = 'authority-issued'; record.status = 'enforcing'; record.editorial_status = 'published'; }
    };
    for (const [name, mutate] of Object.entries(mutations)) {
        const mutated = structuredClone(draft);
        mutate(mutated.record);
        assert.ok(validateGeneratedRecord(mutated).length, `${name} must fail the generated record schema`);
    }
    const remap = structuredClone(sample);
    remap.record.source = 'authority-issued';
    remap.record.status = 'enforcing';
    remap.record.editorial_status = 'published';
    remap.record.official_url = null;
    remap.record.source_documents = [];
    remap.record.authority_response = null;
    assert.ok(validateGeneratedRecord(remap).some(message => /official_url|source_documents/.test(message)));
});
