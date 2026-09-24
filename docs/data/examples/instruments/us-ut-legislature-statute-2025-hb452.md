---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Statute"
id: us-ut-legislature-statute-2025-hb452
instance: 2025-002
slug: utah-hb452-mental-health-chatbots
title: "Utah HB 452 (2025) — Artificial Intelligence Amendments (Mental Health Chatbots)"
type: statute
source: authoritative-reference
jurisdiction: us-ut
authority: utah-legislature
issued_by:
  "@type": "https://w3id.org/semanticarts/ns/ontology/gist/SubCountryGovernment"
  name: "Utah State Legislature"
  ref: "https://le.utah.gov/"
issuance_event: gist:Enactment
enacted: 2025-03-26
effective: 2025-05-07
official_url: https://le.utah.gov/~2025/bills/static/HB0452.html
obligation_kind: [requirement, restriction]
reliance_scope: public
statute_anchors:
  - cite: "Utah Code Title 13, Chapter 72a (Mental Health Chatbots)"
    url: "https://le.utah.gov/xcode/Title13/Chapter72a/13-72a.html"
  - cite: "Utah Code §13-72a-101 (definitions)"
    url: "https://le.utah.gov/xcode/Title13/Chapter72a/13-72a-S101.html"
  - cite: "Utah Code §13-72a-201 (data protection)"
    url: "https://le.utah.gov/xcode/Title13/Chapter72a/13-72a-S201.html"
  - cite: "Utah Code §13-72a-203 (disclosure)"
    url: "https://le.utah.gov/xcode/Title13/Chapter72a/13-72a-S203.html"
  - cite: "Utah Code §58-60-118 (mental health chatbot safety policy affirmative defense)"
    url: "https://le.utah.gov/xcode/Title58/Chapter60/58-60-S118.html"
publication_citations:
  - cite: "Utah HB 452 (2025 General Session)"
    url: "https://le.utah.gov/~2025/bills/static/HB0452.html"
full_text_reference: "https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-disclosure"
sponsors:
  - "Rep. Jefferson Moss (House sponsor)"
  - "Sen. Kirk A. Cullimore (Senate floor sponsor)"
status: enforcing
editorial_status: published
amends: us-ut-legislature-statute-2024-sb149
supersedes: null
superseded_by: null
hash_chain_prev: null
disclaimer: ""
last_verified: 2026-06-04
schema: https://publedge.org/schema/instrument.schema.json
created: 2026-04-21
modified: 2026-09-23
---

## Timeline

| Milestone | Date | Notes |
|-----------|------|-------|
| Introduced | 2025-02 | 2025 General Session (month unconfirmed: not in the enrolled copy) |
| Governor Signed | 2025-03-26 | Unconfirmed: not in the enrolled copy; bill status page not retained |
| Effective | 2025-05-07 | Chapter 72a stands up |

---

## Summary

HB 452 established Chapter 72a of the Utah Code, a statutory framework governing AI-powered mental health chatbots. The bill imposes disclosure, data protection, and advertising requirements on suppliers of such services and conditions a safety-policy affirmative defense. It amends §13-2-1 and enacts new sections; Chapter 72a cross-references the Chapter 72 definition of artificial intelligence (§13-72-101) but amends no section SB 149 enacted:

- **Pre-access + post-gap + on-prompt disclosure** (§13-72a-203). Disclosure must appear before user access, again at the start of any interaction following a 7-day gap, and any time the user asks whether AI is involved. Scripted-only outputs (meditations, mindfulness) and referral-to-human-therapist bots are carved out (§13-72a-101(10)(b)).
- **Data protection** (§13-72a-201). Suppliers may not sell or share identifiable health information or user input with third parties. Limited exceptions for information requested by a health care provider with the user's consent, or provided to the user's health plan at the user's request; third-party functional sharing requires HIPAA Parts 160+164 Subparts A/E compliance as if the supplier were a covered entity.
- **Advertising restrictions** (§13-72a-202). In-conversation advertising must be clearly and conspicuously identified as advertising, with any sponsorship, business affiliation, or promotion agreement disclosed; user input may not be used to decide whether to show an advertisement (other than for the chatbot itself), to choose what to advertise, or to customize how an advertisement is presented.
- **15-element safety policy** (§58-60-118). Suppliers who create, maintain, and implement a statutorily specified written policy, maintain documentation of foundation models, training data, privacy compliance, data practices, and accuracy and safety efforts (§58-60-118(2)(b)), file the policy with the Division of Consumer Protection, and comply with it at the time of alleged violation gain an affirmative defense against §58-1-501(1)-(2) unauthorized-practice actions — a sector-specific safe harbor via documented policy.

Penalties: $2,500 per violation (administrative or court), $5,000 per violation of an administrative or court order issued for a violation of the chapter.

### Talking Point

> "Utah HB 452 (2025) requires mental health chatbots to disclose AI use before access, after a seven-day gap, and on prompt, and provides a policy-based affirmative defense to specified unauthorized-practice actions."

### Sources

- [HB 452 Bill Text](https://le.utah.gov/~2025/bills/static/HB0452.html)
- [EveryAILaw — Mental Health Chatbot Disclosure](https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-disclosure)
- [EveryAILaw — Mental Health Chatbot Data Protection](https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-data-protection)
- [EveryAILaw — Mental Health Chatbot Safety Policy](https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-safety-policy)
