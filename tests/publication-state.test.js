'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const ROOT = path.join(__dirname, '..');
const { validatePublicationState, publicMcpIdentity, loadPublicationState } = require('../scripts/lib/publication-state');

function fixtures() {
    return {
        state: JSON.parse(fs.readFileSync(path.join(ROOT, 'design/publication-state.json'), 'utf8')),
        snapshot: JSON.parse(fs.readFileSync(path.join(ROOT, 'design/PUBLISHED-MCP-0.2.3.snapshot.json'), 'utf8'))
    };
}

test('candidate ahead selects the evidenced npm artifact without auto-promotion', () => {
    const { state, snapshot } = fixtures();
    const result = publicMcpIdentity(state, snapshot, ROOT);
    assert.equal(state.source_candidate.version, '0.2.4');
    assert.equal(result.package, 'publedge@0.2.3');
    const mutated = structuredClone(state);
    mutated.source_candidate.version = '0.2.9';
    const after = publicMcpIdentity(mutated, snapshot);
    assert.equal(after.package, result.package);
    assert.equal(after.version, result.version);
    assert.deepEqual(after.tools, result.tools);
});

test('candidate-only capabilities cannot leak into published discovery', () => {
    const { state, snapshot } = fixtures();
    const result = publicMcpIdentity(state, snapshot, ROOT);
    assert.equal(result.tools.count, 13);
    assert.equal(result.tools.names.includes('candidate_only_tool'), false);
});

test('version-only changes cannot move publication state', () => {
    const { state, snapshot } = fixtures();
    state.observations.npm.version = '0.2.4';
    assert.throws(() => publicMcpIdentity(state, snapshot, ROOT), /evidence URL drift|snapshot version/);
});

test('fabricated provider publication cannot erase partial-channel evidence', () => {
    const { state, snapshot } = fixtures();
    assert.equal(state.observations.npm.version, '0.2.3');
    assert.equal(state.observations.mcp_registry.version, '0.2.2');
    const fabricated = structuredClone(state);
    fabricated.observations.mcp_registry.version = '0.2.3';
    assert.throws(() => validatePublicationState(fabricated, snapshot, ROOT), /MCP Registry provider version drift/);
    fabricated.observations.mcp_registry.version = '0.2.2';
    fabricated.source_candidate.status = 'published-source';
    assert.throws(() => validatePublicationState(fabricated, snapshot, ROOT), /unpublished-source/);
});

test('candidate lifecycle permits structurally valid partial and complete publication states', () => {
    const { state, snapshot } = fixtures();
    assert.equal(publicMcpIdentity(state, snapshot).version, '0.2.3');

    const npmPublishedMcpOlder = structuredClone(state);
    npmPublishedMcpOlder.source_candidate = null;
    // Retained provider evidence is bound when a repository root is supplied.
    // These fixtures isolate lifecycle structure because their provider files remain immutable.
    assert.equal(publicMcpIdentity(npmPublishedMcpOlder, snapshot).version, '0.2.3');
    assert.equal(npmPublishedMcpOlder.observations.mcp_registry.version, '0.2.2');

    const allPublished = structuredClone(npmPublishedMcpOlder);
    allPublished.observations.mcp_registry.version = '0.2.3';
    assert.equal(publicMcpIdentity(allPublished, snapshot).version, '0.2.3');

    const tooSoon = structuredClone(state);
    tooSoon.source_candidate = null;
    assert.throws(() => validatePublicationState(tooSoon, snapshot, ROOT), /Absent source candidate requires published npm version/);
});

test('missing or wrong immutable artifact evidence fails', () => {
    const { state, snapshot } = fixtures();
    for (const mutate of [
        s => { delete s.observations.npm.integrity; },
        s => { delete s.observations.npm.tarball_sha256; },
        s => { s.observations.npm.artifact_snapshot_path = null; },
        s => { delete s.observations.mcp_registry.evidence_sha256; },
        s => { delete s.observations.github_tag.evidence_sha256; },
        s => { delete s.observations.github_release.evidence_sha256; },
        s => { s.observations.npm.integrity = 'sha512-wrong'; }
    ]) {
        const broken = structuredClone(state);
        mutate(broken);
        assert.throws(() => validatePublicationState(broken, snapshot, ROOT));
    }
});

test('published snapshot content and nonfuture observation times are bound', () => {
    const { state, snapshot } = fixtures();
    const changed = structuredClone(snapshot);
    changed.tools.names.push('candidate_only_tool');
    changed.tools.count += 1;
    changed.tools.free_count += 1;
    assert.throws(() => validatePublicationState(state, changed, ROOT), /snapshot content drift/);
    const future = structuredClone(state);
    future.observations.mcp_registry.observed_at = '2999-01-01T00:00:00Z';
    assert.throws(() => validatePublicationState(future, snapshot), /future/);
    const impossible = structuredClone(state);
    impossible.observations.mcp_registry.observed_at = '2026-02-30T12:00:00Z';
    assert.throws(() => validatePublicationState(impossible, snapshot), /invalid/);
});

test('provider versions, tags, absence evidence, and retained paths fail closed', () => {
    const { state, snapshot } = fixtures();
    for (const mutate of [
        s => { s.observations.mcp_registry.version = '0.2.1'; },
        s => { s.observations.github_tag.version = '0.2.1'; },
        s => { s.observations.github_release.version = '0.2.1'; },
        s => { s.observations.github_tag.evidence_path = '../outside.json'; },
        s => { s.observations.github_release.evidence_sha256 = '0'.repeat(64); }
        ,s => { s.observations.npm.evidence_url = 'https://registry.npmjs.org/publedge/0.2.1'; }
        ,s => { s.observations.github_tag.evidence_url = 'https://api.github.com/repos/snapsynapse/publedge/git/refs/tags/v0.2.1'; }
    ]) {
        const broken = structuredClone(state);
        mutate(broken);
        assert.throws(() => validatePublicationState(broken, snapshot, ROOT));
    }
    const absent = structuredClone(state);
    absent.observations.github_tag = {
        status: 'absent', version: null, observed_at: '2026-09-09T16:18:56.062Z',
        evidence_url: 'https://api.github.com/repos/snapsynapse/publedge/git/refs/tags/v0.2.9',
        evidence_path: 'design/PUBLICATION-PROVIDERS-2026-09-09.snapshot.json',
        evidence_sha256: state.observations.github_tag.evidence_sha256,
        http_status: 200, error: null
    };
    assert.throws(() => validatePublicationState(absent, snapshot), /404 or 410/);
});

test('publication-state loader validates the artifact path before reading it', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publedge-state-path-'));
    fs.mkdirSync(path.join(root, 'design'));
    const { state } = fixtures();
    state.observations.npm.artifact_snapshot_path = '../outside.json';
    fs.writeFileSync(path.join(root, 'design/publication-state.json'), JSON.stringify(state));
    assert.throws(() => loadPublicationState(root), /evidence path unsafe/);
    fs.rmSync(root, { recursive: true, force: true });
});

test('independent unavailable provider states retain null version and explicit reason', () => {
    const { state, snapshot } = fixtures();
    state.observations.mcp_registry = {
        status: 'unknown', version: null, observed_at: null, evidence_url: null,
        error: 'Provider was not observed in this checkpoint.'
    };
    assert.equal(validatePublicationState(state, snapshot), true);
    state.observations.github_tag = {
        status: 'error', version: null, observed_at: '2026-09-09T16:18:56.062Z',
        evidence_url: 'https://api.github.com/repos/snapsynapse/publedge/git/refs/tags/v0.2.3', error: 'HTTP 500'
    };
    assert.equal(validatePublicationState(state, snapshot), true);
});

test('provider errors remain unknown and cannot select an install identity', () => {
    const { state, snapshot } = fixtures();
    state.observations.npm = {
        status: 'error', version: null, observed_at: '2026-09-09T16:18:33.674Z',
        evidence_url: 'https://registry.npmjs.org/publedge/0.2.3', error: 'HTTP 500'
    };
    assert.throws(() => publicMcpIdentity(state, snapshot, ROOT), /published npm evidence/);
    assert.equal(state.observations.npm.status, 'error');
    assert.notEqual(state.observations.npm.status, 'absent');
});

test('guide anchor exists, is hash-bound, and remains outside the published package', () => {
    const { state, snapshot } = fixtures();
    assert.equal(validatePublicationState(state, snapshot, ROOT), true);
    const actual = require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(ROOT, snapshot.guide.source_candidate_path))).digest('hex');
    assert.equal(actual, snapshot.guide.source_candidate_sha256);
    const broken = structuredClone(snapshot);
    broken.guide.source_candidate_sha256 = '0'.repeat(64);
    assert.throws(() => validatePublicationState(state, broken, ROOT), /snapshot content drift/);
});

test('generated publication state and evidence snapshots match source bytes', () => {
    for (const filename of ['publication-state.json', 'PUBLISHED-MCP-0.2.3.snapshot.json', 'PUBLICATION-PROVIDERS-2026-09-12.snapshot.json']) {
        assert.deepEqual(
            fs.readFileSync(path.join(ROOT, 'docs/design', filename)),
            fs.readFileSync(path.join(ROOT, 'design', filename)),
            `${filename} generated copy drift`
        );
    }
});
