---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Determination"
id: us-cfpb-ao-2022-001
instance: 2022-001
slug: cfpb-pay-to-pay-fees-2022
title: "CFPB Advisory Opinion — Pay-to-Pay Fees (Regulation F)"
type: advisory-opinion
source: demonstration-remap
jurisdiction: us
authority: cfpb
issued_by:
  "@type": "https://w3id.org/semanticarts/ns/ontology/gist/GovernmentOrganization"
  name: "Consumer Financial Protection Bureau"
  ref: "https://www.consumerfinance.gov/"
issuance_event: gist:Determination
enacted: 2022-06-29
effective: 2022-07-05
official_url: https://www.consumerfinance.gov/rules-policy/final-rules/advisory-opinion-on-debt-collectors-collection-of-pay-to-pay-fees/
obligation_kind: [restriction]
reliance_scope: public
requesting_party: null
interpreting_authority: "Consumer Financial Protection Bureau"
parties: []
statute_anchors:
  - cite: "15 U.S.C. §1692f (FDCPA §808)"
    url: "https://www.law.cornell.edu/uscode/text/15/1692f"
  - cite: "12 CFR §1006.22(b) (Regulation F)"
    url: "https://www.ecfr.gov/current/title-12/chapter-X/part-1006/subpart-B/section-1006.22"
publication_citations:
  - cite: "CFPB Advisory Opinion Program, Pay-to-Pay Fees (June 29, 2022)"
    url: "https://www.consumerfinance.gov/rules-policy/final-rules/advisory-opinion-on-debt-collectors-collection-of-pay-to-pay-fees/"
  - cite: "87 FR 39733 (July 5, 2022), original advisory opinion"
    url: "https://govinfo.gov/content/pkg/FR-2022-07-05/html/2022-14230.htm"
  - cite: "90 FR 20084 (May 12, 2025), withdrawal notice"
    url: "https://govinfo.gov/content/pkg/FR-2025-05-12/html/2025-08286.htm"
status: withdrawn
editorial_status: published
supersedes: null
superseded_by: null
withdrawn_date: 2025-05-12
withdrawal_reason: "The CFPB withdrew this advisory opinion in its May 12, 2025 notice, 90 FR 20084, section III, Advisory Opinions, item 9."
withdrawn_by_instrument: "90 FR 20084 (FR Doc. 2025-08286)"
hash_chain_prev: null
disclaimer: ""
last_verified: 2026-04-19
schema: https://publedge.org/schema/instrument.schema.json
created: 2026-04-19
modified: 2026-11-21
---

## Summary

The CFPB issued this interpretation of FDCPA section 808(1) and Regulation F in June 2022. The opinion took effect July 5, 2022. The Bureau withdrew it on May 12, 2025. The withdrawal notice addressed guidance documents. It did not amend the FDCPA or Regulation F.

## Background

The opinion addressed convenience fees for paying a debt online or by telephone. The CFPB discussed collection by debt collectors and by third-party processors that remit amounts to collectors.

## Question presented

When did the Bureau consider a debt collector entitled to collect a pay-to-pay fee under FDCPA section 808(1) and 12 CFR 1006.22(b)?

## Interpretive position

The Bureau interpreted section 808(1) to permit a collector to charge a fee if the agreement creating the debt expressly permitted the charge and law did not prohibit it, or if law expressly permitted the charge. The opinion rejected silence in the law and a separate payment agreement as sufficient authorization. It treated a collector as collecting a fee when a processor charged the consumer and remitted an amount to the collector in connection with the fee.

## Reliance scope

The opinion addressed debt collectors generally. The public reliance classification records that historical audience. The Bureau's May 2025 withdrawal ended this opinion as Bureau guidance.

## PubLedge schema mapping

| Source-opinion element | PubLedge field |
|------------------------|----------------|
| FDCPA §808(1) (15 U.S.C. §1692f) | `statute_anchors[0]` |
| Regulation F, 12 CFR §1006.22(b) | `statute_anchors[1]` |
| CFPB as issuing bureau | `interpreting_authority` |
| No named submitter | `requesting_party: null` |
| "A debt collector may not …" | `obligation_kind: [restriction]` |
| General regulated-entity reach | `reliance_scope: public` |
| June 29, 2022 announcement | `enacted` |
| July 5, 2022 effective date | `effective` |
| May 12, 2025 withdrawal | `withdrawn_date` |

## Limitations

This historical remap describes the Bureau’s advisory opinion. It does not determine present rights under the statute, the regulation, state law, or judicial decisions.

## Sources

- [Original advisory opinion, 87 FR 39733, July 5, 2022](https://govinfo.gov/content/pkg/FR-2022-07-05/html/2022-14230.htm)
- [Withdrawal notice, 90 FR 20084, section III, Advisory Opinions, item 9](https://govinfo.gov/content/pkg/FR-2025-05-12/html/2025-08286.htm)

## Notes on this demonstration remap

The record illustrates a restriction, a public audience, and an opinion issued without a named requesting party. The withdrawal date and reason identify the later Bureau notice.
