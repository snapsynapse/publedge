#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { ROOT, reportFailures } = require('./lib/eval-kit');

function run(command, args, options) {
    const result = spawnSync(command, args, { encoding: 'utf-8', ...options });
    if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`);
    return result;
}

function rpc(proc, id, method, params) {
    return new Promise((resolve, reject) => {
        let buffer = '';
        const timer = setTimeout(() => reject(new Error(`${method} timed out`)), 10000);
        const onData = chunk => {
            buffer += chunk.toString('utf-8');
            const lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines.filter(Boolean)) {
                const message = JSON.parse(line);
                if (message.id === id) {
                    clearTimeout(timer);
                    proc.stdout.off('data', onData);
                    resolve(message);
                }
            }
        };
        proc.stdout.on('data', onData);
        proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
}

(async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'publedge-package-smoke-'));
    const packageVersion = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8')).version;
    const failures = [];
    let proc;
    try {
        const cache = path.join(tempDir, 'npm-cache');
        const packed = run('npm', ['pack', '--json', '--pack-destination', tempDir], {
            cwd: ROOT,
            env: { ...process.env, npm_config_cache: cache }
        });
        const tarballName = JSON.parse(packed.stdout)[0].filename;
        const tarball = path.join(tempDir, tarballName);
        run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], {
            cwd: tempDir,
            env: { ...process.env, npm_config_cache: cache }
        });

        const executable = path.join(tempDir, 'node_modules', '.bin', 'publedge');
        proc = spawn(executable, [], { cwd: tempDir, stdio: ['pipe', 'pipe', 'pipe'] });
        const init = await rpc(proc, 1, 'initialize', {});
        if (!init.result?.capabilities?.tools) failures.push('installed package initialize response is missing tools capability');
        if (init.result?.serverInfo?.version !== packageVersion) {
            failures.push(`installed package serverInfo.version ${init.result?.serverInfo?.version} does not match package version ${packageVersion}`);
        }
        const list = await rpc(proc, 2, 'tools/list', {});
        if (list.result?.tools?.length !== 13) failures.push('installed package does not expose exactly 13 tools');
        const names = new Set((list.result?.tools || []).map(tool => tool.name));
        for (const required of ['search', 'fetch_by_url', 'get_matrix', 'get_mappings']) {
            if (!names.has(required)) failures.push(`installed package tools/list is missing ${required}`);
        }
        const discover = await rpc(proc, 3, 'server/discover', {});
        for (const required of ['https://publedge.org/', 'https://obligationfirst.org/v1/context.jsonld', 'demonstration', 'draft', 'last_verified', 'native PubLedge records']) {
            if (!init.result?.instructions?.includes(required)) failures.push(`installed package guidance missing ${required}`);
        }
        if (discover.result?.instructions !== init.result?.instructions) failures.push('installed discovery paths expose different guidance');
        let id = 4;
        for (const [recordId, source] of [
            ['us-ut-oaip-jia-2026-001', 'publedge-original-draft'],
            ['us-ut-oaip-rma-2025-002', 'demonstration-remap']
        ]) {
            const response = await rpc(proc, id++, 'tools/call', { name: 'get_legal-instrument', arguments: { id: recordId } });
            const record = JSON.parse(response.result.content[0].text);
            if (record.source !== source) failures.push(`installed ${recordId} lost its source label`);
            if (!record.official_url || !record.last_verified || !record.body) failures.push(`installed ${recordId} is missing provenance or body`);
            if (source === 'publedge-original-draft' && (record.editorial_status !== 'draft' || record.status !== 'proposed')) {
                failures.push('installed original draft lost its draft/proposed limits');
            }
        }
    } catch (error) {
        failures.push(error.message);
    } finally {
        if (proc) proc.kill();
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
    reportFailures('eval-package-smoke', failures);
})().catch(error => {
    console.error(`eval-package-smoke: FAILED\n- ${error.message}`);
    process.exit(1);
});
