'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const STATUS = new Set(['published', 'absent', 'unknown', 'error']);
const semver = value => typeof value === 'string' && /^\d+\.\d+\.\d+$/.test(value);
const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');

function validTimestamp(value, now) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) return false;
    const time = Date.parse(value);
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 19) === value.slice(0, 19) && time <= now.getTime();
}

function validEvidenceUrl(value) {
    if (typeof value !== 'string') return false;
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && !url.username && !url.password && !url.hostname.startsWith('www.');
    } catch { return false; }
}

function retainedPath(root, relative, label) {
    assert.equal(typeof relative, 'string', `${label} evidence path missing`);
    assert.ok(relative && !path.isAbsolute(relative) && !relative.includes('\\') && relative.split('/').every(part => part && part !== '.' && part !== '..'), `${label} evidence path unsafe`);
    let current = root;
    for (const part of relative.split('/')) {
        current = path.join(current, part);
        assert.equal(fs.lstatSync(current).isSymbolicLink(), false, `${label} evidence path cannot use symlinks`);
    }
    assert.equal(fs.statSync(current).isFile(), true, `${label} evidence path is not a file`);
    return current;
}

function validateObservation(name, observation, now) {
    assert.ok(observation && typeof observation === 'object' && !Array.isArray(observation), `${name} observation missing`);
    assert.ok(STATUS.has(observation.status), `${name} observation status invalid`);
    if (observation.status === 'unknown') {
        assert.equal(observation.version, null, `${name} unknown version must be null`);
        assert.ok(observation.observed_at === null || validTimestamp(observation.observed_at, now), `${name} unknown observation timestamp invalid`);
        assert.match(observation.error || '', /\S/, `${name} unknown reason missing`);
        return;
    }
    assert.ok(validTimestamp(observation.observed_at, now), `${name} observed_at missing, invalid, or future`);
    assert.ok(validEvidenceUrl(observation.evidence_url), `${name} evidence URL missing or invalid`);
    if (observation.status === 'published') {
        assert.ok(semver(observation.version), `${name} published version missing`);
        assert.match(observation.evidence_sha256 || '', /^[a-f0-9]{64}$/, `${name} evidence digest missing`);
        assert.equal(typeof observation.evidence_path, 'string', `${name} evidence path missing`);
        assert.equal(observation.error, null, `${name} published observation cannot carry an error`);
    } else {
        assert.equal(observation.version, null, `${name} unavailable version must be null`);
        if (observation.status === 'absent') {
            assert.ok([404, 410].includes(observation.http_status), `${name} absence requires 404 or 410 evidence`);
            assert.match(observation.evidence_sha256 || '', /^[a-f0-9]{64}$/, `${name} absence evidence digest missing`);
            assert.equal(typeof observation.evidence_path, 'string', `${name} absence evidence path missing`);
        }
        if (observation.status === 'error') assert.match(observation.error || '', /\S/, `${name} provider error missing`);
    }
}

function validatePublicationState(state, snapshot, root, now = new Date(), checkHosted = true) {
    assert.equal(state?.schema_version, 1, 'Unsupported publication-state schema');
    assert.match(state?.document_updated || '', /^\d{4}-\d{2}-\d{2}$/);
    assert.match(state?.package?.name || '', /^[a-z0-9-]+$/);
    assert.match(state?.package?.registry_server_name || '', /^[a-z0-9._-]+\/[a-z0-9._-]+$/);
    assert.ok(semver(state?.source_candidate?.version), 'Source candidate version missing');
    assert.equal(state.source_candidate.status, 'unpublished-source');
    assert.match(state.source_candidate.base_commit || '', /^[a-f0-9]{40}$/);
    assert.equal(typeof state.source_candidate.working_tree, 'boolean');
    for (const name of ['npm', 'mcp_registry', 'github_tag', 'github_release']) validateObservation(name, state.observations?.[name], now);
    const npm = state.observations.npm;
    assert.equal(npm.status, 'published', 'Hosted install requires published npm evidence');
    assert.match(npm.integrity || '', /^sha\d+-/, 'npm integrity missing');
    assert.match(npm.tarball_sha256 || '', /^[a-f0-9]{64}$/, 'npm tarball SHA-256 missing');
    assert.equal(typeof npm.artifact_snapshot_path, 'string', 'npm artifact snapshot path missing');
    assert.match(npm.artifact_snapshot_sha256 || '', /^[a-f0-9]{64}$/, 'npm artifact snapshot digest missing');
    assert.equal(state.hosted_policy?.install_source, 'npm');
    assert.equal(state.hosted_policy?.install_version_from, 'observations.npm.version');
    assert.equal(state.hosted_policy?.capabilities_from, 'observations.npm.artifact_snapshot_path');
    assert.ok(Array.isArray(state.limitations) && state.limitations.length, 'Publication limitations missing');
    const expectedEvidenceUrls = {
        npm: `https://registry.npmjs.org/${state.package.name}/${npm.version}`,
        mcp_registry: `https://registry.modelcontextprotocol.io/v0/servers?search=${state.package.name}&version=latest`,
        github_tag: `https://api.github.com/repos/snapsynapse/${state.package.name}/git/refs/tags/v${state.observations.github_tag.version}`,
        github_release: `https://github.com/snapsynapse/${state.package.name}/releases/tag/v${state.observations.github_release.version}`
    };
    for (const [name, expected] of Object.entries(expectedEvidenceUrls)) {
        if (state.observations[name].status === 'published') assert.equal(state.observations[name].evidence_url, expected, `${name} evidence URL drift`);
    }
    for (const name of ['github_tag', 'github_release']) {
        const observation = state.observations[name];
        if (observation.status === 'published') assert.equal(observation.tag, `v${observation.version}`, `${name} tag/version drift`);
    }
    assert.equal(snapshot?.schema_version, 1, 'Unsupported published MCP snapshot schema');
    assert.equal(snapshot?.package?.name, state.package.name, 'Published snapshot package name drift');
    assert.equal(snapshot?.package?.version, npm.version, 'Published snapshot version drift');
    assert.equal(snapshot?.package?.integrity, npm.integrity, 'Published snapshot integrity drift');
    assert.equal(snapshot?.package?.tarball_sha256, npm.tarball_sha256, 'Published snapshot tarball drift');
    assert.equal(snapshot?.runtime?.server_version, npm.version, 'Published runtime version drift');
    assert.equal(snapshot?.tools?.count, snapshot?.tools?.names?.length, 'Published tool count drift');
    assert.equal(new Set(snapshot.tools.names).size, snapshot.tools.names.length, 'Published tool names must be unique');
    assert.equal(snapshot.tools.free_count + snapshot.tools.authenticated.length, snapshot.tools.count, 'Published tool access boundary drift');
    if (root) {
        const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
        const server = JSON.parse(fs.readFileSync(path.join(root, 'server.json'), 'utf8'));
        assert.equal(state.package.name, pkg.name, 'Publication package name differs from source package');
        assert.equal(state.package.registry_server_name, pkg.mcpName, 'Publication registry name differs from source package');
        assert.equal(state.source_candidate.version, pkg.version, 'Source candidate version differs from package');
        assert.equal(server.version, pkg.version, 'Candidate server manifest version differs from package');
        assert.equal(server.name, pkg.mcpName, 'Candidate server manifest name differs from package');
        const evidenceFiles = {};
        for (const name of ['npm', 'mcp_registry', 'github_tag', 'github_release']) {
            const observation = state.observations[name];
            if (['published', 'absent'].includes(observation.status)) {
                const file = retainedPath(root, observation.evidence_path, name);
                assert.equal(sha256(fs.readFileSync(file)), observation.evidence_sha256, `${name} retained evidence digest drift`);
                evidenceFiles[name] = file;
            }
        }
        const artifactBytes = fs.readFileSync(retainedPath(root, npm.artifact_snapshot_path, 'npm artifact snapshot'));
        assert.equal(sha256(artifactBytes), npm.artifact_snapshot_sha256, 'Published artifact snapshot digest drift');
        assert.deepEqual(snapshot, JSON.parse(artifactBytes), 'Published artifact snapshot content drift');
        const provider = JSON.parse(fs.readFileSync(evidenceFiles.npm, 'utf8'));
        assert.equal(provider.schema_version, 1, 'Unsupported provider evidence schema');
        for (const name of ['npm', 'mcp_registry', 'github_tag', 'github_release']) {
            const observed = state.observations[name];
            assert.equal(provider[name]?.observed_at, observed.observed_at, `${name} provider observation time drift`);
            assert.equal(provider[name]?.observation_status, observed.status, `${name} provider status drift`);
            assert.equal(provider[name]?.evidence_url, observed.evidence_url, `${name} provider evidence URL drift`);
            assert.match(provider[name]?.unretained_response_sha256 || '', /^[a-f0-9]{64}$/, `${name} retrieval response digest missing`);
        }
        assert.equal(provider.npm.name, state.package.name, 'npm provider package name drift');
        assert.equal(provider.npm.version, npm.version, 'npm provider version drift');
        assert.equal(provider.npm.integrity, npm.integrity, 'npm provider integrity drift');
        assert.equal(provider.npm.tarball_sha256, npm.tarball_sha256, 'npm provider tarball drift');
        assert.equal(provider.mcp_registry.name, state.package.registry_server_name, 'MCP Registry provider name drift');
        assert.equal(provider.mcp_registry.version, state.observations.mcp_registry.version, 'MCP Registry provider version drift');
        assert.equal(provider.github_tag.tag, state.observations.github_tag.tag, 'Git tag provider evidence drift');
        assert.equal(provider.github_release.tag, state.observations.github_release.tag, 'GitHub Release provider evidence drift');
        assert.match(provider.limits || '', /raw responses are not retained/, 'Provider evidence must distinguish unretained response digests');
        const guide = snapshot.guide;
        assert.equal(guide.packaged, false, 'Published package guide boundary changed without artifact evidence');
        const guidePath = path.join(root, guide.source_candidate_path || '');
        assert.equal(fs.existsSync(guidePath), true, 'Source candidate guide anchor is missing');
        assert.equal(sha256(fs.readFileSync(guidePath)), guide.source_candidate_sha256, 'Source candidate guide hash drift');
        if (checkHosted) {
            const hostedGuide = path.join(root, 'docs', new URL(guide.hosted_url).pathname.replace(/^\//, ''), 'index.html');
            assert.equal(fs.existsSync(hostedGuide), true, 'Hosted guide anchor is missing');
            assert.equal(sha256(fs.readFileSync(hostedGuide)), guide.hosted_sha256, 'Hosted guide hash drift');
        }
    }
    return true;
}

function publicMcpIdentity(state, snapshot, root, now, checkHosted = true) {
    validatePublicationState(state, snapshot, root, now, checkHosted);
    return {
        package: `${state.package.name}@${state.observations.npm.version}`,
        version: state.observations.npm.version,
        tools: {
            count: snapshot.tools.count,
            free_count: snapshot.tools.free_count,
            authenticated: [...snapshot.tools.authenticated],
            names: [...snapshot.tools.names]
        }
    };
}

function loadPublicationState(root, { checkHosted = true, now } = {}) {
    const statePath = path.join(root, 'design', 'publication-state.json');
    const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    const snapshotPath = retainedPath(root, state.observations?.npm?.artifact_snapshot_path, 'npm artifact snapshot');
    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
    return { state, snapshot, publicIdentity: publicMcpIdentity(state, snapshot, root, now, checkHosted), stateSha256: sha256(fs.readFileSync(statePath)) };
}

module.exports = { validatePublicationState, publicMcpIdentity, loadPublicationState };
