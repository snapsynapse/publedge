---
created: 2026-04-18
type: roadmap
project: publedge
status: draft
---

# PubLedge Roadmap

Workshop output, 2026-04-18. Scope decisions from site-ontology-workshop session. Strategy mirrors KaC: build Utah-specific instance fully, then branch and strip to a reusable template.

## Phasing

### v0.1 — Utah JIA + RMA implementation, public repo

Target: 4–7 days from 2026-04-18.

In scope:

- KaC template bootstrap, project.yml configured for PubLedge
- skill-provenance MANIFEST.yaml + version headers
- PROTOCOL.md (mid-length spec)
- PRIOR-ART.md (single doc covering Utah 63M-17, SEC no-action, IRS PLRs, CFPB advisory, Utah court forms)
- Origin page surfacing 2025-05-27 README + pitch-summary lineage
- 4–5 Utah JIA + RMA templates under `_templates/`, plus shelved HOA/co-op drafts under `_templates/drafts/`
- Worked Utah JIA examples under `data/examples/`
- Vocabulary page with gist mapping table
- Pinned `gistCore.ttl` snapshot under `vendor/gist/`
- ATTRIBUTION.md citing gist (CC-BY 4.0, Semantic Arts)
- JSON Schemas: `jia.schema.json`, `rma.schema.json`, `context.jsonld` (gist-bound)
- Frontmatter `@type` field using gist IRIs
- KaC features ON: registry browser + detail pages, coverage matrix, comparison tool, search, MCP server, validate.js, verify.js, bridge pages, timeline
- Discovery files ON day 1: llms.txt, agents.json, sitemap.xml, feed.xml, robots.txt
- Lawyer review checkpoint before public release
- Private snapshot to external reviewers — **staged 2026-04-18** (cover notes + tarball under `_private/lawyer-snapshot/`, gitignored). Send order: external reviewers first, hold legislators 24 hours for any redirect.
- canonical-spec-page rendered at publedge.org
- repo-polish + promo-orchestrator at public release (step 11)

Out of scope for v0.1:

- Newsletter / commentary stream
- Cross-posting (deferred until public)
- Reverse links from everyailaw.com → publedge.org (one-way only for now)

### v0.2 — Branch and strip

Once Utah instance is "sufficiently complete" per the six testable structural claims in the formative-intent note, branch the repo and strip Utah-specific content to leave a clean PubLedge protocol template. Mirror KaC ← AI Tool Watch pattern.

Branch destination: jia.publedge.org subdomain or `github.com/snapsynapse/publedge-utah-jia` (decide at branch time).

### Vocabulary / namespace evolution

PubLedge v0.1 uses gist for all classes. PubLedge-specific extensions (e.g., `StatuteCitation`, `HashChainEntry`, `PartySnapshot`) are deferred. When extensions are needed:

1. **Phase 1 (post-v0.1)** — mint at `https://publedge.org/ns/`. Self-hosted, ties to domain. Document in `/reference/vocabulary/extensions/`.
2. **Phase 2 (long-term, when stable)** — submit w3id.org PR for `https://w3id.org/publedge/ns/` to gain domain-independent persistence. Mirror gist's own namespacing pattern.

Until extensions are minted, all PubLedge schema fields map only to gist IRIs or use plain JSON keys without `@type`.

## Open decisions deferred from formative session

These remain open after the 2026-04-18 workshop. Each needs a forcing function (date, dependency, or trigger).

| Question | Forcing function | Default if unforced |
|---|---|---|
| Offer Nov 30 2026 annual-report section template as follow-on? | Outreach response from OAIP after v0.1 release | Defer to v0.2 conversation |
| Retroactively ingest SEC no-action letters / IRS PLRs into PubLedge protocol? | Explicit user decision after Utah instance is complete | Cite in PRIOR-ART, do not ingest |
| paice.foundation attribution at foundation-protocol level vs personal/snapsynapse? | Public release prep (step 11) | List under PAICE portfolio at paice.foundation |
| MCP server exposing JIA library in v0.1 or v0.2? | Locked v0.1 in workshop | Ships v0.1 |
| PubLedge namespace at `publedge.org/ns/` minted? | First PubLedge-specific concept that can't be expressed in gist | Defer until needed |
| w3id.org/publedge/ns/ PR submitted? | After ~6 months of stable extensions | Defer to long-term |
| Reverse linking everyailaw.com → publedge.org? | Editorial decision after v0.1 release | One-way only (PubLedge → EveryAILaw) |

## Cross-project dependencies

- EveryAILaw worktree `cc/hungry-mayer-d26631` must merge to main and deploy to GitHub Pages before PubLedge JIA frontmatter URLs resolve. Workshop-time risk: stale anchors on live site. Mitigation: verify each cited URL during template drafting.
- KaC template (`~/Git/knowledge-as-code-template`) is the architectural seed. Any breaking changes upstream require coordinated update.
- skill-provenance hashes generated at PubLedge bootstrap must remain stable across the Utah-instance → template strip.

## Workshop session output (this document set)

- `_workshop/ROADMAP.md` (this file)
- `_workshop/TAXONOMY.md` — bucket definitions, edge case rulings, naming rationale
- `_workshop/SITEMAP.md` — full URL hierarchy with content counts and status markers
- `_workshop/CONTENT-GUIDE.md` — file paths, frontmatter fields, image conventions, complete examples per content type
