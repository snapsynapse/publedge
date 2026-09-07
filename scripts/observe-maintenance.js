#!/usr/bin/env node
'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const core = require('./lib/freshness-contract');
const { inventory, collect, render, review } = require('./lib/maintenance/collector');
const sources = require('./lib/maintenance/config');
const ROOT = path.join(__dirname, '..');
function parseArgs(args) {
    const options = { live: false, state: path.join(ROOT, 'ops/maintenance/source-monitor-state.json'), reports: null };
    for (let i = 0; i < args.length; i++) {
        const key = args[i];
        if (key === '--live') options.live = true;
        else if (['--state', '--reports', '--review'].includes(key)) {
            const value = args[++i];
            if (!value || value.startsWith('--')) throw Error('Missing path for ' + key);
            options[key.slice(2)] = path.resolve(value);
        } else throw Error('Unknown argument: ' + key);
    }
    if (options.review && options.live) throw Error('Review and collection are separate operations');
    if (!options.review && !options.live) throw Error('Pass --live for the bounded three-source run, or --review for an explicit human decision file');
    options.reports ||= path.join(ROOT, '.verification-reports', `maintenance-${new Date().toISOString().replace(/[:.]/g, '-')}`);
    if (options.state === options.reports || options.state.startsWith(options.reports + path.sep)) throw Error('Durable state must be outside reports');
    return options;
}
async function run(options) {
    if (options.live !== true && !options.review) throw Error('Select explicit live or review operation');
    const state = await core.loadState(options.state);
    state.reviewPolicy.owner ||= 'Sam Rogers';
    if (options.review) {
        const decision = JSON.parse(await fs.readFile(options.review, 'utf8'));
        const records = inventory(ROOT);
        const result = review(state, decision.findingId, decision, records);
        await core.saveState(options.state, state);
        console.log(JSON.stringify(result, null, 2));
        return 0;
    }
    await fs.mkdir(options.reports, { recursive: true });
    if ((await fs.readdir(options.reports)).length) throw Error('Use an empty evidence directory');
    let latest;
    async function atomic(name, value) {
        const output = path.join(options.reports, name);
        await fs.writeFile(output + '.tmp', value);
        await fs.rename(output + '.tmp', output);
    }
    try {
        const result = await collect({ records: inventory(ROOT), sources, state,
            retainRaw: async (source, response) => {
                if (response.rawBody) await atomic(source.id + (response.format === 'pdf' ? '.pdf' : '.html'), response.rawBody);
                if (response.format === 'pdf' && response.body) await atomic(source.id + '.txt', response.body);
                const { rawBody, body, ...receipt } = response;
                await atomic(source.id + '-receipt.json', JSON.stringify(receipt, null, 2) + '\n');
            },
            persist: async (current, report) => {
                latest = report;
                await atomic('report.json', JSON.stringify(report, null, 2) + '\n');
                await atomic('review-proposals.md', render(report));
                await atomic('review-state.json', JSON.stringify(current, null, 2) + '\n');
                await core.saveState(options.state, current);
            }
        });
        console.log(JSON.stringify({ status: result.report.status, requests: result.report.requests, sources: result.report.sources, reviewQueue: result.report.reviewQueue }, null, 2));
        return result.report.status === 'healthy' ? 0 : result.report.status === 'review_required' ? 1 : 2;
    } catch (error) {
        if (latest) { latest.status = 'failed'; latest.failure = error.message; await atomic('report.json', JSON.stringify(latest, null, 2) + '\n'); }
        await atomic('failure.json', JSON.stringify({ status: 'failed', message: error.message }, null, 2) + '\n');
        throw error;
    }
}
if (require.main === module) Promise.resolve().then(() => run(parseArgs(process.argv.slice(2)))).then(code => { process.exitCode = code; }).catch(error => { console.error(error.message); process.exitCode = 2; });
module.exports = { parseArgs, run };
