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

requireText('README.md', `Protocol specification v${version}; stable MCP server v${version}.`, 'current release claim');
requireText('README.md', `Obligations + mapping curation pass (${obligationCount} obligations, ${mappingCount} mappings)`, 'current curation totals');
requireText('ROADMAP.md', `Protocol specification \`v${version}\`; stable MCP server \`v${version}\``, 'current-version summary');
requireText('about/index.html', `Protocol v${version} · MCP server v${version}`, 'current protocol and MCP versions');
requireText('reference/index.html', `PubLedge v${version}`, 'current version');
requireText('reference/prior-art/index.html', `PubLedge Prior Art v${version}`, 'current version');
requireText('reference/vocabulary/index.html', `v${version}`, 'current version');
requireText(
    'reference/registry/index.html',
    `${project.containers.length} instruments · ${obligationCount} obligations · ${project.authorities.length} authorities · v${version}`,
    'current registry totals and version'
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

reportFailures('eval-public-claims', failures);
