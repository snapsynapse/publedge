#!/usr/bin/env node
'use strict';

const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const {
    DOCS_DIR,
    readJson,
    findRecordJsonFiles,
    reportFailures
} = require('./lib/eval-kit');

function createGeneratedRecordValidator(schema) {
    const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false, allowUnionTypes: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    return value => {
        if (validate(value)) return [];
        return (validate.errors || []).map(error =>
            `${error.instancePath || '/'} ${error.message}`
        );
    };
}

function run() {
    const schema = readJson(path.join(DOCS_DIR, 'schema', 'json', 'record.schema.json'));
    const validateGeneratedRecord = createGeneratedRecordValidator(schema);
    const failures = [];
    for (const file of findRecordJsonFiles()) {
        const payload = readJson(file);
        const itemFailures = validateGeneratedRecord(payload);
        if (itemFailures.length) {
            failures.push(`${path.relative(DOCS_DIR, file)}\n  ${itemFailures.join('\n  ')}`);
        }
    }
    reportFailures('eval-record-schema', failures);
}

if (require.main === module) run();
module.exports = { createGeneratedRecordValidator, run };
