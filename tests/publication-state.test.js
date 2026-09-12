'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const ROOT = path.join(__dirname, '..');
const { validatePublicationState, publicMcpIdentity, loadPublicationState } = require('../scripts/lib/publication-state');

function fixtures() {
    const state = JSON.parse(fs.readFileSync(path.join(ROOT, 'design/publication-state.json'), 'utf8'));
    return { state, snapshot: JSON.parse(fs.readFileSync(path.join(ROOT, state.observations.npm.artifact_snapshot_path), 'utf8')) };
}

function sourceAhead(state, version = '0.2.5') {
    const candidate = structuredClone(state);
    candidate.source_candidate = {
        version,
        status: 'unpublished-source',
        base_commit: '0'.repeat(40),
        working_tree: true
    };
    return candidate;
}

test('candidate ahead selects the evidenced npm artifact without auto-promotion', () => {
    const { state, snapshot } = fixtures();
    const candidate = sourceAhead(state);
    const result = publicMcpIdentity(candidate, snapshot);
    assert.equal(candidate.source_candidate.version, '0.2.5');
    assert.equal(result.package, `publedge@${state.observations.npm.version}`);
    const mutated = sourceAhead(state, '0.2.9');
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
    state.observations.npm.version = '0.2.5';
    assert.throws(() => publicMcpIdentity(state, snapshot, ROOT), /evidence URL drift|snapshot version/);
});

test('fabricated provider publication cannot erase partial-channel evidence', () => {
    const { state, snapshot } = fixtures();
    const fabricated = structuredClone(state);
    fabricated.observations.mcp_registry.version = '0.2.5';
    assert.throws(() => validatePublicationState(fabricated, snapshot, ROOT), /MCP Registry provider version drift/);
    fabricated.observations.mcp_registry.version = state.observations.mcp_registry.version;
    fabricated.source_candidate = sourceAhead(state).source_candidate;
    fabricated.source_candidate.status = 'published-source';
    assert.throws(() => validatePublicationState(fabricated, snapshot, ROOT), /unpublished-source/);
});

test('candidate lifecycle permits structurally valid partial and complete publication states', () => {
    const { state, snapshot } = fixtures();
    const candidate = sourceAhead(state);
    assert.equal(publicMcpIdentity(candidate, snapshot).version, state.observations.npm.version);

    const npmPublishedMcpOlder = structuredClone(candidate);
    npmPublishedMcpOlder.source_candidate = null;
    // Retained provider evidence is bound when a repository root is supplied.
    // These fixtures isolate lifecycle structure because their provider files remain immutable.
    npmPublishedMcpOlder.observations.mcp_registry.version = '0.2.3';
    assert.equal(publicMcpIdentity(npmPublishedMcpOlder, snapshot).version, state.observations.npm.version);
    assert.equal(npmPublishedMcpOlder.observations.mcp_registry.version, '0.2.3');

    const allPublished = structuredClone(npmPublishedMcpOlder);
    allPublished.observations.mcp_registry.version = state.observations.npm.version;
    assert.equal(publicMcpIdentity(allPublished, snapshot).version, state.observations.npm.version);

    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'publedge-state-lifecycle-'));
    try {
        fs.mkdirSync(path.join(root, 'reference', 'verify'), { recursive: true });
        fs.cpSync(path.join(ROOT, 'design'), path.join(root, 'design'), { recursive: true });
        fs.copyFileSync(path.join(ROOT, 'reference', 'verify', 'index.html'), path.join(root, 'reference', 'verify', 'index.html'));
        const packageJson = { ...JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')), version: '0.2.5' };
        const serverJson = { ...JSON.parse(fs.readFileSync(path.join(ROOT, 'server.json'), 'utf8')), version: '0.2.5' };
        fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson));
        fs.writeFileSync(path.join(root, 'server.json'), JSON.stringify(serverJson));
        assert.throws(() => validatePublicationState(state, snapshot, root, new Date(), false), /Absent source candidate requires published npm version/);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
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
    const { state } = fixtures();
    for (const filename of [
        'publication-state.json',
        path.basename(state.observations.npm.artifact_snapshot_path),
        path.basename(state.observations.npm.evidence_path)
    ]) {
        assert.deepEqual(
            fs.readFileSync(path.join(ROOT, 'docs/design', filename)),
            fs.readFileSync(path.join(ROOT, 'design', filename)),
            `${filename} generated copy drift`
        );
    }
});
