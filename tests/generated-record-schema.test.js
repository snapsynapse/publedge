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
