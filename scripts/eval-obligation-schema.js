#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const { parseFrontmatter } = require('./lib/parse');
const { loadProjectData, reportFailures } = require('./lib/eval-kit');

const ROOT = path.join(__dirname, '..');
const project = loadProjectData();
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'schema', 'obligation-record.schema.json'), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false, allowUnionTypes: true });
addFormats(ajv);
const validate = ajv.compile(schema);
const failures = [];
const observedLifecycleStatuses = new Set();
const containersById = new Map(project.containers.map(record => [record.id, record]));

for (const filename of fs.readdirSync(project.dirs.primaryDir).filter(name => name.endsWith('.md')).sort()) {
    const content = fs.readFileSync(path.join(project.dirs.primaryDir, filename), 'utf8');
    const record = parseFrontmatter(content).frontmatter;
    if (record.lifecycle_status) observedLifecycleStatuses.add(record.lifecycle_status);
    if (!validate(record)) {
        const details = (validate.errors || []).map(error => {
            const location = error.instancePath || '/';
            return `${location} ${error.message}`;
        });
        failures.push(`${filename}\n  ${details.join('\n  ')}`);
    }

    const implementingStatuses = project.mappings
        .filter(mapping => mapping.obligations.includes(record.id))
        .map(mapping => containersById.get(mapping.regulation)?.status)
        .filter(Boolean);
    const activeImplementations = implementingStatuses.filter(status =>
        status === 'enforcing' || status === 'phased-enforcement'
    );
    const prospectiveImplementations = implementingStatuses.filter(status => status === 'enacted');
    if (record.lifecycle_status === 'operative' && activeImplementations.length === 0) {
        failures.push(`${filename} is operative but has no enforcing implementation`);
    }
    if (record.lifecycle_status === 'prospective' && prospectiveImplementations.length === 0) {
        failures.push(`${filename} is prospective but has no enacted implementation awaiting effect`);
    }
    if (record.lifecycle_status === 'expired' &&
        (implementingStatuses.length === 0 || implementingStatuses.some(status => status !== 'expired'))) {
        failures.push(`${filename} is expired but not all implementations are expired`);
    }
    if (record.lifecycle_status === 'never-operative' &&
        (implementingStatuses.length === 0 || implementingStatuses.some(status => status !== 'superseded'))) {
        failures.push(`${filename} is never-operative but not all implementations are superseded`);
    }
}

const configStatuses = new Set(project.config.entities?.primary?.lifecycle_statuses || []);
const schemaStatuses = new Set(schema.properties?.lifecycle_status?.enum || []);
for (const status of configStatuses) {
    if (!schemaStatuses.has(status)) failures.push(`schema missing configured lifecycle status "${status}"`);
}
for (const status of schemaStatuses) {
    if (!configStatuses.has(status)) failures.push(`schema lifecycle status "${status}" missing from project.yml`);
}
for (const status of observedLifecycleStatuses) {
    if (!configStatuses.has(status)) failures.push(`record uses unconfigured lifecycle status "${status}"`);
}

// F14: exact predecessor identities replace a count that baked in unverified history.
for (const id of ['high-risk-ai-impact-assessment', 'high-risk-ai-consumer-notice-correction-and-appeal', 'high-risk-ai-reasonable-care-against-algorithmic-discrimination']) {
    const record = project.primaries.find(item => item.id === id);
    if (!record || record.lifecycle_status !== 'superseded' || !record._body.includes('operative history remains unresolved')) {
        failures.push(`${id}: expected superseded lifecycle with unresolved operative history`);
    }
}

reportFailures('eval-obligation-schema', failures);
