---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Agreement"
id: us-ut-oaip-jia-2026-001
instance: 2026-001
slug: utah-mental-health-chatbot-disclosure-2026q2
title: "Utah Mental Health Chatbot Disclosure — Joint Interpretation"
type: jia
source: publedge-original-draft
jurisdiction: us-ut
authority: utah-oaip
issued_by:
  "@type": "https://w3id.org/semanticarts/ns/ontology/gist/SubCountryGovernment"
  name: "Utah Office of Artificial Intelligence Policy (OAIP)"
  ref: "https://commerce.utah.gov/ai/"
official_url: https://commerce.utah.gov/ai/
obligation_kind: [requirement, permission]
reliance_scope: requesting-party-only
requesting_party: "PubLedge (illustrative — suggested prior art, not party-specific)"
interpreting_authority: "Utah Office of Artificial Intelligence Policy"
parties:
  - name: "PubLedge (illustrative requesting party)"
    role: requesting_party
  - name: "Utah OAIP"
    role: interpreting_authority
statute_anchors:
  - cite: "Utah Code §13-72a-203"
    url: "https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-disclosure"
  - cite: "Utah HB0452 (2025)"
    url: "https://le.utah.gov/~2025/bills/static/HB0452.html"
publication_citations: []
terms:
  - "@type": "https://w3id.org/semanticarts/ns/ontology/gist/ContractTerm"
    text: "Proposed interpretation: provider displays the standardized GenAI disclosure before first access and again on session resumption after 30 minutes of inactivity. The 30-minute re-display is a proposed term stricter than the statute's seven-day trigger, not a statutory requirement."
status: proposed
editorial_status: draft
supersedes: null
superseded_by: null
withdrawn_date: null
withdrawal_reason: null
withdrawn_by_instrument: null
hash_chain_prev: null
disclaimer: ""
last_verified: 2026-09-23
schema: https://publedge.org/schema/instrument.schema.json
created: 2026-04-15
modified: 2026-09-23
---

## Timeline

| Milestone | Date | Notes |
|-----------|------|-------|
| Drafted | 2026-04-15 | Initial PubLedge draft, suggested prior art |
| Reviewed | TBD | Lawyer review pending |
| Published | TBD | Not issued; remains a PubLedge draft pending lawyer review and authority sign-off |

---

## First-Session Disclosure (§13-72a-203)

| Property | Value |
|----------|-------|
| Obligation | disclose-genai-on-first-session |
| Sections | Utah Code §13-72a-203 |
| Status | draft |
| Drafted | 2026-04-15 |
| Verified | 2026-09-23 |
| Checked | 2026-09-23 |

### Requirements

| Requirement | Details |
|-------------|---------|
| Display disclosure (statute) | Clearly and conspicuously disclose that the chatbot is AI and not a human, before the user may access its features |
| Re-display after absence (statute) | Disclose again at the start of an interaction if the user hasn't accessed the chatbot within the previous seven days |
| Disclose on request (statute) | Disclose whenever the user asks or prompts the chatbot about whether AI is being used |
| Re-display on resumption (proposed JIA term) | After 30 minutes of inactivity, re-display the disclosure. Stricter than the statute; not a statutory requirement |

### Talking Point

> "A mental-health chatbot must tell the user it is an AI before first access, again after seven days away, and whenever asked. This draft proposes re-displaying it after 30 minutes of inactivity."

### Sources

- [EveryAILaw — Mental Health Chatbot Disclosure](https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-disclosure)
- [Utah Code §13-72a-203](https://le.utah.gov/xcode/Title13/Chapter72A/13-72a-S203.html), enacted by [Utah HB 452 (2025)](https://le.utah.gov/~2025/bills/static/HB0452.html)
