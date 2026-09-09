'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const admission = require('../scripts/lib/source-admission');
const admissionCheck = require('../scripts/check-source-admission');

const ROOT = path.join(__dirname, '..');
const FILE = 'data/examples/instruments/example.md';
const SOURCE = 'data/admission/sources/notice.txt';
const DOCUMENT = 'Official Notice 226, issued by Example Office, version 2026.\nSection 8 applies to providers with the stated exception beginning January 1, 2027.\n';
const BEFORE = '---\nid: us-ut-example-jia-2026-001\ntype: jia\nsource: authority-issued\nstatus: enacted\neditorial_status: reviewed\njurisdiction: us-ut\nauthority: example-office\nlast_verified: 2026-01-01\n---\n\n## Duty\n\n| Property | Value |\n|---|---|\n| Scope | All deployers |\n| Verified | 2026-01-01 |\n\nProviders must comply, subject to the stated exception.\n';
const AFTER = BEFORE.replace('All deployers', 'Providers');

function fixture() {
    const previous = admission.markdownSnapshot(BEFORE);
    const current = admission.markdownSnapshot(AFTER);
    const key = 'section:Duty/property:Scope';
    const evidence = {
        snapshot_path: SOURCE,
        snapshot_sha256: admission.hash(DOCUMENT),
        original: { path: SOURCE, sha256: admission.hash(DOCUMENT) },
        acquisition: 'retained_snapshot',
        official_url: 'https://example.gov/notice-226',
        document_id: 'Notice 226',
        document_title: 'Official Notice 226',
        issuing_body: 'Example Office',
        document_type: 'official notice',
        version: '2026',
        locator: 'Section 8',
        excerpt: 'Section 8 applies to providers with the stated exception beginning January 1, 2027.',
        identity_excerpts: ['Official Notice 226, issued by Example Office, version 2026.']
    };
    const receipt = {
        record_sha256: current.sha256,
        baseline_sha256: previous.sha256,
        whole_record: { before_sha256: previous.sha256, after_sha256: current.sha256 },
        review: { actor_type: 'agent', actor: 'test-reviewer', reviewed_at: '2026-09-09T12:00:00Z', decision: 'source-consistency-reviewed', scope: 'Scope correction only' },
        unresolved: ['Current applicability remains outside this fixture'],
        evidence: { notice: evidence },
        units: {
            [key]: {
                before_sha256: previous.units[key].sha256,
                after_sha256: current.units[key].sha256,
                candidate_content: current.units[key].content,
                reason: 'Remove unsupported universal scope',
                qualifications: { scope: 'Providers in Section 8', exceptions: 'The stated exception remains', time: 'January 1, 2027; no Verified renewal' },
                evidence: ['notice']
            }
        }
    };
    receipt.review.packet_sha256 = admission.packetDigest(receipt);
    return {
        current: { [FILE]: current },
        legacy: { version: 1, status: 'legacy-unreviewed', records: { [FILE]: { sha256: previous.sha256, units: admission.unitHashes(previous) } } },
        admissions: { version: 1, records: { [FILE]: receipt } },
        read: candidate => { assert.equal(candidate, SOURCE); return Buffer.from(DOCUMENT); },
        now: new Date('2026-09-09T13:00:00Z')
    };
}

test('reviewed change binds record, units, source bytes, and packet', () => {
    const result = admission.validateAdmission(fixture());
    assert.equal(result.status, 'passed');
    assert.equal(result.total_records, 1);
    assert.equal(result.records_with_reviewed_changes, 1);
    assert.equal(result.changed_units_reviewed, 1);
});

test('unchanged baseline remains explicitly legacy-unreviewed', () => {
    const data = fixture();
    data.current[FILE] = admission.markdownSnapshot(BEFORE);
    data.admissions.records = {};
    const result = admission.validateAdmission(data);
    assert.equal(result.status, 'passed');
    assert.equal(result.legacy_unreviewed_records, 1);
    assert.equal(result.records_with_reviewed_changes, 0);
});

test('missing, stale, pending, wrong-document, and self-derived evidence fail', () => {
    const missing = fixture();
    missing.admissions.records = {};
    assert.match(admission.validateAdmission(missing).errors.join('\n'), /requires an admission receipt/);
    const stale = fixture();
    stale.admissions.records[FILE].record_sha256 = admission.hash('wrong');
    assert.match(admission.validateAdmission(stale).errors.join('\n'), /Receipt is stale/);
    const pending = fixture();
    pending.admissions.records[FILE].review.decision = 'pending';
    pending.admissions.records[FILE].review.packet_sha256 = admission.packetDigest(pending.admissions.records[FILE]);
    assert.match(admission.validateAdmission(pending).errors.join('\n'), /Pending\/rejected/);
    const wrong = fixture();
    wrong.read = () => Buffer.from(DOCUMENT.replace('Notice 226', 'Notice 227'));
    assert.match(admission.validateAdmission(wrong).errors.join('\n'), /snapshot changed/);
    const selfDerived = fixture();
    selfDerived.admissions.records[FILE].evidence.notice.snapshot_path = FILE;
    selfDerived.admissions.records[FILE].review.packet_sha256 = admission.packetDigest(selfDerived.admissions.records[FILE]);
    assert.match(admission.validateAdmission(selfDerived).errors.join('\n'), /retained under data\/admission\/sources/);
});

test('agent review cannot renew Verified', () => {
    const data = fixture();
    const current = admission.markdownSnapshot(AFTER.replace('| Verified | 2026-01-01 |', '| Verified | 2026-09-09 |'));
    const receipt = data.admissions.records[FILE];
    const key = 'section:Duty/property:Verified';
    receipt.record_sha256 = current.sha256;
    receipt.whole_record.after_sha256 = current.sha256;
    receipt.units[key] = {
        before_sha256: data.legacy.records[FILE].units[key],
        after_sha256: current.units[key].sha256,
        candidate_content: current.units[key].content,
        reason: 'Attempted freshness renewal',
        qualifications: { scope: 'Fixture only', exceptions: 'No exception change', time: 'Claims a new review time' },
        evidence: ['notice']
    };
    receipt.review.packet_sha256 = admission.packetDigest(receipt);
    data.current[FILE] = current;
    assert.match(admission.validateAdmission(data).errors.join('\n'), /cannot renew Verified/);
});

test('future retrieval timestamps and PubLedge hosted evidence fail admission', () => {
    const future = fixture();
    const evidence = future.admissions.records[FILE].evidence.notice;
    evidence.acquisition = 'primary_retrieval';
    evidence.retrieval = {
        http_status: 200,
        retrieved_at: '2026-09-10T12:00:00Z',
        final_url: evidence.official_url,
        content_type: 'text/plain'
    };
    future.admissions.records[FILE].review.packet_sha256 = admission.packetDigest(future.admissions.records[FILE]);
    assert.match(admission.validateAdmission(future).errors.join('\n'), /Retrieval timestamp cannot be in the future/);

    const hosted = fixture();
    hosted.admissions.records[FILE].evidence.notice.official_url = 'https://publedge.org/us/example/record.json';
    hosted.admissions.records[FILE].review.packet_sha256 = admission.packetDigest(hosted.admissions.records[FILE]);
    assert.match(admission.validateAdmission(hosted).errors.join('\n'), /cannot serve as primary admission evidence/);
});

test('review snapshot may bind separately retained binary original bytes without normalization', () => {
    const data = fixture();
    const rawPath = 'data/admission/sources/notice-original.bin';
    const raw = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x0d, 0x0a, 0x00, 0xff]);
    const evidence = data.admissions.records[FILE].evidence.notice;
    evidence.original = { path: rawPath, sha256: admission.hash(raw) };
    data.read = candidate => candidate === SOURCE ? Buffer.from(DOCUMENT) : candidate === rawPath ? raw : assert.fail(candidate);
    data.admissions.records[FILE].review.packet_sha256 = admission.packetDigest(data.admissions.records[FILE]);
    assert.equal(admission.validateAdmission(data).status, 'passed');
});

function compileSchema(relative) {
    const schema = JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
    const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false, allowUnionTypes: true });
    addFormats(ajv);
    return ajv.compile(schema);
}

test('generic published authority-issued record requires actual evidence', () => {
    const validate = compileSchema('schema/instrument.schema.json');
    const generic = {
        id: 'us-ut-example-jia-2026-999', type: 'jia', source: 'authority-issued',
        status: 'enforcing', editorial_status: 'published', jurisdiction: 'us-ut', authority: 'example-office',
        official_url: null, publication_citations: null, source_documents: null,
        authority_response: null, issuance_event: null, enacted: null
    };
    assert.equal(validate(generic), false, JSON.stringify(validate.errors));
});

test('generated record schema preserves the same issued-evidence boundary', () => {
    const validate = compileSchema('docs/schema/json/record.schema.json');
    const sample = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/us/utah/oaip/jia/2026-001/record.json'), 'utf8'));
    assert.deepEqual(Object.keys(sample.meta.admission).sort(), ['limits', 'status']);
    assert.equal(sample.meta.admission.status, 'legacy-unreviewed');
    sample.record.source = 'authority-issued';
    sample.record.status = 'enforcing';
    sample.record.editorial_status = 'published';
    sample.record.official_url = null;
    sample.record.publication_citations = null;
    sample.record.source_documents = [];
    assert.equal(validate(sample), false, JSON.stringify(validate.errors));
});

test('current admission accounting matches every emitted source collection exactly', () => {
    const result = admissionCheck.runCurrent({ root: ROOT, now: new Date('2026-09-09T23:59:59Z') });
    assert.deepEqual(result.errors, []);
    assert.equal(result.total_records, 62);
    assert.equal(result.legacy_unreviewed_records + result.records_with_reviewed_changes, result.total_records);

    const counts = Object.fromEntries(['containers', 'primaries', 'authorities', 'mappings'].map(name => {
        const payload = JSON.parse(fs.readFileSync(path.join(ROOT, `docs/api/v1/${name}.json`), 'utf8'));
        assert.equal(payload.meta.count, payload.items.length, `${name} count must match emitted items`);
        return [name, payload.items.length];
    }));
    assert.deepEqual(counts, { containers: 18, primaries: 35, authorities: 8, mappings: 16 });
    const ofCounts = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/api/v1/of/index.json'), 'utf8')).counts;
    assert.equal(ofCounts.instruments, counts.containers);
    assert.equal(ofCounts.authorities, counts.authorities);
});

test('an unreviewed source change blocks the build and local MCP before output', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publedge-admission-gate-'));
    for (const entry of ['scripts', 'data', 'mcp-server.js', 'package.json', 'project.yml']) {
        fs.cpSync(path.join(ROOT, entry), path.join(root, entry), { recursive: true });
    }
    fs.appendFileSync(path.join(root, 'data/examples/instruments/us-ut-oaip-jia-2026-001.md'), '\nUnreviewed claim.\n');

    const build = spawnSync(process.execPath, ['scripts/build.js'], { cwd: root, encoding: 'utf8' });
    assert.notEqual(build.status, 0);
    assert.match(`${build.stdout}\n${build.stderr}`, /Changed\/new source information requires an admission receipt/);
    assert.equal(fs.existsSync(path.join(root, 'docs/api/v1/containers.json')), false);

    const mcp = spawnSync(process.execPath, ['mcp-server.js'], { cwd: root, encoding: 'utf8' });
    assert.notEqual(mcp.status, 0);
    assert.match(`${mcp.stdout}\n${mcp.stderr}`, /Changed\/new source information requires an admission receipt/);
});

test('history comparison rejects a dropped accepted receipt', () => {
    const result = { status: 'passed', errors: [] };
    admissionCheck.retainPriorReceipts(result, { records: {} }, { records: { [FILE]: { record_sha256: 'accepted' } } });
    assert.equal(result.status, 'failed');
    assert.match(result.errors.join('\n'), /previously reviewed record lost its receipt/);
});

test('authority-issued promotion requires an actual issuance instrument', () => {
    const data = fixture();
    const before = BEFORE
        .replace('source: authority-issued', 'source: demonstration-remap')
        .replace('status: enacted', 'status: proposed')
        .replace('editorial_status: reviewed', 'editorial_status: draft');
    const after = before
        .replace('source: demonstration-remap', 'source: authority-issued')
        .replace('status: proposed', 'status: enforcing')
        .replace('editorial_status: draft', 'editorial_status: published');
    const previous = admission.markdownSnapshot(before);
    const current = admission.markdownSnapshot(after);
    const receipt = data.admissions.records[FILE];
    receipt.baseline_sha256 = previous.sha256;
    receipt.record_sha256 = current.sha256;
    receipt.whole_record = { before_sha256: previous.sha256, after_sha256: current.sha256 };
    receipt.evidence.notice.document_type = 'official authority instrument';
    receipt.units = {};
    for (const key of ['metadata:source', 'metadata:status', 'metadata:editorial_status']) {
        receipt.units[key] = {
            before_sha256: previous.units[key].sha256,
            after_sha256: current.units[key].sha256,
            candidate_content: current.units[key].content,
            reason: 'Bind issued status to the authority instrument',
            qualifications: { scope: 'Fixture record', exceptions: 'No wider applicability', time: 'As stated in the instrument' },
            evidence: ['notice']
        };
    }
    data.current[FILE] = current;
    data.legacy.records[FILE] = { sha256: previous.sha256, units: admission.unitHashes(previous) };
    receipt.review.packet_sha256 = admission.packetDigest(receipt);
    assert.equal(admission.validateAdmission(data).status, 'passed');

    receipt.evidence.notice.document_type = 'draft proposal';
    receipt.review.packet_sha256 = admission.packetDigest(receipt);
    assert.match(admission.validateAdmission(data).errors.join('\n'), /proposals, drafts, complaints, and press coverage are insufficient/);
    receipt.evidence.notice.document_type = 'filed complaint';
    receipt.review.packet_sha256 = admission.packetDigest(receipt);
    assert.match(admission.validateAdmission(data).errors.join('\n'), /proposals, drafts, complaints, and press coverage are insufficient/);
});
