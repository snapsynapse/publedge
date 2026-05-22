---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Statute"
id: us-co-legislature-statute-2026-sb26-189
instance: 2026-001
slug: colorado-sb26-189-admt-act
title: "Colorado SB 26-189 (2026) — Automated Decision-Making Technology (ADMT) Act"
type: statute
source: authoritative-reference
jurisdiction: us-co
authority: colorado-legislature
issued_by:
  "@type": "https://w3id.org/semanticarts/ns/ontology/gist/SubCountryGovernment"
  name: "Colorado General Assembly"
  ref: "https://leg.colorado.gov/"
issuance_event: gist:Enactment
enacted: 2026-05-14
effective: 2027-01-01
official_url: https://leg.colorado.gov/bills/sb26-189
obligation_kind: [requirement, restriction]
reliance_scope: public
statute_anchors:
  - cite: "C.R.S. Title 6, Article 1, Part 17 (Automated Decision-Making Technology), as amended by SB 26-189"
    url: "https://leg.colorado.gov/bills/sb26-189"
  - cite: "C.R.S. §6-1-1702 (developer documentation duties)"
    url: "https://leg.colorado.gov/bills/sb26-189"
  - cite: "C.R.S. §6-1-1703 (deployer record-keeping; 3-year retention)"
    url: "https://leg.colorado.gov/bills/sb26-189"
  - cite: "C.R.S. §6-1-1704 (deployer consumer-notice obligation; consequential decisions)"
    url: "https://leg.colorado.gov/bills/sb26-189"
  - cite: "C.R.S. §6-1-1705 (consumer rights; data correction; human review; 30-day post-adverse explanation)"
    url: "https://leg.colorado.gov/bills/sb26-189"
  - cite: "C.R.S. §6-1-1706 (Attorney General enforcement; 60-day cure period; deceptive trade practices)"
    url: "https://leg.colorado.gov/bills/sb26-189"
publication_citations:
  - cite: "Colorado SB 26-189 (2026 Regular Session), Governor Signed May 14, 2026"
    url: "https://leg.colorado.gov/bills/sb26-189"
full_text_reference: "https://everyailaw.com/regulation/colorado-sb26-189/"
sponsors:
  - "Sen. Robert Rodriguez (Senate prime sponsor)"
status: enforcing
supersedes: us-co-legislature-statute-2024-sb24-205
superseded_by: null
amended_by: []
hash_chain_prev: null
disclaimer: ""
last_verified: 2026-05-21
schema: https://publedge.org/schema/instrument.schema.json
created: 2026-05-21
modified: 2026-05-21
---

## Timeline

| Milestone | Date | Notes |
|-----------|------|-------|
| Introduced | 2026-Q1 | 2026 Regular Session |
| Governor Signed | 2026-05-14 | Replaces SB 24-205 in full |
| Challenge window | 2026-05-14 → 2026-06-11 | 28-day window for further litigation noted in public commentary |
| Effective | 2027-01-01 | Compliance obligations take effect |
| Record-retention horizon | 2030-01-01 | First 3-year retention cycle closes |
| Cure-period sunset | 2030-01-01 | 60-day cure available until this date per transition provisions |

---

## Summary

SB 26-189 narrows and replaces the original Colorado AI Act (SB 24-205) before that statute ever took effect. Rebranded as the Automated Decision-Making Technology (ADMT) Act and codified at C.R.S. §§6-1-1702 through 6-1-1706, the replacement statute drops the duty of reasonable care, the impact-assessment requirement, and most of the developer-liability scheme. What survives is a much narrower disclosure-and-rights regime:

- **Developer documentation (§6-1-1702).** Developers must disclose intended uses, training-data categories, known limitations, and human-review instructions to deployers.
- **Deployer consumer notice (§6-1-1704).** Before a consequential decision is made using covered ADMT, the deployer must notify the consumer that an automated system is being used and disclose the decision's purpose and nature.
- **Post-adverse explanation (§6-1-1705).** Within 30 days of an adverse consequential decision, the deployer must provide a plain-language explanation including the AI's role, degree of contribution, data types processed, and data sources.
- **Consumer rights (§6-1-1705).** Consumers may correct inaccurate personal data and request meaningful human review and reconsideration of adverse outcomes.
- **Record-keeping (§6-1-1703).** Deployers must retain compliance documentation for a minimum of 3 years.
- **Enforcement (§6-1-1706).** Colorado Attorney General only; no private right of action; violations treated as deceptive trade practices under the Colorado Consumer Protection Act. A 60-day cure period is available through January 1, 2030.

The duty of reasonable care, the developer/deployer impact-assessment regime, and the rebuttable-presumption-of-compliance scaffolding from SB 24-205 are gone. The statute keeps the consumer-facing transparency core and reassigns the entire enforcement architecture to the AG's existing deceptive-trade-practices machinery.

### Talking Point

> "Colorado SB 26-189 (2026) replaced the original AI Act before it took effect, dropping the duty of reasonable care and impact-assessment regime and retaining a narrower transparency-plus-rights core enforced solely by the Attorney General through Colorado's deceptive-trade-practices statute."

### Sources

- [SB 26-189 Bill Text (leg.colorado.gov)](https://leg.colorado.gov/bills/sb26-189)
- [EveryAILaw — Colorado SB 26-189](https://everyailaw.com/regulation/colorado-sb26-189/)
- [EveryAILaw — Colorado SB 24-205 (predecessor)](https://everyailaw.com/regulation/colorado-sb24-205/)
- [PAICE.work — Modeling the Colorado AI Act with ObligationFirst](https://paice.work/blog/modeling-colorado-ai-act-obligationfirst)
