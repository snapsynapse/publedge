# PubLedge

[![CI](https://github.com/snapsynapse/publedge/actions/workflows/build.yml/badge.svg)](https://github.com/snapsynapse/publedge/actions/workflows/build.yml)
[![Spec](https://img.shields.io/badge/spec-v0.1.0--pre-blue)](PROTOCOL.md)
[![Registry](https://img.shields.io/badge/registry-14%20instruments%20%C2%B7%207%20authorities-informational)](data/examples/instruments/)
[![Content license: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-lightgrey)](LICENSE-CC-BY-4.0)
[![Code license: Apache 2.0](https://img.shields.io/badge/code-Apache%202.0-lightgrey)](LICENSE-APACHE)
[![Bound to gist](https://img.shields.io/badge/ontology-gist-green)](https://www.semanticarts.com/gist/)

Open recordkeeping protocol for fact-specific written interpretations between two parties — Joint Interpretation Agreements (JIAs), Regulatory Mitigation Agreements (RMAs), no-action letters, private letter rulings, advisory opinions, and analogous civic instruments (HOA decision logs, co-op governance records, flying-club asset agreements, and the like).

Plain markdown with structured frontmatter. Hash-pinned for integrity. Bound to the [Semantic Arts gist](https://www.semanticarts.com/gist/) upper ontology so records from different authorities can be queried together.

**Drafting in public. v0.1.0-pre. Subject to revision before the v0.1 freeze.**

## What this repo is

Three things in one place:

1. **The protocol** — the [PROTOCOL.md](PROTOCOL.md) specification and the [PRIOR-ART.md](PRIOR-ART.md) survey that motivates it.
2. **Utah-shaped reference content** — 5 JIA/RMA templates anchored to Utah's AI Policy Act (Utah Code §13-72a) and GenAI safe-harbor (§13-75-104), plus 14 demonstration instruments under `data/examples/instruments/` spanning 7 authorities (Utah OAIP, SEC, CFPB, IRS Chief Counsel, IRS TEGE, CFTC, Utah Legislature) and 6 instrument types (JIA, RMA, no-action letter, advisory opinion, private letter ruling, interpretive letter, statute).
3. **The published site** — rendered HTML under `docs/`, served by GitHub Pages from `main /docs`. Regenerate with `node scripts/build.js && node scripts/build-extras.js` before committing; CI fails if `docs/` drifts from sources.

## What this repo is not

- Not a regulator. PubLedge does not issue rulings.
- Not a law firm. Templates here are prior art, not legal advice.
- Not a CMS. Editors edit markdown in git.
- Not a blockchain. The integrity layer is plain SHA-256 over plain files.

## Quickstart

```bash
git clone https://github.com/snapsynapse/publedge.git
cd publedge
./scripts/validate-hashes.sh           # verify integrity
node scripts/validate.js               # cross-reference checks
node scripts/build.js                  # regenerate docs/ entity pages + API
node scripts/build-extras.js           # copy reference HTML, feeds, discovery files
```

After intentional content edits, refresh hashes:

```bash
./scripts/validate-hashes.sh --update
```

CI runs all of the above, plus a pa11y-ci WCAG 2.1 AA pass across every URL in the sitemap, on every push and pull request.

## Repository layout

| Path | Purpose |
|---|---|
| `PROTOCOL.md` | The PubLedge specification |
| `PRIOR-ART.md` | Survey of analogous instrument programs |
| `DEFINITIONS.md` | Canonical vocabulary (status values, instrument types, obligation kinds) |
| `MANIFEST.yaml` | SHA-256 hashes for every canonical file |
| `_templates/jia/`, `_templates/rma/` | Fill-in templates with `{{variable}}` placeholders |
| `data/examples/instruments/` | 14 demonstration instruments; filename = stable id (e.g. `us-ut-oaip-rma-2025-001.md`) |
| `data/examples/authorities/` | Authority records for each issuing body |
| `data/examples/obligations/` | Obligation definitions linked from instruments |
| `data/examples/mapping/` | Obligation-to-statute mapping index |
| `about/` | Hand-crafted `/about/` source page (copied verbatim into `docs/`) |
| `reference/` | Hand-crafted reference HTML (prior-art, disclaimer, vocabulary) |
| `schema/json/` | JSON Schemas + JSON-LD context |
| `vendor/gist/` | Pinned snapshot of the Semantic Arts gist core ontology |
| `scripts/` | Validators (`validate.js`, `verify.js`), build (`build.js`, `build-extras.js`), hash check |
| `_workshop/` | Site ontology workshop output (taxonomy, sitemap, content guide, roadmap) |

The `_workshop/` directory documents the design decisions behind the layout above. Read [_workshop/TAXONOMY.md](_workshop/TAXONOMY.md), [_workshop/SITEMAP.md](_workshop/SITEMAP.md), and [_workshop/CONTENT-GUIDE.md](_workshop/CONTENT-GUIDE.md) before proposing structural changes.

## Contributing an instrument

1. Pick template under `_templates/jia/` or `_templates/rma/`.
2. Replace every `{{variable_name}}` with applicable values.
3. Set `id` to `{jurisdiction}-{authority}-{type}-{YYYY-NNN}` (e.g. `us-ut-oaip-rma-2025-003`). Filename must match: `us-ut-oaip-rma-2025-003.md`.
4. Set `status: draft`. Add parties under `parties:`.
5. Place file under `data/examples/instruments/`.
6. Run `./scripts/validate-hashes.sh --update` to refresh `MANIFEST.yaml`.
7. Run `node scripts/build.js && node scripts/build-extras.js` to verify site regenerates cleanly.
8. Open a pull request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full conventions including obligation entries, source PDFs, and OCR workflow.

## License

PubLedge is dual-licensed:

- **Content** (markdown, YAML, HTML) — [CC-BY 4.0](LICENSE-CC-BY-4.0)
- **Code** (scripts, schemas, build tooling) — [Apache 2.0](LICENSE-APACHE)

See [LICENSE](LICENSE) for the split. Vendored snapshots retain their upstream licenses; the [pinned gist core ontology](vendor/gist/) is CC-BY 4.0 (Semantic Arts). Full credits in [ATTRIBUTION.md](ATTRIBUTION.md).

## Built on

- [Knowledge as Code](https://knowledge-as-code.com) — the four-role entity pattern (Authority / Container / Secondary / Primary) PubLedge inherits.
- [gist (Semantic Arts)](https://www.semanticarts.com/gist/) — open upper ontology bound to PubLedge entities.
- [Every AI Law](https://everyailaw.com) — preferred source for statute-anchor URLs in `statute_anchors[]`.
- [skill-provenance](https://skillprovenance.dev) — hash-mechanism pattern adapted for `validate-hashes.sh`. PubLedge does not adopt the full skill-provenance protocol.

## Status and roadmap

| Milestone | Status |
|---|---|
| Workshop, taxonomy, sitemap, content guide | done |
| Protocol specification (`PROTOCOL.md`) | done |
| Prior-art survey (`PRIOR-ART.md`) | done |
| Initial Utah templates (3 JIA, 2 RMA) | done |
| First registry instance (`us-ut-oaip-jia-2026-001`) | done |
| Hash-pinned integrity + CI verification | done |
| Discovery files (`llms.txt`, `agents.json`, `feed.xml`) | done |
| MCP server (`mcp-server.js`) | done |
| CLI validators (`scripts/validate.js`, `scripts/verify.js`) | done |
| JSON Schemas + JSON-LD context (`schema/json/`) | done |
| Unified site generator (`build.js` + `build-extras.js`) | done |
| Frontmatter spec v0.2 | done |
| 9 federal + Utah demonstration remaps | done |
| 4 Utah statutes as first-class instrument records | done |
| Canonical URL architecture (`/{country}/{jurisdiction}/{authority}/{type}/{YYYY-NNN}/`) | done |
| `record.json` per instrument (Schema.org LegalDocument JSON-LD) | done |
| `calendar.ics`, `api/v1/upcoming.json`, `api/v1/recently_changed.json` | done |
| Status vocabulary (9 values) + `DEFINITIONS.md` + `/definitions/` page | done |
| `publedge-source-ingest` skill for authored ingestion | done |
| Disclaimer & Source Policy at `/reference/disclaimer/` | done |
| Private snapshot for pre-release review | staged |
| Lawyer review (SLC attorney, week of 2026-04-20) | pending |
| repo-polish + promo-orchestrator + public announcement | planned at release |
| Browser-side registry browser + comparison tooling | planned for v0.2 |
| Branch-and-strip to reusable protocol template | planned for v0.2 |

See [ROADMAP.md](ROADMAP.md) for phasing, [HANDOFF.md](HANDOFF.md) for the next-session pickup brief, and [_workshop/ROADMAP.md](_workshop/ROADMAP.md) for the original workshop plan.
