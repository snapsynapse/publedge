'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const test = require('node:test');

const core = require('../scripts/lib/freshness-contract');
const { inventory, collect, review, seedDrift, queue } = require('../scripts/lib/maintenance/collector');
const { parseArgs } = require('../scripts/observe-maintenance');

const ROOT = path.resolve(__dirname, '..');
const NOW = '2026-09-06T12:00:00.000Z';
const BEFORE = '2026-09-05T12:00:00.000Z';
const sha = value => crypto.createHash('sha256').update(value).digest('hex');

function record(id, overrides = {}) {
    return {
        id,
        path: `data/examples/instruments/${id}.md`,
        title: `${id} agreement`,
        cadenceDays: 90,
        lastVerified: '2026-09-01',
        status: 'within_cadence',
        ...overrides
    };
}

function source(recordValue, overrides = {}) {
    return {
        id: `official-${recordValue.id}`,
        recordId: recordValue.id,
        url: `https://authority.example.test/${recordValue.id}.html`,
        expectedHost: 'authority.example.test',
        identity: [recordValue.id, 'agreement'],
        qualification: 'Official source page identifies the selected instrument.',
        ...overrides
    };
}

function state() {
    return core.emptyState({ reviewPolicy: { owner: 'Sam Rogers', capacityMinutesPerWeek: 30 } });
}

function response(body, options = {}) {
    return {
        httpStatus: 200,
        contentType: options.contentType || 'text/html',
        body,
        rawBody: options.rawBody || Buffer.from(body),
        format: options.format || 'text',
        retrievedUrl: options.retrievedUrl || 'https://authority.example.test/record.html',
        retrievedAt: NOW,
        ...options
    };
}

function ageSource(recordValue) {
    return {
        id: `publedge-record:${recordValue.id}`,
        owner: 'publedge',
        authoritativeUrl: `https://github.com/snapsynapse/publedge/blob/main/${recordValue.path}`,
        sourceType: 'official_secondary',
        subjectIds: [recordValue.id],
        cadenceDays: recordValue.cadenceDays,
        criticality: 'standard',
        parserVersion: 'publedge-record-age-v1',
        contentValidation: 'required',
        collectionMode: 'manual'
    };
}

function priorQualifiedObservation(currentState, recordValue) {
    const definition = ageSource(recordValue);
    core.registerSource(currentState, definition, { now: BEFORE });
    return core.recordObservation(currentState, definition.id, {
        retrievedAt: BEFORE,
        retrievalStatus: 'succeeded',
        assessmentKind: 'primary_retrieval',
        coverageQualified: true,
        contentValidation: 'valid',
        rawContentHash: sha('prior raw bytes'),
        normalizedContentHash: sha('prior normalized text'),
        locator: recordValue.path,
        evidenceLinks: [definition.authoritativeUrl]
    }, { now: BEFORE }).observation;
}

test('inventory reports overdue instruments under the active 90-day cadence', () => {
    // The nine Utah records were renewed on 2026-09-23 by a human review receipt.
    // Evaluate 94 days later so the cadence boundary is exercised on real data.
    const CADENCE_NOW = '2026-12-26T12:00:00.000Z';
    const records = inventory(ROOT, CADENCE_NOW);
    const overdue = records.filter(item => item.kind === 'instruments' && item.status === 'overdue');
    const renewed = [
        'us-ut-legislature-statute-2024-sb149',
        'us-ut-legislature-statute-2025-hb452',
        'us-ut-legislature-statute-2025-sb226',
        'us-ut-legislature-statute-2025-sb332',
        'us-ut-legislature-statute-2026-hb320',
        'us-ut-oaip-jia-2026-001',
        'us-ut-oaip-rma-2024-001',
        'us-ut-oaip-rma-2025-002',
        'us-ut-oaip-rma-2026-001'
    ];
    assert.deepEqual(overdue.map(item => item.id), [
        'us-co-legislature-statute-2024-sb24-205',
        'us-co-legislature-statute-2025-sb25b-004',
        'us-co-legislature-statute-2026-sb26-189',
        ...renewed.slice(0, 7),
        'us-ut-oaip-rma-2025-001',
        ...renewed.slice(7)
    ]);
    const renewedItems = overdue.filter(item => renewed.includes(item.id));
    assert.equal(renewedItems.length, 9);
    assert.ok(renewedItems.every(item => item.lastVerified === '2026-09-23' && item.ageDays === 94 && item.cadenceDays === 90));
    assert.ok(renewedItems.every(item => item.dueAt === '2026-12-23T00:00:00.000Z'));
    assert.ok(overdue.every(item => item.cadenceDays === 90));
    assert.equal(overdue.find(item => item.id === 'us-ut-oaip-rma-2025-002').historicalDemonstration, false);

    const currentState = state();
    seedDrift(currentState, overdue, CADENCE_NOW);
    const reviewQueue = queue(currentState, CADENCE_NOW);
    assert.equal(reviewQueue.overdue.length, overdue.length);
    assert.equal(reviewQueue.escalation, 'owner_action_required');
    assert.equal(reviewQueue.notification, 'not_configured');
    assert.equal(reviewQueue.humanReceipt, 'unconfirmed');
});

test('collector rejects blocked pages, identity mismatches, and HTML shells at PDF sources', async t => {
    const cases = [
        {
            name: 'blocked',
            body: '<main>alpha agreement bm-verify</main>',
            expected: /Bot challenge response/
        },
        {
            name: 'wrong identity',
            body: '<main>other material</main>',
            expected: /Document identity not established/
        },
        {
            name: 'PDF shell',
            body: '<main>alpha agreement</main>',
            source: { url: 'https://authority.example.test/alpha.pdf' },
            expected: /Expected original PDF bytes/
        }
    ];

    for (const scenario of cases) await t.test(scenario.name, async () => {
        const selected = record('alpha');
        const currentState = state();
        const retained = [];
        const configured = source(selected, scenario.source);
        const result = await collect({
            records: [selected],
            sources: [configured],
            state: currentState,
            now: NOW,
            fetcher: async url => response(scenario.body, { retrievedUrl: url }),
            retainRaw: async (_source, receipt) => retained.push(receipt),
            persist: async () => {}
        });

        assert.equal(result.report.requests, 1);
        assert.equal(result.report.paidProviderCalls, 0);
        assert.equal(result.report.sources[0].status, 'unavailable');
        assert.match(result.report.sources[0].reason, scenario.expected);
        assert.equal(result.report.status, 'failed');
        assert.equal(retained.length, 1);
        assert.ok(Buffer.isBuffer(retained[0].rawBody));
        assert.equal(retained[0].rawBody.toString(), scenario.body);
    });
});

test('collector keeps an A-to-B-to-A reversion pending after earlier A and B findings were accepted', async () => {
    const selected = record('alpha');
    const configured = source(selected);
    const currentState = state();
    const run = async (now, body) => collect({
        records: [selected],
        sources: [configured],
        state: currentState,
        now,
        fetcher: async url => response(body, { retrievedUrl: url, retrievedAt: now }),
        retainRaw: async () => {},
        persist: async () => {}
    });

    const baseline = await run('2026-09-06T12:00:00.000Z', '<main>alpha agreement version one</main>');
    const baselineFinding = Object.values(currentState.findings).find(finding => finding.claim === 'Review authority source snapshot');
    core.applyReviewDecision(currentState, baselineFinding.id, {
        actorType: 'human', status: 'accepted', actor: 'Sam Rogers', reason: 'Reviewed initial A transition'
    }, { now: '2026-09-07T12:00:00.000Z' });
    const repeated = await run('2026-09-07T12:00:00.000Z', '<main>alpha agreement version one</main>');
    const changed = await run('2026-09-08T12:00:00.000Z', '<main>alpha agreement version two</main>');
    const changedFinding = Object.values(currentState.findings).find(finding => finding.claim === 'Review authority source snapshot' && finding.id !== baselineFinding.id);
    core.applyReviewDecision(currentState, changedFinding.id, {
        actorType: 'human', status: 'accepted', actor: 'Sam Rogers', reason: 'Reviewed A-to-B transition'
    }, { now: '2026-09-08T12:00:00.000Z' });
    const reverted = await run('2026-09-09T12:00:00.000Z', '<main>alpha agreement version one</main>');

    assert.equal(baseline.report.sources[0].assessment, 'baseline_review');
    assert.equal(repeated.report.sources[0].assessment, 'unchanged_source');
    assert.equal(changed.report.sources[0].assessment, 'changed_source_review');
    assert.equal(reverted.report.sources[0].assessment, 'changed_source_review');
    const sourceFindings = Object.values(currentState.findings).filter(finding => finding.claim === 'Review authority source snapshot');
    assert.equal(sourceFindings.length, 3);
    assert.equal(currentState.findings[reverted.report.sources[0].findingId].status, 'pending');
    assert.equal(queue(currentState, '2026-09-09T12:00:00.000Z').pending, 1);
});

test('maintenance CLI requires an explicit live collection or review operation', () => {
    assert.throws(() => parseArgs([]), /Pass --live.*--review/);
    assert.throws(() => parseArgs(['--live', '--review', '/private/tmp/review.json']), /separate operations/);
    assert.throws(() => parseArgs(['--live', '--state']), /Missing path/);
    const options = parseArgs(['--live', '--state', '/private/tmp/publedge-state.json', '--reports', '/private/tmp/publedge-reports']);
    assert.equal(options.live, true);
    assert.equal(options.review, undefined);
    assert.equal(options.state, '/private/tmp/publedge-state.json');
    assert.equal(options.reports, '/private/tmp/publedge-reports');
});

test('raw evidence is handed to the retention boundary and a persistence failure prevents all requests', async () => {
    const selected = record('alpha');
    const currentState = state();
    const raw = Buffer.from('<main>alpha agreement original bytes</main>');
    let retained = null;
    const collected = await collect({
        records: [selected],
        sources: [source(selected)],
        state: currentState,
        now: NOW,
        fetcher: async url => response(raw.toString(), { rawBody: raw, retrievedUrl: url }),
        retainRaw: async (_source, receipt) => { retained = receipt.rawBody; },
        persist: async () => {}
    });
    assert.equal(Buffer.compare(retained, raw), 0);
    assert.equal(collected.report.sources[0].status, 'covered');

    let requests = 0;
    await assert.rejects(() => collect({
        records: [selected],
        sources: [source(selected)],
        state: state(),
        now: NOW,
        fetcher: async () => { requests++; throw new Error('must not fetch'); },
        retainRaw: async () => {},
        persist: async () => { throw new Error('durable state unavailable'); }
    }), /durable state unavailable/);
    assert.equal(requests, 0);
});

test('human recovery requires current, matching qualified evidence and a separately updated record date', async () => {
    const alpha = record('alpha', { lastVerified: '2026-06-04', status: 'overdue' });
    const beta = record('beta', { lastVerified: '2026-06-04', status: 'overdue' });
    const currentState = state();
    const prior = priorQualifiedObservation(currentState, alpha);
    const beforeRecords = JSON.parse(JSON.stringify([alpha, beta]));
    const result = await collect({
        records: [alpha, beta],
        sources: [source(alpha), source(beta)],
        state: currentState,
        now: NOW,
        fetcher: async url => response(url.includes('alpha') ? '<main>alpha agreement current</main>' : '<main>beta agreement current</main>', { retrievedUrl: url }),
        retainRaw: async () => {},
        persist: async () => {}
    });
    const ageFinding = Object.values(currentState.findings).find(finding => finding.claim === 'Review record verification age' && finding.subjectIds[0] === 'alpha');
    const alphaObservation = result.report.sources.find(item => item.recordId === 'alpha').observationId;
    const betaObservation = result.report.sources.find(item => item.recordId === 'beta').observationId;
    const decision = { actor: 'Sam Rogers', reason: 'Reviewed against retained official source' };

    assert.throws(() => review(currentState, ageFinding.id, { ...decision, observationId: 'missing-observation' }, [alpha, beta], NOW), /qualified source evidence/);
    assert.throws(() => review(currentState, ageFinding.id, { ...decision, observationId: betaObservation }, [alpha, beta], NOW), /qualified source evidence/);
    assert.throws(() => review(currentState, ageFinding.id, { ...decision, observationId: prior.id }, [alpha, beta], NOW), /predates finding/);
    assert.throws(() => review(currentState, ageFinding.id, { ...decision, observationId: alphaObservation }, [alpha, beta], NOW), /separately reviewed current record date/);

    const updated = [{ ...alpha, lastVerified: '2026-09-06', status: 'within_cadence' }, beta];
    const recoveredQueue = review(currentState, ageFinding.id, { ...decision, observationId: alphaObservation }, updated, NOW);
    assert.equal(currentState.findings[ageFinding.id].status, 'accepted');
    assert.equal(recoveredQueue.notification, 'not_configured');
    assert.deepEqual([alpha, beta], beforeRecords);
});

// Operational review state must stay outside the builder's published data tree.
test('default ledger stays outside the data tree copied to the public site', () => {
    const options = require('../scripts/observe-maintenance').parseArgs(['--live']);
    assert.ok(options.state.endsWith('/ops/maintenance/source-monitor-state.json'));
    assert.ok(!options.state.includes('/data/maintenance/'));
});
