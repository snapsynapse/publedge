---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Specification"
title: "PubLedge Protocol"
version: "0.1.0-pre"
license: "CC-BY-4.0"
created: 2026-04-18
modified: 2026-04-18
---

# PubLedge Protocol

PubLedge is an open recordkeeping protocol for fact-specific written interpretations between two parties.

A PubLedge record captures a question, an answer, who agreed to it, what statutes or rules it relies on, and what the parties are now permitted, required, or restricted from doing as a result. Records are plain markdown with structured frontmatter. They are versioned in git, hash-pinned for integrity, and machine-readable through schemas bound to an open upper ontology.

## What PubLedge is for

PubLedge generalizes a single class of artifact across many domains:

- **Regulatory** — Joint Interpretation Agreements (JIAs), Regulatory Mitigation Agreements (RMAs), no-action letters, private letter rulings, advisory opinions
- **Civic** — HOA decision logs, co-op governance records, flying-club asset agreements, tool-library lending records, community land-trust commitments
- **Private** — published private rulings between two parties (e.g., a vendor and a regulator) where one party wants the public to be able to read and rely on the interpretation

The civic and regulatory framings are different use cases of the same underlying artifact: a written interpretation, jointly authored or approved, that constrains future behavior between the parties and may be of interest to third parties.

## Core principles

1. **Human-readable, machine-verifiable** — every record is markdown a person can read and JSON a machine can parse.
2. **Plain text, no proprietary dependencies** — git is the only required tool.
3. **Open ontology** — entities bind to [Semantic Arts gist](https://www.semanticarts.com/gist/) (CC-BY 4.0) for cross-system interoperability.
4. **Hash-pinned integrity** — every published record is hashed in `MANIFEST.yaml`; tampering is detectable.
5. **Drafting-in-public posture** — published records carry a disclaimer until reviewed and accepted by the relevant authority.

## Entity model

PubLedge inherits the Knowledge-as-Code four-role spine and binds each role to a gist class:

| Role | Name | gist class | What it is |
|---|---|---|---|
| Authority | Authority | `gist:GovernmentOrganization` | The party with interpretive or regulatory authority (Utah OAIP, SEC, IRS, CFPB; or, for civic uses, an HOA board, co-op council, etc.) |
| Container | Instrument | `gist:Agreement` (JIA) or `gist:Contract` (RMA, enforceable) | The interpretation record itself |
| Secondary | Term | `gist:ContractTerm` | An individual clause within an instrument |
| Primary | Obligation | `gist:Requirement` / `gist:Restriction` / `gist:Permission` | The behavior the instrument requires, prohibits, or permits |

The act of issuance is itself typed `gist:Determination`. This separates the artifact (the agreement) from the event (the act of agreeing).

The vocabulary mapping is published at `/reference/vocabulary/` and bound machine-readably in `/schema/json/context.jsonld`.

## Required structure

Every PubLedge instrument has YAML frontmatter and a markdown body.

### Required frontmatter fields

```yaml
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Agreement"  # or Contract
id: PL-JIA-NNNN                          # Permanent identifier, monotonic, never reused
slug: jurisdiction-topic-period          # Human-readable URL slug
title: "Plain-language title"
jurisdiction: us-ut                       # ISO-style jurisdiction code
issued_date: YYYY-MM-DD
issued_by:                                # The Authority
  "@type": "https://w3id.org/semanticarts/ns/ontology/gist/SubCountryGovernment"
  name: "..."
  ref: "..."                              # Authoritative URL
parties:
  - name: "..."
    role: requesting_party | interpreting_authority | counterparty
obligation_kind: [requirement, restriction, permission]   # any subset
statute_anchors:
  - cite: "Bluebook-style citation"
    url: "Canonical EveryAILaw anchor or authoritative source"
terms:
  - "@type": "https://w3id.org/semanticarts/ns/ontology/gist/ContractTerm"
    text: "Plain-language clause"
status: draft | reviewed | published | superseded
disclaimer: "Default text or instrument-specific override"
created: YYYY-MM-DD
modified: YYYY-MM-DD
```

RMAs additionally require:

```yaml
enforcement_authority:
  name: "..."
term_length: "ISO-8601 duration or 'indefinite'"
review_date: YYYY-MM-DD
```

### Recommended body structure

In order:

1. **Summary** — 2-3 sentences a non-specialist can read
2. **Background** — context for the requesting party and the question presented
3. **Question(s) presented** — what the parties asked
4. **Interpretation** — what the authority agreed
5. **Terms** — narrative form of the frontmatter `terms[]`
6. **Statute citations** — narrative form of `statute_anchors[]` with reasoning
7. **Limitations** — scope, exclusions, expiry triggers
8. **Effective date and review trigger**

The body is the canonical human-readable form. The frontmatter is the canonical machine-readable form. Both must agree; the validator (`scripts/validate.js`) enforces this.

## Identifiers and slugs

- **Permanent ID**: `PL-{KIND}-NNNN` where `KIND` is `JIA`, `RMA`, `NAL` (no-action letter), `PLR` (private letter ruling), `OPN` (advisory opinion). Monotonic, never reused, survives slug renames.
- **Slug**: lowercase, hyphen-separated, jurisdiction prefix, topic descriptor, optional issuance period. Example: `utah-mental-health-chatbot-disclosure-2026q2`.
- Internal references between PubLedge entities use the permanent ID, resolved at build time.

## Statute citations

Citations carry both a Bluebook-style `cite` and a `url`. The URL must be the most stable resolvable anchor available:

1. First preference: an [Every AI Law](https://everyailaw.com/) provision anchor.
2. Second preference: the official jurisdictional source (e.g., `le.utah.gov`, `sec.gov`, `irs.gov`).
3. Never: a paywall, a PDF on a private mirror, or an unstable third-party summary.

Citation text is never duplicated into PubLedge — always linked out. PubLedge is the interpretation registry, not a statute mirror.

## Integrity

Every published file referenced by `MANIFEST.yaml` is SHA-256 hashed. The manifest itself is the control file and is not self-hashed. Verification:

```bash
./scripts/validate-hashes.sh
```

After intentional edits:

```bash
./scripts/validate-hashes.sh --update
```

CI runs `validate-hashes.sh` on every push. A mismatch fails the build.

The hash mechanism is adapted from [skill-provenance](https://skillprovenance.dev). PubLedge does not adopt the full skill-provenance protocol — only the integrity pattern.

## Discoverability

Every PubLedge site exposes the following at the root:

| File | Purpose |
|---|---|
| `/sitemap.xml` | All canonical URLs |
| `/feed.xml` | RSS — registry updates and protocol changelog |
| `/agents.json` | Agent discovery + MCP endpoint pointer |
| `/llms.txt` | Concise index for LLM consumption |
| `/robots.txt` | Crawl directives (allow all by default) |
| `/schema/json/` | JSON Schemas + JSON-LD context |

These are the primary mechanisms by which AI agents and search engines discover PubLedge content without scraping HTML. They are mandatory.

## Drafting in public

Every PubLedge instrument carries a `disclaimer` frontmatter field. The default text:

> Suggested prior art. Not official output of any authority.

The disclaimer is rendered prominently in the page header until `status: published` is reached and the responsible authority has either signed off or expressly declined to do so. Records that move to `published` without authority sign-off must retain a softened disclaimer indicating that the interpretation is the requesting party's good-faith reading, not an official ruling.

This posture is non-optional. PubLedge exists in part to publish interpretations *before* an authority issues an official version, so that a public conversation has source material to work from.

## Supersession

When an instrument is replaced:

1. The new instrument carries `supersedes: PL-JIA-NNNN` in frontmatter.
2. The old instrument has its `status` set to `superseded` and gains `superseded_by: PL-JIA-NNNN+1`.
3. Both remain in the registry; URLs do not break.
4. The old instrument's page renders a banner pointing to the new one.

This is mandatory. PubLedge never deletes, only supersedes. The historical record is part of the value.

## License

PubLedge content (markdown, YAML, HTML) is licensed CC-BY 4.0. PubLedge code, schemas, and scripts are licensed Apache 2.0. See `LICENSE`, `LICENSE-APACHE`, `LICENSE-CC-BY-4.0`.

Bundled vendor snapshots retain their upstream licenses. The pinned [gist core ontology](vendor/gist/) is CC-BY 4.0 (Semantic Arts).

## What PubLedge is not

- Not a regulator. PubLedge does not issue rulings.
- Not a law firm. PubLedge templates are prior art, not legal advice.
- Not a blockchain. The integrity layer is plain SHA-256 over plain files.
- Not a CMS. PubLedge ships a static site; editors edit markdown in git.
- Not a replacement for official channels. PubLedge complements official rulings; it does not pretend to substitute for them.

## See also

- [PRIOR-ART.md](PRIOR-ART.md) — survey of analogous instruments PubLedge draws from
- `_workshop/TAXONOMY.md` — site ontology and bucket definitions
- `_workshop/CONTENT-GUIDE.md` — full per-content-type frontmatter and rendering conventions
- `vendor/gist/` — pinned upper ontology snapshot
