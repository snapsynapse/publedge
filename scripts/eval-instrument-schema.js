#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const { parseFrontmatter } = require('./lib/parse');
const { reportFailures } = require('./lib/eval-kit');

const ROOT = path.join(__dirname, '..');
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'schema', 'instrument.schema.json'), 'utf8'));
const instrumentsDir = path.join(ROOT, 'data', 'examples', 'instruments');
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false, allowUnionTypes: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const failures = [];

for (const filename of fs.readdirSync(instrumentsDir).filter(name => name.endsWith('.md')).sort()) {
    const content = fs.readFileSync(path.join(instrumentsDir, filename), 'utf8');
    const record = parseFrontmatter(content).frontmatter;
    if (!validate(record)) {
        const details = (validate.errors || []).map(error => {
            const location = error.instancePath || '/';
            return `${location} ${error.message}`;
        });
        failures.push(`${filename}\n  ${details.join('\n  ')}`);
    }
}

reportFailures('eval-instrument-schema', failures);
