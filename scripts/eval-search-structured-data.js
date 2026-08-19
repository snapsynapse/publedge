#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const failures = [];

const home = fs.readFileSync(path.join(DOCS, 'index.html'), 'utf8');
if (!home.includes('<link rel="canonical" href="https://publedge.org/">')) {
    failures.push('docs/index.html: missing exact homepage canonical');
}

const jsonLdBlocks = [...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
if (jsonLdBlocks.length === 0) {
    failures.push('docs/index.html: missing JSON-LD');
} else {
    for (const [, source] of jsonLdBlocks) {
        let payload;
        try {
            payload = JSON.parse(source);
        } catch (error) {
            failures.push(`docs/index.html: invalid JSON-LD: ${error.message}`);
            continue;
        }
        const nodes = payload['@graph'] || [payload];
        for (const catalog of nodes.filter(node => node['@type'] === 'DataCatalog')) {
            for (const dataset of catalog.dataset || []) {
                const label = dataset.name || '(unnamed Dataset)';
                if (!dataset.description) failures.push(`${label}: missing Dataset description`);
                if (!dataset.license) failures.push(`${label}: missing Dataset license`);
                if (!dataset.creator) failures.push(`${label}: missing Dataset creator`);
            }
        }
    }
}

function walk(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) walk(file);
        else if (entry.name === 'index.html') {
            const html = fs.readFileSync(file, 'utf8');
            if (/undefined\s+vs\s+undefined/i.test(html)) {
                failures.push(`${path.relative(ROOT, file)}: undefined comparison title`);
            }
        }
    }
}

walk(path.join(DOCS, 'compare'));

if (failures.length > 0) {
    for (const failure of failures) console.error(`FAIL ${failure}`);
    process.exit(1);
}

console.log('Homepage canonical, Dataset fields, and comparison titles are valid.');
