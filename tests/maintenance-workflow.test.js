'use strict';

const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');
const workflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'verify.yml'), 'utf8');

function runBlock(stepName) {
    const start = workflow.indexOf(`      - name: ${stepName}`);
    assert.notStrictEqual(start, -1, `workflow lacks ${stepName}`);
    const run = workflow.indexOf('        run: |\n', start);
    assert.notStrictEqual(run, -1, `${stepName} lacks a run block`);
    const contentStart = run + '        run: |\n'.length;
    const next = workflow.indexOf('\n      - name:', contentStart);
    return workflow.slice(contentStart, next === -1 ? workflow.length : next).replace(/^ {10}/gm, '');
}

function markerFor(raw) {
    const normalized = raw
        .replace(/(last verified )\d+( days ago \(\d{4}-\d{2}-\d{2}\); cadence \d+ days)/g, '$1<elapsed-days>$2')
        .replace(/^npm (?:timing|verbose|notice) .*$/gm, '<npm-runner-metadata>')
        .replace(/^(?:real|user|sys)\s+\d+(?::\d+)?(?:\.\d+)?s?$/gm, '<runner-timing>');
    return `<!-- scheduled-verification-report:${crypto.createHash('sha256').update(normalized).digest('hex')} -->`;
}

function writeMockGh(directory) {
    const mock = `#!/usr/bin/env bash
set -e
echo "$*" >> "$GH_LOG"
if [ "$1" = "issue" ] && [ "$2" = "list" ]; then
  printf '%s\\n' "$GH_EXISTING"
elif [ "$1" = "api" ]; then
  if [ "\${GH_API_FAIL:-0}" = "1" ]; then exit 73; fi
  case "$2" in
    */comments) printf '%s\\n' "$GH_COMMENTS" ;;
    *) printf '%s\\n' "$GH_BODY" ;;
  esac
elif [ "$1" = "issue" ] && [ "$2" = "comment" ]; then
  exit 0
elif [ "$1" = "issue" ] && [ "$2" = "edit" ]; then
  exit 0
elif [ "$1" = "issue" ] && [ "$2" = "create" ]; then
  echo "https://github.com/owner/repo/issues/42"
else
  echo "unexpected gh invocation: $*" >&2
  exit 74
fi
`;
    const filename = path.join(directory, 'gh');
    fs.writeFileSync(filename, mock, { mode: 0o755 });
}

function runIssueHandler({ report, body = '', comments = '', apiFail = false }) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'publedge-maintenance-workflow-'));
    try {
        writeMockGh(directory);
        fs.writeFileSync(path.join(directory, 'verify-output.txt'), report);
        fs.writeFileSync(path.join(directory, 'handler.sh'), `#!/usr/bin/env bash\nset -e\n${runBlock('Open or update drift issue')}`, { mode: 0o755 });
        const output = path.join(directory, 'github-output.txt');
        const log = path.join(directory, 'gh.log');
        const result = spawnSync('bash', ['handler.sh'], {
            cwd: directory,
            encoding: 'utf8',
            env: {
                ...process.env,
                PATH: `${directory}:${process.env.PATH}`,
                GITHUB_REPOSITORY: 'owner/repo',
                GITHUB_OUTPUT: output,
                GH_LOG: log,
                GH_EXISTING: '3',
                GH_BODY: body,
                GH_COMMENTS: comments,
                GH_API_FAIL: apiFail ? '1' : '0',
            },
        });
        return {
            ...result,
            log: fs.existsSync(log) ? fs.readFileSync(log, 'utf8') : '',
            output: fs.existsSync(output) ? fs.readFileSync(output, 'utf8') : '',
        };
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
}

function runFinalGate(exitCode) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'publedge-final-gate-'));
    try {
        fs.writeFileSync(path.join(directory, 'gate.sh'), `#!/usr/bin/env bash\n${runBlock('Fail scheduled verification when checks failed')}`, { mode: 0o755 });
        return spawnSync('bash', ['gate.sh'], { cwd: directory, encoding: 'utf8', env: { ...process.env, VERIFY_EXIT: exitCode } });
    } finally {
        fs.rmSync(directory, { recursive: true, force: true });
    }
}

const firstWeek = 'STALE (9):\n  [Authority] nine-record-set — last verified 181 days ago (2026-01-01); cadence 90 days\nnpm timing command: 12ms\n';
const laterWeek = 'STALE (9):\n  [Authority] nine-record-set — last verified 188 days ago (2026-01-01); cadence 90 days\nnpm timing command: 47ms\n';

test('later age counters deduplicate against an existing legacy issue body and retitle it', () => {
    assert.strictEqual(markerFor(laterWeek), markerFor(firstWeek));
    const result = runIssueHandler({ report: laterWeek, body: markerFor(firstWeek) });
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.output, /action=deduplicated/);
    assert.doesNotMatch(result.log, /issue comment/);
    assert.match(result.log, /issue edit 3 --title Knowledge drift detected/);
});

test('changed semantic report marker adds one comment', () => {
    const changed = 'STALE (10):\n  [Authority] new-entity — last verified 181 days ago (2026-01-01); cadence 90 days\n';
    const result = runIssueHandler({ report: changed, body: markerFor(firstWeek) });
    assert.strictEqual(result.status, 0, result.stderr);
    assert.match(result.output, /action=commented/);
    assert.match(result.log, /issue comment 3 --body-file issue-body\.md/);
});

test('GitHub issue evidence query failure exits nonzero instead of assuming no marker', () => {
    const result = runIssueHandler({ report: firstWeek, apiFail: true });
    assert.notStrictEqual(result.status, 0);
    assert.doesNotMatch(result.log, /issue comment/);
});

test('final verification gate remains nonzero after a successful issue update', () => {
    const issue = runIssueHandler({ report: firstWeek, body: markerFor(firstWeek) });
    assert.strictEqual(issue.status, 0, issue.stderr);
    const gate = runFinalGate('1');
    assert.strictEqual(gate.status, 1);
});
