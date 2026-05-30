#!/usr/bin/env node
'use strict';

function toArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
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
    getAllowedUnmappedInstrumentIds
};
