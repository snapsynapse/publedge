#!/usr/bin/env node
'use strict';

function toArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function positiveWholeDays(value, name, fallback) {
    const configured = value === undefined || value === null ? fallback : value;
    const text = String(configured).trim();
    if (!/^[1-9]\d*$/.test(text)) throw new Error(`Invalid verification.${name}: expected a positive whole-day threshold`);
    const days = Number(text);
    if (!Number.isSafeInteger(days)) throw new Error(`Invalid verification.${name}: expected a safe whole-day threshold`);
    return days;
}

// Risk-based review cadence from project.yml. Shared by verify.js (staleness
// gate) and build.js (per-record badge) so the site and the gate agree.
function getReviewCadence(config) {
    const v = config.verification || {};
    const active = positiveWholeDays(v.staleness_days, 'staleness_days', 90);
    return {
        active,
        authority: positiveWholeDays(v.authority_staleness_days, 'authority_staleness_days', active),
        obligation: positiveWholeDays(v.obligation_staleness_days, 'obligation_staleness_days', active),
        historicalDemonstration: positiveWholeDays(v.historical_demonstration_staleness_days, 'historical_demonstration_staleness_days', active)
    };
}

function containerCadenceDays(container, cadence) {
    const isHistoricalDemonstration = container.source === 'demonstration-remap' &&
        !['jia', 'rma', 'statute'].includes(container.type);
    return isHistoricalDemonstration ? cadence.historicalDemonstration : cadence.active;
}

function getAllowedUnmappedInstrumentIds(config) {
    return new Set(toArray(config.verification?.allowed_unmapped_instruments).map(String));
}

function classifyUnmappedContainers(containers, mappings, allowedIds) {
    const mapped = new Set();
    for (const m of mappings) {
        const cId = m.regulation || m.container || m.framework;
        if (cId) mapped.add(cId);
    }

    const allowed = [];
    const errors = [];
    for (const c of containers) {
        if (mapped.has(c.id)) continue;
        if (allowedIds.has(c.id)) {
            allowed.push(c);
        } else {
            errors.push(c);
        }
    }
    return { allowed, errors };
}

module.exports = {
    classifyUnmappedContainers,
    containerCadenceDays,
    getReviewCadence,
    getAllowedUnmappedInstrumentIds
};
