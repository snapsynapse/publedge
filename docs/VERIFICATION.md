# Verification
Last reconciled with the repository implementation: 2026-10-15.
PubLedge's verification checks detect review work and structural problems. They do not establish legal currentness, source authenticity, agency endorsement, or corpus completeness. SHA-256 manifest consistency is a separate check; see [the public verification guide](reference/verify/index.html).
## How it works
`scripts/verify.js` checks review dates and mapping completeness. The scheduled workflow also runs the separate temporal-status eval.
### Review-date checks
Each instrument, obligation, and authority needs a `last_verified` date. The verifier reports:
- **Fresh**: a valid, nonfuture review date within that entity's configured cadence.
- **Stale**: review age exceeds the cadence.
- **Never verified**: no `last_verified` value.
- **Invalid**: the value is not a valid calendar date in `YYYY-MM-DD` form.
- **Future**: the review date is later than the verifier's current UTC date.
- **Frozen fixture**: an explicitly listed schema fixture with a valid, nonfuture date, exempt from aging. This does not mean it was reviewed for currentness.
A fresh label measures the age of the recorded review. It is not a finding that the law, agreement, or underlying source remains current.
### Mapping and frozen-fixture checks
The verifier checks that instruments have mappings, except the relationship-only instruments explicitly listed in `verification.allowed_unmapped_instruments`, and that mappings reference existing instruments and obligations.
It also checks the frozen-fixture declarations: ids must exist, frozen instruments must be historical demonstration remaps, frozen obligations cannot be mapped from nonfrozen instruments, and frozen authorities cannot be used by nonfrozen instruments.
`node scripts/validate.js` checks additional cross-references and selected frontmatter rules. JSON Schema evals and admission checks are separate parts of canonical CI; passing `verify.js` alone is not equivalent to passing them.
## Recording a review date
Update `last_verified` only after actual source review, retaining the evidence and unresolved limits required by the repository's source-admission process. Do not change a date merely to clear a warning. A review of one source or unit does not renew the whole record or corpus; unresolved questions remain explicit.
The five federal demonstration remaps and the obligations and authorities reachable only from them are frozen schema fixtures. Keep their recorded dates; do not renew them or perform official-source access work for them under routine currentness maintenance. [INTENT.md](INTENT.md) owns this scope, and `project.yml` names the exact frozen ids.
See [ops/MAINTENANCE-PILOT.md](ops/MAINTENANCE-PILOT.md) for the bounded source-observation procedure. An observation does not itself renew verification dates or legal statuses.
## Configuring review cadence
The current `verification` cadence keys in `project.yml` are shown below. This is a configuration excerpt, not a replacement for the full verification block and its allowlists.
Literal
```yaml
verification:
  staleness_days: 90
  authority_staleness_days: 180
  obligation_staleness_days: 180
  historical_demonstration_staleness_days: 365
```
Active agreements and statutes use `staleness_days`; authorities and obligation definitions use their respective keys. Historical demonstration remaps other than JIAs, RMAs, and statutes use `historical_demonstration_staleness_days` unless explicitly frozen. The shared implementation is `scripts/lib/verify-policy.js`.
The default active cadence is 90 days; omitted role-specific keys fall back to the active cadence. Invalid thresholds fail configuration validation. Change cadence or fixture scope only through reviewed configuration changes, not to mask overdue reviews.
## Running verification
From a repository checkout with development dependencies installed, run both checks used by the scheduled workflow:
Literal
```bash
npm run verify
npm run eval:temporal-status
```
`verify.js` exits 0 only when no stale, missing, invalid, future-dated, or completeness problems are found. It exits 1 when any of those problems occur, or when required configuration/data cannot be loaded. The temporal-status eval separately checks recorded lifecycle/date consistency; it does not establish current legal effect from fresh external evidence.
A nonzero result is review work to resolve with evidence. It is not permission to alter status or verification dates.
## GitHub Actions workflow
[.github/workflows/verify.yml](.github/workflows/verify.yml) runs Mondays at 09:00 UTC and supports manual `workflow_dispatch`. It runs `npm ci`, captures both verification and temporal-status results, and attempts to upload the report with 14-day artifact retention before issue reporting.
On failure, it creates or updates a stable `knowledge-drift` issue and deduplicates unchanged normalized reports. The final step fails the scheduled job if either check failed or its result is unavailable. It does not use `continue-on-error: true` to turn failed verification into a pass. Reporting failures can also fail the workflow; the artifact step and summary provide separate evidence of what completed.
An existing drift issue is not automatically closed by a later passing run. Human review confirms resolution. Independent missing-run monitoring, recovery email acceptance, and human receipt remain separate open items; a configured weekly job is not proof that someone received its result.
The push/PR build workflow uses `npm run verify:ci`, which includes schema, admission, build, compatibility, and regression checks. It is distinct from the scheduled currentness-review workflow. See `scripts/verify-ci.js` for the canonical gate list.
## AI-assisted review
`scripts/verify.js` retains a commented-out model-review example. It is not executed by the verifier or scheduled workflow and is not an implemented source-currentness check. No provider integration, paid run, or automatic review-date/status update is enabled by this documentation. Any future integration requires its own reviewed scope, evidence policy, and authorization.
