---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Determination"
id: PL-AO-CFPB-0001
slug: cfpb-pay-to-pay-fees-2022
title: "CFPB Advisory Opinion — Pay-to-Pay Fees (Regulation F)"
type: advisory-opinion
source: demonstration-remap
jurisdiction: us-federal
authority: cfpb
issued_by:
  "@type": "https://w3id.org/semanticarts/ns/ontology/gist/GovernmentOrganization"
  name: "Consumer Financial Protection Bureau"
  ref: "https://www.consumerfinance.gov/"
issuance_event: gist:Determination
enacted: 2022-06-29
effective: 2022-06-29
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
status: draft
supersedes: null
superseded_by: null
withdrawn_date: null
withdrawal_reason: null
withdrawn_by_instrument: null
hash_chain_prev: null
disclaimer: ""
last_verified: 2026-04-19
schema: https://publedge.org/schema/instrument.schema.json
created: 2026-04-19
modified: 2026-04-19
---

## Summary

The CFPB interprets §808(1) of the Fair Debt Collection Practices Act and 12 CFR §1006.22(b) to prohibit a debt collector from collecting any "pay-to-pay" fee — a convenience fee charged for processing a payment online or by phone — unless the fee is either expressly authorized by the agreement creating the debt or expressly authorized by a specific law. Silence is not authorization. Third-party payment processors cannot be used to route such fees around the prohibition.

## Background

Debt collectors routinely charge convenience fees when consumers pay online or by phone, often through third-party payment processors. Industry practice had treated such fees as permissible unless the underlying contract specifically forbade them. The Bureau issued this advisory opinion to resolve what it viewed as a misreading of FDCPA §808(1), which prohibits collection of any amount "unless such amount is expressly authorized by the agreement creating the debt or permitted by law."

## Question presented

Whether FDCPA §808(1) and 12 CFR §1006.22(b) permit a debt collector to charge a pay-to-pay convenience fee in the absence of (a) express authorization in the agreement creating the debt or (b) affirmative legal permission.

## Interpretive position

The Bureau's position, in summary:

| Issue | Position |
|-------|----------|
| Default rule | Pay-to-pay fees are prohibited unless expressly authorized. |
| "Expressly authorized by the agreement" | Requires specific contractual language authorizing the particular fee; a general right-to-collect-costs clause is insufficient. |
| "Permitted by law" | Requires affirmative statutory authorization; silence, absence of prohibition, or common-law principles of contract do not suffice. |
| Third-party processors | Using a third-party payment processor that charges a fee and remits a portion to the collector does not cure the violation. |
| Separate agreements | A later-in-time consumer agreement with the collector (e.g., at time of payment) does not constitute authorization under §808(1). |

## Reliance scope

Advisory opinions under the CFPB's Advisory Opinion Program are interpretive rules exempt from APA notice-and-comment, binding on the Bureau's enforcement posture. Any debt collector subject to the FDCPA and Regulation F is within the position's scope; accordingly `reliance_scope: public`. This contrasts with a no-action letter's `similarly-situated-third-parties` and a private letter ruling's `requesting-party-only`.

## PubLedge schema mapping

| Source-opinion element | PubLedge field |
|------------------------|----------------|
| FDCPA §808(1) (15 U.S.C. §1692f) | `statute_anchors[0]` |
| Regulation F, 12 CFR §1006.22(b) | `statute_anchors[1]` |
| CFPB as issuing bureau | `interpreting_authority` |
| No named submitter | `requesting_party: null` |
| "A debt collector may not …" | `obligation_kind: [restriction]` |
| General regulated-entity reach | `reliance_scope: public` |
| June 29, 2022 | `enacted` / `effective` |

## Limitations

- Advisory opinions interpret existing law; they do not create new obligations and are subject to judicial review under Skidmore or Auer deference depending on framing.
- Opinion does not address state-law unfair-practices claims, which may be broader or narrower.
- Opinion does not address first-party creditors, who are outside the FDCPA's scope.

## Sources

- [CFPB — Advisory Opinion on Pay-to-Pay Fees (2022-06-29)](https://www.consumerfinance.gov/rules-policy/final-rules/advisory-opinion-on-debt-collectors-collection-of-pay-to-pay-fees/)
- [15 U.S.C. §1692f — FDCPA Unfair Practices (Cornell LII)](https://www.law.cornell.edu/uscode/text/15/1692f)
- [12 CFR §1006.22 — Regulation F, Unfair or Unconscionable Means (eCFR)](https://www.ecfr.gov/current/title-12/chapter-X/part-1006/subpart-B/section-1006.22)

## Notes on this demonstration remap

This instrument demonstrates three schema behaviors the SEC no-action remap did not exercise:

1. `obligation_kind: [restriction]` — the opinion forbids conduct rather than permitting it, exercising the opposite chip from the SEC example.
2. `reliance_scope: public` — the advisory opinion binds an open class of regulated entities, distinct from the `similarly-situated-third-parties` posture of SEC no-action letters and the `requesting-party-only` posture of IRS PLRs. All three values now have a reference example.
3. `requesting_party: null` — the CFPB issued this opinion on its own initiative; the frontmatter explicitly records the absence of a named submitter rather than omitting the field.

Fields an authority-issued PubLedge version would populate: `hash_chain_prev`, and the v0.2 withdrawal triplet (`withdrawn_date`, `withdrawal_reason`, `withdrawn_by_instrument`) if the opinion is later rescinded without replacement — the exact lifecycle that hit the 2021 FCRA name-only matching opinion in 2025.
