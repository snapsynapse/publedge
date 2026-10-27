# Contributing to PubLedge

Repository tooling requires Node.js >=20. The build, MCP server, and shared parsers use Node.js built-ins; schema validation uses the Ajv development dependencies recorded in `package.json` and `package-lock.json`. Install the locked dependencies before running schema checks or canonical CI. Domain configuration lives in `project.yml`.
Literal
```bash
npm ci
```
Last reconciled with the repository implementation: 2026-10-15.

## Code style

- Keep the build, MCP runtime, and shared parsers dependency-light. Reuse the existing Ajv setup for JSON Schema evals; dependency changes require review.
- Use the existing `parseYaml` helper rather than importing a YAML library.
- `'use strict'` at the top of every script.
- Keep functions pure where possible.

## Adding a new instrument

This walkthrough uses `us-ut-oaip-rma-2025-001` (Dentacor AI Radiograph RMA) as the worked example.

### 1. Choose a template

Use an existing template, such as [_templates/jia/utah-mental-health-chatbot-first-session-disclosure.md](_templates/jia/utah-mental-health-chatbot-first-session-disclosure.md) for a JIA or [_templates/rma/utah-ai-sandbox-mitigation-mental-health-chatbot.md](_templates/rma/utah-ai-sandbox-mitigation-mental-health-chatbot.md) for an RMA. Templates contain drafting content and template metadata; they are not complete instrument records. Replace their variables and supply instrument frontmatter validated by [schema/instrument.schema.json](schema/instrument.schema.json).
For a demonstration remap, start from an existing instrument of the same type and replace its identity, metadata, and body using the actual source evidence. Do not copy legal conclusions or review dates. Broad ingestion and new product work remain subject to [INTENT.md](INTENT.md); the federal demonstration remaps are frozen schema fixtures, not a routine currentness-maintenance queue.

### 2. Derive the stable identifier

Agreement and federal demonstration format: `{jurisdiction}-{authority}-{kind}-{YYYY-NNN}`. Statute instances instead preserve bill identity, for example `us-ut-legislature-statute-2025-hb452`. Existing identifiers are permanent; do not rename them to fit a new example.

| Field | Values |
|---|---|
| jurisdiction | `us-ut` (Utah), `us-co` (Colorado), `us` (federal) |
| authority | Established identifier segment, e.g. `oaip`; the frontmatter `authority` references its authority-record id, e.g. `utah-oaip` |
| kind | `jia`, `rma`, `nal`, `ao`, `plr`, `il`, `statute`; the schema uses long-form `type` values for federal letter/opinion types |
| YYYY-NNN | Effective year + zero-padded sequence within that authority+type+year scope |

Dentacor example: `us-ut-oaip-rma-2025-001`

The filename must equal the identifier: `us-ut-oaip-rma-2025-001.md`

The canonical URL uses jurisdiction and type mappings in `project.yml`, the authority record's `url_segment`, and the instrument instance:
`/{country}/{jurisdiction}/{authority}/{type}/{YYYY-NNN}/`
→ `/us/utah/oaip/rma/2025-001/`

### 3. Fill in the frontmatter

All instruments require `id`, `type`, `status`, `editorial_status`, `source`, `jurisdiction`, and `authority`; the schema adds conditional requirements. The following schema-valid excerpt is based on the existing Dentacor demonstration remap. Its expired initial term and July 25 review date are historical record values, not a new verification or a claim about subsequent events. Do not add this existing id again.
Literal
```yaml
---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Contract"
id: us-ut-oaip-rma-2025-001
instance: 2025-001
name: "Dentacor Regulatory Mitigation Agreement"
title: "Dentacor Regulatory Mitigation Agreement"
type: rma
source: demonstration-remap
jurisdiction: us-ut
authority: utah-oaip
issuing_authority: "Utah Office of Artificial Intelligence Policy"
term_start: 2025-05-31
term_end: 2026-05-31
status: expired
editorial_status: published
last_verified: 2026-07-25
---
```
For a new PubLedge-original proposal use legal `status: proposed` and `editorial_status: draft`. Record an issuer, issuance event, official source, or date only when supported by evidence. A draft's authority association does not mean that authority issued it. Deferred RMA commencement needs a `commencement_date_trigger`, not an invented `term_start`.
Record supporting source/version/locator evidence and unresolved limits through the [source-admission procedure](data/admission/sources/README.md) and existing admission scripts. A complete schema is not semantic or legal acceptance.

`status` must be one of the 9 values defined in [DEFINITIONS.md](DEFINITIONS.md):
`proposed`, `enacted`, `enforcing`, `phased-enforcement`, `pending-replacement`, `expired`, `superseded`, `withdrawn`, `terminated`.

`source` controls disclaimer composition at render time:
- `demonstration-remap` - editorial reconstruction of a publicly available document.
- `publedge-original-draft` - originated in PubLedge; not yet reviewed by the issuing authority.

Optional authority responses are recorded in `authority_response`. Use this only for an authority-supplied annotation, correction, clarification, no-comment response, or official supersession notice. The response annotates the record; it does not replace the original interpretation.

The instrument schema defines the entry shape. Do not copy an illustrative authority response into a record or infer a response from silence.

`position` must be one of `concurs`, `disputes`, `clarifies`, `declines-to-comment`, or `superseded-by-official`. Each entry needs `from`, ISO `date`, and at least one of `statement` or an authority-hosted `source` URL. When both are present, the source controls.

### 4. Add source documents (optional but preferred)

If a source PDF exists, retain its evidence under the admission procedure. Public `source_documents` and `extracted_text` references may name static assets under the instrument route in `docs/`; those assets are distinct from generated HTML and JSON. Supply and check any referenced files explicitly. The build renders their references; it does not copy an arbitrary local PDF automatically. `scripts/ocr-pdf.sh` extracts text from a supplied PDF; inspect its requirements before using it.
The existing Dentacor record illustrates these reference fields below. A metadata reference is not proof that the PDF or OCR text is present in a fresh clone. Verify file availability and licensing before publishing a new reference; use `publication_citations` for the official source URL.
Literal
```yaml
publication_citations:
  - "https://commerce.utah.gov/wp-content/uploads/2025/06/Dentacor-Mitigation-Agreement.pdf"
source_documents:
  - Dentacor-Mitigation-Agreement.pdf
extracted_text: Dentacor-Mitigation-Agreement.txt
```
### 5. Add obligation entries

Obligations live in `data/examples/obligations/`. The executable contract is [schema/obligation-record.schema.json](schema/obligation-record.schema.json). Each record requires `"@type"`, `id`, `name`, `group`, editorial `status`, `lifecycle_status`, and `last_verified`. Legal lifecycle is distinct from editorial status.
The following metadata excerpt uses an existing Dentacor obligation. Its expired lifecycle and date describe the retained historical review; they are not values to copy to a different obligation.
Literal
```yaml
---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Requirement"
id: dentacor-informed-consent-no-dentist
name: Dentacor - Informed Consent Disclosing Absence Of Dentist
group: requirement
status: draft
lifecycle_status: expired
last_verified: 2026-07-25
---
```
Add the source-grounded body with Summary, What Counts, What Does Not Count, and Statute Anchors sections. Lifecycle must agree with its implementing instruments under `scripts/eval-obligation-schema.js`.
### 6. Add mapping entries
Append to `data/examples/mapping/index.yml`. The instrument-reference key is currently `regulation`, not `instrument`. The following illustrates the existing Dentacor relationship; do not duplicate it. Retain source-owned mapping evidence and qualifications when editing an existing entry.
Literal
```yaml
- id: dentacor-rma-obligations
  regulation: us-ut-oaip-rma-2025-001
  authority: utah-oaip
  obligations:
    - dentacor-informed-consent-no-dentist
```
For source-owned anchors and admission metadata, use the existing mapping entry and [the source-admission procedure](data/admission/sources/README.md); the excerpt above is not a replacement for its complete evidence-bearing entry.

### 7. Check authority record exists

Each `authority:` value needs a corresponding file under `data/examples/authorities/`. Follow an existing authority record, including its stable id, name, ontology type, jurisdiction, official reference, review date, and `url_segment` for hierarchical routes. Verify references with `validate.js` and review-date policy with `verify.js`.

### 8. Validate and build

Literal
```bash
# Cross-reference checks (IDs, authority refs, status values)
node scripts/validate.js

# Review-date and completeness checks (may report existing overdue reviews)
node scripts/verify.js
npm run eval:temporal-status

# Regenerate docs/
node scripts/build.js
node scripts/build-extras.js

# Run contract and regression evals, including frontmatter parser coverage
npm run evals

# Preview locally
python3 -m http.server -d docs 8000
```
Resolve validation errors before submitting. Review-date or temporal failures require evidence-backed review; do not bump dates or statuses to make the checks pass. See [VERIFICATION.md](VERIFICATION.md).

### 9. Update hashes
Literal
```bash
./scripts/validate-hashes.sh --update
```
Refreshes `MANIFEST.yaml` with SHA-256 hashes of all canonical files.

### 10. Open a pull request

1. Work on an isolated feature branch from fetched, reconciled `main`.
2. Commit source files (`data/`, `project.yml`) and generated `docs/` - CI fails if `docs/` drifts from sources.
3. Open PR describing: what instrument, what authority, what the `source` value is and why, any open questions.

## `legacy_id` and redirect stubs

If a record's identifier ever changes, add a `legacy_id:` field to frontmatter. The build script emits a meta-refresh redirect stub at the old path. Never delete old paths - URLs must not break.

## Modifying project configuration

`project.yml` drives entity roles, status enums, group definitions, and navigation. Changes to entity names or directories require:

1. Update `project.yml`.
2. Rename the corresponding data directory.
3. Run `validate.js` - confirm references resolve.
4. Run `build.js` - regenerate the site.

## Modifying the build scripts

`scripts/build.js` - entity pages, API JSON, sitemap.
`scripts/build-extras.js` - reference HTML, feeds, discovery files, navigation shell.
`scripts/lib/parse.js`, `content.js`, and `mapping.js` provide the zero-dependency parsers shared by validators, the static build, and the MCP server. Parser behavior changes therefore have one implementation and must be covered by the parser and MCP lockstep evals.

Both must complete without errors. CI runs them on every push and PR.
Run `npm run evals` after parser or build changes. `scripts/eval-parser.js` specifically covers quoted frontmatter keys such as `"@type"` and URL scalar list values such as `publication_citations`.

## Pull request process

1. Branch from `main`.
2. Run reference/schema checks and review-date/temporal checks; retain unresolved source-review failures explicitly.
3. Run `build.js` + `build-extras.js` - clean output.
4. Run `npm run evals` - all contract and parser regression checks pass.
5. Run `validate-hashes.sh --update` - `MANIFEST.yaml` current.
6. Commit source + `docs/`.
7. Open PR with description of what changed, why, validation results, and any unresolved source-review limits. Canonical CI is `npm run verify:ci`; the workflow pins Obligation-First and resolves the admission comparison base before running it. See `.github/workflows/build.yml` and `scripts/verify-ci.js`.
