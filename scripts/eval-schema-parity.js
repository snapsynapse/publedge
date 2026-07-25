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
const instrumentSchema = readJson(path.join(__dirname, '..', 'schema', 'instrument.schema.json'));
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

const instrumentStatuses = new Set(instrumentSchema.properties?.status?.enum || []);
for (const status of configStatuses) {
    if (!instrumentStatuses.has(status)) failures.push(`instrument schema missing configured legal status "${status}"`);
}
for (const status of instrumentStatuses) {
    if (!configStatuses.has(status)) failures.push(`instrument schema legal status "${status}" is not configured`);
}

const configEditorialStatuses = new Set(project.config.entities?.container?.editorial_statuses || []);
const instrumentEditorialStatuses = new Set(instrumentSchema.properties?.editorial_status?.enum || []);
const recordEditorialStatuses = new Set(recordSchema.editorial_status?.enum || []);
for (const status of configEditorialStatuses) {
    if (!instrumentEditorialStatuses.has(status)) failures.push(`instrument schema missing configured editorial status "${status}"`);
    if (!recordEditorialStatuses.has(status)) failures.push(`record schema missing configured editorial status "${status}"`);
}
for (const status of instrumentEditorialStatuses) {
    if (!configEditorialStatuses.has(status)) failures.push(`instrument schema editorial status "${status}" is not configured`);
}
for (const status of recordEditorialStatuses) {
    if (!configEditorialStatuses.has(status)) failures.push(`record schema editorial status "${status}" is not configured`);
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
