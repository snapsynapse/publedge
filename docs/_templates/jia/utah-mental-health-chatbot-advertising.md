---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Template"
id: us-ut-tpl-jia-0003
slug: utah-mental-health-chatbot-advertising
title: "Utah JIA Template — Mental-Health Chatbot Advertising and Representations (§13-72a-202)"
kind: jia
jurisdiction: us-ut
fills:
  - "@type": "https://w3id.org/semanticarts/ns/ontology/gist/Agreement"
variables:
  - name: requesting_party_name
    description: "Legal name of the provider"
  - name: product_name
    description: "Marketed product name"
  - name: marketing_channels
    description: "Channels in scope (app store listings, website, paid ads, in-app upsells, social media)"
  - name: claim_types_used
    description: "Categories of claims the provider makes about the product (e.g., supportive listening, coping skills, mood tracking)"
  - name: prohibited_claims_acknowledged
    description: "List of claims the provider acknowledges it will not make (e.g., diagnose, treat, replace clinician)"
  - name: review_date
    description: "Date by which the parties will review the interpretation (YYYY-MM-DD)"
source: publedge-original-draft
status: draft
created: 2026-04-18
modified: 2026-04-18
---

# Joint Interpretation Agreement — Advertising and Representations

**Requesting party:** {{requesting_party_name}}
**Interpreting authority:** Utah Office of Artificial Intelligence Policy (OAIP)
**Statute at issue:** Utah Code §13-72a-202 (prohibited representations)
**Product:** {{product_name}}
**Marketing channels in scope:** {{marketing_channels}}

## Summary

The parties agree on which categories of marketing claims about {{product_name}} fall within §13-72a-202's prohibition on misrepresenting an AI mental-health chatbot as a licensed clinician or as a substitute for clinical care, and what claim language remains permissible.

## Question presented

Which marketing claims about {{product_name}} cross the line from permissible feature description into prohibited misrepresentation under §13-72a-202?

## Interpretation

1. Permissible claim categories: {{claim_types_used}}, when each claim is qualified with language indicating the service is an AI chatbot, not a licensed clinician.
2. Prohibited claims that {{requesting_party_name}} agrees not to make: {{prohibited_claims_acknowledged}}.
3. Any claim using the words "diagnose," "treat," "therapy," or comparable clinical-practice language is presumptively prohibited unless qualified per (1) and submitted for separate review.
4. The same standard applies across every channel listed in {{marketing_channels}}, including third-party listings the provider controls or supplies copy for.

## Terms

- **Restriction:** No claim that {{product_name}} diagnoses, treats, or substitutes for licensed mental-health care.
- **Restriction:** No use of clinical-practice terminology without the qualifying language required above.
- **Requirement:** Marketing copy on all listed channels carries a visible "AI chatbot — not a licensed clinician" qualifier in the same view as any feature claim.
- **Permission:** Claims describing supportive features (listening, journaling prompts, mood tracking) are permitted when properly qualified.

## Statute citations

- Utah Code §13-72a-202 — https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-prohibited-representations

## Limitations

Applies to {{product_name}} as currently marketed. New product lines, materially new claim categories, or new channels not listed above require a superseding interpretation.

## Effective date and review

Effective on signature. Reviewed no later than {{review_date}}.
