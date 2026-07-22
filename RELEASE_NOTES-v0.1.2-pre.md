# PubLedge v0.1.2-pre

PubLedge `v0.1.2-pre` advances the protocol's maintenance and adoption posture while publishing MCP/npm package `0.1.2`.

## Highlights

- Publishes installable MCP discovery at `https://publedge.org/.well-known/mcp.json` and a complete machine-readable endpoint inventory.
- Adds a five-minute path for browser, JSON API, and MCP adoption.
- Adds a dedicated authority correction and response intake surface.
- Adds evals for full generated-tree parity, discovery contracts, installed-package behavior, public claims, and feed/schema formats.
- Makes full clean builds authoritative, preventing stale generated files and stale empty feeds from surviving a release.
- Consolidates MCP parsing on shared zero-dependency libraries and narrows the npm runtime package.
- Corrects version, registry-count, freshness, integrity, and JSON-LD availability claims.

## Verification

- 145 canonical manifest hashes verified.
- 18 instruments, 26 obligations, 8 authorities, and 14 mappings passed cross-reference validation.
- All 23 evals passed, including local tarball installation and MCP initialization.
- 105 Obligation-First records passed adopter validation.
- Verification reported 52 fresh records, 0 stale records, and 0 never-verified records.
- npm package dry run: 66 files, 74.7 kB compressed, 267.4 kB unpacked.

## Residuals

- `MANIFEST.yaml` proves source-to-current-manifest consistency; it is not an independent timestamp or immutable publication proof.
- `us-ut-oaip-rma-2026-001` intentionally has no effective date yet and continues to produce a non-blocking schema recommendation.

See [CHANGELOG.md](CHANGELOG.md) for the complete change inventory.
