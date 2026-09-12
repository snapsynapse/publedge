'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseFrontmatter } = require('../scripts/lib/parse');

const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(ROOT, 'data/examples/instruments/us-ut-oaip-rma-2025-002.md');

test('Doctronic outcome statistics remain a dated observation outside issued terms', () => {
    const markdown = fs.readFileSync(SOURCE, 'utf8');
    const { frontmatter, body } = parseFrontmatter(markdown);
    assert.equal(frontmatter.status, 'enforcing');
    assert.equal(frontmatter.last_verified, '2026-06-04');
    assert.equal(frontmatter.effective, '2025-10-24');
    assert.equal(frontmatter.term_start, '2025-10-24');
    assert.equal(frontmatter.term_end, '2026-10-24');
    assert.equal(frontmatter.official_url, 'https://commerce.utah.gov/ai/regulatory-relief-4/authorized-pilots/doctronic/');
    assert.match(body, /## Operational observation \(not an issued term\)/);
    assert.match(body, /Within that 72% subset, the first reviewing physician agreed renewal was appropriate in 91% of cases/);
    assert.match(body, /either the first or second physician found renewal appropriate in 97% of that recommendation subset/);
    assert.match(body, /remaining 28% of all cases[\s\S]*69% of that escalation subset/);
    assert.match(body, /does not establish a later phase, compliance, extension, termination, or the pilot's current phase or status/);
    assert.match(body, /Phase 2 transition criteria were updated from 250 prescriptions total to 250 medications in each medication group/);
    assert.match(body, /explicit source conflict; it does not establish the amendment mechanism or effective date/);
    assert.match(body, /https:\/\/commerce\.utah\.gov\/wp-content\/uploads\/2026\/05\/Doctronic-Outcomes-May-2026\.pdf/);

    const issuedTerms = JSON.stringify(frontmatter.mitigations || []);
    for (const statistic of ['72%', '91%', '97%', '69%']) assert.doesNotMatch(issuedTerms, new RegExp(statistic));
    const obligations = fs.readdirSync(path.join(ROOT, 'data/examples/obligations'))
        .filter(name => name.endsWith('.md'))
        .map(name => fs.readFileSync(path.join(ROOT, 'data/examples/obligations', name), 'utf8'))
        .join('\n');
    for (const statistic of ['72%', '91%', '97%', '69%']) assert.doesNotMatch(obligations, new RegExp(statistic));
});

test('generated Doctronic record preserves the source status and dated observation boundary', () => {
    const record = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/us/utah/oaip/rma/2025-002/record.json'), 'utf8'));
    assert.equal(record.record.status, 'enforcing');
    assert.equal(record.record.last_verified, '2026-06-04');
    assert.equal(record.record.effective, '2025-10-24');
    assert.equal(record.meta.admission.status, 'reviewed-changes');
    const page = fs.readFileSync(path.join(ROOT, 'docs/us/utah/oaip/rma/2025-002/index.html'), 'utf8');
    assert.match(page, /Operational observation \(not an issued term\)/);
    assert.match(page, /97% of that recommendation subset/);
});
