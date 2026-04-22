---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Determination"
id: us-cftc-dsio-il-2017-001
instance: 2017-001
official_ref: "CFTC Letter 17-65"
slug: cftc-fia-cta-registration-2017
title: "CFTC Letter 17-65 — CTA Registration Exemption Survives MiFID II Fee Unbundling"
type: interpretive-letter
source: demonstration-remap
jurisdiction: us
authority: cftc-dsio
issued_by:
  "@type": "https://w3id.org/semanticarts/ns/ontology/gist/GovernmentOrganization"
  name: "U.S. Commodity Futures Trading Commission, Division of Swap Dealer and Intermediary Oversight"
  ref: "https://cftc.gov/LawRegulation/CFTCStaffLetters/index.htm"
issuance_event: gist:Determination
enacted: 2017-12-11
effective: 2017-12-11
official_url: https://cftc.gov/csl/17-65/download
obligation_kind: [permission]
reliance_scope: similarly-situated-third-parties
requesting_party: "Futures Industry Association (Allison Lurton, on behalf of member FCMs, swap dealers, and introducing brokers)"
interpreting_authority: "CFTC Division of Swap Dealer and Intermediary Oversight"
parties: []
statute_anchors:
  - cite: "7 U.S.C. §1a(12) (Commodity Exchange Act definition of commodity trading advisor)"
    url: "https://www.law.cornell.edu/uscode/text/7/1a"
  - cite: "17 C.F.R. §4.6(a)(3) (swap dealer exclusion from CTA definition)"
    url: "https://www.ecfr.gov/current/title-17/chapter-I/part-4/section-4.6"
  - cite: "17 C.F.R. §4.14(a)(6) (introducing broker exemption from CTA registration)"
    url: "https://www.ecfr.gov/current/title-17/chapter-I/part-4/section-4.14"
publication_citations:
  - cite: "CFTC Letter No. 17-65, Interpretation (Dec. 11, 2017)"
    url: "https://cftc.gov/csl/17-65/download"
status: enforcing
supersedes: null
superseded_by: null
withdrawn_date: null
withdrawal_reason: null
withdrawn_by_instrument: null
hash_chain_prev: null
disclaimer: ""
last_verified: 2026-04-19
schema: "https://publedge.org/schema/instrument.schema.json"
created: 2026-04-19
modified: 2026-04-19
---

## Summary

The CFTC Division of Swap Dealer and Intermediary Oversight issued a staff interpretation confirming that a registered futures commission merchant (FCM), swap dealer (SD), or introducing broker (IB) does not lose its statutory exclusion or exemption from commodity trading advisor (CTA) registration solely because it receives a separate, unbundled fee for commodity trading advice — provided the advice remains "solely incidental" to the FCM's or SD's business or "solely in connection with" the IB's business. The interpretation was prompted by the imminent MiFID II requirement that EU investment managers unbundle research payments from execution fees, creating concern that the unbundled payment structure would trigger CTA registration obligations for CFTC-registered intermediaries.

## Background

The Futures Industry Association (FIA), through General Counsel Allison Lurton, submitted a request on behalf of member FCMs, swap dealers, and introducing brokers that regularly provide commodity trading advice to EU-based investment managers. Under the pre-MiFID II market structure, those investment managers paid for research (including commodity trading advice) and execution services through a single bundled commission fee. That structure allowed the FIA members to provide advice without CTA registration because the advice was "solely incidental" or "solely in connection with" their primary registered businesses.

The EU's Markets in Financial Instruments Directive II (MiFID II), effective January 3, 2018, required EU investment managers to separate research payments from execution payments. Research fees would be paid either from the managers' own funds or through dedicated Research Payment Accounts (RPAs). The FIA members were concerned that receiving a distinct, separately invoiced fee for commodity trading advice — even where the advice itself remained incidental to their core business — would cause CFTC staff to treat the arrangement as a standalone CTA business, triggering mandatory CTA registration under CEA §4m(1).

The FIA explicitly noted that the interpretation, if granted, should not be limited to MiFID II-bound entities: investment managers operating globally might implement uniform unbundled payment protocols across all jurisdictions to avoid managing conflicting payment systems.

## Question presented

Whether an FCM, SD, or IB that qualifies for the CTA exclusion or exemption (because its commodity trading advice is "solely incidental" to its FCM/SD business, or "solely in connection with" its IB business) loses that exclusion or exemption solely because it begins receiving a separate, unbundled payment for that advice — as required by MiFID II for EU investment manager clients.

## Interpretive position

The Division interpreted that **receipt of separate compensation is not dispositive** on its own and does not strip an FCM, SD, or IB of its CTA exclusion or exemption. The analysis requires examining all facts and circumstances of the advisory relationship; an unbundled payment is merely one factor in that analysis.

| Element | Division's position |
|---|---|
| Separate fee alone | Not sufficient to require CTA registration |
| "Solely incidental" / "solely in connection with" test | Continues to govern; facts-and-circumstances standard |
| General discretion to trade client accounts | Would remain outside the exclusion regardless of fee structure |
| Advisory services as a standalone business line | Would still require CTA registration regardless of how fees are labeled |
| Applicability | Not limited to MiFID II-bound entities; any similarly-situated FCM, SD, or IB may rely |

The Commission had previously stated (in the 2012 SD external business conduct standards rulemaking) that an SD "would not apply if a swap dealer received separate compensation for, or otherwise profited primarily from, advice provided to a counterparty." The Division clarified that this language was not intended to make separate compensation alone dispositive — it was one factor among many, and the phrase "otherwise profited primarily from" was doing meaningful work in the original statement.

## Reliance scope

The letter explicitly extends the interpretation beyond MiFID II-bound entities to any FCM, SD, or IB that finds itself in an equivalent payment structure. This is the standard CFTC interpretive-letter posture: `reliance_scope: similarly-situated-third-parties`. The Division noted, however, that reliance is conditioned on the specific facts remaining as represented; "different, changed or omitted material facts or circumstances might render this letter void."

## PubLedge schema mapping

| Source-letter element | PubLedge field |
|-----------------------|----------------|
| CFTC Letter No. 17-65 | `id: us-cftc-il-17-65` + `publication_citations[0]` |
| December 11, 2017 | `enacted: 2017-12-11`, `effective: 2017-12-11` |
| Division of Swap Dealer and Intermediary Oversight | `issued_by`, `authority: cftc-dsio` |
| Matthew B. Kulkin, Director | `interpreting_authority` |
| Futures Industry Association (Allison Lurton) on behalf of member FCMs/SDs/IBs | `requesting_party` |
| CEA §1a(12), CFTC Regs 4.6(a)(3), 4.14(a)(6) | `statute_anchors[0]–[2]` |
| "Solely incidental" / "solely in connection with" test confirmed | `obligation_kind: [permission]` |
| Not limited to MiFID II entities | `reliance_scope: similarly-situated-third-parties` |
| Type: Interpretation (letter header) | `type: interpretive-letter` |

## Limitations

- The interpretation covers the threshold question of CTA registration only. It does not address whether the FCM, SD, or IB must comply with other CTA-related provisions once registered in its primary capacity.
- The "solely incidental" / "solely in connection with" analysis remains fact-specific. An FCM that begins marketing commodity trading advice as an independent service line, or that receives primarily advisory-derived revenue, would not qualify.
- The Division retains authority to modify, suspend, or terminate the interpretation at its discretion.
- This is Division staff position only; it does not bind the Commission or other CFTC divisions.
- Does not address state-level advisor registration requirements.
- MiFID II has since been updated; factual scenarios involving current EU regulatory requirements should be evaluated against the current directive, not the 2017 version described here.

## Sources

- [CFTC Letter No. 17-65 (PDF)](https://cftc.gov/csl/17-65/download)
- [7 U.S.C. §1a — Commodity Exchange Act definitions (Cornell LII)](https://www.law.cornell.edu/uscode/text/7/1a)
- [17 C.F.R. §4.6 — Registration exemptions for swap dealers (eCFR)](https://www.ecfr.gov/current/title-17/chapter-I/part-4/section-4.6)
- [17 C.F.R. §4.14 — Exemptions from CTA registration (eCFR)](https://www.ecfr.gov/current/title-17/chapter-I/part-4/section-4.14)
- [CFTC Staff Letters index](https://cftc.gov/LawRegulation/CFTCStaffLetters/index.htm)

## Notes on this demonstration remap

This letter exercises three features not demonstrated by the four existing reference remaps:

1. **`type: interpretive-letter`** — the first interpretive letter in the registry. The prior CFTC-eligible artifact class (no-action letter) appeared in the SEC remap; CFTC interpretive letters are a distinct instrument type under CFTC Reg. 140.99, representing staff's reading of how a statute or rule applies to a described set of facts — not a commitment to forbear enforcement (which is what a no-action letter does). The interpretive letter's `obligation_kind: [permission]` here means the interpretation confirms that a permitted activity (relying on the exemption) survives a structural change in how compensation is received.

2. **Trade-association requester** — prior remaps featured either a named law firm (SEC: Latham & Watkins), a bureau-initiated opinion (CFPB: no named requester), or a fully redacted applicant (IRS PLRs). Here the requester is a trade association (FIA) acting explicitly on behalf of an industry class. The `requesting_party` field captures the named association; the "on behalf of member FCMs, SDs, and IBs" language explains why `reliance_scope: similarly-situated-third-parties` rather than `requesting-party-only` is the correct value — the FIA's members are the effective beneficiaries, not the FIA itself.

3. **Cross-jurisdictional trigger** — the interpretation was prompted by a foreign regulatory requirement (EU MiFID II) creating a domestic US compliance question. No prior remap involved a foreign-law driver. The Division's explicit statement that the interpretation is "not limited to entities bound by MiFID II" directly maps to `reliance_scope: similarly-situated-third-parties` and anchors the choice in the letter's own text.

Fields that a future authority-issued version would populate: `hash_chain_prev` (once skill-provenance runs), and potentially `superseded_by` if CFTC staff later readdresses the "solely incidental" standard in a revised interpretive letter or rulemaking.
