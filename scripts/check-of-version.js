#!/usr/bin/env node
'use strict';

/**
 * Assert that the obligation-first checkout in use satisfies the version range
 * declared in PubLedge's published naming profile (its `appliesTo` field).
 *
 * The comparison rule lives in obligation-first
 * (scripts/check-adopter-of-version.mjs) so all adopters share one
 * implementation. This wrapper only locates the checkout and points the shared
 * script at our profile.
 *
 * Exits 0 when compatible. Exits 1 on a version mismatch.
 *
 * When no obligation-first checkout is found, the default is to skip (a local
 * developer without a sibling checkout should not be blocked). Set
 * CHECK_OF_REQUIRED=1 to make that a hard failure instead. CI must set it: a
 * workflow that deliberately checks obligation-first out and then silently
 * skips reports green while checking nothing, which is worse than having no
 * check at all.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const candidates = [
    process.env.OBLIGATION_FIRST_DIR,
    path.join(ROOT, '..', 'obligation-first'),
    path.join(ROOT, 'obligation-first')
].filter(Boolean);

const CHECKER = path.join('scripts', 'check-adopter-of-version.mjs');
const obligationFirstDir = candidates.find(dir => fs.existsSync(path.join(dir, CHECKER)));

if (!obligationFirstDir) {
    const required = process.env.CHECK_OF_REQUIRED === '1';
    const searched = candidates.join(', ');
    if (required) {
        console.error('check-of-version: no obligation-first checkout providing ' + CHECKER + ' was found.');
        console.error(`  searched: ${searched}`);
        console.error('  CHECK_OF_REQUIRED=1 is set, so this is a failure rather than a skip.');
        process.exit(1);
    }
    console.log('check-of-version: no obligation-first checkout found; skipping.');
    console.log(`  searched: ${searched}`);
    console.log('  set CHECK_OF_REQUIRED=1 to make this a failure (CI should).');
    process.exit(0);
}

const profilePath = path.join(ROOT, 'docs', '.well-known', 'obligation-first-naming-profile.jsonld');
const result = spawnSync(
    process.execPath,
    [path.join(obligationFirstDir, CHECKER), profilePath],
    { cwd: ROOT, stdio: 'inherit' }
);

process.exit(result.status || 0);
