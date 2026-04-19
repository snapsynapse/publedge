---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Template"
id: us-ut-tpl-rma-0002
slug: utah-genai-safe-harbor-enrollment
title: "Utah RMA Template — GenAI Safe-Harbor Enrollment (§13-75-104)"
kind: rma
jurisdiction: us-ut
fills:
  - "@type": "https://w3id.org/semanticarts/ns/ontology/gist/Contract"
variables:
  - name: requesting_party_name
    description: "Legal name of the enrolling party"
  - name: product_name
    description: "Marketed product name"
  - name: disclosure_implementation
    description: "How and where the §13-72a-203 disclosure is rendered in the user experience"
  - name: data_handling_summary
    description: "Summary of data handling consistent with §13-72a-201, or pointer to a separate JIA on the topic"
  - name: marketing_qualifier
    description: "Exact qualifying language used across marketing surfaces per §13-72a-202"
  - name: term_length
    description: "Enrollment term as ISO-8601 duration (e.g., 'P24M') or 'indefinite'"
  - name: review_date
    description: "Mid-term review date (YYYY-MM-DD)"
  - name: termination_date
    description: "Term end date (YYYY-MM-DD) or 'indefinite'"
status: draft
disclaimer: "Suggested prior art. Not official OAIP output."
created: 2026-04-18
modified: 2026-04-18
---

# Regulatory Mitigation Agreement — GenAI Safe-Harbor Enrollment

**Enrolling party:** {{requesting_party_name}}
**Enforcement authority:** Utah Office of Artificial Intelligence Policy (OAIP)
**Statute providing safe harbor:** Utah Code §13-75-104
**Product:** {{product_name}}
**Term length:** {{term_length}}
**Termination date:** {{termination_date}}

## Summary

{{requesting_party_name}} enrolls {{product_name}} in the §13-75-104 safe harbor, attesting to the disclosure, data handling, and marketing-claim conditions below. In exchange, OAIP agrees that conduct within scope will not be subject to enforcement under the AI Policy Act for the term.

## Conditions of enrollment

1. **Disclosure.** {{disclosure_implementation}}, satisfying §13-72a-203 on every session and after extended inactivity.
2. **Data handling.** {{data_handling_summary}}, satisfying §13-72a-201.
3. **Marketing language.** Every marketing surface controlled or supplied by {{requesting_party_name}} carries the qualifier: {{marketing_qualifier}}, satisfying §13-72a-202.

## Terms

- **Requirement:** Each condition above remains continuously satisfied throughout the term.
- **Requirement:** {{requesting_party_name}} provides written self-attestation of continued conformance every six months.
- **Restriction:** No material change to disclosure surface, data handling, or marketing language without written OAIP acknowledgment.
- **Permission:** Conduct conforming to the conditions above is treated as compliant with the AI Policy Act for enforcement purposes during the term.

## Enforcement

This is an enforceable contract. Failure of any condition voids the safe harbor prospectively from the date of failure. OAIP retains full enforcement authority for any conduct outside the conditions or after voidance.

## Effective date and review

Effective on signature. Mid-term review on {{review_date}}. Term ends on {{termination_date}} unless renewed by written amendment.
