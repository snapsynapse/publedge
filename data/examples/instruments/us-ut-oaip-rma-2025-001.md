---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Contract"
id: us-ut-oaip-rma-2025-001
instance: 2025-001
slug: utah-dentacor-ai-radiograph-2025
name: "Dentacor Regulatory Mitigation Agreement — AI-Assisted Dental Radiograph Diagnosis"
title: "Utah OAIP × Dentacor — AI-Assisted Dental Radiograph Diagnosis RMA (2025)"
type: rma
source: demonstration-remap
jurisdiction: us-ut
authority: utah-oaip
issued_by:
  "@type": "https://w3id.org/semanticarts/ns/ontology/gist/SubCountryGovernment"
  name: "Utah Office of Artificial Intelligence Policy (OAIP)"
  ref: "https://commerce.utah.gov/ai/learning-lab/"
issuance_event: gist:Determination
enacted: 2025-05-31
effective: 2025-05-31
term_start: 2025-05-31
term_end: 2026-05-31
official_url: https://commerce.utah.gov/ai/agreements/dentacor/
publication_citations:
  - "https://commerce.utah.gov/wp-content/uploads/2025/06/Dentacor-Mitigation-Agreement.pdf"
source_documents:
  - Dentacor-Mitigation-Agreement.pdf
extracted_text: Dentacor-Mitigation-Agreement.txt
obligation_kind: [permission, requirement, restriction]
reliance_scope: requesting-party-only
participating_party: "Dentacor, LLC"
issuing_authority: "Utah Office of Artificial Intelligence Policy"
parties:
  - name: "Utah Office of Artificial Intelligence Policy"
    role: issuing_authority
  - name: "Utah Division of Professional Licensing"
    role: co_signatory_authority
  - name: "Dentacor, LLC"
    role: participant
program: "Utah Artificial Intelligence Learning Laboratory"
statute_anchors:
  - cite: "Utah Code §13-72-201"
    url: "https://le.utah.gov/xcode/Title13/Chapter72/13-72-S201.html"
  - cite: "Utah Code §13-72-302"
    url: "https://le.utah.gov/xcode/Title13/Chapter72/13-72-S302.html"
  - cite: "Utah Code §58-69 (Dental Practice Act)"
    url: "https://le.utah.gov/xcode/Title58/Chapter69/58-69.html"
  - cite: "Utah Code §58-69-301(2)(b)"
    url: "https://le.utah.gov/xcode/Title58/Chapter69/58-69-S301.html"
  - cite: "Utah Code §58-69-102(10)"
    url: "https://le.utah.gov/xcode/Title58/Chapter69/58-69-S102.html"
  - cite: "Utah Code §58-69-5 (Unlawful / unprofessional conduct)"
    url: "https://le.utah.gov/xcode/Title58/Chapter69/58-69-S5.html"
  - cite: "Utah Code §63A-19-102"
    url: "https://le.utah.gov/xcode/Title63A/Chapter19/63A-19-S102.html"
rules_mitigated:
  - "Utah Code §58-69-5 — unlawful/unprofessional conduct for dental-hygienist diagnosis outside general supervision of a dentist, in the narrow set of procedures and conditions enumerated in Schedule A"
mitigations:
  - "Diagnosis limited to periodontal disease, complete edentulism, complete anodontia; procedures limited to scaling/root planing and full-denture installation and fitting"
  - "Dual-verification: hygienist + AI must concur; discrepancy escalates to licensed dentist"
  - "Informed consent including explicit notice that a dentist is not supervising and that hygienist scope is narrower than a dentist's"
  - "Patient general-health review before procedure"
  - "Testing plan approved by OAIP before any patient contact"
  - "Data security per §63A-19-102; State of Utah Enterprise Information Security Policy 5000-0002"
  - "Monthly reporting to ai@utah.gov (demographics, efficacy, complaints, adverse events, incidents)"
status: enforcing
supersedes: null
superseded_by: null
withdrawn_date: null
withdrawal_reason: null
withdrawn_by_instrument: null
hash_chain_prev: null
disclaimer: ""
last_verified: 2026-06-04
schema: https://publedge.org/schema/instrument.schema.json
created: 2026-04-19
modified: 2026-06-04
---

## Summary

A Regulatory Mitigation Agreement enrolling Dentacor, LLC in the Utah AI Learning Laboratory for a 12-month demonstration period. Licensed dental hygienists employed by Dentacor may, with concurrence of an AI-assisted radiograph diagnostic tool, diagnose a narrow set of dental conditions — periodontal disease, complete edentulism, complete anodontia — and perform scaling/root planing or full-denture installation, in lieu of operating under the general supervision of a dentist as ordinarily required. DOPL will forgo enforcement under §58-69-5 for the enumerated activities so long as Dentacor abides by the dual-verification protocol, informed-consent terms, and monthly reporting obligations.

## Background

Dentacor operates mobile dental hygiene clinics serving shelters, recovery programs, and transitional housing. Executed 2025-05-29 (Dentacor CEO Nathan Wilson), 2025-05-30 (OAIP Director Zachary Boyd), and 2025-05-31 (DOPL Director Mark Steinagel). Effective date is the latter signature date. The Agreement is the first RMA directed at scope-of-practice for a non-prescribing health profession in Utah's AI Learning Laboratory.

## Question presented

May licensed dental hygienists employed by Dentacor use an AI-assisted radiograph diagnostic tool, in place of the general supervision of a dentist, to diagnose a narrow set of conditions and perform the follow-on procedures, without exposing Dentacor to enforcement under §58-69-5 — provided the hygienist and AI concur, disagreements escalate to a licensed dentist, and Dentacor meets the informed-consent, reporting, and data-security obligations specified in the Agreement?

## Regulatory mitigation granted (Schedule A, §15)

| Scope | Provision |
|---|---|
| Diagnoses authorized | Periodontal disease; complete edentulism; complete anodontia |
| Procedures authorized | Scaling and root planing; installation and fitting of full dentures |
| Statute forbearance | §58-69-5 unlawful/unprofessional conduct enforcement forgone for the enumerated diagnoses and procedures |
| Out-of-scope | Mitigation does not extend to any other diagnosis or procedure; all others require dentist referral |

## Obligations summary (Section 6 and Schedule A §15C–D)

- Dual verification: diagnosis confirmed by both hygienist and AI; discrepancies auto-escalate to licensed dentist.
- Informed consent for every patient, including explicit disclosure that no dentist is supervising and hygienist scope is narrower than a dentist's.
- Patient general-health review to screen for contraindications.
- Testing plan filed and approved by OAIP before rollout; material changes require OAIP sign-off.
- Data security per §63A-19-102; Utah Enterprise Information Security Policy 5000-0002.
- HIPAA-compliant patient management system; PHI excluded from monthly reports.
- Monthly reports to ai@utah.gov: patient demographics, efficacy, incidents, complaints, hygienist observations.
- 30-day post-term written report (incidents, legal actions, complaints).

## Reliance scope

Requesting-party-only. The Agreement confers mitigation only on Dentacor, LLC and its employed hygienists. It does not authorize any other mobile dental-hygiene operation to rely on its forbearance; any other hygienist operating without dentist supervision remains subject to §58-69-5.

## PubLedge schema mapping

| Source element | PubLedge field |
|---|---|
| "Agreement between OAIP, Dentacor LLC, and DOPL" | `title`, `name` |
| Section 1 parties | `parties[]` |
| Section 2 (12-month from execution) | `term_start`, `term_end` |
| Schedule A §15A diagnoses and §15B procedures | `mitigations[]`, `obligation_kind: permission` |
| Schedule A §15D (DOPL forgoes enforcement under §58-69-5) | `rules_mitigated[]` |
| Section 6 obligations (dual verification, consent, reporting) | `mitigations[]`, `obligation_kind: requirement` |
| Latter signature 2025-05-31 | `enacted`, `effective` |

## Limitations

- Scoped to the three diagnoses and two procedures in Schedule A; any broader practice remains subject to §58-69-5.
- Does not supersede HIPAA, FDA requirements, or any other federal law.
- Terminable at will by either party (§10A) under §13-72-302(7).
- Failure to meet obligations may nullify the Agreement (§6J).

## Sources

- [Agreement page — Utah OAIP](https://commerce.utah.gov/ai/agreements/dentacor/)
- [Signed PDF](https://commerce.utah.gov/wp-content/uploads/2025/06/Dentacor-Mitigation-Agreement.pdf)
- [Utah Code §58-69 — Dental Practice Act](https://le.utah.gov/xcode/Title58/Chapter69/58-69.html)

## Notes on this demonstration remap

Second RMA (`us-ut-oaip-rma-0002`). Exercises scope-of-practice mitigation (non-prescribing profession) distinct from the prescription-renewal mitigation in `us-ut-oaip-rma-0003`. Narrows the mitigated provisions to one statute (§58-69-5) and a closed list of three diagnoses and two procedures — useful for demonstrating tight scope boundaries in the registry.
