#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const { PassThrough } = require('node:stream');
const { rpc } = require('./lib/eval-mcp-rpc');

async function response(chunks, expected) {
    const proc = { stdin: new PassThrough(), stdout: new PassThrough() };
    const pending = rpc(proc, 7, 'initialize', {});
    for (const chunk of chunks) proc.stdout.write(chunk);
    assert.deepEqual(await pending, expected);
    assert.equal(proc.stdout.listenerCount('data'), 0);
    proc.stdin.destroy();
    proc.stdout.destroy();
}

(async () => {
    const expected = { jsonrpc: '2.0', id: 7, result: { text: 'A caf\u00e9 response' } };
    const bytes = Buffer.from(JSON.stringify(expected) + '\n');
    await response([bytes.subarray(0, 15), bytes.subarray(15)], expected);
    await response([...bytes].map(byte => Buffer.from([byte])), expected);
    await response([Buffer.concat([Buffer.from('{"jsonrpc":"2.0","method":"notice"}\n'), bytes])], expected);
    for (const payload of ['{bad json}\n', '{"id":7']) {
        const proc = { stdin: new PassThrough(), stdout: new PassThrough() };
        const pending = assert.rejects(rpc(proc, 7, 'initialize', {}));
        proc.stdout.end(payload);
        await pending;
        assert.equal(proc.stdout.listenerCount('data'), 0);
        proc.stdin.destroy();
        proc.stdout.destroy();
    }
    console.log('eval-mcp-rpc-framing: OK');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
