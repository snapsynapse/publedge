# PubLedge v0.2.3 release preparation

Prepared 2026-09-12. Scope: local R1 release preparation only. No commit, push, tag, GitHub Release, npm publication, MCP Registry publication, Pages deployment, or external comment was performed.

## Candidate

- Repository: https://github.com/snapsynapse/publedge
- Fresh remote base and candidate commit: `96ee83ea592d8348793e88d4847861a97611dff8` (`origin/main`, 2026-09-12 fetch)
- Candidate version: package and registry manifest `0.2.3`; protocol `v0.2.0`
- Comparison release: signed annotated `v0.2.2` points to `e906f907b606bebbeb389e889c32d6004cefdd8f`; tag object `8b2b74c0914e316f210b45b1d9f60641dc06dd88`
- Candidate range: `v0.2.2..96ee83ea`, 731 files changed, 34,361 additions, 2,438 deletions
- Candidate Git tree fingerprint: `7eb0d2aacdf1bf23a7c32336a757585df9be10d5`
- Source tree used for the package was clean at `96ee83ea`; the final worktree has only the two named untracked preparation records in this directory and `ops/evidence/`, plus ignored `node_modules/`. The records are outside the npm package and prepared source archives.

## Release-state reconciliation

| Surface | Current observation | Candidate consequence |
|---|---|---|
| GitHub main | `96ee83ea`; CI run `34664466229` succeeded and Pages run `34664465580` succeeded | Main already contains the candidate, but neither run is a release-publication receipt |
| Git tag and GitHub Release | Only `v0.2.2`; no `v0.2.3` tag or release | Publication remains unstarted |
| npm | Versions end at `0.2.2`; `npm view publedge@0.2.3` returned the expected absent-version 404 | `0.2.3` is available for one immutable publication attempt |
| Official MCP Registry | Active latest server `io.github.snapsynapse/publedge` is `0.2.2`, published 2026-09-06T03:08:31.84186Z | `server.json` is ready for `0.2.3`, but registry publication remains unstarted |
| Live publication state | https://publedge.org/design/publication-state.json exactly matches source SHA-256 `0cb5dc6d59be9e8198041ab78388f7c1648ddfea2b43f09dbf667aa649d0ef63` and identifies 0.2.3 only as an unpublished source candidate | Live discovery correctly remains pinned to 0.2.2 until provider evidence exists |

## Obligation-First dependency

PubLedge canonical CI remains pinned to Obligation-First checker commit `7f032fc5482b34359770bc50ca6fa94c6606e6fb`. Its declared compatibility range is `obligation-first >=0.6.0 <0.7.0`.

The full PubLedge gate ran with `CHECK_OF_REQUIRED=1` and `OBLIGATION_FIRST_DIR=/private/tmp/legal-graph-release-2026-09-12/obligation-first`, using the prepared 0.6.6 candidate at base `81df02431f218a4f93ed84f778461ca2168d9692`. It reported `check-adopter-of-version: OK - 0.6.6 satisfies "obligation-first >=0.6.0 <0.7.0"`, validated all 130 records, and passed the 130-identifier continuity and fingerprint gates. The OF preparation changes no checker code, so no PubLedge pin change is needed. Keep the existing exact CI pin unless a separately reviewed checker change requires it.

## Local validation

`CHECK_OF_REQUIRED=1 OBLIGATION_FIRST_DIR=/private/tmp/legal-graph-release-2026-09-12/obligation-first npm_config_audit=false npm run verify:ci` passed at the candidate commit. The gate included hash validation of 214 files, source validation (18 instruments, 35 obligations, 8 authorities, 16 mappings), source admission (62 records: 59 legacy-unreviewed, 3 with reviewed changes, 13 changed units), build and generated-tree parity, 160 sitemap search checks, MCP contract and installed-package smoke, all OF binding gates, and 17 maintenance tests. `npm_config_audit=false` was set for all npm commands; no npm audit or dependency-inventory upload was run.

The only non-semantic diagnostic was the host's missing `C.UTF-8` locale warning from `bash`, `tar`, and `perl`; every gate exited successfully.

## Prepared artifacts

All archives were generated from clean commit `96ee83ea` and retained outside the worktree at `/private/tmp/publedge-0.2.3-artifacts/`.

| Artifact | Inventory | SHA-256 |
|---|---|---|
| `publedge-0.2.3.tgz` | 76 npm files, 84,837 bytes compressed, 303,666 bytes unpacked; includes the ElizaChat source-review receipt and all declared licenses | `f1d53ce509c7490092a62921c7bd12ac68399390ba1c216f3b6bee41f333c747` |
| `publedge-v0.2.3-source.tar.gz` | 1,464 Git archive entries | `6d94e2cc715eab86f132104ffe6379e7cbbc3e92ff9cf3625cdc5acf8a68fdbc` |
| `publedge-v0.2.3-source.zip` | 1,464 Git archive entries | `6e2b2b5c7bb918562f013614a5f45ecd091c23aa5344ea78ffc00fd013f8264b` |

`npm pack` reported npm integrity `sha512-tCNIo4OCBQCGrQ00u7NQ19+msLC+I18h2SIEuljhXHwThY57AVvCbBcHVifrSz5Jrl/IR2cxoVp7+4COsF5GcA==` and SHA-1 `104721e2ee93dda852d660d5f97b572f053d8fa7`. The full gate's clean installed consumer smoke passed against a separately packed artifact.

## Authority boundary

This dated record preserves only R1 candidate evidence. Provider publication, release mechanics, and any later receipt remain separately authorized work. The current provider boundary is recorded in `design/publication-state.json` and its dated provider evidence; no future action queue is retained in this repository record.
