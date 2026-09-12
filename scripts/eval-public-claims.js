#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, loadProjectData, reportFailures } = require('./lib/eval-kit');

const project = loadProjectData();
const failures = [];
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
const lock = JSON.parse(fs.readFileSync(path.join(ROOT, 'package-lock.json'), 'utf-8'));
const server = JSON.parse(fs.readFileSync(path.join(ROOT, 'server.json'), 'utf-8'));
const read = source => fs.readFileSync(path.join(ROOT, source), 'utf-8');
const readme = read('README.md');
const obligationCount = fs.readdirSync(path.join(project.dataDir, 'obligations')).filter(file => file.endsWith('.md')).length;
const mappingCount = project.mappings.length;
const version = pkg.version;
const protocolVersion = read('PROTOCOL.md').match(/^version:\s*["']?([^"'\s]+)["']?\s*$/m)?.[1];

if (!protocolVersion) failures.push('PROTOCOL.md is missing a parseable frontmatter version');

function requireText(source, needle, reason) {
    if (!read(source).includes(needle)) failures.push(`${source} missing ${reason}: ${needle}`);
}

for (const [label, expected] of [
    ['instruments', project.containers.length],
    ['obligations', obligationCount],
    ['authorities', project.authorities.length]
]) {
    const badgePattern = new RegExp(`registry-[^\\n)]*${expected}%20${label}`);
    if (!badgePattern.test(readme)) failures.push(`README registry badge does not report ${expected} ${label}`);
}

requireText('README.md', `Package v${version}; protocol specification v${protocolVersion}.`, 'package and protocol version contract');
requireText('README.md', 'https://publedge.org/design/publication-state.json', 'canonical provider-observation link');
requireText('README.md', `"args": ["-y", "${pkg.name}@${version}"]`, 'package MCP install contract');
requireText('README.md', `Obligations + mapping curation pass (${obligationCount} obligations, ${mappingCount} mappings)`, 'current curation totals');
requireText('ROADMAP.md', `Package \`v${version}\`; protocol specification \`v${protocolVersion}\`.`, 'package and protocol roadmap summary');
requireText('about/index.html', `Package v${version} · Protocol v${protocolVersion} · <a href="/design/publication-state.json">Provider observations</a>`, 'provider-observation link');
requireText('reference/index.html', 'PubLedge recordkeeping protocol · <a href="/design/publication-state.json">Provider observations</a>', 'provider-observation footer');
requireText('reference/prior-art/index.html', `PubLedge Prior Art v${protocolVersion}`, 'current protocol version');
requireText('reference/vocabulary/index.html', `v${protocolVersion}`, 'current protocol version');
requireText(
    'reference/registry/index.html',
    `${project.containers.length} instruments · ${obligationCount} obligations · ${project.authorities.length} authorities`,
    'current registry totals'
);

if (lock.version !== version) failures.push(`package-lock.json version ${lock.version} does not match package.json ${version}`);
if (lock.packages?.['']?.version !== version) {
    failures.push(`package-lock.json root package version ${lock.packages?.['']?.version} does not match package.json ${version}`);
}
if (server.version !== version) failures.push(`server.json version ${server.version} does not match package.json ${version}`);
if (server.packages?.[0]?.version !== version) {
    failures.push(`server.json package version ${server.packages?.[0]?.version} does not match package.json ${version}`);
}

const sources = [
    'README.md',
    'about/index.html',
    'reference/index.html',
    'reference/prior-art/index.html',
    'reference/registry/index.html',
    'reference/vocabulary/index.html',
    'SECURITY.md'
];
const forbidden = [
    ['v0.1.0-pre', 'stale protocol version'],
    ['forthcoming v0.1 release', 'stale forthcoming-release claim'],
    ['hash-pinned', 'overstated integrity claim'],
    ['14 instruments', 'stale registry count'],
    ['7 authorities', 'stale authority count'],
    ['v0.1.2-pre', 'stale prerelease version']
];
for (const source of sources) {
    const text = read(source);
    for (const [needle, reason] of forbidden) {
        if (text.includes(needle)) failures.push(`${source} contains ${reason}: ${needle}`);
    }
}
for (const source of ['README.md', 'about/index.html']) {
    if (new RegExp(`npx -y ${pkg.name}(?!@)`).test(read(source))) failures.push(`${source} contains an unpinned public MCP install`);
}
for (const [needle, reason] of [
    ['published MCP server', 'mutable published-package label'],
    ['source candidate v', 'mutable source-candidate label'],
    ['unpublished source candidate', 'mutable unpublished-source label']
]) {
    if (readme.includes(needle)) failures.push(`README.md contains ${reason}: ${needle}`);
}

reportFailures('eval-public-claims', failures);
