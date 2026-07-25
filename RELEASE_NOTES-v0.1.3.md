# PubLedge v0.1.3

PubLedge `v0.1.3` advances the protocol's maintenance and adoption posture while preparing MCP/npm package `0.1.3`.

## Highlights

- Publishes installable MCP discovery at `https://publedge.org/.well-known/mcp.json` and a complete machine-readable endpoint inventory.
- Adds a five-minute path for browser, JSON API, and MCP adoption.
- Adds a dedicated authority correction and response intake surface.
- Adds evals for full generated-tree parity, discovery contracts, installed-package behavior, public claims, and feed/schema formats.
- Makes full clean builds authoritative, preventing stale generated files and stale empty feeds from surviving a release.
- Consolidates MCP parsing on shared zero-dependency libraries and narrows the npm runtime package.
- Corrects version, registry-count, freshness, integrity, and JSON-LD availability claims.

## Verification

- 158 canonical manifest hashes verified.
- 18 instruments, 35 obligations, 8 authorities, and 16 mappings passed cross-reference validation.
- All 24 evals passed, including obligation lifecycle, local tarball installation, and MCP initialization.
- 116 Obligation-First records passed adopter validation.
- Verification reported 61 fresh records, 0 stale records, and 0 never-verified records.

## Residuals

- `MANIFEST.yaml` proves source-to-current-manifest consistency; it is not an independent timestamp or immutable publication proof.
- `us-ut-oaip-rma-2026-001` intentionally has no effective date yet and continues to produce a non-blocking schema recommendation.

## Historical tag policy

The `v0.1.2-pre` tag is retained only as an immutable historical reference. Consumers, documentation, release tooling, and dependency automation must not select it. Use `v0.1.2` or a later stable tag.

See [CHANGELOG.md](CHANGELOG.md) for the complete change inventory.
