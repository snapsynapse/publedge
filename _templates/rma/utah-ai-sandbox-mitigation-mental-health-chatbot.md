---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Template"
id: us-ut-tpl-rma-0001
slug: utah-ai-sandbox-mitigation-mental-health-chatbot
title: "Utah RMA Template — AI Sandbox Mitigation, Mental-Health Chatbot Cohort"
kind: rma
jurisdiction: us-ut
fills:
  - "@type": "https://w3id.org/semanticarts/ns/ontology/gist/Contract"
variables:
  - name: requesting_party_name
    description: "Legal name of the sandbox participant"
  - name: product_name
    description: "Marketed product name"
  - name: rules_being_mitigated
    description: "Specific rules whose strict application would block the product, e.g. '§13-72a-202 absolute claim restrictions'"
  - name: mitigation_safeguards
    description: "Concrete safeguards the participant will implement in lieu of strict compliance (numbered list)"
  - name: term_length
    description: "Sandbox enrollment term as ISO-8601 duration (e.g., 'P12M' for 12 months) or 'indefinite'"
  - name: review_date
    description: "Mid-term review date (YYYY-MM-DD)"
  - name: termination_date
    description: "Term end date (YYYY-MM-DD)"
  - name: incident_reporting_threshold
    description: "Event types and thresholds that trigger mandatory reporting to OAIP within 72 hours"
status: draft
disclaimer: "Suggested prior art. Not official OAIP output."
created: 2026-04-18
modified: 2026-04-18
---

# Regulatory Mitigation Agreement — AI Sandbox Enrollment

**Participant:** {{requesting_party_name}}
**Enforcement authority:** Utah Office of Artificial Intelligence Policy (OAIP)
**Sandbox program:** Utah AI Learning Lab (Utah Code §13-72a-401 et seq.)
**Product:** {{product_name}}
**Term length:** {{term_length}}
**Termination date:** {{termination_date}}

## Summary

This Regulatory Mitigation Agreement (RMA) enrolls {{product_name}} in the Utah AI Learning Lab sandbox. In exchange for the safeguards described below, OAIP agrees to mitigate the strict application of {{rules_being_mitigated}} during the term.

## Background

{{requesting_party_name}} has applied to the Utah AI Learning Lab to operate {{product_name}} under conditions that {{rules_being_mitigated}} would otherwise block. The parties have negotiated the safeguards below as a substitute risk-mitigation regime suitable for the sandbox term.

## Mitigation safeguards

{{mitigation_safeguards}}

## Terms

- **Requirement:** {{requesting_party_name}} implements every safeguard above before {{product_name}} accepts a single Utah user.
- **Requirement:** Incidents meeting {{incident_reporting_threshold}} are reported to OAIP within 72 hours.
- **Requirement:** The participant submits a written self-attestation of safeguard adherence quarterly.
- **Restriction:** No expansion of {{product_name}} to populations outside the scope described in the application without written OAIP approval.
- **Restriction:** No marketing claim that the sandbox enrollment constitutes a clinical license, certification, or endorsement.
- **Permission:** During the term, OAIP will not pursue enforcement action against {{requesting_party_name}} for {{rules_being_mitigated}} on the conduct described above.

## Enforcement

This is an enforceable contract under Utah Code §13-72a-403. Material breach of any safeguard or reporting obligation entitles OAIP to suspend or terminate enrollment with five business days' notice.

## Effective date and review

Effective on signature. Mid-term review on {{review_date}}. Term ends on {{termination_date}} unless renewed by written amendment.
