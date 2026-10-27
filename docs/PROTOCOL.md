---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Specification"
title: "PubLedge Protocol"
version: "0.2.0"
license: "CC-BY-4.0"
created: 2026-04-18
modified: 2026-10-15
---

# PubLedge Protocol

PubLedge is an open recordkeeping protocol for fact-specific written interpretations between two parties.

A PubLedge record captures a question, an answer, who agreed to it, what statutes or rules it relies on, and what the parties are now permitted, required, or restricted from doing as a result. Records are plain markdown with structured frontmatter. They are versioned in git, hash-pinned for integrity, and machine-readable through schemas bound to an open upper ontology.

## What PubLedge is for

PubLedge generalizes a single class of artifact across many domains:

- **Regulatory** - Joint Interpretation Agreements (JIAs), Regulatory Mitigation Agreements (RMAs), no-action letters, private letter rulings, advisory opinions
- **Civic** - HOA decision logs, co-op governance records, flying-club asset agreements, tool-library lending records, community land-trust commitments
- **Private** - published private rulings between two parties (e.g., a vendor and a regulator) where one party wants the public to be able to read and rely on the interpretation

The civic and regulatory framings are different use cases of the same underlying artifact: a written interpretation, jointly authored or approved, that constrains future behavior between the parties and may be of interest to third parties.

## Core principles

1. **Human-readable, machine-verifiable** - every record is markdown a person can read and JSON a machine can parse.
2. **Plain text, no proprietary dependencies** - records can be read as text. Repository tooling requires Node.js; schema checks use the development dependencies in `package.json`.
3. **Open ontology** - entities bind to [Semantic Arts gist](https://semanticarts.com/gist/) (CC-BY 4.0) for cross-system interoperability.
4. **Hash-pinned integrity** - canonical source hashes in `MANIFEST.yaml` detect source-to-manifest mismatches. The unsigned manifest does not independently prove publication time or prevent replacement of both source and manifest.
5. **Drafting-in-public posture** - published records carry a disclaimer until reviewed and accepted by the relevant authority.

## Entity model

PubLedge inherits the Knowledge-as-Code four-role spine and binds each role to a gist class:

| Role | Name | gist class | What it is |
|---|---|---|---|
| Authority | Authority | `gist:GovernmentOrganization` | The party with interpretive or regulatory authority (Utah OAIP, SEC, IRS, CFPB; or, for civic uses, an HOA board, co-op council, etc.) |
| Container | Instrument | `gist:Agreement` (JIA) or `gist:Contract` (RMA, enforceable) | The interpretation record itself |
| Secondary | Term | `gist:ContractTerm` | An individual clause within an instrument |
| Primary | Obligation | `gist:Requirement` / `gist:Restriction` / `gist:Permission` | The behavior the instrument requires, prohibits, or permits |

The Obligation-First binding represents evidenced issuance as an administrative `of:Determination`. This separates the artifact from the authoritative act that created or published it. An issuance determination targets the instrument, decides no allegation, and is not a substitute for the adjudicative determinations published by AI Incident Law. Proposed or draft instruments do not receive an issuance determination until an official source and issuance date establish that the act occurred.

The vocabulary mapping is published at `/reference/vocabulary/` and bound machine-readably in `/schema/json/context.jsonld`.

## Required structure

Every PubLedge instrument has YAML frontmatter and a markdown body.

### Required frontmatter fields
The executable instrument contract is [schema/instrument.schema.json](schema/instrument.schema.json). All instrument records require `id`, `type`, `status`, `editorial_status`, `source`, `jurisdiction`, and `authority`. The schema also applies type-specific and source/status-specific requirements.
This minimal example describes the existing unissued JIA draft; it is not an authority-issued agreement or a new record to add.
Literal
```yaml
id: us-ut-oaip-jia-2026-001
type: jia
source: publedge-original-draft
jurisdiction: us-ut
authority: utah-oaip
status: proposed
editorial_status: draft
```
Add evidence-supported metadata such as `"@type"`, `instance`, `slug`, `name`, `title`, `issued_by`, `parties`, `obligation_kind`, `statute_anchors`, `terms`, and dates. Use `enacted` for recorded issuance/enactment, `effective` for effect, and `term_start`/`term_end` for contractual terms; the old `issued_date` example is not the current date convention. Do not infer issuance or agreement from a draft's authority association.
Conditional requirements include:
- RMAs need at least one of `issuing_authority`, `enforcement_authority`, or `parties`, plus a dated `term_start` or a nonempty `commencement_date_trigger`. A deferred commencement must not be replaced with an invented date.
- An `authority-issued` record that is editorially `published` or legally `enforcing` requires `official_url`, `publication_citations`, `source_documents`, `issuance_event`, and `enacted`.
- Private-letter and revenue rulings require `redaction_level`.
- A `publedge-original-draft` must retain the draft/proposed constraints in the schema; editorial publication does not establish legal force.
- Any withdrawal-triplet field requires the complete `withdrawn_date`, `withdrawal_reason`, and `withdrawn_by_instrument` triplet.
`last_verified` is checked separately by `scripts/verify.js`; missing, invalid, or future dates fail verification. Record a review date only after the scoped source review described in [VERIFICATION.md](VERIFICATION.md). The generated `record.json` contract is distinct from frontmatter and is published at `/schema/json/record.schema.json`.
See [CONTRIBUTING.md](CONTRIBUTING.md) for worked examples and [DEFINITIONS.md](DEFINITIONS.md) for legal, editorial, and obligation-lifecycle vocabularies.

### Recommended body structure

In order:

1. **Summary** - 2-3 sentences a non-specialist can read
2. **Background** - context for the requesting party and the question presented
3. **Question(s) presented** - what the parties asked
4. **Interpretation** - what the authority agreed
5. **Terms** - narrative form of the frontmatter `terms[]`
6. **Statute citations** - narrative form of `statute_anchors[]` with reasoning
7. **Limitations** - scope, exclusions, expiry triggers
8. **Effective date and review trigger**

The body is the canonical human-readable form. The frontmatter is the canonical machine-readable form. Both must agree. `scripts/validate.js` checks references and selected cross-field rules, and the schema evals validate record shapes. These checks do not establish semantic agreement between prose and frontmatter; that requires source-grounded editorial review.

## Identifiers and slugs

- **Permanent ID**: `{jurisdiction}-{authority}-{kind}-{instance}`, all lowercase. Agreements and the federal demonstration remaps use year-based instances such as `2025-001`; statutes preserve bill-based instances such as `2025-hb452`. Examples: `us-ut-oaip-rma-2025-001`, `us-sec-corpfin-nal-2025-001`, and `us-ut-legislature-statute-2025-hb452`. The identifier authority segment is the established short form (such as `oaip`), while the record's `authority` field references the authority-record id (such as `utah-oaip`). Instrument kinds include `jia`, `rma`, `nal`, `plr`, `ao`, `il`, and `statute`; long-form `type` values and URL segments are mapped in `project.yml`. Preserve native document numbers in source metadata rather than replacing established ids. IDs are permanent, never reused, and survive slug renames.
- **Slug**: lowercase, hyphen-separated, jurisdiction prefix, topic descriptor, optional issuance period. Example: `utah-mental-health-chatbot-disclosure-2026q2`.
- Internal references between PubLedge entities use the permanent ID, resolved at build time.

## Statute citations

Citations carry both a Bluebook-style `cite` and a `url`. The URL must be the most stable resolvable anchor available:

1. First preference: an [Every AI Law](https://everyailaw.com/) provision anchor.
2. Second preference: the official jurisdictional source (e.g., `le.utah.gov`, `sec.gov`, `irs.gov`).
3. Never: a paywall, a PDF on a private mirror, or an unstable third-party summary.

Citation text is never duplicated into PubLedge - always linked out. PubLedge is the interpretation registry, not a statute mirror.

## Integrity

Every published file referenced by `MANIFEST.yaml` is SHA-256 hashed. The manifest itself is the control file and is not self-hashed. Verification:
Literal
```bash
./scripts/validate-hashes.sh
```
After intentional edits:
Literal
```bash
./scripts/validate-hashes.sh --update
```
CI runs `validate-hashes.sh` on every push. A mismatch fails the build.

The hash mechanism is adapted from [skill-provenance](https://skillprovenance.dev). PubLedge does not adopt the full skill-provenance protocol - only the integrity pattern.

## Discoverability

Every PubLedge site exposes the following at the root:

| File | Purpose |
|---|---|
| `/sitemap.xml` | All canonical URLs |
| `/feed.xml` | RSS - registry updates and protocol changelog |
| `/agents.json` | Agent discovery + MCP endpoint pointer |
| `/llms.txt` | Concise index for LLM consumption |
| `/robots.txt` | Crawl directives (allow all by default) |
| `/schema/json/` | JSON Schemas + JSON-LD context |

These are the primary mechanisms by which AI agents and search engines discover PubLedge content without scraping HTML. They are mandatory.

## Drafting in public

Every PubLedge instrument carries a `disclaimer` frontmatter field. The default text:

> Suggested prior art. Not official output of any authority.

The disclaimer is composed from `source` and legal `status`, independently of `editorial_status`. A published demonstration remap remains non-authoritative, and a PubLedge-original draft remains suggested prior art unless authority sign-off changes `source` to `authority-issued`.

This posture is non-optional. PubLedge exists in part to publish interpretations *before* an authority issues an official version, so that a public conversation has source material to work from.

## Supersession

When an instrument is replaced:

1. The new instrument carries `supersedes: {prior-id}` in frontmatter.
2. The old instrument has its `status` set to `superseded` and gains `superseded_by: {new-id}`.
3. Both remain in the registry; URLs do not break.
4. The old instrument's page renders a banner pointing to the new one.

This is mandatory. PubLedge never deletes, only supersedes. The historical record is part of the value.

## Authority response

PubLedge is operator-agnostic. The authority that issued or enforces an instrument is never the operator of the registry. The protocol nonetheless gives that authority a first-class, low-friction way to respond to or correct any record about its own instrument, without operating, hosting, or maintaining anything.

Three mechanisms, lowest friction first:

1. Open a GitHub issue or pull request against the record. Standard git. No PubLedge account.
2. Point to the authority's own published statement. The record gains an `authority_response` entry whose `source` is the authority's URL; PubLedge quotes, it does not paraphrase.
3. Supply a signed statement recorded directly in the record's frontmatter under `authority_response`.

The `authority_response` field is an optional list. Each entry requires `from`, an ISO `date`, and a `position` from the closed vocabulary in [DEFINITIONS.md](DEFINITIONS.md), plus at least one of `statement` or an authority-hosted `source` URL. `signature` is optional. The instrument schema and `scripts/validate.js` enforce these structural rules. Add an entry only with authority-supplied evidence; an illustrative response is not evidence of concurrence or clarification.

Rendering rules:

1. An authority response is rendered prominently on the record page, above the body, visually distinct from the `disclaimer`.
2. A response never deletes or edits the original interpretation. It annotates it. This follows the same never-delete-only-annotate rule as Supersession.
3. Multiple responses are kept in chronological order. None is removed when a later one is added.

Non-goals, stated so the posture is unambiguous:

- This is not sign-off-as-a-service. PubLedge does not solicit responses and does not gate publication on them.
- Absence of a response means nothing. It is not implied consent, dispute, or endorsement.
- The authority controls its own words. Where `source` is present, the authority's published text governs; the in-record `statement` is a convenience copy.

This section reinforces, rather than softens, "Not a regulator": PubLedge gives the regulator a microphone, not a console.

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

- [PRIOR-ART.md](PRIOR-ART.md) - survey of analogous instruments PubLedge draws from
- `_workshop/TAXONOMY.md` - site ontology and bucket definitions
- `_workshop/CONTENT-GUIDE.md` - full per-content-type frontmatter and rendering conventions
- `vendor/gist/` - pinned upper ontology snapshot
