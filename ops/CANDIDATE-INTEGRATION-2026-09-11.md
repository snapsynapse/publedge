# Candidate integration preparation, 2026-09-11

Session 1 retains the source/admission corrections through pushed commit 397f5d29 and pins OF checker 2a86d0fc723ea741de2ad0163aff092ddb7db7c0. The earlier handoff's claim that those commits were unpushed was stale. The comparison base for this correction candidate is main 3a07bba0b9f2b51c298a84fc50a42b66b341ad43.

PR and push validation use their explicit event bases. Manual validation requires comparison_base; the shared resolver validates full owner SHA, ancestry and inequality to HEAD before canonical CI. This avoids passing the current commit as its own migration baseline. The separate accessibility build does not claim migration acceptance.

Copied negative-test fixtures and installed package smoke tests do not inherit the production repository's comparison SHA: those artifacts have no owner Git history and retain their snapshot-admission checks. Owner checkout validation continues using the explicit base. Existing negative cases still reject unreviewed mutations before output.

The draft PR retains the pending Utah statute editorial decisions, agreement observations, Colorado later-event evidence and Term-to-Term checks in ROADMAP.md and the source-review receipts. The additive aggregate source and editorial_status fields remain explicitly subject to human API-shape review. Source-admission controls do not renew historical last_verified dates.

Source candidate 0.2.3 remains unpublished; 0.2.2 remains the recorded published MCP identity. Main merge automatically updates the Pages source and therefore remains held with packaging/deployment. The dirty linked worktree and its untracked docs/index.xml are preserved. Final private cross-owner tuple and candidate CI evidence belong to EveryAILaw; production federation still depends on coordinated main delivery.
