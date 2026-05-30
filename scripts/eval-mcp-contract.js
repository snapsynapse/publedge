#!/usr/bin/env node
'use strict';

const path = require('path');
const { spawn } = require('child_process');
const { ROOT, loadProjectData } = require('./lib/eval-kit');

function rpc(proc, id, method, params) {
    return new Promise((resolve, reject) => {
        const onData = (chunk) => {
            for (const line of chunk.toString('utf-8').split('\n').filter(Boolean)) {
                try {
                    const msg = JSON.parse(line);
                    if (msg.id === id) {
                        proc.stdout.off('data', onData);
                        resolve(msg);
                    }
                } catch (err) {
                    proc.stdout.off('data', onData);
                    reject(err);
                }
            }
        };
        proc.stdout.on('data', onData);
        proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
}

function parseToolPayload(response) {
    return JSON.parse(response.result.content[0].text);
}

(async () => {
    const project = loadProjectData();
    const proc = spawn(process.execPath, ['mcp-server.js'], { cwd: ROOT, stdio: ['pipe', 'pipe', 'inherit'] });
    const failures = [];
    try {
        const init = await rpc(proc, 1, 'initialize', {});
        if (!init.result?.capabilities?.tools) failures.push('initialize response missing tools capability');

        const list = await rpc(proc, 2, 'tools/list', {});
        const tools = list.result?.tools || [];
        const toolNames = new Set(tools.map(t => t.name));
        for (const required of ['search', 'get_matrix', 'get_mappings', 'fetch_by_url', 'search_obligations', 'get_upcoming', 'get_recently_changed']) {
            if (!toolNames.has(required)) failures.push(`tools/list missing ${required}`);
        }

        const containerPlural = (project.config.entities?.container?.plural || 'containers').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const primaryPlural = (project.config.entities?.primary?.plural || 'primaries').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const listContainers = await rpc(proc, 3, 'tools/call', { name: `list_${containerPlural}`, arguments: {} });
        const listed = JSON.parse(listContainers.result.content[0].text);
        if (listed.count !== project.containers.length) failures.push(`list_${containerPlural} count mismatch: expected ${project.containers.length}, got ${listed.count}`);

        const sample = project.containers[0];
        const getContainer = await rpc(proc, 4, 'tools/call', { name: 'fetch_by_url', arguments: { url: `https://publedge.org/${sample._canonicalPath}` } });
        const fetched = parseToolPayload(getContainer);
        if (fetched.id !== sample.id) failures.push(`fetch_by_url returned ${fetched.id} for ${sample.id}`);

        const searchObligations = await rpc(proc, 5, 'tools/call', { name: 'search_obligations', arguments: { query: project.primaries[0].id.split('-')[0] } });
        const searchPayload = parseToolPayload(searchObligations);
        if (!Array.isArray(searchPayload.results) || searchPayload.results.length === 0) failures.push('search_obligations returned no results for a known obligation token');

        const relativeContainer = await rpc(proc, 6, 'tools/call', { name: 'fetch_by_url', arguments: { url: `/${sample._canonicalPath}` } });
        const relativeFetched = parseToolPayload(relativeContainer);
        if (relativeFetched.id !== sample.id) failures.push(`fetch_by_url failed root-relative canonical path for ${sample.id}`);

        const rejectedUrls = [
            `https://evil.example/${sample._canonicalPath}`,
            `http://publedge.org/${sample._canonicalPath}`,
            `https://www.publedge.org/${sample._canonicalPath}`,
            `https://publedge.org:443/${sample._canonicalPath}`,
            `https://PUBLEDGE.ORG/${sample._canonicalPath}`,
            `https://xn--publdge-9za.org/${sample._canonicalPath}`,
            `//publedge.org/${sample._canonicalPath}`,
            `%2f%2fpubledge.org/${sample._canonicalPath}`,
            `https://publedge.org/%2f${sample._canonicalPath}`,
            `https://publedge.org/%2e%2e/${sample._canonicalPath}`,
            `/../${sample._canonicalPath}`,
            `/${sample._canonicalPath.replace(/\//, '//')}`,
            `https://publedge.org\\${sample._canonicalPath}`,
            `https://publedge.org/${sample._canonicalPath}?utm_source=test`,
            `https://publedge.org/${sample._canonicalPath}#fragment`,
            `not-a-root-relative-path`,
            ` /${sample._canonicalPath}`,
            `/${sample._canonicalPath} bad`
        ];
        let id = 7;
        for (const url of rejectedUrls) {
            const rejected = await rpc(proc, id++, 'tools/call', { name: 'fetch_by_url', arguments: { url } });
            if (!rejected.result?.isError) failures.push(`fetch_by_url accepted non-canonical URL: ${url}`);
        }

        if (failures.length) {
            console.error(`eval-mcp-contract: FAILED (${failures.length})`);
            failures.forEach(item => console.error(`- ${item}`));
            process.exit(1);
        }

        console.log('eval-mcp-contract: OK');
        process.exit(0);
    } catch (err) {
        console.error(`eval-mcp-contract: FAILED\n- ${err.message}`);
        process.exit(1);
    } finally {
        proc.kill();
    }
})();
