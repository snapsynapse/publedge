---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Requirement"
id: chatbot-data-no-third-party-sharing
name: Mental Health Chatbot — No Third-Party Data Sharing
group: restriction
status: draft
lifecycle_status: operative
last_verified: 2026-04-21
search_terms:
  - chatbot
  - mental health
  - data protection
  - hipaa
  - hb452
---

## Summary

A supplier of a mental health chatbot may not sell to or share with any third party a Utah user's individually identifiable health information or user input (§13-72a-201(1)). Subsection (2)'s exceptions concern individually identifiable health information: a health care provider requests it with the Utah user's consent; it is provided to the user's health plan upon the user's request; or it is shared in compliance with subsection (3). These are not a general consent exception for all user input.

Under subsection (3), the supplier may share individually identifiable health information necessary for the chatbot's effective functionality with another party with which it has a contract related to that functionality. Both parties must comply with all applicable privacy and security provisions of 45 CFR Part 160 and Part 164, Subparts A and E, as if the supplier were a covered entity and the other entity a business associate. This sharing permission does not create a general permission to sell data.

## What Counts

- Protecting both a Utah user's individually identifiable health information and user input; user-input protection does not depend on whether the input describes symptoms, treatment, or clinical context
- Keeping the provider-request-with-consent path distinct from the user's request to provide health information to the user's health plan
- Limiting the contracted-functionality sharing path to necessary individually identifiable health information and satisfying both parties' specified privacy and security conditions
- Applying the chapter's definitions: a Utah user is located in Utah at access or use; user input is content that user provides to the chatbot. Individually identifiable health information means any information relating to an individual's physical or mental health or condition (§13-72a-101)
- Retaining the statutory supplier definition incorporated from §13-11-3: a seller, lessor, assignor, offeror, broker, or other person who regularly solicits, engages in, or enforces consumer transactions, whether or not dealing directly with the consumer. This does not establish equivalence with an AI-developer or provider role in another vocabulary

## What Does Not Count

- Treating user consent or a user request alone as permission to sell or share any user input with any third party
- Treating a vendor or subprocessor label, or HIPAA-equivalent obligations alone, as sufficient for the contracted-functionality exception
- Assuming that calling data aggregate or de-identified establishes an exemption. The selected provisions do not state a categorical analytics exception; whether particular transformed data remain within either protected object requires evidence and is unresolved here
- Treating the health-information exceptions as automatically applying to every item of user input

## Statute Anchors

- Utah Code §13-72a-201(1)-(3) — Data protection for mental health chatbot suppliers
- Utah Code §13-72a-101 — Defined chatbot, health information, user input, Utah user, and incorporated supplier terms
- Utah Code §13-11-3(5) — Incorporated supplier definition; no cross-vocabulary role equivalence asserted
- 45 CFR Part 160, Part 164 Subparts A and E — Provisions incorporated by §13-72a-201(3)(b), with supplier/other-entity roles specified there
