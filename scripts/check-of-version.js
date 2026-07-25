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
 * Exits 0 when compatible, or when no obligation-first checkout is found
 * (CI always has one; a local skip is safe). Exits 1 on a version mismatch.
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
    console.log('check-of-version: no obligation-first checkout found; skipping.');
    process.exit(0);
}

const profilePath = path.join(ROOT, 'docs', '.well-known', 'obligation-first-naming-profile.jsonld');
const result = spawnSync(
    process.execPath,
    [path.join(obligationFirstDir, CHECKER), profilePath],
    { cwd: ROOT, stdio: 'inherit' }
);

process.exit(result.status || 0);
