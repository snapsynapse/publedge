---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Contract"
id: us-ut-oaip-rma-0003
slug: utah-doctronic-rx-renewal-2025
name: "Doctronic Regulatory Mitigation Agreement — AI Prescription Renewal"
title: "Utah OAIP × Doctronic — AI Prescription Renewal RMA (2025)"
type: rma
source: demonstration-remap
jurisdiction: us-ut
authority: utah-oaip
issued_by:
  "@type": "https://w3id.org/semanticarts/ns/ontology/gist/SubCountryGovernment"
  name: "Utah Office of Artificial Intelligence Policy (OAIP)"
  ref: "https://commerce.utah.gov/ai/learning-lab/"
issuance_event: gist:Determination
enacted: 2025-10-24
effective: 2025-10-24
term_start: 2025-10-24
term_end: 2026-10-24
official_url: https://commerce.utah.gov/ai/agreements/doctronic/
publication_citations:
  - "https://commerce.utah.gov/wp-content/uploads/2026/01/Doctronic-Final-Agreement.pdf"
obligation_kind: [permission, requirement, restriction]
reliance_scope: requesting-party-only
participating_party: "Doctronic, LLC"
issuing_authority: "Utah Office of Artificial Intelligence Policy"
parties:
  - name: "Utah Office of Artificial Intelligence Policy"
    role: issuing_authority
  - name: "Utah Division of Professional Licensing"
    role: co_signatory_authority
  - name: "Doctronic, LLC"
    role: participant
program: "Utah Artificial Intelligence Learning Laboratory"
statute_anchors:
  - cite: "Utah Code §13-72-201"
    url: "https://le.utah.gov/xcode/Title13/Chapter72/13-72-S201.html"
  - cite: "Utah Code §13-72-301"
    url: "https://le.utah.gov/xcode/Title13/Chapter72/13-72-S301.html"
  - cite: "Utah Code §13-72-302"
    url: "https://le.utah.gov/xcode/Title13/Chapter72/13-72-S302.html"
  - cite: "Utah Code §13-77-103"
    url: "https://le.utah.gov/xcode/Title13/Chapter77/13-77-S103.html"
  - cite: "Utah Code §58-17b (Pharmacy Practice Act)"
    url: "https://le.utah.gov/xcode/Title58/Chapter17B/58-17b.html"
  - cite: "Utah Code §58-1-501 (Unlawful/unprofessional conduct)"
    url: "https://le.utah.gov/xcode/Title58/Chapter1/58-1-S501.html"
  - cite: "Utah Code §26B-4-704 (Telehealth)"
    url: "https://le.utah.gov/xcode/Title26B/Chapter4/26B-4-S704.html"
  - cite: "Utah Code §63A-19-102 (Data security)"
    url: "https://le.utah.gov/xcode/Title63A/Chapter19/63A-19-S102.html"
  - cite: "UAC R156-1-501 / R156-1-602"
    url: "https://adminrules.utah.gov/public/rule/R156-1/Current%20Rules"
rules_mitigated:
  - "Utah Code §58-1-501(1) and UAC R156-1-501(2)(b) — unlawful/unprofessional conduct for AI-authored Rx renewal"
  - "Utah Code §26B-4-704(6) and UAC R156-1-602 — telehealth provider requirements"
  - "Unprofessional-conduct provisions across prescriber chapters: §§58-31b-502, 58-60-110, 58-61-502, 59-67-502, 59-68-502, 59-70a-503, 58-71-502"
mitigations:
  - "Three-phase comprehensive case-review process (pre-pharmacy review → retrospective review → ongoing sampling)"
  - "Identity and prescription verification protocols before AI engages with renewal request"
  - "AI may not issue new prescriptions, change doses, handle controlled substances, or modify treatment plans"
  - "Formulary limit: Schedule C of the Agreement"
  - "First-session GenAI disclosure (§13-77-103) with acknowledgment before access"
  - "Data-security posture per §63A-19-102 applied as if Participant were a governmental entity"
  - "Monthly reporting to ai@utah.gov including acceptance/denial counts, physician-review agreement rates, complaints, adverse outcomes"
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

A Regulatory Mitigation Agreement between the Utah Office of Artificial Intelligence Policy (OAIP), the Utah Division of Professional Licensing (DOPL), and Doctronic, LLC, enrolling Doctronic's AI prescription-renewal system in the Utah AI Learning Laboratory for a 12-month demonstration period. The Division forgoes enforcement of unlawful-conduct, unprofessional-conduct, and telehealth-provider rules against Doctronic and its affiliated prescribers for AI-authored renewals of previously prescribed, non-controlled medications on the formulary — provided Doctronic abides by the safeguards, disclosures, and reporting obligations in the Agreement and its incorporated Proposal.

## Background

Utah faces primary-care shortages in rural counties and administrative load from routine prescription refills. Doctronic applied to the AI Learning Lab to automate 30/60/90-day renewals for previously prescribed, non-controlled medications, with a licensed-prescriber audit loop. The Agreement was executed 2025-10-23 (OAIP Director Zachary Boyd; Doctronic CEO Matt Pavelle) and 2025-10-24 (DOPL Director Mark Steinagel). Effective date is the latter signature date. Utah Code §13-72-302 authorizes OAIP to grant limited regulatory mitigation for participants in the Learning Laboratory.

## Question presented

May a participant's artificial-intelligence technology authorize the renewal of a previously prescribed medication, issue the renewal to a licensed Utah pharmacist under §58-17b, and act as the named prescriber of record — without subjecting Doctronic or its affiliated prescribers to enforcement for unlawful conduct (§58-1-501), telehealth-provider non-compliance (§26B-4-704), or unprofessional conduct across the prescriber chapters — during the demonstration period, in exchange for specified safeguards and monthly reporting?

## Regulatory mitigation granted (Schedule A, §15)

| Scope | Provision |
|---|---|
| Renewal authorization | AI may authorize renewals of verified prescriptions to a pharmacist licensed under §58-17b |
| Unlawful-conduct forbearance | DOPL will forgo enforcement under §58-1-501(1) and UAC R156-1-501(2)(b) for the conduct described in the Proposal |
| Telehealth forbearance | DOPL will forgo enforcement under §26B-4-704(6) and UAC R156-1-602, contingent on compliance with §16(A) obligations |
| Affiliated-prescriber forbearance | For providers who act solely as named prescriber in reliance on the AI and do not interact with patients directly, DOPL will forgo enforcement of §58-1-501(1)-(2), R156-1-501(2)(b), and chapter-specific unprofessional-conduct provisions |
| Out-of-scope | Mitigation does not extend to any Doctronic service outside prescription renewals as described in Schedule B |

## Obligations summary (Section 6 and Schedule A §16)

- Proposal-conforming methodology and safety protocols; amendments only by signed written approval.
- AI considered in compliance with §26B-4-704(2)(b)/(c) and (4) when Patient Journey and Clinical Workflow (Schedule B, Part 2B) is followed; with §26B-4-704(2)(e) when Escalation Protocols (Part 3B) are followed; §26B-4-704(5) does not apply.
- §13-77-103 GenAI disclosure on first session; users must acknowledge before use.
- Data-security posture per §63A-19-102 treated as if Participant were a governmental entity; no sale or advertising use of user data even if deidentified.
- Monthly reports to ai@utah.gov: acceptance/denial counts, AI-vs-physician agreement rates, trends, adverse events, complaints.
- 30-day post-term written report on deployment, incidents, legal actions, complaints.

## Reliance scope

Requesting-party-only. The Agreement grants mitigation to Doctronic, LLC and affiliated prescribers who act solely as named prescriber for AI-authored renewals without direct patient interaction. It is not prior art on which unrelated parties may rely; the Agreement expressly disclaims endorsement (Section 3D) and requires Participant registration (§6C). Harmed users and the State (other than DOPL) retain all legal remedies (§4D, §6B.3).

## PubLedge schema mapping

| Source element | PubLedge field |
|---|---|
| "Agreement between OAIP, Doctronic LLC, and DOPL" | `title`, `name` |
| Section 1 parties | `parties[]`, `participating_party`, `issuing_authority` |
| Section 2 (12-month term, from execution) | `term_start`, `term_end` |
| Section 3 (Utah Code §13-72-201/301/302 authority) | `program`, `statute_anchors[]` |
| Section 4 (Scope of Mitigation) + Schedule A §15 | `rules_mitigated[]`, `obligation_kind: permission` |
| Section 6 (Participant Obligations) | `mitigations[]`, `obligation_kind: requirement/restriction` |
| Latter signature date 2025-10-24 | `enacted`, `effective` |
| Utah AI Learning Laboratory | `program` |

## Limitations

- Does not waive federal laws (including controlled-substances statutes), HIPAA, or disclosure/privacy laws beyond what the four corners of the Agreement expressly address.
- Does not endorse Participant's technology (§3D); advertising references to the Agreement require prior written approval.
- Terminable at will by either party (§10A) under §13-72-302(7).
- Assignment requires prior written OAIP consent (§11).

## Sources

- [Agreement page — Utah OAIP](https://commerce.utah.gov/ai/agreements/doctronic/)
- [Signed PDF](https://commerce.utah.gov/wp-content/uploads/2026/01/Doctronic-Final-Agreement.pdf)
- [Utah AI Learning Laboratory](https://commerce.utah.gov/ai/learning-lab/)
- [Utah Code Title 13, Chapter 72](https://le.utah.gov/xcode/Title13/Chapter72/13-72.html)

## Notes on this demonstration remap

Third RMA (`us-ut-oaip-rma-0003`) by effective date. Exercises: (1) three-party contract (regulator + licensing division + participant), (2) multi-statute mitigation bundle including unprofessional-conduct provisions across seven prescriber chapters, (3) permission + requirement + restriction obligation mix in a single instrument, and (4) concurrent term with Utah's ongoing §13-72 → §13-72a statutory transition.
