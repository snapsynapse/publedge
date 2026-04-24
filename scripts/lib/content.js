#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter } = require('./parse');

function parseTable(tableText) {
    const lines = tableText.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
    const rows = [];
    for (let i = 2; i < lines.length; i++) {
        const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean);
        const row = {};
        headers.forEach((h, idx) => {
            row[h.toLowerCase().replace(/\s+/g, '_')] = cells[idx] || '';
        });
        rows.push(row);
    }
    return rows;
}

function parseProvisionSection(section) {
    const trimmed = section.trim();
    const lines = trimmed.split('\n');
    const nameMatch = lines[0].match(/^## (.+)/);
    if (!nameMatch) return null;

    const provision = { name: nameMatch[1] };

    const propTableMatch = trimmed.match(/\| Property \| Value \|[\s\S]*?\n\n/);
    if (propTableMatch) {
        parseTable(propTableMatch[0]).forEach(p => {
            provision[p.property.toLowerCase().replace(/\s+/g, '_')] = p.value;
        });
    }

    const reqMatch = trimmed.match(/### Requirements\n\n([\s\S]*?)(?=\n###|\n---|\n## |$)/);
    if (reqMatch) provision.requirements = parseTable(reqMatch[1]);

    const penMatch = trimmed.match(/### Penalties\n\n([\s\S]*?)(?=\n###|\n---|\n## |$)/);
    if (penMatch) provision.penalties = parseTable(penMatch[1]);

    const srcMatch = trimmed.match(/### Sources\n\n([\s\S]*?)(?=\n###|\n---|\n## |$)/);
    if (srcMatch) {
        provision.sources = (srcMatch[1].match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).map(s => {
            const m = s.match(/\[([^\]]+)\]\(([^)]+)\)/);
            return m ? { title: m[1], url: m[2] } : null;
        }).filter(Boolean);
    }

    const talkMatch = trimmed.match(/### Talking Point\n\n> "([^"]+)"/);
    if (talkMatch) provision.talking_point = talkMatch[1];

    return provision;
}

function parseContainerBody(body) {
    const timelineMatch = body.match(/## Timeline\n\n([\s\S]*?)(?=\n---|\n## )/);
    const timeline = timelineMatch ? parseTable(timelineMatch[1]) : [];
    const provisionSections = body.split(/\n---\n/).slice(1);
    const provisions = provisionSections.map(parseProvisionSection).filter(Boolean);
    return { timeline, provisions };
}

function loadMarkdownDir(dir, options = {}) {
    const { includeFile = false, parseContainer = false } = options;
    if (!fs.existsSync(dir)) return [];

    return fs.readdirSync(dir)
        .filter(f => f.endsWith('.md') && !f.startsWith('_'))
        .map(f => {
            const content = fs.readFileSync(path.join(dir, f), 'utf-8');
            const { frontmatter, body } = parseFrontmatter(content);
            const id = f.replace('.md', '');
            const record = { id, ...frontmatter, _body: body };
            if (includeFile) record._file = f;
            if (parseContainer) Object.assign(record, parseContainerBody(body));
            return record;
        });
}

module.exports = {
    parseTable,
    parseProvisionSection,
    parseContainerBody,
    loadMarkdownDir
};
