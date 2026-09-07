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

function requirePattern(pattern, message) {
    if (!pattern.test(workflow)) failures.push(message);
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
requireText('timeout-minutes: 15', 'scheduled verification must have a bounded job timeout');
requireText('group: scheduled-verification', 'scheduled verification must serialize overlapping runs');
requireText('cancel-in-progress: false', 'scheduled verification must not discard an earlier scheduled run');
requireText('persist-credentials: false', 'scheduled verification checkout must not retain write credentials');
requireText('uses: actions/upload-artifact@v4', 'scheduled verification must retain verifier evidence as an artifact');
requireText('retention-days: 14', 'scheduled verification evidence must have a bounded retention period');
requireText('TITLE="Knowledge drift detected"', 'drift issue identity must use a stable title without a run date');
requireText('<elapsed-days>', 'drift fingerprint must normalize elapsed age counters only');
requireText('last verified ', 'drift fingerprint must preserve record dates and cadence around normalized ages');
requireText('<npm-runner-metadata>', 'drift fingerprint must normalize incidental npm runner metadata');
requireText('scheduled-verification-report:', 'drift comments must carry a deterministic report marker');
requireText('number,title,createdAt', 'drift issue lookup must consider legacy labeled issues');
requireText('sort_by(.createdAt)', 'drift issue lookup must choose a deterministic oldest issue');
requireText('repos/${GITHUB_REPOSITORY}/issues/${EXISTING}" --jq \'.body\'', 'drift deduplication must inspect the existing issue body');
requireText('gh api --paginate', 'drift comment deduplication must inspect GitHub issue comments');
requireText('cat existing-issue-body.txt issue-comments.txt > issue-evidence.txt', 'drift deduplication must combine issue-body and comment evidence');
requireText('grep -Fqx "$REPORT_MARKER" issue-evidence.txt', 'drift comment deduplication must match the exact report marker');
requireText('ACTION="deduplicated"', 'identical report evidence must not add a duplicate issue comment');
requireText('gh issue edit "$EXISTING" --title "$TITLE"', 'legacy drift issues must migrate to the stable issue title');
requireText('Email: not_configured. Human receipt: unconfirmed.', 'receipt summary must state that human receipt is unconfirmed');
requireText('if [ "$VERIFY_EXIT" != "0" ]; then', 'a final gate must fail when either verification check failed');
requireText('exit 1', 'the final verification gate must exit nonzero on failed checks');

if (/npm run (?:verify|eval:temporal-status)[^\n]*\|\s*tee/.test(workflow)) {
    failures.push('scheduled verification must not collect a pipeline exit code from tee');
}

if (/TITLE=.*\$\(date|gh issue close|state[:= ]+closed/i.test(workflow)) {
    failures.push('scheduled verification must not date-shard or automatically close the stable drift issue');
}

if (/gh (?:issue list|api)[^\n]*(?:\|\||&&)\s*true/.test(workflow)) {
    failures.push('scheduled verification must not ignore GitHub issue or comment query failures');
}

const verifyRun = workflow.indexOf('npm run verify');
const verifyExit = workflow.indexOf('verify_exit=$?');
const temporalRun = workflow.indexOf('npm run eval:temporal-status');
const temporalExit = workflow.indexOf('temporal_exit=$?');
if (!(verifyRun < verifyExit && verifyExit < temporalRun && temporalRun < temporalExit)) {
    failures.push('scheduled verification must capture each command status before starting the next check');
}

const artifact = workflow.indexOf('- name: Upload verification evidence');
const issue = workflow.indexOf('- name: Open or update drift issue');
const receipt = workflow.indexOf('- name: Summarize issue receipt');
const finalGate = workflow.indexOf('- name: Fail scheduled verification when checks failed');
if (!(temporalExit < artifact && artifact < issue && issue < receipt && receipt < finalGate)) {
    failures.push('scheduled verification must retain evidence and summarize issue receipt before the final failing gate');
}

requirePattern(/- name: Upload verification evidence\n\s+if: always\(\)\n\s+uses: actions\/upload-artifact@v4/, 'verification evidence artifact must upload even after a failed check');
requirePattern(/- name: Summarize issue receipt\n\s+if: always\(\)/, 'issue receipt summary must run even when issue reporting fails');
requirePattern(/- name: Fail scheduled verification when checks failed\n\s+if: always\(\)/, 'final verification gate must run after prior failure-handling steps');

reportFailures('eval-scheduled-verification', failures);
