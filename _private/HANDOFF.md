---
created: 2026-04-19
type: handoff
project: publedge
status: current
---

# PubLedge Handoff

Pickup brief for the next session. Short, specific, file paths included. When a handoff item lands, move it out of this document into [ROADMAP.md](ROADMAP.md) as shipped work.

## Current state (end of 2026-04-19 session)

Two sessions landed in sequence today:

1. **Engineering session** — unified site generator, JSON Schemas (per-type), JSON-LD context, `@type` frontmatter on authorities/instruments/obligations, Pages source switched to `main /docs`.
2. **Prior-art remap + schema v0.2 session** — decoupled artifact class from posture chip, added shared interpretive-instrument core fields, new lifecycle fields (withdrawal triplet, redaction posture, source, publication citations), retrofitted Utah demo, added three reference remaps (SEC, CFPB, IRS).

Both sessions' output is captured in the "What shipped" section of [ROADMAP.md](ROADMAP.md).

The repository is in a consistent drafting state. No broken builds. No mid-file edits. All demo-instrument frontmatter validates as YAML. The spec (v0.2) is defined; the validators and renderer that enforce it are not yet updated.

## Next session — priority order

### P0 — required before v0.1 freeze

1. **Write polymorphic `schema/instrument.schema.json`.**
   - JSON Schema 2020-12 dialect, `$id` = `https://publedge.org/schema/instrument.schema.json`.
   - Discriminator on `type` (enum of seven values from [_workshop/CONTENT-GUIDE.md](_workshop/CONTENT-GUIDE.md) §"Interpretive-instrument core fields").
   - Per-type conditional rules via `allOf` + `if` / `then`:
     - `type = rma` → require `enforcement_authority`, `term_length`, `review_date`.
     - `type = private-letter-ruling` → require `redaction_level`.
     - `type = advisory-opinion` → allow `requesting_party: null`.
   - Cross-field: `source = publedge-original-draft` ∧ `status = published` is invalid.
   - Cross-field: withdrawal triplet is all-or-nothing (if any of `withdrawn_date`/`withdrawal_reason` is set, `status` must be `withdrawn`).
   - Validate against all four files in `data/examples/instruments/` as acceptance test.
   - After it validates, deprecate `schema/jia.schema.json` + `schema/rma.schema.json` (keep for one version with a redirect notice, then remove in v0.3).

2. **Update `scripts/validate.js` to enforce v0.2.**
   - Currently does cross-reference checks only. Extend to run the polymorphic schema against every file under `data/examples/instruments/` and `data/registry/**/*.md`.
   - Add the cross-field rules from item 1 as explicit checks so the error messages are specific ("source=publedge-original-draft cannot have status=published; promote source to authority-issued first").
   - Do NOT move to `scripts/verify.js` — that script handles structural integrity; schema validation belongs in `validate.js`.

3. **Build renderer for composed disclaimer.**
   - Every v0.2-retrofitted demo carries `disclaimer: ""`. The spec ([_workshop/CONTENT-GUIDE.md](_workshop/CONTENT-GUIDE.md) §"Disclaimer composition") defines a lookup table from `(source, status)` to rendered text.
   - Implement the table in `scripts/build-extras.js` so every instrument detail page shows the composed disclaimer in the page header. Free-text override in the `disclaimer:` field, when non-empty, is appended below the composed disclaimer, not substituted for it.
   - Acceptance: run `node scripts/build.js && node scripts/build-extras.js` and spot-check the four demo instrument pages in `docs/` show the correct composed disclaimer.

4. **Retrofit `_templates/jia/*.md` and `_templates/rma/*.md` to v0.2.**
   - All five files currently use v0.1 frontmatter (flat `obligation_kind: [permission]`-style @type, string `statute_anchors`, no `source` / `reliance_scope` / lifecycle fields).
   - New contributors following CONTRIBUTING.md will fail validation until this lands.
   - Mechanical pass: same shape as the Utah PL-JIA-0001 retrofit in [data/examples/instruments/utah-mental-health-chatbot-disclosure-2026q2.md](data/examples/instruments/utah-mental-health-chatbot-disclosure-2026q2.md).

5. **Refresh `MANIFEST.yaml`.**
   - Four files changed, one added under `data/examples/instruments/` plus extensive edits to `_workshop/CONTENT-GUIDE.md`, `PRIOR-ART.md`, `README.md`, `ROADMAP.md`, and this new `HANDOFF.md`.
   - Run `./scripts/validate-hashes.sh --update` and review the diff before committing.

### P1 — v0.1 freeze dependencies

6. **Lawyer review checkpoint** (week of 2026-04-20, SLC attorney). Out-of-band. No code action required this session; when output returns, follow the steps in ROADMAP.md §"v0.1 — remaining before public freeze".

7. **Promote PL-JIA-0001 `draft` → `reviewed`** once lawyer feedback is incorporated. Requires setting `status: reviewed` and letting the renderer swap the composed disclaimer to the reviewed-state text (see item 3).

8. **repo-polish + promo-orchestrator** run immediately before v0.1 public release. Invoke the `repo-polish` skill, then `promo-orchestrator`. Per global skill descriptions, `repo-polish` must run before `promo-orchestrator`.

### P2 — optional before freeze, good fit for a short session

9. **Add one CFTC interpretive letter remap** to `data/examples/instruments/`. Schema is proven across SEC/CFPB/IRS; a CFTC letter demonstrates cross-agency portability within a single obligation type. Low effort (~30 min of a session). Pick a well-archived letter from cftc.gov; structurally identical to the SEC remap with `authority: cftc`.

10. **FINRA interpretive notice remap.** Would exercise `issued_by."@type": gist:Organization` (not `GovernmentOrganization`) — the SRO path called out in PRIOR-ART.md but not yet demonstrated.

### P3 — defer to v0.2 or later

- Browser-side registry browser + comparison tooling (currently KaC-rendered; needs polish only).
- Clean-URL migration (tracked in ROADMAP.md §v0.2).
- Branch-and-strip to reusable protocol template (tracked in ROADMAP.md §v0.2).
- Namespace extensions at `publedge.org/ns/` (tracked in ROADMAP.md §"Vocabulary / namespace evolution").
- Full-corpus ingestion of historical SEC no-action / IRS PLR archives. Three demos is the current scope; full ingestion is an open editorial decision.

## Known gaps and caveats

- **URLs in demo instruments:** All four official_url values returned HTTP 200 on 2026-04-19, but the SEC URL returned 403 on HEAD (bot protection, not 404). Manual browser click-through recommended before promotion to `status: reviewed`.
- **Federal Register citation missing on CFPB demo.** Perplexity couldn't confirm an FR cite; the CFPB published the opinion as a standalone advisory opinion rather than an FR notice. `publication_citations[]` currently points only at consumerfinance.gov. Acceptable for `demonstration-remap` source but should be double-checked if a CFPB advisory opinion is ever promoted to `authority-issued`.
- **PLR fact summary is paraphrased,** not quoted verbatim from the redacted PDF. Before any `reviewed` promotion, read the PDF at the `official_url` and verify the summary and holding tables match.
- **`parties: []`** now appears in every non-agreement instrument's frontmatter as a structural placeholder. Slightly noisy. Acceptable for v0.2; consider moving to type-specific blocks in v0.3 if the polymorphic schema can cleanly express it.
- **`hash_chain_prev`** is null across all demos. The skill-provenance pipeline has not been exercised against any v0.2 instrument. First run should establish the hash chain for all four demo files in one commit.
- **`schema:` URL on every demo** points at `https://publedge.org/schema/instrument.schema.json`, which does not yet exist. Writing item 1 above resolves this; until then, the `schema:` field is a forward reference.

## Context the next session should re-read first

Read in this order:

1. This file.
2. [ROADMAP.md](ROADMAP.md) §"What shipped" and §"Frontmatter spec v0.2 — follow-ups".
3. [_workshop/CONTENT-GUIDE.md](_workshop/CONTENT-GUIDE.md) §"Spec version" and §"Interpretive-instrument core fields".
4. One demo instrument (recommended: [data/examples/instruments/irs-plr-202506001.md](data/examples/instruments/irs-plr-202506001.md) — exercises the most v0.2 features in one file).

Skip rereading the individual session transcripts. The documentation above is the canonical record; transcripts contain exploratory dead ends.
