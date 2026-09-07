# PubLedge maintenance pilot
Tranche T10, 2026-09-06 local time, 2026-09-07 UTC.

## Scope and authority
PubLedge remains a maintained recordkeeping convention with existing demonstration remaps. This pilot adds no jurisdictions or product scope. It preserves the configured cadence: 90 days for active instruments including statutes, JIAs and RMAs; 180 days for authorities and obligations; 365 days for other historical demonstration instrument types. `expired` does not alone select the 365-day rule.

The inventory covers 61 entities: 18 instruments, 35 obligations and eight authorities. Nine instruments have a June 4 verification date outside their 90-day cadence. Their fixed review deadline is September 3; each new run preserves that deadline and stable finding rather than resetting its age. Full IDs, paths, dates, source classifications and references are in `ops/evidence/maintenance-pilot-2026-09-06.json`.

Five overdue statutory records remain tied to EveryAILaw's Utah statutory spine. This pilot links that shared evidence without importing its dates or assuming responsibility for statutory interpretation. The proposed JIA is a PubLedge original draft; its generic Learning Lab link cannot prove an authority issued it. ElizaChat is an expired demonstration. Neither is automatically promoted or renewed.

## Three selected official sources
| Source | Reason for selection | Limit |
|---|---|---|
| Utah OAIP Doctronic agreement page | Existing regulator-trust example with an approaching recorded term end | A page does not itself renew the signed term or prove compliance |
| Utah OAIP Legion agreement page | Existing example whose commencement requires explicit authority evidence | No commencement or effective date inferred from a missing notice |
| Utah Code Title 13 Chapter 72 | Context shared by the SB149 statutory spine and its SB332/HB320 links | Refer interpretation and statutory-record updates to EveryAILaw; a chapter snapshot does not verify every bill or mapping |

Configuration is in `scripts/lib/maintenance/config.js`. The shared statutory pointer is `https://everyailaw.com/regulation/utah-sb149/`, owned by EveryAILaw `data/instruments/utah-sb149.md`. No EveryAILaw evidence was refreshed by this pilot.

## Operation and durable review
The source collector is manual-only and requires `--live`. It fetches at most three configured source URLs, each with at most three same-host redirects, a 30-second transport timeout and a 20MB response limit. It uses no paid providers. PDF sources require original bytes and bounded local `pdftotext` extraction. It does not follow documents linked from pages.

Literal
```
cd /Users/snap/Git/publedge
npm run observe:maintenance -- --live
```
Raw receipts and reports go to a fresh ignored `.verification-reports/` directory. A nonempty report directory is refused. `ops/maintenance/source-monitor-state.json` holds the revision-checked durable queue and run checkpoints; raw/report/state persistence failure stops further requests. The collector never writes `data/examples/`, generated site records, `last_verified` dates or legal statuses. Exit 0 means healthy, 1 review required, 2 degraded/failed. Unknown weekly review capacity keeps a nonempty queue degraded. Owner is Sam Rogers.

Baseline and changed documents create review findings. Identical repeat observations do not. A transition back to earlier content creates a new transition review even if that earlier snapshot was accepted. Current source coverage does not close overdue record reviews. Coverage repairs remain open until a human supplies matching qualified evidence. Overdue pending findings retain their original due dates and produce `owner_action_required`; this is a local report condition, not an email claim.

Human acceptance uses a local JSON decision file with `findingId`, `actor`, `reason` and `observationId`, selected from the actual ledger. The source observation must qualify for the same record and must not predate the finding; failed source coverage cannot be cleared by an old successful observation. An age finding additionally requires a separately reviewed record date that is within cadence, newer than its old date and no later than the evidence date. Passing the collector does not make that editorial change. Rebuild and validate any separately approved record edits through the existing canonical pipeline before accepting their review.

Replace: `/absolute/path/to/review-decision.json` -> the file containing the explicit human decision and actual ledger IDs
Customize
```
cd /Users/snap/Git/publedge
node scripts/observe-maintenance.js --review /absolute/path/to/review-decision.json
```
The review operation records the named human's acceptance and reason in the local ledger. It does not close a GitHub issue, publish data or send recovery mail. Findings for uncollected sources cannot be accepted by borrowing another record's observation. Deferred or rejected editorial work remains a separate human decision, not an automated freshness reset.

## Pilot evidence
Three public-source fetch attempts and zero paid calls were made. Corrected coverage is 2/3: Doctronic and Legion contain usable authority page text. The Utah Code URL returned a JavaScript content shell whose visible text is only a chapter title, so it remains unavailable. No statutory content, commencement date or legal outcome was inferred.

The initial collector falsely treated ordinary Cloudflare email-protection assets as bot challenges. Saved-byte inspection identified this error; the guard now recognizes actual challenge markers and has regression fixtures. Initial outputs remain marked invalid in the ignored live directory. Only this tranche's new, unreviewed ledger was rebuilt under its revision guard from the same hash-verified bytes. Its nine real overdue findings were recreated with the same identities and deadlines; there was no prior review work. No additional source requests were made.

Valid outputs: `.verification-reports/t10-corrected-replay-2026-09-06/` and `ops/evidence/maintenance-pilot-2026-09-06.json`. There are 12 pending findings: nine overdue record reviews, two authority-page baseline reviews, and one source-access repair. All nine original overdue instruments remain overdue. The wider corpus has not been reverified.

## Weekly workflow and notifications
The existing Monday 09:00 UTC schedule still runs the age/completeness verifier and temporal evaluator, not the new live collector. A failed check now ends red after evidence upload and issue reporting, even if issue creation succeeds. Setup failures or missing outcomes also fail the final gate. The workflow attempts artifact retention for 14 days; it reports upload outcome rather than assuming an upload succeeded.

The workflow reuses the stable `Knowledge drift detected` issue, migrating a legacy date-titled labeled issue when necessary. It compares a deterministic report marker against both the issue body and comments before posting. Elapsed day counters and runner timing noise do not create new comments; record identity, verification date, cadence and temporal-result changes do. Query failures remain errors. A green age check never auto-closes the issue: human source review is still required.

GitHub issue acceptance is not mailbox receipt. Direct email, independent missing-run monitoring and human acknowledgement remain unconfigured. Publishing this workflow can make GitHub's native failed-run email useful once account settings and receipt tests are completed; this tranche did not publish or dispatch it. The cross-repo setup guide lives in LocalBrain `0_Across/Repository Freshness Notifications - Setup and Test.md`.

## Validation
Run `npm run verify:ci` for the canonical hash, schema, build, semantic, package, workflow and maintenance gates. `npm run test:maintenance` runs injected-source and mocked-GitHub tests without network or messages. Tests distinguish current, changed, overdue and inaccessible results, meaningful verifier errors, stable issue deduplication, source reversion, persistence failure and evidence-backed human recovery. Failed-run artifacts and final nonzero workflow status are covered. Live receipts supplement fixtures; no test success upgrades the Utah content shell to coverage.
