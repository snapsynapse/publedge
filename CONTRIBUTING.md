# Contributing to PubLedge

Zero external dependencies. All domain config lives in `project.yml`. Scripts use only Node.js built-ins.

## Code style

- No npm packages. Scripts use only Node.js built-ins.
- Use the existing `parseYaml` helper rather than importing a YAML library.
- `'use strict'` at the top of every script.
- Keep functions pure where possible.

## Adding a new instrument

This walkthrough uses `us-ut-oaip-rma-2025-001` (Dentacor AI Radiograph RMA) as the worked example.

### 1. Choose a template

Pick the template closest to the instrument type:

```
_templates/jia/template.md      ← Joint Interpretation Agreement
_templates/rma/template.md      ← Regulatory Mitigation Agreement
```

For no-action letters, advisory opinions, PLRs, and interpretive letters, start from the most structurally similar template and adjust `type:` accordingly.

### 2. Derive the stable identifier

Format: `{jurisdiction}-{authority}-{type}-{YYYY-NNN}`

| Field | Values |
|---|---|
| jurisdiction | `us-ut` (Utah), `us` (federal) |
| authority | `utah-oaip`, `sec-corpfin`, `cfpb`, `irs-chief-counsel`, `irs-tege`, `cftc-dsio`, `utah-legislature` |
| type | `jia`, `rma`, `nal`, `ao`, `plr`, `il`, `statute` |
| YYYY-NNN | Effective year + zero-padded sequence within that authority+type+year scope |

Dentacor example: `us-ut-oaip-rma-2025-001`

The filename must equal the identifier: `us-ut-oaip-rma-2025-001.md`

The canonical URL is derived automatically from the id:
`/{country}/{jurisdiction}/{authority}/{type}/{YYYY-NNN}/`
→ `/us/utah/oaip/rma/2025-001/`

### 3. Fill in the frontmatter

Required fields for all instrument types (frontmatter spec v0.2):

```yaml
---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Contract"
id: us-ut-oaip-rma-2025-001
instance: 2025-001
slug: utah-dentacor-ai-radiograph-2025
name: "Short display name"
title: "Long page title"
type: rma
source: demonstration-remap          # or: publedge-original-draft
jurisdiction: us-ut
authority: utah-oaip
issued_by:
  "@type": "https://w3id.org/semanticarts/ns/ontology/gist/SubCountryGovernment"
  name: "Utah Office of Artificial Intelligence Policy (OAIP)"
  ref: "https://commerce.utah.gov/ai/learning-lab/"
issuance_event: gist:Determination
enacted: 2025-05-31
effective: 2025-05-31
term_start: 2025-05-31
term_end: 2026-05-31
status: enforcing
official_url: https://commerce.utah.gov/ai/agreements/dentacor/
obligation_kind: [permission, requirement, restriction]
reliance_scope: requesting-party-only
parties:
  - name: "Utah Office of Artificial Intelligence Policy"
    role: issuing_authority
  - name: "Dentacor, LLC"
    role: participant
statute_anchors:
  - cite: "Utah Code §13-72-201"
    url: "https://le.utah.gov/xcode/Title13/Chapter72/13-72-S201.html"
disclaimer: ""
---
```

`status` must be one of the 9 values defined in [DEFINITIONS.md](DEFINITIONS.md):
`proposed`, `enacted`, `enforcing`, `phased-enforcement`, `pending-replacement`, `expired`, `superseded`, `withdrawn`, `terminated`.

`source` controls disclaimer composition at render time:
- `demonstration-remap` — editorial reconstruction of a publicly available document.
- `publedge-original-draft` — originated in PubLedge; not yet reviewed by the issuing authority.

Optional authority responses are recorded in `authority_response`. Use this only for an authority-supplied annotation, correction, clarification, no-comment response, or official supersession notice. The response annotates the record; it does not replace the original interpretation.

```yaml
authority_response:
  - from: utah-oaip
    date: 2026-05-18
    position: clarifies
    statement: "Authority-supplied text copied into the record."
    source: https://commerce.utah.gov/ai/example-response/
    signature: pgp:0xABCD1234
```

`position` must be one of `concurs`, `disputes`, `clarifies`, `declines-to-comment`, or `superseded-by-official`. Each entry needs `from`, ISO `date`, and at least one of `statement` or an authority-hosted `source` URL. When both are present, the source controls.

### 4. Add source documents (optional but preferred)

If a source PDF exists:

```bash
# Place PDF alongside the record in the instrument's docs/ dir (build script copies it)
cp Dentacor-Mitigation-Agreement.pdf \
  docs/us/utah/oaip/rma/2025-001/

# OCR if no machine-readable text layer
./scripts/ocr-pdf.sh \
  docs/us/utah/oaip/rma/2025-001/Dentacor-Mitigation-Agreement.pdf
```

Reference from frontmatter:

```yaml
publication_citations:
  - "https://commerce.utah.gov/wp-content/uploads/2025/06/Dentacor-Mitigation-Agreement.pdf"
source_documents:
  - Dentacor-Mitigation-Agreement.pdf
extracted_text: Dentacor-Mitigation-Agreement.txt
```

### 5. Add obligation entries

Obligations live in `data/examples/obligations/`. Each obligation is a separate markdown file:

```yaml
---
id: us-ut-oaip-rma-2025-001-ob-01
instrument: us-ut-oaip-rma-2025-001
obligation_kind: requirement
description: "Dual-verification: hygienist + AI must concur; discrepancy escalates to licensed dentist"
statute_anchor:
  cite: "Utah Code §58-69-5"
  url: "https://le.utah.gov/xcode/Title58/Chapter69/58-69-S5.html"
---
```

### 6. Add mapping entries

Add rows to `data/examples/mapping/index.yml`:

```yaml
- id: us-ut-oaip-rma-2025-001-map-01
  instrument: us-ut-oaip-rma-2025-001
  obligations:
    - us-ut-oaip-rma-2025-001-ob-01
```

### 7. Check authority record exists

Each `authority:` value needs a corresponding file under `data/examples/authorities/`. If adding a new authority, create `data/examples/authorities/{authority-slug}.md` with frontmatter: `id`, `name`, `@type`, `jurisdiction`, `ref`. Check `project.yml` under `entities.authority` for required fields.

### 8. Validate and build

```bash
# Cross-reference checks (IDs, authority refs, status values)
node scripts/validate.js

# Structural checks (freshness, completeness)
node scripts/verify.js

# Regenerate docs/
node scripts/build.js
node scripts/build-extras.js

# Run contract and regression evals, including frontmatter parser coverage
npm run evals

# Preview locally
python3 -m http.server -d docs 8000
```

Fix any errors from `validate.js` before submitting.

### 9. Update hashes

```bash
./scripts/validate-hashes.sh --update
```

Refreshes `MANIFEST.yaml` with SHA-256 hashes of all canonical files.

### 10. Open a pull request

1. Create a feature branch from `main`.
2. Commit source files (`data/`, `project.yml`) and generated `docs/` — CI fails if `docs/` drifts from sources.
3. Open PR describing: what instrument, what authority, what the `source` value is and why, any open questions.

## `legacy_id` and redirect stubs

If a record's identifier ever changes, add a `legacy_id:` field to frontmatter. The build script emits a meta-refresh redirect stub at the old path. Never delete old paths — URLs must not break.

## Modifying project configuration

`project.yml` drives entity roles, status enums, group definitions, and navigation. Changes to entity names or directories require:

1. Update `project.yml`.
2. Rename the corresponding data directory.
3. Run `validate.js` — confirm references resolve.
4. Run `build.js` — regenerate the site.

## Modifying the build scripts

`scripts/build.js` — entity pages, API JSON, sitemap.
`scripts/build-extras.js` — reference HTML, feeds, discovery files, navigation shell.
`scripts/lib/parse.js`, `content.js`, and `mapping.js` provide the zero-dependency parsers shared by validators, the static build, and the MCP server. Parser behavior changes therefore have one implementation and must be covered by the parser and MCP lockstep evals.

Both must complete without errors. CI runs them on every push and PR.
Run `npm run evals` after parser or build changes. `scripts/eval-parser.js` specifically covers quoted frontmatter keys such as `"@type"` and URL scalar list values such as `publication_citations`.

## Pull request process

1. Branch from `main`.
2. Run `validate.js` and `verify.js` — no errors.
3. Run `build.js` + `build-extras.js` — clean output.
4. Run `npm run evals` — all contract and parser regression checks pass.
5. Run `validate-hashes.sh --update` — `MANIFEST.yaml` current.
6. Commit source + `docs/`.
7. Open PR with description of what changed and why.
