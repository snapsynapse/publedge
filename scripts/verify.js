#!/usr/bin/env node
'use strict';

/**
 * Knowledge-as-Code — Verification Script
 * Zero dependencies — uses only Node.js built-ins.
 *
 * Checks entity staleness (based on last_verified dates) and
 * completeness (mapping coverage, cross-reference integrity).
 *
 * Usage: node scripts/verify.js
 * Exit code 0 = all fresh, 1 = stale entities found
 */

const fs = require('fs');
const path = require('path');
const { parseYaml, parseFrontmatter } = require('./lib/parse');
const { loadMappingIndex } = require('./lib/mapping');
const { classifyUnmappedContainers, getAllowedUnmappedInstrumentIds } = require('./lib/verify-policy');

const ROOT = path.join(__dirname, '..');

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

function verify() {
    const configPath = path.join(ROOT, 'project.yml');
    if (!fs.existsSync(configPath)) {
        console.error('Error: project.yml not found.');
        process.exit(1);
    }

    const config = parseYaml(fs.readFileSync(configPath, 'utf-8'));
    const stalenessDays = parseInt(config.verification?.staleness_days || '90', 10);
    const authorityStalenessDays = parseInt(config.verification?.authority_staleness_days || stalenessDays, 10);
    const obligationStalenessDays = parseInt(config.verification?.obligation_staleness_days || stalenessDays, 10);
    const historicalDemonstrationStalenessDays = parseInt(config.verification?.historical_demonstration_staleness_days || stalenessDays, 10);
    const now = new Date();

    console.log('Knowledge Base Verification Report');
    console.log('==================================\n');
    console.log(`Staleness policy: active instruments ${stalenessDays}d; authorities ${authorityStalenessDays}d; obligations ${obligationStalenessDays}d; historical demonstrations ${historicalDemonstrationStalenessDays}d\n`);

    function thresholdFor(entity) {
        if (entity.role === (config.entities?.authority?.name || 'Authority')) return authorityStalenessDays;
        if (entity.role === (config.entities?.primary?.name || 'Primary')) return obligationStalenessDays;
        const isHistoricalDemonstration = entity.source === 'demonstration-remap' &&
            !['jia', 'rma', 'statute'].includes(entity.type);
        return isHistoricalDemonstration ? historicalDemonstrationStalenessDays : stalenessDays;
    }

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

    // Load all entity files with frontmatter
    const loadEntities = dir => {
        if (!fs.existsSync(dir)) return [];
        return fs.readdirSync(dir)
            .filter(f => f.endsWith('.md') && !f.startsWith('_'))
            .map(f => ({
                id: f.replace('.md', ''),
                file: f,
                ...parseFrontmatter(fs.readFileSync(path.join(dir, f), 'utf-8')).frontmatter
            }));
    };

    const primaries = loadEntities(primaryDir);
    const containers = loadEntities(containerDir);
    const authorities = loadEntities(authorityDir);
    const allEntities = [
        ...primaries.map(e => ({ ...e, role: config.entities?.primary?.name || 'Primary' })),
        ...containers.map(e => ({ ...e, role: config.entities?.container?.name || 'Container' })),
        ...authorities.map(e => ({ ...e, role: config.entities?.authority?.name || 'Authority' }))
    ];

    // -----------------------------------------------------------------------
    // 1. Staleness check
    // -----------------------------------------------------------------------
    console.log('--- Staleness Check ---\n');
    const staleEntities = [];
    const neverVerified = [];

    for (const entity of allEntities) {
        if (!entity.last_verified) {
            neverVerified.push(entity);
            continue;
        }
        const verifiedDate = new Date(entity.last_verified + 'T00:00:00');
        const daysSince = Math.floor((now - verifiedDate) / (1000 * 60 * 60 * 24));
        const threshold = thresholdFor(entity);
        if (daysSince > threshold) {
            staleEntities.push({ ...entity, daysSince, threshold });
        }
    }

    if (staleEntities.length > 0) {
        console.log(`STALE (${staleEntities.length}):`);
        for (const e of staleEntities) {
            console.log(`  [${e.role}] ${e.id} — last verified ${e.daysSince} days ago (${e.last_verified}); cadence ${e.threshold} days`);
        }
        console.log();
    }

    if (neverVerified.length > 0) {
        console.log(`NEVER VERIFIED (${neverVerified.length}):`);
        for (const e of neverVerified) {
            console.log(`  [${e.role}] ${e.id} — no last_verified date in frontmatter`);
        }
        console.log();
    }

    const freshCount = allEntities.length - staleEntities.length - neverVerified.length;
    console.log(`Fresh: ${freshCount}  |  Stale: ${staleEntities.length}  |  Never verified: ${neverVerified.length}\n`);

    // -----------------------------------------------------------------------
    // 2. Completeness check
    // -----------------------------------------------------------------------
    console.log('--- Completeness Check ---\n');

    const mappingFile = config.mapping?.file || 'provisions/index.yml';
    let mappingPath = path.join(dataDir, mappingFile);
    if (!fs.existsSync(mappingPath)) mappingPath = path.join(dataDir, 'mapping', 'index.yml');
    const mappings = loadMappingIndex(mappingPath);

    const primaryIds = new Set(primaries.map(p => p.id));
    const containerIds = new Set(containers.map(c => c.id));

    let completenessErrors = 0;

    // Check each container has at least one mapping, except explicitly allowed
    // relationship-only instruments that preserve amendment/supersession chains.
    const allowedUnmappedIds = getAllowedUnmappedInstrumentIds(config);
    const unmapped = classifyUnmappedContainers(containers, mappings, allowedUnmappedIds);

    for (const c of unmapped.allowed) {
        console.log(`  ALLOWED: ${config.entities?.container?.name || 'Container'} "${c.id}" has no mapping entries (relationship-only instrument)`);
    }
    if (unmapped.allowed.length > 0) {
        console.log();
    }

    for (const c of unmapped.errors) {
        console.log(`  WARNING: ${config.entities?.container?.name || 'Container'} "${c.id}" has no mapping entries`);
        completenessErrors++;
    }

    // Check each mapping references valid primaries
    for (const m of mappings) {
        for (const obl of m.obligations) {
            if (!primaryIds.has(obl)) {
                console.log(`  ERROR: Mapping "${m.id}" references unknown ${(config.entities?.primary?.name || 'primary').toLowerCase()} "${obl}"`);
                completenessErrors++;
            }
        }
        const cId = m.regulation || m.container || m.framework;
        if (cId && !containerIds.has(cId)) {
            console.log(`  ERROR: Mapping "${m.id}" references unknown ${(config.entities?.container?.name || 'container').toLowerCase()} "${cId}"`);
            completenessErrors++;
        }
    }

    if (completenessErrors === 0) {
        console.log('  All mappings valid and complete.\n');
    } else {
        console.log(`\n  ${completenessErrors} completeness issue(s) found.\n`);
    }

    // -----------------------------------------------------------------------
    // 3. Summary
    // -----------------------------------------------------------------------
    console.log('--- Summary ---\n');
    console.log(`  ${config.entities?.primary?.plural || 'Primaries'}: ${primaries.length}`);
    console.log(`  ${config.entities?.container?.plural || 'Containers'}: ${containers.length}`);
    console.log(`  ${config.entities?.authority?.plural || 'Authorities'}: ${authorities.length}`);
    console.log(`  Mappings: ${mappings.length}`);
    console.log();

    // -----------------------------------------------------------------------
    // AI-assisted verification (placeholder)
    // -----------------------------------------------------------------------
    //
    // To add model-based verification, uncomment and adapt the section below.
    // This demonstrates the pattern for sending entity content to an LLM API
    // to check factual accuracy, detect outdated information, or suggest updates.
    //
    // async function aiVerify(entity) {
    //     const prompt = `Review this ${entity.role} entity for accuracy:
    //       Title: ${entity.title || entity.id}
    //       Content: ${entity._body || '(no body)'}
    //
    //       Check for:
    //       1. Outdated facts or references
    //       2. Broken or changed URLs
    //       3. Superseded standards or regulations
    //       4. Factual inaccuracies
    //
    //       Respond with JSON: { "status": "current"|"needs_review", "issues": [] }`;
    //
    //     const response = await fetch(process.env.AI_API_URL, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': `Bearer ${process.env.AI_API_KEY}`
    //         },
    //         body: JSON.stringify({ prompt, max_tokens: 500 })
    //     });
    //     return response.json();
    // }
    //
    // To run AI verification on stale entities:
    //
    // for (const entity of staleEntities) {
    //     const result = await aiVerify(entity);
    //     console.log(`  AI review [${entity.id}]: ${result.status}`);
    //     if (result.issues?.length) {
    //         result.issues.forEach(issue => console.log(`    - ${issue}`));
    //     }
    // }

    // Exit code
    if (staleEntities.length > 0 || neverVerified.length > 0 || completenessErrors > 0) {
        const reasons = [];
        if (staleEntities.length > 0) reasons.push('stale entities');
        if (neverVerified.length > 0) reasons.push('entities missing last_verified');
        if (completenessErrors > 0) reasons.push('completeness errors');
        console.log(`Result: REVIEW NEEDED — ${reasons.join(', ')}.`);
        process.exit(1);
    }
    console.log('Result: OK — no stale, missing-verification, or completeness issues detected.');
    process.exit(0);
}

verify();
