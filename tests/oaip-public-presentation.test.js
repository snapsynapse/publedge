'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { parseFrontmatter } = require('../scripts/lib/parse');
const { upcomingItems } = require('../scripts/lib/api-projection');
const ROOT = path.join(__dirname, '..');
const ID = 'us-ut-oaip-jia-2026-001';
const FILE = `data/examples/instruments/${ID}.md`;
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const json = file => JSON.parse(read(file));
const record = () => json('docs/us/utah/oaip/jia/2026-001/record.json');

test('unissued proposal distinguishes author from intended authority in native and machine records', () => {
    const native = parseFrontmatter(read(FILE)).frontmatter;
    const endpoint = record();
    assert.equal(native.id, ID);
    assert.match(native.title, /PubLedge proposed template \(unissued\)/);
    assert.equal(native.issued_by, null);
    assert.equal(native.official_url, null);
    assert.equal(native.author_or_proponent, 'PubLedge');
    assert.match(native.intended_authority, /Utah Office/);
    assert.equal(native.status, 'proposed');
    assert.equal(native.last_verified, '2026-09-23');
    assert.equal(endpoint.record.issued_by, null);
    assert.equal(endpoint.record.intended_authority, native.intended_authority);
    assert.equal(endpoint.jsonld.author.name, 'PubLedge');
    assert.equal(endpoint.jsonld.sameAs, undefined);
    assert.equal(endpoint.jsonld.datePublished, undefined);
    const of = json(`docs/api/v1/of/records/${ID}.json`);
    assert.equal(of.issuedBy, undefined);
    assert.equal(of.embodies_determination, undefined);
});

test('provenance successor preserves the prior receipt, terms, body and review dates', () => {
    const prior = JSON.parse(execFileSync('git', ['show', 'd0100ab70cdcfbe12cf2b1a58954cfb70be66a59:data/admission/receipts.json'], { cwd: ROOT, encoding: 'utf8' })).records[FILE];
    const current = json('data/admission/receipts.json').records[FILE];
    assert.deepEqual(current.supersedes.receipt, prior);
    assert.equal(current.review.actor_type, 'agent');
    assert.equal(current.review.human_approved, undefined);
    const original = read('data/admission/sources/publedge-jia-draft-2026-10-14.md');
    const old = parseFrontmatter(original), updated = parseFrontmatter(read(FILE));
    assert.equal(old.body, updated.body);
    for (const field of ['terms', 'id', 'last_verified', 'created', 'modified', 'status', 'editorial_status']) {
        assert.deepEqual(updated.frontmatter[field], old.frontmatter[field], field);
    }
    assert.deepEqual(Object.keys(current.units).sort(), ['metadata:author_or_proponent', 'metadata:intended_authority', 'metadata:intended_authority_url', 'metadata:issued_by', 'metadata:official_url', 'metadata:title']);
});

test('proposal label survives browse, search, feeds, templates and raw export', () => {
    const label = 'PubLedge proposed template (unissued)';
    for (const file of ['instruments.html', 'us/utah/index.html', 'us/utah/oaip/index.html', 'us/utah/oaip/jia/index.html', 'us/utah/oaip/jia/2026-001/index.html', 'templates/index.html', 'feed.xml', 'atom.xml', 'feed.json', 'assets/data.json', `data/examples/instruments/${ID}.md`]) {
        assert.ok(read(`docs/${file}`).includes(label), `${file} lost proposal label`);
    }
    const summary = json('docs/api/v1/containers.json').items.find(c => c.id === ID);
    assert.equal(summary.author_or_proponent, 'PubLedge');
    assert.match(summary.intended_authority, /Utah Office/);
    assert.ok(read('docs/templates/index.html').includes('Proposed templates in the registry (unissued)'));
    assert.doesNotMatch(read('docs/us/utah/oaip/jia/index.html'), /All Joint Interpretation Agreements issued by/);
});

test('coverage review date is explicit and counts distinguish indexing from obligations', () => {
    const review = json('ops/evidence/oaip-coverage-review-2026-10-14.json');
    const utah = read('docs/us/utah/index.html');
    for (const file of ['docs/index.html', 'docs/instruments.html', 'docs/us/utah/index.html']) {
        assert.match(read(file), /Coverage is partial/);
        assert.doesNotMatch(read(file), /continuously current|tamper-evident implementation/);
    }
    assert.ok(utah.includes(`datetime="${review.review_date}"`));
    for (const name of review.not_yet_indexed) assert.ok(utah.includes(name));
    assert.match(read('docs/index.html'), /Mapping entries/);
    assert.match(read('docs/instruments.html'), /Zero means no clause-level sections indexed/);
    const doc = json('docs/api/v1/containers.json').items.find(c => c.id === 'us-ut-oaip-rma-2025-002');
    assert.equal(doc.provision_count, 0);
    assert.match(doc.provision_count_scope, /zero does not mean no obligations/);
    const mappings = json('docs/api/v1/mappings.json').items;
    assert.ok(mappings.some(m => m.regulation === doc.id && m.obligations.length));
});

test('Doctronic notice promotes a dated observation without renewing verification or contractual permissions', () => {
    const page = read('docs/us/utah/oaip/rma/2025-002/index.html');
    assert.ok(page.indexOf('Dated operational status, separate from contractual permission.') < page.indexOf('Obligations</h3>'));
    assert.match(page, /retrieved 2026-09-24 \(UTC\)/);
    assert.match(page, /Phase 2 has not been approved/);
    assert.match(page, /amendment&#39;s|amendment's/);
    const doc = json('docs/us/utah/oaip/rma/2025-002/record.json').record;
    assert.equal(doc.last_verified, '2026-09-23');
    assert.equal(doc.effective, '2025-10-24');
});

test('a forged future effective date cannot turn an original draft into an operational milestone', () => {
    const draft = parseFrontmatter(read(FILE)).frontmatter;
    const promoted = { ...draft, effective: '2099-01-01', term_end: '2099-12-31', status: 'enforcing' };
    assert.deepEqual(upcomingItems([promoted], { today: '2026-10-14', siteUrl: 'https://publedge.org', href: () => '/draft/' }), []);
    assert.ok(!read('docs/calendar.ics').includes(`UID:${ID}-`));
});
