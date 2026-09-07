'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const core = require('../freshness-contract');
const { parseYaml, parseFrontmatter } = require('../parse');
const { visibleText } = require('./text');
const { fetchPublication } = require('./fetch');
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const DAY = 86400000;

function validDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        Number.isFinite(Date.parse(value + 'T00:00:00Z')) && new Date(value + 'T00:00:00Z').toISOString().slice(0, 10) === value;
}
function inventory(root, now = new Date().toISOString()) {
    const config = parseYaml(fs.readFileSync(path.join(root, 'project.yml'), 'utf8'));
    const policy = config.verification;
    const cadence = key => {
        const value = Number(policy[key] ?? policy.staleness_days);
        if (!Number.isSafeInteger(value) || value < 1 || value > 3650) throw Error('Invalid maintenance cadence');
        return value;
    };
    return ['instruments', 'authorities', 'obligations'].flatMap(kind => {
        const directory = path.join(root, 'data/examples', kind);
        return fs.readdirSync(directory).filter(name => name.endsWith('.md') && !name.startsWith('_')).sort().map(name => {
            const { frontmatter: data } = parseFrontmatter(fs.readFileSync(path.join(directory, name), 'utf8'));
            const historical = kind === 'instruments' && data.source === 'demonstration-remap' && !['jia', 'rma', 'statute'].includes(data.type);
            const cadenceDays = cadence(kind === 'authorities' ? 'authority_staleness_days' : kind === 'obligations' ? 'obligation_staleness_days' : historical ? 'historical_demonstration_staleness_days' : 'staleness_days');
            const date = data.last_verified;
            const ageDays = validDate(date) ? Math.floor((Date.parse(now) - Date.parse(date + 'T00:00:00Z')) / DAY) : null;
            const status = !date ? 'missing' : ageDays === null ? 'invalid' : ageDays < 0 ? 'future' : ageDays > cadenceDays ? 'overdue' : 'within_cadence';
            return { id: data.id || name.slice(0, -3), kind, title: data.title || data.name, type: data.type || null,
                path: `data/examples/${kind}/${name}`, lastVerified: date || null, cadenceDays, ageDays, status,
                dueAt: ageDays === null || ageDays < 0 ? now : new Date(Date.parse(date + 'T00:00:00Z') + (cadenceDays + 1) * DAY).toISOString(),
                officialUrl: data.official_url || null, sharedEvidenceUrl: data.full_text_reference || null, declaredSource: data.source || null, editorialStatus: data.editorial_status || null, legalStatus: data.status || null, historicalDemonstration: historical };
        });
    });
}
function seedDrift(state, records, now) {
    for (const record of records.filter(r => r.status !== 'within_cadence')) {
        const sourceId = `publedge-record:${record.id}`;
        core.registerSource(state, { id: sourceId, owner: 'publedge', authoritativeUrl: `https://github.com/snapsynapse/publedge/blob/main/${record.path}`,
            sourceType: 'official_secondary', subjectIds: [record.id], cadenceDays: record.cadenceDays, criticality: 'standard',
            parserVersion: 'publedge-record-age-v1', contentValidation: 'required', collectionMode: 'manual' }, { now });
        core.upsertFinding(state, { subjectIds: [record.id], claim: 'Review record verification age',
            newValue: { lastVerified: record.lastVerified, cadenceDays: record.cadenceDays, dateStatus: record.status },
            evidence: { sourceId, normalizedContentHash: hash({ lastVerified: record.lastVerified, cadenceDays: record.cadenceDays }), locator: record.path },
            affectedRecords: [record.path], reviewDueAt: record.dueAt }, { now });
    }
}
function latestSnapshot(state, id) {
    const snapshots = Object.values(state.runs).flatMap(run => Object.values(run.results))
        .filter(r => r.kind === 'publedge-source' && r.sourceId === id && r.qualified).sort((a, b) => b.observedAt.localeCompare(a.observedAt));
    if (!snapshots.length) return null;
    const latest = snapshots.filter(r => r.observedAt === snapshots[0].observedAt);
    return new Set(latest.map(r => r.contentHash)).size === 1 ? latest[0] : null;
}
function queue(state, now) {
    const base = core.reviewQueueState(state, { now });
    const pending = Object.values(state.findings).filter(f => f.status === 'pending');
    return { ...base, overdue: pending.filter(f => f.reviewDueAt && f.reviewDueAt < now).map(f => f.id),
        escalation: pending.some(f => f.reviewDueAt && f.reviewDueAt < now) ? 'owner_action_required' : 'none',
        notification: 'not_configured', humanReceipt: 'unconfirmed' };
}
async function collect({ records, sources, state = core.emptyState({ reviewPolicy: { owner: 'Sam Rogers' } }), now = new Date().toISOString(),
    fetcher = fetchPublication, retainRaw = async () => {}, persist = async () => {} }) {
    if (!Array.isArray(sources) || sources.length < 1 || sources.length > 3 || new Set(sources.map(s => s.id)).size !== sources.length) throw Error('Use one to three distinct sources');
    for (const source of sources) {
        const url = new URL(source.url);
        if (url.protocol !== 'https:' || url.hostname !== source.expectedHost || url.port || url.username || url.password ||
            !Array.isArray(source.identity) || !source.identity.length || !records.some(r => r.id === source.recordId) || (source.relatedRecordIds || []).some(id => !records.some(r => r.id === id))) throw Error('Invalid source identity');
    }
    seedDrift(state, records, now);
    const run = core.beginRun(state, { id: `publedge-monitor-${crypto.randomUUID()}`, selectionKeys: sources.map(s => s.id).sort(), inputFingerprint: hash(sources) }, { now }).run;
    const report = { id: run.id, startedAt: now, status: 'running', requests: 0, maxRequests: 3, paidProviderCalls: 0,
        inventory: records, sources: [], corpusChanges: 0 };
    await persist(state, report);
    for (const source of sources) {
        const record = records.find(r => r.id === source.recordId), sourceId = `publedge-source:${source.id}`;
        core.registerSource(state, { id: sourceId, owner: 'publedge', authoritativeUrl: source.url, sourceType: 'official_primary',
            subjectIds: [record.id, ...(source.relatedRecordIds || [])], cadenceDays: record.cadenceDays, criticality: 'standard', parserVersion: 'publedge-source-v1',
            contentValidation: 'required', collectionMode: 'automated' }, { now });
        const prior = latestSnapshot(state, source.id);
        report.requests++;
        await persist(state, report);
        let response, failure;
        try { response = await fetcher(source.url); }
        catch (error) { failure = error.message; await retainRaw(source, { ...(error.receipt || {}), failureReason: failure }); }
        let inspected, text = '';
        if (response) {
            await retainRaw(source, response);
            text = (response.format === 'pdf' ? response.body : visibleText(response.body)).normalize('NFKC').replace(/\s+/g, ' ').trim();
            inspected = { ...core.inspectContent({ ...response, contentType: response.format === 'pdf' ? 'text/plain' : response.contentType }),
                ...(response.rawContentHash ? { rawContentHash: response.rawContentHash } : {}) };
            const terminal = new URL(response.retrievedUrl || source.url);
            if (terminal.protocol !== 'https:' || terminal.hostname.replace(/^www\./, '') !== source.expectedHost || terminal.port || terminal.username || terminal.password) failure = 'Unexpected terminal source';
            else if (response.extractionError) failure = response.extractionError;
            else if (/\.pdf$/i.test(new URL(source.url).pathname) && response.format !== 'pdf') failure = 'Expected original PDF bytes';
            else if (!inspected.coverageQualified) failure = inspected.failureReason;
            else if (!source.identity.every(token => text.toLowerCase().includes(token.toLowerCase()))) failure = 'Document identity not established';
            else if (/bm-verify|\/\/geo\.captcha-delivery\.com|\/_sec\/verify|\/cdn-cgi\/challenge-platform\/|id=["']challenge-form["']|cf-chl-/i.test(response.body)) failure = 'Bot challenge response';
        }
        const qualified = Boolean(response && inspected.coverageQualified && !failure), contentHash = hash(text);
        const observation = core.recordObservation(state, sourceId, { ...(inspected || { retrievalStatus: 'error' }),
            retrievedAt: now, assessmentKind: 'primary_retrieval', coverageQualified: qualified, contentValidation: qualified ? 'valid' : 'invalid',
            normalizedContentHash: contentHash, locator: source.url, evidenceLinks: [source.url], ...(qualified ? {} : { failureReason: failure || 'Source unavailable' }) }, { now }).observation;
        const assessment = qualified ? !prior ? 'baseline_review' : prior.contentHash === contentHash ? 'unchanged_source' : 'changed_source_review' : 'inaccessible';
        const summary = { id: source.id, recordId: source.recordId, url: source.url, observationId: observation.id,
            rawContentHash: observation.rawContentHash || null, status: qualified ? 'covered' : 'unavailable', assessment,
            qualification: source.qualification, relatedRecordIds: source.relatedRecordIds || [], sharedEvidence: source.sharedEvidence || null, reason: failure || null, nextReviewAt: new Date(Date.parse(now) + (qualified ? record.cadenceDays : 7) * DAY).toISOString() };
        if (assessment !== 'unchanged_source') {
            const finding = core.upsertFinding(state, { subjectIds: [record.id], claim: qualified ? 'Review authority source snapshot' : 'Repair authority source coverage',
                newValue: { qualification: source.qualification, assessment, reason: failure || null },
                evidence: { sourceId, normalizedContentHash: qualified ? (prior ? hash({ contentHash, previousHash: prior.contentHash }) : contentHash) : hash(failure || 'Source unavailable'), locator: source.url },
                affectedRecords: [record.path], reviewDueAt: new Date(Date.parse(now) + 7 * DAY).toISOString() }, { now }).finding;
            summary.findingId = finding.id;
        }
        core.checkpointResult(state, run.id, source.id, { kind: 'publedge-source', sourceId: source.id, qualified, contentHash, observedAt: now }, { now });
        report.sources.push(summary);
        await persist(state, report);
    }
    core.finishRun(state, run.id, { now });
    report.reviewQueue = queue(state, now);
    report.status = report.sources.every(s => s.status === 'unavailable') ? 'failed' : report.sources.some(s => s.status === 'unavailable') || report.reviewQueue.status === 'degraded' ? 'degraded' : report.reviewQueue.pending ? 'review_required' : 'healthy';
    await persist(state, report);
    return { state, report };
}
function review(state, findingId, { actor, reason, observationId }, records, now = new Date().toISOString()) {
    if (typeof actor !== 'string' || !actor.trim() || typeof reason !== 'string' || !reason.trim()) throw Error('Review requires named human and reason');
    const finding = state.findings[findingId], observation = state.observations[observationId];
    if (!finding || !observation?.coverageQualified || observation.assessmentKind !== 'primary_retrieval' || !state.sources[observation.sourceId]?.subjectIds.some(id => finding.subjectIds.includes(id))) throw Error('Review requires qualified source evidence for this record');
    if (state.sources[observation.sourceId].coverageState !== 'covered') throw Error('Source coverage has not recovered');
    if (observation.retrievedAt < finding.firstSeenAt) throw Error('Review evidence predates finding');
    if (finding.claim === 'Review record verification age' && !finding.subjectIds.every(id => records.some(r => r.id === id && r.status === 'within_cadence' && r.lastVerified > finding.newValue.lastVerified && r.lastVerified <= observation.retrievedAt.slice(0, 10)))) throw Error('Overdue review needs a separately reviewed current record date');
    core.applyReviewDecision(state, findingId, { actorType: 'human', status: 'accepted', actor, reason: `${reason}; evidence ${observationId}` }, { now });
    return queue(state, now);
}
function render(report) {
    return ['# PubLedge maintenance review', `Status: ${report.status}`, `Requests: ${report.requests}/3; paid calls: 0.`,
        'Source observations do not renew record dates or determine legal effect.',
        `Pending reviews: ${report.reviewQueue?.pending ?? 'in progress'}; overdue: ${report.reviewQueue?.overdue.length ?? 'in progress'}.`,
        'Email and human receipt remain unconfirmed.', '', '| Source | Result | Next review |', '|---|---|---|',
        ...report.sources.map(s => `| ${s.id} | ${s.status}: ${s.reason || s.assessment} | ${s.nextReviewAt} |`)].join('\n') + '\n';
}
module.exports = { inventory, collect, review, seedDrift, queue, render, validDate };
