#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
    DOCS_DIR,
    readJson,
    resolveDocsPath,
    parseSitemapXml,
    parseLlmsUrls,
    reportFailures
} = require('./lib/eval-kit');

const failures = [];

function checkUrl(url, source) {
    const resolved = resolveDocsPath(url);
    if (!resolved || !fs.existsSync(resolved)) failures.push(`${source} references missing URL ${url}`);
}

const llmsTxt = fs.readFileSync(path.join(DOCS_DIR, 'llms.txt'), 'utf-8');
for (const url of parseLlmsUrls(llmsTxt)) checkUrl(url, 'llms.txt');

const agents = readJson(path.join(DOCS_DIR, 'agents.json'));
for (const capability of agents.capabilities || []) {
    if (capability.url) checkUrl(capability.url, `agents.json capability ${capability.id || capability.name}`);
}
for (const container of agents.content?.containers || []) {
    if (container.url) checkUrl(container.url, `agents.json container ${container.id}`);
}
for (const template of agents.content?.templates || []) {
    if (template.url) checkUrl(template.url, `agents.json template ${template.id || template.slug}`);
}
if (agents.integrity?.manifest) checkUrl(agents.integrity.manifest, 'agents.json integrity.manifest');

for (const sitemapName of fs.readdirSync(DOCS_DIR).filter(name => /^sitemap.*\.xml$/.test(name))) {
    const xml = fs.readFileSync(path.join(DOCS_DIR, sitemapName), 'utf-8');
    for (const url of parseSitemapXml(xml)) checkUrl(url, sitemapName);
}

for (const topLevel of ['feed.xml', 'feed.json', 'atom.xml', 'robots.txt']) {
    if (!fs.existsSync(path.join(DOCS_DIR, topLevel))) failures.push(`missing discovery artifact ${topLevel}`);
}

reportFailures('eval-discovery', failures);
