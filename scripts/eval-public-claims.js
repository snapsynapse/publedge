#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, loadProjectData, reportFailures } = require('./lib/eval-kit');

const project = loadProjectData();
const failures = [];
const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf-8');
const obligationCount = fs.readdirSync(path.join(project.dataDir, 'obligations')).filter(file => file.endsWith('.md')).length;

for (const [label, expected] of [
    ['instruments', project.containers.length],
    ['obligations', obligationCount],
    ['authorities', project.authorities.length]
]) {
    const badgePattern = new RegExp(`registry-[^\\n)]*${expected}%20${label}`);
    if (!badgePattern.test(readme)) failures.push(`README registry badge does not report ${expected} ${label}`);
}

const sources = ['README.md', 'about/index.html', 'reference/vocabulary/index.html', 'SECURITY.md', 'package.json'];
const forbidden = [
    ['v0.1.0-pre', 'stale protocol version'],
    ['forthcoming v0.1 release', 'stale forthcoming-release claim'],
    ['hash-pinned', 'overstated integrity claim'],
    ['14 instruments', 'stale registry count'],
    ['7 authorities', 'stale authority count']
];
for (const source of sources) {
    const text = fs.readFileSync(path.join(ROOT, source), 'utf-8');
    for (const [needle, reason] of forbidden) {
        if (text.includes(needle)) failures.push(`${source} contains ${reason}: ${needle}`);
    }
}

reportFailures('eval-public-claims', failures);
