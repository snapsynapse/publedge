'use strict';

const { StringDecoder } = require('node:string_decoder');

// Sequential test requests only. Pipe chunks are not JSON-RPC frames.
function rpc(proc, id, method, params) {
    return new Promise((resolve, reject) => {
        const decoder = new StringDecoder('utf8');
        let buffer = '';
        const cleanup = () => {
            proc.stdout.off('data', onData);
            proc.stdout.off('end', onEnd);
            proc.stdout.off('error', onError);
        };
        const onError = error => { cleanup(); reject(error); };
        const onEnd = () => onError(new Error('MCP stdout ended before the expected complete response'));
        const onData = (chunk) => {
            buffer += decoder.write(chunk);
            let newline;
            while ((newline = buffer.indexOf('\n')) !== -1) {
                const line = buffer.slice(0, newline);
                buffer = buffer.slice(newline + 1);
                if (!line.trim()) continue;
                try {
                    const msg = JSON.parse(line);
                    if (msg.id === id) {
                        cleanup();
                        resolve(msg);
                        return;
                    }
                } catch (err) {
                    onError(err);
                    return;
                }
            }
        };
        proc.stdout.on('data', onData);
        proc.stdout.once('end', onEnd);
        proc.stdout.once('error', onError);
        proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
}

module.exports = { rpc };
