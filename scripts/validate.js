#!/usr/bin/env node
'use strict';

/**
 * Knowledge-as-Code — Cross-Reference Validator
 * Validates that all references between entities are consistent.
 *
 * Usage: node scripts/validate.js
 */

const fs = require('fs');
const path = require('path');
const { parseYaml, parseFrontmatter } = require('./lib/parse');
const { loadMappingIndex } = require('./lib/mapping');

const ROOT = path.join(__dirname, '..');

function validate() {
    const configPath = path.join(ROOT, 'project.yml');
    if (!fs.existsSync(configPath)) {
        console.error('Error: project.yml not found.');
        process.exit(1);
    }

    const config = parseYaml(fs.readFileSync(configPath, 'utf-8'));
    console.log('Validating cross-references...\n');

    // Find data directory
    const dataDirs = ['data/examples', 'data'];
    let dataDir;
    for (const d of dataDirs) {
        if (fs.existsSync(path.join(ROOT, d))) { dataDir = path.join(ROOT, d); break; }
    }
    if (!dataDir) { console.error('No data directory found.'); process.exit(1); }

    const primaryDir = path.join(dataDir, config.entities?.primary?.directory || 'primary');
    const containerDir = path.join(dataDir, config.entities?.container?.directory || 'container');
    const authorityDir = path.join(dataDir, config.entities?.authority?.directory || 'authority');

    // Load IDs
    const loadIds = dir => {
        if (!fs.existsSync(dir)) return [];
        return fs.readdirSync(dir).filter(f => f.endsWith('.md') && !f.startsWith('_')).map(f => f.replace('.md', ''));
    };

    const primaryIds = loadIds(primaryDir);
    const containerIds = loadIds(containerDir);
    const authorityIds = loadIds(authorityDir);

    console.log(`  ${config.entities?.primary?.plural || 'Primaries'}: ${primaryIds.length}`);
    console.log(`  ${config.entities?.container?.plural || 'Containers'}: ${containerIds.length}`);
    console.log(`  ${config.entities?.authority?.plural || 'Authorities'}: ${authorityIds.length}`);

    // Load mapping
    const mappingFile = config.mapping?.file || 'provisions/index.yml';
    let mappingPath = path.join(dataDir, mappingFile);
    if (!fs.existsSync(mappingPath)) mappingPath = path.join(dataDir, 'mapping', 'index.yml');
    const mappings = loadMappingIndex(mappingPath);
    console.log(`  Mappings: ${mappings.length}`);

    let errors = 0;

    // Validate mapping references
    for (const m of mappings) {
        if (m.regulation && !containerIds.includes(m.regulation)) {
            console.error(`  ERROR: Mapping "${m.id}" references unknown container "${m.regulation}"`);
            errors++;
        }
        for (const obl of m.obligations) {
            if (!primaryIds.includes(obl)) {
                console.error(`  ERROR: Mapping "${m.id}" references unknown primary "${obl}"`);
                errors++;
            }
        }
        if (m.authority && !authorityIds.includes(m.authority)) {
            console.error(`  ERROR: Mapping "${m.id}" references unknown authority "${m.authority}"`);
            errors++;
        }
    }

    // Validate container authority references + v0.2 frontmatter-spec cross-field rules
    const PUBLISHED_LIKE = new Set(['published', 'enforcing', 'enacted']);
    const WITHDRAWAL_FIELDS = ['withdrawn_date', 'withdrawal_reason', 'withdrawn_by_instrument'];
    const BLANK = v => v === undefined || v === null || /^(null|n\/a|tbd|)$/i.test(String(v).trim());

    for (const cId of containerIds) {
        const content = fs.readFileSync(path.join(containerDir, `${cId}.md`), 'utf-8');
        const { frontmatter: fm } = parseFrontmatter(content);
        if (fm.authority && !authorityIds.includes(fm.authority)) {
            console.error(`  ERROR: Container "${cId}" references unknown authority "${fm.authority}"`);
            errors++;
        }

        // v0.2: source × status consistency
        if (fm.source === 'publedge-original-draft' && PUBLISHED_LIKE.has(String(fm.status || '').trim())) {
            console.error(`  ERROR: "${cId}" has source=publedge-original-draft with status=${fm.status} — originals cannot reach a published-like status without authority sign-off (which would change source to authority-issued).`);
            errors++;
        }

        // v0.2: RMA required-fields guard (non-blocking warn if absent)
        if (fm.type === 'rma') {
            const hasIssuer = fm.issuing_authority || fm.enforcement_authority || /^\s*parties:/m.test(content);
            if (!hasIssuer) {
                console.error(`  ERROR: RMA "${cId}" missing issuing_authority / enforcement_authority / parties.`);
                errors++;
            }
            if (BLANK(fm.term_start) && BLANK(fm.commencement_date_trigger)) {
                console.error(`  ERROR: RMA "${cId}" missing term_start (or commencement_date_trigger for deferred-commencement RMAs).`);
                errors++;
            }
        }

        // v0.2: PLR/revenue-ruling require redaction_level
        if ((fm.type === 'private-letter-ruling' || fm.type === 'revenue-ruling') && BLANK(fm.redaction_level)) {
            console.error(`  ERROR: "${cId}" type=${fm.type} requires redaction_level (none | partial | full).`);
            errors++;
        }

        // v0.2: withdrawal triplet all-or-nothing
        const setCount = WITHDRAWAL_FIELDS.filter(k => !BLANK(fm[k])).length;
        if (setCount > 0 && setCount < WITHDRAWAL_FIELDS.length) {
            console.error(`  ERROR: "${cId}" has partial withdrawal triplet — withdrawn_date, withdrawal_reason, and withdrawn_by_instrument must be set together.`);
            errors++;
        }
    }

    if (errors > 0) {
        console.error(`\n${errors} validation error${errors !== 1 ? 's' : ''} found.`);
        process.exit(1);
    }

    console.log('\nAll cross-references valid.');
}

validate();
