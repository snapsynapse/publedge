# PROJECT_CONTEXT.md — PubLedge

Context for content/docs skills operating on this repo. Keep this file factual
and current; it is a stable reference, not a changelog.

## What this project is

PubLedge is an open recordkeeping **protocol** (plus reference content and a
published static site) for fact-specific written interpretations between two
parties: Joint Interpretation Agreements (JIAs), Regulatory Mitigation
Agreements (RMAs), no-action letters, advisory opinions, private letter rulings,
interpretive letters, and analogous civic instruments (HOA decision logs, co-op
governance records, and the like).

Records are plain markdown with structured frontmatter, SHA-256 hash-pinned, and
bound to the Semantic Arts *gist* upper ontology so records from different
authorities can be compared and queried together. Every record is published in
parallel human-HTML and machine-readable form (`record.json`, JSON-LD, feeds,
`llms.txt`, `agents.json`, an MCP server) so agents can walk the registry
without scraping.

PubLedge is the **verifiable-records layer of the PAICE legal graph**, an
intentionally open component (code Apache-2.0, protocol + content CC-BY-4.0)
funded via the graph's single restricted layer, EveryAILaw Pro. Publisher:
PAICE.work PBC.

## Audience

Regulators, regulated parties, and civic bodies that issue or rely on
fact-specific written interpretations and need them recorded in a portable,
queryable form. Secondary audience: AI agents and developers consuming the
registry through structured endpoints and the MCP server.

## Style / tone (discernible from existing content)

- **Precise, declarative, specification-grade.** Short factual sentences; "What
  this is / What this is not" framing; explicit enumerations.
- **Hedged and non-advisory.** Templates are labeled prior art, not legal
  advice; a renderer-composed disclaimer is keyed off `source` + `status`.
- **Provenance-first.** Everything is hash-pinned, dated, and attributed;
  `last_verified` freshness is tracked and drift is surfaced automatically.
- Markdown-native, git-as-CMS. Lowercase-hyphen identifiers and stable ids.

## Key URLs

- Canonical site: https://publedge.org/
- Repository: https://github.com/snapsynapse/publedge
- Schema canon (Obligation-First): https://obligationfirst.org/
- Portfolio canon (PAICE Foundation): https://paice.foundation/
- npm / MCP: `publedge` · `io.github.snapsynapse/publedge`
- Ontology: https://semanticarts.com/gist/
- Related: https://everyailaw.com · https://knowledge-as-code.com

## Current status (2026-07)

Public and stable. Spec at `v0.1.1-pre`; MCP server published stable (npm +
Official MCP Registry). Drafting continues in public toward **v0.2**.
Outstanding: SLC attorney legal review (pending), public announcement via
promo-orchestrator (pending), and v0.2 engineering/coverage items. See
`ROADMAP.md` and the `README.md` status table for detail.

## Editing notes for content skills

- `docs/` is **generated** — never edit it directly. Edit `scripts/`, `data/`,
  `about/`, or `reference/`, then `npm run build`. See `AGENTS.md` / `CLAUDE.md`.
- New instruments: copy a `_templates/` file, replace every `{{variable}}`, use
  id `{jurisdiction}-{authority}-{type}-{YYYY-NNN}` (filename must match), then
  refresh `MANIFEST.yaml` via `./scripts/validate-hashes.sh --update`. Full
  conventions in `CONTRIBUTING.md`; canonical vocabulary in `DEFINITIONS.md`.
