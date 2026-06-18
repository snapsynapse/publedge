---
created: 2026-04-19
type: roadmap
project: publedge
status: living
---

# PubLedge Roadmap

Living housekeeping document. Tracks what shipped, what's pending, and what's deferred. Updated as milestones move. The original workshop plan lives at [_workshop/ROADMAP.md](_workshop/ROADMAP.md) and is frozen as historical record.

## Current version

`v0.1.1-pre` — hardening release, published 2026-05-30. Drafting continues in public toward v0.2.

## What shipped (as of 2026-04-21)

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
- Private snapshot staged under `_private/lawyer-snapshot/` for external reviewers

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

Shipped 2026-04-21 (canonical URL architecture + status vocabulary + EAL UI parity):

- Canonical hierarchical URL paths: `/{country}/{jurisdiction}/{authority}/{type}/{YYYY-NNN}/`
- Stable identifier scheme finalised: `{jurisdiction}-{authority}-{kind}-{YYYY-NNN}` (e.g. `us-ut-oaip-rma-2025-001`); filenames match.
- `record.json` per instrument — Schema.org `LegalDocument` JSON-LD, served at canonical URL + `/record.json`.
- Legacy `/container/{old-id}/` paths emit meta-refresh redirect stubs.
- Jurisdiction index pages at every hierarchy level (`/us/`, `/us/utah/`, `/us/utah/oaip/`, etc.).
- Utah landing at `/us/utah/` with narrative + 4-chapter statute map.
- 5 Utah statutes ingested as first-class instrument records (`us-ut-legislature-statute-*`); `utah-legislature` authority added. Registry now 18 instruments, 8 authorities, 2 jurisdictions.
- Status vocabulary expanded to 9 values; `DEFINITIONS.md` added; `/definitions/` page renders it.
- PubLedge Disclaimer & Source Policy at `/reference/disclaimer/`; footer "Not legal advice" links there.
- Source PDFs + OCR'd text linked from Utah RMA records; `scripts/ocr-pdf.sh` added.
- `calendar.ics`, `api/v1/upcoming.json`, `api/v1/recently_changed.json` added.
- UI: per-column sort/filter, keyboard shortcuts (`/`, `?`, `j/k`), rich ARIA search, freshness badges, anchor-copy buttons, print stylesheet, jurisdiction chips, prev/next sibling nav, changelog strip, schema-completeness warnings.
- `assets/theme.js` shared theme + disclaimer-banner injector for hand-crafted pages.
- Protocol content moved from `/reference/protocol/` → `/about/` (redirect stub retained).
- Navigation: `Instruments`, `Obligations`, `Definitions`, `Authorities` pages.
- Copyright → PAICE.work PBC.
- `build.js` + `build-extras.js` dual-script pipeline; `npm run build` alias retained.

Shipped 2026-04-21 (obligations + mapping extraction):

- 25 new obligation records under `data/examples/obligations/` (1 → 26 total): 6 Utah statute obligations drawn from SB 149, SB 226, HB 452, HB 320; 14 Utah OAIP RMA obligations (6 cross-RMA shared + ElizaChat, Dentacor, Doctronic/Legion-specific); 5 federal obligations (CFPB pay-to-pay, CFTC unbundled-fee, IRS incentive-fee PLR, IRS 501(c)(3) adverse PLR, SEC Rule 506(c)).
- 13 new mapping entries in `data/examples/mapping/index.yml` (1 → 14): every instrument in the registry now maps to one or more obligations.
- Homepage stats move from 1 → 26 obligations, 1 → 14 provisions mapped; `/matrix.html` shows filled cells across the full registry; `/obligations.html` groups obligations by requirement/restriction/permission; 47 `requires/*` bridge pages auto-generated.
- SB 271 personal-identity-abuse obligation deferred — no SB 271 instrument record yet in PubLedge.

Shipped 2026-04-22 (agent-surface expansion):

- JSON-LD on every top-level page: homepage `@graph` with `WebSite` + `Organization` + `DataCatalog` + 3 child `Dataset` nodes with `DataDownload` distributions; `ItemList` on `/instruments.html`, `/obligations.html`, `/authorities.html`; `Dataset` on `/matrix.html`; `DefinedTermSet` on `/definitions/`; `Article` on `/about/`; `DigitalDocument` on `/reference/disclaimer/`. `renderPageShell` extended to accept `structuredData` parameter so any future page can inherit.
- Split sitemap: `sitemap.xml` is now a sitemap index; per-section files at `sitemap-records.xml`, `sitemap-authorities.xml`, `sitemap-statutes.xml`, `sitemap-reference.xml`, `sitemap-templates.xml`, `sitemap-bridges.xml`, `sitemap-meta.xml`.
- Additional feeds: `feed.json` (JSON Feed 1.1) and `atom.xml` (Atom 1.0) alongside the existing RSS 2.0 `feed.xml`; all three pull from the 14-record recently-changed set.
- `schema/json/record.schema.json` (JSON Schema draft 2020-12) shipped for the `record.json` payload shape; served at the canonical URL on every agent-readable record.
- MCP server extended: `list_<containers>` now accepts `jurisdiction`/`authority`/`type`/`status` filters; new tools `fetch_by_url`, `search_obligations`, `get_upcoming`, `get_recently_changed`; canonical URL helpers in server mirror `build.js::attachCanonicalPaths`. 13 tools total, stdio JSON-RPC smoke-tested.
- `robots.txt` gained explicit `Allow: /` entries for 17 AI crawlers (GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-Web, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, cohere-ai, CCBot, Bytespider, Amazonbot, Meta-ExternalAgent, Meta-ExternalFetcher, DuckAssistBot). Prior generic `User-agent: *` allow retained for crawlers not in the list.
- Open Graph meta fixes: `og:image` double-slash bug (siteUrl trailing slash + image leading slash) corrected; `twitter:site` no longer emits `[object Object]` from the YAML empty-string parser path; homepage `og:title` strengthened from bare `"Home"` to `"{site} — {tagline}"`.
- Homepage `Use PubLedge` card grid with six concrete CTAs: Browse registry, Cite a record, Run the MCP server, Contribute, Subscribe, Read the disclaimer. Obligations section redesigned from full list (26 cards) to a 3-card group summary (Requirements/Restrictions/Permissions with counts + anchor links) plus a 4-card "Most cross-cutting" row ranked by `regCount`.
- Favicon: `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` declared on every generated and hand-authored page (browsers previously 404'd `/favicon.ico`).
- Upcoming-milestones widget hardened against `effective: null` records (YAML parser returns string `"null"`, producing `NaNd`); explicit ISO-date guard added.

Shipped 2026-04-22 (accessibility remediation):

- Resolved all 70 axe-core instances across 4 rules from `.a11y-audit/audit-2026-04-22.md`:
  - `color-contrast` (34 instances, serious): permission green `#2a8a54` → `#1f7a43` (5.8:1 on white); recency "new" badge `#c8811a` → `#8b5a0a` (4.8:1); dark-mode foreground remap for 6 selectors (navy → link token) so tokens used as text on `#0c111c` pass 4.5:1.
  - `link-name` (2 instances, serious): `generateCompareBridge` emitted empty `.bridge-cta` anchors because `cA.name` / `cB.name` are undefined (containers use `.title`); fixed the fallback and added explicit "View " prefix.
  - `region` (33 instances, moderate): `renderSiteBanner` emitted `<div role="note">` which is outside every landmark (note is not a landmark role); changed to `<aside aria-label="Site disclaimer">` (aside is a complementary landmark by default).
  - `heading-order` (1 instance, moderate): `/reference/` had `<h1>` followed by `<h3>` on each card; promoted card headings to `<h2>`.
- Agent-readiness audit artifact at `audits/agent-readiness-2026-04-22.md` covers SNAP scoring pre- and post-remediation (pre: grade C, 77/100; post: grade C, 74/100 — score drift due to a new `readability.semanticStructure` check added to the siteline rubric between scans, not a regression).
- Rubric-improvement recommendations captured in LocalBrain (`1_Projects/Siteline/Rubric Recommendations from PubLedge Benchmark 2026-04-22.md`) and shared with siteline maintainer.

Shipped 2026-04-22 (frontmatter spec v0.2 enforcement):

- `scripts/lib/disclaimer.js` — shared `composeDisclaimer(source, status, override)` helper. Keys off `source` + `status`; per-file `disclaimer:` overrides are appended, not substituted. Extended the CONTENT-GUIDE §"Disclaimer composition" table to cover `authoritative-reference` (statute records) and the `enforcing` / `enacted` / `proposed` status values observed in the current registry. Flags `publedge-original-draft` × published-like status as a spec error.
- `scripts/build.js::renderRecordDisclaimer()` — composed disclaimer renders as `<aside class="record-disclaimer">` on every instrument detail page between the incomplete-metadata warning and the citation block. Schema.org `LegalDocument` `license` field now sources from the composed text.
- `scripts/build-extras.js` — template detail page uses the shared composer; `<dt>Disclaimer</dt>` row only emits when composed text is non-empty.
- `_templates/jia/*`, `_templates/rma/*` retrofitted to v0.2: `source: publedge-original-draft` added; per-file generic `disclaimer:` stripped (renderer composes the identical text). Authority-specific overrides (e.g. SEC staff caveat) would still live in the per-file field.
- `assets/styles.css` — `.record-disclaimer` + `.record-disclaimer-error` styling consistent with `.citation-block`.
- `schema/instrument.schema.json` — single JSON Schema 2020-12 file, polymorphic on `type` across all eight values currently in the registry (jia, rma, no-action-letter, advisory-opinion, private-letter-ruling, revenue-ruling, interpretive-letter, statute). `allOf` with `if`/`then` branches enforce type-specific requirements without the pain of per-type files. `schema/jia.schema.json` + `schema/rma.schema.json` retained so existing frontmatter `schema:` URLs continue to resolve.
- `scripts/validate.js` — four v0.2 cross-field checks: (1) `source: publedge-original-draft` × published-like status → error; (2) `type: rma` requires `issuing_authority` / `enforcement_authority` / `parties` AND a `term_start` (or `commencement_date_trigger` for deferred-commencement RMAs); (3) `type: private-letter-ruling` / `revenue-ruling` requires `redaction_level`; (4) withdrawal triplet (`withdrawn_date` / `withdrawal_reason` / `withdrawn_by_instrument`) is all-or-nothing. Registry passes clean on current 14 instruments.
- MANIFEST refreshed: all 25 hashes recomputed, stale `utah-mental-health-chatbot-disclosure-2026q2.md` path renamed to `us-ut-oaip-jia-2026-001.md` (ID-migration cleanup), new `schema/instrument.schema.json` added to provenance tracking.

## v0.1 — remaining before public freeze

| Item | Owner | Notes |
|---|---|---|
| Lawyer review checkpoint (SLC attorney, week of 2026-04-20) | Sam | Output may add paywall prior-art; review doc itself may ship as first meta-JIA |
| Private snapshot send (external reviewers first, hold legislators 24h) | Sam | Tarball already staged |
| us-ut-oaip-jia-2026-001 promotion draft → reviewed → published | — | Awaits lawyer review |
| repo-polish + promo-orchestrator | skill | Final step before v0.1 public |

Out of scope for v0.1:

- Newsletter / commentary stream
- Reverse links from everyailaw.com → publedge.org (one-way only for now)
- Cross-posting to dev.to / LinkedIn (deferred until public release)

## Frontmatter spec v0.2 — follow-ups

All five v0.2 enforcement items shipped 2026-04-22 (see "Shipped" entry above). Outstanding gap: polymorphic `instrument.schema.json` is declared but not yet wired into a CI step — `scripts/validate.js` enforces cross-field rules programmatically, but no schema-validator library runs the JSON Schema itself. Tracked as a v0.2 engineering item.

## v0.2 — more jurisdictions, lawyer-reviewed records, engineering

Triggered once Utah instance meets the six testable structural claims in the formative-intent note. The v0.2 obligations-curation and agent-surface items listed in the original plan shipped in the 2026-04-21 / 2026-04-22 sessions (see "What shipped" above).

**Content / editorial:**
- More jurisdictions: California, EU, UK — leverage EveryAILaw's coverage.
- Lawyer review + promote first batch of instruments from `status: enforcing` (editorial) to externally-reviewed.
- SB 271 (Utah personal-identity abuse) added as a first-class instrument record so the existing statute-level obligation has a home.

**Agent surface (follow-ons, not blocking):**
- `DefinedTerm` JSON-LD on individual obligation detail pages (currently top-level `ItemList` only).
- JSON-LD on `applies-to/*` bridge pages.
- Webhooks / push channel: GitHub Actions → Discord/Slack on new records; POST-subscribable `push.json` endpoint.
- Per-record "Cite this record" block (BibTeX, Bluebook, Hansard inline).
- Per-record provenance panel: render the MANIFEST SHA-256 plus git change history (when changed, by whom, supporting source) on each record page, so the existing integrity layer is visible without cloning. Pairs with the planned browser-side registry browser. Mechanism already exists (MANIFEST + git + CI drift-fail); this is rendering only, not new trust machinery.

**Engineering:**
- Signed commits + hash-chain verification enforcement in CI.
- Branch the repo; strip Utah-specific content to leave clean PubLedge protocol template. Mirror KaC ← AI Tool Watch pattern.
- Branch destination decision at branch time: `jia.publedge.org` subdomain or `github.com/snapsynapse/publedge-utah-jia`.
- Clean-URL migration: `/matrix.html` → `/matrix/`, `/compare.html` → `/compare/`, etc. (deferred from v0.1; ~30 touchpoints).
- Contribute upstream improvements to KaC template to eliminate `build-extras.js` as separate step.

## Regulator-trust track

Motivated by the question "what would a regulator value, and what smooths the initial approach." The posture constraint is load-bearing: with a regulator the risk is perceived neutrality, not missing features. Do not add anything ops-flavored here.

Spec landed (this session):
- `## Authority response` section in [PROTOCOL.md](PROTOCOL.md) + `authority_response` frontmatter field; `position` vocabulary in [DEFINITIONS.md](DEFINITIONS.md). Operator-agnostic response path (PR / issue / signed field). This is the single biggest objection-smoother: converts "watchdog pointed at us" into "a microphone we can speak through."
- Plain-language [/reference/verify/](reference/verify/index.html) page: non-engineer "confirm a record was not altered," no terminal required as the primary path. Linked from `/reference/`.

Wiring shipped 2026-06-18:
- `authority_response` added to the polymorphic record schema + `scripts/validate.js` cross-field rules (list shape, closed `position` enum, ISO date, `source` / `statement` guard).
- Renderer support: record pages render the `authority_response` block prominently above citation metadata, visually distinct from `disclaimer`, chronological, never destructive.
- `authority_response` added to the canonical frontmatter spec in [_workshop/CONTENT-GUIDE.md](_workshop/CONTENT-GUIDE.md).
- Regression coverage: `scripts/eval-authority-response.js` checks schema enum coverage and validator rejection of invalid response entries.

Wiring still owed (engineering, not blocking the regulator conversation):
- Confirm `/reference/verify/` is picked up by the sitemap reference section, `llms.txt`, and `/reference/` nav after build (page copies into `docs/` cleanly today; surface enumeration not yet verified).
- Pull the per-record provenance panel (already listed under Agent surface) forward from v0.2 for this audience; it is what the verify page points at.

Content (highest trust-per-unit-effort):
- One exemplary Utah OAIP record cited and labeled faithfully enough that the office recognizes its own thing. One strong record beats breadth. Accuracy is load-bearing; needs real source material or explicit hypothetical labeling.

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
| Retroactively ingest SEC no-action letters / IRS PLRs into PubLedge at scale? | Post-v0.1 editorial decision | Partially resolved: 14 demo instruments live (SEC, CFPB, IRS × 2, CFTC, Utah OAIP × 5, Utah Legislature × 4) with `source: demonstration-remap`. Full-corpus ingestion deferred. |
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
