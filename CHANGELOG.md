# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Not all v0.1.0-pre history is versioned separately; early drafting work was compressed into a single prerelease entry below. Subsequent releases are tracked individually.

## [Unreleased]

## [0.1.2] - 2026-07-21

Maintenance, adoption, and delivery hardening release. The protocol release tag is `v0.1.2-pre`; the stable MCP/npm package version is `0.1.2`.

### Changed

- Codified the repo-scoped disposition in `INTENT.md`: maintain PubLedge as the thin recordkeeping convention of the PAICE legal graph and park standalone product expansion until a concrete demand trigger.
- Made generated freshness badges deterministic; relative age and state are now browser enhancements over an absolute `last_verified` date.
- Reframed the verification guide around source-to-current-manifest consistency and documented the limits of an unsigned, non-timestamped manifest.
- Added risk-based verification cadences for active instruments, authorities, obligations, and historical demonstration remaps.
- Made clean builds authoritative for the full generated tree while preserving GitHub Pages control files.
- Expanded the JSON API inventory, `agents.json`, `llms.txt`, and schema discovery surfaces.
- CI now runs the complete eval suite rather than a selected subset.
- Reduced the npm runtime package to the three shared libraries used by the MCP server.

### Added

- Ajv-backed JSON Schema 2020-12 validation for every instrument frontmatter record in CI.
- Verification-guide discovery through the reference sitemap, `llms.txt`, and `agents.json`.
- Generated-tree parity, discovery-contract, installed-package smoke, public-claims, and format-contract evals.
- Installable MCP discovery at `/.well-known/mcp.json` and a browsable schema index at `/schema/json/`.
- A five-minute HTML, API, and MCP adoption path in the README.
- A dedicated authority correction and response issue template.

### Fixed

- Quoted bracket-shaped and null-shaped YAML scalars remain strings instead of being reinterpreted after quote removal.
- Empty Atom and JSON feeds are regenerated instead of retaining stale items.
- Duplicate `authority-response` capability metadata was removed from `agents.json`.
- Internal-link evaluation now rejects directory targets without an index and caught the previously missing generated favicon.
- Public version, registry-count, integrity, and JSON-LD availability claims now match the delivered surfaces.

### Removed

- Dead hand-authored tool pages and the completed one-time URL migration script.
- Unused build helpers, duplicated MCP mapping parsing, stale legacy generated instrument aliases, and orphaned generated artifacts.

## [0.1.1] — 2026-06-10

First stable npm publish.

### Notes

- npm package version (`package.json`) now tracks **MCP server stability**, not the PROTOCOL.md spec maturity. The two version rates are decoupled. Spec still tracks at `v0.1.1-pre` per [PROTOCOL.md](PROTOCOL.md); the MCP server itself is stable, contract-tested (`eval:mcp-contract`), and ready for general use.
- This is the first published npm version. Earlier `0.1.1-pre` work was internal/unpublished.

### Added
- npm package: `publedge` on the public registry, installable as `npx -y publedge` for any MCP-aware agent client.
- `mcpName` field in `package.json` matching the Official MCP Registry submission (`io.github.snapsynapse/publedge`).
- `bin` entry registers `publedge` as a CLI; the existing `mcp-server.js` runs as the canonical executable.
- `files` whitelist restricts the npm tarball to the runtime surface (mcp-server.js, project.yml, scripts/lib, data/examples, mcp.json, licenses, README, PROTOCOL).
- Engine pin moved to `node >=20` to match the rest of the PAICE legal graph MCP servers (`every-ai-law`, `ai-incident-law`).

## [0.1.1-pre] — 2026-05-30

Security hardening and release-readiness patch.

### Added
- Obligation-First v0.1 binding export under `/api/v1/of/`, with companion JSON records for authorities, instruments, terms, obligations, and determinations.
- `npm run validate:of` bridge validation using the Obligation-First adopter kit, plus CI coverage for the generated binding.
- Parser regression eval covering quoted frontmatter keys and URL scalar list values.
- Verification allowlist for relationship-only instruments that preserve amendment/supersession chains without standalone obligation mappings.
- Evals for MCP URL boundaries, MCP parser lockstep, verification allowlist semantics, generated-output normalization, and manifest scope coverage.

### Fixed
- MCP `fetch_by_url` now rejects cross-origin, non-HTTPS, protocol-relative, encoded-slash, backslash, whitespace/control-character, query-string, and fragment URL forms instead of stripping arbitrary origins and matching only by path.
- MCP record loading now uses the shared parser/content loader instead of duplicated YAML and container parsing logic.
- YAML-lite parsing now preserves quoted keys such as `"@type"` as `@type` and keeps URL list entries such as `publication_citations` as scalar strings instead of malformed objects.
- MCP frontmatter parsing now matches the shared parser used by the build and validation scripts.
- `/definitions/` no longer emits a broken relative link to `PROTOCOL.md`.
- `MANIFEST.yaml` now matches the current `project.yml` hash.

## [0.1.0-pre] — 2026-04-22

### Added
- Protocol specification (`PROTOCOL.md`) and prior-art survey (`PRIOR-ART.md`)
- 14 demonstration instruments across 7 authorities (Utah OAIP, SEC Corp Fin, CFPB, IRS Chief Counsel, IRS TEGE, CFTC DSIO, Utah Legislature) and 7 instrument types (JIA, RMA, no-action letter, advisory opinion, private letter ruling, interpretive letter, statute)
- 26 first-class obligation records mapped to instruments via `data/examples/mapping/index.yml` (14 mapping entries covering every instrument in the registry)
- Canonical hierarchical URL architecture: `/{country}/{jurisdiction}/{authority}/{type}/{instance}/`; stable identifier scheme `{jurisdiction}-{authority}-{kind}-{YYYY-NNN}`; 301 redirect stubs from legacy `/container/{id}/` paths
- Four Utah statutes ingested as first-class instrument records (SB 149, SB 226, HB 452, HB 320)
- Status vocabulary (9 values) with `DEFINITIONS.md` and rendered `/definitions/` page
- Disclaimer & Source Policy at `/reference/disclaimer/`
- Frontmatter spec v0.2: decoupled `@type` from `obligation_kind`; shared interpretive-instrument core fields; withdrawal triplet; redaction_level; renderer-composed disclaimer
- JSON Schemas (`schema/jia.schema.json`, `schema/rma.schema.json`); JSON-LD context (`schema/context.jsonld`) binding to Semantic Arts gist IRIs
- JSON Schema draft 2020-12 at `/schema/json/record.schema.json` for the `record.json` payload shape
- MANIFEST.yaml with skill-provenance-style SHA-256 hash integrity across every canonical file
- 5 JIA/RMA templates under `_templates/`
- Unified site generator (`scripts/build.js` + `scripts/build-extras.js`); cross-reference validator (`scripts/validate.js`); structural validator (`scripts/verify.js`); hash validator (`scripts/validate-hashes.sh`); link checker; OCR helper
- JSON API under `/api/v1/` (containers, primaries, authorities, mappings, matrix, comparisons, upcoming, recently-changed, index manifest)
- Source PDFs + OCR text co-located with Utah OAIP RMA records
- `calendar.ics` (iCal enforcement calendar); `feed.xml` (RSS 2.0); `feed.json` (JSON Feed 1.1); `atom.xml` (Atom 1.0)
- Agent-discovery surfaces: `llms.txt`, `agents.json`, `robots.txt` with explicit allow for 25 AI and SEO crawlers
- `Schema.org` JSON-LD across the site: `LegalDocument` on every record; `WebSite` + `Organization` + `DataCatalog` `@graph` on the homepage; `ItemList` on `/instruments.html`, `/obligations.html`, `/authorities.html`; `Dataset` on `/matrix.html`; `DefinedTermSet` on `/definitions/`; `Article` on `/about/`; `DigitalDocument` on `/reference/disclaimer/`
- Split sitemap index with 7 per-section sitemaps (`records`, `authorities`, `statutes`, `reference`, `templates`, `bridges`, `meta`)
- MCP server (`mcp-server.js`) exposing 13 read-only tools: filtered instrument listing, URL-based fetch, entity-scoped search, coverage matrix, mappings, upcoming milestones, recently-changed records
- Reference pages: Protocol, Prior Art, Registry, Vocabulary, Disclaimer
- Jurisdiction index pages at every hierarchy level (`/us/`, `/us/utah/`, `/us/utah/oaip/`, etc.)
- Utah landing at `/us/utah/` with narrative + four-chapter statute map
- Browseable UI: per-column sort/filter, keyboard shortcuts (`/`, `?`, `j/k`), rich ARIA search, freshness badges, anchor-copy buttons, print stylesheet, jurisdiction chips, prev/next sibling nav, changelog strip, schema-completeness warnings
- `publedge-source-ingest` skill for authored ingestion
- Agent-readiness audit artifact at `audits/agent-readiness-2026-04-22.md`

### Changed
- Registry-as-Dataset positioning throughout: homepage, README, and llms.txt emphasize `DataCatalog` semantics rather than service-site patterns
- Status defaults for permission and enforcing colors moved to a WCAG 2.1 AA compliant green (`#1f7a43`, 5.8:1 on white) in `project.yml`
- Dark-mode foreground colors remapped to the link token so navy-on-dark text selectors pass 4.5:1 contrast
- Open Graph `og:image` URL concatenation corrected (prior `//imgs/og.png` double slash); `twitter:site` no longer emits `[object Object]` from the YAML empty-string parser path
- Homepage `og:title` now includes site name + tagline instead of bare "Home"
- Homepage "Obligations" section replaced with a three-card group summary (Requirements / Restrictions / Permissions) plus a four-card "Most cross-cutting" row

### Fixed
- Axe-core WCAG 2.1 AA violations: color-contrast (34 instances), link-name on compare bridge CTAs (2 instances), region landmark on site banner (33 instances), heading-order on `/reference/` (1 instance)
- Favicon 404: `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` declared on every generated and hand-authored page
- `NaNd` rendering in upcoming-milestones widget when a record has `effective: null` (YAML parser returned string `"null"`)
- Nested `<a>` inside `<a>` in homepage "Use PubLedge" card grid; cards now use `<div>` with a linked title
- `generateCompareBridge` emitted empty CTA anchors because containers use `.title` not `.name`; fixed the fallback chain

### Infrastructure
- GitHub Pages source set to `main /docs`
- CI: pa11y-ci WCAG 2.1 AA pass across every URL in the sitemap on every push and pull request; docs/ sync check; hash validation
- `.gitignore` aligned to portfolio hygiene baseline (`.env.*` glob, `__pycache__/`, `*.pyc`, `dist/`, `build/`, `.venv/`, `venv/`)

[Unreleased]: https://github.com/snapsynapse/publedge/compare/v0.1.2-pre...HEAD
[0.1.2]: https://github.com/snapsynapse/publedge/compare/v0.1.1-pre...v0.1.2-pre
[0.1.1]: https://npmjs.com/package/publedge/v/0.1.1
[0.1.1-pre]: https://github.com/snapsynapse/publedge/compare/v0.1.0-pre...v0.1.1-pre
[0.1.0-pre]: https://github.com/snapsynapse/publedge/releases/tag/v0.1.0-pre
