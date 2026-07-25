#!/usr/bin/env node
'use strict';

const { loadProjectData, reportFailures } = require('./lib/eval-kit');

const project = loadProjectData();
const failures = [];
const today = process.env.PUBLEDGE_EVAL_DATE || new Date().toISOString().slice(0, 10);
const activeStatuses = new Set(['enforcing', 'phased-enforcement']);

function isIsoDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

for (const record of project.containers) {
    if (activeStatuses.has(record.status) && isIsoDate(record.effective) && record.effective > today) {
        failures.push(`${record.id} is ${record.status} before its effective date ${record.effective}`);
    }
    if (activeStatuses.has(record.status) && isIsoDate(record.term_end) && record.term_end < today) {
        failures.push(`${record.id} is ${record.status} after its term ended ${record.term_end}`);
    }
    if (record.status === 'enacted' &&
        isIsoDate(record.effective) &&
        record.effective <= today &&
        !record.commencement_date_trigger) {
        failures.push(`${record.id} remains enacted after its effective date ${record.effective}`);
    }
}

reportFailures('eval-temporal-status', failures);
