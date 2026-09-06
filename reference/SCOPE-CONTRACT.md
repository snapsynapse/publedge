# Scope inventory and continuity

Scope: publedge adopter-owned recognition and coverage declarations. F11 scope evaluator integration, 2026-09-05. Shared evaluator: [Obligation-First scope contract v1](https://github.com/snapsynapse/obligation-first/blob/main/reference/contracts/scope-contract-v1.md).

## Owning evidence

`tests/fixtures/of-scope-inventory.json` declares inventory version 1.0.0 and this adopter's owner, exact territorial/institutional identities, source pointers, extensions and any coverage statements. `tests/fixtures/of-scope-baseline.json` preserves exact projected record/path/value tuples and pins the inventory digest. This initial inventory is reviewed against the accepted P1 source projection, not newly certified legal geography or a fresh audit of each source record.

The initial inventory retains the existing US, Colorado and Utah source scopes. Coverage remains unspecified, therefore unknown. The existing illustrative records and their licensing boundaries are unchanged.

## Checks and maintenance

The existing `check:of-fingerprint` wrapper runs the scope companion before checking or rewriting fingerprint v2. Existing fingerprint baselines and generated exports remain unchanged. Federation also requires all three inventories and baselines, compares known kind/parent declarations, and retains the existing source-rebuild, graph, JSON-LD, correspondence and edge/provenance gates.

New source vocabulary needs a reviewed entry with evidence. Changes to existing inventory semantics require an inventory-version change and review of the baseline diff. The initial-capture writer refuses to overwrite an existing baseline. A normal build or checker must never regenerate expected values to accept itself. Source spelling and scope specificity are preserved exactly; unknown evidence is not agreement, zero or legal inapplicability.

## Delivery and remaining work

This integration pins the OF v0.6.4 checker at `74a1a4b35c0cd2bd0af0bc6bbedf8ef1ca3c8b94` in canonical CI. The repository checks do not change the published MCP runtime or package version. Missing OF follows the existing optional local-check policy; canonical CI requires `CHECK_OF_REQUIRED=1`.

The coordinated release state is recorded in [Obligation-First's delivery evidence](https://github.com/snapsynapse/obligation-first/blob/main/reference/release-preparation-v0.6.4.json). A compatible pin is static wiring evidence; hosted acceptance additionally requires the actual workflow and deployment results for the accepted repository revisions.

Qualified temporal meaning, broader evidence policy, nested provenance, traversal enrichment and unrelated publication work remain queued separately.
