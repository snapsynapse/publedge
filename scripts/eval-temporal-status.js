#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, loadProjectData, reportFailures } = require('./lib/eval-kit');
const { temporalStatusFailures } = require('./lib/temporal-status');

const project = loadProjectData();
const failures = [];
const today = process.env.PUBLEDGE_EVAL_DATE || new Date().toISOString().slice(0, 10);
const exists = relative => !path.isAbsolute(relative) && !relative.split(/[\\/]/).includes('..') &&
    fs.existsSync(path.join(ROOT, relative));

for (const record of project.containers) {
    failures.push(...temporalStatusFailures(record, today, { exists }));
}
for (const record of project.containers.filter(item => item.status === 'unresolved')) {
    const block = record.status_unresolved || {};
    console.log(`eval-temporal-status: UNRESOLVED ${record.id} since ${block.since}; last checked ${block.last_checked}; ${block.question}`);
}

reportFailures('eval-temporal-status', failures);
