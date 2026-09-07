'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const core = require('../scripts/lib/freshness-contract');
const { collect } = require('../scripts/lib/maintenance/collector');

const NOW = '2026-09-06T12:00:00.000Z';

function record(id) {
    return { id, path: `data/examples/instruments/${id}.md`, title: id, cadenceDays: 90, lastVerified: '2026-09-01', status: 'within_cadence' };
}

function source(recordValue, overrides = {}) {
    return {
        id: `source-${recordValue.id}`,
        recordId: recordValue.id,
        url: `https://commerce.utah.gov/ai/${recordValue.id}/`,
        expectedHost: 'commerce.utah.gov',
        identity: ['doctronic', 'agreement'],
        qualification: 'Authority page scoped to an existing record.',
        ...overrides
    };
}

function response(body, url) {
    return { httpStatus: 200, contentType: 'text/html', body, rawBody: Buffer.from(body), format: 'text', retrievedUrl: url, retrievedAt: NOW };
}

async function observe(selected, configured, body) {
    return collect({
        records: [selected],
        sources: [configured],
        state: core.emptyState({ reviewPolicy: { owner: 'Sam Rogers', capacityMinutesPerWeek: 30 } }),
        now: NOW,
        fetcher: async url => response(body, url),
        retainRaw: async () => {},
        persist: async () => {}
    });
}

test('ordinary Cloudflare email protection does not turn a usable authority page into a bot challenge', async () => {
    const selected = record('doctronic');
    const configured = source(selected);
    const body = `<!doctype html><html><head><title>Doctronic agreement</title><script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script></head><body><main><h1>Doctronic agreement</h1><p>Authority-page scope content.</p></main><footer><a href="/cdn-cgi/l/email-protection#abc">Email</a></footer></body></html>`;
    const result = await observe(selected, configured, body);
    const summary = result.report.sources[0];
    assert.equal(summary.status, 'covered');
    assert.equal(summary.assessment, 'baseline_review');
    assert.equal(summary.reason, null);
    assert.equal(result.state.observations[summary.observationId].coverageQualified, true);
});

test('an actual challenge-platform response remains unavailable even if an identity token appears', async () => {
    const selected = record('doctronic');
    const configured = source(selected);
    const body = `<!doctype html><html><head><title>Just a moment...</title><script src="/cdn-cgi/challenge-platform/scripts/jsd/main.js"></script></head><body><main><p>Doctronic agreement</p><form id="challenge-form">Verifying you are human</form></main></body></html>`;
    const result = await observe(selected, configured, body);
    const summary = result.report.sources[0];
    assert.equal(summary.status, 'unavailable');
    assert.equal(summary.assessment, 'inaccessible');
    assert.match(summary.reason, /Bot challenge response/);
    assert.equal(result.state.observations[summary.observationId].coverageQualified, false);
});

test('the Utah code title shell without chapter content remains unavailable', async () => {
    const selected = record('utah-code');
    const configured = source(selected, {
        url: 'https://le.utah.gov/xcode/Title13/Chapter72/13-72.html',
        expectedHost: 'le.utah.gov',
        identity: ['artificial intelligence', '13-72'],
        qualification: 'Current-code page scope only.'
    });
    const body = '<!doctype html><html><head><title>Utah Code Chapter 13-72</title></head><body><main id="main-content"><div id="ovBox"></div><div id="viewbox"></div><div id="affectbox"></div></main></body></html>';
    const result = await observe(selected, configured, body);
    const summary = result.report.sources[0];
    assert.equal(summary.status, 'unavailable');
    assert.equal(summary.assessment, 'inaccessible');
    assert.match(summary.reason, /Document identity not established/);
    assert.equal(result.state.observations[summary.observationId].coverageQualified, false);
});
