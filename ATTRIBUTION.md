# Attribution

PubLedge is built on three upstream open works. This file credits each.

## Knowledge as Code (template scaffolding)

PubLedge is bootstrapped from the Knowledge-as-Code template, MIT licensed, created for [PAICE.work](https://paice.work/) PBC.

- Pattern definition: [knowledge-as-code.com](https://knowledge-as-code.com)
- Template repository: [github.com/snapsynapse/knowledge-as-code-template](https://github.com/snapsynapse/knowledge-as-code-template)
- License: MIT

## Semantic Arts gist (upper ontology)

PubLedge schemas bind to gist, the Semantic Arts minimalist upper ontology. PubLedge entities carry `@type` mapped to gist IRIs (e.g., `gist:Agreement`, `gist:Contract`, `gist:Requirement`). A pinned snapshot of `gistCore.ttl` is bundled at `vendor/gist/` for reproducibility.

- Project: [semanticarts.com/gist](https://www.semanticarts.com/gist/)
- Repository: [github.com/semanticarts/gist](https://github.com/semanticarts/gist)
- License: CC-BY 4.0
- Citation: gist by Semantic Arts, https://www.semanticarts.com/gist/

## Every AI Law (statute reference spine)

PubLedge JIA frontmatter cites stable anchor URLs at [everyailaw.com](https://everyailaw.com/) for the statutes interpreted in each instrument. EveryAILaw is itself a Knowledge-as-Code project.

## PubLedge license

PubLedge content is released under CC-BY 4.0. PubLedge code, schemas, and scripts are released under Apache 2.0. See `LICENSE`.

## Citing PubLedge

> PubLedge is a transparent recordkeeping protocol for fact-specific written interpretations between two parties. https://publedge.org

## Related projects

PubLedge sits in a broader ecosystem of open standards and tools:

- [Knowledge as Code](https://knowledge-as-code.com) — the pattern PubLedge inherits from
- [Every AI Law](https://everyailaw.com) — global AI regulatory landscape; statute spine for PubLedge JIAs
- [Graceful Boundaries](https://gracefulboundaries.dev/) — how services communicate limits to AI agents
- [Skill Provenance](https://skillprovenance.dev/) — manifest + hash integrity pattern PubLedge ships from day one
- [Siteline](https://siteline.to) — AI agent readiness scanner
