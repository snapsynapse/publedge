#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { parseYaml, parseFrontmatter } = require('./parse');
const { loadMappingIndex } = require('./mapping');
const { loadMarkdownDir } = require('./content');

const ROOT = path.join(__dirname, '..', '..');
const DOCS_DIR = path.join(ROOT, 'docs');

function fail(message) {
    throw new Error(message);
}

function findDataDir() {
    for (const base of ['data/examples', 'data']) {
        const full = path.join(ROOT, base);
        if (fs.existsSync(full)) return full;
    }
    return path.join(ROOT, 'data');
}

function loadDir(dir) {
    return loadMarkdownDir(dir);
}

function loadContainers(dir) {
    return loadMarkdownDir(dir, { parseContainer: true });
}

function attachCanonicalPaths(containers, authorities, config) {
    const authById = Object.fromEntries(authorities.map(a => [a.id, a]));
    const jurMap = config.hierarchy?.jurisdictions || {};
    const typeMap = config.hierarchy?.type_segments || {};
    for (const c of containers) {
        const jur = jurMap[c.jurisdiction];
        const auth = authById[c.authority];
        const typeSeg = typeMap[c.type] || c.type || 'record';
        const instance = c.instance || c.id;
        if (jur && auth && auth.url_segment) {
            c._canonicalPath = `${jur.country}/${jur.region}/${auth.url_segment}/${typeSeg}/${instance}/`;
        } else {
            c._canonicalPath = `container/${c.id}/`;
        }
    }
    for (const a of authorities) {
        const jurMapEntry = jurMap[a.jurisdiction];
        if (jurMapEntry && a.url_segment) {
            a._canonicalPath = `${jurMapEntry.country}/${jurMapEntry.region}/${a.url_segment}/`;
        } else {
            a._canonicalPath = `authority/${a.id}/`;
        }
    }
}

function containerHref(c) {
    return '/' + (c._canonicalPath || `container/${c.id}/`);
}

function authorityHref(a) {
    return '/' + (a._canonicalPath || `authority/${a.id}/`);
}

function slugify(str) {
    return String(str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function loadProjectData() {
    const configPath = path.join(ROOT, 'project.yml');
    const config = parseYaml(fs.readFileSync(configPath, 'utf-8'));
    const dataDir = findDataDir();
    const primaryDir = path.join(dataDir, config.entities?.primary?.directory || 'primary');
    const containerDir = path.join(dataDir, config.entities?.container?.directory || 'container');
    const authorityDir = path.join(dataDir, config.entities?.authority?.directory || 'authority');
    const primaries = loadDir(primaryDir);
    const containers = loadContainers(containerDir);
    const authorities = loadDir(authorityDir);
    const mappingFile = config.mapping?.file || 'provisions/index.yml';
    let mappingPath = path.join(dataDir, mappingFile);
    if (!fs.existsSync(mappingPath)) mappingPath = path.join(dataDir, 'mapping', 'index.yml');
    const mappings = loadMappingIndex(mappingPath);
    attachCanonicalPaths(containers, authorities, config);
    return {
        config,
        dataDir,
        dirs: { primaryDir, containerDir, authorityDir, mappingPath },
        primaries,
        containers,
        authorities,
        mappings
    };
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function walkFiles(dir, predicate) {
    const results = [];
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...walkFiles(full, predicate));
        } else if (!predicate || predicate(full)) {
            results.push(full);
        }
    }
    return results;
}

function findRecordJsonFiles(baseDir = DOCS_DIR) {
    return walkFiles(baseDir, p => p.endsWith(`${path.sep}record.json`));
}

function resolveDocsPath(urlOrPath, docsDir = DOCS_DIR) {
    if (!urlOrPath) return null;
    let href = String(urlOrPath).trim();
    if (!href) return null;
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || href.startsWith('data:')) return null;
    if (/^https?:\/\//.test(href)) {
        const u = new URL(href);
        if (u.hostname !== 'publedge.org') return null;
        href = u.pathname;
    }
    href = href.split('#')[0].split('?')[0];
    if (!href) return null;
    const clean = href.replace(/^\//, '');
    const candidate = path.join(docsDir, clean);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        const indexPath = path.join(candidate, 'index.html');
        if (fs.existsSync(indexPath)) return indexPath;
    }
    if (!path.extname(candidate)) {
        const indexPath = path.join(candidate, 'index.html');
        if (fs.existsSync(indexPath)) return indexPath;
    }
    return candidate;
}

function normalizeGeneratedContent(relPath, raw) {
    if (relPath.endsWith('.json')) {
        try {
            const json = JSON.parse(raw);
            stripDynamicJson(json);
            return JSON.stringify(json, null, 2);
        } catch (_) {
            return raw;
        }
    }
    return raw
        .replace(/"generated":\s*"[^"]+"/g, '"generated":"__GENERATED__"')
        .replace(/<lastmod>[^<]+<\/lastmod>/g, '<lastmod>__LASTMOD__</lastmod>')
        .replace(/<lastBuildDate>[^<]+<\/lastBuildDate>/g, '<lastBuildDate>__LAST_BUILD_DATE__</lastBuildDate>')
        .replace(/<pubDate>[^<]+<\/pubDate>/g, '<pubDate>__PUB_DATE__</pubDate>')
        .replace(/<updated>[^<]+<\/updated>/g, '<updated>__UPDATED__</updated>')
        .replace(/^DTSTAMP:\d{8}T\d{6}Z$/gm, 'DTSTAMP:__STAMP__')
        .replace(/^CREATED:\d{8}T\d{6}Z$/gm, 'CREATED:__STAMP__')
        .replace(/^LAST-MODIFIED:\d{8}T\d{6}Z$/gm, 'LAST-MODIFIED:__STAMP__');
}

function stripDynamicJson(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
        value.forEach(stripDynamicJson);
        return;
    }
    for (const key of Object.keys(value)) {
        if (key === 'generated') {
            value[key] = '__GENERATED__';
            continue;
        }
        if ((key === 'updated' || key === 'date_modified' || key === 'date_published') && typeof value[key] === 'string' && /T\d{2}:\d{2}:\d{2}/.test(value[key])) {
            value[key] = '__TIMESTAMP__';
            continue;
        }
        stripDynamicJson(value[key]);
    }
}

function runBuild(outputDir) {
    const env = { ...process.env, KAC_OUTPUT_DIR: outputDir };
    const steps = [
        { label: 'build.js', args: ['scripts/build.js'] },
        { label: 'build-extras.js', args: ['scripts/build-extras.js'] }
    ];
    for (const step of steps) {
        const res = spawnSync(process.execPath, step.args, {
            cwd: ROOT,
            env,
            encoding: 'utf-8'
        });
        if (res.status !== 0) {
            fail(`${step.label} failed for ${outputDir}:\n${res.stdout}\n${res.stderr}`);
        }
    }
}

function withTempBuild(fn) {
    const tempName = `.publedge-eval-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const tempDir = path.join(ROOT, tempName);
    fs.mkdirSync(tempDir, { recursive: true });
    try {
        runBuild(tempName);
        return fn(tempDir);
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

function collectManagedHtml(baseDir) {
    const managedRoots = [
        'applies-to',
        'authority',
        'compare',
        'primary',
        'requires',
        'us'
    ];
    const out = new Set();
    for (const root of managedRoots) {
        const dir = path.join(baseDir, root);
        for (const file of walkFiles(dir, p => p.endsWith('.html'))) {
            out.add(path.relative(baseDir, file));
        }
    }
    return out;
}

function collectManagedGeneratedPaths(baseDir) {
    const managedRoots = [
        'applies-to',
        'authority',
        'compare',
        'primary',
        'requires',
        'us'
    ];
    const out = new Set();
    for (const root of managedRoots) {
        const dir = path.join(baseDir, root);
        for (const file of walkFiles(dir, p => p.endsWith('.html') || p.endsWith('.json'))) {
            out.add(path.relative(baseDir, file));
        }
    }
    return out;
}

function collectAllFiles(baseDir) {
    return walkFiles(baseDir).map(file => path.relative(baseDir, file)).sort();
}

function getExpectedCanonicalRoutes(project) {
    const routes = new Set();
    routes.add('index.html');
    routes.add('instruments.html');
    routes.add('obligations.html');
    routes.add('authorities.html');
    routes.add('matrix.html');
    routes.add('compare.html');
    routes.add('404.html');
    routes.add('about/index.html');
    routes.add('templates/index.html');
    routes.add('definitions/index.html');
    routes.add('reference/index.html');
    for (const container of project.containers) {
        routes.add(path.join(container._canonicalPath, 'index.html'));
        routes.add(path.join(container._canonicalPath, 'record.json'));
    }
    for (const authority of project.authorities) {
        routes.add(path.join(authority._canonicalPath, 'index.html'));
    }
    for (const primary of project.primaries) {
        routes.add(path.join('primary', primary.id, 'index.html'));
    }
    for (const mapping of project.mappings) {
        for (const obligation of mapping.obligations || []) {
            routes.add(path.join('requires', mapping.regulation, obligation, 'index.html'));
        }
    }
    for (let i = 0; i < project.containers.length; i++) {
        for (let j = i + 1; j < project.containers.length; j++) {
            routes.add(path.join('compare', `${project.containers[i].id}-vs-${project.containers[j].id}`, 'index.html'));
        }
    }
    const scopeField = project.config.entities?.container?.scope_field || project.config.bridges?.applies_to?.field || 'jurisdiction';
    const scopes = [...new Set(project.containers.map(c => c[scopeField]).filter(Boolean))];
    for (const scope of scopes) {
        routes.add(path.join('applies-to', slugify(scope), 'index.html'));
    }
    return routes;
}

function parseSitemapXml(xml) {
    const urls = [];
    const urlMatches = xml.matchAll(/<loc>([^<]+)<\/loc>/g);
    for (const match of urlMatches) urls.push(match[1]);
    return urls;
}

function parseLlmsUrls(text) {
    return [...text.matchAll(/\((https:\/\/publedge\.org\/[^)]+)\)/g)].map(m => m[1]);
}

function listRedirectHtmlFiles(baseDir = DOCS_DIR) {
    return walkFiles(baseDir, p => p.endsWith('.html')).filter(file => {
        const html = fs.readFileSync(file, 'utf-8');
        return /http-equiv="refresh"/.test(html) || /window\.location\.replace/.test(html);
    });
}

function reportFailures(evalName, failures, extra) {
    if (!failures.length) {
        console.log(`${evalName}: OK`);
        return;
    }
    console.error(`${evalName}: FAILED (${failures.length})`);
    failures.forEach(item => console.error(`- ${item}`));
    if (extra) console.error(extra);
    process.exit(1);
}

module.exports = {
    ROOT,
    DOCS_DIR,
    parseYaml,
    parseFrontmatter,
    loadProjectData,
    readJson,
    walkFiles,
    findRecordJsonFiles,
    resolveDocsPath,
    normalizeGeneratedContent,
    withTempBuild,
    collectManagedHtml,
    collectManagedGeneratedPaths,
    collectAllFiles,
    getExpectedCanonicalRoutes,
    parseSitemapXml,
    parseLlmsUrls,
    listRedirectHtmlFiles,
    reportFailures,
    containerHref,
    authorityHref
};
