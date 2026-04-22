#!/usr/bin/env node
'use strict';

/**
 * Knowledge-as-Code — Config-Driven Static Site Generator
 * Zero dependencies — uses only Node.js built-ins.
 *
 * Reads project.yml for entity types, colors, and site config.
 * Generates: JSON API + full HTML site with detail and bridge pages.
 *
 * Usage: node scripts/build.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
// Output directory for the generated site.
// Override with KAC_OUTPUT_DIR=demo (or any folder name) to write elsewhere.
// Default is 'docs' so GitHub Pages can serve from main/docs with no config.
const DOCS_DIR = path.join(ROOT, process.env.KAC_OUTPUT_DIR || 'docs');
const API_DIR = path.join(DOCS_DIR, 'api', 'v1');
const ASSETS_DIR = path.join(DOCS_DIR, 'assets');

// ---------------------------------------------------------------------------
// YAML-lite parser (handles project.yml without dependencies)
// ---------------------------------------------------------------------------

function parseYaml(content) {
    const lines = content.split('\n');
    const result = {};
    // Stack tracks: { obj, indent, key, isList }
    const stack = [{ obj: result, indent: -2 }];

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        if (raw.trim() === '' || raw.trim().startsWith('#')) continue;

        const indent = raw.search(/\S/);
        const trimmed = raw.trim();

        // Pop stack back to appropriate parent
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();

        const isList = trimmed.startsWith('- ');
        const lineContent = isList ? trimmed.slice(2).trim() : trimmed;

        if (isList) {
            // Inline object: - { key: val, key: val }
            if (lineContent.startsWith('{') && lineContent.endsWith('}')) {
                const obj = {};
                lineContent.slice(1, -1).split(',').forEach(pair => {
                    const ci = pair.indexOf(':');
                    if (ci !== -1) obj[pair.slice(0, ci).trim()] = pair.slice(ci + 1).trim().replace(/^["']|["']$/g, '');
                });
                const parent = stack[stack.length - 1].obj;
                const lastKey = stack[stack.length - 1].lastListKey;
                if (lastKey && Array.isArray(parent[lastKey])) parent[lastKey].push(obj);
                continue;
            }

            // List item with key:value — start of a multi-line object or single-line
            const ci = lineContent.indexOf(':');
            if (ci !== -1) {
                const k = lineContent.slice(0, ci).trim();
                const v = lineContent.slice(ci + 1).trim().replace(/^["']|["']$/g, '');

                // Look ahead: are there continuation lines at deeper indent?
                const nextI = i + 1;
                const hasChildren = nextI < lines.length &&
                    lines[nextI].trim() !== '' && !lines[nextI].trim().startsWith('#') &&
                    !lines[nextI].trim().startsWith('- ') &&
                    lines[nextI].search(/\S/) > indent;

                const parent = stack[stack.length - 1].obj;
                const listKey = stack[stack.length - 1].lastListKey;

                if (hasChildren || v === '') {
                    // Multi-line list object: create obj, add first key, push for continuation
                    const obj = {};
                    if (v) obj[k] = v;
                    if (listKey && Array.isArray(parent[listKey])) {
                        parent[listKey].push(obj);
                    }
                    stack.push({ obj, indent, lastListKey: null });
                } else {
                    // Single key:value list item — wrap as object
                    const obj = {};
                    obj[k] = v;
                    if (listKey && Array.isArray(parent[listKey])) parent[listKey].push(obj);
                }
            } else {
                // Simple list item: - value
                const parent = stack[stack.length - 1].obj;
                const listKey = stack[stack.length - 1].lastListKey;
                if (listKey && Array.isArray(parent[listKey])) {
                    parent[listKey].push(lineContent.replace(/^["']|["']$/g, ''));
                }
            }
            continue;
        }

        // Regular key: value
        const ci = trimmed.indexOf(':');
        if (ci === -1) continue;

        const key = trimmed.slice(0, ci).trim();
        const val = trimmed.slice(ci + 1).trim().replace(/^["']|["']$/g, '');
        const parent = stack[stack.length - 1].obj;

        if (val === '') {
            // Look ahead to determine if this is a list or object
            const nextI = i + 1;
            let nextNonEmpty = null;
            for (let j = nextI; j < lines.length; j++) {
                if (lines[j].trim() && !lines[j].trim().startsWith('#')) { nextNonEmpty = lines[j].trim(); break; }
            }

            if (nextNonEmpty && nextNonEmpty.startsWith('- ')) {
                parent[key] = [];
                stack.push({ obj: parent, indent, lastListKey: key });
            } else {
                parent[key] = {};
                stack.push({ obj: parent[key], indent });
            }
        } else {
            parent[key] = val;
        }
    }

    return result;
}

function loadConfig() {
    const configPath = path.join(ROOT, 'project.yml');
    if (!fs.existsSync(configPath)) {
        console.error('Error: project.yml not found. See README.md for setup instructions.');
        process.exit(1);
    }
    return parseYaml(fs.readFileSync(configPath, 'utf-8'));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(str) {
    return String(str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function escapeHTML(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function humanizeId(id) {
    return String(id || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function formatDate(dateStr) {
    // Treat empty, "null", "undefined", or "tbd"/"TBD" strings as absent.
    if (!dateStr) return '';
    const s = String(dateStr).trim();
    if (!s || /^(null|undefined|tbd|n\/a)$/i.test(s)) return '';
    const d = new Date(s + 'T00:00:00');
    if (isNaN(d.getTime())) return escapeHTML(s);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Hierarchy / canonical path helpers --------------------------------------
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
            c._canonicalCountry = jur.country;
            c._canonicalRegion = jur.region;
            c._canonicalAuthority = auth.url_segment;
            c._canonicalType = typeSeg;
            c._canonicalInstance = instance;
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

// Absolute-from-root container URL: `/us/utah/oaip/rma/2025-001/`
function containerHref(c) {
    return '/' + (c._canonicalPath || `container/${c.id}/`);
}

function containerIndexHref(c) {
    return containerHref(c);
}

function authorityHref(a) {
    return '/' + (a._canonicalPath || `authority/${a.id}/`);
}

// Look up a container by id from a precomputed map, fall back to legacy path
function containerHrefById(containerId, containerById) {
    const c = containerById[containerId];
    if (c) return containerHref(c);
    return `/container/${containerId}/`;
}

function buildContainerLookup(containers) {
    return Object.fromEntries(containers.map(c => [c.id, c]));
}

function extractSection(body, heading) {
    const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = body.match(new RegExp(`## ${escaped}\\n\\n([\\s\\S]*?)(?=\\n## |$)`));
    return match ? match[1].trim() : '';
}

function parseBulletList(text) {
    return text.split('\n').map(l => l.trim()).filter(l => l.startsWith('- ')).map(l => l.slice(2).trim());
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { frontmatter: {}, body: content };

    const frontmatter = {};
    let currentKey = null;
    let listValues = [];

    match[1].split('\n').forEach(line => {
        if (line.match(/^\s+-\s+/)) {
            if (currentKey) listValues.push(line.replace(/^\s+-\s+/, '').trim());
            return;
        }
        if (currentKey && listValues.length > 0) {
            frontmatter[currentKey] = listValues;
            listValues = [];
            currentKey = null;
        }
        // Skip indented key:value pairs — they belong to a nested structure
        // whose top-level key is already captured; the naive parser does not
        // descend into nested objects, so ignore the interior to avoid
        // polluting the top-level frontmatter with child-field values.
        if (/^\s+\S/.test(line) && !line.match(/^\s+-/)) return;
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            let value = valueParts.join(':').trim();
            // Strip wrapping double or single quotes
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            if (value === '') {
                currentKey = key.trim();
            } else {
                frontmatter[key.trim()] = value;
                currentKey = null;
            }
        }
    });
    if (currentKey && listValues.length > 0) {
        frontmatter[currentKey] = listValues;
    }

    return { frontmatter, body: content.slice(match[0].length).trim() };
}

function parseTable(tableText) {
    const lines = tableText.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
    const rows = [];
    for (let i = 2; i < lines.length; i++) {
        const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean);
        const row = {};
        headers.forEach((h, idx) => { row[h.toLowerCase().replace(/\s+/g, '_')] = cells[idx] || ''; });
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

// ---------------------------------------------------------------------------
// Data loading (config-driven)
// ---------------------------------------------------------------------------

function findDataDir(config) {
    // Look for data in data/examples/ first, then data/ with config-specified directory names
    const dirs = ['data/examples', 'data'];
    for (const base of dirs) {
        const fullBase = path.join(ROOT, base);
        if (fs.existsSync(fullBase)) return fullBase;
    }
    return path.join(ROOT, 'data');
}

function loadDir(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(f => f.endsWith('.md') && !f.startsWith('_'))
        .map(f => {
            const content = fs.readFileSync(path.join(dir, f), 'utf-8');
            const { frontmatter, body } = parseFrontmatter(content);
            return { id: f.replace('.md', ''), ...frontmatter, _body: body, _file: f };
        });
}

function loadContainers(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(f => f.endsWith('.md') && !f.startsWith('_'))
        .map(f => {
            const content = fs.readFileSync(path.join(dir, f), 'utf-8');
            const { frontmatter, body } = parseFrontmatter(content);
            const id = f.replace('.md', '');
            const timelineMatch = body.match(/## Timeline\n\n([\s\S]*?)(?=\n---|\n## )/);
            const timeline = timelineMatch ? parseTable(timelineMatch[1]) : [];
            const provisionSections = body.split(/\n---\n/).slice(1);
            const provisions = provisionSections.map(parseProvisionSection).filter(Boolean);
            return { id, ...frontmatter, timeline, provisions, _body: body, _file: f };
        });
}

function loadMappingIndex(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const entries = [];
    let current = null;

    for (const line of content.split('\n')) {
        if (line.startsWith('- id:')) {
            if (current) entries.push(current);
            current = { id: line.replace('- id:', '').trim(), obligations: [] };
        } else if (current) {
            const match = line.match(/^\s+(\w[\w_]*):\s*(.+)/);
            if (match && match[1] !== 'obligations') current[match[1]] = match[2].trim();
            const listMatch = line.match(/^\s+-\s+(.+)/);
            if (listMatch) current.obligations.push(listMatch[1].trim());
        }
    }
    if (current) entries.push(current);
    return entries;
}

// ---------------------------------------------------------------------------
// CSS generation from config
// ---------------------------------------------------------------------------

function generateConfigCSS(config) {
    const groups = config.entities?.primary?.groups || [];
    const statuses = config.entities?.container?.statuses || [];
    const theme = config.theme || {};

    let css = '/* Generated from project.yml — do not edit manually */\n';

    // Group colors
    groups.forEach(g => {
        const name = g.name || g;
        const color = g.color || '#888';
        const colorLight = g.color_light || color;
        css += `.group-badge.${name} { background: ${color}; }\n`;
        css += `:is(html, body).light-mode .group-badge.${name} { background: ${colorLight}; }\n`;
        css += `.matrix-table .matrix-row-header.group-${name} { border-left-color: ${color}; }\n`;
        css += `:is(html, body).light-mode .matrix-table .matrix-row-header.group-${name} { border-left-color: ${colorLight}; }\n`;
    });

    // Status colors
    statuses.forEach(s => {
        const name = s.name || s;
        const color = s.color || '#888';
        const colorLight = s.color_light || color;
        css += `.status-badge.${name} { background: ${color}; color: #000; }\n`;
        css += `:is(html, body).light-mode .status-badge.${name} { background: ${colorLight}; color: #fff; }\n`;
    });

    // Theme accent overrides
    if (theme.accent) {
        css += `:root { --accent: ${theme.accent}; }\n`;
    }
    if (theme.accent_light) {
        css += `:is(html, body).light-mode { --accent: ${theme.accent_light}; }\n`;
    }

    return css;
}

// ---------------------------------------------------------------------------
// Shared HTML renderers
// ---------------------------------------------------------------------------

function renderThemeInit() {
    return `<script>
        (function() {
            var params = new URLSearchParams(window.location.search);
            var urlTheme = params.get('theme');
            var theme = urlTheme || localStorage.getItem('theme');
            if (theme === 'light') {
                document.documentElement.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
            } else if (theme === 'dark') {
                document.documentElement.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            }
            // Strip ?theme from URL so reloads respect localStorage (which the
            // button updates) rather than re-pinning the old URL-specified theme.
            if (urlTheme) {
                params.delete('theme');
                var q = params.toString();
                var newUrl = window.location.pathname + (q ? '?' + q : '') + window.location.hash;
                window.history.replaceState(null, '', newUrl);
            }
        })();
    </script>`;
}

function renderThemeScript() {
    return `<script>
        function toggleTheme() {
            var html = document.documentElement;
            var currentlyLight =
                html.classList.contains('light-mode') ||
                (!html.classList.contains('dark-mode') &&
                 !window.matchMedia('(prefers-color-scheme: dark)').matches);
            html.classList.remove('light-mode', 'dark-mode');
            if (currentlyLight) {
                html.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                html.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
            }
        }
        function toggleMobileMenu() {
            var btn = document.querySelector('.hamburger-btn');
            var menu = document.getElementById('siteNav');
            var isOpen = menu.classList.toggle('open');
            btn.classList.toggle('active', isOpen);
            btn.setAttribute('aria-expanded', isOpen);
        }
        document.addEventListener('click', function(e) {
            var menu = document.getElementById('siteNav');
            var btn = document.querySelector('.hamburger-btn');
            if (menu && btn && menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
                menu.classList.remove('open');
                btn.classList.remove('active');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
        function passTheme(link) {
            // No-op: theme is persisted via localStorage (read on every load by
            // renderThemeInit). URL query param was causing stale theme to pin
            // across reloads and override toggle clicks. Keeping the function so
            // existing onclick="passTheme(this)" call sites don't error.
        }
        (function() {
            var btn = document.createElement('button');
            btn.className = 'back-to-top';
            btn.setAttribute('aria-label', 'Back to top');
            btn.textContent = '\\u2191';
            document.body.appendChild(btn);
            window.addEventListener('scroll', function() { btn.classList.toggle('visible', window.scrollY > 400); });
            btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
        })();
    </script>`;
}

function renderSiteBanner() {
    // <aside> is a complementary landmark by default — brings the banner
    // inside the landmark graph (axe region rule) while keeping semantics.
    return `<aside class="site-banner" aria-label="Site disclaimer">
        <strong>Reference project in development.</strong> This registry is not authoritative and is not legal advice. Status values describe each instrument's own legal state, not editorial endorsement — see <a href="/definitions/">Definitions</a>.
    </aside>`;
}

function renderSiteNav(config, activePage, prefix) {
    prefix = prefix || '';
    const navItems = config.nav || [];
    const siteName = config.name || 'Knowledge Base';

    return `<a class="skip-link" href="#main-content">Skip to content</a>
    <header class="site-header">
        <h1><a href="/" onclick="passTheme(this)">${escapeHTML(siteName)}</a></h1>
        <button class="hamburger-btn" onclick="toggleMobileMenu()" aria-label="Toggle menu" aria-expanded="false" aria-controls="siteNav">
            <span class="hamburger-icon"></span>
        </button>
        <nav class="site-nav" id="siteNav" aria-label="Main navigation">
            ${navItems.map(item =>
                `<a href="/${item.href}" class="site-nav-link${item.id === activePage ? ' active' : ''}" onclick="passTheme(this)">${escapeHTML(item.label)}</a>`
            ).join('\n            ')}
        </nav>
        <div class="header-actions">
            <div class="site-search" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-owns="searchResults">
                <input type="search" id="siteSearchInput" class="search-input" placeholder="Search..." aria-label="Search" aria-autocomplete="list" aria-controls="searchResults" autocomplete="off">
                <ul id="searchResults" class="search-results" role="listbox" hidden></ul>
            </div>
            <button class="theme-toggle" onclick="toggleTheme(); event.stopPropagation();" title="Toggle light/dark mode" aria-label="Toggle light/dark mode">&#x1F313;</button>
        </div>
    </header>`;
}

function renderFooter(config) {
    const repo = config.repo || '#';
    return `<footer>
        <p>Maintained with <a href="${escapeHTML(repo)}">version control</a>. This is a reference tool, not professional advice.</p>
        <p>&copy; ${new Date().getFullYear()} | Built with <a href="https://knowledge-as-code.com">Knowledge-as-Code</a>, a pattern by <a href="https://paice.work">PAICE.work</a></p>
    </footer>`;
}

function renderPageShell(config, { title, activePage, prefix, content, description, canonicalPath, configCSS, structuredData }) {
    prefix = prefix || '';
    const siteName = config.name || 'Knowledge Base';
    const siteUrl = config.url || '';
    const desc = description || config.description || '';
    const canonical = canonicalPath ? `<link rel="canonical" href="${siteUrl}${canonicalPath}">` : '';
    const jsonLd = structuredData ? `\n    <script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : '';
    // Normalize URL joins: strip trailing slash from siteUrl before appending absolute paths
    const urlBase = siteUrl.replace(/\/$/, '');
    const absUrl = (p) => p.startsWith('/') ? `${urlBase}${p}` : `${urlBase}/${p}`;
    const ogImage = config.social?.og_image;
    const twitterSite = (typeof config.social?.twitter_site === 'string' && config.social.twitter_site.trim()) ? config.social.twitter_site.trim() : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHTML(title)} - ${escapeHTML(siteName)}</title>
    <meta name="theme-color" content="#1a1a2e">
    ${canonical}
    <link rel="stylesheet" href="/assets/styles.css">
    <style>${configCSS || ''}</style>
    <meta name="description" content="${escapeHTML(desc)}">
    <meta property="og:title" content="${escapeHTML(title)}">
    <meta property="og:description" content="${escapeHTML(desc)}">
    <meta property="og:type" content="website">
    ${ogImage ? `<meta property="og:image" content="${absUrl(ogImage)}">` : ''}
    ${canonicalPath !== undefined ? `<meta property="og:url" content="${siteUrl}${canonicalPath || ''}">` : ''}
    <meta name="twitter:card" content="${config.social?.twitter_card || 'summary'}">
    ${twitterSite ? `<meta name="twitter:site" content="${escapeHTML(twitterSite)}">` : ''}${jsonLd}
    ${renderThemeInit()}
</head>
<body>
    ${renderSiteNav(config, activePage, prefix)}
    ${renderSiteBanner()}
    <div class="container" id="main-content">
        ${content}
    </div>
    ${renderFooter(config)}
    <script src="/assets/search.js"></script>
    <script src="/assets/tables.js"></script>
    ${renderThemeScript()}
</body>
</html>`;
}

function renderBridgeShell(config, { title, depth, content, description, canonicalPath, structuredData, configCSS, noindex }) {
    const prefix = depth > 0 ? '../'.repeat(depth) : '';
    const siteUrl = config.url || '';
    const jsonLd = structuredData ? `\n    <script type="application/ld+json">${JSON.stringify(structuredData)}</script>` : '';
    const urlBase = siteUrl.replace(/\/$/, '');
    const absUrl = (p) => p.startsWith('/') ? `${urlBase}${p}` : `${urlBase}/${p}`;
    const ogImage = config.social?.og_image;
    const twitterSite = (typeof config.social?.twitter_site === 'string' && config.social.twitter_site.trim()) ? config.social.twitter_site.trim() : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHTML(title)} - ${escapeHTML(config.name || '')}</title>
    <meta name="theme-color" content="#1a1a2e">
    <link rel="canonical" href="${siteUrl}${canonicalPath || ''}">
    <link rel="stylesheet" href="/assets/styles.css">
    <style>${configCSS || ''}</style>
    ${noindex ? '<meta name="robots" content="noindex">' : ''}
    <meta name="description" content="${escapeHTML(description || '')}">
    <meta property="og:title" content="${escapeHTML(title)}">
    <meta property="og:description" content="${escapeHTML(description || '')}">
    <meta property="og:type" content="website">
    ${ogImage ? `<meta property="og:image" content="${absUrl(ogImage)}">` : ''}
    ${canonicalPath !== undefined ? `<meta property="og:url" content="${siteUrl}${canonicalPath || ''}">` : ''}
    <meta name="twitter:card" content="${config.social?.twitter_card || 'summary'}">
    ${twitterSite ? `<meta name="twitter:site" content="${escapeHTML(twitterSite)}">` : ''}${jsonLd}
    ${renderThemeInit()}
</head>
<body>
    ${renderSiteNav(config, 'none', prefix)}
    ${renderSiteBanner()}
    <div class="container" id="main-content">
        ${content}
    </div>
    ${renderFooter(config)}
    <script src="/assets/search.js"></script>
    <script src="/assets/tables.js"></script>
    ${renderThemeScript()}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Component renderers
// ---------------------------------------------------------------------------

function renderStatusBadge(status) {
    return `<span class="status-badge ${escapeHTML(status || '')}">${escapeHTML((status || 'unknown').replace(/-/g, ' '))}</span>`;
}

function renderGroupBadge(group) {
    return `<span class="group-badge ${escapeHTML(group || '')}">${escapeHTML(group || '')}</span>`;
}

function renderBreadcrumb(items) {
    const abs = (h) => (h.startsWith('/') || h.startsWith('http')) ? h : '/' + h;
    return `<nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/" onclick="passTheme(this)">Home</a>
        ${items.map(item => `<span class="sep">/</span> ${item.href ? `<a href="${abs(item.href)}" onclick="passTheme(this)">${escapeHTML(item.label)}</a>` : `<span>${escapeHTML(item.label)}</span>`}`).join('\n        ')}
    </nav>`;
}

function renderSourceDocuments(container) {
    const docs = container.source_documents;
    if (!docs || (Array.isArray(docs) && !docs.length)) return '';
    const list = Array.isArray(docs) ? docs : [docs];
    const canonical = container._canonicalPath || `container/${container.id}/`;
    const items = list.map(d => {
        const filename = String(d).trim();
        const href = filename.startsWith('/') || filename.startsWith('http')
            ? filename
            : `/${canonical}${filename}`;
        const label = filename.split('/').pop();
        const isPdf = /\.pdf$/i.test(filename);
        return `<li><a href="${escapeHTML(href)}" target="_blank" rel="noopener">${escapeHTML(label)}</a>${isPdf ? ' <span style="opacity:0.6;font-size:0.85em;">(PDF)</span>' : ''}</li>`;
    }).join('');
    const textFile = container.extracted_text;
    const textLink = textFile ? `<li><a href="${escapeHTML(textFile)}">${escapeHTML(textFile)}</a> <span style="opacity:0.6;font-size:0.85em;">(plain text — OCR-extracted)</span></li>` : '';
    return `<h3>Source Documents</h3><ul class="source-documents">${items}${textLink}</ul>`;
}

function renderExtractedText(container) {
    const textFile = container.extracted_text;
    if (!textFile) return '';
    const canonical = container._canonicalPath || `container/${container.id}/`;
    const fp = path.join(DOCS_DIR, canonical, textFile);
    if (!fs.existsSync(fp)) return '';
    const raw = fs.readFileSync(fp, 'utf-8');
    const pageCount = (raw.match(/^---- Page \d+ ----$/gm) || []).length;
    const pagesLabel = pageCount > 0 ? `, ${pageCount} page${pageCount === 1 ? '' : 's'}` : '';
    return `<details class="extracted-text" style="margin-top:1.5rem;">
        <summary style="cursor:pointer;font-weight:600;padding:0.5rem 0;">Agreement Text (OCR-extracted${pagesLabel}) — expand to view inline</summary>
        <p style="color:var(--text-secondary);font-size:0.85em;margin:0.5rem 0;"><em>Extracted via OCR from the signed PDF. Minor transcription errors possible — the <a href="${escapeHTML(container.source_documents?.[0] || '')}" target="_blank" rel="noopener">signed PDF</a> is the authoritative source.</em></p>
        <pre style="white-space:pre-wrap;background:var(--bg-secondary,#0f2e5c22);padding:1rem;border-radius:4px;font-size:0.85em;line-height:1.5;max-height:70vh;overflow-y:auto;">${escapeHTML(raw)}</pre>
    </details>`;
}

function renderProvisionCard(prov, linkPrefix = '/') {
    const reqRows = (prov.requirements || []).map(r => `<tr><td>${escapeHTML(r.requirement || '')}</td><td>${escapeHTML(r.details || '')}</td></tr>`).join('');
    const penRows = (prov.penalties || []).map(p => `<tr><td>${escapeHTML(p.violation || '')}</td><td>${escapeHTML(p.fine || '')}</td></tr>`).join('');
    const sources = (prov.sources || []).map(s => `<li><a href="${escapeHTML(s.url)}" target="_blank" rel="noopener">${escapeHTML(s.title)}</a></li>`).join('');

    return `<div class="provision-card" id="${slugify(prov.name)}">
        <h3>${escapeHTML(prov.name)}</h3>
        <div class="provision-meta">
            ${prov.obligation ? `<span><strong>Implements:</strong> <a href="/primary/${escapeHTML(prov.obligation)}/" onclick="passTheme(this)">${escapeHTML(humanizeId(prov.obligation))}</a></span>` : ''}
            ${prov.status ? `<span>${renderStatusBadge(prov.status)}</span>` : ''}
            ${prov.effective ? `<span><strong>Effective:</strong> ${formatDate(prov.effective)}</span>` : ''}
        </div>
        ${prov.talking_point ? `<div class="talking-point">"${escapeHTML(prov.talking_point)}"</div>` : ''}
        ${reqRows ? `<h4>Requirements</h4><table class="data-table"><thead><tr><th>Requirement</th><th>Details</th></tr></thead><tbody>${reqRows}</tbody></table>` : ''}
        ${penRows ? `<h4>Penalties</h4><table class="data-table"><thead><tr><th>Violation</th><th>Fine</th></tr></thead><tbody>${penRows}</tbody></table>` : ''}
        ${sources ? `<div class="provision-sources"><strong>Sources</strong><ul>${sources}</ul></div>` : ''}
    </div>`;
}

// ---------------------------------------------------------------------------
// Sortable table helpers (backported from downstream implementations)
// ---------------------------------------------------------------------------

function th(label, opts = {}) {
    // sort-type mapping: EAL tables.js recognizes "text" | "number". Anything
    // else (like "string", "date") falls back to text comparison.
    const rawType = opts.sortType || 'text';
    const sortType = rawType === 'number' ? 'number' : 'text';
    const col = opts.col || slugify(label);
    const filter = opts.filter ? ` data-filter-key="${escapeHTML(opts.filter)}"` : '';
    return `<th data-sortable data-sort-type="${sortType}" data-col="${col}"${filter}>${escapeHTML(label)}</th>`;
}

// --- Freshness helpers ---
function daysSince(dateStr) {
    if (!dateStr) return null;
    const s = String(dateStr).trim();
    if (!s || /^(null|undefined|tbd|n\/a)$/i.test(s)) return null;
    const then = new Date(s + 'T00:00:00');
    if (isNaN(then.getTime())) return null;
    const diff = Date.now() - then.getTime();
    return Math.floor(diff / 86400000);
}

function freshnessBadge(lastVerified, opts = {}) {
    const days = daysSince(lastVerified);
    if (days === null) return '';
    const staleAt = (opts.staleAt || 180);
    const agingAt = (opts.agingAt || 90);
    let klass, label;
    if (days < agingAt) { klass = 'fresh'; label = 'verified ' + days + 'd ago'; }
    else if (days < staleAt) { klass = 'aging'; label = 'aging (' + days + 'd)'; }
    else { klass = 'stale'; label = 'stale (' + days + 'd)'; }
    return `<span class="freshness-badge ${klass}" title="Last verified ${escapeHTML(lastVerified)}">${escapeHTML(label)}</span>`;
}

function tdDate(dateStr) {
    return `<td data-sort-value="${dateStr || '9999-12-31'}">${formatDate(dateStr)}</td>`;
}

function tdStatus(status) {
    return `<td data-sort-value="${escapeHTML(status || 'zzz')}">${renderStatusBadge(status)}</td>`;
}

function tdNumber(n) {
    const num = parseFloat(n) || 0;
    return `<td data-sort-value="${num}">${n}</td>`;
}

function tdPrice(priceStr) {
    const num = priceStr === 'Free' || priceStr === 'free' ? 0 : parseFloat(String(priceStr).replace(/[^0-9.]/g, '')) || 0;
    return `<td data-sort-value="${num}">${escapeHTML(priceStr || '')}</td>`;
}

function tdRange(rangeStr) {
    const parts = String(rangeStr || '0').split('-');
    const max = parseFloat(parts[parts.length - 1].replace(/[^0-9.]/g, '')) || 0;
    return `<td data-sort-value="${max}">${escapeHTML(rangeStr || '')}</td>`;
}

// Jurisdiction chip — colored pill keyed by jurisdiction id. CSS provides
// per-jurisdiction backgrounds via [data-jurisdiction="..."] attr selectors.
function jurisdictionChip(jur, opts = {}) {
    if (!jur) return '';
    const label = opts.label || jur;
    return `<span class="jurisdiction-chip" data-jurisdiction="${escapeHTML(jur)}">${escapeHTML(label)}</span>`;
}

function tdJurisdiction(jur, opts = {}) {
    if (!jur) return '<td data-sort-value="">—</td>';
    return `<td data-sort-value="${escapeHTML(jur)}">${jurisdictionChip(jur, opts)}</td>`;
}

// Record at-a-glance summary strip — horizontal pill row above meta-detail.
function renderRecordSummary(c, config) {
    const typeLabel = config.hierarchy?.type_labels?.[c.type] || c.type;
    const jur = config.hierarchy?.jurisdictions?.[c.jurisdiction];
    const isBlank = v => !v || /^(null|undefined|tbd|n\/a)$/i.test(String(v).trim());
    const items = [];
    items.push(`<strong>Jurisdiction:</strong> ${jurisdictionChip(c.jurisdiction, { label: jur?.label || c.jurisdiction })}`);
    if (c.authority) items.push(`<strong>Authority:</strong> ${escapeHTML(c.authority)}`);
    if (typeLabel) items.push(`<strong>Type:</strong> ${escapeHTML(typeLabel)}`);
    if (!isBlank(c.term_start) && !isBlank(c.term_end)) {
        const start = new Date(String(c.term_start) + 'T00:00:00');
        const end = new Date(String(c.term_end) + 'T00:00:00');
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const months = Math.round((end - start) / (30 * 86400000));
            items.push(`<strong>Term:</strong> ${months} mo`);
        }
    } else if (c.commencement_date_trigger && !isBlank(c.commencement_date_trigger)) {
        items.push(`<strong>Term:</strong> pending commencement`);
    }
    if (c.reliance_scope) items.push(`<strong>Reliance:</strong> ${escapeHTML(String(c.reliance_scope).replace(/-/g, ' '))}`);
    if (c.obligation_kind) {
        const kinds = String(c.obligation_kind).replace(/^\[|\]$/g, '').split(',').map(s => s.trim()).filter(Boolean);
        if (kinds.length) items.push(`<strong>Obligation:</strong> ${kinds.map(escapeHTML).join(', ')}`);
    }
    return `<div class="record-summary-strip">${items.map(i => `<span class="summary-item">${i}</span>`).join('')}</div>`;
}

// Record-page changelog — compact provenance footer.
function renderRecordChangelog(c) {
    const parts = [];
    if (c.created) parts.push(`<strong>Created</strong> ${formatDate(c.created)}`);
    if (c.modified) parts.push(`<strong>Modified</strong> ${formatDate(c.modified)}`);
    if (c.last_verified) parts.push(`<strong>Last verified</strong> ${formatDate(c.last_verified)}`);
    if (!parts.length) return '';
    return `<div class="record-changelog">${parts.join(' &middot; ')}</div>`;
}

// Prev/next navigation across records sharing the same authority+type.
function renderPrevNext(container, data) {
    const siblings = data.containers
        .filter(c => c.authority === container.authority && c.type === container.type)
        .sort((a, b) => (a.instance || a.id).localeCompare(b.instance || b.id));
    const idx = siblings.findIndex(c => c.id === container.id);
    if (idx === -1 || siblings.length < 2) return '';
    const prev = idx > 0 ? siblings[idx - 1] : null;
    const next = idx < siblings.length - 1 ? siblings[idx + 1] : null;
    return `<nav class="record-prevnext" aria-label="Sibling records">
        ${prev ? `<a class="prevnext-prev" href="${containerIndexHref(prev)}">← ${escapeHTML(prev.title || prev.name || prev.id)}</a>` : '<span></span>'}
        ${next ? `<a class="prevnext-next" href="${containerIndexHref(next)}">${escapeHTML(next.title || next.name || next.id)} →</a>` : ''}
    </nav>`;
}

// Schema-completeness check — returns warning banner + prints [warn] to stdout.
const SCHEMA_REQUIRED = ['id', 'type', 'jurisdiction', 'authority', 'status', 'title'];
const SCHEMA_DESIRABLE = ['enacted', 'effective', 'reliance_scope', 'obligation_kind', 'last_verified'];
function renderIncompleteMetadataWarning(c) {
    const missing = [];
    for (const f of SCHEMA_REQUIRED) if (!c[f]) missing.push(f);
    for (const f of SCHEMA_DESIRABLE) if (!c[f]) missing.push(f + ' (recommended)');
    if (!missing.length) return '';
    if (process.env.KAC_HIDE_SCHEMA_WARN !== '1') {
        console.warn(`  [schema-warn] ${c.id}: missing ${missing.join(', ')}`);
    }
    return `<div class="incomplete-metadata">⚠ Incomplete metadata: ${escapeHTML(missing.join(', '))}</div>`;
}

// Authority-link panel — prominent external-site reference at the top of
// an authority's hierarchy page.
function renderAuthorityLinkPanel(auth) {
    if (!auth || !auth.website) return '';
    return `<aside class="authority-link-panel">
        <strong>View on authoritative source:</strong>
        <a href="${escapeHTML(auth.website)}" target="_blank" rel="noopener">${escapeHTML(auth.website)} →</a>
    </aside>`;
}

// Upcoming-milestones widget for the homepage.
function renderUpcomingWidget(containers, config) {
    const today = new Date().toISOString().slice(0, 10);
    const events = [];
    for (const c of containers) {
        const push = (kind, date) => {
            if (!date || date < today) return;
            events.push({
                kind, date, container: c,
                daysUntil: Math.ceil((new Date(date) - new Date(today)) / 86400000)
            });
        };
        push('Effective', c.effective);
        push('Term ends', c.term_end);
    }
    events.sort((a, b) => a.date.localeCompare(b.date));
    const top = events.slice(0, 4);
    if (!top.length) return '';
    const cards = top.map(e => `
        <a class="upcoming-card" href="${containerIndexHref(e.container)}">
            <div class="upcoming-days">${e.daysUntil}d</div>
            <div class="upcoming-kind">${escapeHTML(e.kind)}</div>
            <div class="upcoming-title">${escapeHTML(e.container.title || e.container.name || e.container.id)}</div>
            <div class="upcoming-date">${formatDate(e.date)}</div>
        </a>
    `).join('');
    return `
        <h2>Upcoming Milestones</h2>
        <p style="color:var(--muted);margin-top:-0.5em;">Closest enforcement and term-end dates across the registry. Subscribe: <a href="/calendar.ics">calendar.ics</a>.</p>
        <div class="upcoming-widget">${cards}</div>
    `;
}


// ---------------------------------------------------------------------------
// Page generators
// ---------------------------------------------------------------------------

function generateHomepage(config, data, configCSS) {
    const { primaries, containers, authorities, totalProvisions, matrix } = data;
    const primaryName = config.entities?.primary?.plural || 'Primaries';
    const containerName = config.entities?.container?.plural || 'Containers';

    const content = `
        <h2 style="margin-top: 0.5rem;">${escapeHTML(config.name || 'Knowledge Base')}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">${escapeHTML(config.description || '')}</p>

        <div class="stats-bar">
            <a class="stat-card" href="/instruments.html"><span class="stat-number">${containers.length}</span><span class="stat-label">${escapeHTML(containerName)}</span></a>
            <a class="stat-card" href="/obligations.html"><span class="stat-number">${primaries.length}</span><span class="stat-label">${escapeHTML(primaryName)}</span></a>
            <a class="stat-card" href="/matrix.html"><span class="stat-number">${data.mappingIndex.length}</span><span class="stat-label">Provisions Mapped</span></a>
            <a class="stat-card" href="/authorities.html"><span class="stat-number">${authorities.length}</span><span class="stat-label">${escapeHTML(config.entities?.authority?.plural || 'Authorities')}</span></a>
        </div>

        ${renderUpcomingWidget(containers, config)}

        <h2>Quick Links</h2>
        <div class="stats-bar">
            <a class="stat-card" href="/matrix.html"><span class="stat-number" style="font-size:1.5rem;">Grid</span><span class="stat-label">Coverage Matrix</span></a>
            <a class="stat-card" href="/timeline.html"><span class="stat-number" style="font-size:1.5rem;">Dates</span><span class="stat-label">Timeline</span></a>
            <a class="stat-card" href="/compare.html"><span class="stat-number" style="font-size:1.5rem;">vs</span><span class="stat-label">Compare</span></a>
            <a class="stat-card" href="/api/v1/index.json"><span class="stat-number" style="font-size:1.5rem;">API</span><span class="stat-label">JSON API</span></a>
        </div>

        <h2>Use PubLedge</h2>
        <div class="card-grid" style="margin-bottom:1rem;">
            <a class="obligation-card" href="/instruments.html" style="text-decoration:none;color:inherit;">
                <div class="card-title">Browse the registry</div>
                <div class="card-description">Walk the hierarchical index of instruments by country, jurisdiction, authority, and type.</div>
            </a>
            <a class="obligation-card" href="/about/" style="text-decoration:none;color:inherit;">
                <div class="card-title">Cite a record</div>
                <div class="card-description">Every record exposes a stable identifier, a canonical URL, a <code>record.json</code> endpoint, and <code>Schema.org</code> LegalDocument markup.</div>
            </a>
            <a class="obligation-card" href="https://github.com/snapsynapse/publedge/blob/main/mcp-server.js" style="text-decoration:none;color:inherit;">
                <div class="card-title">Run the MCP server</div>
                <div class="card-description">Query the registry from Claude, Cursor, or any MCP client. List, filter, fetch by URL, search obligations, upcoming milestones.</div>
            </a>
            <a class="obligation-card" href="https://github.com/snapsynapse/publedge/issues/new" style="text-decoration:none;color:inherit;">
                <div class="card-title">Contribute or request</div>
                <div class="card-description">Open a GitHub issue to add an instrument, flag a correction, or discuss a mapping. Contribution guidelines in <a href="/CONTRIBUTING.md">CONTRIBUTING.md</a>.</div>
            </a>
            <a class="obligation-card" href="/feed.json" style="text-decoration:none;color:inherit;">
                <div class="card-title">Subscribe to updates</div>
                <div class="card-description">JSON Feed 1.1 (<a href="/feed.json">feed.json</a>), Atom (<a href="/atom.xml">atom.xml</a>), or RSS (<a href="/feed.xml">feed.xml</a>). Also: enforcement <a href="/calendar.ics">calendar.ics</a>.</div>
            </a>
            <a class="obligation-card" href="/reference/disclaimer/" style="text-decoration:none;color:inherit;">
                <div class="card-title">Read the disclaimer</div>
                <div class="card-description">PubLedge is not legal advice. Source policy, limitation of liability, AI-assisted-compilation notice.</div>
            </a>
        </div>

        ${(() => {
            const today = new Date().toISOString().slice(0, 10);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
            // Sort by proximity to today using effective → enacted → last_verified fallback.
            const sorted = [...containers].sort((a, b) => {
                const aD = a.effective || a.enacted || a.last_verified || '9999-12-31';
                const bD = b.effective || b.enacted || b.last_verified || '9999-12-31';
                const aDist = Math.abs(new Date(aD) - new Date(today));
                const bDist = Math.abs(new Date(bD) - new Date(today));
                return aDist - bDist;
            });
            const recent = sorted.slice(0, 10);
            const hasMore = containers.length > recent.length;
            const rows = recent.map(c => {
                const isNew = c.enacted && c.enacted >= thirtyDaysAgo;
                const isUpdated = !isNew && c.last_verified && c.last_verified >= thirtyDaysAgo;
                const badge = isNew
                    ? ' <span class="recency-badge new">new</span>'
                    : (isUpdated ? ' <span class="recency-badge updated">updated</span>' : '');
                const jLabel = config.hierarchy?.jurisdictions?.[c.jurisdiction]?.label || c.jurisdiction;
                return `<tr>
                    <td><a href="${containerIndexHref(c)}" onclick="passTheme(this)">${escapeHTML(c.title || c.name || c.id)}</a>${badge}</td>
                    ${tdJurisdiction(c.jurisdiction, { label: jLabel })}
                    ${tdStatus(c.status)}
                    ${tdDate(c.effective)}
                    ${tdNumber(c.provisions.length)}
                </tr>`;
            }).join('\n');
            return `
        <h2>${escapeHTML(containerName)} <span style="font-size:0.7em;color:var(--muted);font-weight:400;">— ${recent.length} most recent</span></h2>
        <table class="data-table">
            <thead><tr>${th(config.entities?.container?.name || 'Container')}${th('Scope', { filter: 'scope' })}${th('Status', { filter: 'status' })}${th('Effective')}${th('Provisions', { sortType: 'number' })}</tr></thead>
            <tbody>${rows}</tbody>
        </table>
        ${hasMore ? `<p style="margin-top:0.75rem;"><a href="/instruments.html">See all ${containers.length} ${containerName.toLowerCase()} →</a></p>` : ''}`;
        })()}

        <h2>${escapeHTML(primaryName)}</h2>
        <div class="card-grid">
            ${primaries.map(p => {
                const regCount = Object.keys(matrix[p.id] || {}).length;
                const summary = p._body ? (p._body.match(/## Summary\n\n([^\n#]+)/) || [])[1]?.trim() || '' : '';
                return `<div class="obligation-card">
                    <div class="card-title"><a href="/primary/${p.id}/" onclick="passTheme(this)">${escapeHTML(p.name || humanizeId(p.id))}</a></div>
                    <div class="card-meta">${renderGroupBadge(p.group)} <span class="meta-item">${regCount} ${(config.entities?.container?.name || 'container').toLowerCase()}${regCount !== 1 ? 's' : ''}</span></div>
                    ${summary ? `<div class="card-description">${escapeHTML(summary)}</div>` : ''}
                </div>`;
            }).join('\n')}
        </div>

    `;

    const siteUrl = config.url || '';
    const homepageStructuredData = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': `${siteUrl}#website`,
                'url': siteUrl,
                'name': config.name || 'PubLedge',
                'description': config.description || '',
                'inLanguage': 'en',
                'publisher': { '@id': `${siteUrl}#organization` },
                'potentialAction': {
                    '@type': 'SearchAction',
                    'target': { '@type': 'EntryPoint', 'urlTemplate': `${siteUrl}?q={search_term_string}` },
                    'query-input': 'required name=search_term_string'
                }
            },
            {
                '@type': 'Organization',
                '@id': `${siteUrl}#organization`,
                'name': 'PAICE.work PBC',
                'url': 'https://paice.foundation',
                'logo': { '@type': 'ImageObject', 'url': `${siteUrl}imgs/og.png` },
                'sameAs': [
                    'https://github.com/snapsynapse/publedge',
                    'https://paice.foundation'
                ]
            },
            {
                '@type': 'DataCatalog',
                'name': `${config.name || 'PubLedge'} Registry`,
                'description': 'Public registry of fact-specific written interpretations between two parties — JIAs, RMAs, no-action letters, private letter rulings, and analogous instruments.',
                'url': `${siteUrl}instruments.html`,
                'publisher': { '@id': `${siteUrl}#organization` },
                'license': 'https://creativecommons.org/licenses/by/4.0/',
                'dataset': [
                    { '@type': 'Dataset', 'name': 'Legal Instruments', 'url': `${siteUrl}instruments.html`, 'distribution': [{ '@type': 'DataDownload', 'encodingFormat': 'application/json', 'contentUrl': `${siteUrl}api/v1/containers.json` }] },
                    { '@type': 'Dataset', 'name': 'Obligations', 'url': `${siteUrl}obligations.html`, 'distribution': [{ '@type': 'DataDownload', 'encodingFormat': 'application/json', 'contentUrl': `${siteUrl}api/v1/primaries.json` }] },
                    { '@type': 'Dataset', 'name': 'Coverage Matrix', 'url': `${siteUrl}matrix.html`, 'distribution': [{ '@type': 'DataDownload', 'encodingFormat': 'application/json', 'contentUrl': `${siteUrl}api/v1/matrix.json` }] }
                ]
            }
        ]
    };
    return renderPageShell(config, { title: `${config.name || 'PubLedge'} — ${config.tagline || 'Public registry of fact-specific interpretations'}`, activePage: 'home', content, canonicalPath: '', description: config.description, configCSS, structuredData: homepageStructuredData });
}

function generateContainersPage(config, data, configCSS) {
    const { containers } = data;
    const cName = config.entities?.container?.name || 'Container';
    const cPlural = config.entities?.container?.plural || 'Containers';
    const scopeField = config.entities?.container?.scope_field || 'jurisdiction';
    const scopes = [...new Set(containers.map(c => c[scopeField]).filter(Boolean))].sort();

    const content = `
        <h2 style="margin-top: 0.5rem;">${escapeHTML(cPlural)}</h2>
        <div class="filters">
            <span class="table-result-count"><strong>${containers.length}</strong> of ${containers.length}</span>
        </div>
        <table class="data-table" id="itemTable">
            <thead><tr>${th(cName)}${th('Scope', { filter: 'scope' })}${th('Status', { filter: 'status' })}${th('Effective')}${th('Provisions', { sortType: 'number' })}</tr></thead>
            <tbody>
                ${containers.map(c => `<tr data-scope="${escapeHTML(c[scopeField] || '')}">
                    <td><a href="${containerIndexHref(c)}" onclick="passTheme(this)">${escapeHTML(c.title || c.name || c.id)}</a></td>
                    ${tdJurisdiction(c[scopeField], { label: (config.hierarchy?.jurisdictions?.[c[scopeField]]?.label || c[scopeField]) })}
                    ${tdStatus(c.status)}
                    ${tdDate(c.effective)}
                    ${tdNumber(c.provisions.length)}
                </tr>`).join('\n')}
            </tbody>
        </table>
    `;

    const siteUrl = config.url || '';
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': cPlural,
        'description': `All ${cPlural.toLowerCase()} tracked by ${config.name || 'PubLedge'}.`,
        'url': `${siteUrl}instruments.html`,
        'numberOfItems': containers.length,
        'itemListElement': containers.map((c, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'url': `${siteUrl}${containerIndexHref(c).replace(/^\//, '')}`,
            'name': c.title || c.name || c.id,
            'item': {
                '@type': 'LegalDocument',
                'identifier': c.id,
                'name': c.title || c.name || c.id,
                'url': `${siteUrl}${containerIndexHref(c).replace(/^\//, '')}`
            }
        }))
    };

    return renderPageShell(config, { title: cPlural, activePage: 'containers', content, canonicalPath: 'instruments.html', configCSS, structuredData });
}

function generateAuthoritiesPage(config, data, configCSS) {
    const { authorities, containers } = data;
    const jurMap = config.hierarchy?.jurisdictions || {};
    const rows = authorities.map(a => {
        const jur = jurMap[a.jurisdiction];
        const count = containers.filter(c => c.authority === a.id).length;
        const jLabel = jur?.label || a.jurisdiction || '';
        return `<tr>
            <td><a href="${authorityHref(a)}" onclick="passTheme(this)">${escapeHTML(a.name || a.id)}</a></td>
            ${tdJurisdiction(a.jurisdiction, { label: jLabel })}
            <td>${a.website ? `<a href="${escapeHTML(a.website)}" target="_blank" rel="noopener">External site →</a>` : '—'}</td>
            ${tdNumber(count)}
        </tr>`;
    }).join('\n');
    const content = `
        <h2 style="margin-top:0.5rem;">Authorities</h2>
        <p style="color:var(--muted);">Organizations that issue interpretations, waivers, or enforcement positions tracked by PubLedge.</p>
        <div class="filters">
            <span class="table-result-count"><strong>${authorities.length}</strong> of ${authorities.length}</span>
        </div>
        <table class="data-table">
            <thead><tr>${th('Authority')}${th('Jurisdiction', { filter: 'jurisdiction' })}${th('Website')}${th('Records', { sortType: 'number' })}</tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
    const siteUrl = config.url || '';
    const authStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': 'Authorities',
        'description': 'Organizations that issue interpretations, waivers, or enforcement positions tracked by PubLedge.',
        'url': `${siteUrl}authorities.html`,
        'numberOfItems': authorities.length,
        'itemListElement': authorities.map((a, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'url': `${siteUrl}${authorityHref(a).replace(/^\//, '')}`,
            'name': a.name || a.id,
            'item': {
                '@type': 'GovernmentOrganization',
                'identifier': a.id,
                'name': a.name || a.id,
                'url': a.website || `${siteUrl}${authorityHref(a).replace(/^\//, '')}`
            }
        }))
    };
    return renderPageShell(config, {
        title: 'Authorities',
        activePage: 'none',
        content,
        canonicalPath: 'authorities.html',
        configCSS,
        structuredData: authStructuredData
    });
}

function generatePrimariesPage(config, data, configCSS) {
    const { primaries, matrix } = data;
    const pPlural = config.entities?.primary?.plural || 'Primaries';
    const groups = config.entities?.primary?.groups || [];
    const cNameLower = (config.entities?.container?.name || 'container').toLowerCase();

    const content = `
        <h2 style="margin-top: 0.5rem;">${escapeHTML(pPlural)}</h2>
        ${groups.map(g => {
            const groupName = g.name || g;
            const groupItems = primaries.filter(p => p.group === groupName);
            if (!groupItems.length) return '';
            return `<h3>${renderGroupBadge(groupName)} ${escapeHTML(humanizeId(groupName))}</h3>
            <div class="card-grid">
                ${groupItems.map(p => {
                    const regCount = Object.keys(matrix[p.id] || {}).length;
                    const summary = p._body ? (p._body.match(/## Summary\n\n([^\n#]+)/) || [])[1]?.trim() || '' : '';
                    return `<div class="obligation-card">
                        <div class="card-title"><a href="/primary/${p.id}/" onclick="passTheme(this)">${escapeHTML(p.name || humanizeId(p.id))}</a></div>
                        <div class="card-meta"><span class="meta-item">${regCount} ${cNameLower}${regCount !== 1 ? 's' : ''}</span></div>
                        ${summary ? `<div class="card-description">${escapeHTML(summary)}</div>` : ''}
                    </div>`;
                }).join('\n')}
            </div>`;
        }).join('\n')}
    `;

    const siteUrl = config.url || '';
    const primStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': pPlural,
        'description': `Stable obligation anchors tracked by ${config.name || 'PubLedge'}; each is implemented by one or more ${cNameLower}s.`,
        'url': `${siteUrl}obligations.html`,
        'numberOfItems': primaries.length,
        'itemListElement': primaries.map((p, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'url': `${siteUrl}primary/${p.id}/`,
            'name': p.name || humanizeId(p.id),
            'item': {
                '@type': 'DefinedTerm',
                'identifier': p.id,
                'name': p.name || humanizeId(p.id),
                'inDefinedTermSet': `${siteUrl}obligations.html`,
                'url': `${siteUrl}primary/${p.id}/`,
                'termCode': p.group
            }
        }))
    };

    return renderPageShell(config, { title: pPlural, activePage: 'primaries', content, canonicalPath: 'obligations.html', configCSS, structuredData: primStructuredData });
}

function generateMatrixPage(config, data, configCSS) {
    const { primaries, containers, matrix } = data;
    const pName = config.entities?.primary?.name || 'Primary';

    const headerCells = containers.map(c => `<th><a href="${containerIndexHref(c)}" onclick="passTheme(this)" title="${escapeHTML(c.title || c.name || c.id)}">${escapeHTML(c.jurisdiction || c.id)}</a></th>`).join('');

    const rows = primaries.map(p => {
        const pLabel = p.name || humanizeId(p.id);
        const cells = containers.map(c => {
            const entry = (matrix[p.id] || {})[c.id];
            if (entry && entry.covered) {
                const n = entry.provisions.length;
                return `<td class="matrix-cell covered" title="${escapeHTML(pLabel)} — ${escapeHTML(c.title || c.name || c.id)}: ${n}"><a href="/requires/${c.id}/${p.id}/" onclick="passTheme(this)" style="color:inherit;text-decoration:none;">${n}</a></td>`;
            }
            return `<td class="matrix-cell empty">&mdash;</td>`;
        }).join('');
        return `<tr><td class="matrix-row-header group-${p.group || 'other'}"><a href="/primary/${p.id}/" onclick="passTheme(this)" style="color:inherit;">${escapeHTML(pLabel)}</a></td>${cells}</tr>`;
    }).join('\n');

    const content = `
        <h2 style="margin-top: 0.5rem;">Coverage Matrix</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">Which ${(config.entities?.container?.plural || 'containers').toLowerCase()} cover which ${(config.entities?.primary?.plural || 'primaries').toLowerCase()}. Green cells link to details.</p>
        <div class="matrix-wrapper">
            <table class="matrix-table">
                <thead><tr><th class="matrix-corner">${escapeHTML(pName)}</th>${headerCells}</tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;

    const siteUrl = config.url || '';
    const matrixStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        'name': 'PubLedge Coverage Matrix',
        'description': `Coverage matrix mapping ${primaries.length} ${(config.entities?.primary?.plural || 'primaries').toLowerCase()} across ${containers.length} ${(config.entities?.container?.plural || 'containers').toLowerCase()}. Each cell indicates whether a given instrument implements a given obligation.`,
        'url': `${siteUrl}matrix.html`,
        'keywords': ['coverage matrix', 'obligations', 'legal instruments', 'public interpretation'],
        'license': 'https://creativecommons.org/licenses/by/4.0/',
        'creator': { '@type': 'Organization', 'name': 'PAICE.work PBC', 'url': 'https://paice.foundation' },
        'distribution': [
            { '@type': 'DataDownload', 'encodingFormat': 'application/json', 'contentUrl': `${siteUrl}api/v1/matrix.json` },
            { '@type': 'DataDownload', 'encodingFormat': 'text/html', 'contentUrl': `${siteUrl}matrix.html` }
        ]
    };
    return renderPageShell(config, { title: 'Coverage Matrix', activePage: 'matrix', content, canonicalPath: 'matrix.html', configCSS, structuredData: matrixStructuredData });
}

function generateTimelinePage(config, data, configCSS) {
    const { containers } = data;
    const today = new Date().toISOString().split('T')[0];
    const scopeField = config.entities?.container?.scope_field || 'jurisdiction';
    const events = [];

    const isValidDate = (s) => {
        if (!s) return false;
        const str = String(s).trim();
        if (!str || /^(null|undefined|tbd|n\/a)$/i.test(str)) return false;
        return !isNaN(new Date(str + 'T00:00:00').getTime());
    };

    for (const c of containers) {
        for (const t of c.timeline) {
            if (isValidDate(t.date)) {
                events.push({
                    date: t.date,
                    milestone: t.milestone || t.notes || '',
                    container: c.title || c.name || c.id,
                    containerId: c.id,
                    scope: c[scopeField]
                });
            }
        }
    }
    // Newest first (descending).
    events.sort((a, b) => b.date.localeCompare(a.date));

    const byYear = {};
    for (const ev of events) { const y = ev.date.slice(0, 4); (byYear[y] = byYear[y] || []).push(ev); }

    const html = Object.keys(byYear).sort().reverse().map(year =>
        `<div class="timeline-year">${year}</div>\n` +
        byYear[year].map(ev => `<div class="timeline-entry ${ev.date <= today ? 'past' : 'future'}">
            <div class="timeline-date">${formatDate(ev.date)}</div>
            <div class="timeline-content">
                <a href="${containerHrefById(ev.containerId, data.containerById)}" onclick="passTheme(this)" class="timeline-regulation">${escapeHTML(ev.container)}</a>
                <span class="timeline-milestone">${escapeHTML(ev.milestone)}</span>
                <span class="timeline-jurisdiction">${escapeHTML(ev.scope || '')}</span>
            </div>
        </div>`).join('\n')
    ).join('\n');

    const content = `<h2 style="margin-top: 0.5rem;">Timeline</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">Key dates. Solid dots are past; hollow dots are future.</p>
        <div class="timeline">${html}</div>`;

    return renderPageShell(config, { title: 'Timeline', activePage: 'timeline', content, canonicalPath: 'timeline.html', configCSS });
}

function generateComparePage(config, data, configCSS) {
    const { containers, primaries, mappingIndex } = data;
    const cName = config.entities?.container?.name || 'Container';
    const cPlural = config.entities?.container?.plural || 'Containers';

    const checkboxes = containers.map(c => `<label><input type="checkbox" name="cmp" value="${escapeHTML(c.id)}" onchange="updateComparison()"> <span>${escapeHTML(c.title || c.name || c.id)}</span></label>`).join('\n');
    const namesById = JSON.stringify(Object.fromEntries(containers.map(c => [c.id, c.title || c.name || c.id])));

    const content = `
        <h2 style="margin-top: 0.5rem;">Compare ${escapeHTML(cPlural)}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1rem;">Select 2 or 3 to compare coverage.</p>
        <div class="compare-selector" id="compareSelector">${checkboxes}</div>
        <div id="compareResult" class="compare-result"></div>
        <script>
        var cmpData = ${JSON.stringify(containers.map(c => ({ id: c.id, name: c.title || c.name || c.id, primaries: [...new Set(mappingIndex.filter(m => m.regulation === c.id).flatMap(m => m.obligations))] })))};
        var pNames = ${JSON.stringify(Object.fromEntries(primaries.map(p => [p.id, p.name || humanizeId(p.id)])))};
        function updateComparison() {
            var checked = Array.from(document.querySelectorAll('#compareSelector input:checked'));
            if (checked.length > 3) { checked[0].checked = false; checked = checked.slice(1); }
            var sel = checked.map(function(cb) { return cb.value; });
            if (sel.length < 2) { document.getElementById('compareResult').innerHTML = '<p style="color:var(--text-secondary);">Select at least 2.</p>'; return; }
            var items = sel.map(function(id) { return cmpData.find(function(c) { return c.id === id; }); });
            var all = new Set(); items.forEach(function(i) { i.primaries.forEach(function(p) { all.add(p); }); });
            var shared = [], unique = {}; items.forEach(function(i) { unique[i.id] = []; });
            all.forEach(function(p) {
                var has = items.filter(function(i) { return i.primaries.indexOf(p) !== -1; });
                if (has.length === items.length) shared.push(p);
                else has.forEach(function(i) { unique[i.id].push(p); });
            });
            var html = '<div class="compare-section"><h3>Shared (' + shared.length + ')</h3>' +
                (shared.length ? '<ul class="compare-list">' + shared.map(function(p) { return '<li><a href="primary/' + p + '/index.html">' + (pNames[p]||p) + '</a></li>'; }).join('') + '</ul>' : '<p style="color:var(--text-secondary);">None shared.</p>') + '</div>';
            items.forEach(function(i) {
                var u = unique[i.id];
                html += '<div class="compare-section"><h3>Only in ' + i.name + ' (' + u.length + ')</h3>' +
                    (u.length ? '<ul class="compare-list">' + u.map(function(p) { return '<li><a href="primary/' + p + '/index.html">' + (pNames[p]||p) + '</a></li>'; }).join('') + '</ul>' : '<p style="color:var(--text-secondary);">None unique.</p>') + '</div>';
            });
            document.getElementById('compareResult').innerHTML = html;
            var url = new URL(window.location); url.searchParams.set('items', sel.join(',')); history.replaceState(null, '', url);
        }
        (function() { var p = new URLSearchParams(window.location.search); var ids = (p.get('items')||'').split(',').filter(Boolean);
            if (ids.length) { ids.forEach(function(id) { var cb = document.querySelector('#compareSelector input[value="'+id+'"]'); if (cb) cb.checked = true; }); updateComparison(); }
        })();
        </script>
    `;

    return renderPageShell(config, { title: 'Compare', activePage: 'compare', content, canonicalPath: 'compare.html', configCSS });
}

function generateAboutPage(config, data, configCSS) {
    const { primaries, containers, authorities, totalProvisions } = data;
    const pName = config.entities?.primary?.name || 'Primary';
    const pPlural = config.entities?.primary?.plural || 'Primaries';
    const cName = config.entities?.container?.name || 'Container';
    const cPlural = config.entities?.container?.plural || 'Containers';
    const secName = config.entities?.secondary?.name || 'Provision';
    const authName = config.entities?.authority?.name || 'Authority';
    const rel = config.entities?.secondary?.relationship || 'implements';

    const content = `<div class="about-content">
        <h2 style="margin-top: 0.5rem;">About</h2>
        <p>${escapeHTML(config.description || '')} Tracks <strong>${containers.length} ${cPlural.toLowerCase()}</strong>, <strong>${primaries.length} ${pPlural.toLowerCase()}</strong>, <strong>${totalProvisions} ${secName.toLowerCase()}s</strong>, and <strong>${authorities.length} ${authName.toLowerCase()}${authorities.length !== 1 ? 's' : ''}</strong>.</p>
        <h3>Data Model</h3>
        <p><strong>${escapeHTML(authName)}</strong> &rarr; <strong>${escapeHTML(cName)}</strong> &rarr; <strong>${escapeHTML(secName)}</strong> &rarr; <strong>${escapeHTML(pName)}</strong></p>
        <p>${escapeHTML(pPlural)} are the stable anchors. ${escapeHTML(secName)}s are the implementations — different ${cPlural.toLowerCase()} ${rel} the same ${pPlural.toLowerCase()} differently.</p>
        <h3>JSON API</h3>
        <ul>
            <li><span class="api-endpoint"><a href="/api/v1/index.json">api/v1/index.json</a></span> — API manifest</li>
            <li><span class="api-endpoint"><a href="/api/v1/primaries.json">api/v1/primaries.json</a></span> — All ${pPlural.toLowerCase()}</li>
            <li><span class="api-endpoint"><a href="/api/v1/containers.json">api/v1/containers.json</a></span> — All ${cPlural.toLowerCase()}</li>
        </ul>
        <h3>Contributing</h3>
        <p>See the <a href="${escapeHTML(config.repo || '#')}">repository</a> for contribution guidelines.</p>
    </div>`;

    return renderPageShell(config, { title: 'About', activePage: 'about', content, canonicalPath: 'about.html', configCSS });
}

// ---------------------------------------------------------------------------
// Detail page generators
// ---------------------------------------------------------------------------

function generateContainerDetail(config, container, data, configCSS) {
    const { primaries, mappingIndex, matrix, authorities } = data;
    const cPlural = config.entities?.container?.plural || 'Containers';
    const cProvisions = mappingIndex.filter(m => m.regulation === container.id);
    const cPrimaries = [...new Set(cProvisions.flatMap(m => m.obligations))];

    const timelineRows = container.timeline.map(t => `<tr><td>${escapeHTML(t.milestone || '')}</td><td>${formatDate(t.date)}</td><td>${escapeHTML(t.notes || '')}</td></tr>`).join('');

    // Build hierarchy breadcrumbs reflecting canonical URL structure:
    // Home / Registry / {Region} / {Authority} / {Type}s / {Record}
    const crumbs = [];
    const jur = config.hierarchy?.jurisdictions?.[container.jurisdiction];
    if (jur) {
        crumbs.push({ label: 'Registry', href: '/us/' });
        crumbs.push({ label: jur.label || jur.region, href: `/${jur.country}/${jur.region}/` });
        const auth = authorities.find(a => a.id === container.authority);
        if (auth && auth.url_segment) {
            crumbs.push({ label: auth.name || auth.id, href: `/${jur.country}/${jur.region}/${auth.url_segment}/` });
            const typeSeg = config.hierarchy?.type_segments?.[container.type] || container.type;
            const typeLabel = config.hierarchy?.type_labels?.[container.type] || container.type;
            crumbs.push({ label: `${typeLabel}s`, href: `/${jur.country}/${jur.region}/${auth.url_segment}/${typeSeg}/` });
        }
    } else {
        crumbs.push({ label: cPlural, href: '/instruments.html' });
    }
    crumbs.push({ label: container.title || container.name || container.id });

    const content = `
        ${renderBreadcrumb(crumbs)}
        <div class="detail-header">
            <h2>${escapeHTML(container.title || container.name || container.id)}<a class="anchor-link" href="#top" aria-label="Copy link">&#128279;</a></h2>
            ${renderRecordSummary(container, config)}
            <div class="detail-meta">
                ${renderStatusBadge(container.status)}
                ${freshnessBadge(container.last_verified)}
                ${container.effective ? `<span><strong>Effective:</strong> ${formatDate(container.effective)}</span>` : ''}
                ${container.official_url ? `<span><a href="${escapeHTML(container.official_url)}" target="_blank" rel="noopener">Official source</a></span>` : ''}
            </div>
            ${renderIncompleteMetadataWarning(container)}
            <div class="citation-block">
                <strong>Cite as:</strong> <code>${escapeHTML(container.id)}</code>${container.official_ref ? ` &middot; <em>${escapeHTML(container.official_ref)}</em>` : ''}
                &middot; <a href="record.json">record.json</a>
                ${container.legacy_id ? `<br><small style="opacity:0.75;">Legacy identifier: <code>${escapeHTML(container.legacy_id)}</code></small>` : ''}
            </div>
        </div>
        ${cPrimaries.length ? `<h3>${config.entities?.primary?.plural || 'Primaries'} Covered</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem;">
            ${cPrimaries.map(pId => { const p = primaries.find(pr => pr.id === pId); return `<a href="/primary/${pId}/" onclick="passTheme(this)" class="group-badge ${p?.group || ''}" style="text-decoration:none;">${escapeHTML(p?.name || humanizeId(pId))}</a>`; }).join(' ')}
        </div>` : ''}
        ${timelineRows ? `<h3>Timeline</h3><table class="data-table"><thead><tr><th>Milestone</th><th>Date</th><th>Notes</th></tr></thead><tbody>${timelineRows}</tbody></table>` : ''}
        ${renderSourceDocuments(container)}
        ${renderExtractedText(container)}
        ${container.provisions.length > 0 ? `<h3>Provisions (${container.provisions.length})</h3>
        ${container.provisions.map(p => renderProvisionCard(p, '../../')).join('\n')}` : ''}
        ${renderPrevNext(container, data)}
        ${renderRecordChangelog(container)}
    `;

    const displayName = container.title || container.name || container.id;
    return renderBridgeShell(config, { title: displayName, depth: 2, content, canonicalPath: container._canonicalPath || `container/${container.id}/`, description: `${displayName} — ${container.provisions.length} provisions.`, configCSS, structuredData: generateLegalDocumentJsonLd(container, config) });
}

function generatePrimaryDetail(config, primary, data, configCSS) {
    const { containers, matrix } = data;
    const pPlural = config.entities?.primary?.plural || 'Primaries';
    const cName = (config.entities?.container?.name || 'Container').toLowerCase();
    const pMatrix = matrix[primary.id] || {};
    const coveredContainers = Object.keys(pMatrix);
    const summary = primary._body ? extractSection(primary._body, 'Summary') : '';
    const whatCounts = primary._body ? extractSection(primary._body, 'What Counts') : '';
    const whatDoesNot = primary._body ? extractSection(primary._body, 'What Does Not Count') : '';

    const content = `
        ${renderBreadcrumb([{ label: pPlural, href: '/obligations.html' }, { label: primary.name || humanizeId(primary.id) }])}
        <div class="detail-header">
            <h2>${escapeHTML(primary.name || humanizeId(primary.id))}</h2>
            <div class="detail-meta">${renderGroupBadge(primary.group)} <span class="meta-item">${coveredContainers.length} ${cName}${coveredContainers.length !== 1 ? 's' : ''}</span></div>
        </div>
        ${summary ? `<p style="font-size:1rem;line-height:1.6;margin:1rem 0;">${escapeHTML(summary)}</p>` : ''}
        ${whatCounts ? `<h3>What Counts</h3><ul>${parseBulletList(whatCounts).map(i => `<li>${escapeHTML(i)}</li>`).join('')}</ul>` : ''}
        ${whatDoesNot ? `<h3>What Does Not Count</h3><ul>${parseBulletList(whatDoesNot).map(i => `<li>${escapeHTML(i)}</li>`).join('')}</ul>` : ''}
        <h3>Implementing ${config.entities?.container?.plural || 'Containers'}</h3>
        ${coveredContainers.length ? `<table class="data-table"><thead><tr><th>${config.entities?.container?.name || 'Container'}</th><th>Scope</th><th>Status</th><th>Provisions</th></tr></thead><tbody>
            ${coveredContainers.map(cId => { const c = containers.find(co => co.id === cId); if (!c) return ''; return `<tr><td><a href="${containerIndexHref(c)}" onclick="passTheme(this)">${escapeHTML(c.title || c.name || c.id)}</a></td><td>${escapeHTML(c.jurisdiction || '')}</td><td>${renderStatusBadge(c.status)}</td><td>${pMatrix[cId].provisions.length}</td></tr>`; }).join('\n')}
        </tbody></table>` : `<p style="color:var(--text-secondary);">No ${cName}s currently implement this.</p>`}
    `;

    return renderBridgeShell(config, { title: primary.name || humanizeId(primary.id), depth: 2, content, canonicalPath: `primary/${primary.id}/`, description: `${primary.name || humanizeId(primary.id)} — ${summary.slice(0, 150)}`, configCSS });
}

function generateAuthorityDetail(config, auth, data, configCSS) {
    const { containers } = data;
    const authContainers = containers.filter(c => c.authority === auth.id);

    const content = `
        ${renderBreadcrumb([{ label: auth.name || humanizeId(auth.id) }], '../../')}
        <div class="detail-header">
            <h2>${escapeHTML(auth.name || humanizeId(auth.id))}</h2>
            <div class="detail-meta">
                ${auth.jurisdiction ? `<span><strong>Scope:</strong> ${escapeHTML(auth.jurisdiction)}</span>` : ''}
                ${auth.website ? `<span><a href="${escapeHTML(auth.website)}" target="_blank" rel="noopener">${escapeHTML(auth.website)}</a></span>` : ''}
            </div>
        </div>
        <h3>${config.entities?.container?.plural || 'Containers'} (${authContainers.length})</h3>
        ${authContainers.length ? `<table class="data-table"><thead><tr><th>Name</th><th>Status</th><th>Effective</th><th>Provisions</th></tr></thead><tbody>
            ${authContainers.map(c => `<tr><td><a href="${containerIndexHref(c)}" onclick="passTheme(this)">${escapeHTML(c.title || c.name || c.id)}</a></td><td>${renderStatusBadge(c.status)}</td><td>${formatDate(c.effective)}</td><td>${c.provisions.length}</td></tr>`).join('\n')}
        </tbody></table>` : '<p style="color:var(--text-secondary);">None tracked.</p>'}
    `;

    return renderBridgeShell(config, { title: auth.name || humanizeId(auth.id), depth: 2, content, canonicalPath: auth._canonicalPath || `authority/${auth.id}/`, configCSS });
}

// ---------------------------------------------------------------------------
// Bridge pages
// ---------------------------------------------------------------------------

function generateRequiresBridge(config, containerId, primaryId, data, configCSS) {
    const { containers, primaries, mappingIndex } = data;
    const container = containers.find(c => c.id === containerId);
    const primary = primaries.find(p => p.id === primaryId);
    if (!container || !primary) return null;

    const matching = mappingIndex.filter(m => m.regulation === containerId && m.obligations?.includes(primaryId));
    const covered = matching.length > 0;
    const pName = primary.name || humanizeId(primaryId);
    const provCards = container.provisions.filter(p => matching.some(m => m.source_heading === p.name));

    const content = `
        ${renderBreadcrumb([{ label: container.title || container.name || container.id, href: containerIndexHref(container) }, { label: pName }], '../../../')}
        <div class="bridge-header">
            <h2>Does ${escapeHTML(container.title || container.name || container.id)} require ${escapeHTML(pName)}?</h2>
        </div>
        <div class="bridge-answer">
            ${covered ? `<p class="answer-yes">Yes &mdash; ${matching.length} provision${matching.length !== 1 ? 's' : ''}</p>` : `<p class="answer-no">Not specifically addressed</p>`}
        </div>
        ${provCards.map(p => renderProvisionCard(p, '../../../')).join('\n')}
        <div style="margin-top: 2rem; text-align: center;">
            <a href="${containerIndexHref(container)}" onclick="passTheme(this)" class="bridge-cta">View ${escapeHTML(config.entities?.container?.name || 'container')}</a>
            <a href="/primary/${primaryId}/" onclick="passTheme(this)" class="bridge-cta">View ${escapeHTML(config.entities?.primary?.name || 'primary')}</a>
            <a href="/matrix.html" onclick="passTheme(this)" class="bridge-cta">Coverage matrix</a>
        </div>
    `;

    const cDisp = container.title || container.name || container.id;
    return renderBridgeShell(config, { title: `${cDisp} — ${pName}`, depth: 3, content, canonicalPath: `requires/${containerId}/${primaryId}/`, description: `Does ${cDisp} require ${pName}? ${covered ? 'Yes' : 'No'}.`, configCSS });
}

function generateCompareBridge(config, cA, cB, comparison, data, configCSS) {
    const { primaries } = data;
    const pName = id => { const p = primaries.find(pr => pr.id === id); return p ? (p.name || humanizeId(id)) : humanizeId(id); };

    const aLabel = cA.title || cA.name || cA.id;
    const bLabel = cB.title || cB.name || cB.id;
    const content = `
        ${renderBreadcrumb([{ label: 'Compare', href: 'compare.html' }, { label: `${aLabel} vs ${bLabel}` }], '../../')}
        <div class="bridge-header"><h2>${escapeHTML(aLabel)} vs ${escapeHTML(bLabel)}</h2></div>
        <div class="compare-section"><h3>Shared (${comparison.shared_count})</h3>
            ${comparison.shared_obligations.length ? `<ul class="compare-list">${comparison.shared_obligations.map(o => `<li><a href="/primary/${o}/" onclick="passTheme(this)">${escapeHTML(pName(o))}</a></li>`).join('')}</ul>` : '<p style="color:var(--text-secondary);">None shared.</p>'}
        </div>
        <div class="compare-section"><h3>Only in ${escapeHTML(aLabel)} (${comparison.only_a_count})</h3>
            ${comparison.only_a.length ? `<ul class="compare-list">${comparison.only_a.map(o => `<li><a href="/primary/${o}/">${escapeHTML(pName(o))}</a></li>`).join('')}</ul>` : '<p style="color:var(--text-secondary);">None unique.</p>'}
        </div>
        <div class="compare-section"><h3>Only in ${escapeHTML(bLabel)} (${comparison.only_b_count})</h3>
            ${comparison.only_b.length ? `<ul class="compare-list">${comparison.only_b.map(o => `<li><a href="/primary/${o}/">${escapeHTML(pName(o))}</a></li>`).join('')}</ul>` : '<p style="color:var(--text-secondary);">None unique.</p>'}
        </div>
        <div style="margin-top: 2rem; text-align: center;">
            <a href="${containerIndexHref(cA)}" onclick="passTheme(this)" class="bridge-cta">View ${escapeHTML(cA.title || cA.name || cA.id)}</a>
            <a href="${containerIndexHref(cB)}" onclick="passTheme(this)" class="bridge-cta">View ${escapeHTML(cB.title || cB.name || cB.id)}</a>
        </div>
    `;

    return renderBridgeShell(config, { title: `${cA.name} vs ${cB.name}`, depth: 2, content, canonicalPath: `compare/${cA.id}-vs-${cB.id}/`, configCSS, noindex: comparison.shared_count === 0 });
}

function generateAppliesToBridge(config, scopeValue, data, configCSS) {
    const { containers } = data;
    const scopeField = config.entities?.container?.scope_field || 'jurisdiction';
    const scopeContainers = containers.filter(c => c[scopeField] === scopeValue);

    const content = `
        ${renderBreadcrumb([{ label: scopeValue }], '../../')}
        <div class="bridge-header"><h2>${escapeHTML(config.entities?.container?.plural || 'Containers')} in ${escapeHTML(scopeValue)}</h2>
            <p class="bridge-subtitle">${scopeContainers.length} tracked</p>
        </div>
        <table class="data-table"><thead><tr><th>Name</th><th>Status</th><th>Effective</th><th>Provisions</th></tr></thead><tbody>
            ${scopeContainers.map(c => `<tr><td><a href="${containerIndexHref(c)}" onclick="passTheme(this)">${escapeHTML(c.title || c.name || c.id)}</a></td><td>${renderStatusBadge(c.status)}</td><td>${formatDate(c.effective)}</td><td>${c.provisions.length}</td></tr>`).join('\n')}
        </tbody></table>
        <div style="margin-top: 2rem; text-align: center;"><a href="/instruments.html" onclick="passTheme(this)" class="bridge-cta">All ${escapeHTML((config.entities?.container?.plural || 'containers').toLowerCase())}</a></div>
    `;

    return renderBridgeShell(config, { title: `${scopeValue}`, depth: 2, content, canonicalPath: `applies-to/${slugify(scopeValue)}/`, configCSS, noindex: scopeContainers.length === 0 });
}

// ---------------------------------------------------------------------------
// Search index + sitemap
// ---------------------------------------------------------------------------

function buildSearchIndex(config, data) {
    const items = [];
    for (const c of data.containers) {
        items.push({ type: config.entities?.container?.name?.toLowerCase() || 'container', name: c.title || c.name || c.id, id: c.id, href: containerIndexHref(c), jurisdiction: c.jurisdiction || '', _search: [c.title || c.name || c.id, c.jurisdiction || '', c.id, c.status || ''].join(' ').toLowerCase() });
    }
    for (const p of data.primaries) {
        const summary = p._body ? (p._body.match(/## Summary\n\n([^\n#]+)/) || [])[1]?.trim() || '' : '';
        items.push({ type: config.entities?.primary?.name?.toLowerCase() || 'primary', name: p.name || humanizeId(p.id), id: p.id, href: `primary/${p.id}/index.html`, group: p.group || '', _search: [p.name || '', p.id, p.group || '', summary, ...(p.search_terms || [])].join(' ').toLowerCase() });
    }
    for (const a of data.authorities) {
        items.push({ type: config.entities?.authority?.name?.toLowerCase() || 'authority', name: a.name || humanizeId(a.id), id: a.id, href: `authority/${a.id}/index.html`, jurisdiction: a.jurisdiction || '', _search: [a.name || '', a.id, a.jurisdiction || ''].join(' ').toLowerCase() });
    }
    return items;
}

function generateSitemap(config, pages) {
    const base = config.url || '';
    const lastmod = new Date().toISOString().split('T')[0];
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `  <url><loc>${base}${p}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}\n</urlset>`;
}

// ---------------------------------------------------------------------------
// 404 page
// ---------------------------------------------------------------------------

function generate404Page(config, configCSS) {
    const containerPlural = (config.entities?.container?.plural || 'Containers').toLowerCase();
    const primaryPlural = (config.entities?.primary?.plural || 'Primaries').toLowerCase();
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Not Found - ${escapeHTML(config.name || '')}</title>
    <meta name="robots" content="noindex">
    <link rel="stylesheet" href="/assets/styles.css">
    <style>${configCSS || ''}</style>
    ${renderThemeInit()}
</head>
<body>
    ${renderSiteNav(config, 'none', '/')}
    <div class="container" id="main-content" style="text-align:center;">
        <h1 style="margin-top:2rem;">404 — Page Not Found</h1>
        <p style="color:var(--text-secondary); margin: 1rem 0 2rem;">The page you're looking for doesn't exist or has moved.</p>
        <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
            <a href="/" class="bridge-cta">Home</a>
            <a href="/instruments.html" class="bridge-cta">All ${escapeHTML(containerPlural)}</a>
            <a href="/obligations.html" class="bridge-cta">All ${escapeHTML(primaryPlural)}</a>
        </div>
    </div>
    ${renderFooter(config)}
    ${renderThemeScript()}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Pattern page
// ---------------------------------------------------------------------------

function generatePatternPage(config, data, configCSS) {
    const primaryName = config.entities?.primary?.name || 'Primary';
    const containerName = config.entities?.container?.name || 'Container';
    const authorityName = config.entities?.authority?.name || 'Authority';
    const secondaryName = config.entities?.secondary?.name || 'Secondary';
    const examples = config.pattern?.examples || [];
    const ecosystem = config.ecosystem || [];
    const canonicalUrl = config.pattern?.canonical_url || '';

    const content = `
        ${canonicalUrl ? `<link rel="canonical" href="${escapeHTML(canonicalUrl)}">` : ''}
        <div class="about-content">
        <h1>Knowledge as Code</h1>
        <p><em>A pattern for building knowledge bases that verify themselves, resist decay, and serve both humans and machines from plain text files.</em></p>
        ${canonicalUrl ? `<p>Canonical pattern definition: <a href="${escapeHTML(canonicalUrl)}">${escapeHTML(canonicalUrl)}</a></p>` : ''}

        <h2>The Pattern</h2>
        <p>Knowledge as Code applies software engineering practices to knowledge management. The knowledge lives in version-controlled plain text files. It is validated by automated processes. It produces multiple outputs from a single source. And it actively resists becoming outdated.</p>

        <h2>Six Properties</h2>
        <table class="data-table">
            <thead><tr><th>Property</th><th>What It Means</th><th>In This Project</th></tr></thead>
            <tbody>
                <tr><td><strong>Plain text canonical</strong></td><td>Knowledge in human-readable, version-controlled files. No database, no CMS, no vendor lock-in.</td><td>Markdown and YAML files in <code>data/</code></td></tr>
                <tr><td><strong>Self-healing</strong></td><td>Automated verification detects when knowledge drifts from reality. Flags decay before humans notice.</td><td>Verification scripts and AI-assisted freshness checks</td></tr>
                <tr><td><strong>Multi-output</strong></td><td>One source produces every format needed — human-readable, machine-readable, agent-queryable.</td><td>HTML site, JSON API, MCP server, SEO bridge pages, sitemap, <code>llms.txt</code></td></tr>
                <tr><td><strong>Zero-dependency</strong></td><td>No external packages. Nothing breaks when you come back in a year.</td><td>One Node.js script, no <code>package.json</code>, no <code>node_modules</code></td></tr>
                <tr><td><strong>Git-native</strong></td><td>Git is the collaboration layer, audit trail, and deployment trigger.</td><td>Issues, PRs, CI/CD, version history — all through Git</td></tr>
                <tr><td><strong>Ontology-driven</strong></td><td>A vendor-neutral taxonomy maps to domain-specific implementations.</td><td>${escapeHTML(data.primaries.length)} ${escapeHTML(config.entities?.primary?.plural || 'primaries')} across ${escapeHTML(data.containers.length)} ${escapeHTML(config.entities?.container?.plural || 'containers')}</td></tr>
            </tbody>
        </table>

        <h2>The Ontology</h2>
        <p>Every Knowledge-as-Code project has four entity roles:</p>
        <div style="text-align: center; padding: 1.5rem 0; font-size: 1.1rem;">
            <strong>${escapeHTML(authorityName)}</strong> → <strong>${escapeHTML(containerName)}</strong> → <strong>${escapeHTML(secondaryName)}</strong> → <strong>${escapeHTML(primaryName)}</strong>
        </div>
        <table class="data-table">
            <thead><tr><th>Role</th><th>This Project</th><th>What It Is</th></tr></thead>
            <tbody>
                <tr><td><strong>Primary</strong></td><td>${escapeHTML(primaryName)}</td><td>Stable anchors that persist when sources change</td></tr>
                <tr><td><strong>Container</strong></td><td>${escapeHTML(containerName)}</td><td>Grouping entities that contain provisions</td></tr>
                <tr><td><strong>Authority</strong></td><td>${escapeHTML(authorityName)}</td><td>Source entities that produce containers</td></tr>
                <tr><td><strong>Secondary</strong></td><td>${escapeHTML(secondaryName)}</td><td>Mapping entities connecting containers to primaries</td></tr>
            </tbody>
        </table>
        <p>Primaries are stable; containers are unstable. When a ${containerName.toLowerCase()} is amended, its ${secondaryName.toLowerCase()}s change, but the underlying ${primaryName.toLowerCase()}s persist.</p>

        <h2>Standing on Shoulders</h2>
        <ul>
            <li><strong>File over App</strong> — <a href="https://stephango.com/file-over-app">Steph Ango</a> on durable digital artifacts as files you control</li>
            <li><strong>Docs as Code</strong> — Managing documentation with version control, pull requests, CI, plain text formats. <a href="https://www.writethedocs.org/guide/docs-as-code/">Write the Docs</a> community</li>
            <li><strong>Living Documentation</strong> — Cyrille Martraire on documentation that evolves with the system it describes</li>
            <li><strong>GitOps</strong> — Git as single source of truth with automated drift detection. Coined by <a href="https://docs.gitops.weaveworks.org/">Weaveworks</a> (2017)</li>
            <li><strong>Anti-entropy</strong> — Distributed systems pattern for detecting and repairing state divergence (Dynamo, Cassandra)</li>
        </ul>

        ${examples.length > 0 ? `
        <h2>Live Examples</h2>
        <div class="card-grid">
            ${examples.map(ex => `<div class="obligation-card">
                <div class="card-title"><a href="${escapeHTML(ex.url)}">${escapeHTML(ex.name)}</a></div>
                <div class="card-description">${escapeHTML(ex.description || '')}</div>
            </div>`).join('\n            ')}
        </div>` : ''}

        ${ecosystem.length > 0 ? `
        <h2>Ecosystem</h2>
        <ul>
            ${ecosystem.map(p => `<li><strong><a href="${escapeHTML(p.url)}">${escapeHTML(p.name)}</a></strong> — ${escapeHTML(p.description || '')}</li>`).join('\n            ')}
        </ul>` : ''}

        <h2>Get Started</h2>
        <pre><code>git clone https://github.com/snapsynapse/knowledge-as-code-template.git
cd knowledge-as-code-template
node scripts/build.js
open docs/index.html</code></pre>
        <p>Template: <a href="https://github.com/snapsynapse/knowledge-as-code-template">github.com/snapsynapse/knowledge-as-code-template</a></p>

        <hr>
        <p><em>Knowledge as Code is a <a href="https://paice.work">PAICE.work</a> project.</em></p>
        </div>
    `;

    return renderPageShell(config, { title: 'Knowledge as Code', activePage: 'pattern', content, description: 'A pattern for building knowledge bases that verify themselves.', canonicalPath: 'pattern.html', configCSS });
}

// ---------------------------------------------------------------------------
// JSON-LD + .json endpoint emission
// ---------------------------------------------------------------------------

function buildSourceDocuments(c, config) {
    const siteUrl = (config.url || '').replace(/\/+$/, '');
    const canonical = siteUrl + containerHref(c);
    const docs = Array.isArray(c.source_documents) ? c.source_documents
        : (c.source_documents ? [c.source_documents] : []);
    const out = [];
    for (const d of docs) {
        const filename = String(d).trim();
        const ext = (filename.split('.').pop() || '').toLowerCase();
        const url = filename.startsWith('http') ? filename : `${canonical}${filename}`;
        const mediaType = ext === 'pdf' ? 'application/pdf'
            : ext === 'txt' ? 'text/plain'
            : ext === 'html' ? 'text/html'
            : 'application/octet-stream';
        out.push({
            role: 'signed-agreement',
            filename,
            url,
            media_type: mediaType,
            authoritative: true
        });
    }
    if (c.extracted_text) {
        const filename = String(c.extracted_text).trim();
        const url = filename.startsWith('http') ? filename : `${canonical}${filename}`;
        out.push({
            role: 'extracted-text',
            filename,
            url,
            media_type: 'text/plain',
            authoritative: false,
            extraction_method: 'ocr-tesseract-v5',
            note: 'OCR-extracted from signed PDF; minor transcription errors possible — signed PDF is authoritative.'
        });
    }
    return out;
}

function generateLegalDocumentJsonLd(c, config) {
    const siteUrl = (config.url || '').replace(/\/+$/, '');
    const canonical = siteUrl + containerHref(c);
    const typeLabel = config.hierarchy?.type_labels?.[c.type] || c.type || 'LegalDocument';
    const sourceDocs = buildSourceDocuments(c, config);
    const encoding = sourceDocs.map(d => ({
        '@type': 'MediaObject',
        contentUrl: d.url,
        encodingFormat: d.media_type,
        name: d.filename,
        description: d.role === 'signed-agreement'
            ? 'Signed agreement (authoritative source).'
            : (d.note || undefined)
    }));
    return {
        '@context': 'https://schema.org',
        '@type': 'LegalDocument',
        'identifier': c.id,
        'alternateName': c.official_ref || c.legacy_id || undefined,
        'name': c.title || c.name || c.id,
        'headline': c.title || c.name || c.id,
        'description': `${typeLabel}${c.jurisdiction ? ' (' + c.jurisdiction + ')' : ''}`,
        'url': canonical,
        'sameAs': c.official_url ? [c.official_url] : undefined,
        'dateCreated': c.created || undefined,
        'dateModified': c.modified || c.last_verified || undefined,
        'datePublished': c.effective || c.enacted || undefined,
        'author': c.issued_by && typeof c.issued_by === 'object' ? {
            '@type': c.issued_by['@type'] || 'GovernmentOrganization',
            'name': c.issued_by.name || c.interpreting_authority || '',
            'url': c.issued_by.ref || undefined
        } : (c.interpreting_authority ? {
            '@type': 'GovernmentOrganization',
            'name': c.interpreting_authority
        } : undefined),
        'about': (c.statute_anchors || []).map(a => ({
            '@type': 'Legislation',
            'name': a.cite || a,
            'url': a.url || undefined
        })),
        'isPartOf': c.program ? { '@type': 'CreativeWork', 'name': c.program } : undefined,
        'encoding': encoding.length ? encoding : undefined,
        'license': c.disclaimer || undefined
    };
}

function generateRecordJsonEndpoint(c, config) {
    return {
        '@context': 'https://schema.org',
        meta: {
            canonical_url: (config.url || '').replace(/\/+$/, '') + containerHref(c),
            generated: new Date().toISOString(),
            schema: c.schema || null
        },
        record: {
            id: c.id,
            legacy_id: c.legacy_id || null,
            official_ref: c.official_ref || null,
            instance: c.instance || null,
            slug: c.slug || null,
            title: c.title || c.name || null,
            type: c.type || null,
            jurisdiction: c.jurisdiction || null,
            authority: c.authority || null,
            issued_by: c.issued_by || null,
            enacted: c.enacted || null,
            effective: c.effective || null,
            official_url: c.official_url || null,
            obligation_kind: c.obligation_kind || null,
            reliance_scope: c.reliance_scope || null,
            parties: c.parties || null,
            statute_anchors: c.statute_anchors || null,
            publication_citations: c.publication_citations || null,
            terms: c.terms || null,
            status: c.status || null,
            supersedes: c.supersedes || null,
            superseded_by: c.superseded_by || null,
            last_verified: c.last_verified || null,
            timeline: c.timeline || [],
            source_documents: buildSourceDocuments(c, config)
        },
        jsonld: generateLegalDocumentJsonLd(c, config)
    };
}

function generateRedirectStub(toPath, title) {
    const t = escapeHTML(title || 'Moved');
    const p = escapeHTML(toPath);
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${t} — Moved</title>
    <link rel="canonical" href="${p}">
    <meta name="robots" content="noindex">
    <meta http-equiv="refresh" content="0; url=${p}">
    <script>window.location.replace(${JSON.stringify(toPath)});</script>
</head>
<body>
    <p>This page has moved. Redirecting to <a href="${p}">${p}</a>.</p>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Hierarchy index page generators
// ---------------------------------------------------------------------------

function generateJurisdictionsIndex(config, data, configCSS) {
    const jurMap = config.hierarchy?.jurisdictions || {};
    const countries = {};
    for (const [jurId, jur] of Object.entries(jurMap)) {
        if (!jur.country) continue;
        countries[jur.country] = countries[jur.country] || { regions: [] };
        const regionContainers = data.containers.filter(c => c.jurisdiction === jurId);
        countries[jur.country].regions.push({
            id: jurId, region: jur.region, label: jur.label,
            count: regionContainers.length
        });
    }

    const content = `
        ${renderBreadcrumb([{ label: 'Registry' }])}
        <h2 style="margin-top:0.5rem;">Registry by Jurisdiction</h2>
        <p style="color:var(--text-secondary);">Browse PubLedge records by country and jurisdiction.</p>
        ${Object.entries(countries).map(([country, data]) => `
            <h3>${country.toUpperCase()}</h3>
            <table class="data-table">
                <thead><tr><th>Jurisdiction</th><th>Records</th></tr></thead>
                <tbody>
                    ${data.regions.map(r => `<tr>
                        <td><a href="/${country}/${r.region}/" onclick="passTheme(this)">${escapeHTML(r.label || r.region)}</a></td>
                        <td>${r.count}</td>
                    </tr>`).join('\n')}
                </tbody>
            </table>
        `).join('\n')}
    `;
    return renderBridgeShell(config, { title: 'Registry', depth: 1, content, canonicalPath: 'us/', description: 'PubLedge records by jurisdiction.', configCSS });
}

function generateJurisdictionIndex(config, data, jurId, configCSS, options = {}) {
    const jur = config.hierarchy.jurisdictions[jurId];
    const jurContainers = data.containers.filter(c => c.jurisdiction === jurId);
    const authorityIds = [...new Set(jurContainers.map(c => c.authority).filter(Boolean))];
    const authorityMap = Object.fromEntries(data.authorities.map(a => [a.id, a]));

    // Group by authority
    const byAuthority = authorityIds.map(aId => {
        const auth = authorityMap[aId];
        const items = jurContainers.filter(c => c.authority === aId);
        return { auth, items };
    });

    const narrative = options.narrative || '';
    const statuteMap = options.statuteMap || '';

    const content = `
        ${renderBreadcrumb([{ label: 'Registry', href: '/us/' }, { label: jur.label || jur.region }])}
        <h2 style="margin-top:0.5rem;">${escapeHTML(jur.label || jur.region)}</h2>
        ${narrative}
        ${statuteMap}
        <h3>Authorities</h3>
        ${byAuthority.map(({ auth, items }) => `
            <div class="provision-card">
                <h4><a href="${auth ? authorityHref(auth) : '#'}" onclick="passTheme(this)">${escapeHTML(auth?.name || auth?.id || 'Unknown')}</a> <span style="color:var(--text-secondary);font-weight:normal;">(${items.length})</span></h4>
                <table class="data-table">
                    <thead><tr><th>Record</th><th>Type</th><th>Status</th><th>Effective</th></tr></thead>
                    <tbody>
                        ${items.map(c => `<tr>
                            <td><a href="${containerIndexHref(c)}" onclick="passTheme(this)">${escapeHTML(c.title || c.name || c.id)}</a></td>
                            <td>${escapeHTML(config.hierarchy?.type_labels?.[c.type] || c.type || '')}</td>
                            ${tdStatus(c.status)}
                            ${tdDate(c.effective)}
                        </tr>`).join('\n')}
                    </tbody>
                </table>
            </div>
        `).join('\n')}
    `;
    return renderBridgeShell(config, {
        title: jur.label || jur.region,
        depth: 2,
        content,
        canonicalPath: `${jur.country}/${jur.region}/`,
        description: `PubLedge records for ${jur.label || jur.region}.`,
        configCSS
    });
}

function generateAuthorityUrlIndex(config, data, authority, configCSS) {
    // Index page at /us/utah/oaip/ — lists all types for that authority
    const authContainers = data.containers.filter(c => c.authority === authority.id);
    const byType = {};
    for (const c of authContainers) {
        const t = c.type || 'other';
        (byType[t] = byType[t] || []).push(c);
    }
    const jur = config.hierarchy.jurisdictions[authority.jurisdiction];
    const content = `
        ${renderBreadcrumb([
            { label: 'Registry', href: '/us/' },
            { label: jur?.label || jur?.region || authority.jurisdiction, href: `/${jur?.country}/${jur?.region}/` },
            { label: authority.name || authority.id }
        ])}
        <h2 style="margin-top:0.5rem;">${escapeHTML(authority.name || authority.id)}</h2>
        ${renderAuthorityLinkPanel(authority)}
        ${authority._body ? `<div class="about-content">${authority._body.split('\n').filter(l => l.trim() && !l.startsWith('## Instruments')).join('<br>').slice(0, 2000)}</div>` : ''}
        ${Object.entries(byType).map(([t, items]) => {
            const typeSeg = config.hierarchy?.type_segments?.[t] || t;
            const typeLabel = config.hierarchy?.type_labels?.[t] || t;
            return `
            <h3><a href="/${jur?.country}/${jur?.region}/${authority.url_segment}/${typeSeg}/" onclick="passTheme(this)">${escapeHTML(typeLabel)}s</a> (${items.length})</h3>
            <table class="data-table">
                <thead><tr><th>Record</th><th>Status</th><th>Effective</th></tr></thead>
                <tbody>
                    ${items.map(c => `<tr>
                        <td><a href="${containerIndexHref(c)}" onclick="passTheme(this)">${escapeHTML(c.title || c.name || c.id)}</a></td>
                        ${tdStatus(c.status)}
                        ${tdDate(c.effective)}
                    </tr>`).join('\n')}
                </tbody>
            </table>`;
        }).join('\n')}
    `;
    return renderBridgeShell(config, {
        title: authority.name || authority.id,
        depth: 3,
        content,
        canonicalPath: authority._canonicalPath,
        description: `${authority.name} — PubLedge authority page.`,
        configCSS
    });
}

function generateTypeIndex(config, data, jurId, authority, typeKey, configCSS) {
    const jur = config.hierarchy.jurisdictions[jurId];
    const typeSeg = config.hierarchy?.type_segments?.[typeKey] || typeKey;
    const typeLabel = config.hierarchy?.type_labels?.[typeKey] || typeKey;
    const items = data.containers.filter(c => c.jurisdiction === jurId && c.authority === authority.id && c.type === typeKey);
    const content = `
        ${renderBreadcrumb([
            { label: 'Registry', href: '/us/' },
            { label: jur.label || jur.region, href: `/${jur.country}/${jur.region}/` },
            { label: authority.name || authority.id, href: authorityHref(authority) },
            { label: typeLabel + 's' }
        ])}
        <h2 style="margin-top:0.5rem;">${escapeHTML(typeLabel)}s — ${escapeHTML(authority.name || authority.id)}</h2>
        <p style="color:var(--text-secondary);">${items.length} record${items.length === 1 ? '' : 's'}.</p>
        <table class="data-table">
            <thead><tr>${th('Record')}${th('Status', { filter: 'status' })}${th('Enacted')}${th('Effective')}</tr></thead>
            <tbody>
                ${items.map(c => `<tr>
                    <td><a href="${containerIndexHref(c)}" onclick="passTheme(this)">${escapeHTML(c.title || c.name || c.id)}</a></td>
                    ${tdStatus(c.status)}
                    ${tdDate(c.enacted)}
                    ${tdDate(c.effective)}
                </tr>`).join('\n')}
            </tbody>
        </table>
    `;
    return renderBridgeShell(config, {
        title: `${typeLabel}s — ${authority.name}`,
        depth: 4,
        content,
        canonicalPath: `${jur.country}/${jur.region}/${authority.url_segment}/${typeSeg}/`,
        description: `All ${typeLabel}s issued by ${authority.name}.`,
        configCSS
    });
}

// Minimal markdown → HTML for DEFINITIONS.md. Handles: ATX headings, paragraphs,
// horizontal rules, pipe tables, bulleted lists, fenced code, inline code,
// bold, italic, links. Not a general-purpose converter.
function renderDefinitionsMarkdown(md) {
    const inline = (s) => s
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    const lines = md.split('\n');
    const out = [];
    let i = 0;
    let inCode = false;
    let codeBuf = [];
    let listBuf = null;
    const flushList = () => { if (listBuf) { out.push(`<ul>${listBuf.map(i => `<li>${inline(i)}</li>`).join('')}</ul>`); listBuf = null; } };
    while (i < lines.length) {
        const line = lines[i];
        if (inCode) {
            if (/^```/.test(line)) { out.push(`<pre><code>${codeBuf.map(l => l.replace(/</g, '&lt;')).join('\n')}</code></pre>`); codeBuf = []; inCode = false; }
            else codeBuf.push(line);
            i++; continue;
        }
        if (/^```/.test(line)) { flushList(); inCode = true; i++; continue; }
        if (/^---$/.test(line)) { flushList(); out.push('<hr>'); i++; continue; }
        const h = line.match(/^(#{1,4})\s+(.+)$/);
        if (h) { flushList(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }
        const li = line.match(/^-\s+(.+)$/);
        if (li) { listBuf = listBuf || []; listBuf.push(li[1]); i++; continue; }
        flushList();
        // Pipe table: header + separator + body
        if (line.includes('|') && i + 1 < lines.length && /^\s*\|?\s*[:\-\|\s]+\|?\s*$/.test(lines[i + 1])) {
            const parseRow = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
            const headers = parseRow(line);
            i += 2;
            const rows = [];
            while (i < lines.length && lines[i].includes('|')) { rows.push(parseRow(lines[i])); i++; }
            out.push(`<table class="data-table"><thead><tr>${headers.map(h => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
            continue;
        }
        if (line.trim() === '') { i++; continue; }
        // Paragraph — accumulate until blank line or block boundary
        const para = [line];
        i++;
        while (i < lines.length && lines[i].trim() !== '' && !/^(#{1,4}\s|-\s|---$|```)/.test(lines[i]) && !(lines[i].includes('|') && i + 1 < lines.length && /^\s*\|?\s*[:\-\|\s]+\|?\s*$/.test(lines[i + 1]))) {
            para.push(lines[i]); i++;
        }
        out.push(`<p>${inline(para.join(' '))}</p>`);
    }
    flushList();
    return out.join('\n');
}

function generateDefinitionsPage(config, data, configCSS) {
    const mdPath = path.join(ROOT, 'DEFINITIONS.md');
    if (!fs.existsSync(mdPath)) return null;
    const md = fs.readFileSync(mdPath, 'utf-8');
    const html = renderDefinitionsMarkdown(md);
    const content = `
        ${renderBreadcrumb([{ label: 'Definitions' }])}
        <div class="about-content">
            ${html}
        </div>
    `;

    // DefinedTermSet covering (a) status vocabulary, (b) instrument types
    const siteUrl = config.url || '';
    const statusTerms = (config.entities?.container?.statuses || []).map(s => ({
        '@type': 'DefinedTerm',
        'name': s.name || s,
        'termCode': s.name || s,
        'inDefinedTermSet': `${siteUrl}definitions/`
    }));
    const typeTerms = Object.entries(config.hierarchy?.type_labels || {}).map(([code, label]) => ({
        '@type': 'DefinedTerm',
        'name': label,
        'termCode': code,
        'inDefinedTermSet': `${siteUrl}definitions/`
    }));
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        'name': 'PubLedge Definitions',
        'description': 'Controlled vocabulary and terms of art used across the PubLedge registry: instrument statuses, instrument types, and entity roles.',
        'url': `${siteUrl}definitions/`,
        'hasDefinedTerm': [...statusTerms, ...typeTerms]
    };

    return renderBridgeShell(config, {
        title: 'Definitions',
        depth: 1,
        content,
        canonicalPath: 'definitions/',
        description: 'Controlled vocabulary and terms of art used across the PubLedge registry.',
        configCSS,
        structuredData
    });
}

function generateUtahLandingNarrative(data) {
    return `
        <div class="about-content">
            <p><em>The Utah Office of Artificial Intelligence Policy (OAIP) is the first dedicated US state AI regulator. It operates the Utah Artificial Intelligence Learning Laboratory — a regulatory-mitigation sandbox where participating companies receive tailored relief from specific state laws in exchange for data-sharing, safeguards, and audits. Under HB 320 (2026), OAIP may also issue Joint Interpretation Agreements that clarify how existing Utah law applies to AI without waiving the underlying law.</em></p>
            <p>PubLedge treats Utah OAIP's <strong>Regulatory Mitigation Agreement (RMA)</strong> and <strong>Joint Interpretation Agreement (JIA)</strong> as the prototypical instruments for its broader registry. The two-instrument architecture — waiver + interpretation — maps cleanly to SEC no-action letters, CFPB advisory opinions, and IRS private letter rulings at the federal level, and to analogous instruments in other jurisdictions.</p>
        </div>
    `;
}

function generateUtahStatuteMap(data) {
    const statutes = data.containers.filter(c => c.type === 'statute' && c.jurisdiction === 'us-ut')
        .sort((a, b) => (a.enacted || '').localeCompare(b.enacted || ''));
    if (!statutes.length) return '';
    return `
        <h3>Statutory Framework</h3>
        <p style="color:var(--text-secondary);">Four bills passed across three legislative sessions form the statutory spine that OAIP interprets and, in limited cases, waives.</p>
        <table class="data-table">
            <thead><tr><th>Bill</th><th>Session</th><th>Governs</th><th>Effective</th></tr></thead>
            <tbody>
                ${statutes.map(s => `<tr>
                    <td><a href="${containerIndexHref(s)}" onclick="passTheme(this)">${escapeHTML(s.title || s.name || s.id)}</a></td>
                    <td>${(s.enacted || '').slice(0, 4)}</td>
                    <td>${escapeHTML(statuteGovernsDescription(s))}</td>
                    ${tdDate(s.effective)}
                </tr>`).join('\n')}
            </tbody>
        </table>
    `;
}

function statuteGovernsDescription(s) {
    const map = {
        'us-ut-legislature-statute-2024-sb149': 'Title 13 Ch. 72 (OAIP + Learning Lab); §76-2-107 (criminal AI defense eliminated)',
        'us-ut-legislature-statute-2025-sb226': 'Title 13 Ch. 75 (GenAI disclosure; civil AI defense eliminated)',
        'us-ut-legislature-statute-2025-hb452': 'Title 13 Ch. 72a (mental health chatbot regulations)',
        'us-ut-legislature-statute-2026-hb320': 'Learning Lab restructure; JIA instrument; 36-month term'
    };
    return map[s.id] || '';
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

function build() {
    const startTime = Date.now();
    const config = loadConfig();

    // Env-var overrides for the rare case where you need to build the same
    // project.yml at a different URL (e.g. a subpath deployment).
    if (process.env.KAC_SITE_URL) config.url = process.env.KAC_SITE_URL;

    console.log(`Building ${config.name || 'project'}...\n`);

    const dataDir = findDataDir(config);
    const primaryDir = path.join(dataDir, config.entities?.primary?.directory || 'primary');
    const containerDir = path.join(dataDir, config.entities?.container?.directory || 'container');
    const authorityDir = path.join(dataDir, config.entities?.authority?.directory || 'authority');

    // Determine mapping file path
    const mappingFile = config.mapping?.file || 'provisions/index.yml';
    let mappingPath = path.join(dataDir, mappingFile);
    // Also check under mapping/ subdirectory for examples
    if (!fs.existsSync(mappingPath)) {
        mappingPath = path.join(dataDir, 'mapping', 'index.yml');
    }

    const primaries = loadDir(primaryDir);
    const containers = loadContainers(containerDir);
    const authorities = loadDir(authorityDir);
    const mappingIndex = loadMappingIndex(mappingPath);

    // Attach canonical hierarchy paths to every container + authority
    attachCanonicalPaths(containers, authorities, config);
    const containerById = buildContainerLookup(containers);

    console.log(`  ${config.entities?.primary?.plural || 'Primaries'}: ${primaries.length}`);
    console.log(`  ${config.entities?.container?.plural || 'Containers'}: ${containers.length}`);
    console.log(`  ${config.entities?.authority?.plural || 'Authorities'}: ${authorities.length}`);
    console.log(`  Mappings: ${mappingIndex.length}`);

    const totalProvisions = containers.reduce((sum, c) => sum + c.provisions.length, 0);

    ensureDir(API_DIR);
    ensureDir(ASSETS_DIR);

    // Build matrix
    const matrix = {};
    for (const p of primaries) {
        matrix[p.id] = {};
        for (const c of containers) {
            const matching = mappingIndex.filter(m => m.regulation === c.id && m.obligations?.includes(p.id));
            if (matching.length > 0) matrix[p.id][c.id] = { covered: true, provisions: matching.map(m => m.id) };
        }
    }

    // Build comparisons
    const comparisons = [];
    const cIds = containers.map(c => c.id);
    for (let i = 0; i < cIds.length; i++) {
        for (let j = i + 1; j < cIds.length; j++) {
            const a = cIds[i], b = cIds[j];
            const aP = new Set(mappingIndex.filter(m => m.regulation === a).flatMap(m => m.obligations));
            const bP = new Set(mappingIndex.filter(m => m.regulation === b).flatMap(m => m.obligations));
            const shared = [...aP].filter(o => bP.has(o));
            const onlyA = [...aP].filter(o => !bP.has(o));
            const onlyB = [...bP].filter(o => !aP.has(o));
            if (shared.length || onlyA.length || onlyB.length) {
                comparisons.push({ regulations: [a, b], shared_obligations: shared, only_a: onlyA, only_b: onlyB, shared_count: shared.length, only_a_count: onlyA.length, only_b_count: onlyB.length });
            }
        }
    }

    const data = { primaries, containers, authorities, mappingIndex, matrix, comparisons, totalProvisions, containerById };
    const configCSS = generateConfigCSS(config);

    // --- JSON API ---
    fs.writeFileSync(path.join(API_DIR, 'primaries.json'), JSON.stringify({ meta: { generated: new Date().toISOString(), count: primaries.length }, items: primaries.map(p => ({ id: p.id, name: p.name || humanizeId(p.id), group: p.group || '', status: p.status || 'active' })) }, null, 2));
    fs.writeFileSync(path.join(API_DIR, 'containers.json'), JSON.stringify({ meta: { generated: new Date().toISOString(), count: containers.length }, items: containers.map(c => ({ id: c.id, name: c.title || c.name || c.id, status: c.status, effective: c.effective, provision_count: c.provisions.length })) }, null, 2));
    fs.writeFileSync(path.join(API_DIR, 'authorities.json'), JSON.stringify({ meta: { generated: new Date().toISOString(), count: authorities.length }, items: authorities.map(a => ({ id: a.id, name: a.name || humanizeId(a.id), jurisdiction: a.jurisdiction || '' })) }, null, 2));
    fs.writeFileSync(path.join(API_DIR, 'mappings.json'), JSON.stringify({ meta: { generated: new Date().toISOString(), count: mappingIndex.length }, items: mappingIndex }, null, 2));
    fs.writeFileSync(path.join(API_DIR, 'matrix.json'), JSON.stringify({ meta: { generated: new Date().toISOString() }, matrix }, null, 2));
    fs.writeFileSync(path.join(API_DIR, 'comparisons.json'), JSON.stringify({ meta: { generated: new Date().toISOString() }, comparisons }, null, 2));

    // upcoming.json — future effective + term-end dates, sorted by proximity.
    {
        const today = new Date().toISOString().slice(0, 10);
        const items = [];
        for (const c of containers) {
            const push = (kind, date) => {
                if (!date || date < today) return;
                items.push({
                    kind,
                    date,
                    days_until: Math.ceil((new Date(date) - new Date(today)) / 86400000),
                    record_id: c.id,
                    title: c.title || c.name || c.id,
                    url: (config.url || '').replace(/\/$/, '') + containerHref(c),
                    jurisdiction: c.jurisdiction,
                    authority: c.authority,
                    type: c.type
                });
            };
            push('effective', c.effective);
            push('term-end', c.term_end);
        }
        items.sort((a, b) => a.date.localeCompare(b.date));
        fs.writeFileSync(path.join(API_DIR, 'upcoming.json'), JSON.stringify({
            meta: { generated: new Date().toISOString(), count: items.length, today },
            items
        }, null, 2));
    }

    // recently_changed.json — records modified / verified within 30 days.
    {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
        const items = containers
            .filter(c => (c.last_verified && c.last_verified >= thirtyDaysAgo) ||
                         (c.modified && c.modified >= thirtyDaysAgo) ||
                         (c.created && c.created >= thirtyDaysAgo))
            .map(c => {
                const isNew = c.created && c.created >= thirtyDaysAgo;
                return {
                    record_id: c.id,
                    title: c.title || c.name || c.id,
                    url: (config.url || '').replace(/\/$/, '') + containerHref(c),
                    change_type: isNew ? 'added' : 'updated',
                    created: c.created || null,
                    modified: c.modified || null,
                    last_verified: c.last_verified || null,
                    jurisdiction: c.jurisdiction,
                    authority: c.authority,
                    type: c.type,
                    status: c.status
                };
            })
            .sort((a, b) => (b.last_verified || b.modified || '').localeCompare(a.last_verified || a.modified || ''));
        fs.writeFileSync(path.join(API_DIR, 'recently_changed.json'), JSON.stringify({
            meta: { generated: new Date().toISOString(), count: items.length, window_days: 30 },
            items
        }, null, 2));
    }
    fs.writeFileSync(path.join(API_DIR, 'index.json'), JSON.stringify({ meta: { generated: new Date().toISOString(), version: '1.0', project: config.short_name || 'kac' }, files: { primaries: { path: 'primaries.json' }, containers: { path: 'containers.json' }, authorities: { path: 'authorities.json' }, mappings: { path: 'mappings.json' }, matrix: { path: 'matrix.json' }, comparisons: { path: 'comparisons.json' } } }, null, 2));

    console.log('  JSON API: 6 files');

    // --- HTML pages ---
    const sitemapPages = [];

    fs.writeFileSync(path.join(DOCS_DIR, 'index.html'), generateHomepage(config, data, configCSS)); sitemapPages.push('');
    fs.writeFileSync(path.join(DOCS_DIR, 'instruments.html'), generateContainersPage(config, data, configCSS)); sitemapPages.push('instruments.html');
    fs.writeFileSync(path.join(DOCS_DIR, 'obligations.html'), generatePrimariesPage(config, data, configCSS)); sitemapPages.push('obligations.html');
    fs.writeFileSync(path.join(DOCS_DIR, 'authorities.html'), generateAuthoritiesPage(config, data, configCSS)); sitemapPages.push('authorities.html');
    // Legacy filename redirect stubs
    fs.writeFileSync(path.join(DOCS_DIR, 'containers.html'), generateRedirectStub('/instruments.html', 'Legal Instruments'));
    fs.writeFileSync(path.join(DOCS_DIR, 'primaries.html'), generateRedirectStub('/obligations.html', 'Obligations'));
    fs.writeFileSync(path.join(DOCS_DIR, 'matrix.html'), generateMatrixPage(config, data, configCSS)); sitemapPages.push('matrix.html');
    fs.writeFileSync(path.join(DOCS_DIR, 'timeline.html'), generateTimelinePage(config, data, configCSS)); sitemapPages.push('timeline.html');
    fs.writeFileSync(path.join(DOCS_DIR, 'compare.html'), generateComparePage(config, data, configCSS)); sitemapPages.push('compare.html');
    // /about.html is superseded by the hand-crafted /about/ page (moved from
    // /reference/protocol/). Emit a redirect stub so external links don't 404.
    fs.writeFileSync(path.join(DOCS_DIR, 'about.html'), generateRedirectStub('/about/', 'About PubLedge'));

    let patternPageCount = 0;
    if (config.pattern?.enabled !== false) {
        fs.writeFileSync(path.join(DOCS_DIR, 'pattern.html'), generatePatternPage(config, data, configCSS));
        sitemapPages.push('pattern.html');
        patternPageCount = 1;
        console.log('  Pattern page: 1');
    }

    console.log('  Core pages: ' + (7 + patternPageCount));

    // Container detail pages — write at canonical hierarchical path + emit .json + legacy redirect stubs
    let jsonEndpointCount = 0;
    let legacyStubCount = 0;
    for (const c of containers) {
        const canonicalPath = c._canonicalPath || `container/${c.id}/`;
        const canonicalDir = path.join(DOCS_DIR, canonicalPath);
        ensureDir(canonicalDir);
        const html = generateContainerDetail(config, c, data, configCSS);
        fs.writeFileSync(path.join(canonicalDir, 'index.html'), html);
        sitemapPages.push(canonicalPath);

        if (config.hierarchy?.emit_json_endpoints !== false) {
            const jsonBody = generateRecordJsonEndpoint(c, config);
            fs.writeFileSync(path.join(canonicalDir, 'record.json'), JSON.stringify(jsonBody, null, 2));
            jsonEndpointCount++;
        }

        // Legacy container/{id}/ redirect stub (skip if canonical path is itself the legacy path)
        if (canonicalPath !== `container/${c.id}/`) {
            const legacyDir = path.join(DOCS_DIR, 'container', c.id);
            ensureDir(legacyDir);
            fs.writeFileSync(path.join(legacyDir, 'index.html'), generateRedirectStub('/' + canonicalPath, c.title || c.name || c.id));
            legacyStubCount++;
            // Also redirect from legacy stable-id if present (e.g. us-ut-oaip-rma-0002)
            if (c.legacy_id && c.legacy_id !== c.id) {
                const legacyIdDir = path.join(DOCS_DIR, 'container', c.legacy_id);
                ensureDir(legacyIdDir);
                fs.writeFileSync(path.join(legacyIdDir, 'index.html'), generateRedirectStub('/' + canonicalPath, c.title || c.name || c.id));
                legacyStubCount++;
            }
        }
    }
    console.log(`  Container detail pages: ${containers.length} (canonical paths)`);
    console.log(`  JSON record endpoints: ${jsonEndpointCount}`);
    console.log(`  Legacy redirect stubs: ${legacyStubCount}`);

    // Hierarchy index pages — /us/, /us/{region}/, /us/{region}/{authority}/, /us/{region}/{authority}/{type}/
    let hierIndexCount = 0;
    if (config.hierarchy?.enabled) {
        // Countries root: /us/
        const rootDir = path.join(DOCS_DIR, 'us');
        ensureDir(rootDir);
        fs.writeFileSync(path.join(rootDir, 'index.html'), generateJurisdictionsIndex(config, data, configCSS));
        sitemapPages.push('us/');
        hierIndexCount++;

        // Each jurisdiction: /us/{region}/
        for (const [jurId, jur] of Object.entries(config.hierarchy.jurisdictions)) {
            const jurDir = path.join(DOCS_DIR, jur.country, jur.region);
            ensureDir(jurDir);
            const opts = {};
            if (jurId === 'us-ut') {
                opts.narrative = generateUtahLandingNarrative(data);
                opts.statuteMap = generateUtahStatuteMap(data);
            }
            fs.writeFileSync(path.join(jurDir, 'index.html'), generateJurisdictionIndex(config, data, jurId, configCSS, opts));
            sitemapPages.push(`${jur.country}/${jur.region}/`);
            hierIndexCount++;

            // Per-authority index: /us/{region}/{authority}/
            const jurAuthIds = [...new Set(containers.filter(c => c.jurisdiction === jurId).map(c => c.authority))];
            for (const authId of jurAuthIds) {
                const auth = authorities.find(a => a.id === authId);
                if (!auth || !auth.url_segment) continue;
                const authDir = path.join(DOCS_DIR, jur.country, jur.region, auth.url_segment);
                ensureDir(authDir);
                fs.writeFileSync(path.join(authDir, 'index.html'), generateAuthorityUrlIndex(config, data, auth, configCSS));
                sitemapPages.push(`${jur.country}/${jur.region}/${auth.url_segment}/`);
                hierIndexCount++;

                // Per-type index: /us/{region}/{authority}/{type}/
                const types = [...new Set(containers.filter(c => c.jurisdiction === jurId && c.authority === authId).map(c => c.type))];
                for (const t of types) {
                    const typeSeg = config.hierarchy?.type_segments?.[t] || t;
                    const typeDir = path.join(DOCS_DIR, jur.country, jur.region, auth.url_segment, typeSeg);
                    ensureDir(typeDir);
                    fs.writeFileSync(path.join(typeDir, 'index.html'), generateTypeIndex(config, data, jurId, auth, t, configCSS));
                    sitemapPages.push(`${jur.country}/${jur.region}/${auth.url_segment}/${typeSeg}/`);
                    hierIndexCount++;
                }
            }
        }
    }
    console.log(`  Hierarchy index pages: ${hierIndexCount}`);

    // Definitions page
    const defPage = generateDefinitionsPage(config, data, configCSS);
    if (defPage) {
        const defDir = path.join(DOCS_DIR, 'definitions');
        ensureDir(defDir);
        fs.writeFileSync(path.join(defDir, 'index.html'), defPage);
        sitemapPages.push('definitions/');
    }

    // Marketing alias: /utah/ → /us/utah/
    if (config.hierarchy?.jurisdictions?.['us-ut']) {
        const aliasDir = path.join(DOCS_DIR, 'utah');
        ensureDir(aliasDir);
        fs.writeFileSync(path.join(aliasDir, 'index.html'), generateRedirectStub('/us/utah/', 'Utah'));
    }

    for (const p of primaries) { const dir = path.join(DOCS_DIR, 'primary', p.id); ensureDir(dir); fs.writeFileSync(path.join(dir, 'index.html'), generatePrimaryDetail(config, p, data, configCSS)); sitemapPages.push(`primary/${p.id}/`); }
    console.log(`  Primary detail pages: ${primaries.length}`);

    for (const a of authorities) { const dir = path.join(DOCS_DIR, 'authority', a.id); ensureDir(dir); fs.writeFileSync(path.join(dir, 'index.html'), generateAuthorityDetail(config, a, data, configCSS)); sitemapPages.push(`authority/${a.id}/`); }
    console.log(`  Authority detail pages: ${authorities.length}`);

    // Bridge pages
    let reqCount = 0;
    if (config.bridges?.requires !== false) {
        for (const m of mappingIndex) {
            for (const oblId of m.obligations) {
                const dir = path.join(DOCS_DIR, 'requires', m.regulation, oblId); ensureDir(dir);
                const html = generateRequiresBridge(config, m.regulation, oblId, data, configCSS);
                if (html) { fs.writeFileSync(path.join(dir, 'index.html'), html); sitemapPages.push(`requires/${m.regulation}/${oblId}/`); reqCount++; }
            }
        }
    }
    console.log(`  Requires bridge pages: ${reqCount}`);

    let cmpCount = 0;
    if (config.bridges?.compare !== false) {
        for (const comp of comparisons) {
            const [aId, bId] = comp.regulations;
            const cA = containers.find(c => c.id === aId), cB = containers.find(c => c.id === bId);
            if (cA && cB) { const dir = path.join(DOCS_DIR, 'compare', `${aId}-vs-${bId}`); ensureDir(dir); fs.writeFileSync(path.join(dir, 'index.html'), generateCompareBridge(config, cA, cB, comp, data, configCSS)); if (comp.shared_count > 0) sitemapPages.push(`compare/${aId}-vs-${bId}/`); cmpCount++; }
        }
    }
    console.log(`  Compare bridge pages: ${cmpCount}`);

    let appCount = 0;
    if (config.bridges?.applies_to) {
        const scopeField = config.entities?.container?.scope_field || config.bridges.applies_to.field || 'jurisdiction';
        const scopes = [...new Set(containers.map(c => c[scopeField]).filter(Boolean))];
        for (const s of scopes) {
            const dir = path.join(DOCS_DIR, 'applies-to', slugify(s)); ensureDir(dir);
            const scopeContainerCount = containers.filter(c => c[scopeField] === s).length;
            fs.writeFileSync(path.join(dir, 'index.html'), generateAppliesToBridge(config, s, data, configCSS));
            if (scopeContainerCount > 0) sitemapPages.push(`applies-to/${slugify(s)}/`);
            appCount++;
        }
    }
    console.log(`  Applies-to bridge pages: ${appCount}`);

    // Search index
    const searchIndex = buildSearchIndex(config, data);
    fs.writeFileSync(path.join(ASSETS_DIR, 'data.json'), JSON.stringify(searchIndex));
    console.log(`  Search index: ${searchIndex.length} entries`);

    // Sitemap + robots
    const siteUrl = (config.url || '').replace(/\/?$/, '/');
    fs.writeFileSync(path.join(DOCS_DIR, 'sitemap.xml'), generateSitemap(config, sitemapPages));
    const aiBots = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'cohere-ai', 'CCBot', 'Bytespider', 'Amazonbot', 'Meta-ExternalAgent', 'Meta-ExternalFetcher', 'DuckAssistBot'];
    const robotsLines = [
        '# PubLedge is published under CC-BY-4.0. AI crawlers are explicitly allowed.',
        'User-agent: *',
        'Allow: /',
        ''
    ];
    for (const bot of aiBots) {
        robotsLines.push(`User-agent: ${bot}`);
        robotsLines.push('Allow: /');
        robotsLines.push('');
    }
    robotsLines.push(`Sitemap: ${siteUrl}sitemap.xml`);
    robotsLines.push(`# Machine-readable site info: ${siteUrl}agents.json`);
    robotsLines.push(`# LLM context: ${siteUrl}llms.txt`);
    robotsLines.push('');
    fs.writeFileSync(path.join(DOCS_DIR, 'robots.txt'), robotsLines.join('\n'));

    // --- Discovery files ---

    // llms.txt — LLM-friendly site overview
    const cPlural = config.entities?.container?.plural || 'Containers';
    const pPlural = config.entities?.primary?.plural || 'Primaries';
    const aPlural = config.entities?.authority?.plural || 'Authorities';
    const cSingular = (config.entities?.container?.name || 'container').toLowerCase();
    const llmsTxt = [
        `# ${config.name || 'Knowledge Base'}`,
        '',
        `> ${config.description || ''}`,
        `> Tracks ${containers.length} ${cPlural.toLowerCase()}, ${primaries.length} ${pPlural.toLowerCase()}, and ${totalProvisions} provisions across ${authorities.length} ${aPlural.toLowerCase()}.`,
        '',
        `## ${cPlural}`,
        '',
        ...containers.map(c => `- [${c.title || c.name || c.id}](${siteUrl.replace(/\/$/, '')}${containerHref(c)}): ${c.status || 'unknown'}`),
        '',
        `## ${pPlural}`,
        '',
        ...primaries.map(p => {
            const regCount = Object.keys(matrix[p.id] || {}).length;
            return `- [${p.name || humanizeId(p.id)}](${siteUrl}primary/${p.id}/): ${regCount} ${cPlural.toLowerCase()} support this`;
        }),
        '',
        '## Tools',
        '',
        `- [Coverage Matrix](${siteUrl}matrix.html): Which ${pPlural.toLowerCase()} each ${cSingular} supports`,
        `- [Compare](${siteUrl}compare.html): Side-by-side ${cSingular} comparison`,
        `- [Timeline](${siteUrl}timeline.html): Key dates and milestones`,
        '',
        '## Machine-Readable',
        '',
        `- [JSON API](${siteUrl}api/v1/index.json): Programmatic access to all data`,
        `- [agents.json](${siteUrl}agents.json): Agent discovery metadata`,
        `- [Sitemap](${siteUrl}sitemap.xml): All pages`,
        `- [RSS Feed](${siteUrl}index.xml): Recent updates`,
        ''
    ].join('\n');
    fs.writeFileSync(path.join(DOCS_DIR, 'llms.txt'), llmsTxt);

    // agents.json — agent-readable site metadata
    const agentsJson = {
        schema_version: '1.0',
        site: {
            name: config.name || 'Knowledge Base',
            url: siteUrl,
            description: config.description || '',
            repo: config.repo || ''
        },
        capabilities: [
            {
                id: 'container-comparison',
                name: `${config.entities?.container?.name || 'Container'} Comparison`,
                description: `Compare ${containers.length} ${cPlural.toLowerCase()} across ${primaries.length} ${pPlural.toLowerCase()}`,
                url: `${siteUrl}compare.html`
            },
            {
                id: 'coverage-matrix',
                name: 'Coverage Matrix',
                description: `See which ${pPlural.toLowerCase()} each ${cSingular} supports`,
                url: `${siteUrl}matrix.html`
            },
            {
                id: 'json-api',
                name: 'JSON API',
                description: 'Programmatic access to all data',
                url: `${siteUrl}api/v1/index.json`,
                endpoints: [
                    { path: 'api/v1/containers.json', description: `All ${cPlural.toLowerCase()}` },
                    { path: 'api/v1/primaries.json', description: `All ${pPlural.toLowerCase()}` },
                    { path: 'api/v1/authorities.json', description: `All ${aPlural.toLowerCase()}` },
                    { path: 'api/v1/mappings.json', description: 'All mappings' },
                    { path: 'api/v1/matrix.json', description: 'Coverage matrix' },
                    { path: 'api/v1/comparisons.json', description: 'Pre-computed comparisons' }
                ]
            }
        ],
        content: {
            containers: containers.map(c => ({ id: c.id, name: c.title || c.name || c.id, status: c.status, url: `${siteUrl.replace(/\/$/, '')}${containerHref(c)}` })),
            primaries: primaries.map(p => ({ id: p.id, name: p.name || humanizeId(p.id), group: p.group, url: `${siteUrl}primary/${p.id}/` })),
            authorities: authorities.map(a => ({ id: a.id, name: a.name || humanizeId(a.id), url: `${siteUrl}authority/${a.id}/` }))
        },
        discovery: {
            llms_txt: `${siteUrl}llms.txt`,
            sitemap: `${siteUrl}sitemap.xml`,
            rss: `${siteUrl}index.xml`,
            robots: `${siteUrl}robots.txt`
        },
        meta: {
            last_updated: new Date().toISOString().split('T')[0],
            built_with: 'Knowledge as Code',
            pattern_url: 'https://knowledge-as-code.com',
            template_url: 'https://github.com/snapsynapse/knowledge-as-code-template'
        }
    };
    if (config.ecosystem) {
        agentsJson.related_sites = config.ecosystem.map(p => ({ name: p.name, url: p.url, description: p.description || '' }));
    }
    fs.writeFileSync(path.join(DOCS_DIR, 'agents.json'), JSON.stringify(agentsJson, null, 2));

    // RSS feed (index.xml) — sorted by last_verified (freshest first), fallback to effective
    const sortedContainers = [...containers]
        .filter(c => c.effective || c.last_verified)
        .sort((a, b) => (b.last_verified || b.effective || '').localeCompare(a.last_verified || a.effective || ''));
    const rssItems = sortedContainers.slice(0, 20).map(c => {
        const desc = `${c.title || c.name || c.id}: ${c.status || 'unknown'}. ${c.provisions.length} provisions.`;
        const pubDate = c.last_verified || c.effective;
        return [
            '    <item>',
            `      <title>${escapeHTML(c.title || c.name || c.id)}</title>`,
            `      <link>${siteUrl.replace(/\/$/, '')}${containerHref(c)}</link>`,
            `      <guid>${siteUrl.replace(/\/$/, '')}${containerHref(c)}</guid>`,
            `      <description>${escapeHTML(desc)}</description>`,
            pubDate ? `      <pubDate>${new Date(pubDate + 'T00:00:00Z').toUTCString()}</pubDate>` : '',
            '    </item>'
        ].filter(Boolean).join('\n');
    }).join('\n');
    const rssFeed = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '  <channel>',
        `    <title>${escapeHTML(config.name || 'Knowledge Base')}</title>`,
        `    <link>${siteUrl}</link>`,
        `    <description>${escapeHTML(config.description || '')}</description>`,
        `    <atom:link href="${siteUrl}index.xml" rel="self" type="application/rss+xml"/>`,
        `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
        rssItems,
        '  </channel>',
        '</rss>',
        ''
    ].join('\n');
    fs.writeFileSync(path.join(DOCS_DIR, 'index.xml'), rssFeed);

    console.log('  Discovery files: llms.txt, agents.json, index.xml');

    // Enforcement calendar (ICS) — one VEVENT per dated milestone on every
    // container: effective, term_start, term_end, enacted (if distinct from
    // effective). Subscribers get deadline reminders in their calendar app.
    const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//PubLedge//Registry Calendar//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:PubLedge Enforcement Calendar`,
        `X-WR-CALDESC:Key dates for every record in the PubLedge registry.`
    ];
    function icsDate(d) { return String(d).replace(/-/g, ''); }
    function icsEscape(s) { return String(s).replace(/[\\,;]/g, m => '\\' + m).replace(/\r?\n/g, '\\n'); }
    function icsEvent(c, kind, date) {
        if (!date) return;
        const dt = icsDate(date);
        const uid = `${c.id}-${kind}@publedge.org`;
        const url = siteUrl.replace(/\/$/, '') + containerHref(c);
        const summary = `${kind.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())}: ${c.title || c.name || c.id}`;
        icsLines.push(
            'BEGIN:VEVENT',
            `UID:${uid}`,
            `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
            `DTSTART;VALUE=DATE:${dt}`,
            `DTEND;VALUE=DATE:${dt}`,
            `SUMMARY:${icsEscape(summary)}`,
            `DESCRIPTION:${icsEscape((c.title || c.name || c.id) + ' — ' + kind + '. ' + url)}`,
            `URL:${url}`,
            'END:VEVENT'
        );
    }
    for (const c of containers) {
        if (c.enacted && c.enacted !== c.effective) icsEvent(c, 'enacted', c.enacted);
        icsEvent(c, 'effective', c.effective);
        icsEvent(c, 'term-start', c.term_start);
        icsEvent(c, 'term-end', c.term_end);
    }
    icsLines.push('END:VCALENDAR', '');
    fs.writeFileSync(path.join(DOCS_DIR, 'calendar.ics'), icsLines.join('\r\n'));
    console.log('  Enforcement calendar: calendar.ics');

    // CNAME — for GitHub Pages custom domains
    const hostname = siteUrl.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    if (hostname) fs.writeFileSync(path.join(DOCS_DIR, 'CNAME'), hostname + '\n');

    // .nojekyll — prevent GitHub Pages from running Jekyll on output
    fs.writeFileSync(path.join(DOCS_DIR, '.nojekyll'), '');

    // 404 page
    fs.writeFileSync(path.join(DOCS_DIR, '404.html'), generate404Page(config, configCSS));

    // Static assets (styles.css, search.js, tables.js) are pre-committed to the
    // output directory and read directly by generated pages via relative paths.

    const elapsed = Date.now() - startTime;
    const totalPages = 7 + patternPageCount + containers.length + primaries.length + authorities.length + reqCount + cmpCount + appCount;
    console.log(`\nBuild complete in ${elapsed}ms — ${totalPages} HTML pages, 6 JSON API files`);
}

build();
