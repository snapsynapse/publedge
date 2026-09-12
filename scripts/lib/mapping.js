#!/usr/bin/env node
'use strict';

const fs = require('fs');

function parseMappingIndex(content) {
    const entries = [];
    const ids = new Set();
    let current = null;
    let currentList = null;

    for (const [index, line] of content.split('\n').entries()) {
        if (!line.trim() || line.trimStart().startsWith('#')) continue;
        if (line.startsWith('- id:')) {
            if (current) entries.push(current);
            current = { id: line.replace('- id:', '').trim() };
            if (!current.id || ids.has(current.id)) throw new Error(`Invalid or duplicate mapping id at line ${index + 1}`);
            ids.add(current.id);
            currentList = null;
        } else if (current) {
            const match = line.match(/^\s+(\w[\w_]*):\s*(.*)/);
            if (match) {
                const [, key, value] = match;
                if (Object.hasOwn(current, key)) throw new Error(`Duplicate mapping field ${key} at line ${index + 1}`);
                if (value.trim()) {
                    current[key] = value.trim();
                    currentList = null;
                } else {
                    current[key] = [];
                    currentList = key;
                }
                continue;
            }
            const listMatch = line.match(/^\s+-\s+(.+)/);
            if (listMatch && currentList) { current[currentList].push(listMatch[1].trim()); continue; }
            throw new Error(`Malformed mapping line ${index + 1}`);
        } else throw new Error(`Mapping content before first id at line ${index + 1}`);
    }

    if (current) entries.push(current);
    return entries;
}

function loadMappingIndex(filePath) {
    if (!fs.existsSync(filePath)) return [];
    return parseMappingIndex(fs.readFileSync(filePath, 'utf-8'));
}

module.exports = {
    loadMappingIndex,
    parseMappingIndex
};
