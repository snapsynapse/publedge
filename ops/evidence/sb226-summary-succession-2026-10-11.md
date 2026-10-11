# SB226 instrument Summary under receipt succession (2026-10-11)

Scope: the `section:Summary/text` unit of `data/examples/instruments/us-ut-legislature-statute-2025-sb226.md`, and the admission contract change that lets an agent correct it without rewriting or borrowing the 2026-09-24 human review. Stacked on the SB226 R1 definition candidate (PR #21, `f1f5eab2`).

## Authority

Sam Rogers chose receipt succession on 2026-10-11 over a fresh human review or leaving the Summary unchanged. This note records an agent self-review against retained evidence, not human acceptance, current-law certification, or a renewed verification date.

## Contract change

- `scripts/lib/source-admission.js`: a receipt may carry `supersedes: { packet_sha256, reason, receipt }`. The embedded receipt is validated recursively against the legacy baseline, must reproduce its own admitted record hash from its unit hashes, and must match the pinned packet digest. The successor binds to that admitted state, reviews only units changed since, and must carry forward every earlier unresolved item. The Verified rule is unchanged: an agent successor cannot renew `last_verified` or Verified rows.
- `scripts/check-source-admission.js`: against a base commit, an accepted receipt must remain byte-for-byte present, either unchanged or embedded in the current receipt's lineage. A rewritten receipt fails.
- `scripts/prepare-source-admission.js --supersede` prepares a successor packet; preparing a plain packet for a record that already has a receipt is refused.
- `scripts/build.js`: Obligation-First evidence inputs read unit reviews through the lineage, so unchanged units keep their earlier review and evidence.
- Admission accounting counts every unit review in a lineage: 62 records, 42 legacy-unreviewed, 20 with reviewed changes, 124 unit reviews (123 before, plus this one).

## Native delta

One unit changed. Every other unit, including `last_verified: 2026-09-23`, Sponsors, Timeline, Talking Point, and Sources, is identical to the state the human receipt admitted. The Summary now carries, from retained 2025 enrolled SB 226 (PDF SHA-256 `279184eb...07c60e8`, text `088cb731...7d08d7`):

- §13-75-103(1), printed lines 98-105: supplier, consumer transaction, asks or otherwise prompts, clear and unambiguous request, and the conjunctive GenAI-and-not-human content.
- §13-75-104(1), lines 118-126: section 103-only relief, consumer transaction or regulated services, outset and throughout, and the three alternative forms; §13-75-106, lines 164-168: other remedies preserved.
- §13-75-103(2)-(3), lines 106-115, with §13-75-101(8), lines 75-78: the individual regulated-occupation actor without a supplier condition, prominence, occupational compliance, and channel-specific timing.
- §13-75-101(5), lines 54-67: the complete high-risk definition, including the significance criterion and the division-rule branch.
- §13-75-102, lines 90-95: the underlying-violation boundary.

These correspond to Foundation SB226 comparison rows U02, U03.a2, U03.b, and U04.a-d.

## Successor receipt

- Packet SHA-256 `f57211556ad903c24f2b1860a03218bbbb66c58cef9fd29652819c29fde47c9c`, actor type `agent`, no `human_approved`.
- Embedded human receipt digest `477433cdc9aa83a53073e06246dc52f2914874b80d326b8001ddeb27fa3ccd6b` (packet `4ac77cfc...1733`), unchanged.
- Unresolved: the five earlier items plus two new ones (2025 enrolled locators only, with the 2026-10-02 Chapter 75 locator mismatch; division rules and incorporated §§13-11-3 and 13-2-1 not retained).

## Obligation-First fingerprint

The guarded owner writer was run after inspection. Only `provenance_claims` changed, for six SB226 records: the instrument, its issuance determination, its term, and its three obligations. Changed fields: instrument evidence-input `native_file_sha256`, `canonical_sha256`, `review_packet_sha256`, and unresolved counts (+2). Retained primary hashes, identity, scope, relationships, dates, and every other record are unchanged.

## Not done

No `last_verified`, Verified, effective-date, or legal-status renewal. No current-codification bridge, new source acquisition, mapping promotion, R3 civil/criminal change, or HB 452 work. The paired review with EveryAILaw draft PR 534 and the Obligation First consumer-answer contract remains open.
