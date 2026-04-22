---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Contract"
id: us-ut-oaip-rma-2026-001
instance: 2026-001
slug: utah-legion-health-psych-refill-2026
name: "Legion Health Regulatory Mitigation Agreement — AI Psychiatric Medication Refill"
title: "Utah OAIP × Legion Health — AI Maintenance Psychiatric Refill RMA (2026)"
type: rma
source: demonstration-remap
jurisdiction: us-ut
authority: utah-oaip
issued_by:
  "@type": "https://w3id.org/semanticarts/ns/ontology/gist/SubCountryGovernment"
  name: "Utah Office of Artificial Intelligence Policy (OAIP)"
  ref: "https://commerce.utah.gov/ai/learning-lab/"
issuance_event: gist:Determination
enacted: 2026-03-19
effective: null
commencement_date_trigger: "Participant's written notice to OAIP that project is ready to proceed (Section 2.B)"
term_start: null
term_end: null
official_url: https://commerce.utah.gov/ai/agreements/ai-legion-health/
publication_citations:
  - "https://commerce.utah.gov/wp-content/uploads/2026/03/Legion-Agreement.pdf"
source_documents:
  - Legion-Agreement.pdf
extracted_text: Legion-Agreement.txt
obligation_kind: [permission, requirement, restriction]
reliance_scope: requesting-party-only
participating_party: "Legion Health PA; Legion Health, Inc."
issuing_authority: "Utah Office of Artificial Intelligence Policy"
parties:
  - name: "Utah Office of Artificial Intelligence Policy"
    role: issuing_authority
  - name: "Utah Division of Professional Licensing"
    role: co_signatory_authority
  - name: "Legion Health PA"
    role: participant
  - name: "Legion Health, Inc."
    role: participant
program: "Utah Artificial Intelligence Learning Laboratory"
statute_anchors:
  - cite: "Utah Code §13-72-201"
    url: "https://le.utah.gov/xcode/Title13/Chapter72/13-72-S201.html"
  - cite: "Utah Code §13-72-302 (→ §13-72-401 effective 2026-05-06)"
    url: "https://le.utah.gov/xcode/Title13/Chapter72/13-72-S302.html"
  - cite: "Utah Code §13-72a (Mental Health Chatbot)"
    url: "https://le.utah.gov/xcode/Title13/Chapter72A/13-72a.html"
  - cite: "Utah Code §13-77-103 (GenAI disclosure)"
    url: "https://le.utah.gov/xcode/Title13/Chapter77/13-77-S103.html"
  - cite: "Utah Code §58-17b (Pharmacy Practice Act)"
    url: "https://le.utah.gov/xcode/Title58/Chapter17B/58-17b.html"
  - cite: "Utah Code §58-1-501"
    url: "https://le.utah.gov/xcode/Title58/Chapter1/58-1-S501.html"
  - cite: "Utah Code §26B-4-704 (Telehealth)"
    url: "https://le.utah.gov/xcode/Title26B/Chapter4/26B-4-S704.html"
  - cite: "UAC R156-1-501 / R156-1-602"
    url: "https://adminrules.utah.gov/public/rule/R156-1/Current%20Rules"
rules_mitigated:
  - "§58-1-501(1) and UAC R156-1-501(2)(b) — unlawful/unprofessional conduct for AI-authored psychiatric Rx renewal"
  - "§26B-4-704(6) and UAC R156-1-602 — telehealth-provider requirements"
  - "Unprofessional-conduct provisions across prescriber chapters: §§58-31b-501-503, 58-60-109-111, 58-61-501-503, 58-67-501-503, 58-68-501-503, 58-70a-502-504"
mitigations:
  - "Refills only for non-controlled, maintenance psychiatric medications on the Schedule B formulary (SSRIs, SNRIs, bupropion, trazodone ≤150mg, mirtazapine with metabolic monitoring, buspirone, hydroxyzine)"
  - "No new prescriptions, no dose changes, no switching or cross-taper"
  - "Excluded: controlled substances, benzodiazepines, antipsychotics, lithium/valproate, clozapine, anything requiring new labs/ECG"
  - "Stability gates: no recent dose changes; previously prescribed by a licensed provider; no psychiatric hospitalization or acute-safety events within 1 year"
  - "Max 10 automated refills between provider reviews, or 6 months, whichever is sooner"
  - "Identity verification via government ID + biometric/selfie matching"
  - "Escalation triggers: suicidality, severe adverse effects, mania indicators, pregnancy, human-review requests"
  - "Phased auditing: ≥98% agreement on 250 pre-pharmacy reviews; ≥99% on 1,000 retrospective reviews; ongoing monthly sampling"
  - "GenAI disclosure (§13-77-103 and §13-72a-203) + pharmacist disclosure that the renewal was AI-generated"
  - "Monthly reporting to ai@utah.gov with acceptance/denial counts, AI-vs-clinician agreement rates, complaints, adverse outcomes"
  - "30-business-day cure period before termination for material breach (Section 6J)"
status: enacted
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

A Regulatory Mitigation Agreement between the Utah Office of Artificial Intelligence Policy (OAIP), the Utah Division of Professional Licensing (DOPL), and the Legion Health entities (Legion Health PA and Legion Health, Inc.), enrolling Legion's "Mental Health Refill Autopilot" in the Utah AI Learning Laboratory. The AI determines eligibility and authorizes refills — to a Utah-licensed pharmacist under §58-17b — for a narrow formulary of non-controlled maintenance psychiatric medications previously prescribed by a licensed provider. DOPL will forgo enforcement of unlawful/unprofessional-conduct and telehealth-provider rules against Legion and affiliated prescribers for refills within scope, subject to safeguards, disclosures, and monthly reporting. The 12-month term runs from a Commencement Date the participant declares in writing.

## Background

Utah reports mental-health-provider shortages across all 29 counties, affecting up to 500,000 residents. Legion Health, an AI-native psychiatry clinic, applied to the AI Learning Lab to automate refill authorization for maintenance psychiatric medications. Executed 2026-03-18 (OAIP Director Zachary Boyd) and 2026-03-19 (DOPL Director Mark Steinagel; Legion Health PA CEO Jonathan Kole M.D.; Legion Health, Inc. CEO Yash Patel). Effective date depends on Participant's written commencement notice (Section 2.B); term is 12 months from that commencement. The Agreement explicitly tracks the Utah Code §13-72-302 → §13-72-401 transition effective 2026-05-06.

## Question presented

May Legion Health's AI technology authorize refills of non-controlled maintenance psychiatric medications previously prescribed by a licensed provider, issue those refills to a Utah-licensed pharmacist, and act as the named prescriber of record — without exposing Legion or its affiliated prescribers to enforcement under §58-1-501, §26B-4-704, or the chapter-specific unprofessional-conduct provisions — during the 12-month demonstration period, in exchange for formulary limits, stability gates, phased auditing, disclosures, and monthly reporting?

## Regulatory mitigation granted (Schedule A, §16)

| Scope | Provision |
|---|---|
| Refill authorization | AI may authorize refills of verified, on-formulary prescriptions to a Utah-licensed pharmacist under §58-17b |
| Unlawful-conduct forbearance | DOPL forgoes enforcement under §58-1-501(1) and UAC R156-1-501(2)(b) for in-scope conduct |
| Telehealth forbearance | DOPL forgoes enforcement under §26B-4-704(6) and UAC R156-1-602, contingent on §17(A) obligations |
| Affiliated-prescriber forbearance (§16D) | Providers acting solely as named prescriber (no direct patient interaction) are covered for §58-1-501(1)(a)(i),(d),(f),(2)(a)(i),(a)(xiii), R156-1-501(2)(b), and chapter unprofessional-conduct: §§58-31b-501-503, 58-67-501-503, 58-68-501-503 |
| Supporting-services forbearance (§16E) | Broader set covering §§58-31b-501-503, 58-60-109-111, 58-61-501-503, 58-67-501-503, 58-68-501-503, 58-70a-502-504 — for providers rendering clinical guidance, consultation, health education, care coordination, or supportive services without direct patient interaction |
| Out-of-scope | Mitigation does not extend to other Legion services, new prescriptions, dose changes, or any medication outside Schedule B formulary |

## Obligations summary (Section 6 and Schedule A §17)

- Proposal-conforming methodology and protocols; amendments require signatures of all parties.
- AI deemed compliant with §26B-4-704(2)(b)-(c) and (4) when refill protocols followed; §26B-4-704(2)(e) when escalation protocols followed; §26B-4-704(5) does not apply.
- Portable electronic health records per §17B.
- Compliance with Utah Code §13-72a (mental-health-chatbot requirements).
- Disclosures per §13-77-103 and §13-72a-203 to users; additional disclosures to pharmacists that renewal was AI-generated.
- Monthly reports with phased-audit benchmarks and adverse-event detail.
- 30-business-day cure period prior to termination for material breach.

## Reliance scope

Requesting-party-only. Mitigation runs to Legion Health PA, Legion Health, Inc., and affiliated prescribers or supporting providers acting under §16(D) or §16(E) conditions. No reliance by unrelated parties. Participant must not imply State endorsement (§6D.1).

## PubLedge schema mapping

| Source element | PubLedge field |
|---|---|
| "Agreement between OAIP, Legion Health PA, Legion Health Inc., and DOPL" | `title`, `name` |
| Section 1 parties (two participant entities) | `parties[]` — two `participant` roles |
| Section 2 (term 12 months from Commencement Date) | `term_start: null` until commencement notice delivered |
| §13-72-302 → §13-72-401 transition 2026-05-06 | `statute_anchors[]` with transition note |
| Schedule A §16 forbearance matrix (A–G) | `rules_mitigated[]`, `obligation_kind: permission` |
| Schedule B formulary + stability gates | `mitigations[]`, `obligation_kind: restriction` |
| Section 6H reporting + phased audit | `mitigations[]`, `obligation_kind: requirement` |
| Latter signature 2026-03-19 | `enacted` (execution); `effective` remains `null` pending commencement notice |

## Limitations

- Effective date depends on Participant's commencement notice; `term_start`/`term_end` not computable from the signed document alone.
- Does not cover new prescriptions, dose changes, switching, or cross-taper.
- Does not cover controlled substances, benzodiazepines, antipsychotics, lithium/valproate, clozapine, or any medication requiring new labs or ECG for safe renewal.
- Section 9 preserves IP; no transfer between parties.
- Terminable at will (§11) under §13-72-302(7) / §13-72-401(8).

## Sources

- [Agreement page — Utah OAIP](https://commerce.utah.gov/ai/agreements/ai-legion-health/)
- [Signed PDF](https://commerce.utah.gov/wp-content/uploads/2026/03/Legion-Agreement.pdf)
- [Utah Code Title 13, Chapter 72](https://le.utah.gov/xcode/Title13/Chapter72/13-72.html)
- [Utah Code Title 13, Chapter 72a — Mental Health Chatbot](https://le.utah.gov/xcode/Title13/Chapter72A/13-72a.html)

## Notes on this demonstration remap

Fourth RMA (`us-ut-oaip-rma-0004`). Exercises schema features not covered by earlier RMAs: (1) participant is a pair of affiliated legal entities; (2) effective date is a deferred Commencement Date not fixed at signature — the registry must represent `term_start: null`; (3) the agreement straddles a statute renumbering (§13-72-302 → §13-72-401 effective 2026-05-06) and carries both citations; (4) two-tier affiliated-provider forbearance (direct-prescriber vs. supporting-services) under one instrument.
