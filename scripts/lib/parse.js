#!/usr/bin/env node
'use strict';

function stripOuterQuotes(rawValue) {
    return String(rawValue).trim().replace(/^["']|["']$/g, '');
}

function normalizeKey(rawKey) {
    return stripOuterQuotes(rawKey);
}

function findMappingColon(text) {
    let quote = null;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quote) {
            if (ch === quote && text[i - 1] !== '\\') quote = null;
            continue;
        }
        if (ch === '"' || ch === "'") {
            quote = ch;
            continue;
        }
        if (ch === ':' && (i === text.length - 1 || /\s/.test(text[i + 1]))) return i;
    }
    return -1;
}

function splitInlinePairs(text) {
    const pairs = [];
    let quote = null;
    let start = 0;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quote) {
            if (ch === quote && text[i - 1] !== '\\') quote = null;
            continue;
        }
        if (ch === '"' || ch === "'") {
            quote = ch;
            continue;
        }
        if (ch === ',') {
            pairs.push(text.slice(start, i));
            start = i + 1;
        }
    }
    pairs.push(text.slice(start));
    return pairs;
}

function parseScalar(rawValue) {
    const value = stripOuterQuotes(rawValue);
    if (value === 'null') return null;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === '[]') return [];
    if (value === '{}') return {};
    if (value.startsWith('[') && value.endsWith(']')) {
        const inner = value.slice(1, -1).trim();
        if (!inner) return [];
        return inner.split(',').map(part => parseScalar(part));
    }
    return value;
}

function parseYaml(content) {
    const lines = content.split('\n');
    const result = {};
    const stack = [{ obj: result, indent: -2 }];

    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        if (raw.trim() === '' || raw.trim().startsWith('#')) continue;

        const indent = raw.search(/\S/);
        const trimmed = raw.trim();

        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();

        const isList = trimmed.startsWith('- ');
        const lineContent = isList ? trimmed.slice(2).trim() : trimmed;

        if (isList) {
            if (lineContent.startsWith('{') && lineContent.endsWith('}')) {
                const obj = {};
                splitInlinePairs(lineContent.slice(1, -1)).forEach(pair => {
                    const ci = findMappingColon(pair);
                    if (ci !== -1) obj[normalizeKey(pair.slice(0, ci))] = parseScalar(pair.slice(ci + 1));
                });
                const parent = stack[stack.length - 1].obj;
                const lastKey = stack[stack.length - 1].lastListKey;
                if (lastKey && Array.isArray(parent[lastKey])) parent[lastKey].push(obj);
                continue;
            }

            const ci = findMappingColon(lineContent);
            if (ci !== -1) {
                const key = normalizeKey(lineContent.slice(0, ci));
                const rawValue = lineContent.slice(ci + 1).trim();
                const value = parseScalar(rawValue);
                const nextI = i + 1;
                const hasChildren = nextI < lines.length &&
                    lines[nextI].trim() !== '' && !lines[nextI].trim().startsWith('#') &&
                    !lines[nextI].trim().startsWith('- ') &&
                    lines[nextI].search(/\S/) > indent;

                const parent = stack[stack.length - 1].obj;
                const listKey = stack[stack.length - 1].lastListKey;

                if (hasChildren || rawValue === '') {
                    const obj = {};
                    if (rawValue !== '') obj[key] = value;
                    if (listKey && Array.isArray(parent[listKey])) parent[listKey].push(obj);
                    stack.push({ obj, indent, lastListKey: null });
                } else {
                    const obj = {};
                    obj[key] = value;
                    if (listKey && Array.isArray(parent[listKey])) parent[listKey].push(obj);
                }
            } else {
                const parent = stack[stack.length - 1].obj;
                const listKey = stack[stack.length - 1].lastListKey;
                if (listKey && Array.isArray(parent[listKey])) {
                    parent[listKey].push(parseScalar(lineContent));
                }
            }
            continue;
        }

        const ci = findMappingColon(trimmed);
        if (ci === -1) continue;

        const key = normalizeKey(trimmed.slice(0, ci));
        const rawValue = trimmed.slice(ci + 1).trim();
        const value = parseScalar(rawValue);
        const parent = stack[stack.length - 1].obj;

        if (rawValue === '') {
            const nextI = i + 1;
            let nextNonEmpty = null;
            for (let j = nextI; j < lines.length; j++) {
                if (lines[j].trim() && !lines[j].trim().startsWith('#')) {
                    nextNonEmpty = lines[j].trim();
                    break;
                }
            }

            if (nextNonEmpty && nextNonEmpty.startsWith('- ')) {
                parent[key] = [];
                stack.push({ obj: parent, indent, lastListKey: key });
            } else {
                parent[key] = {};
                stack.push({ obj: parent[key], indent });
            }
        } else {
            parent[key] = value;
        }
    }

    return result;
}

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return { frontmatter: {}, body: content };
    return {
        frontmatter: parseYaml(match[1]),
        body: content.slice(match[0].length).trim()
    };
}

module.exports = {
    parseScalar,
    parseYaml,
    parseFrontmatter
};
