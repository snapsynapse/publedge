# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Not all v0.1.0-pre history is versioned separately; early drafting work was compressed into a single prerelease entry below. Subsequent releases are tracked individually.

## [0.1.3] - 2026-07-25

Adopter-conformance release. Brings PubLedge to Obligation-First Level 2 by publishing the naming profile the spec has required since obligation-first 0.4.0, and picks up the Colorado ADMT obligation work.

### Added

- **Obligation-First naming profile** at `/.well-known/obligation-first-naming-profile.jsonld`, with the tamper-evidence sidecar at `/.well-known/obligation-first-naming-profile-manifest.txt`. EveryAILaw and AI Incident Law have published one since obligation-first 0.4.0; PubLedge had not, despite being the adopter whose `@id` grammar diverges most from the spec's opacity guidance, so there was nothing to check that divergence against. Generated in `build-extras.js` rather than hand-placed, because `docs/` is build output. Declarations are descriptive: each `void:uriRegexPattern` is verified against all 112 published records, and `crosswalks` states what each entity type actually supplies (Obligation and Determination supply none today). Proceeding and Allegation are absent because PubLedge mints neither.
- **`npm run check:of`** asserts the obligation-first checkout in use satisfies the profile's declared range, delegating to the spec's shared `check-adopter-of-version.mjs` so the rule is not reimplemented here. The profile declares `obligation-first >=0.4.0 <0.6.0`: PubLedge publishes no `ObligationCategory` records, so it has no reason to floor at 0.5.0 and rides that additive release unchanged.
- Six Colorado ADMT obligation records extracted from SB 26-189 (C.R.S. §§6-1-1702 through 6-1-1706) and mapped to the statute: developer documentation to deployer, pre-decision consumer notice, 30-day post-adverse explanation, data correction and human review, three-year record retention, and the 60-day cure period. Registry obligations 26 → 32; mappings 14 → 15.
- Separate obligation legal-lifecycle vocabulary and schema, distinct from editorial maturity. Three never-operative SB 24-205 obligation records preserve its reasonable-care, impact-assessment, and consumer-rights duties without presenting them as current law. Registry obligations 32 → 35; mappings 15 → 16.

### Changed

- `RELEASE_NOTES-v0.1.2.md` renamed to `RELEASE_NOTES-v0.1.3.md`; version strings synced across `package.json`, `server.json`, `MANIFEST.yaml`, `PROTOCOL.md`, `README.md`, `PROJECT_CONTEXT.md`, and the generated site footer. Package `0.1.3` was published to npm and `io.github.snapsynapse/publedge` version `0.1.3` was published to the Official MCP Registry.
- Dropped the pre-release suffix from the protocol version: the spec is now `v0.1.2`, aligned with the stable MCP/npm package version. `RELEASE_NOTES-v0.1.2-pre.md` renamed to `RELEASE_NOTES-v0.1.2.md`.
- Removed SB 26-189 from `verification.allowed_unmapped_instruments`; it is the operative Colorado statute, not a relationship-only chain member. The allowlist now states its admission rule and a per-entry reason, and `eval-verification-allowlist` asserts that operative instruments stay out of it.
- Recorded the 2026-05 Colorado ingestion, the 2026-06/07 authority-response and release work, and this session in `ROADMAP.md`; corrected the registry totals attributed to the 2026-04-21 session.
- Upgraded GitHub-hosted `actions/checkout` and `actions/setup-node` from v4 to v5 for the Node 24 action runtime.

### Fixed

- `eval-generated-tree-parity` no longer fails purely with the passage of time. Build-date fields (`last_updated`, `today`, `days_until`, and the homepage `upcoming-days` countdown) are now normalised the way `eval-clean-build` and `eval-deterministic-build` already normalised their timestamps.

## [0.1.2] - 2026-07-21

Maintenance, adoption, and delivery hardening release. The protocol release tag is `v0.1.2`; the stable MCP/npm package version is `0.1.2`.

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

[Unreleased]: https://github.com/snapsynapse/publedge/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/snapsynapse/publedge/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/snapsynapse/publedge/compare/v0.1.1-pre...v0.1.2
[0.1.1]: https://npmjs.com/package/publedge/v/0.1.1
[0.1.1-pre]: https://github.com/snapsynapse/publedge/compare/v0.1.0-pre...v0.1.1-pre
[0.1.0-pre]: https://github.com/snapsynapse/publedge/releases/tag/v0.1.0-pre
