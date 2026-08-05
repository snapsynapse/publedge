'use strict';

const fs = require('fs');
const path = require('path');

const EVIDENCE_DATE = /(?:^|["'])?(?:last_verified|last_checked|verified|modified|created)(?:["'])?\s*[:|]\s*["']?(\d{4}-\d{2}-\d{2})/gmi;

function sourceFiles(dir, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) sourceFiles(full, out);
        else if (entry.isFile() && /\.(json|md|ya?ml)$/i.test(entry.name)) out.push(full);
    }
    return out;
}

function fromSourceDateEpoch(value) {
    if (value === undefined) return null;
    if (!/^\d+$/.test(value)) throw new Error('SOURCE_DATE_EPOCH must be whole Unix seconds');
    const date = new Date(Number(value) * 1000);
    if (Number.isNaN(date.getTime())) throw new Error('SOURCE_DATE_EPOCH is outside the supported date range');
    return date.toISOString();
}

function deriveBuildClock(root) {
    const epoch = fromSourceDateEpoch(process.env.SOURCE_DATE_EPOCH);
    let instant = epoch;
    let source = 'SOURCE_DATE_EPOCH';

    if (!instant) {
        const dates = [];
        for (const file of sourceFiles(path.join(root, 'data'))) {
            const text = fs.readFileSync(file, 'utf8');
            for (const match of text.matchAll(EVIDENCE_DATE)) dates.push(match[1]);
        }
        if (dates.length === 0) throw new Error('No evidence dates found under data/; refusing a wall-clock-dependent build');
        const date = dates.sort().at(-1);
        instant = `${date}T00:00:00.000Z`;
        source = `latest source evidence date (${date})`;
    }

    const value = new Date(instant);
    const date = value.toISOString().slice(0, 10);
    return Object.freeze({
        instant: value.toISOString(),
        date,
        year: value.getUTCFullYear(),
        icsStamp: value.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        source,
        dateObject: () => new Date(value.getTime()),
        daysBefore: days => new Date(value.getTime() - days * 86400000).toISOString().slice(0, 10)
    });
}

module.exports = { deriveBuildClock };
