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
        const fetched = JSON.parse(getContainer.result.content[0].text);
        if (fetched.id !== sample.id) failures.push(`fetch_by_url returned ${fetched.id} for ${sample.id}`);

        const searchObligations = await rpc(proc, 5, 'tools/call', { name: 'search_obligations', arguments: { query: project.primaries[0].id.split('-')[0] } });
        const searchPayload = JSON.parse(searchObligations.result.content[0].text);
        if (!Array.isArray(searchPayload.results) || searchPayload.results.length === 0) failures.push('search_obligations returned no results for a known obligation token');

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
