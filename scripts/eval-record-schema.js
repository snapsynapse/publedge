#!/usr/bin/env node
'use strict';

const path = require('path');
const {
    DOCS_DIR,
    readJson,
    findRecordJsonFiles,
    reportFailures
} = require('./lib/eval-kit');

function validate(schema, value, pointer, failures) {
    if (schema.required && typeof value === 'object' && value && !Array.isArray(value)) {
        for (const key of schema.required) {
            if (!(key in value)) failures.push(`${pointer || '/'} missing required property "${key}"`);
        }
    }

    let matchesDeclaredType = true;

    if (schema.type) {
        const actualType = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
        const allowedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
        matchesDeclaredType = allowedTypes.includes(actualType);
        if (!matchesDeclaredType) {
            failures.push(`${pointer || '/'} expected type ${allowedTypes.join(', ')} but found ${actualType}`);
            return;
        }
    }

    if (schema.enum && !schema.enum.includes(value)) {
        failures.push(`${pointer || '/'} expected one of ${schema.enum.join(', ')} but found ${JSON.stringify(value)}`);
    }

    const allowsObject = schema.type === 'object' || (Array.isArray(schema.type) && schema.type.includes('object'));
    if (allowsObject && schema.properties && value && typeof value === 'object' && !Array.isArray(value)) {
        for (const [key, subSchema] of Object.entries(schema.properties)) {
            if (key in value) validate(subSchema, value[key], `${pointer}/${key}`, failures);
        }
    }

    const allowsArray = schema.type === 'array' || (Array.isArray(schema.type) && schema.type.includes('array'));
    if (allowsArray && schema.items && Array.isArray(value)) {
        value.forEach((item, index) => validate(schema.items, item, `${pointer}/${index}`, failures));
    }
}

const schema = readJson(path.join(DOCS_DIR, 'schema', 'json', 'record.schema.json'));
const failures = [];

for (const file of findRecordJsonFiles()) {
    const payload = readJson(file);
    const itemFailures = [];
    validate(schema, payload, '', itemFailures);
    if (itemFailures.length) {
        failures.push(`${path.relative(DOCS_DIR, file)}\n  ${itemFailures.join('\n  ')}`);
    }
}

reportFailures('eval-record-schema', failures);
