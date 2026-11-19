'use strict';

const fs = require('fs');
const path = require('path');

function safePathSegment(value, label = 'path segment') {
    if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value) || value === '.' || value === '..') {
        throw new Error(`Unsafe ${label}`);
    }
    return value;
}

function containedPath(root, ...segments) {
    const base = path.resolve(root);
    if (fs.existsSync(base) && fs.lstatSync(base).isSymbolicLink()) throw new Error('Symlink output root');
    let current = base;
    for (const segment of segments) {
        if (typeof segment !== 'string' || path.isAbsolute(segment) || segment.includes('\\') || segment.includes('//') || segment.includes('\0')) {
            throw new Error('Unsafe output path');
        }
        for (const part of String(segment).split('/').filter(Boolean)) {
            safePathSegment(part);
            current = path.join(current, part);
            const relative = path.relative(base, current);
            if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
                throw new Error('Path escapes output root');
            }
            if (fs.existsSync(current) || isBrokenSymlink(current)) {
                if (fs.lstatSync(current).isSymbolicLink()) throw new Error('Symlink in output path');
            }
        }
    }
    return current;
}

function isBrokenSymlink(filename) {
    try { return fs.lstatSync(filename).isSymbolicLink(); }
    catch (error) {
        if (error.code === 'ENOENT') return false;
        throw error;
    }
}

function scriptSafeJson(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

module.exports = { safePathSegment, containedPath, scriptSafeJson };
