# PubLedge MCP discovery guidance
Date: 2026-09-08. Scope: local source candidate, not a published release.

## Behavior
Both `initialize` and `server/discover` provide the same guidance for the existing 13 native-record tools. The guidance identifies PubLedge, explains that records come from the installed package, and directs consumers to `get_legal-instrument` or `fetch_by_url` for source, editorial, provenance and reliance information omitted from summaries.
Demonstration remaps, the proposed original draft, recorded verification dates and administrative issuance retain their distinct meanings. Discovery links to Obligation First and its JSON-LD context without declaring that context an output schema for native tool payloads. Three instrument-tool descriptions clarify complete-record retrieval and the absence of network fetching.

## Validation
The source MCP contract and packed/installed candidate checks verify consistent guidance and retrieve both the proposed original draft and a demonstration remap. Source contract checks compare their provenance, editorial/status fields and body with the bundled source records. Installed-package checks verify retained source labels, provenance, body and the draft/proposed boundary.
Full `npm run verify:ci` passed in `/private/tmp/publedge-guidance-candidate-n3rm5nbx` with `CHECK_OF_REQUIRED=1` and Obligation First at `eefe360`. The candidate was copied from the intended working files and staged in its own disposable Git index before verification. No commit was created and the source index was untouched. The build left no unstaged diff; the actual change against the source repository baseline passed `git diff --check`. Checks included all 17 maintenance tests, installed-package smoke, deterministic/generated-tree parity and the OF fingerprint for 130 records.
The initial working-tree run passed the substantive gates and 17 maintenance tests; its final generated-doc clean-diff gate correctly identified the intentional `docs/MANIFEST.yaml` mirror change. Both manifest copies now carry exactly the three changed source-file hashes. Full validation log: `/private/tmp/publedge-candidate-verify-ci-2026-09-08.log` (temporary local evidence, not a public artifact).

## Remaining boundaries
This change does not renew source verification dates, decide the overdue review queue, change native payloads or mappings, add a schema or tool, or change licensing. The package version remains 0.2.2; this local candidate is not evidence of npm, registry or hosted delivery. Existing source-review and P2 queues remain pending. Future distribution must identify and validate the eventual released artifact separately.
