#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { DOCS_DIR, readJson, findRecordJsonFiles, reportFailures } = require('./lib/eval-kit');

const failures = [];
const jsonFeed = readJson(path.join(DOCS_DIR, 'feed.json'));
if (jsonFeed.version !== 'https://jsonfeed.org/version/1.1') failures.push('feed.json is not JSON Feed 1.1');
if (!Array.isArray(jsonFeed.items)) failures.push('feed.json items must be an array');

function assertXml(file, rootPattern, itemTag) {
    const xml = fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8');
    if (!rootPattern.test(xml)) failures.push(`${file} has the wrong root element`);
    if (itemTag) {
        const opens = (xml.match(new RegExp(`<${itemTag}(?:\\s|>)`, 'g')) || []).length;
        const closes = (xml.match(new RegExp(`</${itemTag}>`, 'g')) || []).length;
        if (opens !== closes) failures.push(`${file} has unbalanced ${itemTag} elements`);
    }
}

assertXml('feed.xml', /<rss\b[^>]*version="2\.0"/, 'item');
assertXml('atom.xml', /<feed\b[^>]*xmlns="http:\/\/www\.w3\.org\/2005\/Atom"/, 'entry');
for (const file of fs.readdirSync(DOCS_DIR).filter(name => /^sitemap.*\.xml$/.test(name))) {
    assertXml(file, /<(?:sitemapindex|urlset)\b[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
}

const calendar = fs.readFileSync(path.join(DOCS_DIR, 'calendar.ics'), 'utf-8').replace(/\r\n/g, '\n');
if (!calendar.startsWith('BEGIN:VCALENDAR\n') || !calendar.trimEnd().endsWith('END:VCALENDAR')) failures.push('calendar.ics is not a complete VCALENDAR');
const events = [...calendar.matchAll(/BEGIN:VEVENT\n([\s\S]*?)END:VEVENT/g)].map(match => match[1]);
if ((calendar.match(/BEGIN:VEVENT/g) || []).length !== events.length) failures.push('calendar.ics has unbalanced VEVENT blocks');
for (const [index, event] of events.entries()) {
    for (const field of ['UID:', 'DTSTART', 'SUMMARY:']) {
        if (!event.includes(field)) failures.push(`calendar.ics event ${index + 1} is missing ${field}`);
    }
}

for (const file of findRecordJsonFiles()) {
    const payload = readJson(file);
    const rel = path.relative(DOCS_DIR, file);
    if (!payload.jsonld?.['@context'] || !payload.jsonld?.['@type']) failures.push(`${rel} lacks JSON-LD context or type`);
    if (payload.record?.url !== payload.meta?.canonical_url) failures.push(`${rel} record.url and meta.canonical_url differ`);
}

reportFailures('eval-format-contracts', failures);
