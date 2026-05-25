# Definitions

This document specifies the controlled vocabulary PubLedge uses for instrument status, alongside clarifying definitions for the terms of art that appear in the registry.

---

## Scope

PubLedge tracks fact-specific written interpretations between two parties: Joint Interpretation Agreements (JIAs), Regulatory Mitigation Agreements (RMAs), SEC no-action letters, CFPB advisory opinions, IRS private letter rulings, CFTC interpretive letters, and analogous instruments. Statutes are tracked as first-class records where an interpretation is anchored to them, so that the statute-to-instrument relationship can be queried directly.

Terminology choices below reflect three concerns:

1. **Precision**: each term is a distinct legal term of art, not a synonym for its neighbors.
2. **Interoperability**: where the same concept appears in [EveryAILaw](https://everyailaw.com/), the vocabulary is identical so cross-registry joins work.
3. **Disclosure**: PubLedge itself is a reference project under development. The registry's `status` field describes the instrument's legal state, not the registry's editorial state. See the site-wide disclaimer banner.

---

## Status vocabulary

The `status:` frontmatter field on every instrument record takes one of the following values.

### Lifecycle transitions

```
proposed → enacted → enforcing → { expired, superseded, withdrawn, terminated }
                              ↘ pending-replacement → superseded
                              ↘ phased-enforcement → enforcing (per phase)
```

### Values

| Status | Definition | Authoritative source |
|--------|------------|---------------------|
| `proposed` | Instrument has been drafted but has not been executed, adopted, or issued. Applies to instruments PubLedge suggests as prior art, to unratified agreements, and to bills that have been introduced but not enacted. | EveryAILaw convention |
| `enacted` | Instrument has been signed, executed, or otherwise formally adopted by its issuing authority or parties, but is not yet in force. Used when a stated effective date, phase-in date, or commencement trigger has not been reached. | EveryAILaw convention |
| `enforcing` | Instrument is in force and its terms are operative. For statutes: enforceable by the relevant authority. For agreements: the term is active and the parties are bound. For agency instruments (no-action letters, advisory opinions, private letter rulings): the position remains the published view of the issuing office. | EveryAILaw convention |
| `phased-enforcement` | Instrument is in force but specific provisions take effect on rolling dates. Used when a single record covers multiple obligations that phase in over time. | EveryAILaw convention |
| `pending-replacement` | Instrument is known to be replaced by a forthcoming instrument covering the same subject matter. Forward-looking flag; once the replacement is executed, transition to `superseded`. | EveryAILaw convention |
| `expired` | Instrument's stated term has ended and no extension or replacement was executed. Natural discharge by the passage of time; no party action required. Distinguish from `terminated` (action by a party) and `superseded` (replaced by a newer instrument). Legal basis: Restatement (Second) of Contracts §235, discharge by expiration. | PubLedge addition |
| `superseded` | Instrument has been replaced by a newer instrument on the same subject matter. The record should also populate the `superseded_by:` field with the canonical identifier of the replacing instrument. | PubLedge addition |
| `withdrawn` | Instrument has been rescinded unilaterally by the issuing authority before its stated term ended. Applies to agency instruments (advisory opinions, no-action letters, interpretive letters) where the agency pulls back the position. Does not apply to statutes (which are "repealed") or to two-party agreements (which are "terminated"). | PubLedge addition |
| `terminated` | Bilateral or multilateral instrument has been ended early by action — party notice, mutual consent, or material breach. Distinguish from `expired` (natural term end) and `withdrawn` (unilateral issuer action on a one-sided instrument). | PubLedge addition |

### Color and semantic intent

The site renders status as a badge colored by semantic group:

- **Active (green family)**: `enforcing`, `phased-enforcement`
- **Pre-active (amber/blue family)**: `proposed`, `enacted`
- **Future-facing (amber family)**: `pending-replacement`
- **Past (gray family)**: `expired`, `superseded`
- **Action-ended (red family)**: `withdrawn`, `terminated`

---

## Instrument types

The `type:` frontmatter field identifies the genre of instrument. The URL segment is derived from this value via `project.yml > hierarchy.type_segments`.

| Type | URL segment | Definition |
|------|-------------|------------|
| `rma` | `rma` | **Regulatory Mitigation Agreement.** A written agreement between a regulator and a participating entity that waives specified statutory or regulatory provisions for a stated term, in exchange for scope limits, safeguards, and reporting. Utah OAIP is the primary US issuer (Utah Code §13-72-401). |
| `jia` | `jia` | **Joint Interpretation Agreement.** A written agreement between a regulator and a requesting party that clarifies how existing law applies to a specific fact pattern, without waiving the underlying law. Utah OAIP is authorized to issue JIAs under §13-72-401 (HB 320, 2026). |
| `no-action-letter` | `nal` | A letter from SEC staff (typically the Division of Corporation Finance or Trading and Markets) stating that staff would not recommend enforcement action if the requester proceeds with a specified transaction. Binds staff, not the Commission; reliance typically limited to the requesting party or similarly-situated third parties. |
| `advisory-opinion` | `ao` | A formal statement by a regulatory agency (CFPB, FTC, HHS OIG) interpreting an ambiguous regulation as applied to specified facts. Public; binds the agency's enforcement posture; subsequent amendment or withdrawal is disclosed. |
| `interpretive-letter` | `il` | An explanatory letter issued by agency staff (CFTC DSIO, OCC, FRB) addressing a specific factual scenario. Similar in function to a no-action letter but framed as an interpretation rather than non-enforcement. |
| `private-letter-ruling` | `plr` | An IRS written determination issued to a specific taxpayer addressing their specific transaction. Relied upon only by the requesting taxpayer; publicly released with identifying information redacted. |
| `statute` | `statute` | A law enacted by a legislature, tracked as a first-class record in PubLedge when one or more registered instruments interpret or waive it. The `statute` type holds anchoring metadata; authoritative full text lives at the issuing body (for example, [le.utah.gov](https://le.utah.gov/)) and at [EveryAILaw](https://everyailaw.com/). |

---

## Reliance scope

The `reliance_scope:` field describes who may rely on the instrument.

| Value | Meaning |
|-------|---------|
| `public` | Anyone may rely on the instrument's stated interpretation — statutes, advisory opinions, rules of general applicability. |
| `requesting-party-only` | Only the entity that requested the instrument may rely on it (IRS PLRs, most RMAs and JIAs). |
| `similarly-situated-third-parties` | The requesting party plus third parties who share the material facts. Typical for SEC no-action letters and some CFTC letters. |

---

## Identifier scheme

Every instrument carries two identifiers:

- **Stable identifier** (`id` field, URL filename): `{country}-{jurisdiction}-{authority}-{type}-{YYYY}-{NNN}`. Example: `us-ut-oaip-rma-2025-001`. This is the canonical citation form; remains valid even if the URL architecture changes.
- **Canonical URL**: `/{country}/{jurisdiction}/{authority}/{type}/{YYYY-NNN}/`. Example: `/us/utah/oaip/rma/2025-001/`. Human-browseable hierarchy.
- **Legacy identifier** (`legacy_id` field, when applicable): the pre-migration ID preserved for redirect resolution and historical citation resolution.
- **Official reference** (`official_ref` field, when applicable): the issuing authority's own citation convention. Example: IRS "PLR 202506001", CFTC "Letter 17-65".

The `record.json` endpoint emits all identifiers alongside the full record payload and a Schema.org `LegalDocument` JSON-LD block.

---

## Terms-of-art distinctions worth preserving

### `expired` vs `terminated` vs `withdrawn` vs `superseded`

These four terms describe mutually exclusive modes of an instrument ceasing to be in force. Collapsing them loses legal precision.

- **`expired`**: stated duration ran out. No party took action; no replacement exists. *Restatement (Second) of Contracts §235 — discharge by expiration.*
- **`terminated`**: a party ended it before its stated term via notice, mutual consent, or breach. *Restatement §243 — discharge by breach.*
- **`withdrawn`**: the issuing authority rescinded its own unilateral position (advisory opinions, no-action letters). No bilateral agreement to terminate.
- **`superseded`**: a newer instrument on the same subject replaced it; continuity via substitution.

### `enacted` vs `enforcing`

- **`enacted`**: the instrument has been signed/executed but a stated effective date, commencement notice, or phase-in trigger has not yet been reached.
- **`enforcing`**: the instrument's terms are operative.

This distinction matters for RMAs that are signed but held in abeyance pending a participant notice (Utah §13-72-401(2.B)-style commencement triggers), and for statutes with stated effective dates that postdate the signing.

### `advisory opinion` vs `no-action letter` vs `interpretive letter`

The three instruments share a function (written agency position on a specific fact pattern) but differ in their legal posture:

- An **advisory opinion** declares the agency's interpretation of the law.
- A **no-action letter** declares the agency's enforcement intent (staff will not recommend enforcement).
- An **interpretive letter** provides an explanation or construction of an existing rule.

PubLedge preserves the distinction in both the `type:` field and the URL type segment.

---

## Authority response positions

The `position` value in an `authority_response` entry (see [PROTOCOL.md](/PROTOCOL.md) → Authority response) is one of a closed set. It records how the responding authority characterizes its own relationship to the interpretation, not PubLedge's editorial judgment.

| Value | Meaning |
|---|---|
| `concurs` | The authority agrees the interpretation reflects its position. |
| `disputes` | The authority states the interpretation is wrong or misleading. |
| `clarifies` | The authority neither fully agrees nor disputes; it adds or corrects detail. |
| `declines-to-comment` | The authority acknowledges the record but takes no position. |
| `superseded-by-official` | The authority has since issued an official instrument that governs instead; pair with `supersedes` / `superseded_by` per Supersession. |

`declines-to-comment` is a recorded response, not the same as the absence of any response. Absence is never interpreted (PROTOCOL.md → Authority response, non-goals).

---

## Versioning and changes to this document

This document is canonical for the PubLedge project. Changes require a pull request to the [GitHub repository](https://github.com/snapsynapse/publedge) and are published with the next site build.

Cross-project vocabulary alignment: `proposed`, `enacted`, `enforcing`, `phased-enforcement`, and `pending-replacement` track [EveryAILaw](https://everyailaw.com/)'s convention verbatim. Additions (`expired`, `superseded`, `withdrawn`, `terminated`) are PubLedge-specific because they describe dispositions that rarely apply to statutes but are routine for fact-specific instruments.

---

## Disclaimer

PubLedge is a reference tool under development. This registry is not authoritative and does not constitute legal advice. Each record's `status:` field describes the underlying instrument's legal state based on public sources as of its `last_verified:` date. The registry's own editorial and review state is disclosed separately in the site-wide banner and in the project's [README](/README.md). For authoritative text, consult the issuing authority or the links in each record's `official_url:` and `publication_citations:` fields.
