import dns from 'node:dns/promises';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';

export const DEFAULT_LIMITS = Object.freeze({
    requests: 600,
    redirects: 3,
    responseBytes: 2 * 1024 * 1024,
    totalBytes: 32 * 1024 * 1024,
    sitemaps: 16,
    pages: 500,
    depth: 4
});

function boundary(message) {
    const error = new Error(message);
    error.code = 'SEARCH_BOUNDARY';
    return error;
}

export function publicAddress(address) {
    const family = net.isIP(address);
    if (family === 4) {
        const [a, b, c] = address.split('.').map(Number);
        return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
            (a === 100 && b >= 64 && b <= 127) ||
            (a === 169 && b === 254) ||
            (a === 172 && b >= 16 && b <= 31) ||
            (a === 192 && (b === 0 || b === 168)) ||
            (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100))) ||
            (a === 203 && b === 0 && c === 113));
    }
    if (family === 6) {
        const first = Number.parseInt(address.split(':')[0], 16);
        const second = Number.parseInt(address.split(':')[1] || '0', 16);
        return first >= 0x2000 && first <= 0x3fff &&
            !(first === 0x2001 && (second === 0 || second === 0xdb8 || second === 0x10)) &&
            first !== 0x2002;
    }
    return false;
}

function loopbackAddress(address) {
    return address === '::1' || (net.isIP(address) === 4 && address.startsWith('127.'));
}

export function previewBase(base, canonicalOrigin) {
    const parsed = new URL(base);
    if (parsed.href === canonicalOrigin) return { base: parsed, production: true };
    if (parsed.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname) ||
        parsed.username || parsed.password || parsed.search || parsed.hash) {
        throw boundary('Preview base must be an explicit local HTTP loopback URL');
    }
    return { base: parsed, production: false };
}

export function canonicalPageLocations(xml, canonicalOrigin, report, limit, decode = value => String(value || '').trim()) {
    const pages = [];
    const origin = new URL(canonicalOrigin).origin;
    for (const match of xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
        if (pages.length >= limit) {
            report('infrastructure', `sitemap exceeds ${limit} page locations`);
            break;
        }
        const canonical = decode(match[1].match(/<loc>([^<]+)<\/loc>/i)?.[1]);
        const lastmod = match[1].match(/<lastmod>([^<]+)<\/lastmod>/i)?.[1]?.trim();
        if (!canonical) {
            report('defect', 'sitemap URL entry is missing loc');
            continue;
        }
        let url;
        try { url = new URL(canonical); }
        catch { report('defect', `invalid sitemap page location ${canonical}`); continue; }
        if (url.origin !== origin || url.href !== canonical) {
            report('defect', `noncanonical sitemap page location ${canonical}`);
            continue;
        }
        pages.push({ canonical, lastmod });
    }
    return pages;
}

export async function nodeRequestOnce(url, address, maxBytes) {
    const parsed = new URL(url);
    const transport = parsed.protocol === 'https:' ? https : http;
    return new Promise((resolve, reject) => {
        const req = transport.get(parsed, {
            headers: { 'user-agent': 'portfolio-search-contract/4' },
            servername: parsed.hostname,
            rejectUnauthorized: true,
            autoSelectFamily: false,
            lookup: (_host, _options, callback) => callback(null, address, net.isIP(address))
        }, response => {
            readBoundedStream(response, maxBytes).then(({ body, bytes }) => {
                resolve({ status: response.statusCode, headers: response.headers, body, bytes });
            }, error => { req.destroy(); reject(error); });
        });
        req.setTimeout(15000, () => req.destroy(new Error('request timed out')));
        req.on('error', reject);
    });
}

export function readBoundedStream(stream, maxBytes) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let bytes = 0;
        let settled = false;
        const fail = error => {
            if (settled) return;
            settled = true;
            stream.destroy();
            reject(error);
        };
        stream.on('data', chunk => {
            if (settled) return;
            bytes += chunk.length;
            if (bytes > maxBytes) return fail(boundary(`response exceeds ${maxBytes} bytes`));
            chunks.push(chunk);
        });
        stream.on('end', () => {
            if (settled) return;
            settled = true;
            resolve({ body: Buffer.concat(chunks).toString('utf8'), bytes });
        });
        stream.on('aborted', () => fail(new Error('response aborted')));
        stream.on('error', fail);
        stream.on('close', () => { if (!settled) fail(new Error('response closed early')); });
    });
}

export function createTransport({ canonicalOrigin, base, report, limits = DEFAULT_LIMITS,
    lookup = (host) => dns.lookup(host, { all: true, verbatim: true }), requestOnce = nodeRequestOnce }) {
    const canonical = new URL(canonicalOrigin);
    const { production } = previewBase(base, canonical.href);
    const preview = new URL(base);
    const legacyOrigins = new Set([
        `http://${canonical.host}`,
        `https://www.${canonical.host}`,
        `http://www.${canonical.host}`
    ]);
    let requests = 0;
    let totalBytes = 0;

    function approved(url, allowLegacy) {
        const parsed = new URL(url);
        const expected = production ? canonical.origin : preview.origin;
        if (parsed.username || parsed.password || parsed.hash ||
            !(parsed.origin === expected || (production && allowLegacy && legacyOrigins.has(parsed.origin)))) {
            throw boundary(`unapproved request target ${parsed.href}`);
        }
        if (parsed.protocol !== 'https:' && !(production && allowLegacy && legacyOrigins.has(parsed.origin)) && !(!production && parsed.protocol === 'http:')) {
            throw boundary(`unapproved request scheme ${parsed.protocol}`);
        }
        return parsed;
    }

    async function pinnedAddress(parsed) {
        const host = parsed.hostname.replace(/^\[|\]$/g, '');
        const answers = net.isIP(host) ? [{ address: host }] : await lookup(host);
        if (!Array.isArray(answers) || !answers.length || answers.some(answer =>
            !(production ? publicAddress(answer.address) : loopbackAddress(answer.address)))) {
            throw boundary(`unsafe DNS answer for ${parsed.hostname}`);
        }
        return answers[0].address;
    }

    async function request(url, { allowLegacy = false } = {}) {
        let current = url;
        try {
            for (let hop = 0; hop <= limits.redirects; hop++) {
                const parsed = approved(current, allowLegacy);
                const address = await pinnedAddress(parsed);
                if (requests >= limits.requests || totalBytes >= limits.totalBytes) {
                    throw boundary('request or total-byte budget exhausted');
                }
                requests++;
                const allowance = Math.min(limits.responseBytes, limits.totalBytes - totalBytes);
                const response = await requestOnce(parsed.href, address, allowance);
                if (!Number.isSafeInteger(response.bytes) || response.bytes < 0 || response.bytes > allowance) {
                    throw boundary('response byte budget exceeded');
                }
                totalBytes += response.bytes;
                if ([301, 302, 303, 307, 308].includes(response.status) && response.headers.location) {
                    if (hop === limits.redirects) throw boundary('redirect budget exhausted');
                    current = new URL(response.headers.location, parsed).href;
                    continue;
                }
                return {
                    status: response.status,
                    ok: response.status >= 200 && response.status < 300,
                    url: parsed.href,
                    headers: { get(name) { return response.headers[name.toLowerCase()] || null; } },
                    text: async () => response.body
                };
            }
        } catch (error) {
            report(error.code === 'SEARCH_BOUNDARY' ? 'defect' : 'infrastructure', `${url}: ${error.message}`);
            return null;
        }
        return null;
    }

    return { request, stats: () => ({ requests, totalBytes }) };
}
