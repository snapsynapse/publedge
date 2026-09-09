#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter } = require('./lib/parse');
const { ROOT, reportFailures } = require('./lib/eval-kit');

const instrumentPath = 'data/examples/instruments/us-ut-oaip-rma-2024-001.md';
const phasePath = 'data/examples/obligations/elizachat-phased-rollout.md';
const harmReportPath = 'data/examples/obligations/rma-incident-notification-24hr.md';
const receiptPath = 'ops/evidence/elizachat-source-review-2026-09-08.json';

const read = relativePath => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

function extractSection(markdown, heading) {
    const lines = markdown.split('\n');
    const start = lines.findIndex(line => line.trim() === `## ${heading}`);
    if (start === -1) return '';
    const nextHeading = lines.slice(start + 1).findIndex(line => /^##\s+/.test(line));
    const end = nextHeading === -1 ? lines.length : start + 1 + nextHeading;
    return lines.slice(start + 1, end).join('\n').trim();
}

function matchingLine(section, label) {
    return section.split('\n').find(line => line.startsWith(label)) || '';
}

function validateInstrumentClaims(markdown) {
    const issues = [];
    const { frontmatter } = parseFrontmatter(markdown);
    const mitigations = Array.isArray(frontmatter.mitigations) ? frontmatter.mitigations.map(String) : [];
    const phaseMitigation = mitigations.find(value => /three-phased rollout/i.test(value)) || '';
    const cureMitigation = mitigations.find(value => /incident-cure procedure/i.test(value)) || '';
    const harmMitigation = mitigations.find(value => /within 24 hours/i.test(value) && /harm/i.test(value)) || '';

    if (!/commences? with[\s\S]*Phase One/i.test(phaseMitigation)) issues.push('frontmatter.phase.commencement');
    if (!/each subsequent phase[\s\S]*written approval/i.test(phaseMitigation)) issues.push('frontmatter.phase.subsequent');
    if (/each phase[\s\S]*written approval/i.test(phaseMitigation)) issues.push('frontmatter.phase.each');

    if (!/immediately report any activity constituting an incident/i.test(cureMitigation)) issues.push('frontmatter.cure.immediate');
    if (/24 hours/i.test(cureMitigation)) issues.push('frontmatter.cure.clock');
    if (!/good-faith efforts? to remediate[\s\S]*(?:and to )?avoid repeat incidents/i.test(cureMitigation)) {
        issues.push('frontmatter.cure.good-faith');
    }
    if (!/within 24 hours of any incident that results in harm/i.test(harmMitigation)) issues.push('frontmatter.harm.clock-trigger');

    const summary = extractSection(markdown, 'Summary');
    if (!/immediately report/i.test(summary)) issues.push('summary.cure.immediate');
    if (!/within 24 hours[\s\S]*results in harm/i.test(summary)) issues.push('summary.harm.clock-trigger');
    if (!/good-faith effort to follow the curing procedure/i.test(summary) ||
        !/good-faith efforts to remediate[\s\S]*avoid repeat incidents/i.test(summary)) {
        issues.push('summary.cure.good-faith');
    }
    if (!/separate reporting clause/i.test(summary)) issues.push('summary.reporting.separation');

    const mitigationSection = extractSection(markdown, 'Regulatory mitigation granted (Schedule A, §XV)');
    const rolloutRow = matchingLine(mitigationSection, '| Rollout permission |');
    const cureRow = matchingLine(mitigationSection, '| Incident-cure forbearance |');
    if (!/commences with Phase One/i.test(rolloutRow) || !/each subsequent phase[\s\S]*written approval/i.test(rolloutRow)) {
        issues.push('table.phase.condition');
    }
    if (/each phase[\s\S]*written approval/i.test(rolloutRow)) issues.push('table.phase.each');
    if (!/good-faith effort to follow the curing procedure/i.test(cureRow) ||
        !/immediate reporting/i.test(cureRow) ||
        !/good-faith efforts to remediate[\s\S]*avoid repeat incidents/i.test(cureRow)) {
        issues.push('table.cure.conditions');
    }

    const obligations = extractSection(markdown, 'Obligations summary (Section VI and Schedule A §XV–XVI)');
    if (!/Immediate reporting to OAIP of any activity constituting a Schedule A incident/i.test(obligations)) {
        issues.push('obligations.cure.immediate');
    }
    if (!/24-hour incident notification to OAIP for any harm to health, safety, or financial well-being/i.test(obligations)) {
        issues.push('obligations.harm.clock-trigger');
    }

    const sources = extractSection(markdown, 'Sources');
    const receiptUrl = 'https://github.com/snapsynapse/publedge/blob/main/ops/evidence/elizachat-source-review-2026-09-08.json';
    if (!sources.includes(`[Source review receipt](${receiptUrl})`)) issues.push('sources.review-receipt');

    return issues;
}

function requireNoIssues(failures, label, issues) {
    for (const issue of issues) failures.push(`${label}: ${issue}`);
}

function requireMutationCaught(failures, label, markdown, expectedIssues) {
    const actual = new Set(validateInstrumentClaims(markdown));
    for (const expected of expectedIssues) {
        if (!actual.has(expected)) failures.push(`${label} mutation escaped expected check: ${expected}`);
    }
}

function run() {
    const instrument = read(instrumentPath);
    const phase = read(phasePath);
    const harmReport = read(harmReportPath);
    const failures = [];

    requireNoIssues(failures, 'instrument source-fidelity claim', validateInstrumentClaims(instrument));
    const sourcesAsLastSection = instrument.replace(/\n## Notes on this demonstration remap[\s\S]*$/, '');
    requireNoIssues(
        failures,
        'last-section extraction',
        validateInstrumentClaims(sourcesAsLastSection)
    );

    requireMutationCaught(
        failures,
        'trigger-clock',
        instrument.replace(
            'immediately report any activity constituting an incident',
            'report within 24 hours about activity constituting an incident'
        ),
        ['frontmatter.cure.immediate', 'frontmatter.cure.clock']
    );
    requireMutationCaught(
        failures,
        'phase-condition',
        instrument.replace('each subsequent phase requires OAIP written approval', 'each phase requires OAIP written approval'),
        ['frontmatter.phase.subsequent', 'frontmatter.phase.each']
    );
    requireMutationCaught(
        failures,
        'cure-qualification',
        instrument.replace(
            'make good-faith efforts to remediate the incident and resulting harm and to avoid repeat incidents',
            'remediate the incident and resulting harm and avoid repeat incidents'
        ),
        ['frontmatter.cure.good-faith']
    );

    if (!phase.includes('written OAIP approval required before advancing to each subsequent phase')) {
        failures.push('linked phase obligation must preserve the subsequent-phase condition');
    }
    if (/written OAIP approval required for each phase/i.test(phase)) {
        failures.push('linked phase obligation must not condition Phase One on written approval');
    }
    if (!harmReport.includes('within 24 hours of any incident that results in harm to the health, safety, or financial well-being of a user')) {
        failures.push('linked harm-report obligation must preserve the harm trigger and 24-hour clock');
    }
    if (/within 24 hours of any activity constituting an incident/i.test(harmReport)) {
        failures.push('linked harm-report obligation must not absorb the separate cure-incident trigger');
    }

    if (!fs.existsSync(path.join(ROOT, receiptPath))) {
        failures.push(`missing source review receipt: ${receiptPath}`);
    } else {
        const receipt = JSON.parse(read(receiptPath));
        if (receipt.instrument_id !== 'us-ut-oaip-rma-2024-001') failures.push('source review receipt has the wrong instrument_id');
        if (receipt.source_sha256 !== '3b02de08d771cfe3b90f3f7913cb84c3516d61fd7041fcd60fd6deffb6b7cf1c') {
            failures.push('source review receipt does not bind the retained signed PDF hash');
        }
        if (receipt.record_last_verified !== '2026-06-04') {
            failures.push('source review receipt must preserve the record verification date');
        }
    }

    reportFailures('eval-elizachat-source-fidelity', failures);
}

if (require.main === module) run();

module.exports = { validateInstrumentClaims };
