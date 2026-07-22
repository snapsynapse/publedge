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
        const list = await rpc(proc, 2, 'tools/list', {});
        const names = new Set((list.result?.tools || []).map(tool => tool.name));
        for (const required of ['search', 'fetch_by_url', 'get_matrix', 'get_mappings']) {
            if (!names.has(required)) failures.push(`installed package tools/list is missing ${required}`);
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
