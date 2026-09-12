#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, DOCS_DIR, readJson, resolveDocsPath, reportFailures } = require('./lib/eval-kit');
const { loadPublicationState } = require('./lib/publication-state');

const failures = [];
const pkg = readJson(path.join(ROOT, 'package.json'));
const server = readJson(path.join(ROOT, 'server.json'));
const agents = readJson(path.join(DOCS_DIR, 'agents.json'));
const api = readJson(path.join(DOCS_DIR, 'api', 'v1', 'index.json'));
const mcp = readJson(path.join(DOCS_DIR, '.well-known', 'mcp.json'));
const publication = loadPublicationState(ROOT);
const published = publication.publicIdentity;

if (server.name !== pkg.mcpName) failures.push(`server.json name ${server.name} does not match package mcpName ${pkg.mcpName}`);
if (server.version !== pkg.version) failures.push(`server.json version ${server.version} does not match package version ${pkg.version}`);
if (server.packages?.[0]?.version !== pkg.version) failures.push('server.json package version does not match package.json');
if (server._meta?.['io.modelcontextprotocol.registry/publisher-provided']?.discovery !== 'https://publedge.org/.well-known/mcp.json') {
    failures.push('server.json does not advertise the canonical MCP discovery URL');
}

const install = mcp.mcpServers?.publedge;
requireLocal('MCP publication state', mcp.publication_state);
if (install?.command !== 'npx' || JSON.stringify(install?.args) !== JSON.stringify(['-y', published.package])) {
    failures.push(`/.well-known/mcp.json must install exact published package ${published.package}`);
}
if (install?.published_version !== published.version) failures.push('/.well-known/mcp.json published version drift');
if (install?.source_candidate?.version !== pkg.version || install?.source_candidate?.status !== 'unpublished-source') failures.push('/.well-known/mcp.json source candidate boundary drift');
if (JSON.stringify(install?.tools) !== JSON.stringify(published.tools.names)) failures.push('/.well-known/mcp.json published tool catalog drift');

const ids = (agents.capabilities || []).map(capability => capability.id);
for (const id of new Set(ids)) {
    if (ids.filter(candidate => candidate === id).length > 1) failures.push(`duplicate agents.json capability id: ${id}`);
}
const agentMcp = (agents.capabilities || []).find(capability => capability.id === 'mcp-server');
if (!agentMcp?.description?.includes(`npx -y ${published.package}`)) failures.push('agents.json MCP install is not exact-pinned');
if (JSON.stringify(agentMcp?.published_tools) !== JSON.stringify(published.tools.names)) failures.push('agents.json published tool catalog drift');
if (!agentMcp?.source_candidate || !agentMcp?.published_artifact) failures.push('agents.json does not distinguish source candidate from published artifact');
requireLocal('agents MCP publication state', agentMcp?.publication_state);

function requireLocal(label, url) {
    if (!resolveDocsPath(url)) failures.push(`${label} does not resolve inside docs/: ${url}`);
}

for (const capability of agents.capabilities || []) {
    if (capability.url) requireLocal(`capability ${capability.id}`, capability.url);
    for (const endpoint of capability.endpoints || []) requireLocal(`capability ${capability.id} endpoint`, endpoint.path);
}
for (const [name, url] of Object.entries(agents.discovery || {})) requireLocal(`agents discovery ${name}`, url);

const requiredApiFiles = [
    'primaries.json', 'containers.json', 'authorities.json', 'mappings.json', 'matrix.json',
    'comparisons.json', 'upcoming.json', 'recently_changed.json', 'of/index.json'
];
const fileEntries = Array.isArray(api.files) ? api.files : Object.values(api.files || {});
const advertisedFiles = new Set(fileEntries.map(item => typeof item === 'string' ? item : item.path));
for (const file of requiredApiFiles) {
    if (!advertisedFiles.has(file)) failures.push(`api/v1/index.json does not advertise ${file}`);
    requireLocal(`API file ${file}`, `/api/v1/${file}`);
}
const resourceEntries = Array.isArray(api.resources) ? api.resources : Object.entries(api.resources || {}).map(([name, resource]) => ({ name, ...resource }));
for (const resource of resourceEntries) requireLocal(`API resource ${resource.name || resource.url}`, resource.url);

reportFailures('eval-discovery-contract', failures);
