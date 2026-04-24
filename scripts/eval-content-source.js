#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, loadProjectData, reportFailures } = require('./lib/eval-kit');

const project = loadProjectData();
const failures = [];

for (const mapping of project.mappings) {
    const sourceFile = mapping.source_file ? path.join(ROOT, mapping.source_file) : null;
    if (!sourceFile || !fs.existsSync(sourceFile)) {
        failures.push(`mapping ${mapping.id} references missing source_file ${mapping.source_file || '(unset)'}`);
        continue;
    }
    if (mapping.source_heading) {
        const content = fs.readFileSync(sourceFile, 'utf-8');
        const headingRegex = new RegExp(`^#{1,6}\\s+${mapping.source_heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm');
        if (!headingRegex.test(content) && !content.includes(mapping.source_heading)) {
            failures.push(`mapping ${mapping.id} source_heading not found in ${mapping.source_file}: ${mapping.source_heading}`);
        }
    }
}

reportFailures('eval-content-source', failures);
