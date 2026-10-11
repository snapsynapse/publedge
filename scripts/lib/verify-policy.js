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
    return isHistoricalDemonstration(container) ? cadence.historicalDemonstration : cadence.active;
}

function getAllowedUnmappedInstrumentIds(config) {
    return new Set(toArray(config.verification?.allowed_unmapped_instruments).map(String));
}

// Frozen schema fixtures: published records exempt from currentness review.
function getFrozenFixtureIds(config) {
    const v = config.verification || {};
    const ids = key => new Set(toArray(v[key]).map(String));
    return {
        instruments: ids('frozen_fixture_instruments'),
        obligations: ids('frozen_fixture_obligations'),
        authorities: ids('frozen_fixture_authorities')
    };
}

function isHistoricalDemonstration(container) {
    return container.source === 'demonstration-remap' &&
        !['jia', 'rma', 'statute'].includes(container.type);
}

// A freeze may only cover historical demonstrations and records reachable
// solely from them, so an active record can never be frozen by association.
function frozenFixtureErrors(frozen, { containers, primaries, authorities, mappings }) {
    const errors = [];
    const byId = new Map(containers.map(c => [c.id, c]));
    const known = {
        instruments: new Set(containers.map(c => c.id)),
        obligations: new Set(primaries.map(p => p.id)),
        authorities: new Set(authorities.map(a => a.id))
    };
    for (const [kind, ids] of Object.entries(frozen)) {
        for (const id of ids) {
            if (!known[kind].has(id)) errors.push(`frozen fixture ${kind} entry "${id}" does not exist`);
        }
    }
    for (const id of frozen.instruments) {
        const c = byId.get(id);
        if (c && !isHistoricalDemonstration(c)) errors.push(`frozen fixture instrument "${id}" is not a historical demonstration remap`);
    }
    for (const m of mappings) {
        const cId = m.regulation || m.container || m.framework;
        if (!cId || frozen.instruments.has(cId)) continue;
        for (const o of toArray(m.obligations)) {
            const oId = typeof o === 'string' ? o : (o && (o.id || o.primary));
            if (frozen.obligations.has(oId)) errors.push(`frozen fixture obligation "${oId}" is mapped from non-frozen instrument "${cId}"`);
        }
    }
    for (const c of containers) {
        if (!frozen.instruments.has(c.id) && frozen.authorities.has(c.authority)) {
            errors.push(`frozen fixture authority "${c.authority}" is used by non-frozen instrument "${c.id}"`);
        }
    }
    return errors;
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
    frozenFixtureErrors,
    getFrozenFixtureIds,
    getReviewCadence,
    getAllowedUnmappedInstrumentIds
};
