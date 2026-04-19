#!/usr/bin/env node
'use strict';

/**
 * PubLedge-specific build extensions.
 * Runs after scripts/build.js (the KaC template generator).
 * Adds: reference HTML copy, template library pages, static artifact copy,
 * feed rename, sitemap/llms/agents extension to cover PubLedge content types.
 * Zero dependencies.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT, process.env.KAC_OUTPUT_DIR || 'docs');
const SITE_URL = 'https://publedge.org/';

function ensureDir(d) { fs.mkdirSync(d, { recursive: true }); }

function copyRecursive(src, dst) {
    if (!fs.existsSync(src)) return 0;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        ensureDir(dst);
        let n = 0;
        for (const entry of fs.readdirSync(src)) {
            n += copyRecursive(path.join(src, entry), path.join(dst, entry));
        }
        return n;
    }
    ensureDir(path.dirname(dst));
    fs.copyFileSync(src, dst);
    return 1;
}

function escapeHTML(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function parseFrontmatter(md) {
    const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) return { meta: {}, body: md };
    const meta = {};
    let key = null;
    let listKey = null;
    const block = m[1];
    const lines = block.split('\n');
    for (const raw of lines) {
        if (!raw.trim() || raw.trim().startsWith('#')) continue;
        const indent = raw.search(/\S/);
        const trimmed = raw.trim();
        if (trimmed.startsWith('- ')) {
            if (listKey) {
                const item = trimmed.slice(2).trim();
                if (item.includes(':') && !item.startsWith('"')) {
                    const ci = item.indexOf(':');
                    const k = item.slice(0, ci).trim().replace(/^["']|["']$/g, '');
                    const v = item.slice(ci + 1).trim().replace(/^["']|["']$/g, '');
                    meta[listKey].push({ [k]: v });
                } else {
                    meta[listKey].push(item.replace(/^["']|["']$/g, ''));
                }
            }
            continue;
        }
        const ci = trimmed.indexOf(':');
        if (ci === -1) continue;
        const k = trimmed.slice(0, ci).trim().replace(/^["']|["']$/g, '');
        const v = trimmed.slice(ci + 1).trim().replace(/^["']|["']$/g, '');
        key = k;
        if (v === '') {
            meta[k] = [];
            listKey = k;
        } else {
            meta[k] = v;
            listKey = null;
        }
    }
    return { meta, body: m[2] };
}

// Minimal Markdown → HTML: headings, paragraphs, fenced code, inline code,
// bold, italic, links, unordered lists. Sufficient for PubLedge templates.
function mdToHtml(md) {
    const lines = md.split('\n');
    const out = [];
    let inCode = false;
    let inList = false;
    let paraBuf = [];

    function flushPara() {
        if (paraBuf.length === 0) return;
        const text = inline(paraBuf.join(' ').trim());
        if (text) out.push(`<p>${text}</p>`);
        paraBuf = [];
    }
    function closeList() { if (inList) { out.push('</ul>'); inList = false; } }

    function inline(s) {
        s = escapeHTML(s);
        s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
        s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        s = s.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, '<code class="tpl-var">{{$1}}</code>');
        return s;
    }

    for (const raw of lines) {
        if (raw.startsWith('```')) {
            flushPara(); closeList();
            if (!inCode) { out.push('<pre><code>'); inCode = true; }
            else { out.push('</code></pre>'); inCode = false; }
            continue;
        }
        if (inCode) { out.push(escapeHTML(raw)); continue; }

        if (/^#{1,6}\s/.test(raw)) {
            flushPara(); closeList();
            const level = raw.match(/^#+/)[0].length;
            const text = inline(raw.replace(/^#+\s+/, ''));
            out.push(`<h${level}>${text}</h${level}>`);
            continue;
        }
        if (/^\s*[-*]\s+/.test(raw)) {
            flushPara();
            if (!inList) { out.push('<ul>'); inList = true; }
            out.push(`<li>${inline(raw.replace(/^\s*[-*]\s+/, ''))}</li>`);
            continue;
        }
        if (raw.trim() === '') {
            flushPara(); closeList();
            continue;
        }
        closeList();
        paraBuf.push(raw);
    }
    flushPara(); closeList();
    if (inCode) out.push('</code></pre>');
    return out.join('\n');
}

function pageShell({ title, canonicalPath, relRoot, bodyHtml, description }) {
    const canonical = `${SITE_URL}${canonicalPath}`;
    const desc = description || 'PubLedge — open recordkeeping protocol for fact-specific written interpretations.';
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(title)} · PubLedge</title>
<meta name="description" content="${escapeHTML(desc)}">
<meta name="theme-color" content="#1a1a2e">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${escapeHTML(title)} · PubLedge">
<meta property="og:description" content="${escapeHTML(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE_URL}imgs/og.png">
<link rel="stylesheet" href="${relRoot}assets/styles.css">
</head>
<body>
<header class="site-header">
<h1><a href="${relRoot}index.html">PubLedge</a></h1>
<nav class="site-nav" aria-label="Main navigation">
<a href="${relRoot}index.html" class="site-nav-link">Home</a>
<a href="${relRoot}reference/protocol/" class="site-nav-link">Protocol</a>
<a href="${relRoot}containers.html" class="site-nav-link">Registry</a>
<a href="${relRoot}templates/" class="site-nav-link">Templates</a>
<a href="${relRoot}primaries.html" class="site-nav-link">Obligations</a>
<a href="${relRoot}matrix.html" class="site-nav-link">Matrix</a>
<a href="${relRoot}reference/prior-art/" class="site-nav-link">Prior Art</a>
<a href="${relRoot}reference/vocabulary/" class="site-nav-link">Vocabulary</a>
<a href="${relRoot}about.html" class="site-nav-link">About</a>
</nav>
</header>
<main>
${bodyHtml}
</main>
<footer class="site-footer">
<p><small>PubLedge v0.1.0-pre · Drafting in public · <a href="${relRoot}MANIFEST.yaml">MANIFEST.yaml</a> · <a href="https://github.com/snapsynapse/publedge">GitHub</a></small></p>
</footer>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 1. Copy reference/**/*.html verbatim into docs/reference/
// ---------------------------------------------------------------------------
function copyReferenceHtml() {
    const src = path.join(ROOT, 'reference');
    const dst = path.join(DOCS_DIR, 'reference');
    const n = copyRecursive(src, dst);
    console.log(`  Reference pages copied: ${n}`);
    return n;
}

// ---------------------------------------------------------------------------
// 2. Render _templates/**/*.md → /template/<slug>/ + /templates/ index
// ---------------------------------------------------------------------------
function renderTemplates() {
    const srcDir = path.join(ROOT, '_templates');
    if (!fs.existsSync(srcDir)) return [];

    const templates = [];
    function walk(dir) {
        for (const entry of fs.readdirSync(dir)) {
            const p = path.join(dir, entry);
            const st = fs.statSync(p);
            if (st.isDirectory()) {
                if (entry === 'drafts') continue;
                walk(p);
            } else if (entry.endsWith('.md')) {
                const md = fs.readFileSync(p, 'utf8');
                const { meta, body } = parseFrontmatter(md);
                if (!meta.slug) continue;
                templates.push({ meta, body, path: p });
            }
        }
    }
    walk(srcDir);

    for (const t of templates) {
        const slug = t.meta.slug;
        const dir = path.join(DOCS_DIR, 'template', slug);
        ensureDir(dir);

        const variables = Array.isArray(t.meta.variables) ? t.meta.variables : [];
        const varRows = variables.map(v => {
            if (typeof v === 'object') {
                const name = v.name || Object.keys(v)[0];
                const desc = v.description || v[name] || '';
                return `<tr><td><code>{{${escapeHTML(name)}}}</code></td><td>${escapeHTML(desc)}</td></tr>`;
            }
            return `<tr><td><code>{{${escapeHTML(v)}}}</code></td><td></td></tr>`;
        }).join('');

        const bodyHtml = `
<article class="template-detail">
<p><a href="../../templates/">← All templates</a></p>
<h1>${escapeHTML(t.meta.title || slug)}</h1>
<dl class="template-meta">
<dt>Template ID</dt><dd><code>${escapeHTML(t.meta.id || '')}</code></dd>
<dt>Kind</dt><dd>${escapeHTML((t.meta.kind || '').toUpperCase())}</dd>
<dt>Jurisdiction</dt><dd>${escapeHTML(t.meta.jurisdiction || '')}</dd>
<dt>Status</dt><dd>${escapeHTML(t.meta.status || '')}</dd>
${t.meta.disclaimer ? `<dt>Disclaimer</dt><dd>${escapeHTML(t.meta.disclaimer)}</dd>` : ''}
</dl>
${varRows ? `<h2>Variables</h2><table class="template-vars"><thead><tr><th>Variable</th><th>Description</th></tr></thead><tbody>${varRows}</tbody></table>` : ''}
<h2>Template body</h2>
<div class="template-body">
${mdToHtml(t.body)}
</div>
<p><a href="../../_templates/${path.relative(srcDir, t.path).replace(/\\/g, '/')}">View raw markdown source</a></p>
</article>`;

        fs.writeFileSync(path.join(dir, 'index.html'), pageShell({
            title: t.meta.title || slug,
            canonicalPath: `template/${slug}/`,
            relRoot: '../../',
            bodyHtml,
            description: (t.meta.title || '') + ' — PubLedge template.'
        }));
    }

    // Index page
    const byKind = {};
    for (const t of templates) {
        const kind = (t.meta.kind || 'other').toLowerCase();
        (byKind[kind] = byKind[kind] || []).push(t);
    }
    const kindOrder = ['jia', 'rma', 'other'];
    const sections = kindOrder.filter(k => byKind[k]).map(k => {
        const items = byKind[k].map(t => {
            return `<li><a href="../template/${escapeHTML(t.meta.slug)}/">${escapeHTML(t.meta.title || t.meta.slug)}</a> <span class="muted">— ${escapeHTML(t.meta.jurisdiction || '')} · ${escapeHTML(t.meta.status || '')}</span></li>`;
        }).join('\n');
        return `<section><h2>${k.toUpperCase()} templates</h2><ul>${items}</ul></section>`;
    }).join('\n');

    ensureDir(path.join(DOCS_DIR, 'templates'));
    const indexBody = `
<h1>PubLedge Templates</h1>
<p>Suggested prior-art templates for Joint Interpretation Agreements (JIAs) and Regulatory Mitigation Agreements (RMAs) under Utah Code Title 13 Chapter 72 Part 4. Not official OAIP output.</p>
${sections || '<p>No templates published.</p>'}
<p><a href="../reference/protocol/">← Back to protocol</a></p>`;
    fs.writeFileSync(path.join(DOCS_DIR, 'templates', 'index.html'), pageShell({
        title: 'Templates',
        canonicalPath: 'templates/',
        relRoot: '../',
        bodyHtml: indexBody,
        description: 'PubLedge JIA and RMA template library — Utah Chapter 72 Part 4.'
    }));

    console.log(`  Template pages: ${templates.length} detail + 1 index`);
    return templates;
}

// ---------------------------------------------------------------------------
// 3. Copy static artifacts: MANIFEST, LICENSEs, prose .md, imgs/
// ---------------------------------------------------------------------------
function copyStatics() {
    const files = ['MANIFEST.yaml', 'LICENSE', 'LICENSE-APACHE', 'LICENSE-CC-BY-4.0',
        'PROTOCOL.md', 'PRIOR-ART.md', 'ROADMAP.md', 'ATTRIBUTION.md', 'README.md',
        'CONTRIBUTING.md', 'VERIFICATION.md'];
    let n = 0;
    for (const f of files) {
        const src = path.join(ROOT, f);
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, path.join(DOCS_DIR, f));
            n++;
        }
    }
    // imgs/
    const imgsN = copyRecursive(path.join(ROOT, 'imgs'), path.join(DOCS_DIR, 'imgs'));
    // Expose raw template + data directories for citation integrity
    const tplN = copyRecursive(path.join(ROOT, '_templates'), path.join(DOCS_DIR, '_templates'));
    const dataN = copyRecursive(path.join(ROOT, 'data'), path.join(DOCS_DIR, 'data'));
    const schemaN = copyRecursive(path.join(ROOT, 'schema'), path.join(DOCS_DIR, 'schema'));
    const assetsN = copyRecursive(path.join(ROOT, 'assets'), path.join(DOCS_DIR, 'assets'));
    console.log(`  Static artifacts: ${n} top-level, ${imgsN} imgs, ${tplN} template sources, ${dataN} data files, ${schemaN} schema files, ${assetsN} asset files`);
}

// ---------------------------------------------------------------------------
// 4. Rename docs/index.xml → docs/feed.xml; patch references in llms.txt and agents.json
// ---------------------------------------------------------------------------
function renameFeed() {
    const old = path.join(DOCS_DIR, 'index.xml');
    const neu = path.join(DOCS_DIR, 'feed.xml');
    if (fs.existsSync(old)) {
        let rss = fs.readFileSync(old, 'utf8');
        rss = rss.replace(/index\.xml/g, 'feed.xml');
        fs.writeFileSync(neu, rss);
        fs.unlinkSync(old);
    }

    const llms = path.join(DOCS_DIR, 'llms.txt');
    if (fs.existsSync(llms)) {
        let txt = fs.readFileSync(llms, 'utf8');
        txt = txt.replace(/index\.xml/g, 'feed.xml');
        fs.writeFileSync(llms, txt);
    }
    const agents = path.join(DOCS_DIR, 'agents.json');
    if (fs.existsSync(agents)) {
        let txt = fs.readFileSync(agents, 'utf8');
        txt = txt.replace(/index\.xml/g, 'feed.xml');
        fs.writeFileSync(agents, txt);
    }
    console.log('  Feed: index.xml → feed.xml');
}

// ---------------------------------------------------------------------------
// 5. Extend sitemap + llms.txt + agents.json with PubLedge content types
// ---------------------------------------------------------------------------
function extendDiscovery(templates) {
    const newPaths = [
        'reference/',
        'reference/protocol/',
        'reference/prior-art/',
        'reference/registry/',
        'reference/vocabulary/',
        'templates/',
        'PROTOCOL.md',
        'PRIOR-ART.md',
        'ROADMAP.md',
        'ATTRIBUTION.md',
        'MANIFEST.yaml',
        'schema/jia.schema.json',
        'schema/rma.schema.json',
        'schema/context.jsonld'
    ];
    for (const t of templates) newPaths.push(`template/${t.meta.slug}/`);

    // Sitemap
    const smPath = path.join(DOCS_DIR, 'sitemap.xml');
    if (fs.existsSync(smPath)) {
        let sm = fs.readFileSync(smPath, 'utf8');
        const today = new Date().toISOString().split('T')[0];
        const inserts = newPaths.map(p => `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n');
        sm = sm.replace('</urlset>', inserts + '\n</urlset>');
        fs.writeFileSync(smPath, sm);
    }

    // llms.txt — append PubLedge-specific sections
    const llmsPath = path.join(DOCS_DIR, 'llms.txt');
    if (fs.existsSync(llmsPath)) {
        let txt = fs.readFileSync(llmsPath, 'utf8');
        const addendum = [
            '',
            '## Protocol',
            '',
            `- [Protocol specification](${SITE_URL}reference/protocol/): PubLedge entity model, frontmatter, identifier rules, integrity mechanism.`,
            `- [Protocol source (Markdown)](${SITE_URL}PROTOCOL.md)`,
            `- [Prior art survey](${SITE_URL}reference/prior-art/): Utah Sandbox, SEC No-Action, IRS PLRs, CFPB Advisory, Utah Court Forms.`,
            `- [Prior art source (Markdown)](${SITE_URL}PRIOR-ART.md)`,
            `- [Vocabulary mapping](${SITE_URL}reference/vocabulary/): PubLedge entities bound to gist classes.`,
            `- [Roadmap](${SITE_URL}ROADMAP.md)`,
            `- [Attribution](${SITE_URL}ATTRIBUTION.md)`,
            `- [Manifest (SHA-256 hashes)](${SITE_URL}MANIFEST.yaml)`,
            '',
            '## Templates',
            '',
            `- [Template library index](${SITE_URL}templates/)`,
            ...templates.map(t => `- [${t.meta.title || t.meta.slug}](${SITE_URL}template/${t.meta.slug}/): ${(t.meta.kind || '').toUpperCase()} · ${t.meta.jurisdiction || ''}`),
            ''
        ].join('\n');
        fs.writeFileSync(llmsPath, txt.trimEnd() + '\n' + addendum);
    }

    // agents.json — add protocol + templates capabilities
    const agentsPath = path.join(DOCS_DIR, 'agents.json');
    if (fs.existsSync(agentsPath)) {
        const j = JSON.parse(fs.readFileSync(agentsPath, 'utf8'));
        j.capabilities = j.capabilities || [];
        j.capabilities.push({
            id: 'protocol-spec',
            name: 'PubLedge Protocol Specification',
            description: 'Entity model, frontmatter contract, integrity mechanism.',
            url: `${SITE_URL}reference/protocol/`
        });
        j.capabilities.push({
            id: 'template-library',
            name: 'JIA and RMA Template Library',
            description: `${templates.length} fill-in templates for Utah Chapter 72 Part 4.`,
            url: `${SITE_URL}templates/`
        });
        j.capabilities.push({
            id: 'mcp-server',
            name: 'MCP Server',
            description: 'Read-only MCP server exposing the PubLedge knowledge base. Run: node mcp-server.js',
            source: `https://github.com/snapsynapse/publedge/blob/main/mcp-server.js`
        });
        j.content = j.content || {};
        j.content.templates = templates.map(t => ({
            id: t.meta.id,
            slug: t.meta.slug,
            title: t.meta.title,
            kind: t.meta.kind,
            jurisdiction: t.meta.jurisdiction,
            status: t.meta.status,
            url: `${SITE_URL}template/${t.meta.slug}/`
        }));
        j.integrity = { manifest: `${SITE_URL}MANIFEST.yaml` };
        fs.writeFileSync(agentsPath, JSON.stringify(j, null, 2));
    }

    console.log(`  Discovery extended: +${newPaths.length} sitemap entries, +protocol/templates sections in llms.txt and agents.json`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
console.log('PubLedge build extras:');
copyReferenceHtml();
const templates = renderTemplates();
copyStatics();
renameFeed();
extendDiscovery(templates);
console.log('PubLedge extras complete.');
