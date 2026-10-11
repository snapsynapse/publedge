---
created: 2026-10-11
type: decision-note
project: publedge
status: proposal
scope: repository
---

# PubLedge supply comparison (2026-10-11)

## Purpose and scope

This note is PubLedge's contribution to the Legal Graph supply comparison requested by the September 22 Moonshots portfolio decisions (PAICE Foundation INTENT, "Legal Graph role" and the adopt-first operating rule; Foundation decision ledger `portfolio/strategy/2026-09-22-moonshots-dispositions.md`). Foundation allocated issuance and provenance to PubLedge.

Scope: repository. It records what the current graph consumers need from PubLedge, which parts of PubLedge are reusable conventions versus maintained demonstration content versus services better supplied externally, whether the existing examples and service commitments still justify their maintenance scope, and the residual capability with concrete substitution proposals. Choices marked "owner choice" are proposals for Sam and Foundation, not decisions. [INTENT.md](../INTENT.md) remains authoritative for PubLedge strategy and is not changed by this note.

Out of scope: reopening parked standalone product ambitions, archiving the protocol or MCP surface, new timestamp or cryptographic infrastructure, full-corpus ingestion, and any change to records, schemas, projections, or published packages.

## Evidence base

Inspected on 2026-10-11 at PubLedge `main` `72196297`:

- `scripts/lib/obligation-first.js` (`buildDeterminationRecords`) and the generated OF index `docs/api/v1/of/index.json`: 8 authorities, 15 parties, 18 instruments, 16 terms, 56 obligation records, 17 issuance determinations.
- The `record.schema.json` conditional in `scripts/build-extras.js` and `scripts/lib/source-admission.js` (issuance evidence and the original-draft promotion gate).
- `data/examples/instruments/`: 18 instruments. Source: 8 `authoritative-reference` (5 Utah and 3 Colorado statutes), 9 `demonstration-remap` (4 Utah OAIP RMAs, SEC no-action letter, CFPB advisory opinion, two IRS PLRs, CFTC interpretive letter), 1 `publedge-original-draft` (Utah OAIP JIA). 17 carry `issuance_event`. None carries an `authority_response`.
- `data/examples/obligations/`: 35 obligation definitions. By mapping, 16 are mapped from statute records, 19 from demonstration remaps and 1 from the original draft JIA.
- `data/admission/`: 62 inputs inventoried as legacy-unreviewed at the freeze; 18 admission receipts since.
- Consumer evidence read in sibling checkouts (read-only): Obligation First `reference/consumer-answer-contract.md` and `reference/fixtures/consumer-traversals-2026-09-24.json` at `f70812d`; EveryAILaw `data/instruments/utah-sb149.md`, `wiki/concepts/regulatory-mitigation-agreement.md` and `design/LEGAL-GRAPH-CANDIDATE-2026-09-04.json`; AI Incident Law `INTENT.md`; Foundation `portfolio/legal-graph/interfaces.md`, `plans/cross-repo-evals.md` and `records/2026-10-01-coordination-reconciliation.md` at `631a9a8`.

Not performed: no site, API, npm, or MCP usage audit (usage is unknown, not zero); no live re-verification of external standards or issuing-authority pages; no build, release, or deployment check. External alternatives below are named from the repository record and general knowledge of established standards and were not re-verified against their primary sources on this date.

## What the current graph consumers need

### Current consumers

| Consumer | What it reads from PubLedge | Evidence |
|---|---|---|
| Obligation First consumer-answer contract | The draft Utah OAIP JIA instrument, its term, its first-session disclosure obligation, and its canonical page. The answer must keep the draft `draft-not-in-force` after joining operative law, carry the draft's unresolved questions, and keep duty-holder and source version `unknown` | OF `reference/consumer-answer-contract.md`; fixture traverses four `publedge.org` URLs, none of them an issuance determination |
| EveryAILaw | The four Utah OAIP RMA records, pinned as raw inputs at PubLedge commit `3a07bba0`, plus wiki links to the RMAs and to the JIA draft (explicitly described as not authority-issued). Its legal-graph candidate declares the `publedge.org/determination/` URI space | EAL `data/instruments/utah-sb149.md`; `wiki/concepts/regulatory-mitigation-agreement.md`; `design/LEGAL-GRAPH-CANDIDATE-2026-09-04.json` |
| Planned shared evals | EV01: act-level identity declarations and controls. EV03: an exact PubLedge commit with its own admission base. EV07: correct owned routes | Foundation `plans/cross-repo-evals.md`; ROADMAP "Legal-graph eval contributions" |
| AI Incident Law | Site links only. The INTENT revisit trigger "AI Incident Law needs PubLedge publication metadata in production code" has not fired | AIL `INTENT.md` |

### Issuance evidence the consumers need

For an issued instrument, the minimum evidence is what the OF issuance determination already projects:

- Issuing authority (`issuedBy`) and jurisdiction.
- Issuance date (`issued_date`, currently taken from `enacted`).
- Official location (`official_url`), publication citations, and retained source documents.
- Issuance event class (`gist:Enactment` or `gist:Determination`).
- `last_verified` and the per-kind evidence boundary (`admission_status`, `pub:source_review_state`).
- `decides: []`: an administrative issuance targets an instrument and decides no allegation. Adjudicative determinations remain AI Incident Law's.

For a draft, the consumer needs the opposite: an explicit non-issued state (`source: publedge-original-draft`, `status: proposed`, no `issuance_event`, no `enacted`), draft lifecycle carried onto its terms and obligations, and provenance that cites the draft's own canonical PubLedge URL and section locators rather than the authority or the interpreted statute. Both are already enforced (schema conditional, admission gate, EV02 fixes of 2026-09-23).

Limits that must travel with this evidence:

- MANIFEST SHA-256 consistency proves file-to-manifest agreement. It is not independent publication-time proof and not legal correctness.
- `issued_date` is the enactment or execution date. A distinct public release date (for example an IRS PLR release date) lives only in `publication_citations` text. No current consumer asks for release date; this is a known limit, not a work item.
- Issuance determinations are produced (17) and declared in EAL's candidate URI space, but no current consumer fixture traverses one. Their consumer value is declared, not yet exercised.

## Reusable conventions, demonstration ingestion, external services

| Class | Items | Disposition |
|---|---|---|
| Reusable record conventions (PubLedge-owned) | Administrative issuance versus adjudication boundary; draft-to-issued promotion gate (`source`, `status`, `editorial_status` split); instrument identifier scheme and canonical URL for two-party interpretive instruments; interpretive-instrument core fields (`reliance_scope`, `requesting_party`, `redaction_level`, withdrawal triplet, `obligation_kind`); `authority_response` path; source-admission receipts and per-kind evidence boundary; Obligation-First projection; JIA and RMA templates | Retain. These are the residual capability |
| Demonstration ingestion (maintained content) | 9 demonstration remaps, 8 statute records, 1 original draft JIA, 35 obligation definitions, 16 mapping entries | Retain where a consumer or eval uses it; otherwise freeze (see maintenance check) |
| External publication and provenance services | Issuing authorities' own publication (linked by `official_url`, never mirrored as authority); npm, the Official MCP Registry, Git tags, and GitHub Releases for distribution; Git history for change provenance; gist, Schema.org, and Obligation First for vocabulary; RFC 3161 time-stamp authorities or OpenTimestamps for independent publication-time proof; EveryAILaw for statute provision and obligation coverage | Adopt. Already adopted except publication-time proof, which stays pluggable and unimplemented until a named consumer requires it |

## Capability comparison

Rows follow the Foundation comparison shape. "External supply" names candidates; none was re-verified on 2026-10-11.

### R1. Act-level issuance identity for interpretive instruments

- Consumer and task: EAL (Utah RMAs as pinned inputs), OF consumer answer (JIA draft), EV01 identity controls.
- Current burden: identifier and URL scheme, 5 Utah OAIP records (4 RMAs, 1 draft JIA), issuance projection, admission receipts. Low marginal cost once records are reviewed.
- External supply: OAIP publishes agreement pages and signed PDFs, but no machine-readable record, stable identifier scheme, or draft/issued distinction for sandbox agreements was found in the repository record. Legislative identifier standards (ELI, Akoma Ntoso, USLM) target legislation, not two-party interpretive instruments.
- Access and rights: authority sources are public; PubLedge records are open.
- Semantic and freshness fit: PubLedge's split of issued, draft, and adjudicated is exactly what the OF consumer contract tests.
- Remaining gap: none that an external source closes.
- Recommendation: retain. This is PubLedge's core residual capability.

### R2. Statute act records (Utah 5, Colorado 3)

- Consumer and task: EV02 answer path (Utah), C06 five-statute clause comparison with EAL's composite Utah instrument, F14 qualified-time fixture (Colorado), Term anchors for interpretive instruments.
- Current burden: 90-day review cadence, open maintenance items (Utah Chapter 72 official-source access, SB 24-205 later-event evidence, receipt unknowns), and paired-review work in the 2026-10-03 queue.
- External supply: official legislature sites supply text and history. EveryAILaw supplies statute and provision coverage, but as an amended stack; the Foundation interfaces record forbids equating EAL's amended Utah stack with individual PubLedge acts.
- Remaining gap: act-level identity (original act versus amended stack) is what PubLedge adds and what Term anchors need. Statute text currency and codification status are not a PubLedge job.
- Recommendation: narrow, not remove. Keep act records as issuance and identity anchors. Stop treating PubLedge statute records as a statute-currentness surface; route currentness, codification, and interpretation questions to EveryAILaw (already the stated route for Utah Chapter 72 in `ops/MAINTENANCE-PILOT.md`). Add no new statute records except as anchors an interpretive instrument requires.

### R3. Statute-derived obligation extraction

- Consumer and task: OF projection; EV02 uses the EAL statutory duty, not a PubLedge statute obligation.
- Current burden: 16 obligation definitions mapped from statute records (Utah statute obligations, 6 Colorado ADMT obligations, 3 never-operative SB 24-205 obligations), with lifecycle and temporal-status maintenance.
- External supply: EveryAILaw's obligation categories and provision records cover the same statutes inside the portfolio.
- Remaining gap: none identified at the obligation level. PubLedge's distinct value is obligations created by interpretive instruments (RMA conditions, JIA terms), not statutory duties.
- Recommendation (owner choice S1): freeze statute-derived obligation extraction in PubLedge. Keep the existing 16 definitions until EV01 settles their correspondence with EAL; add none; route new statutory-duty extraction to EveryAILaw.

### R4. Federal demonstration remaps (SEC, CFPB, IRS x2, CFTC)

- Consumer and task: none found among current graph consumers. They exercise every `type`, `obligation_kind`, and `reliance_scope` value, so they function as schema-coverage fixtures.
- Current burden: 365-day review cadence, source-link maintenance (the 2026-10-03 link sweep reports blocked or human-review status for many official IRS and CFTC sources), 5 obligation definitions.
- External supply: the issuing agencies publish these instruments themselves. Commercial and government search services index them. PubLedge adds only the remap to its own schema.
- Remaining gap: schema coverage, which a frozen fixture supplies as well as a maintained record.
- Recommendation (owner choice S3): reclassify as frozen schema fixtures. Keep them published with their existing dates and disclaimers, do not renew `last_verified` for currentness, and do not pursue blocked official-source access for them unless a consumer appears. Federal full-corpus ingestion stays parked.

### R5. Publication-time and integrity proof

- Consumer and task: no consumer requires independent publication-time proof today. The MCP open decision "hash-verified responses" is likewise unforced.
- Current burden: MANIFEST maintenance and `validate-hashes.sh`; the verify page explains the limit.
- External supply: RFC 3161 time-stamp authorities and OpenTimestamps for time; Git signed commits and hosted history for change provenance; transparency logs such as Sigstore Rekor for signed artifacts.
- Remaining gap: none until a consumer names one. Building anything here would contradict INTENT.
- Recommendation (S2, no change): keep the pluggable-evidence posture. When a named consumer requires publication-time proof, adopt RFC 3161 or OpenTimestamps per record and represent the proof as evidence; do not build.

### R6. Distribution and discovery services

- Consumer and task: MCP server (npm `publedge`, Official MCP Registry, 13 read-only tools), static site, `api/v1` JSON, OF records, feeds (RSS, Atom, JSON Feed), `calendar.ics`, `upcoming.json`, `recently_changed.json`, split sitemaps.
- Current burden: one deterministic build; the time-sensitive surfaces (upcoming, calendar, freshness countdowns) drive the determinism and parity evals.
- External supply: npm, the MCP Registry, GitHub Pages, and GitHub Releases are already the adopted external services.
- Remaining gap: none. Usage is unknown.
- Recommendation: retain as is; add no new surfaces. The protocol and MCP surface stay supported per INTENT.

### R7. Original draft JIA and templates

- Consumer and task: OF consumer answer (draft must stay draft); EAL wiki cites the draft as not precedent.
- Current burden: low; promotion is gated on authority sign-off.
- External supply: none. OAIP has published no JIA in the repository record.
- Recommendation: retain unchanged. The draft is the graph's only exercised test of draft-versus-law meaning preservation.

## Maintenance scope check

Examples. Demonstrations establish schema coverage, not institutional adoption. No authority has supplied an `authority_response` (0 of 18), and the Doctronic exemplar designation is PubLedge editorial treatment, not OAIP endorsement. Against current consumers:

- Justified by an active consumer or eval: 4 Utah RMAs (EAL inputs), the draft JIA (OF consumer answer), 5 Utah statute acts (EV02 path, C06 comparison), 3 Colorado statute acts (F14 fixture, EV01 positive-control candidate).
- Not justified as maintained-for-currentness records: 5 federal remaps (no consumer; S3 freeze).
- Justified only as anchors, not as currentness surfaces: statute-derived obligations (S1 freeze).

Service commitments. The MCP package, registry entry, and site are supported commitments under INTENT and stay. Their marginal cost is the build and eval suite, not editorial work. The editorially expensive commitments are the risk-based review cadence and the open source-access items; S1 and S3 reduce exactly those without removing any public surface.

## Residual capability (for Foundation)

PubLedge's residual, not adequately supplied elsewhere, is the record convention for administrative issuance of fact-specific two-party interpretive instruments: a stable act-level identity and canonical URL, a schema that keeps issued, draft, and adjudicated meaning distinct, source-admission receipts with per-kind evidence boundaries, an authority-response path, and an Obligation-First projection that other graph members consume. Its maintained content should be the Utah OAIP instruments and the statute acts they anchor. Publication, publication-time proof, distribution, vocabulary, and statutory-duty coverage are adopted from external services or from EveryAILaw.

## Substitution proposals (owner choices)

| ID | Proposal | Effect | Reversible | Depends on |
|---|---|---|---|---|
| S1 | Freeze statute-derived obligation extraction in PubLedge; route new statutory-duty extraction to EveryAILaw | Lower 90-day review load; no record removed | Yes | EV01 correspondence decision; EAL agreement |
| S2 | No change: publication-time proof stays pluggable (RFC 3161 or OpenTimestamps) and unimplemented until a named consumer requires it | Confirms INTENT | Yes | None |
| S3 | Reclassify the 5 federal remaps as frozen schema fixtures; stop currentness renewal and official-source access work for them | Lower 365-day review and source-access load; site unchanged | Yes | Sam's approval; a fixture label convention if one is wanted |
| S4 | Narrow statute records to act-level issuance and identity anchors; route currentness and codification questions to EveryAILaw | Clarifies ownership of the open Utah and Colorado source-access items | Yes | Paired review in the 2026-10-03 queue |

No proposal removes a published record, URL, schema, or MCP tool.

## Unknowns

- Real usage of the site, `api/v1`, OF records, and MCP server.
- Whether any issuing authority or adopter would consume issuance determinations directly.
- Whether EV01 will equate, relate, or keep separate PubLedge statute obligations and EAL duties.
- Whether OAIP or another authority has published machine-readable sandbox-agreement records since the last source review.

## Implementation note

Any selected proposal is a later, separately scoped change. S1, S3, and S4 would touch `ROADMAP.md`, `ops/MAINTENANCE-PILOT.md`, and possibly `scripts/lib/verify-policy.js` (cadence) and would need the normal build, validators, evals, and admission rules. This note changes no record, schema, or projection.
