---
created: 2026-04-19
type: roadmap
project: publedge
status: living
---

# PubLedge Roadmap

Living housekeeping document. Tracks what shipped, what's pending, and what's deferred. Updated as milestones move. The original workshop plan lives at [_workshop/ROADMAP.md](_workshop/ROADMAP.md) and is frozen as historical record.

## Current version

`v0.1.0-pre` — drafting in public. Freeze target: within days of 2026-04-18 workshop.

## What shipped (as of 2026-04-19)

Inherited free from the Knowledge-as-Code template at bootstrap:

- MCP server (`mcp-server.js`) exposing `list_*`, `get_*`, `search`, `get_matrix`, `get_mappings` tools driven by `project.yml`. Read-only, stdio transport. Client config at `mcp.json`.
- CLI validators: `scripts/validate.js` (cross-reference checks), `scripts/verify.js` (structural checks), `scripts/validate-hashes.sh` (MANIFEST integrity), `scripts/check-links.js`, `scripts/build.js`.

Authored for PubLedge:

- `PROTOCOL.md` — protocol specification
- `PRIOR-ART.md` — prior-art survey (Utah 63M-17, SEC no-action, IRS PLRs, CFPB advisory, Utah court forms)
- Utah JIA + RMA templates under `_templates/` with gist `@type` in frontmatter
- `data/examples/instruments/utah-mental-health-chatbot-disclosure-2026q2.md` — **us-ut-oaip-jia-0001**, first registry instance (draft)
- Workshop outputs under `_workshop/` (TAXONOMY, SITEMAP, CONTENT-GUIDE, ROADMAP)
- `vendor/gist/` pinned snapshot of `gistCore.ttl` with `VERSION.md` note
- `ATTRIBUTION.md` citing gist (CC-BY 4.0, Semantic Arts)
- MANIFEST.yaml with skill-provenance-style hash tracking (24 files)
- Private snapshot staged under `_private/lawyer-snapshot/` for Boyd + Cullimore + Moss + Cutler

Shipped 2026-04-19 (engineering + schema session):

- JSON Schemas: `schema/jia.schema.json`, `schema/rma.schema.json`
- JSON-LD context: `schema/context.jsonld` binding PubLedge properties to gist IRIs
- `@type` frontmatter on authorities, instruments, obligations (gist:GovernmentOrganization, gist:Agreement, gist:Requirement)
- Unified site generator (`scripts/build-extras.js`): copies `reference/**/*.html`, renders `_templates/**/*.md` → `/template/<slug>/` + `/templates/` index, copies MANIFEST/LICENSE/prose source/imgs/schema into `docs/`, renames feed → `feed.xml`, extends sitemap + llms.txt + agents.json with protocol/templates/MCP capabilities
- GitHub Pages source switched from `main /` to `main /docs`
- Root-level duplicate discovery files removed (index.html, 404.html, agents.json, llms.txt, sitemap.xml, robots.txt, feed.xml, CNAME) — all now generator-owned in `docs/`
- Navigation extended (project.yml): Protocol, Templates, Prior Art links visible on every page

Shipped 2026-04-19 (prior-art remap + spec v0.2 session):

- Frontmatter spec **v0.2** in [_workshop/CONTENT-GUIDE.md](_workshop/CONTENT-GUIDE.md): decoupled top-level `@type` (artifact class) from `obligation_kind` (posture chip); locked `type:` enum to seven values; new shared "Interpretive-instrument core fields" block used by JIA/RMA/no-action/advisory/PLR; new sections 2a–2d for no-action letters, advisory opinions, PLRs, and interpretive letters; canonical `statute_anchors[]` object shape `{cite, url}`; canonical authority pattern (both `authority:` slug and `issued_by:` typed block required); added `source`, `publication_citations[]`, withdrawal triplet (`withdrawn_date` / `withdrawal_reason` / `withdrawn_by_instrument`), `redaction_level`; replaced fixed per-file disclaimer with renderer-composed disclaimer keyed off `source` + `status`
- Three demonstration remaps under `data/examples/instruments/`:
  - [sec-latham-watkins-rule-506c-2025.md](data/examples/instruments/sec-latham-watkins-rule-506c-2025.md) — SEC no-action letter (Rule 506(c) verification, 2025-03-12); exercises `obligation_kind: [permission]` + `reliance_scope: similarly-situated-third-parties`
  - [cfpb-pay-to-pay-fees-2022.md](data/examples/instruments/cfpb-pay-to-pay-fees-2022.md) — CFPB advisory opinion (Pay-to-Pay Fees, Reg F, 2022-06-29); exercises `obligation_kind: [restriction]` + `reliance_scope: public` + `requesting_party: null`
  - [irs-plr-202506001.md](data/examples/instruments/irs-plr-202506001.md) — IRS PLR 202506001 (§141 management contracts, 2025-02-07); exercises `reliance_scope: requesting-party-only` + `redaction_level: full` + PDF-only source
- Utah us-ut-oaip-jia-0001 demo retrofitted to v0.2 frontmatter
- [PRIOR-ART.md](PRIOR-ART.md) updated with "Reference remaps" section linking the three demo instruments

Shipped 2026-04-19 (late session — Utah RMA quartet + federal expansions + ID migration):

- Six new demonstration instruments under `data/examples/instruments/` ingested via `publedge-source-ingest` skill:
  - [irs-plr-202614036.md](data/examples/instruments/irs-plr-202614036.md) — IRS adverse PLR, §501(c)(3) denial (2026-01-12); exercises `obligation_kind: [restriction]` in a PLR, dual-letter structure, `authority: irs-tege` (second distinct IRS sub-agency)
  - [cftc-fia-cta-registration-2017.md](data/examples/instruments/cftc-fia-cta-registration-2017.md) — CFTC Letter 17-65, CTA registration / MiFID II unbundling (2017-12-11); first `type: interpretive-letter` in registry
  - [utah-elizachat-teen-mental-health-2024.md](data/examples/instruments/utah-elizachat-teen-mental-health-2024.md) — `us-ut-oaip-rma-0001`; incident-triggered 30-day cure forbearance, phased school-district rollout, pre-§13-77 GenAI disclosure anchor
  - [utah-dentacor-ai-radiograph-2025.md](data/examples/instruments/utah-dentacor-ai-radiograph-2025.md) — `us-ut-oaip-rma-0002`; scope-of-practice RMA for non-prescribing profession, single-statute forbearance (§58-69-5)
  - [utah-doctronic-rx-renewal-2025.md](data/examples/instruments/utah-doctronic-rx-renewal-2025.md) — `us-ut-oaip-rma-0003`; three-party contract, multi-statute mitigation bundle across seven prescriber chapters
  - [utah-legion-health-psych-refill-2026.md](data/examples/instruments/utah-legion-health-psych-refill-2026.md) — `us-ut-oaip-rma-0004`; two-entity participant, deferred Commencement Date (`term_start: null`), statute-renumbering straddle (§13-72-302 → §13-72-401), two-tier affiliated-provider forbearance
- **Jurisdiction-scoped ID migration**: IDs changed from `PL-{KIND}-NNNN` to `{jurisdiction}-{authority}-{kind}-{seq}`, lowercase, with native document numbers preserved (`us-irs-plr-202506001`, `us-cftc-il-17-65`) and zero-padded sequences scoped to `{jurisdiction, kind}` by effective date (`us-ut-oaip-rma-0001`..`0004`). Bare `us` replaces `us-federal`. Schema regex patterns, `PROTOCOL.md` identifier section, `SKILL.md` Phase 4 spec, and all templates/docs updated.
- Registry totals: 10 instruments spanning 6 authorities (Utah OAIP, SEC, CFPB, IRS Chief Counsel, IRS TEGE, CFTC DSIO) and 5 instrument types (`jia`, `rma`, `no-action-letter`, `advisory-opinion`, `private-letter-ruling`, `interpretive-letter`). Every value of `obligation_kind` and `reliance_scope` is now exercised by at least one instrument.
- [PRIOR-ART.md](PRIOR-ART.md) expanded with the four Utah RMAs + CFTC interpretive letter + IRS adverse PLR rows; count updated 3 → 9 remaps.

## v0.1 — remaining before public freeze

| Item | Owner | Notes |
|---|---|---|
| Lawyer review checkpoint (SLC attorney, week of 2026-04-20) | Sam | Output may add paywall prior-art; review doc itself may ship as first meta-JIA |
| Private snapshot send (Boyd first, hold legislators 24h) | Sam | Tarball already staged |
| us-ut-oaip-jia-0001 promotion draft → reviewed → published | — | Awaits lawyer review |
| canonical-spec-page rendered at publedge.org | skill | Decision made: keep KaC multi-page home instead — this item is CLOSED, not needed |
| repo-polish + promo-orchestrator | skill | Final step before v0.1 public |

Out of scope for v0.1:

- Newsletter / commentary stream
- Reverse links from everyailaw.com → publedge.org (one-way only for now)
- Cross-posting to dev.to / LinkedIn (deferred until public release)

## Frontmatter spec v0.2 — follow-ups

v0.2 spec landed in CONTENT-GUIDE.md 2026-04-19. Follow-up items needed before it can be enforced in CI:

| Item | Notes |
|---|---|
| Write polymorphic `schema/instrument.schema.json` | Single JSON Schema 2020-12 file with `type` as discriminator; replaces the per-type `schema:` URLs currently referenced by every instrument. Deprecate `jia.schema.json` / `rma.schema.json` once the polymorphic schema passes validation on all four demo files. |
| Update `scripts/validate.js` to enforce v0.2 | Cross-field rules: `source = publedge-original-draft` ∧ `status = published` → error; `type = rma` → require `enforcement_authority` + `term_length` + `review_date`; `type = private-letter-ruling` → require `redaction_level`; withdrawal triplet is all-or-nothing. |
| Update `_templates/jia/*` and `_templates/rma/*` frontmatter to match v0.2 | Currently v0.1 shape. Templates will break for new contributors until retrofitted. |
| Build renderer for composed disclaimer | Currently `disclaimer: ""` in every v0.2-retrofitted demo; renderer in `scripts/build-extras.js` must compose from `source` + `status` per the table in CONTENT-GUIDE.md §"Disclaimer composition". |
| Run `./scripts/validate-hashes.sh --update` | Many files changed under `data/examples/instruments/`, `_templates/`, `schema/`, `PROTOCOL.md`, etc. after the ID migration and RMA quartet; MANIFEST.yaml is now stale. |

## v0.2 — branch and strip + browser tooling + clean URLs

Triggered once Utah instance meets the six testable structural claims in the formative-intent note.

- Branch the repo; strip Utah-specific content to leave a clean PubLedge protocol template. Mirror KaC ← AI Tool Watch pattern.
- Branch destination decision at branch time: `jia.publedge.org` subdomain under this repo, or `github.com/snapsynapse/publedge-utah-jia` separate repo.
- **Clean-URL migration**: convert KaC tool pages (`/matrix.html` → `/matrix/`, `/compare.html` → `/compare/`, etc.) — deferred from v0.1 because it requires modifying ~30 touchpoints in the inherited KaC generator. Current mixed style (clean URLs for entity detail, `.html` for tools) is acceptable for v0.1.
- Browser-side registry browser + detail pages (native HTML; currently KaC renders all of these — this is actually already shipped in v0.1, needs only polish)
- Search UI wired to `assets/data.json` (index already generated)
- Contribute upstream improvements to KaC template so PubLedge doesn't need `build-extras.js` as a separate step

## Vocabulary / namespace evolution

PubLedge v0.1 binds to gist only. Extensions deferred until a forcing function appears.

- **Phase 1 (post-v0.1)** — mint extensions at `https://publedge.org/ns/`. Self-hosted, domain-tied. Document under `/reference/vocabulary/extensions/`.
- **Phase 2 (long-term, ~6 months of stable extensions)** — submit w3id.org PR for `https://w3id.org/publedge/ns/` for domain-independent persistence.

Candidate extensions: `StatuteCitation`, `HashChainEntry`, `PartySnapshot`.

## Open decisions (deferred)

Each needs a forcing function — date, dependency, or explicit trigger.

| Question | Forcing function | Default if unforced |
|---|---|---|
| Offer Nov 30 2026 annual-report section template as follow-on? | OAIP outreach response after v0.1 release | Defer to v0.2 conversation |
| Retroactively ingest SEC no-action letters / IRS PLRs into PubLedge at scale? | Post-v0.1 editorial decision | Partially resolved 2026-04-19: nine demo remaps live under `data/examples/instruments/` with `source: demonstration-remap` (SEC, CFPB, IRS × 2, CFTC, Utah OAIP × 4). Full-corpus ingestion remains deferred. |
| paice.foundation attribution at foundation-protocol level vs personal/snapsynapse? | Public release prep | List under PAICE portfolio at paice.foundation |
| PubLedge namespace at `publedge.org/ns/` minted? | First concept unexpressible in gist | Defer |
| w3id.org/publedge/ns/ PR submitted? | ~6 months stable extensions | Defer long-term |
| Reverse linking everyailaw.com → publedge.org? | Editorial decision after v0.1 release | One-way only (PubLedge → EveryAILaw) |
| Does MCP server expose hash-verified responses? | First client that needs integrity guarantees | Current server returns raw content |

## Cross-project dependencies

- **EveryAILaw**: worktree `cc/hungry-mayer-d26631` must merge to main + deploy to GitHub Pages before PubLedge JIA frontmatter URLs resolve. Mitigation: verify each cited URL during template drafting.
- **Knowledge-as-Code template** (`~/Git/knowledge-as-code-template`): architectural seed. Breaking upstream changes require coordinated update.
- **skill-provenance**: hashes generated at bootstrap must remain stable across Utah-instance → template strip.
- **PAICE-for-States (Utah)**: consumes PubLedge templates via MCP. PAICE-Utah is PubLedge-native; PubLedge governance stays neutral. See [hub analysis](https://snapsynapse.com/) — no PubLedge-side changes required for PAICE to integrate.

## Housekeeping

When a milestone moves:

1. Update the relevant table row in this file.
2. Update the README "Status and roadmap" table if the change is user-visible.
3. If a deferred decision forces, move it from the open-decisions table into v0.1 or v0.2 scope with owner.
4. Keep `_workshop/ROADMAP.md` untouched — it's the frozen workshop artifact.
