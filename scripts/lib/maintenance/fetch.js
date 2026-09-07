'use strict';
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFile } = require('node:child_process');
const run = require('node:util').promisify(execFile);
async function extractPdf(bytes) {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'publedge-monitor-pdf-'));
    try {
        const file = path.join(directory, 'source.pdf'); await fs.writeFile(file, bytes);
        const result = await run('pdftotext', ['-raw', file, '-'], { encoding: 'utf8', timeout: 20000, maxBuffer: 12000000 });
        if (!result.stdout.trim()) throw new Error('PDF extraction returned empty text');
        return result.stdout;
    } finally { await fs.rm(directory, { recursive: true, force: true }); }
}
async function fetchPublication(url, { fetchImpl = fetch, decodePdf = extractPdf, timeoutMs = 30000, maxBytes = 20000000 } = {}) {
    const initial = new URL(url);
    if (initial.protocol !== 'https:' || initial.username || initial.password || initial.port) throw new Error('Unexpected publication URL');
    const allowedHost = initial.hostname.replace(/^www\./, '');
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs);
    let current = url, httpStatus = null, bytesReceived = 0;
    try {
        for (let hop = 0; hop <= 3; hop++) {
            const response = await fetchImpl(current, { redirect: 'manual', signal: controller.signal,
                headers: { Accept: 'application/atom+xml,application/pdf,text/html;q=0.9', 'User-Agent': 'PubLedge-monitor/1.0 (+https://publedge.org/)' } });
            httpStatus = response.status;
            if ([301,302,303,307,308].includes(response.status)) {
                const location = response.headers.get('location'); await response.body?.cancel();
                if (!location) throw new Error('Publication redirect missing location');
                const target = new URL(location, current);
                if (target.protocol !== 'https:' || target.hostname.replace(/^www\./, '') !== allowedHost || target.username || target.password || target.port) throw new Error('Unexpected publication redirect');
                current = target.href; continue;
            }
            let size = 0; const chunks = [];
            if (response.body) for await (const chunk of response.body) {
                size += chunk.length; bytesReceived = size; if (size > maxBytes) { controller.abort(); throw new Error('Publication exceeds response-size bound'); }
                chunks.push(Buffer.from(chunk));
            }
            const rawBody = Buffer.concat(chunks), contentType = response.headers.get('content-type') || '';
            const pdf = rawBody.subarray(0, 5).toString() === '%PDF-';
            const output = { rawBody, httpStatus: response.status, contentType, retrievedUrl: current,
                retrievedAt: new Date().toISOString(), rawContentHash: crypto.createHash('sha256').update(rawBody).digest('hex'), bytes: rawBody.length,
                format: pdf ? 'pdf' : 'text', body: pdf ? '' : rawBody.toString('utf8') };
            if (pdf && response.status === 200) {
                try { output.body = await decodePdf(rawBody); output.extraction = 'pdftotext -raw'; }
                catch (error) { output.extractionError = error.message; }
            }
            return output;
        }
        throw new Error('Publication redirect bound exceeded');
    } catch (error) {
        error.receipt = { retrievedUrl: current, retrievedAt: new Date().toISOString(), httpStatus, bytesReceived, status: 'failed', failureReason: error.message };
        throw error;
    } finally { clearTimeout(timer); }
}
module.exports = { fetchPublication, extractPdf };
