#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { reportFailures } = require('./lib/eval-kit');

const root = path.join(__dirname, '..');
const workflow = fs.readFileSync(path.join(root, '.github', 'workflows', 'build.yml'), 'utf8');
const verifier = fs.readFileSync(path.join(root, 'scripts', 'verify-ci.js'), 'utf8');
const attributes = fs.readFileSync(path.join(root, '.gitattributes'), 'utf8');
const failures = [];

if (!workflow.includes('run: npm ci')) failures.push('build workflow must install the project with npm ci');
if (/run: npm install(?:\s|$)/m.test(workflow)) failures.push('build workflow must not use npm install');
if (!workflow.includes('run: npm run verify:ci')) failures.push('build workflow must invoke npm run verify:ci');
if (!workflow.includes('CHECK_OF_REQUIRED: "1"')) failures.push('build workflow must make Obligation-First discovery fail closed');
if (!workflow.includes('SOURCE_ADMISSION_BASE:')) failures.push('build workflow must bind admission history to the PR base or prior push head');
if ((workflow.match(/fetch-depth: 0/g) || []).length < 2) failures.push('build and a11y jobs must fetch admission history');
if (!workflow.includes("github.event.pull_request.base.sha") || !workflow.includes("github.event.before")) failures.push('admission base must cover pull requests and pushes');
for (const gate of ['check:of', 'validate:of', 'check:of-continuity', 'evals', "'diff', '--check'", "'diff', '--exit-code'"]) {
    if (!verifier.includes(gate)) failures.push(`verify-ci.js omits ${gate}`);
}
if (!verifier.includes("['bash', ['scripts/validate-hashes.sh']]")) {
    failures.push('verify-ci.js must invoke the Bash-only hash validator with bash');
}
if (verifier.includes("['sh', ['scripts/validate-hashes.sh']]")) {
    failures.push('verify-ci.js must not invoke the Bash-only hash validator with POSIX sh');
}
if (!attributes.includes('docs/calendar.ics') || !attributes.includes('cr-at-eol')) {
    failures.push('.gitattributes must preserve strict whitespace checking while accepting calendar CRLF');
}

reportFailures('eval-workflow-invariants', failures);
