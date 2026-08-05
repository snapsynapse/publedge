# PubLedge v0.2.0

Release date: 2026-08-04

PubLedge v0.2.0 migrates the verifiable-records layer of the PAICE legal graph to Obligation-First v0.6.0 and adds deterministic controls that make schema, lifecycle, manifest, workflow, and generated-output drift fail before publication.

## Highlights

- Publishes 130 Obligation-First v0.6 records with explicit authority roles, lifecycle and enforcement posture, provenance, jurisdiction shapes, and stable native identifiers.
- Adds `of:Party` records for agreement participants while preserving the semantic boundary between parties and government Authorities.
- Corrects superseded, sunset, proposed, prospective, and expired records so legal status, editorial status, and routine enforcement claims remain independent.
- Clarifies that PubLedge Determinations model evidenced administrative issuance, not adjudication, and omits issuance records for proposed or draft instruments.
- Adds one canonical fail-closed CI entrypoint, a reviewed structural fingerprint, scheduled-verification and workflow-invariant evals, and complete manifest-scope checks.
- Verifies raw byte-determinism and generated-tree parity across UTC and America/Denver.

## Verification

- All canonical manifest hashes verified.
- 18 instruments, 35 obligations, 8 authorities, and 16 mappings passed cross-reference validation.
- The complete eval suite passed, including deterministic builds, clean-tree parity, workflow invariants, installed-package behavior, temporal status, and MCP initialization.
- 130 Obligation-First records passed v0.6.0 validation and the reviewed structural fingerprint matched.
- The cross-repository federation resolved every PubLedge anchor after all adopters migrated.

## Residuals

- `MANIFEST.yaml` proves source-to-current-manifest consistency; it is not an independent timestamp or immutable publication proof.
- `us-ut-oaip-rma-2026-001` intentionally has no effective date yet and may continue to produce a non-blocking schema recommendation.
- The protocol remains pre-1.0. Consumers should pin compatible minor versions.

See [CHANGELOG.md](CHANGELOG.md) for the complete change inventory.
