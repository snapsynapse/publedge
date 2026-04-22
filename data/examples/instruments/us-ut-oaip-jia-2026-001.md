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
  ref: "https://commerce.utah.gov/ai/learning-lab/"
issuance_event: gist:Determination
enacted: 2026-04-15
effective: 2026-04-15
official_url: https://commerce.utah.gov/ai/learning-lab/
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
  - cite: "Utah SB0149 (2024)"
    url: "https://le.utah.gov/~2024/bills/static/SB0149.html"
publication_citations: []
terms:
  - "@type": "https://w3id.org/semanticarts/ns/ontology/gist/ContractTerm"
    text: "Provider must display the standardized GenAI disclosure on first session and on session resumption after 30 minutes of inactivity."
status: proposed
supersedes: null
superseded_by: null
withdrawn_date: null
withdrawal_reason: null
withdrawn_by_instrument: null
hash_chain_prev: null
disclaimer: ""
last_verified: 2026-04-19
schema: https://publedge.org/schema/instrument.schema.json
created: 2026-04-15
modified: 2026-04-19
---

## Timeline

| Milestone | Date | Notes |
|-----------|------|-------|
| Drafted | 2026-04-15 | Initial PubLedge draft, suggested prior art |
| Reviewed | TBD | Lawyer review pending |
| Published | TBD | Awaiting v0.1 release |

---

## First-Session Disclosure (§13-72a-203)

| Property | Value |
|----------|-------|
| Obligation | disclose-genai-on-first-session |
| Sections | Utah Code §13-72a-203 |
| Status | draft |
| Effective | 2026-04-15 |
| Verified | 2026-04-18 |
| Checked | 2026-04-18 |

### Requirements

| Requirement | Details |
|-------------|---------|
| Display disclosure | On first session, plainly identify the service as an AI chatbot |
| Re-display on resumption | After 30 minutes of inactivity, re-display the disclosure |

### Talking Point

> "A mental-health chatbot must tell the user it is an AI on first session and again after extended inactivity — not buried in a privacy policy."

### Sources

- [EveryAILaw — Mental Health Chatbot Disclosure](https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-disclosure)
- [Utah Code §13-72a-203](https://le.utah.gov/~2024/bills/static/SB0149.html)
