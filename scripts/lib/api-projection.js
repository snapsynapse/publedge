'use strict';

// Pure projections for the docs/api/v1 aggregate exports. build.js feeds these
// with loaded containers; tests feed them with in-memory mutations. Every item
// carries the record's own source and editorial_status so a draft or
// demonstration record keeps its labelling wherever a status appears.

function containerSummary(c) {
    return {
        id: c.id,
        name: c.title || c.name || c.id,
        source: c.source || null,
        status: c.status,
        editorial_status: c.editorial_status || null,
        effective: c.effective,
        provision_count: (c.provisions || []).length
    };
}

function daysBetween(today, date) {
    return Math.ceil((new Date(date + 'T00:00:00Z') - new Date(today + 'T00:00:00Z')) / 86400000);
}

function upcomingItems(containers, { today, siteUrl, href }) {
    const items = [];
    for (const c of containers) {
        const push = (kind, date) => {
            if (!date || date < today) return;
            items.push({
                kind,
                date,
                days_until: daysBetween(today, date),
                record_id: c.id,
                title: c.title || c.name || c.id,
                url: siteUrl + href(c),
                jurisdiction: c.jurisdiction,
                authority: c.authority,
                type: c.type,
                source: c.source || null,
                status: c.status || null,
                editorial_status: c.editorial_status || null
            });
        };
        push('effective', c.effective);
        push('term-end', c.term_end);
    }
    items.sort((a, b) => a.date.localeCompare(b.date));
    return items;
}

function recentlyChangedItems(containers, { since, siteUrl, href }) {
    return containers
        .filter(c => (c.last_verified && c.last_verified >= since) ||
                     (c.modified && c.modified >= since) ||
                     (c.created && c.created >= since))
        .map(c => {
            const isNew = c.created && c.created >= since;
            return {
                record_id: c.id,
                title: c.title || c.name || c.id,
                url: siteUrl + href(c),
                change_type: isNew ? 'added' : 'updated',
                created: c.created || null,
                modified: c.modified || null,
                last_verified: c.last_verified || null,
                jurisdiction: c.jurisdiction,
                authority: c.authority,
                type: c.type,
                source: c.source || null,
                status: c.status,
                editorial_status: c.editorial_status || null
            };
        })
        .sort((a, b) => (b.last_verified || b.modified || '').localeCompare(a.last_verified || a.modified || ''));
}

function countByStatus(items) {
    const counts = {};
    for (const item of items) counts[item.status || 'unknown'] = (counts[item.status || 'unknown'] || 0) + 1;
    return counts;
}

module.exports = { containerSummary, upcomingItems, recentlyChangedItems, countByStatus };
