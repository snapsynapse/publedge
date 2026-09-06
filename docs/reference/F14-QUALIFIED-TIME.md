# F14 qualified-time acceptance

Scope: publedge-owned offline acceptance fixtures. Implemented locally on 2026-09-05 America/Denver; not committed, published, or deployed.

The shared contract is [OF qualified-time fixture v1](https://github.com/snapsynapse/obligation-first/blob/main/reference/contracts/qualified-time-fixture-v1.md). Until delivery, its source is the sibling checkout at `../obligation-first/reference/contracts/qualified-time-fixture-v1.md`; the main-branch URL is a planned delivery location, not proof that this local work is published.

`tests/fixtures/of-qualified-time.json` binds the actual Colorado successor OF export to separate section 5(1), 5(2), and 5(3) date comparisons. The section 5(2) exception includes the enumerated title 10 provision and act sections as well as the three title 6 subsections. The scalar `effective` value is not applied to every subsection. The predecessor-operative-history case remains unknown.

The official [signed act](https://leg.colorado.gov/bill_files/116489/download), pages 23-24, and [bill history](https://leg.colorado.gov/bills/sb26-189) were rechecked. The downloaded PDF matches EveryAILaw's stored raw PDF: SHA-256 `87a8824f9071c63d2d47b736e414d28e216f5387ef5602484e53127bc94b283e`. Section 1 supplies the replacement relation; section 5 qualifies timing. These sources do not by themselves settle the predecessor's complete operative/enforcement history.

## Acceptance and boundaries

- OF `npm run verify:federation` runs the owner fixture checker against the actual export, alongside existing source-rebuild, exact-edge, correspondence, and scope gates.
- Synthetic mutations run in OF `npm run test:hardening`; the owner fixture contains assertions, exact record expectations, and date bindings to detect scalar-date drift.
- No source record, historical date, identifier, package version, or published graph shape changes in this tranche. The fixture is an acceptance sidecar, not a production serializer.
- Production qualified-time representation remains pending a demonstrated second adopter need and a reviewed contract proposal.

## Remaining source-review work

The predecessor instrument's existing prose contains unqualified statements that its duties never took effect. The exporter notes already flag the historical limitation. Reconcile those statements using official commencement, subsequent legislation, and relevant judicial-order evidence before changing native historical status. The current fixture intentionally establishes neither that the predecessor operated nor that it never operated. Preserve the separate HB 26-1263 interaction question.

## Source reconciliation follow-up (2026-09-05)

The signed SB25B-004 and official enacted summary distinguish signature (2025-08-28), act commencement (2025-11-25), and amended requirement dates (2026-06-30). Corrected the native act effective date and current predecessor prose. The three predecessor obligations use the existing `superseded` lifecycle; their legacy identifiers remain stable. Exact-identity evals replace earlier count assertions that incorrectly required three `never-operative` records. The shared predecessor-history fixture remains unknown.

Sources: https://leg.colorado.gov/bills/sb25b-004 and https://leg.colorado.gov/bill_files/90530/download; SB26-189 section 5 at https://leg.colorado.gov/bill_files/116489/download. The EveryAILaw-owned source-review checkpoint records the unresolved original court-order/current-docket and codification checks. These corrections withdraw unsupported certainty without asserting the opposite history.

A local optional `enforcement_status` source field and exporter override preserve explicit unknown for these three obligations. The schema validates the existing OF enforcement-state vocabulary; this is not a shared OF schema change. The reviewed fingerprint delta is only the two SB25B-004 provenance verification dates.
