#!/usr/bin/env node
'use strict';

const path = require('path');
const {
    DOCS_DIR,
    loadProjectData,
    readJson,
    findRecordJsonFiles,
    reportFailures
} = require('./lib/eval-kit');

const project = loadProjectData();
const schema = readJson(path.join(DOCS_DIR, 'schema', 'json', 'record.schema.json'));
const failures = [];
const recordSchema = schema.properties?.record?.properties || {};

const configStatuses = new Set((project.config.entities?.container?.statuses || []).map(s => s.name));
const schemaStatuses = new Set(recordSchema.status?.enum || []);
for (const status of configStatuses) {
    if (!schemaStatuses.has(status)) failures.push(`schema missing configured status "${status}"`);
}
for (const status of schemaStatuses) {
    if (!configStatuses.has(status)) failures.push(`schema status "${status}" not present in project.yml container status vocabulary`);
}

const configTypes = new Set(Object.keys(project.config.hierarchy?.type_segments || {}));
const schemaTypes = new Set(recordSchema.type?.enum || []);
const recordTypes = new Set();

for (const file of findRecordJsonFiles()) {
    const payload = readJson(file);
    if (payload.record?.type) recordTypes.add(payload.record.type);
}

for (const type of configTypes) {
    if (!recordTypes.has(type)) failures.push(`configured type "${type}" is not emitted by any record.json`);
}
for (const type of recordTypes) {
    if (!schemaTypes.has(type)) failures.push(`schema type enum missing emitted record type "${type}"`);
}
for (const type of schemaTypes) {
    if (!configTypes.has(type) && !recordTypes.has(type)) failures.push(`schema type "${type}" is not present in config or generated records`);
}

reportFailures('eval-schema-parity', failures);
