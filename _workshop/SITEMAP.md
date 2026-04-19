---
created: 2026-04-18
type: sitemap
project: publedge
status: draft
---

# PubLedge Proposed Sitemap

Output of Phase 3 (URL structure) from the 2026-04-18 site-ontology-workshop session. Greenfield — no redirects required.

Status legend: `[new]` = does not exist yet (greenfield, all pages are new at v0.1). Counts shown where the count is meaningful at v0.1 launch.

## Hierarchy

```
/                                        [new] Homepage — preview cards from Reference + Tools
│
├── reference/                           [new] Reference hub
│   ├── registry/                        [new] JIA + RMA browser (count: 4–5 templates worked-up as examples at launch)
│   │   └── {slug}/                      [new] Individual JIA/RMA detail page
│   ├── protocol/                        [new] PROTOCOL.md rendered
│   ├── prior-art/                       [new] PRIOR-ART.md rendered
│   ├── origin/                          [new] 2025-05-27 lineage page
│   ├── vocabulary/                      [new] gist mapping table + extensions placeholder
│   └── timeline/                        [new] Issuance timeline (sparse at launch — drafting-in-public posture)
│
├── tools/                               [new] Tools hub
│   ├── templates/                       [new] Templates index (count: 4–5 active + N drafts)
│   │   ├── {slug}/                      [new] Individual template page (renders + offers raw .md download)
│   │   └── drafts/                      [new] HOA / co-op / flying-club shelved drafts
│   ├── matrix/                          [new] Coverage matrix (JIA × statute citation)
│   ├── compare/                         [new] JIA-vs-JIA comparison tool
│   ├── mcp/                             [new] MCP server documentation + endpoint pointer
│   └── validators/                      [new] validate.js + verify.js CLI documentation
│
├── schema/                              [new]
│   ├── docs/                            [new] Human-readable schema documentation
│   └── json/                            [new] Machine schemas
│       ├── context.jsonld               [new] gist-bound JSON-LD context
│       ├── jia.schema.json              [new] JIA frontmatter schema
│       └── rma.schema.json              [new] RMA frontmatter schema
│
├── about/                               [new] About PubLedge (PAICE portfolio tie-in post-public)
│
├── vendor/                              [new]
│   └── gist/                            [new] Pinned gistCore.ttl + version note
│
├── does-{activity}-require-{instrument}/ [new] Bridge pages (flat, KaC SEO pattern, count grows over time)
│
├── llms.txt                             [new] Discovery (machine consume)
├── agents.json                          [new] Discovery (machine consume)
├── sitemap.xml                          [new] Discovery (machine consume)
├── feed.xml                             [new] RSS — registry updates + protocol changelog
├── robots.txt                           [new]
└── CNAME                                [new] publedge.org
```

## Search

Header-only widget. No dedicated `/tools/search/` page. Index built at `scripts/build.js` time, lazy-loaded on first focus. Indexes: registry, protocol, prior-art, vocabulary, templates, bridge pages.

## Slug pattern

JIA / RMA detail URLs use a human-readable slug plus a permanent ID in frontmatter.

- URL: `/reference/registry/utah-mental-health-chatbot-disclosure-2026q2/`
- Frontmatter: `id: us-ut-oaip-jia-0001`

Slug rules:
- Lowercase, hyphen-separated
- Jurisdiction prefix when applicable (`utah-`, `tx-`, `uk-`, etc.)
- Topic descriptor (3–6 words)
- Optional issuance period (`-2026q2`, `-2027`)

Permanent ID rules:
- `{jurisdiction}-{authority}-{kind}-{seq}` all lowercase (e.g. `us-ut-oaip-jia-0001`, `us-sec-nal-0001`, `us-irs-plr-202506001`)
- Native document number preferred for `seq` when the authority issues one; else zero-padded sequential scoped to `{jurisdiction, kind}` by effective date
- Permanent, never reused
- Survives slug renames

## Bridge pages

Flat under root, KaC pattern. Examples that may ship at v0.1:
- `/does-mental-health-chatbot-require-utah-disclosure/`
- `/does-genai-app-require-utah-safe-harbor/`
- `/does-deepfake-content-violate-utah-sb271/`

These are SEO landings, not part of the navigation. Each links into the relevant Reference > Registry detail page.

## Subdomain plan

| Subdomain | Purpose | Activates |
|---|---|---|
| publedge.org (apex) | Protocol + repo content per this sitemap | v0.1 |
| jia.publedge.org | Utah JIA library (post-branch destination, optional alternative to its own repo) | v0.2 (when Utah instance branches) |
| docs.publedge.org | Reserved | TBD |
| registry.publedge.org | Reserved | TBD |
| api.publedge.org | Reserved (MCP / JSON API alternate host) | TBD |

Reserve via DNS at v0.1; do not point until needed.

## Verification at launch

After publish, run the live site through Siteline (https://siteline.snapsynapse.com/) to verify agent traversability: feeds present, sitemap fresh, llms.txt + agents.json reachable, no platform-level blocks.
