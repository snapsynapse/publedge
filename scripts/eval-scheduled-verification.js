#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, reportFailures } = require('./lib/eval-kit');

const workflowPath = path.join(ROOT, '.github', 'workflows', 'verify.yml');
const workflow = fs.readFileSync(workflowPath, 'utf8');
const failures = [];

function requireText(text, message) {
    if (!workflow.includes(text)) failures.push(message);
}

requireText('run: npm ci', 'scheduled verification must install pinned dependencies with npm ci');
requireText('npm run verify', 'scheduled verification must run the knowledge verifier');
requireText('verify_exit=$?', 'scheduled verification must collect the knowledge verifier exit code directly');
requireText('npm run eval:temporal-status', 'scheduled verification must run the temporal-status evaluator');
requireText('temporal_exit=$?', 'scheduled verification must collect the temporal-status exit code directly');
requireText(
    'if [ "$verify_exit" -ne 0 ] || [ "$temporal_exit" -ne 0 ]; then',
    'scheduled verification must report failure when either independent check fails'
);
requireText('echo "exit_code=1" >> "$GITHUB_OUTPUT"', 'scheduled verification must expose a combined failure output');

if (/npm run (?:verify|eval:temporal-status)[^\n]*\|\s*tee/.test(workflow)) {
    failures.push('scheduled verification must not collect a pipeline exit code from tee');
}

const verifyRun = workflow.indexOf('npm run verify');
const verifyExit = workflow.indexOf('verify_exit=$?');
const temporalRun = workflow.indexOf('npm run eval:temporal-status');
const temporalExit = workflow.indexOf('temporal_exit=$?');
if (!(verifyRun < verifyExit && verifyExit < temporalRun && temporalRun < temporalExit)) {
    failures.push('scheduled verification must capture each command status before starting the next check');
}

reportFailures('eval-scheduled-verification', failures);
