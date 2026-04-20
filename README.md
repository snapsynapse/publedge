# PubLedge

[![CI](https://github.com/snapsynapse/publedge/actions/workflows/build.yml/badge.svg)](https://github.com/snapsynapse/publedge/actions/workflows/build.yml)
[![Spec](https://img.shields.io/badge/spec-v0.1.0--pre-blue)](PROTOCOL.md)
[![Registry](https://img.shields.io/badge/registry-10%20instruments%20%C2%B7%206%20authorities-informational)](data/examples/instruments/)
[![Content license: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-lightgrey)](LICENSE-CC-BY-4.0)
[![Code license: Apache 2.0](https://img.shields.io/badge/code-Apache%202.0-lightgrey)](LICENSE-APACHE)
[![Bound to gist](https://img.shields.io/badge/ontology-gist-green)](https://www.semanticarts.com/gist/)

Open recordkeeping protocol for fact-specific written interpretations between two parties — Joint Interpretation Agreements (JIAs), Regulatory Mitigation Agreements (RMAs), no-action letters, private letter rulings, advisory opinions, and analogous civic instruments (HOA decision logs, co-op governance records, flying-club asset agreements, and the like).

Plain markdown with structured frontmatter. Hash-pinned for integrity. Bound to the [Semantic Arts gist](https://www.semanticarts.com/gist/) upper ontology so records from different authorities can be queried together.

**Drafting in public. v0.1.0-pre. Subject to revision before the v0.1 freeze.**

## What this repo is

Three things in one place:

1. **The protocol** — the [PROTOCOL.md](PROTOCOL.md) specification and the [PRIOR-ART.md](PRIOR-ART.md) survey that motivates it.
2. **Utah-shaped reference content** — 5 JIA/RMA templates anchored to Utah's AI Policy Act (Utah Code §13-72a) and GenAI safe-harbor (§13-75-104), plus 10 demonstration instruments under `data/examples/instruments/` spanning 6 authorities (Utah OAIP, SEC, CFPB, IRS, CFTC) and 5 instrument types (JIA, RMA, no-action letter, advisory opinion, private letter ruling, interpretive letter).
3. **The published site** — rendered HTML under `docs/`, served by GitHub Pages from `main /docs`. Regenerate with `npm run build` before committing; CI fails if `docs/` drifts from sources.

## What this repo is not

- Not a regulator. PubLedge does not issue rulings.
- Not a law firm. Templates here are prior art, not legal advice.
- Not a CMS. Editors edit markdown in git.
- Not a blockchain. The integrity layer is plain SHA-256 over plain files.

## Quickstart

```bash
git clone https://github.com/snapsynapse/publedge.git
cd publedge
./scripts/validate-hashes.sh        # verify integrity
node scripts/validate.js            # cross-reference checks
npm run build                       # regenerate docs/ (Pages publish dir)
```

After intentional content edits, refresh hashes:

```bash
./scripts/validate-hashes.sh --update
```

CI runs all three of the above, plus a pa11y-ci WCAG 2.1 AA pass across
every URL in the sitemap, on every push and pull request.

## Repository layout

| Path | Purpose |
|---|---|
| `PROTOCOL.md` | The PubLedge specification |
| `PRIOR-ART.md` | Survey of analogous instrument programs |
| `MANIFEST.yaml` | SHA-256 hashes for every canonical file |
| `_templates/jia/`, `_templates/rma/` | Fill-in templates with `{{variable}}` placeholders |
| `data/examples/` | Reference instances of authorities, instruments, obligations, mappings (10 demonstration remaps: Utah OAIP × 5, SEC, CFPB, IRS × 2, CFTC) |
| `reference/` | Rendered HTML pages (protocol, prior-art, registry, vocabulary) |
| `tools/` | Rendered HTML pages (templates, planned tooling) |
| `vendor/gist/` | Pinned snapshot of the Semantic Arts gist core ontology |
| `scripts/` | Validators, build, hash check |
| `_workshop/` | Site ontology workshop output (taxonomy, sitemap, content guide, roadmap) |

The `_workshop/` directory documents the design decisions behind the layout above. Read [_workshop/TAXONOMY.md](_workshop/TAXONOMY.md), [_workshop/SITEMAP.md](_workshop/SITEMAP.md), and [_workshop/CONTENT-GUIDE.md](_workshop/CONTENT-GUIDE.md) before proposing structural changes.

## Contributing a JIA or RMA

1. Pick a template under `_templates/jia/` or `_templates/rma/`.
2. Replace every `{{variable_name}}` with the value applicable to your situation.
3. Update the frontmatter `id` from `{jurisdiction}-tpl-...` to a fresh `{jurisdiction}-{authority}-jia-{seq}` or `{jurisdiction}-{authority}-rma-{seq}` identifier (lowercase; see [PROTOCOL.md](PROTOCOL.md#identifiers-and-slugs)).
4. Set `status: draft` and add the parties' names under `parties:`.
5. Place the file under `data/registry/jia/` or `data/registry/rma/`.
6. Run `./scripts/validate-hashes.sh --update` so `MANIFEST.yaml` reflects the new file.
7. Open a pull request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full conventions.

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
| First registry instance (`us-ut-oaip-jia-0001` draft) | done |
| Hash-pinned integrity + CI verification | done |
| Discovery files (`llms.txt`, `agents.json`, `feed.xml`) | done |
| MCP server (`mcp-server.js`) | done |
| CLI validators (`scripts/validate.js`, `scripts/verify.js`) | done |
| JSON Schemas (`schema/jia.schema.json`, `schema/rma.schema.json`) + JSON-LD context | done |
| Unified site generator (KaC + reference + templates in `docs/`) | done |
| Frontmatter spec v0.2 (decoupled `@type`/`obligation_kind`, shared core fields, withdrawal lifecycle, redaction posture) | done |
| Federal demonstration remaps (SEC no-action, CFPB advisory, IRS PLRs × 2, CFTC interpretive letter) | done |
| Utah OAIP RMA demonstration remaps (ElizaChat, Dentacor, Doctronic, Legion Health) | done |
| Jurisdiction-scoped ID scheme (`{jurisdiction}-{authority}-{kind}-{seq}`) | done |
| `publedge-source-ingest` skill under `.claude/skills/` for authored ingestion pipeline | done |
| Private snapshot for pre-release review | staged |
| Lawyer review (SLC attorney, week of 2026-04-20) | pending |
| Canonical-spec landing + repo-polish + promo | planned at release |
| Clean-URL migration (all pages under directory paths) | planned for v0.2 |
| Browser-side registry browser + comparison tooling | planned for v0.2 |
| Branch-and-strip to reusable protocol template | planned for v0.2 |

See [ROADMAP.md](ROADMAP.md) for phasing, [HANDOFF.md](HANDOFF.md) for the next-session pickup brief, and [_workshop/ROADMAP.md](_workshop/ROADMAP.md) for the original workshop plan.
