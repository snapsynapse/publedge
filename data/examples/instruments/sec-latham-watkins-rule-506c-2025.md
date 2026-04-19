---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Determination"
id: PL-NAL-SEC-0001
slug: sec-latham-watkins-rule-506c-2025
title: "SEC No-Action Letter — Latham & Watkins (Rule 506(c) Verification)"
type: no-action-letter
source: demonstration-remap
jurisdiction: us-federal
authority: sec-corpfin
issued_by:
  "@type": "https://w3id.org/semanticarts/ns/ontology/gist/GovernmentOrganization"
  name: "U.S. Securities and Exchange Commission, Division of Corporation Finance (Office of Small Business Policy)"
  ref: "https://www.sec.gov/divisions/corpfin"
issuance_event: gist:Determination
enacted: 2025-03-12
effective: 2025-03-12
official_url: https://www.sec.gov/rules-regulations/no-action-interpretive-exemptive-letters/division-corporation-finance-no-action/latham-watkins-503c-031225
obligation_kind: [permission]
reliance_scope: similarly-situated-third-parties
requesting_party: "Latham & Watkins LLP (on behalf of issuers relying on Rule 506(c))"
interpreting_authority: "SEC Division of Corporation Finance (Office of Small Business Policy)"
parties: []
statute_anchors:
  - cite: "17 CFR §230.506(c)"
    url: "https://www.ecfr.gov/current/title-17/chapter-II/part-230/subject-group-ECFRfdd94b1cf5a5091/section-230.506"
  - cite: "17 CFR §230.506 (LII mirror)"
    url: "https://www.law.cornell.edu/cfr/text/17/230.506"
publication_citations:
  - cite: "SEC Division of Corporation Finance No-Action Letter archive (2025)"
    url: "https://www.sec.gov/rules-regulations/no-action-interpretive-exemptive-letters/division-corporation-finance-no-action/latham-watkins-503c-031225"
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

SEC staff in the Division of Corporation Finance concurred that an issuer conducting a Rule 506(c) offering takes "reasonable steps to verify" a purchaser's accredited-investor status when the issuer: (1) requires a high minimum investment amount, (2) obtains written representations from the purchaser as to accredited status and the source of funds, and (3) has no actual knowledge to the contrary. This restates and clarifies the principles-based verification standard without expanding or narrowing it.

## Background

Rule 506(c) of Regulation D permits general solicitation in private offerings provided the issuer takes reasonable steps to verify that all purchasers are accredited investors. The rule is principles-based: the SEC declined in 2013 to prescribe an exclusive list of verification methods. Latham & Watkins sought no-action assurance on behalf of issuers concerned that absent such assurance, market practice had drifted toward costly third-party verification services for what are inherently high-net-worth transactions.

## Question presented

Whether an issuer satisfies the "reasonable steps to verify" requirement of Rule 506(c)(2)(ii) when the offering structurally limits participation to accredited investors through a high minimum investment amount, coupled with written representations and the absence of contradictory knowledge, without additional documentary verification.

## Staff position

The Division stated it would not recommend enforcement action against an issuer relying on Rule 506(c) where the following conditions are met:

| Condition | Requirement |
|-----------|-------------|
| Minimum investment | Offering requires a minimum investment amount high enough that only accredited investors would reasonably be expected to meet it (facts-and-circumstances; illustrated with $200,000 for natural persons and $1,000,000 for entities). |
| Written representation | Purchaser provides a written representation of accredited status and that the investment is not financed by any third party for the specific purpose of making the investment. |
| No contradictory knowledge | Issuer has no actual knowledge of facts indicating the purchaser is not accredited or that the representation is false. |
| Source of funds | Purchaser represents the source of funds is not borrowed or provided by a third party for purposes of the investment. |

## Reliance scope

Issuers similarly situated to those described in the request may rely on the position, consistent with standard SEC no-action letter practice. The position binds only on the facts presented; a material departure voids reliance.

## PubLedge schema mapping

| Source-letter element | PubLedge field |
|-----------------------|----------------|
| Rule 506(c)(2)(ii) | `statute_anchors[]` |
| Division of Corporation Finance | `interpreting_authority` |
| Latham & Watkins (on behalf of issuers) | `requesting_party` |
| "Staff will not recommend enforcement action …" | `obligation_kind: [permission]` |
| Similarly-situated reliance | `reliance_scope: similarly-situated-third-parties` |
| March 12, 2025 | `enacted` / `effective` |
| Facts-and-circumstances conditions | body `Staff position` table |

## Limitations

- Position is staff-level, not a Commission interpretation, and may be withdrawn or modified.
- Binding only on the represented facts; does not address anti-fraud liability under §10(b) / Rule 10b-5.
- Does not address state-law "blue sky" requirements, which may impose independent verification obligations.

## Sources

- [SEC.gov — Latham & Watkins no-action letter (2025-03-12)](https://www.sec.gov/rules-regulations/no-action-interpretive-exemptive-letters/division-corporation-finance-no-action/latham-watkins-503c-031225)
- [17 CFR 230.506 — Rule 506 of Regulation D (eCFR)](https://www.ecfr.gov/current/title-17/chapter-II/part-230/subject-group-ECFRfdd94b1cf5a5091/section-230.506)
- [Cornell LII — 17 CFR 230.506](https://www.law.cornell.edu/cfr/text/17/230.506)

## Notes on this demonstration remap

This instrument shows that the PubLedge v0.2 schema, with no per-type extensions, applies to a federal-agency no-action letter. Posture is captured by `obligation_kind: [permission]` (non-enforcement is a forward-looking permission conditioned on facts) anchored to a restriction in the underlying rule; top-level `@type` is `gist:Determination` because no-action letters are unilateral agency determinations, not bilateral agreements.

Fields an authority-issued PubLedge version would populate: `hash_chain_prev`, and any future `supersedes` / `superseded_by` / `withdrawn_date` lifecycle events.
