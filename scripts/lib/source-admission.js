'use strict';

// Local deterministic traceability. Passing does not establish legal truth.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { parseFrontmatter, parseYaml } = require('./parse');
const { parseMappingIndex } = require('./mapping');

const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const digest = value => hash(JSON.stringify(canonical(value)));
function requireValue(ok, message) { if (!ok) throw new Error(message); }
function nonempty(value, name) { requireValue(typeof value === 'string' && value.trim(), `${name} must be nonempty`); return value; }
function sha256(value, name) { requireValue(typeof value === 'string' && /^[a-f0-9]{64}$/.test(value), `${name} must be SHA-256`); }
function validTimestamp(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) &&
        Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 19) === value.slice(0, 19);
}
function safePath(value) {
    nonempty(value, 'path');
    requireValue(!path.isAbsolute(value) && !value.includes('\\') && value.split('/').every(part => part && part !== '.' && part !== '..'), `Unsafe evidence path: ${value}`);
    return value;
}
function readRegular(root, relative) {
    safePath(relative);
    let current = root;
    for (const part of relative.split('/')) {
        current = path.join(current, part);
        requireValue(!fs.lstatSync(current).isSymbolicLink(), `Symlink evidence is forbidden: ${relative}`);
    }
    requireValue(fs.statSync(current).isFile(), `Not a regular evidence file: ${relative}`);
    return fs.readFileSync(current);
}
function officialUrl(value, observed = false) {
    let url;
    try { url = new URL(value); } catch { throw new Error('Evidence official_url must be HTTPS'); }
    requireValue(url.protocol === 'https:' && !url.username && !url.password && (observed || !url.hostname.startsWith('www.')), 'Evidence official_url must use bare HTTPS without credentials');
    requireValue(url.hostname !== 'publedge.org' && !url.hostname.endsWith('.publedge.org'), 'PubLedge generated surfaces cannot serve as primary admission evidence');
}

function markdownSnapshot(text) {
    const normalized = text.replace(/\r\n/g, '\n');
    const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
    requireValue(match, 'Protected Markdown requires YAML frontmatter');
    const metadata = parseFrontmatter(normalized).frontmatter;
    requireValue(metadata && typeof metadata === 'object' && !Array.isArray(metadata), 'Invalid Markdown frontmatter');
    const units = {};
    function add(key, content) {
        requireValue(!Object.hasOwn(units, key), `Duplicate admission unit: ${key}`);
        units[key] = { sha256: digest(content), content };
    }
    for (const key of Object.keys(metadata).sort()) add(`metadata:${key}`, metadata[key]);
    let heading = 'preamble';
    let parent = '';
    let chunk = [];
    function flush() {
        const remaining = [];
        let propertyTable = false;
        for (const line of chunk) {
            if (/^\s*\|\s*Property\s*\|\s*Value\s*\|\s*$/.test(line)) propertyTable = true;
            else if (propertyTable && !/^\s*\|/.test(line)) propertyTable = false;
            if (propertyTable) {
                const row = line.match(/^\s*\|\s*([^|]+?)\s*\|(.*)\|\s*$/);
                if (row && row[1] !== 'Property' && !/^[- :]+$/.test(row[1])) {
                    if (row[1] !== 'Checked') add(`${heading}/property:${row[1]}`, row[2].trim());
                    continue;
                }
            }
            remaining.push(line);
        }
        const content = remaining.join('\n').trim();
        if (content) add(`${heading}/text`, content);
    }
    for (const line of normalized.slice(match[0].length).split('\n')) {
        const found = line.match(/^(#{2,3}) (.+)$/);
        if (!found) { chunk.push(line); continue; }
        flush();
        chunk = [];
        if (found[1].length === 2) { parent = found[2]; heading = `section:${parent}`; }
        else heading = `section:${parent}/subsection:${found[2]}`;
    }
    flush();
    const hashes = Object.fromEntries(Object.entries(units).map(([key, unit]) => [key, unit.sha256]));
    return { sha256: digest(hashes), units, metadata };
}
function unitHashes(snapshot) { return Object.fromEntries(Object.entries(snapshot.units).map(([key, unit]) => [key, unit.sha256])); }
function nativeSnapshot(filename, bytes) {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if (filename.endsWith('.md')) return markdownSnapshot(text);
    const data = filename === 'data/examples/mapping/index.yml'
        ? parseMappingIndex(text)
        : filename.endsWith('.json') ? JSON.parse(text) : parseYaml(text);
    const units = {};
    if (Array.isArray(data)) {
        data.forEach((entry, index) => {
            const key = entry && typeof entry.id === 'string' ? `entry:${entry.id}` : `entry:${index}`;
            requireValue(!Object.hasOwn(units, key), `Duplicate source entry ${key}`);
            units[key] = { sha256: digest(entry), content: entry };
        });
    } else units.document = { sha256: digest(data), content: data };
    return { sha256: digest(Object.fromEntries(Object.entries(units).map(([key, unit]) => [key, unit.sha256]))), units, metadata: {} };
}
function protectedPath(filename) {
    return /^data\/examples\/(?:instruments|obligations|authorities)\/[^/]+\.md$/.test(filename) || filename === 'data/examples/mapping/index.yml';
}
function packetDigest(receipt) {
    const packet = structuredClone(receipt);
    if (packet.review) delete packet.review.packet_sha256;
    return digest(packet);
}
function primaryPath(value) {
    safePath(value);
    requireValue(value.startsWith('data/admission/sources/'), 'Admission evidence must be retained under data/admission/sources, not native or generated output');
    return value;
}
function validateEvidence(evidence, read, now = new Date()) {
    requireValue(evidence && typeof evidence === 'object' && !Array.isArray(evidence), 'Evidence must be an object');
    for (const field of ['snapshot_path', 'document_id', 'document_title', 'issuing_body', 'document_type', 'version', 'locator', 'excerpt']) nonempty(evidence[field], `evidence.${field}`);
    officialUrl(evidence.official_url);
    sha256(evidence.snapshot_sha256, 'evidence.snapshot_sha256');
    requireValue(['retained_snapshot', 'primary_retrieval'].includes(evidence.acquisition), 'Evidence acquisition must be explicit');
    const snapshot = read(primaryPath(evidence.snapshot_path));
    requireValue(hash(snapshot) === evidence.snapshot_sha256, `Reviewed source snapshot changed: ${evidence.snapshot_path}`);
    const text = new TextDecoder('utf-8', { fatal: true }).decode(snapshot);
    requireValue(text.includes(evidence.excerpt), `Supporting excerpt absent from ${evidence.snapshot_path}`);
    requireValue(evidence.excerpt.trim().length >= 20, 'Supporting excerpt is too short to review');
    requireValue(Array.isArray(evidence.identity_excerpts) && evidence.identity_excerpts.length > 0, 'Document identity excerpts required');
    for (const excerpt of evidence.identity_excerpts) {
        nonempty(excerpt, 'identity excerpt');
        requireValue(text.includes(excerpt), `Document identity excerpt absent from ${evidence.snapshot_path}`);
    }
    requireValue(evidence.original && typeof evidence.original === 'object', 'Exact retained original source bytes are required');
    primaryPath(evidence.original.path);
    sha256(evidence.original.sha256, 'evidence.original.sha256');
    requireValue(hash(read(evidence.original.path)) === evidence.original.sha256, 'Original source bytes changed');
    if (evidence.acquisition === 'primary_retrieval') {
        requireValue(evidence.retrieval && Number.isInteger(evidence.retrieval.http_status) && evidence.retrieval.http_status >= 200 && evidence.retrieval.http_status < 300, 'Primary retrieval needs successful HTTP metadata');
        requireValue(validTimestamp(evidence.retrieval.retrieved_at), 'Invalid retrieval timestamp');
        requireValue(Date.parse(evidence.retrieval.retrieved_at) <= now.getTime(), 'Retrieval timestamp cannot be in the future');
        officialUrl(evidence.retrieval.final_url, true);
        nonempty(evidence.retrieval.content_type, 'retrieval.content_type');
    } else requireValue(!Object.hasOwn(evidence, 'retrieval'), 'Retained snapshot must not invent transport metadata');
}
function isVerifiedUnit(key) {
    return key === 'metadata:last_verified' || key === 'metadata:review_date' || /\/property:(?:Verified|Last verified)$/.test(key);
}
function isIssuanceEvidence(evidence) {
    const type = String(evidence?.document_type || '').trim().toLowerCase();
    const identity = [evidence?.document_title, ...(evidence?.identity_excerpts || [])].join(' ').toLowerCase();
    if (/\b(?:proposal|draft|complaint|press release|news coverage)\b/.test(`${type} ${identity}`)) return false;
    const eligibleType = /^(?:(?:issued|executed|signed) agreement|enactment|enacted (?:statute|legislation|law)|official (?:order|decision|letter|notice|determination|agreement|authority instrument)|authority-issued instrument)$/.test(type);
    const identityShowsIssuance = /\b(?:issued|executed|signed|enacted|official notice|order|decision|determination|agreement)\b/.test(identity);
    return eligibleType && identityShowsIssuance;
}
function validateAdmission({ current, legacy, admissions, read, now = new Date() }) {
    requireValue(legacy.version === 1 && admissions.version === 1, 'Unknown admission contract version');
    requireValue(legacy.status === 'legacy-unreviewed', 'Historical corpus must remain explicitly legacy-unreviewed');
    const errors = [];
    const emitted = {};
    let legacyCount = 0;
    let reviewedCount = 0;
    let changedUnits = 0;
    const attempt = (where, action) => { try { action(); } catch (error) { errors.push(`${where}: ${error.message}`); } };
    for (const filename of Object.keys(legacy.records)) if (!Object.hasOwn(current, filename)) errors.push(`${filename}: legacy record removal requires a separately reviewed retirement migration`);
    for (const filename of Object.keys(admissions.records)) if (!Object.hasOwn(current, filename)) errors.push(`${filename}: admission references a missing record`);
    for (const [filename, snapshot] of Object.entries(current)) attempt(filename, () => {
        const previous = legacy.records[filename];
        const receipt = admissions.records[filename];
        if (!receipt && previous?.sha256 === snapshot.sha256) {
            legacyCount++;
            emitted[filename] = { record_sha256: snapshot.sha256, admission_status: 'legacy-unreviewed' };
            return;
        }
        requireValue(receipt, 'Changed/new source information requires an admission receipt');
        requireValue(receipt.record_sha256 === snapshot.sha256, 'Receipt is stale for current record');
        requireValue(receipt.baseline_sha256 === (previous?.sha256 || null), 'Wrong historical input binding');
        requireValue(receipt.whole_record?.before_sha256 === (previous?.sha256 || null) && receipt.whole_record?.after_sha256 === snapshot.sha256, 'Whole-record before/after binding is stale');
        requireValue(receipt.review?.packet_sha256 === packetDigest(receipt), 'Review packet changed after acceptance');
        requireValue(['agent', 'human'].includes(receipt.review?.actor_type), 'Explicit reviewer type required');
        nonempty(receipt.review.actor, 'review.actor');
        requireValue(validTimestamp(receipt.review.reviewed_at), 'Invalid review timestamp');
        requireValue(Date.parse(receipt.review.reviewed_at) <= now.getTime(), 'Review timestamp cannot be in the future');
        requireValue(receipt.review.decision === 'source-consistency-reviewed', 'Pending/rejected review cannot admit a record');
        nonempty(receipt.review.scope, 'review.scope');
        requireValue(Array.isArray(receipt.unresolved), 'Unresolved conflicts must be explicit');
        requireValue(receipt.units && typeof receipt.units === 'object' && !Array.isArray(receipt.units), 'Unit reviews required');
        const changed = [...new Set([...Object.keys(previous?.units || {}), ...Object.keys(snapshot.units)])].filter(key => previous?.units[key] !== snapshot.units[key]?.sha256);
        requireValue(changed.length > 0, 'Receipt cannot relabel unchanged legacy information as reviewed');
        const usedEvidence = new Set();
        const reviewedEvidence = [];
        for (const key of changed) {
            const review = receipt.units[key];
            requireValue(review, `Unreviewed changed unit: ${key}`);
            requireValue(review.before_sha256 === (previous?.units[key] || null) && review.after_sha256 === (snapshot.units[key]?.sha256 || null), `Stale unit review: ${key}`);
            requireValue(Object.hasOwn(review, 'candidate_content') && digest(review.candidate_content) === digest(snapshot.units[key]?.content ?? null), `Review displays stale candidate content: ${key}`);
            nonempty(review.reason, 'unit reason');
            for (const qualifier of ['scope', 'exceptions', 'time']) nonempty(review.qualifications?.[qualifier], `unit qualifications.${qualifier}`);
            requireValue(Array.isArray(review.evidence) && review.evidence.length > 0, `Missing supporting evidence: ${key}`);
            for (const reference of review.evidence) {
                const evidence = typeof reference === 'string' ? receipt.evidence?.[reference] : reference;
                if (typeof reference === 'string') usedEvidence.add(reference);
                validateEvidence(evidence, read, now);
                reviewedEvidence.push(evidence);
            }
            if (isVerifiedUnit(key)) requireValue(receipt.review.actor_type === 'human', 'Agent source consistency review cannot renew Verified');
            changedUnits++;
        }
        for (const key of Object.keys(receipt.units)) requireValue(changed.includes(key), `Extraneous or stale unit acceptance: ${key}`);
        for (const key of Object.keys(receipt.evidence || {})) requireValue(usedEvidence.has(key), `Unreferenced evidence in review packet: ${key}`);
        const issuanceClaimChanged = changed.some(key => [
            'metadata:source', 'metadata:editorial_status', 'metadata:status', 'metadata:issuance_event', 'metadata:enacted'
        ].includes(key));
        const claimsCurrentIssuance = snapshot.metadata.source === 'authority-issued' &&
            (snapshot.metadata.editorial_status === 'published' || snapshot.metadata.status === 'enforcing');
        if (issuanceClaimChanged && claimsCurrentIssuance) {
            requireValue(reviewedEvidence.some(isIssuanceEvidence), 'Authority-issued publication/enforcement claims require an issued agreement, enactment, official order, or official authority instrument; proposals, drafts, complaints, and press coverage are insufficient');
        }
        requireValue(!receipt.review.human_approved || receipt.review.actor_type === 'human', 'Agent cannot assert human approval');
        reviewedCount++;
        emitted[filename] = { record_sha256: snapshot.sha256, admission_status: 'reviewed-changes', review_packet_sha256: receipt.review.packet_sha256 };
    });
    const total = Object.keys(current).length;
    if (legacyCount + reviewedCount !== total) errors.push(`Admission accounting mismatch: ${legacyCount} legacy + ${reviewedCount} reviewed != ${total} total`);
    return {
        status: errors.length ? 'failed' : 'passed',
        total_records: total,
        legacy_unreviewed_records: legacyCount,
        records_with_reviewed_changes: reviewedCount,
        changed_units_reviewed: changedUnits,
        errors,
        limits: 'Traceability and declared review only; no automatic legal truth, completeness, authenticated reviewer identity, or currentness certification.',
        emitted
    };
}
function validateRuntimeSeal({ current, legacy, admissions }) {
    const errors = [];
    for (const [filename, snapshot] of Object.entries(current)) {
        const previous = legacy.records[filename];
        const receipt = admissions.records[filename];
        if (previous?.sha256 === snapshot.sha256 && !receipt) continue;
        if (!receipt) { errors.push(`${filename}: unsealed source change`); continue; }
        if (receipt.record_sha256 !== snapshot.sha256 || receipt.whole_record?.after_sha256 !== snapshot.sha256 || receipt.review?.packet_sha256 !== packetDigest(receipt) || receipt.review?.decision !== 'source-consistency-reviewed') errors.push(`${filename}: stale runtime admission seal`);
    }
    return { status: errors.length ? 'failed' : 'passed', errors };
}

module.exports = { hash, digest, safePath, readRegular, markdownSnapshot, nativeSnapshot, unitHashes, protectedPath, packetDigest, validateEvidence, validateAdmission, validateRuntimeSeal, isIssuanceEvidence };
