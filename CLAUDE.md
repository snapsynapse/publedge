# CLAUDE.md — agent guidance for PubLedge

Concise orientation for AI agents working in this repo. See `AGENTS.md` for the
build-pipeline warnings (kept authoritative there; the key rule is repeated below).

## Purpose

PubLedge is an **open recordkeeping protocol** for fact-specific written
interpretations between two parties — Joint Interpretation Agreements (JIAs),
Regulatory Mitigation Agreements (RMAs), no-action letters, private letter
rulings, advisory opinions, interpretive letters, and analogous civic
instruments. Records are plain markdown with structured frontmatter, SHA-256
hash-pinned for integrity, and bound to the Semantic Arts *gist* upper ontology
so records from different authorities can be queried together.

It is the verifiable-records layer of the **PAICE legal graph** (alongside
EveryAILaw, AI Incident Law, and Obligation First). Canonical site:
https://publedge.org/ · Schema canon: https://obligationfirst.org/ · Portfolio
canon: https://paice.foundation/

This repo is three things at once: (1) the protocol spec (`PROTOCOL.md`),
(2) Utah-shaped + federal reference content under `data/examples/`, and (3) the
published static site under `docs/` (served by GitHub Pages from `main /docs`).

## Stack

- **Node.js >= 20**, plain ESM scripts under `scripts/` — no framework, no bundler.
- Content: markdown + YAML frontmatter; JSON Schema (draft 2020-12) + JSON-LD context in `schema/json/`.
- Static site: hand-written HTML generation in `scripts/build.js` + `scripts/build-extras.js`.
- `mcp-server.js`: standalone MCP server exposing 13 read-only tools. Published to npm as `publedge` (`io.github.snapsynapse/publedge`) and the Official MCP Registry (`server.json`).
- Integrity: `scripts/validate-hashes.sh` over `MANIFEST.yaml`.
- Ontology: pinned *gist* snapshot in `vendor/gist/`.

## Directory layout

| Path | Purpose |
|---|---|
| `PROTOCOL.md` | The specification (spec version `v0.1.2-pre`, decoupled from npm version) |
| `PRIOR-ART.md`, `DEFINITIONS.md` | Prior-art survey; canonical vocabulary |
| `MANIFEST.yaml` | SHA-256 hashes for every canonical file |
| `_templates/jia/`, `_templates/rma/` | Fill-in templates with `{{variable}}` placeholders |
| `data/examples/instruments/` | Demonstration instruments; filename = stable id |
| `data/examples/authorities/`, `obligations/`, `mapping/` | Authority records, obligation defs, obligation-to-statute mapping |
| `docs/` | **Generated** site (HTML, `api/v1/*.json`, feeds, discovery files) |
| `about/`, `reference/` | Hand-crafted source HTML copied into `docs/` |
| `schema/json/` | JSON Schemas + JSON-LD context |
| `scripts/` | Build, validators, and `eval-*.js` conformance checks |
| `scripts/lib/` | Shared parser/library code (shipped in npm package) |
| `vendor/gist/` | Pinned Semantic Arts gist ontology snapshot |
| `_workshop/` | Frozen design-decision record (taxonomy, sitemap, content guide) |
| `audits/`, `.a11y-audit/` | Agent-readiness + accessibility audit artifacts |

## Build / test / validate (from docs — do not assume; run explicitly)

```bash
./scripts/validate-hashes.sh          # verify content integrity
node scripts/validate.js              # cross-reference + frontmatter checks
npm run build                         # build.js + build-extras.js -> regenerate docs/
npm run verify                        # freshness / drift check (also runs weekly in CI)
```

After **intentional** content edits, refresh hashes with
`./scripts/validate-hashes.sh --update`. To validate the Obligation-First
binding, check out `snapsynapse/obligation-first` beside this repo (or set
`OBLIGATION_FIRST_DIR`) then `npm run validate:of`. Numerous `eval:*` scripts in
`package.json` are the conformance gates (record-schema, mcp-contract,
deterministic-build, discovery, links, etc.).

## Critical convention (from AGENTS.md)

**`docs/` is generated, not source.** Never hand-edit generated `.html`,
`docs/api/v1/*.json`, feeds, `llms.txt`, `agents.json`, or `sitemap*.xml` — they
are overwritten by the build. Edit at the source level (`scripts/`, `data/`,
`about/`, `reference/`), then run `npm run build` and commit source **and** its
regenerated `docs/` output together. CI fails if `docs/` drifts from sources.
When unsure whether a file is generated, `grep scripts/` for its path first.

Instrument ids follow `{jurisdiction}-{authority}-{type}-{YYYY-NNN}` and the
filename must match the id. See `README.md` "Contributing an instrument" and
`CONTRIBUTING.md` for the full workflow.

## CI

- `.github/workflows/build.yml` — on push/PR to `main`: hash check, cross-ref
  validate, build, Obligation-First binding validate, clean-build (docs drift)
  check, internal link check, and a WCAG 2.1 AA a11y pass (`skill-a11y-audit`)
  over every sitemap URL.
- `.github/workflows/verify.yml` — weekly (Mon 09:00) + manual: runs
  `scripts/verify.js`, auto-opening/updating a `knowledge-drift` issue on failure.

## Current state (2026-07)

Public and maintained. The MCP server is published to npm + MCP Registry
(v0.1.2, stable). PubLedge is the thin recordkeeping convention of the PAICE
legal graph. Standalone product expansion is parked pending a concrete demand
signal. Active work is routine maintenance, existing-record fidelity,
Obligation-First compatibility, authority responses, and integration required
by an active downstream consumer. See `INTENT.md` for authoritative strategy
and `ROADMAP.md` for maintenance work.
