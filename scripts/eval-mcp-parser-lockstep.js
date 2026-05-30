#!/usr/bin/env node
'use strict';

const { spawn } = require('child_process');
const { ROOT, loadProjectData, reportFailures } = require('./lib/eval-kit');

function slugify(str) {
    return String(str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

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

function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
    }
    return value;
}

function expectedPayload(entity) {
    const { _body, _file, _canonicalPath, ...rest } = entity;
    return { ...rest, body: _body };
}

(async () => {
    const project = loadProjectData();
    const proc = spawn(process.execPath, ['mcp-server.js'], { cwd: ROOT, stdio: ['pipe', 'pipe', 'inherit'] });
    const failures = [];
    let id = 1;

    try {
        await rpc(proc, id++, 'initialize', {});

        const checks = [
            {
                tool: `get_${slugify(project.config.entities?.container?.name || 'container')}`,
                items: project.containers,
                label: project.config.entities?.container?.name || 'container'
            },
            {
                tool: `get_${slugify(project.config.entities?.primary?.name || 'primary')}`,
                items: project.primaries,
                label: project.config.entities?.primary?.name || 'primary'
            },
            {
                tool: `get_${slugify(project.config.entities?.authority?.name || 'authority')}`,
                items: project.authorities,
                label: project.config.entities?.authority?.name || 'authority'
            }
        ];

        for (const check of checks) {
            for (const entity of check.items) {
                const response = await rpc(proc, id++, 'tools/call', { name: check.tool, arguments: { id: entity.id } });
                if (response.result?.isError) {
                    failures.push(`${check.tool} returned error for ${entity.id}`);
                    continue;
                }
                const actual = JSON.parse(response.result.content[0].text);
                const expected = expectedPayload(entity);
                if (JSON.stringify(stable(actual)) !== JSON.stringify(stable(expected))) {
                    failures.push(`${check.label} parser drift for ${entity.id}`);
                }
            }
        }

        reportFailures('eval-mcp-parser-lockstep', failures);
    } catch (err) {
        reportFailures('eval-mcp-parser-lockstep', [`${err.message}`]);
    } finally {
        proc.kill();
    }
})();
