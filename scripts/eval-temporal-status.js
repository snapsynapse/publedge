#!/usr/bin/env node
'use strict';

const { loadProjectData, reportFailures } = require('./lib/eval-kit');
const { temporalStatusFailures } = require('./lib/temporal-status');

const project = loadProjectData();
const failures = [];
const today = process.env.PUBLEDGE_EVAL_DATE || new Date().toISOString().slice(0, 10);

for (const record of project.containers) {
    failures.push(...temporalStatusFailures(record, today));
}

reportFailures('eval-temporal-status', failures);
