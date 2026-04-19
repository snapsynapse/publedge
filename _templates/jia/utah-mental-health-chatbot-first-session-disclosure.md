---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Template"
id: us-ut-tpl-jia-0001
slug: utah-mental-health-chatbot-first-session-disclosure
title: "Utah JIA Template — Mental-Health Chatbot First-Session Disclosure (§13-72a-203)"
kind: jia
jurisdiction: us-ut
fills:
  - "@type": "https://w3id.org/semanticarts/ns/ontology/gist/Agreement"
variables:
  - name: requesting_party_name
    description: "Legal name of the provider requesting interpretation"
  - name: requesting_party_jurisdiction
    description: "State of incorporation or principal place of business"
  - name: product_name
    description: "Marketed product name of the chatbot or service"
  - name: product_description
    description: "1-2 sentence description of what the product does"
  - name: target_user_population
    description: "Who the product is marketed to (adults / minors / both / clinician-supervised)"
  - name: inactivity_redisclosure_minutes
    description: "Minutes of inactivity that trigger re-display of the AI disclosure (default 30)"
  - name: review_date
    description: "Date by which the parties will review the interpretation (YYYY-MM-DD)"
status: draft
disclaimer: "Suggested prior art. Not official OAIP output."
created: 2026-04-18
modified: 2026-04-18
---

# Joint Interpretation Agreement — First-Session Disclosure

**Requesting party:** {{requesting_party_name}} ({{requesting_party_jurisdiction}})
**Interpreting authority:** Utah Office of Artificial Intelligence Policy (OAIP)
**Statute at issue:** Utah Code §13-72a-203 (mental-health chatbot disclosure)
**Product:** {{product_name}} — {{product_description}}
**Target users:** {{target_user_population}}

## Summary

The parties agree on how the first-session disclosure requirement of §13-72a-203 applies to {{product_name}}. The requesting party will display a plain-language disclosure identifying the service as an AI chatbot at the start of every user session and re-display it after {{inactivity_redisclosure_minutes}} minutes of user inactivity.

## Question presented

Does §13-72a-203's "first session" disclosure obligation extend to subsequent sessions when the user has been inactive for an extended period, and what placement constitutes plain-language disclosure?

## Interpretation

1. The disclosure must appear on the user's first interaction with the chatbot in any new session, before any other content the chatbot generates.
2. A new session is triggered when the user has been inactive for {{inactivity_redisclosure_minutes}} minutes or more.
3. Plain-language placement means the disclosure is the first textual content the user sees, in the same conversational surface as the chat itself, not in a settings page, privacy policy, or hover tooltip.

## Terms

- **Requirement:** Display the disclosure as the first content of every session and after {{inactivity_redisclosure_minutes}}-minute inactivity gaps.
- **Permission:** Compliance with the foregoing constitutes good-faith adherence to §13-72a-203 for purposes of any subsequent OAIP inquiry into {{product_name}}.

## Statute citations

- Utah Code §13-72a-203 — https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-disclosure

## Limitations

This interpretation applies only to {{product_name}} as described above. Material changes to product behavior, target population, or session model require a new interpretation. This agreement does not waive any other applicable Utah or federal requirement.

## Effective date and review

Effective on signature. Reviewed no later than {{review_date}}.
