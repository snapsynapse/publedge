'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const { containedPath, scriptSafeJson } = require('../scripts/lib/build-safety');
const { attachCanonicalPaths, validateBuildPaths, renderPageShell, renderBridgeShell, generateComparePage } = require('../scripts/build');

test('record paths reject traversal and symlinked ancestors before outside IO', () => {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'publedge-build-safety-'));
    try {
        const docs = path.join(temp, 'docs');
        const outside = path.join(temp, 'outside');
        fs.mkdirSync(docs);
        fs.mkdirSync(outside);
        const marker = path.join(outside, 'marker.txt');
        fs.writeFileSync(marker, 'OUTSIDE MARKER');
        assert.equal(containedPath(docs, 'record/', 'asset.txt'), path.join(docs, 'record', 'asset.txt'));
        fs.mkdirSync(path.join(docs, 'record'));
        fs.writeFileSync(containedPath(docs, 'record/', 'ocr.txt'), 'valid OCR text');
        assert.equal(fs.readFileSync(containedPath(docs, 'record/', 'ocr.txt'), 'utf8'), 'valid OCR text');
        for (const bad of ['../outside', '/outside', 'record/../../outside', 'record\\outside', 'record\0outside']) {
            assert.throws(() => containedPath(docs, bad, 'marker.txt'));
        }
        fs.symlinkSync(outside, path.join(docs, 'linked'));
        assert.throws(() => containedPath(docs, 'linked', 'marker.txt'), /Symlink/);
        fs.symlinkSync(path.join(outside, 'missing'), path.join(docs, 'broken'));
        assert.throws(() => containedPath(docs, 'broken', 'marker.txt'), /Symlink/);
        assert.equal(fs.readFileSync(marker, 'utf8'), 'OUTSIDE MARKER');
        assert.equal(fs.existsSync(path.join(temp, 'marker.txt')), false);
    } finally {
        fs.rmSync(temp, { recursive: true, force: true });
    }
});

test('build metadata rejects unsafe instance, OCR filename and source filename', () => {
    const config = { hierarchy: { jurisdictions: { 'us-ut': { country: 'us', region: 'utah' } }, type_segments: { rma: 'rma' } } };
    const authority = { id: 'authority-one', jurisdiction: 'us-ut', url_segment: 'oaip' };
    const valid = { id: 'record-one', jurisdiction: 'us-ut', authority: authority.id, type: 'rma', instance: '2025-001', source_documents: ['Signed.pdf'], extracted_text: 'Signed.txt' };
    attachCanonicalPaths([valid], [authority], config);
    assert.equal(valid._canonicalPath, 'us/utah/oaip/rma/2025-001/');
    assert.doesNotThrow(() => validateBuildPaths([{ id: 'primary-one' }], [valid], [authority], []));
    assert.throws(() => attachCanonicalPaths([{ ...valid, instance: '../outside' }], [authority], config), /Unsafe container instance/);
    assert.throws(() => validateBuildPaths([], [{ ...valid, extracted_text: '../../marker.txt' }], [authority], []), /Unsafe/);
    assert.throws(() => validateBuildPaths([], [{ ...valid, source_documents: ['../marker.pdf'] }], [authority], []), /Unsafe/);
    assert.throws(() => validateBuildPaths([], [{ ...valid, source_documents: ['javascript:alert(1)'] }], [authority], []), /Unsafe/);
});

test('structured data remains JSON without closing the script element', () => {
    const payload = '</ScRiPt><img src=x onerror=alert(1)>\u2028\u2029';
    const config = { name: 'PubLedge', url: 'https://publedge.org/' };
    const page = renderPageShell(config, { title: 'Test', content: '', structuredData: { name: payload } });
    const bridge = renderBridgeShell(config, { title: 'Test', content: '', structuredData: { name: payload } });
    for (const html of [page, bridge]) {
        const match = html.match(/<script type="application\/ld\+json">([^<]*)<\/script>/);
        assert.ok(match, 'JSON-LD stays in its script element');
        assert.equal(JSON.parse(match[1]).name, payload);
        assert.equal(html.includes('</ScRiPt><img'), false);
    }
    assert.equal(JSON.parse(scriptSafeJson({ value: payload })).value, payload);
});

test('comparison renders hostile labels as text with safe local links', () => {
    const payload = '</ScRiPt><img src=x onerror=alert(1)>';
    const containers = [
        { id: 'record-a', name: payload },
        { id: 'record-b', name: 'Valid record' }
    ];
    const html = generateComparePage({ name: 'PubLedge', url: 'https://publedge.org/' }, {
        containers,
        primaries: [{ id: 'primary-a', name: payload }],
        mappingIndex: [
            { regulation: 'record-a', obligations: ['primary-a'] },
            { regulation: 'record-b', obligations: ['primary-a'] }
        ],
        comparisons: []
    }, '');
    assert.equal(html.includes('</ScRiPt><img'), false);
    const script = html.match(/<script>\s*(var cmpData = [\s\S]*?)<\/script>/)?.[1];
    assert.ok(script);
    class Element {
        constructor(tag) { this.tag = tag; this.children = []; this.style = {}; this.textContent = ''; }
        appendChild(child) { this.children.push(child); return child; }
        replaceChildren(...children) { this.children = children; }
        set innerHTML(_) { throw new Error('Dynamic HTML sink used'); }
    }
    const result = new Element('div');
    const boxes = [{ value: 'record-a', checked: true }, { value: 'record-b', checked: true }];
    const document = {
        createElement: tag => new Element(tag),
        getElementById: id => id === 'compareResult' ? result : null,
        querySelectorAll: selector => selector.endsWith(':checked') ? boxes.filter(box => box.checked) : boxes
    };
    const context = { document, window: { location: 'https://publedge.org/compare.html' }, URL, URLSearchParams, history: { replaceState() {} } };
    vm.runInNewContext(script, context);
    context.updateComparison();
    const descendants = function* (node) { yield node; for (const child of node.children || []) yield* descendants(child); };
    const nodes = [...descendants(result)];
    assert.ok(nodes.some(node => node.textContent === payload));
    assert.ok(nodes.some(node => node.href === '/primary/primary-a/'));
    assert.equal(nodes.some(node => node.tag === 'img'), false);
});
