import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { test } from 'node:test';
import {
    DEFAULT_LIMITS, canonicalPageLocations, createTransport, previewBase, publicAddress, readBoundedStream
} from '../scripts/lib/production-search-transport.mjs';

const origin = 'https://publedge.org/';
const address = '8.8.8.8';
const limits = { ...DEFAULT_LIMITS, requests: 3, responseBytes: 20, totalBytes: 40, redirects: 2 };
const response = (status, location = null, body = 'OK') => ({
    status, headers: location ? { location } : { 'content-type': 'text/html' }, body, bytes: Buffer.byteLength(body)
});

test('sitemap locations are rejected before entering the request queue', async () => {
    const reports = [];
    const xml = `<urlset><url><loc>https://127.0.0.1/private</loc></url>
        <url><loc>https://publedge.org/a/../private</loc></url>
        <url><loc>https://publedge.org/valid</loc></url></urlset>`;
    const pages = canonicalPageLocations(xml, origin, (...args) => reports.push(args), 10);
    const requested = [];
    for (const page of pages) requested.push(page.canonical);
    assert.deepEqual(requested, ['https://publedge.org/valid']);
    assert.equal(reports.length, 2);
    const capped = canonicalPageLocations('<url><loc>https://publedge.org/one</loc></url><url><loc>https://publedge.org/two</loc></url>', origin, (...args) => reports.push(args), 1);
    assert.equal(capped.length, 1);
    assert.match(reports.at(-1)[1], /exceeds 1 page/);
});

test('redirects remain on the approved origin and count physical attempts', async () => {
    const reports = [];
    const calls = [];
    const transport = createTransport({ canonicalOrigin: origin, base: origin, limits,
        report: (...args) => reports.push(args), lookup: async () => [{ address }],
        requestOnce: async url => { calls.push(url); return calls.length === 1
            ? response(302, 'https://127.0.0.1/private') : response(200); } });
    assert.equal(await transport.request(origin), null);
    assert.deepEqual(calls, [origin]);
    assert.equal(transport.stats().requests, 1);
    assert.match(reports[0][1], /unapproved request target/);

    const goodCalls = [];
    const good = createTransport({ canonicalOrigin: origin, base: origin, limits, report: () => {},
        lookup: async () => [{ address }], requestOnce: async url => {
            goodCalls.push(url);
            return goodCalls.length === 1 ? response(302, '/next') : response(200);
        } });
    const result = await good.request(origin);
    assert.equal(result.url, 'https://publedge.org/next');
    assert.equal(await result.text(), 'OK');
    assert.equal(good.stats().requests, 2);
});

test('mixed DNS, private ranges, and exhausted budgets fail before transport', async () => {
    const reports = [];
    const calls = [];
    const mixed = createTransport({ canonicalOrigin: origin, base: origin, limits,
        report: (...args) => reports.push(args), lookup: async () => [{ address }, { address: '127.0.0.1' }],
        requestOnce: async url => { calls.push(url); return response(200); } });
    assert.equal(await mixed.request(origin), null);
    assert.deepEqual(calls, []);
    assert.match(reports[0][1], /unsafe DNS answer/);
    for (const unsafe of ['127.0.0.1', '10.0.0.1', '169.254.1.1', '192.168.1.1', '::1', '::ffff:127.0.0.1', '2002::1', '2001:db8::1']) {
        assert.equal(publicAddress(unsafe), false, unsafe);
    }
    assert.equal(publicAddress(address), true);
    const bounded = createTransport({ canonicalOrigin: origin, base: origin, limits: { ...limits, requests: 1 },
        report: (...args) => reports.push(args), lookup: async () => [{ address }],
        requestOnce: async url => { calls.push(url); return response(200); } });
    assert.ok(await bounded.request(origin));
    assert.equal(await bounded.request(origin), null);
    assert.equal(calls.length, 1);
});

test('preview must be explicit loopback and cannot redirect out', async () => {
    assert.equal(previewBase('http://127.0.0.1:8088/', origin).production, false);
    assert.throws(() => previewBase('https://attacker.example/', origin), /local HTTP loopback/);
    assert.throws(() => createTransport({ canonicalOrigin: 'http://publedge.org/', base: 'http://publedge.org/', report: () => {} }), /Canonical origin must use HTTPS/);
    const reports = [];
    const calls = [];
    const transport = createTransport({ canonicalOrigin: origin, base: 'http://127.0.0.1:8088/', limits,
        report: (...args) => reports.push(args),
        requestOnce: async url => { calls.push(url); return response(302, 'http://169.254.169.254/latest'); } });
    assert.equal(await transport.request('http://127.0.0.1:8088/'), null);
    assert.equal(calls.length, 1);
    assert.match(reports[0][1], /unapproved request target/);
});

test('chunked oversized body is rejected by the bounded response reader', async () => {
    const chunks = [Buffer.from('12345678'), Buffer.from('abcdefgh')];
    await assert.rejects(readBoundedStream(Readable.from(chunks), 10), /response exceeds/);
    const allowed = await readBoundedStream(Readable.from(chunks), 20);
    assert.equal(allowed.body, '12345678abcdefgh');
});
