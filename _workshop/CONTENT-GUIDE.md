---
created: 2026-04-18
type: content-guide
project: publedge
status: draft
---

# PubLedge Content Guide

Per-content-type conventions for file paths, frontmatter, image handling, hub-vs-detail rendering, and complete worked examples. Output of Phase 4 from the 2026-04-18 site-ontology-workshop session.

All content is markdown with YAML frontmatter. Every entity carries `@type` mapping to a gist IRI per `/schema/json/context.jsonld`.

## Spec version

Current: **v0.2** (2026-04-19). Changes from v0.1:
- Decoupled `@type` (artifact class) from `obligation_kind` (posture chip). Top-level `@type` is always one of `gist:Agreement`, `gist:Contract`, or `gist:Determination`, selected by artifact kind, not by whether the position permits or restricts conduct.
- Added `type:` enum to lock instrument kinds.
- Formalized shared "interpretive-instrument core fields" block used by JIA, RMA, no-action letter, advisory opinion, and private letter ruling.
- Added `reliance_scope`, `source`, `publication_citations[]`, withdrawal fields, `redaction_level`.
- Canonicalized `statute_anchors[]` as `{cite, url}` objects.
- Canonicalized authority fields: both `authority:` (slug) and `issued_by:` (typed block) are required.
- Retired free-text `prior_art_note`; disclaimer text is composed by the renderer from structured `source` + `status` fields.

## Interpretive-instrument core fields

Applies to every artifact that interprets a rule for identified facts: JIA, RMA, no-action letter, advisory opinion, private letter ruling, revenue ruling, interpretive letter. Type-specific sections below extend this core.

```yaml
---
"@type": "<gist:Agreement | gist:Contract | gist:Determination>"   # artifact class
id: PL-<TYPE>-<NNNN>                # permanent identifier
slug: <kebab-case-slug>
title: "<Human-readable title>"
type: <jia | rma | no-action-letter | advisory-opinion | private-letter-ruling | revenue-ruling | interpretive-letter>
source: <authority-issued | demonstration-remap | publedge-original-draft>
jurisdiction: <us | us-ut | us-ca | ...>   # bare country code for federal scope
authority: <slug>                   # URL-routing slug, e.g. sec-corpfin, cfpb, utah-oaip, irs-chief-counsel
issued_by:                          # typed block for semantic consumers
  "@type": "<gist:GovernmentOrganization | gist:SubCountryGovernment | gist:Organization>"
  name: "<Full authority name>"
  ref: "<authority homepage URL>"
issuance_event: gist:Determination
enacted: YYYY-MM-DD
effective: YYYY-MM-DD
official_url: "<canonical authority-hosted URL>"
obligation_kind: [<requirement | restriction | permission>]   # one or more
reliance_scope: <requesting-party-only | similarly-situated-third-parties | public | unspecified>
requesting_party: "<name>" | null   # null when authority-initiated
interpreting_authority: "<name>"    # human-readable duplicate of issued_by.name
parties: []                         # JIA/RMA only; omit otherwise
statute_anchors:
  - cite: "<Bluebook-style citation>"
    url: "<resolvable URL; prefer EveryAILaw, then eCFR, then LII>"
publication_citations:              # where the instrument itself is published
  - cite: "<e.g. 87 Fed. Reg. 39733>"
    url: "<URL to that publication>"
authority_response:                 # optional; authority annotation, not record replacement
  - from: <authority slug or name>
    date: YYYY-MM-DD
    position: <concurs | disputes | clarifies | declines-to-comment | superseded-by-official>
    statement: "<authority-supplied statement>"
    source: "<optional authority-hosted https URL; controls over statement>"
    signature: "<optional detached-signature or PGP fingerprint reference>"
status: <draft | reviewed | published | superseded | withdrawn>
supersedes: null | <PL-id>
superseded_by: null | <PL-id>
withdrawn_date: null | YYYY-MM-DD
withdrawal_reason: null | "<short phrase>"
withdrawn_by_instrument: null | <PL-id or URL>
hash_chain_prev: null               # populated by skill-provenance verifier
disclaimer: "<composed by renderer from source + status; override only when needed>"
last_verified: YYYY-MM-DD
schema: "https://publedge.org/schema/instrument.schema.json"
created: YYYY-MM-DD
modified: YYYY-MM-DD
---
```

### Field notes

- **`@type` mapping:** JIA = `gist:Agreement`, RMA = `gist:Contract`, all agency-issued interpretations (no-action letter, advisory opinion, PLR, revenue ruling, interpretive letter) = `gist:Determination`. The permission/restriction/requirement distinction belongs in `obligation_kind`, not the top-level class.
- **`source` values:** `authority-issued` means the named authority produced and signed the artifact. `demonstration-remap` means PubLedge restructured a publicly archived external artifact into PubLedge frontmatter to illustrate the schema. `publedge-original-draft` means PubLedge authored a suggested interpretation awaiting authority review.
- **`statute_anchors[]` vs `publication_citations[]`:** Anchors point at the rule the instrument interprets; publication citations point at where the instrument itself can be found in an official publication series (Federal Register, IRS Bulletin, SEC archive). They serve different queries.
- **Withdrawal vs supersession:** Supersession replaces the position with a new one (`superseded_by` is required). Withdrawal rescinds without replacement (`withdrawn_date` and `withdrawal_reason` required; `withdrawn_by_instrument` optional).
- **`disclaimer` composition:** Renderer generates disclaimer text from `source` and `status`. Override the field only when the source artifact carries authority-specific reliance language that must be preserved verbatim.
- **`authority_response[]`:** Optional list of authority responses or corrections. Entries annotate the record and never replace the original interpretation. Each entry requires `from`, ISO `date`, closed-set `position`, and at least one of `statement` or authority-hosted `source`. When both `source` and `statement` are present, the source controls.

## Image conventions

OG image per portfolio convention: `/imgs/og.png` (1200×630). Per-content OG override optional via frontmatter `og_image:` field. All other inline images live under `/imgs/{section}/{slug}-{descriptor}.{ext}` — kebab-case, no spaces.

## Content types

### 1. JIA (Joint Interpretation Agreement)

**Path:** `data/registry/jia/{slug}.md` (canonical) or `data/examples/instruments/{slug}.md` (demonstration remaps).
**Renders to:** `/reference/registry/{slug}/`
**Hub appearance:** Title, jurisdiction badge, issuance date, obligation-kind chip, reliance-scope chip, source chip, 1-line summary.

Uses core fields. JIA-specific additions:

```yaml
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Agreement"
id: {jurisdiction}-{authority}-jia-{seq}
type: jia
parties:
  - name: "<Requesting party>"
    role: requesting_party
  - name: "<Authority>"
    role: interpreting_authority
terms:
  - "@type": "https://w3id.org/semanticarts/ns/ontology/gist/ContractTerm"
    text: "<Obligation in the agreement>"
```

**Body sections (recommended order):** Summary · Background · Question(s) presented · Interpretation · Terms (narrative) · Statute citations (reasoning) · Limitations · Effective date and review trigger.

### 2. RMA (Regulatory Mitigation Agreement)

**Path:** `data/registry/rma/{slug}.md`
**Renders to:** `/reference/registry/{slug}/`
**Hub appearance:** Same as JIA with `gist:Contract` chip indicating enforceability.

Uses core fields. RMA-specific additions:

```yaml
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Contract"
id: {jurisdiction}-{authority}-rma-{seq}
type: rma
enforcement_authority:
  "@type": "https://w3id.org/semanticarts/ns/ontology/gist/SubCountryGovernment"
  name: "<Authority>"
  ref: "<URL>"
term_length: "<e.g. 24 months>"
review_date: YYYY-MM-DD
```

### 2a. No-action letter

**Path:** `data/registry/nal/{slug}.md` or `data/examples/instruments/{slug}.md` (remaps).
**Renders to:** `/reference/registry/{slug}/`
**Hub appearance:** Title, jurisdiction badge, division/office, `reliance_scope: similarly-situated-third-parties` chip, 1-line summary.

Uses core fields. No-action-specific additions:

```yaml
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Determination"
id: {jurisdiction}-{authority}-nal-{seq}      # e.g. us-sec-nal-0001
type: no-action-letter
obligation_kind: [permission]      # no-action = forward-looking non-enforcement
reliance_scope: similarly-situated-third-parties   # default; override only if letter limits
```

**Body sections:** Summary · Background · Question presented · Staff position (table) · Reliance scope · PubLedge schema mapping · Limitations · Sources.

### 2b. Advisory opinion

**Path:** `data/registry/ao/{slug}.md` or `data/examples/instruments/{slug}.md` (remaps).
**Renders to:** `/reference/registry/{slug}/`

Uses core fields. Advisory-opinion-specific additions:

```yaml
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Determination"
id: {jurisdiction}-{authority}-ao-{seq}       # e.g. us-cfpb-ao-0001
type: advisory-opinion
reliance_scope: public             # default for bureau-issued advisory opinions
requesting_party: null | "<name>"  # null when authority-initiated
```

Advisory opinions are typically authority-initiated interpretive rules; `requesting_party: null` is common and the renderer must treat null as structured absence, not missing data.

### 2c. Private letter ruling (PLR) and revenue ruling

**Path:** `data/registry/plr/{slug}.md` or `data/examples/instruments/{slug}.md` (remaps).
**Renders to:** `/reference/registry/{slug}/`

Uses core fields. PLR-specific additions:

```yaml
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Determination"
id: {jurisdiction}-{authority}-plr-{native-number}   # e.g. us-irs-plr-202506001 (use authority's native number). Revenue rulings: {jurisdiction}-{authority}-rev-{native-number}.
type: private-letter-ruling        # or revenue-ruling
reliance_scope: requesting-party-only     # PLR default; revenue rulings = public
redaction_level: <none | partial | full>  # FOIA-released PLRs are redacted
requesting_party: "[Taxpayer redacted]" | "<name>"
```

- **`redaction_level`:** `full` = taxpayer identifying details removed (standard FOIA PLR release). `partial` = some facts redacted but requesting party identified. `none` = un-redacted (rare; typically revenue rulings, not PLRs).
- PLRs cannot be cited as precedent by other taxpayers; renderer should surface this prominently given `reliance_scope: requesting-party-only`.

### 2d. Interpretive letter / revenue ruling / other

For CFTC interpretive letters, FINRA interpretive letters, state AG opinions, and similar, use the no-action-letter or advisory-opinion template as structurally closest, with `type:` set to the specific enum value. No additional fields required.



### 3. Template

**Path:** `_templates/{kind}/{slug}.md` where `{kind}` is `jia` or `rma`. Drafts under `_templates/drafts/{kind}/{slug}.md`.
**Renders to:** `/tools/templates/{slug}/`
**Hub appearance:** Title, kind chip, count of variables to fill in, "Download .md" button.

**Required frontmatter:**

```yaml
---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Template"
id: us-ut-tpl-jia-0001
slug: utah-jia-genai-disclosure
title: "Utah JIA Template — General GenAI Disclosure (§13-75-103)"
kind: jia
jurisdiction: us-ut
fills:
  - "@type": "https://w3id.org/semanticarts/ns/ontology/gist/Agreement"
variables:
  - name: requesting_party_name
    description: "Legal name of the party requesting interpretation"
  - name: product_or_service
    description: "Specific product or service to which interpretation applies"
status: draft
created: 2026-04-15
---
```

Body uses `{{variable_name}}` placeholders matching the `variables[]` block.

### 4. Protocol document

**Path:** `content/protocol.md` (single file)
**Renders to:** `/reference/protocol/`

```yaml
---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Specification"
title: "PubLedge Protocol"
version: "0.1.0"
license: "CC-BY-4.0"
created: 2026-04-18
modified: 2026-04-18
---
```

### 5. Prior-art survey

**Path:** `content/prior-art.md` (single file)
**Renders to:** `/reference/prior-art/`

```yaml
---
title: "Prior Art Survey"
covers:
  - utah-regulatory-sandbox-63m-17
  - sec-no-action-letters
  - irs-private-letter-rulings
  - cfpb-advisory-opinions
  - utah-court-forms
created: 2026-04-18
---
```

### 6. Origin / lineage page

**Path:** `content/origin.md`
**Renders to:** `/reference/origin/`

```yaml
---
title: "Origin"
sources:
  - "PubLedge README (2025-05-27)"
  - "pitch-summary (2025)"
  - "PubLedge Revival — JIA Instance Formative Intent (2026-04-18)"
created: 2026-04-18
---
```

### 7. Vocabulary mapping

**Path:** `data/vocab/gist-mapping.yml` (data) + `content/vocabulary.md` (rendered prose)
**Renders to:** `/reference/vocabulary/`

The YAML drives the mapping table; the markdown wraps it with explanation. Same pattern as KaC `data/` + `content/`.

```yaml
# data/vocab/gist-mapping.yml
mappings:
  - publedge_concept: "JIA"
    gist_class: "Agreement"
    gist_iri: "https://w3id.org/semanticarts/ns/ontology/gist/Agreement"
    gist_definition: "A mutually understood arrangement in which two or more parties make commitments."
    notes: "JIAs are non-enforceable interpretations; the enforceable counterpart is RMA → gist:Contract."
  - publedge_concept: "RMA"
    gist_class: "Contract"
    gist_iri: "https://w3id.org/semanticarts/ns/ontology/gist/Contract"
    gist_definition: "An agreement which can be enforced by law."
  # ... etc.
extensions:
  status: deferred
  next_namespace: "https://publedge.org/ns/"
  long_term_namespace: "https://w3id.org/publedge/ns/"
```

### 8. Bridge page

**Path:** `content/bridge/{slug}.md`
**Renders to:** `/{slug}/` (flat under root, no `/bridge/` prefix in URL)

```yaml
---
title: "Does a mental-health chatbot require Utah disclosure?"
slug: does-mental-health-chatbot-require-utah-disclosure
answer_summary: "Yes — Utah Code §13-72a-203 requires disclosure for chatbots providing mental-health services to Utah residents."
links_to:
  - us-ut-oaip-jia-0001
  - https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-disclosure
created: 2026-04-18
---
```

### 9. Schema (machine)

**Path:** `schema/json/{name}.schema.json`
**Surfaces at:** `/schema/json/{name}.schema.json` (downloadable, content-typed `application/schema+json`)

JSON Schema 2020-12 dialect. Each schema declares `$id` at the publedge.org URL where it lives. `context.jsonld` binds field names to gist IRIs.

### 10. Schema (human)

**Path:** `content/schema-docs/{name}.md`
**Renders to:** `/schema/docs/{name}/`

Frontmatter pattern matches Protocol document.

### 11. Timeline entry

Auto-generated from JIA + RMA frontmatter `issued_date`. No standalone content type.

### 12. Coverage matrix

Auto-generated from JIA frontmatter `statute_anchors[]`. No standalone content type.

### 13. Comparison tool

Auto-generated. No standalone content type. UI loads two JIAs by ID and renders side-by-side.

### 14. MCP server

**Path:** `mcp-server.js` at repo root (KaC convention).
**Surfaces at:** `/tools/mcp/` (documentation page) and the live MCP endpoint per `agents.json`.

### 15. Validators

**Path:** `scripts/validate.js`, `scripts/verify.js` (KaC convention).
**Surfaces at:** `/tools/validators/` (documentation page).

## Hub vs detail rendering

Each Reference and Tools subsection has a hub page rendering all items as cards with title, type chip, status, date. Detail pages render full body + frontmatter table + machine-readable links (JSON, JSON-LD, raw .md).

Every detail page exposes three machine views in the page header:
- `View source (.md)` — raw markdown
- `View as JSON` — frontmatter + body sections as structured JSON
- `View as JSON-LD` — same payload with `@context` bound to gist

## Reliance scope

`reliance_scope` captures who, beyond the two named parties, may rely on the interpretation. It maps onto a long-standing distinction across existing programs and is required on every JIA, RMA, and no-action-letter remap.

| Value | Meaning | Typical source program |
|-------|---------|------------------------|
| `requesting-party-only` | Only the named requesting party may rely; third parties cannot cite as authority. | IRS Private Letter Rulings |
| `similarly-situated-third-parties` | Third parties matching the material facts may rely; reliance scope follows the facts, not the name. | SEC / CFTC No-Action Letters, CFPB Advisory Opinions |
| `public` | The interpretation is intended as general guidance for any regulated party. | Revenue Rulings, CFPB interpretive rules |
| `unspecified` | Source artifact does not address reliance scope; must be resolved before `status: reviewed`. | Bespoke sandbox agreements without explicit scope language |

When remapping an external artifact, choose the value that matches the letter's own language. When drafting a new PubLedge instrument, the default is `requesting-party-only` unless the authority explicitly extends scope.

## Disclaimer composition

Every interpretive instrument carries a `disclaimer:` field, but v0.2 moves the default text out of per-file YAML and into the renderer. Renderer keys off `source` + `status`:

| `source` | `status` | Rendered disclaimer |
|----------|----------|---------------------|
| `authority-issued` | `published` | None (the authority's own reliance language in the body governs). |
| `authority-issued` | `superseded` or `withdrawn` | "This instrument is no longer in effect. See `superseded_by` / `withdrawn_date`." |
| `demonstration-remap` | any | "Demonstration remap of a publicly archived authority artifact. Not an authority-issued PubLedge instrument. The official source controls." |
| `publedge-original-draft` | `draft` or `reviewed` | "Suggested prior art. Not authority-issued output. Awaiting lawyer review and authority sign-off before promotion." |
| `publedge-original-draft` | `published` | Error — original drafts cannot reach `published` without authority sign-off, which changes `source` to `authority-issued`. |

Override the `disclaimer:` field only when the source artifact carries authority-specific reliance language that must be preserved verbatim (e.g., an SEC no-action letter's exact staff caveat). Overrides are rendered in addition to, not in place of, the composed disclaimer.

## Cross-link conventions

- Internal references between PubLedge entities use the permanent ID (`us-ut-oaip-jia-0001`), resolved at build time to the current slug URL.
- External statute references must include both `cite:` (Bluebook-style) and `url:` (canonical EveryAILaw anchor when available, otherwise authoritative source).
- Never duplicate statute text. Always link out.
