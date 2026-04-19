---
created: 2026-04-18
type: content-guide
project: publedge
status: draft
---

# PubLedge Content Guide

Per-content-type conventions for file paths, frontmatter, image handling, hub-vs-detail rendering, and complete worked examples. Output of Phase 4 from the 2026-04-18 site-ontology-workshop session.

All content is markdown with YAML frontmatter. Every entity carries `@type` mapping to a gist IRI per `/schema/json/context.jsonld`.

## Image conventions

OG image per portfolio convention: `/imgs/og.png` (1200×630). Per-content OG override optional via frontmatter `og_image:` field. All other inline images live under `/imgs/{section}/{slug}-{descriptor}.{ext}` — kebab-case, no spaces.

## Content types

### 1. JIA (Joint Interpretation Agreement)

**Path:** `data/registry/jia/{slug}.md`
**Renders to:** `/reference/registry/{slug}/`
**Hub appearance:** Title, jurisdiction badge, issuance date, obligation kind chip (requirement / restriction / permission), 1-line summary.

**Required frontmatter:**

```yaml
---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Agreement"
id: PL-JIA-0001
slug: utah-mental-health-chatbot-disclosure-2026q2
title: "Utah Mental Health Chatbot Disclosure — Joint Interpretation"
jurisdiction: us-ut
issuance_event: gist:Determination
issued_date: 2026-04-15
issued_by:
  "@type": "https://w3id.org/semanticarts/ns/ontology/gist/SubCountryGovernment"
  name: "Utah Office of Artificial Intelligence Policy (OAIP)"
  ref: "https://commerce.utah.gov/ai/learning-lab/"
parties:
  - name: "Acme Health Tech Inc."
    role: requesting_party
  - name: "Utah OAIP"
    role: interpreting_authority
obligation_kind: [requirement, permission]   # any of: requirement, restriction, permission
statute_anchors:
  - cite: "Utah Code §13-72a-203"
    url: "https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-disclosure"
  - cite: "Utah Code §13-72a-201"
    url: "https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-data-protection"
terms:
  - "@type": "https://w3id.org/semanticarts/ns/ontology/gist/ContractTerm"
    text: "Provider must display the standardized GenAI disclosure on first session and on session resumption after 30 minutes of inactivity."
  - "@type": "https://w3id.org/semanticarts/ns/ontology/gist/Permission"
    text: "Compliance with the foregoing constitutes safe harbor under §13-75-104 for the disclosed product."
prior_art:
  - "SEC No-Action Letter, In re Acme Robo-Advisor (2019)"
status: draft        # draft | reviewed | published | superseded
supersedes: null
superseded_by: null
hash_chain_prev: null   # populated by skill-provenance verifier
disclaimer: "Suggested prior art. Not official OAIP output."
created: 2026-04-15
modified: 2026-04-18
---
```

**Body sections (recommended order):**

1. Summary (2–3 sentences)
2. Background / requesting party context
3. Question(s) presented
4. Interpretation
5. Terms (mirrors frontmatter `terms[]` in narrative form)
6. Statute citations (mirrors frontmatter `statute_anchors[]` with reasoning)
7. Limitations
8. Effective date and review trigger

### 2. RMA (Regulatory Mitigation Agreement)

**Path:** `data/registry/rma/{slug}.md`
**Renders to:** `/reference/registry/{slug}/`
**Hub appearance:** Same as JIA but with `gist:Contract` chip indicating enforceability.

Frontmatter is identical to JIA except:
- `"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Contract"`
- `id: PL-RMA-0001`
- `enforcement_authority:` block required
- `term_length:` and `review_date:` required

### 3. Template

**Path:** `_templates/{kind}/{slug}.md` where `{kind}` is `jia` or `rma`. Drafts under `_templates/drafts/{kind}/{slug}.md`.
**Renders to:** `/tools/templates/{slug}/`
**Hub appearance:** Title, kind chip, count of variables to fill in, "Download .md" button.

**Required frontmatter:**

```yaml
---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Template"
id: PL-TPL-JIA-0001
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
  - PL-JIA-0001
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

## Disclaimer requirement

Every JIA, RMA, and template ships with a `disclaimer:` frontmatter field. Default text: "Suggested prior art. Not official OAIP (or other authority) output." The build renders this prominently in the page header until `status: published` is reached and lawyer-review checkpoint is signed off.

## Cross-link conventions

- Internal references between PubLedge entities use the permanent ID (`PL-JIA-0001`), resolved at build time to the current slug URL.
- External statute references must include both `cite:` (Bluebook-style) and `url:` (canonical EveryAILaw anchor when available, otherwise authoritative source).
- Never duplicate statute text. Always link out.
