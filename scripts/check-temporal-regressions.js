#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { parseYaml, parseFrontmatter } = require('./lib/parse');
const { isIsoDate, temporalStatusFailures } = require('./lib/temporal-status');

function compareTemporalStatus(before, after, today) {
    const date = new Date(`${today}T00:00:00Z`);
    if (!isIsoDate(today) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== today) {
        throw new Error('Temporal comparison requires a valid YYYY-MM-DD evaluation date');
    }
    const baseFailures = before.flatMap(record => temporalStatusFailures(record, today));
    const currentFailures = after.flatMap(record => temporalStatusFailures(record, today));
    const known = new Set(baseFailures);
    const regressions = currentFailures.filter(finding => !known.has(finding));
    const currentIds = new Set(after.map(record => record.id));
    for (const record of before) {
        if (!currentIds.has(record.id) && temporalStatusFailures(record, today).length) {
            regressions.push(`${record.id} was removed with unresolved temporal findings`);
        }
    }
    return { baseFailures, currentFailures, regressions };
}

function checkTemporalRegressions({
    root = path.join(__dirname, '..'),
    base = process.env.SOURCE_ADMISSION_BASE,
    today = process.env.PUBLEDGE_EVAL_DATE || new Date().toISOString().slice(0, 10)
} = {}) {
    if (!/^[a-f0-9]{40}$/.test(base || '')) throw new Error('SOURCE_ADMISSION_BASE must be an exact comparison commit');
    const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const head = git(['rev-parse', 'HEAD']).trim();
    git(['cat-file', '-e', `${base}^{commit}`]);
    if (base === head) throw new Error('Temporal comparison base must precede HEAD');
    git(['merge-base', '--is-ancestor', base, head]);

    function records(revision) {
        const read = file => revision ? git(['show', `${revision}:${file}`]) : fs.readFileSync(path.join(root, file), 'utf8');
        const config = parseYaml(read('project.yml'));
        const directory = config.entities?.container?.directory || 'container';
        if (!/^[a-z0-9_-]+$/.test(directory)) throw new Error('Invalid instrument source directory');
        const tracked = revision ? git(['ls-tree', '-rz', '--name-only', revision, '--', 'data']).split('\0').filter(Boolean) : [];
        const examples = revision ? tracked.some(file => file.startsWith('data/examples/')) : fs.existsSync(path.join(root, 'data/examples'));
        const dir = `${examples ? 'data/examples' : 'data'}/${directory}`;
        const files = revision
            ? tracked.filter(file => path.posix.dirname(file) === dir)
            : fs.readdirSync(path.join(root, dir)).map(name => `${dir}/${name}`);
        const ids = new Set();
        const found = files.filter(file => file.endsWith('.md') && !path.posix.basename(file).startsWith('_')).sort().map(file => {
            if (!revision && !fs.lstatSync(path.join(root, file)).isFile()) throw new Error(`Instrument is not a regular file: ${file}`);
            const record = parseFrontmatter(read(file)).frontmatter;
            if (typeof record.id !== 'string' || !record.id.trim() || ids.has(record.id)) throw new Error(`Missing or duplicate instrument id: ${file}`);
            ids.add(record.id);
            return record;
        });
        if (!found.length) throw new Error(`No instruments available at ${revision || 'working tree'}:${dir}`);
        return found;
    }

    return { base, head, today, ...compareTemporalStatus(records(base), records(), today) };
}

function report(result) {
    console.log(`Temporal comparison: base ${result.base}; candidate working tree at HEAD ${result.head}; date ${result.today}`);
    const introduced = new Set(result.regressions);
    for (const finding of result.currentFailures) {
        console.warn(`${introduced.has(finding) ? 'NEW/CHANGED' : 'EXISTING'} TEMPORAL FINDING: ${finding}`);
        if (process.env.GITHUB_ACTIONS === 'true') {
            const escaped = finding.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
            console.log(`::warning title=Unresolved temporal finding::${escaped}`);
        }
    }
    if (process.env.GITHUB_STEP_SUMMARY) {
        const lines = [
            '## Temporal regression comparison',
            `Evaluation date: ${result.today}. Base: ${result.base}. Candidate HEAD: ${result.head}.`,
            '### Current findings',
            ...result.currentFailures.map(finding => `- ${finding}`),
            ...(result.currentFailures.length ? [] : ['None.']),
            '### Blocking regressions',
            ...result.regressions.map(finding => `- ${finding}`),
            ...(result.regressions.length ? [] : ['None.']),
            'Existing findings remain source-review work. A passing comparison does not certify current legal status or close the knowledge-drift issue.'
        ];
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
    }
    for (const finding of result.regressions) console.error(`BLOCKING: ${finding}`);
    console.log(`temporal-regressions: ${result.regressions.length ? 'FAILED' : 'PASS'}; ${result.currentFailures.length} current finding(s) remain visible`);
}

if (require.main === module) {
    try {
        const result = checkTemporalRegressions();
        report(result);
        process.exitCode = result.regressions.length ? 1 : 0;
    } catch (error) {
        console.error(`temporal-regressions: FAILED: ${error.message}`);
        process.exitCode = 1;
    }
}

module.exports = { compareTemporalStatus, checkTemporalRegressions };
