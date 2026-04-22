#!/usr/bin/env node
'use strict';

// One-shot migration: update instrument frontmatter to new stable-ID scheme
// (us-{jur}-{auth}-{type}-YYYY-NNN) + add `instance` field + update mapping refs.
// Idempotent: re-running has no effect once the new ids are in place.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const INSTR_DIR = path.join(ROOT, 'data/examples/instruments');
const MAPPING_FILE = path.join(ROOT, 'data/examples/mapping/index.yml');
const AUTH_DIR = path.join(ROOT, 'data/examples/authorities');

// old-id (current frontmatter id) -> { newId, instance, slugKey }
const MIGRATIONS = [
    { file: 'utah-elizachat-teen-mental-health-2024.md',  oldId: 'us-ut-oaip-rma-0001',  newId: 'us-ut-oaip-rma-2024-001',           instance: '2024-001' },
    { file: 'utah-dentacor-ai-radiograph-2025.md',        oldId: 'us-ut-oaip-rma-0002',  newId: 'us-ut-oaip-rma-2025-001',           instance: '2025-001' },
    { file: 'utah-doctronic-rx-renewal-2025.md',          oldId: 'us-ut-oaip-rma-0003',  newId: 'us-ut-oaip-rma-2025-002',           instance: '2025-002' },
    { file: 'utah-legion-health-psych-refill-2026.md',    oldId: 'us-ut-oaip-rma-0004',  newId: 'us-ut-oaip-rma-2026-001',           instance: '2026-001' },
    { file: 'utah-mental-health-chatbot-disclosure-2026q2.md', oldId: 'us-ut-oaip-jia-0001', newId: 'us-ut-oaip-jia-2026-001',       instance: '2026-001' },
    { file: 'cfpb-pay-to-pay-fees-2022.md',               oldId: 'us-cfpb-ao-0001',      newId: 'us-cfpb-ao-2022-001',               instance: '2022-001' },
    { file: 'cftc-fia-cta-registration-2017.md',          oldId: 'us-cftc-il-17-65',     newId: 'us-cftc-dsio-il-2017-001',          instance: '2017-001', officialRef: 'CFTC Letter 17-65' },
    { file: 'irs-plr-202506001.md',                       oldId: 'us-irs-plr-202506001', newId: 'us-irs-chief-counsel-plr-2025-001', instance: '2025-001', officialRef: 'PLR 202506001' },
    { file: 'irs-plr-202614036.md',                       oldId: 'us-irs-plr-202614036', newId: 'us-irs-tege-plr-2026-001',          instance: '2026-001', officialRef: 'PLR 202614036' },
    { file: 'sec-latham-watkins-rule-506c-2025.md',       oldId: 'us-sec-nal-0001',      newId: 'us-sec-corpfin-nal-2025-001',       instance: '2025-001' },
];

function patchInstrument(m) {
    const fp = path.join(INSTR_DIR, m.file);
    let content = fs.readFileSync(fp, 'utf-8');

    // Skip if already migrated
    if (content.includes(`id: ${m.newId}`)) {
        console.log(`  [skip] ${m.file} already migrated`);
        return false;
    }

    // Replace id
    const idRegex = new RegExp(`^id:\\s*${m.oldId.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\s*$`, 'm');
    if (!idRegex.test(content)) {
        console.warn(`  [warn] ${m.file}: expected id "${m.oldId}" not found`);
        return false;
    }
    content = content.replace(idRegex, `id: ${m.newId}`);

    // Insert instance + official_ref after `id:` line (inside frontmatter)
    const insertLines = [`instance: "${m.instance}"`, `legacy_id: ${m.oldId}`];
    if (m.officialRef) insertLines.push(`official_ref: "${m.officialRef}"`);
    const insertBlock = insertLines.join('\n');
    content = content.replace(
        new RegExp(`^(id: ${m.newId})$`, 'm'),
        `$1\n${insertBlock}`
    );

    fs.writeFileSync(fp, content);
    console.log(`  [done] ${m.file} → ${m.newId}`);
    return true;
}

function patchMapping() {
    if (!fs.existsSync(MAPPING_FILE)) return;
    let content = fs.readFileSync(MAPPING_FILE, 'utf-8');
    let changed = false;

    // Old mapping used the descriptive filename-slug; switch to new stable id.
    // Also map any legacy ids in case they were used.
    const replacements = [
        ['utah-mental-health-chatbot-disclosure-2026q2', 'us-ut-oaip-jia-2026-001'],
        ['us-ut-oaip-jia-0001',                          'us-ut-oaip-jia-2026-001'],
    ];
    for (const [from, to] of replacements) {
        const re = new RegExp(`regulation:\\s*${from.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'g');
        if (re.test(content)) {
            content = content.replace(re, `regulation: ${to}`);
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(MAPPING_FILE, content);
        console.log('  [done] mapping/index.yml updated');
    } else {
        console.log('  [skip] mapping/index.yml already current');
    }
}

function patchAuthorityBody() {
    // Update utah-oaip.md "## Instruments" bullet list to new ids.
    const fp = path.join(AUTH_DIR, 'utah-oaip.md');
    if (!fs.existsSync(fp)) return;
    let content = fs.readFileSync(fp, 'utf-8');

    const oaipInstrs = [
        'us-ut-oaip-jia-2026-001',
        'us-ut-oaip-rma-2024-001',
        'us-ut-oaip-rma-2025-001',
        'us-ut-oaip-rma-2025-002',
        'us-ut-oaip-rma-2026-001',
    ];
    const desired = '## Instruments\n\n' + oaipInstrs.map(i => `- ${i}`).join('\n') + '\n';
    content = content.replace(/## Instruments\n[\s\S]*$/, desired);
    fs.writeFileSync(fp, content);
    console.log('  [done] authorities/utah-oaip.md body updated');
}

function addUrlSegmentToAuthorities() {
    const authMap = {
        'utah-oaip.md':          { url_segment: 'oaip',            path_jurisdiction: 'utah' },
        'cfpb.md':               { url_segment: 'cfpb',            path_jurisdiction: 'federal' },
        'cftc-dsio.md':          { url_segment: 'cftc-dsio',       path_jurisdiction: 'federal' },
        'irs-chief-counsel.md':  { url_segment: 'irs-chief-counsel', path_jurisdiction: 'federal' },
        'irs-tege.md':           { url_segment: 'irs-tege',        path_jurisdiction: 'federal' },
        'sec-corpfin.md':        { url_segment: 'sec-corpfin',     path_jurisdiction: 'federal' },
    };
    for (const [file, fields] of Object.entries(authMap)) {
        const fp = path.join(AUTH_DIR, file);
        if (!fs.existsSync(fp)) continue;
        let content = fs.readFileSync(fp, 'utf-8');
        if (content.includes('url_segment:')) {
            console.log(`  [skip] authorities/${file} already has url_segment`);
            continue;
        }
        // Insert after `jurisdiction:` line
        const insert = `url_segment: ${fields.url_segment}\npath_jurisdiction: ${fields.path_jurisdiction}`;
        content = content.replace(/^(jurisdiction:.*)$/m, `$1\n${insert}`);
        fs.writeFileSync(fp, content);
        console.log(`  [done] authorities/${file} url_segment=${fields.url_segment}`);
    }
}

console.log('Migrating instruments...');
MIGRATIONS.forEach(patchInstrument);
console.log('\nMigrating mapping/index.yml...');
patchMapping();
console.log('\nPatching authority bodies...');
patchAuthorityBody();
console.log('\nAdding url_segment to authorities...');
addUrlSegmentToAuthorities();
console.log('\nMigration complete.');
