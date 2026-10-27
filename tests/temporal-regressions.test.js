'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { compareTemporalStatus, checkTemporalRegressions } = require('../scripts/check-temporal-regressions');

const ROOT = path.join(__dirname, '..');
const TODAY = '2026-10-27';
const elapsed = { id: 'elapsed', status: 'enforcing', term_end: '2026-10-24' };
const current = { id: 'current', status: 'enforcing', term_end: '2027-10-24' };

function fixture(t) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publedge-temporal-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const git = args => execFileSync('git', [
        '-c', 'user.name=Temporal Fixture', '-c', 'user.email=fixture@example.invalid',
        '-c', 'commit.gpgsign=false', '-c', `core.hooksPath=${root}/no-hooks`, ...args
    ], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    fs.mkdirSync(path.join(root, 'scripts/lib'), { recursive: true });
    for (const file of ['check-temporal-regressions.js', 'lib/parse.js', 'lib/temporal-status.js']) {
        fs.copyFileSync(path.join(ROOT, 'scripts', file), path.join(root, 'scripts', file));
    }
    fs.writeFileSync(path.join(root, 'project.yml'), 'entities:\n  container:\n    directory: instruments\n');
    fs.mkdirSync(path.join(root, 'data/examples/instruments'), { recursive: true });
    const write = (record, filename = record.id) => fs.writeFileSync(
        path.join(root, 'data/examples/instruments', `${filename}.md`),
        `---\n${Object.entries(record).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')}\n---\nFixture.\n`
    );
    write(elapsed);
    write(current);
    git(['init', '--initial-branch=main']);
    git(['add', '.']);
    git(['commit', '-m', 'base']);
    const base = git(['rev-parse', 'HEAD']);
    git(['commit', '--allow-empty', '-m', 'candidate']);
    const run = (env = {}) => spawnSync(process.execPath, ['scripts/check-temporal-regressions.js'], {
        cwd: root, encoding: 'utf8', env: { ...process.env, SOURCE_ADMISSION_BASE: base, PUBLEDGE_EVAL_DATE: TODAY, ...env }
    });
    const check = () => checkTemporalRegressions({ root, base, today: TODAY });
    return { root, base, git, write, run, check };
}

test('unchanged findings pass the comparison and remain visible in logs, annotations and summary', t => {
    const f = fixture(t);
    const summary = path.join(f.root, 'summary.md');
    const result = f.run({ GITHUB_ACTIONS: 'true', GITHUB_STEP_SUMMARY: summary });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stderr, /EXISTING TEMPORAL FINDING: elapsed is enforcing after its term ended 2026-10-24/);
    assert.match(result.stdout, /::warning title=Unresolved temporal finding::elapsed is enforcing/);
    assert.match(fs.readFileSync(summary, 'utf8'), /elapsed is enforcing after its term ended 2026-10-24/);
    assert.match(fs.readFileSync(summary, 'utf8'), /does not certify current legal status/);
    assert.equal(f.check().currentFailures.length, 1);
});

test('new failures block even when an existing finding is resolved and the total count stays equal', t => {
    const f = fixture(t);
    f.write({ ...elapsed, status: 'expired' });
    f.write({ ...current, term_end: '2026-10-25' });
    const result = f.check();
    assert.equal(result.baseFailures.length, result.currentFailures.length);
    assert.deepEqual(result.regressions, ['current is enforcing after its term ended 2026-10-25']);
    assert.equal(f.run().status, 1);
});

test('changed finding details fail instead of inheriting a record-level exemption', t => {
    const f = fixture(t);
    f.write({ ...elapsed, term_end: '2026-09-01' });
    assert.deepEqual(f.check().regressions, ['elapsed is enforcing after its term ended 2026-09-01']);
    assert.equal(f.run().status, 1);
});

test('a newly added invalid instrument blocks', t => {
    const f = fixture(t);
    f.write({ id: 'new-record', status: 'superseded' });
    assert.deepEqual(f.check().regressions, ['new-record is superseded without superseded_by']);
});

test('deleting an unresolved instrument cannot hide its finding', t => {
    const f = fixture(t);
    fs.unlinkSync(path.join(f.root, 'data/examples/instruments/elapsed.md'));
    assert.deepEqual(f.check().regressions, ['elapsed was removed with unresolved temporal findings']);
    assert.equal(f.run().status, 1);
});

test('a supported record correction may remove a temporal finding without certifying its source', t => {
    const f = fixture(t);
    f.write({ ...elapsed, status: 'expired' });
    assert.deepEqual(f.check().currentFailures, []);
    assert.deepEqual(f.check().regressions, []);
});

test('both revisions use the evaluation date rather than the base commit timestamp', () => {
    const record = { id: 'awaiting', status: 'enacted', effective: '2026-10-26' };
    const result = compareTemporalStatus([record], [record], TODAY);
    assert.deepEqual(result.baseFailures, ['awaiting remains enacted after its effective date 2026-10-26']);
    assert.deepEqual(result.regressions, []);
});

test('missing, unresolved, self and nonancestor bases fail closed', t => {
    const f = fixture(t);
    assert.equal(f.run({ SOURCE_ADMISSION_BASE: '' }).status, 1);
    assert.throws(() => checkTemporalRegressions({ root: f.root, base: 'f'.repeat(40), today: TODAY }));
    assert.throws(() => checkTemporalRegressions({ root: f.root, base: f.git(['rev-parse', 'HEAD']), today: TODAY }), /must precede HEAD/);
    f.git(['checkout', '--orphan', 'unrelated']);
    f.git(['commit', '--allow-empty', '-m', 'unrelated']);
    assert.throws(f.check);
});

test('invalid evaluation dates fail rather than producing an empty comparison', () => {
    for (const date of ['not-a-date', '2026-02-30', '2026-13-01']) {
        assert.throws(() => compareTemporalStatus([elapsed], [elapsed], date), /valid YYYY-MM-DD/);
    }
});

test('record loading follows each revision configuration', t => {
    const f = fixture(t);
    fs.renameSync(path.join(f.root, 'data/examples/instruments'), path.join(f.root, 'data/examples/relocated'));
    fs.writeFileSync(path.join(f.root, 'project.yml'), 'entities:\n  container:\n    directory: relocated\n');
    assert.equal(f.check().currentFailures.length, 1);
    assert.deepEqual(f.check().regressions, []);
});

test('duplicate ids, unreadable data and an empty source set fail closed', t => {
    const f = fixture(t);
    f.write(elapsed, 'duplicate');
    assert.throws(f.check, /duplicate instrument id/);
    fs.unlinkSync(path.join(f.root, 'data/examples/instruments/duplicate.md'));
    fs.rmSync(path.join(f.root, 'data/examples/instruments'), { recursive: true });
    assert.throws(f.check);
    fs.mkdirSync(path.join(f.root, 'data/examples/instruments'));
    assert.throws(f.check, /No instruments available/);
});
