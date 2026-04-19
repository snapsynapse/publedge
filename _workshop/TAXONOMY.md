---
created: 2026-04-18
type: taxonomy
project: publedge
status: draft
---

# PubLedge Taxonomy

Output of Phase 1 (consume/engage sort), Phase 2 (naming), and edge case resolutions from the 2026-04-18 site-ontology-workshop session.

## Bucket definitions

### Reference (consume)

Things people read to understand. The value is in the content itself. Includes the protocol spec, prior-art survey, individual JIAs and RMAs (which are read for their interpretive content), schema documentation, vocabulary mapping, lineage, and the issuance timeline.

### Tools (engage)

Things people interact with, fill in, run, or download. The value is in the doing. Includes templates, the coverage matrix, comparison tool, search, MCP server, validators, and machine-readable schemas.

## What goes in each bucket

### Reference

| Item | Notes |
|---|---|
| Registry (JIA + RMA browser + detail pages) | Browser is interactive but the *artifacts* are consumed. Detail pages are the canonical consume target. |
| PROTOCOL.md | Mid-length spec. Defines the protocol. |
| PRIOR-ART.md | Single doc surveying Utah 63M-17, SEC no-action, IRS PLRs, CFPB advisory, Utah court forms. |
| Origin page | Surfaces 2025-05-27 README + pitch-summary; lineage from civic-org framing to regulatory-interpretation framing. |
| Vocabulary | gist mapping table + future PubLedge extensions. |
| Schema (human docs) | Human-readable explainer at `/schema/docs/`. |
| Timeline | JIA + RMA issuance dates. |
| Bridge pages | SEO landing pages ("Does X require Y?"). Flat under root, not subsectioned. |

### Tools

| Item | Notes |
|---|---|
| Templates | `_templates/*.md` for Utah JIA + RMA. Drafts (HOA/co-op) shelved under `_templates/drafts/`. |
| Coverage matrix | JIA × statute-citation grid. |
| Compare | JIA-vs-JIA comparison tool. |
| Search | Header-only widget. No dedicated `/tools/search/` page. |
| MCP server | `mcp-server.js` + endpoint pointer at `/tools/mcp/`. |
| Validators | `validate.js` + `verify.js` CLI documentation. |
| Schemas (machine) | `/schema/json/*.json` + `context.jsonld` for download and validation. |

## Edge case rulings

| Item | Question | Resolution |
|---|---|---|
| Worked JIA example | Detail page (consume) or downloadable artifact (engage)? | Consume page. Raw `.md` is the *source* of the consume item, not a separate engage entry. KaC convention. |
| Schema docs vs schema files | Same content type? | Split. `/schema/docs/` is human-readable consume. `/schema/json/` is machine-readable engage. Reference hub links to `/schema/docs/`; no `/reference/schema/` page. |
| Origin page | Active scope or history? | History. Old README's HOA framing is *lineage*, not active scope. Generalized framing in PROTOCOL.md supersedes. |
| PRIOR-ART.md | Survey or working artifact? | Consume. Reader doesn't *do* anything with it; the survey itself is the value. |
| Bridge pages | Under Reference subsection or flat? | Flat under root (`/does-{activity}-require-{instrument}/`). KaC pattern. SEO-targeted, not part of the user's mental model of "Reference." |
| Templates | Read or fill in? | Engage. The detail page renders the template for inspection, but the primary value is downloading and filling it in. |
| Vocabulary page | Schema or Reference? | Reference. The mapping table is read to understand the protocol. The `.jsonld` context that implements it lives in `/schema/json/`. |
| Registry browser | Consume or Engage? | Browser interaction is engage-flavored, but the artifacts being browsed are consume. Sits in Reference because the artifacts are the reason the page exists. Search and matrix (which act *over* the registry) live in Tools. |

## Naming rationale

### Why Reference over Library

PubLedge is a regulatory-interpretation protocol. "Reference" matches the formal register of the domain (court reference, statutory reference, regulatory reference). "Library" was warmer but reads as more curated/editorial. Reference is what regulators, lawyers, and AI agents will expect.

### Why Tools over Apps / Use

KaC default. "Tools" covers fill-in templates, machine schemas, CLI validators, and interactive widgets without forcing them into separate names. "Apps" implies hosted SPAs (overstates what `validate.js` is). "Use" is too vague.

### Subsection names

Direct, no jargon. Tested against representative items:
- "Where would I find a JIA template to fill in?" → Tools > Templates
- "Where would I find the protocol spec?" → Reference > Protocol
- "Where would I find the gist mapping?" → Reference > Vocabulary
- "Where would I find the JIA registry?" → Reference > Registry
- "Where would I find the JSON schema for a JIA?" → Tools (Schemas under `/schema/json/`)

No name failed the test on first pass.

## Upper ontology adoption

PubLedge adopts Semantic Arts gist (CC-BY 4.0) as the upper ontology for all schema. Every PubLedge entity carries `@type` mapped to a gist IRI. Mapping is published at `/reference/vocabulary/` and bound machine-readably at `/schema/json/context.jsonld`.

Core mappings:

| PubLedge concept | gist class |
|---|---|
| JIA (interpretation, non-enforceable) | `gist:Agreement` |
| RMA (enforceable mitigation agreement) | `gist:Contract` |
| JIA/RMA clause | `gist:ContractTerm` |
| Party obligation (must do) | `gist:Requirement` |
| Party prohibition (must not) | `gist:Restriction` |
| Safe-harbor grant | `gist:Permission` |
| Issuance act | `gist:Determination` |
| Utah OAIP / SEC / IRS / CFPB | `gist:GovernmentOrganization` (Utah → `gist:SubCountryGovernment`) |
| `_templates/*.md` | `gist:Template` |
| `PROTOCOL.md` | `gist:Specification` |

Why gist: license-compatible (both CC-BY 4.0), richer than KaC's 4-role spine at the obligation layer (splits Requirement / Restriction / Permission, which JIAs need), clean RMA-vs-JIA distinction (`Contract` vs `Agreement`), persistent w3id.org IRIs that AI agents can resolve.

`gistCore.ttl` is bundled at `vendor/gist/` for reproducibility, matching the skill-provenance posture. PubLedge-specific extensions are deferred until a forcing function appears (see ROADMAP.md).
