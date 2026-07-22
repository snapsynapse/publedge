#!/usr/bin/env node
'use strict';

/**
 * Knowledge-as-Code — MCP Server
 * Zero-dependency Model Context Protocol server over JSON-RPC / stdio.
 *
 * Reads project.yml at startup and exposes entity data as MCP tools
 * with dynamic names derived from the configured ontology.
 *
 * Usage: node mcp-server.js   (called by MCP host via stdio)
 */

const fs = require('fs');
const path = require('path');
const { parseYaml } = require('./scripts/lib/parse');
const { loadMarkdownDir } = require('./scripts/lib/content');
const { loadMappingIndex } = require('./scripts/lib/mapping');

const ROOT = __dirname;

// ---------------------------------------------------------------------------
// Shared helpers (from scripts/build.js)
// ---------------------------------------------------------------------------

function slugify(str) {
    return String(str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function humanizeId(id) {
    return String(id || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function findDataDir() {
    const dirs = ['data/examples', 'data'];
    for (const base of dirs) {
        const fullBase = path.join(ROOT, base);
        if (fs.existsSync(fullBase)) return fullBase;
    }
    return path.join(ROOT, 'data');
}

function loadDir(dir) {
    return loadMarkdownDir(dir);
}

function loadContainers(dir) {
    return loadMarkdownDir(dir, { parseContainer: true });
}

// ---------------------------------------------------------------------------
// Load project data
// ---------------------------------------------------------------------------

const config = (() => {
    const configPath = path.join(ROOT, 'project.yml');
    if (!fs.existsSync(configPath)) {
        process.stderr.write('Error: project.yml not found.\n');
        process.exit(1);
    }
    return parseYaml(fs.readFileSync(configPath, 'utf-8'));
})();

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

// ---------------------------------------------------------------------------
// Tool name derivation
// ---------------------------------------------------------------------------

const primaryName = slugify(config.entities?.primary?.name || 'primary');
const primaryPlural = slugify(config.entities?.primary?.plural || 'primaries');
const containerName = slugify(config.entities?.container?.name || 'container');
const containerPlural = slugify(config.entities?.container?.plural || 'containers');
const authorityName = slugify(config.entities?.authority?.name || 'authority');
const authorityPlural = slugify(config.entities?.authority?.plural || 'authorities');

// ---------------------------------------------------------------------------
// Boundary helper
// ---------------------------------------------------------------------------

// Canonical URL helpers — mirror scripts/build.js::attachCanonicalPaths.
function canonicalPathForContainer(c) {
    const jurMap = config.hierarchy?.jurisdictions || {};
    const typeMap = config.hierarchy?.type_segments || {};
    const jur = jurMap[c.jurisdiction];
    const auth = authorities.find(a => a.id === c.authority);
    const typeSeg = typeMap[c.type] || c.type || 'record';
    const instance = c.instance || c.id;
    if (jur && auth && auth.url_segment) {
        return `/${jur.country}/${jur.region}/${auth.url_segment}/${typeSeg}/${instance}/`;
    }
    return `/container/${c.id}/`;
}
function canonicalUrlForContainer(c) {
    const base = (config.url || 'https://publedge.org/').replace(/\/$/, '');
    return base + canonicalPathForContainer(c);
}

function normalizeFetchPath(rawInput) {
    const input = String(rawInput || '');
    const raw = input.trim();
    if (!raw) return { error: 'Empty url' };
    if (raw !== input) return { error: 'URL contains leading or trailing whitespace' };
    if (/[\u0000-\u001f\u007f\s]/.test(raw)) return { error: 'URL contains whitespace or control characters' };
    if (raw.includes('\\') || /%5c/i.test(raw)) return { error: 'URL contains a backslash' };
    if (/^\/\/|^%2f%2f/i.test(raw)) return { error: 'Protocol-relative URLs are not canonical PubLedge URLs' };
    if (/%2f/i.test(raw)) return { error: 'Encoded slashes are not canonical PubLedge URLs' };
    if (/%2e/i.test(raw)) return { error: 'Encoded dot segments are not canonical PubLedge URLs' };

    const configured = new URL(config.url || 'https://publedge.org/');
    let pathname;

    if (/^https?:\/\//i.test(raw)) {
        let parsed;
        try {
            parsed = new URL(raw);
        } catch (_) {
            return { error: 'Malformed absolute URL' };
        }
        const canonicalPrefix = configured.origin + '/';
        if (!raw.startsWith(canonicalPrefix)) return { error: `URL origin must be exactly ${configured.origin}` };
        if (parsed.protocol !== 'https:') return { error: 'Canonical PubLedge URLs must use https' };
        if (parsed.origin !== configured.origin) return { error: `URL origin must be ${configured.origin}` };
        if (parsed.search || parsed.hash) return { error: 'Canonical PubLedge URLs must not include query strings or fragments' };
        pathname = parsed.pathname;
    } else {
        if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return { error: 'Unsupported URL scheme' };
        if (!raw.startsWith('/')) return { error: 'Relative canonical paths must start with /' };
        if (raw.includes('?') || raw.includes('#')) return { error: 'Canonical PubLedge paths must not include query strings or fragments' };
        pathname = raw;
    }

    if (!pathname.startsWith('/')) return { error: 'Canonical path must start with /' };
    if (pathname.includes('//')) return { error: 'Canonical path must not contain empty path segments' };
    if (pathname.split('/').some(part => part === '.' || part === '..')) return { error: 'Canonical path must not contain dot segments' };
    return { path: pathname.replace(/\/+$/, '') + '/' };
}

function boundary(message, suggestions, why) {
    const b = { message, suggestions: suggestions || [] };
    if (why) b.why = why;
    return b;
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

function getToolDefinitions() {
    const pName = config.entities?.primary?.name || 'Primary';
    const pPlural = config.entities?.primary?.plural || 'Primaries';
    const cName = config.entities?.container?.name || 'Container';
    const cPlural = config.entities?.container?.plural || 'Containers';
    const aName = config.entities?.authority?.name || 'Authority';
    const aPlural = config.entities?.authority?.plural || 'Authorities';

    return [
        {
            name: `list_${primaryPlural}`,
            description: `List all ${pPlural.toLowerCase()} in the knowledge base. Returns id, title, and group for each.`,
            inputSchema: { type: 'object', properties: {}, required: [] }
        },
        {
            name: `get_${primaryName}`,
            description: `Get a single ${pName.toLowerCase()} by its ID. Returns all frontmatter fields and body content.`,
            inputSchema: {
                type: 'object',
                properties: { id: { type: 'string', description: `The ${pName.toLowerCase()} ID (filename without .md)` } },
                required: ['id']
            }
        },
        {
            name: `list_${containerPlural}`,
            description: `List ${cPlural.toLowerCase()} in the knowledge base. Optional filters: jurisdiction, authority, type, status. Returns id, title, status, authority, type, jurisdiction, and canonical url for each match.`,
            inputSchema: {
                type: 'object',
                properties: {
                    jurisdiction: { type: 'string', description: 'Filter by jurisdiction slug (e.g. "us-ut", "us").' },
                    authority: { type: 'string', description: 'Filter by authority slug (e.g. "utah-oaip", "cfpb").' },
                    type: { type: 'string', description: 'Filter by instrument type (e.g. "statute", "rma", "jia", "ao", "nal", "plr", "il").' },
                    status: { type: 'string', description: 'Filter by status (e.g. "enforcing", "executed", "enacted").' }
                },
                required: []
            }
        },
        {
            name: `get_${containerName}`,
            description: `Get a single ${cName.toLowerCase()} by its ID. Returns frontmatter, timeline, and provisions.`,
            inputSchema: {
                type: 'object',
                properties: { id: { type: 'string', description: `The ${cName.toLowerCase()} ID (filename without .md)` } },
                required: ['id']
            }
        },
        {
            name: `list_${authorityPlural}`,
            description: `List all ${aPlural.toLowerCase()} in the knowledge base.`,
            inputSchema: { type: 'object', properties: {}, required: [] }
        },
        {
            name: `get_${authorityName}`,
            description: `Get a single ${aName.toLowerCase()} by its ID. Returns all frontmatter fields and body content.`,
            inputSchema: {
                type: 'object',
                properties: { id: { type: 'string', description: `The ${aName.toLowerCase()} ID (filename without .md)` } },
                required: ['id']
            }
        },
        {
            name: 'search',
            description: 'Full-text search across all entities in the knowledge base. Searches titles, IDs, and body content.',
            inputSchema: {
                type: 'object',
                properties: { query: { type: 'string', description: 'Search query (case-insensitive substring match)' } },
                required: ['query']
            }
        },
        {
            name: 'get_matrix',
            description: `Coverage matrix showing which ${pPlural.toLowerCase()} are addressed by which ${cPlural.toLowerCase()}.`,
            inputSchema: { type: 'object', properties: {}, required: [] }
        },
        {
            name: 'get_mappings',
            description: `All mapping entries connecting ${cPlural.toLowerCase()} to ${pPlural.toLowerCase()} via ${config.entities?.secondary?.plural?.toLowerCase() || 'secondaries'}.`,
            inputSchema: { type: 'object', properties: {}, required: [] }
        },
        {
            name: 'fetch_by_url',
            description: `Fetch a ${cName.toLowerCase()} by its canonical URL (e.g. https://publedge.org/us/utah/oaip/rma/2025-001/ or /us/utah/oaip/rma/2025-001/). Returns the same payload as get_${containerName}.`,
            inputSchema: {
                type: 'object',
                properties: { url: { type: 'string', description: 'Canonical hierarchical URL or path.' } },
                required: ['url']
            }
        },
        {
            name: 'search_obligations',
            description: `Search only within ${pPlural.toLowerCase()} (${pName.toLowerCase()} titles, IDs, body text). Same query semantics as search but scoped.`,
            inputSchema: {
                type: 'object',
                properties: { query: { type: 'string', description: 'Search query (case-insensitive substring match)' } },
                required: ['query']
            }
        },
        {
            name: 'get_upcoming',
            description: `Return ${cPlural.toLowerCase()} with upcoming milestones (enacted, effective, expires dates in the future). Sorted by date ascending.`,
            inputSchema: {
                type: 'object',
                properties: { limit: { type: 'number', description: 'Max results to return (default 20).' } },
                required: []
            }
        },
        {
            name: 'get_recently_changed',
            description: `Return ${cPlural.toLowerCase()} sorted by last_verified or last changelog entry, most recent first.`,
            inputSchema: {
                type: 'object',
                properties: { limit: { type: 'number', description: 'Max results to return (default 20).' } },
                required: []
            }
        }
    ];
}

// ---------------------------------------------------------------------------
// Tool dispatch
// ---------------------------------------------------------------------------

function handleToolCall(name, args) {
    // --- list primaries ---
    if (name === `list_${primaryPlural}`) {
        const items = primaries.map(p => ({ id: p.id, title: p.title || humanizeId(p.id), group: p.group || '' }));
        return { content: [{ type: 'text', text: JSON.stringify(items, null, 2) }] };
    }

    // --- get primary ---
    if (name === `get_${primaryName}`) {
        const entity = primaries.find(p => p.id === args.id);
        if (!entity) {
            return {
                content: [{ type: 'text', text: JSON.stringify({
                    error: `${config.entities?.primary?.name || 'Primary'} not found: ${args.id}`,
                    boundary: boundary(
                        `No ${(config.entities?.primary?.name || 'primary').toLowerCase()} with id "${args.id}" exists.`,
                        [`Use list_${primaryPlural} to see available IDs`, 'Check spelling and use lowercase-hyphenated format'],
                        'IDs are derived from filenames in the data directory'
                    )
                }, null, 2) }],
                isError: true
            };
        }
        const { _body, ...rest } = entity;
        return { content: [{ type: 'text', text: JSON.stringify({ ...rest, body: _body }, null, 2) }] };
    }

    // --- list containers ---
    if (name === `list_${containerPlural}`) {
        let list = containers;
        if (args.jurisdiction) list = list.filter(c => c.jurisdiction === args.jurisdiction);
        if (args.authority) list = list.filter(c => c.authority === args.authority);
        if (args.type) list = list.filter(c => c.type === args.type);
        if (args.status) list = list.filter(c => c.status === args.status);
        const items = list.map(c => ({
            id: c.id,
            title: c.title || humanizeId(c.id),
            status: c.status || '',
            authority: c.authority || '',
            type: c.type || '',
            jurisdiction: c.jurisdiction || '',
            url: canonicalUrlForContainer(c)
        }));
        return { content: [{ type: 'text', text: JSON.stringify({ count: items.length, filters: { jurisdiction: args.jurisdiction, authority: args.authority, type: args.type, status: args.status }, items }, null, 2) }] };
    }

    // --- get container ---
    if (name === `get_${containerName}`) {
        const entity = containers.find(c => c.id === args.id);
        if (!entity) {
            return {
                content: [{ type: 'text', text: JSON.stringify({
                    error: `${config.entities?.container?.name || 'Container'} not found: ${args.id}`,
                    boundary: boundary(
                        `No ${(config.entities?.container?.name || 'container').toLowerCase()} with id "${args.id}" exists.`,
                        [`Use list_${containerPlural} to see available IDs`, 'Check spelling and use lowercase-hyphenated format'],
                        'IDs are derived from filenames in the data directory'
                    )
                }, null, 2) }],
                isError: true
            };
        }
        const { _body, ...rest } = entity;
        return { content: [{ type: 'text', text: JSON.stringify({ ...rest, body: _body }, null, 2) }] };
    }

    // --- list authorities ---
    if (name === `list_${authorityPlural}`) {
        const items = authorities.map(a => ({ id: a.id, title: a.title || humanizeId(a.id), type: a.type || '' }));
        return { content: [{ type: 'text', text: JSON.stringify(items, null, 2) }] };
    }

    // --- get authority ---
    if (name === `get_${authorityName}`) {
        const entity = authorities.find(a => a.id === args.id);
        if (!entity) {
            return {
                content: [{ type: 'text', text: JSON.stringify({
                    error: `${config.entities?.authority?.name || 'Authority'} not found: ${args.id}`,
                    boundary: boundary(
                        `No ${(config.entities?.authority?.name || 'authority').toLowerCase()} with id "${args.id}" exists.`,
                        [`Use list_${authorityPlural} to see available IDs`, 'Check spelling and use lowercase-hyphenated format'],
                        'IDs are derived from filenames in the data directory'
                    )
                }, null, 2) }],
                isError: true
            };
        }
        const { _body, ...rest } = entity;
        return { content: [{ type: 'text', text: JSON.stringify({ ...rest, body: _body }, null, 2) }] };
    }

    // --- search ---
    if (name === 'search') {
        const q = (args.query || '').toLowerCase();
        if (!q) {
            return {
                content: [{ type: 'text', text: JSON.stringify({
                    error: 'Empty search query',
                    boundary: boundary('A non-empty query string is required.', ['Provide a keyword or phrase to search for'])
                }, null, 2) }],
                isError: true
            };
        }

        const results = [];
        const searchEntity = (entity, type) => {
            const haystack = [entity.id, entity.title || '', entity._body || ''].join(' ').toLowerCase();
            if (haystack.includes(q)) {
                results.push({ type, id: entity.id, title: entity.title || humanizeId(entity.id) });
            }
        };

        primaries.forEach(e => searchEntity(e, config.entities?.primary?.name || 'primary'));
        containers.forEach(e => searchEntity(e, config.entities?.container?.name || 'container'));
        authorities.forEach(e => searchEntity(e, config.entities?.authority?.name || 'authority'));

        return { content: [{ type: 'text', text: JSON.stringify({ query: args.query, count: results.length, results }, null, 2) }] };
    }

    // --- get_matrix ---
    if (name === 'get_matrix') {
        const matrix = {};
        for (const c of containers) {
            matrix[c.id] = {};
            for (const p of primaries) matrix[c.id][p.id] = false;
        }
        for (const m of mappings) {
            const cId = m.regulation || m.container || m.framework;
            if (cId && matrix[cId]) {
                for (const obl of (m.obligations || [])) {
                    if (matrix[cId][obl] !== undefined) matrix[cId][obl] = true;
                }
            }
        }
        return { content: [{ type: 'text', text: JSON.stringify(matrix, null, 2) }] };
    }

    // --- get_mappings ---
    if (name === 'get_mappings') {
        return { content: [{ type: 'text', text: JSON.stringify(mappings, null, 2) }] };
    }

    // --- fetch_by_url ---
    if (name === 'fetch_by_url') {
        const url = String(args.url || '').trim();
        const normalized = normalizeFetchPath(args.url);
        if (normalized.error) {
            return {
                content: [{ type: 'text', text: JSON.stringify({
                    error: normalized.error,
                    boundary: boundary('A canonical PubLedge URL or path is required.', ['Use a https://publedge.org/ URL', 'Use a root-relative path such as /us/utah/oaip/rma/2025-001/'])
                }, null, 2) }],
                isError: true
            };
        }
        const targetPath = normalized.path;
        const match = containers.find(c => {
            const p = canonicalPathForContainer(c);
            return p === targetPath;
        });
        if (!match) {
            return {
                content: [{ type: 'text', text: JSON.stringify({
                    error: `No ${(config.entities?.container?.name || 'container').toLowerCase()} found for url: ${url}`,
                    boundary: boundary('URL did not match a canonical record path.', [`Use list_${containerPlural} to see available records + canonical urls`, 'Ensure url has trailing slash and matches the hierarchy pattern /{country}/{jurisdiction}/{authority}/{type}/{instance}/'])
                }, null, 2) }],
                isError: true
            };
        }
        const { _body, ...rest } = match;
        return { content: [{ type: 'text', text: JSON.stringify({ ...rest, url: canonicalUrlForContainer(match), body: _body }, null, 2) }] };
    }

    // --- search_obligations (entity-scoped) ---
    if (name === 'search_obligations') {
        const q = (args.query || '').toLowerCase();
        if (!q) {
            return {
                content: [{ type: 'text', text: JSON.stringify({
                    error: 'Empty search query',
                    boundary: boundary('A non-empty query string is required.', ['Provide a keyword or phrase'])
                }, null, 2) }],
                isError: true
            };
        }
        const results = [];
        for (const p of primaries) {
            const haystack = [p.id, p.title || '', p.name || '', p._body || ''].join(' ').toLowerCase();
            if (haystack.includes(q)) results.push({ id: p.id, title: p.title || p.name || humanizeId(p.id), group: p.group || '' });
        }
        return { content: [{ type: 'text', text: JSON.stringify({ query: args.query, count: results.length, results }, null, 2) }] };
    }

    // --- get_upcoming ---
    if (name === 'get_upcoming') {
        const limit = args.limit || 20;
        const today = new Date().toISOString().split('T')[0];
        const events = [];
        for (const c of containers) {
            for (const field of ['enacted', 'effective', 'expires']) {
                const d = c[field];
                if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= today) {
                    events.push({ id: c.id, title: c.title || humanizeId(c.id), milestone: field, date: d, url: canonicalUrlForContainer(c) });
                }
            }
            for (const t of (c.timeline || [])) {
                if (t && typeof t.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t.date) && t.date >= today) {
                    events.push({ id: c.id, title: c.title || humanizeId(c.id), milestone: t.milestone || 'timeline', date: t.date, notes: t.notes || '', url: canonicalUrlForContainer(c) });
                }
            }
        }
        events.sort((a, b) => a.date.localeCompare(b.date));
        return { content: [{ type: 'text', text: JSON.stringify({ count: events.length, items: events.slice(0, limit) }, null, 2) }] };
    }

    // --- get_recently_changed ---
    if (name === 'get_recently_changed') {
        const limit = args.limit || 20;
        const items = containers.map(c => {
            const cl = Array.isArray(c.changelog) ? c.changelog : [];
            const lastCl = cl.map(e => e.date).filter(Boolean).sort().pop();
            const lastDate = c.last_verified || lastCl || c.effective || c.enacted || '';
            return { id: c.id, title: c.title || humanizeId(c.id), last_changed: lastDate, url: canonicalUrlForContainer(c) };
        }).filter(i => i.last_changed);
        items.sort((a, b) => b.last_changed.localeCompare(a.last_changed));
        return { content: [{ type: 'text', text: JSON.stringify({ count: items.length, items: items.slice(0, limit) }, null, 2) }] };
    }

    // --- unknown tool ---
    return {
        content: [{ type: 'text', text: JSON.stringify({
            error: `Unknown tool: ${name}`,
            boundary: boundary(
                `The tool "${name}" does not exist on this server.`,
                ['Use tools/list to see available tools'],
                'Tool names are derived from entity names in project.yml'
            )
        }, null, 2) }],
        isError: true
    };
}

// ---------------------------------------------------------------------------
// JSON-RPC / MCP protocol
// ---------------------------------------------------------------------------

function makeResponse(id, result) {
    return JSON.stringify({ jsonrpc: '2.0', id, result });
}

function makeError(id, code, message) {
    return JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } });
}

function handleMessage(msg) {
    const { id, method, params } = msg;

    if (method === 'initialize') {
        return makeResponse(id, {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: {
                name: config.name || 'Knowledge Base MCP',
                version: '1.0.0'
            }
        });
    }

    if (method === 'notifications/initialized') {
        return null; // notification, no response
    }

    if (method === 'tools/list') {
        return makeResponse(id, { tools: getToolDefinitions() });
    }

    if (method === 'tools/call') {
        const toolName = params?.name;
        const toolArgs = params?.arguments || {};
        const result = handleToolCall(toolName, toolArgs);
        return makeResponse(id, result);
    }

    return makeError(id, -32601, `Method not found: ${method}`);
}

// ---------------------------------------------------------------------------
// Stdio transport
// ---------------------------------------------------------------------------

let buffer = '';

process.stdin.setEncoding('utf-8');
process.stdin.on('data', chunk => {
    buffer += chunk;
    let newlineIdx;
    while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineIdx).trim();
        buffer = buffer.slice(newlineIdx + 1);
        if (!line) continue;

        try {
            const msg = JSON.parse(line);
            const response = handleMessage(msg);
            if (response) {
                process.stdout.write(response + '\n');
            }
        } catch (err) {
            const errResp = makeError(null, -32700, 'Parse error: ' + err.message);
            process.stdout.write(errResp + '\n');
        }
    }
});

process.stdin.on('end', () => process.exit(0));
