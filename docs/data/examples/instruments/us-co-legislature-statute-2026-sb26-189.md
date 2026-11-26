---
describesSameEntityAs: ["https://everyailaw.com/instrument/colorado-sb26-189.json"]
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
  - cite: "C.R.S. §6-1-1704 (deployer notice and post-adverse disclosures)"
    url: "https://leg.colorado.gov/bills/sb26-189"
  - cite: "C.R.S. §6-1-1705 (consumer rights; data correction; human review and reconsideration)"
    url: "https://leg.colorado.gov/bills/sb26-189"
  - cite: "C.R.S. §6-1-1706 (Attorney General enforcement; 60-day cure period; deceptive trade practices)"
    url: "https://leg.colorado.gov/bills/sb26-189"
publication_citations:
  - cite: "Colorado SB 26-189 (2026 Regular Session), Governor Signed May 14, 2026"
    url: "https://leg.colorado.gov/bills/sb26-189"
full_text_reference: "https://everyailaw.com/regulation/colorado-sb26-189/"
sponsors:
  - "Sen. Robert Rodriguez (Senate prime sponsor)"
status: enacted
editorial_status: published
supersedes: us-co-legislature-statute-2024-sb24-205
superseded_by: null
amended_by: []
hash_chain_prev: null
disclaimer: ""
last_verified: 2026-07-25
schema: https://publedge.org/schema/instrument.schema.json
created: 2026-05-21
modified: 2026-07-25
---

## Timeline

| Milestone | Date | Notes |
|-----------|------|-------|
| Introduced | 2026-05-01 | Colorado General Assembly, All Versions |
| Governor Signed | 2026-05-14 | Section 5 distinguishes enactment, provisions effective on passage, and the January 1, 2027 general commencement. |
| Provisions effective on passage | 2026-05-14 | Section 5(2) includes the Attorney General rulemaking directives in §§6-1-1704(4) and 6-1-1705(3), the party-joinder provision in §6-1-1706(6), and the insurance commissioner’s authority to adopt or update insurer notice and disclosure rules under §10-3-1104.9(3)(e). It also includes act §§4–6. |
| Implementing rules adopted | 2026-11-19 | The Colorado Secretary of State’s eDocket for 4 CCR 904-6 (tracking 2026-00360) lists November 19 as the adoption date and November 20 as the date an Attorney General opinion was requested. The November 24 docket observation supplies no effective date for the rules. |
| Substantive duties effective | 2027-01-01 | Developer, deployer, consumer-rights, recordkeeping, and cure obligations apply to consequential decisions on or after this date |
| Cure-period sunset | 2030-01-01 | Repeal of §6-1-1706(3) takes effect. |

---

## Summary

SB 26-189 narrows and replaces the original Colorado AI Act (SB 24-205). Predecessor operative history remains unresolved; this record does not establish whether or when predecessor duties became operative. The signed Act reenacts C.R.S. §§6-1-1701 through 6-1-1709, including definitions (§1701), liability and allocation (§1707), treatment of other legal obligations and exemptions (§1708), and the limits on private actions and the effect of compliance under other law (§1709). The replacement statute drops the duty of reasonable care, the impact-assessment requirement, and most of the developer-liability scheme. Its substantive duties apply beginning January 1, 2027; specified rulemaking and administrative provisions took effect on passage. What survives is a much narrower disclosure-and-rights regime:

- **Developer documentation (§6-1-1702).** Within the statutory use and distribution scope, developers must make intended and known harmful or inappropriate uses, known training-data categories and limitations, instructions for appropriate use and monitoring, and applicable human-review instructions available to deployers. Developers must also supply reasonably necessary disclosure information or notify the deployer when they withhold it, and give notice of material changes within a reasonable time.
- **Deployer notice (§6-1-1704(1)–(2)).** Before using covered ADMT to materially influence a consequential decision, the deployer must give the affected consumer clear and conspicuous notice of its use and instructions for obtaining additional information. A prominent notice reasonably accessible at the point of interaction can satisfy this duty.
- **Post-adverse disclosure (§6-1-1704(3)).** Within 30 days of an adverse decision materially influenced by covered ADMT, the deployer must describe the decision and the technology’s role, provide instructions and a simple process to request additional system and input information, and explain the consumer’s rights and how to exercise them.
- **Consumer rights (§6-1-1705).** On request after a qualifying adverse decision, the deployer provides instructions for requesting personal data and correcting factual or material inaccuracies. It provides an opportunity for meaningful human review and reconsideration to the extent commercially reasonable.
- **Retention (§§6-1-1702(4), 6-1-1703).** Developers retain records reasonably necessary to demonstrate compliance for at least three years after creation. Deployers retain such records for at least three years after the consequential decision. Longer periods apply when required by other law.
- **Enforcement (§6-1-1706).** The Attorney General enforces the act. It creates no new private right of action. Where the Attorney General deems a cure possible, the notice procedure allows 60 days from receipt. The Attorney General need not provide a cure period for demonstrably knowing or repeated violations. Subsection (3) is repealed effective January 1, 2030.

The duty of reasonable care, the developer/deployer impact-assessment regime, and the rebuttable-presumption-of-compliance scaffolding from SB 24-205 are gone. The statute keeps the consumer-facing transparency core and reassigns the entire enforcement architecture to the AG's existing deceptive-trade-practices machinery.

### Talking Point

> "Colorado SB 26-189 (2026) replaced the original AI Act, dropping the duty of reasonable care and impact-assessment regime and retaining a narrower transparency-plus-rights core enforced solely by the Attorney General through Colorado's deceptive-trade-practices statute."

### Sources

- [SB 26-189 Bill Text (leg.colorado.gov)](https://leg.colorado.gov/bills/sb26-189)
- [EveryAILaw — Colorado SB 26-189](https://everyailaw.com/regulation/colorado-sb26-189/)
- [EveryAILaw — Colorado SB 24-205 (predecessor)](https://everyailaw.com/regulation/colorado-sb24-205/)
- [PAICE.work — Modeling the Colorado AI Act with ObligationFirst](https://paice.work/blog/modeling-colorado-ai-act-obligationfirst)

- [Colorado General Assembly signed act, §§6-1-1702 through 1706 and §5](https://leg.colorado.gov/bill_files/116489/download)
