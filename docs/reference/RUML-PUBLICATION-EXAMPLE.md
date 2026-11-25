# RUML rulemap publication example
Status: synthetic documentation example, 2026-11-24. It records the publication of one fictional RUML rulemap and its supporting interpretation, and shows where PubLedge recordkeeping stops. It is not a registry instrument, a source admission, an Obligation-First (OF) record, a new PubLedge field or an external adopter demand signal under [INTENT.md](../INTENT.md). No new signer, timestamp service, registry or RUML tooling is introduced.
The example builds on the reviewed OF [RUML quickstart](https://github.com/snapsynapse/obligation-first/blob/302700cca23cc2f52eea1b63808dc740a72f54b2/reference/ruml-quickstart.md) and its [synthetic fixture](https://github.com/snapsynapse/obligation-first/tree/302700cca23cc2f52eea1b63808dc740a72f54b2/reference/fixtures/ruml-v1), pinned at OF commit `302700cca23cc2f52eea1b63808dc740a72f54b2`. That fixture targets RUML specification 1.0.0 at upstream commit `d2ac818f6ed87c2bcf5b69430adf2efa8ba3c6a4`. All legal records in it are a fictional draft, operative status inactive and enforcement unknown.
## Three separate events
Publishing a model, approving a model and issuing law are different acts by potentially different actors. None of them implies another.
| Event | Actor | What a record of it can establish | What it does not establish | PubLedge representation |
|---|---|---|---|---|
| Model publication | The rulemap publisher | These exact bytes were released under this identity and content version, by this publisher | That the model was reviewed, that it encodes the source correctly, that the source is law, or when the bytes first existed | Application-owned publication record (below); retained bytes pinned by SHA-256 |
| Model approval | A named reviewer under a stated review process | The named reviewer accepted these exact bytes as an encoding of a stated bounded question | Legal correctness, applicability, or legal force of the source | Separate dated review event naming the approved bytes; absent in this example |
| Authoritative legal issuance | The legal authority | The authority performed the act that issued the instrument, on an evidenced date | Anything about any model that encodes the instrument | Instrument `issuance_event` and `enacted` with official source evidence, per [PROTOCOL.md](../PROTOCOL.md); absent in this example |
The RUML document status and the source legal status are independent. A draft model may encode an in-force law, and an approved model may encode a proposed law. In this example both are drafts, and no approval or issuance has occurred.
## Synthetic publication record
This record is illustrative YAML, not a schema. The publisher is fictional. Every identifier, hash and path is taken from the pinned OF fixture.
```yaml
example: synthetic-ruml-publication-v1
record_kind: model-publication   # not a PubLedge instrument, not an OF Determination
artifact:
  uri: https://example.org/ruml-demo/rules/acknowledgement-1.0.0.ruml   # synthetic identifier, not hosted
  ruml_metadata_id: 67f684cd-73b1-4d2f-9a0b-b6debc67a444
  content_version: "1.0.0"          # RUML metadata.version
  ruml_specification: "1.0.0"
  ruml_format_version: "1.0"        # RUML $specVersion
  root_node_id: 9fcff900-2e5f-4b16-98af-96349fb04111
  encodes: trigger-conditions-only  # not performance of the duty
  retained_bytes:
    repository: https://github.com/snapsynapse/obligation-first
    commit: 302700cca23cc2f52eea1b63808dc740a72f54b2
    path: reference/fixtures/ruml-v1/acknowledgement.ruml
    sha256_file_bytes: ae4155f116abb1014b84a21bf9cd04cbcfda78adeb7c72cfeed7cfd0346dedec
supporting_interpretation:
  description: The OF Requirement and its executableEncoding note stating that the rulemap evaluates trigger conditions only
  author: Example Rules Collective (fictional)
  authority_issued: false
  retained_bytes:
    repository: https://github.com/snapsynapse/obligation-first
    commit: 302700cca23cc2f52eea1b63808dc740a72f54b2
    path: reference/fixtures/ruml-v1/records/obligation.json
    sha256_file_bytes: 5bf5c319de178cce97961d9fbe9c6cb2ddb3496174ef980aa905ec18437530c0
publisher:
  name: Example Rules Collective (fictional)
  responsibility: model publication only
  is_legal_issuer: false
  is_reviewer: false
source_reference:
  instrument: https://example.org/ruml-demo/instrument/policy
  term: https://example.org/ruml-demo/term/section-1
  obligation: https://example.org/ruml-demo/obligation/acknowledge
  source: https://example.org/ruml-demo/source#section-1
  source_version: synthetic-1.0.0
  source_legal_state: {lifecycle: draft, operative: inactive, enforcement: unknown}
events:
  model_publication:
    state: published
    model_review_state: draft       # RUML metadata.status in the retained bytes
    retention_evidence: OF commit 302700cca23cc2f52eea1b63808dc740a72f54b2, committed 2026-11-22T21:19:22-07:00
  model_approval: null              # no reviewer, no review event
  legal_issuance: null              # no authority act; no issuance_event and no Determination
```
The publication is fictional, so the record states no publication date. The commit timestamp is retention evidence for the repository copy. It is not independent evidence of when the bytes were first published.
## Rules this example demonstrates
1. Name the exact bytes. Publication, approval and runtime evidence each identify the artifact by content version and file-byte hash. If an approval is recorded by editing RUML `metadata.status`, the file bytes change, so the approved artifact has a different hash from the published draft. The approval record must name the bytes it approved.
2. Keep publisher responsibility separate. A RUML publisher organization is responsible for model publication. It is not, by that role, the legal issuer, administrator, enforcer, adjudicator or reviewer.
3. Never treat a software release as promulgation. A rulemap release does not satisfy `enacted`, `issuance_event`, `official_url`, `publication_citations` or `source_documents` on any instrument. An authority-issued instrument requires official source evidence of its own issuance, as stated in [PROTOCOL.md](../PROTOCOL.md).
4. Do not create a Determination for a model event. PubLedge represents evidenced issuance as an administrative `of:Determination` that targets an instrument. A fictional or software publication receives none, and a computed RUML result does not become one.
5. Read the hash narrowly. SHA-256 over stored bytes shows that a copy matches the recorded hash. It does not show legal correctness, review, publication time or authorship, and it is not a RUML canonical hash or a signature. Independent publication-time evidence, when required, belongs to established mechanisms such as RFC 3161 or OpenTimestamps, represented as pluggable evidence.
6. Link, do not equate. The OF Requirement points to the rulemap through `executableEncoding` with `kind: other`, a URI and a version. The duty, the provision and the executable node remain different objects with different identifiers.
## Check the retained bytes
With `snapsynapse/obligation-first` checked out beside this repository, this prints the rulemap hash recorded above.
Literal
```bash
git -C ../obligation-first show 302700cca23cc2f52eea1b63808dc740a72f54b2:reference/fixtures/ruml-v1/acknowledgement.ruml | shasum -a 256
```
The expected output begins with `ae4155f116abb1014b84a21bf9cd04cbcfda78adeb7c72cfeed7cfd0346dedec`. The OF repository owns the fixture checks; see its quickstart for `node scripts/check-ruml-example.mjs` and the negative controls. A matching hash confirms retention only. Evaluator compatibility with RUML remains unclaimed.
## If a real case arrives
A real rulemap publication tied to a real instrument would keep the same three-event split. The instrument enters PubLedge only through source admission with retained official evidence, the rulemap stays an external artifact linked through OF `executableEncoding`, and any model approval stays the reviewer's record. A demonstrated adopter need, not this example, would be required before PubLedge adds fields or tooling for model publication records.
