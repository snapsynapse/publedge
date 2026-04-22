---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Template"
id: us-ut-tpl-jia-0002
slug: utah-mental-health-chatbot-data-protection
title: "Utah JIA Template — Mental-Health Chatbot Data Protection (§13-72a-201)"
kind: jia
jurisdiction: us-ut
fills:
  - "@type": "https://w3id.org/semanticarts/ns/ontology/gist/Agreement"
variables:
  - name: requesting_party_name
    description: "Legal name of the provider"
  - name: product_name
    description: "Marketed product name"
  - name: data_categories_collected
    description: "Categories of user-generated data the chatbot stores (e.g., conversation transcripts, mood logs, journal entries)"
  - name: retention_period
    description: "How long each category is retained (ISO-8601 duration or 'until user deletes')"
  - name: third_party_processors
    description: "Named third-party processors that receive any of the data, or 'none'"
  - name: model_training_use
    description: "Whether user data is used to train or fine-tune any model — 'no' or specific scope"
  - name: review_date
    description: "Date by which the parties will review the interpretation (YYYY-MM-DD)"
source: publedge-original-draft
status: draft
created: 2026-04-18
modified: 2026-04-18
---

# Joint Interpretation Agreement — Data Protection Scope

**Requesting party:** {{requesting_party_name}}
**Interpreting authority:** Utah Office of Artificial Intelligence Policy (OAIP)
**Statute at issue:** Utah Code §13-72a-201 (mental-health chatbot data protection)
**Product:** {{product_name}}

## Summary

The parties agree on what counts as protected mental-health chatbot data under §13-72a-201, how long {{requesting_party_name}} may retain that data, and the conditions under which it may be shared with processors or used in model training.

## Question presented

What categories of {{product_name}} user data are subject to §13-72a-201's protection requirements, and how do those requirements constrain retention, processor sharing, and model training?

## Interpretation

1. Protected data includes: {{data_categories_collected}}.
2. Retention is limited to {{retention_period}} for each category. Data must be deleted on user request without precondition.
3. Sharing with processors is limited to {{third_party_processors}}, each bound by a written processor agreement that flows down §13-72a-201 obligations.
4. Use of user data for model training: {{model_training_use}}.

## Terms

- **Restriction:** No retention of protected data beyond the periods specified above.
- **Restriction:** No sharing with processors not enumerated above without a new interpretation or written authority approval.
- **Requirement:** User-initiated deletion requests are honored within 30 days across all systems and processors.
- **Permission:** Use of de-identified, aggregated transcripts for service quality monitoring is permitted within the scope described above.

## Statute citations

- Utah Code §13-72a-201 — https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-data-protection

## Limitations

Applies only to {{product_name}} as currently configured. Adding new data categories, processors, or training uses requires a superseding interpretation.

## Effective date and review

Effective on signature. Reviewed no later than {{review_date}}.
