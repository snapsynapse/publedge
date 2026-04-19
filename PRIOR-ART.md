---
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Document"
title: "PubLedge Prior Art"
version: "0.1.0-pre"
license: "CC-BY-4.0"
created: 2026-04-18
modified: 2026-04-18
---

# PubLedge Prior Art

PubLedge is not a new idea. Governments and private bodies have been issuing fact-specific written interpretations for decades — they just have not been treated as a single class of artifact, version-controlled, hash-pinned, or made machine-readable through a shared ontology.

This document surveys the closest precedents PubLedge draws from, what each does well, and what gaps PubLedge is trying to fill. It is descriptive prior art, not a claim of novelty over any of these programs.

## Scope of survey

We focus on programs that share the PubLedge artifact shape: a written interpretation, jointly authored or formally issued, that constrains future behavior between identifiable parties on identified facts. We exclude:

- General regulatory guidance (regulation text itself, FAQs, preambles) — these are not party-specific.
- Adjudicated rulings (court opinions, administrative orders) — these are coercive, not interpretive.
- Compliance certifications (SOC 2, ISO 27001) — these attest to status, not interpretation.

## 1. Utah Regulatory Sandbox — Utah Code §63M-17

Utah operates a cross-domain regulatory sandbox under the Office of Regulatory Relief (ORR), and a parallel Office of AI Policy (OAIP) sandbox for AI-specific products. A participant proposes an innovation, identifies the rules it appears to conflict with, and the office negotiates a written agreement that mitigates the conflict for a defined term.

Two artifact types come out of this:

- **Joint Interpretation Agreement (JIA)** — a non-enforceable written reading of how an existing rule applies to the participant's facts. PubLedge models JIAs as `gist:Agreement`.
- **Regulatory Mitigation Agreement (RMA)** — an enforceable contract that conditions sandbox participation on specific safeguards. PubLedge models RMAs as `gist:Contract`.

What this does well:
- Two-party process with named participants.
- Fact-specific, not advisory in the abstract.
- Time-bound with a review trigger.
- Cross-domain by design (insurance, fintech, AI, professional licensing all run through the same office).

What is missing for third parties:
- No public registry of issued JIAs or RMAs in a stable, machine-readable form.
- No shared schema across agreements — each is a bespoke document.
- No statute-anchor links resolvable to a canonical source.
- No supersession trail when an agreement is replaced or amended.

PubLedge's first reference instances are Utah JIAs precisely because the program is the closest existing fit for the artifact shape and is run by an authority that has signaled openness to public publication of approved instruments.

## 2. SEC No-Action Letters

When an entity is uncertain whether contemplated conduct will trigger SEC enforcement, it can request a no-action letter from the relevant division (Corporation Finance, Investment Management, Trading and Markets, etc.). The division's response sets out the facts as represented, the rule at issue, and a statement of whether staff would recommend enforcement on those facts.

What this does well:
- Long-standing, well-understood format.
- Public archive on sec.gov organized by division and year.
- Explicit reliance language: third parties similarly situated may rely on the position.
- Clear scope limitation: the letter binds only on the facts presented.

What is missing:
- Publication is HTML or PDF on sec.gov with no consistent metadata — searchable by humans, opaque to agents.
- No structured frontmatter, no citation graph, no JSON view.
- No supersession links: when staff withdraws or modifies a position, the relationship to the original letter is narrative, not structural.
- No common ontology with adjacent programs (CFTC, FINRA, state securities regulators).

PubLedge's `obligation_kind` field (requirement / restriction / permission) maps directly onto how no-action letters function: a no-action position is effectively a `gist:Permission` for the requesting party, anchored to a `gist:Restriction` in the underlying rule.

## 3. IRS Private Letter Rulings (PLRs) and Revenue Rulings

A PLR is a written determination issued by the IRS Office of Chief Counsel in response to a taxpayer's specific request, applying the tax code to a transaction the taxpayer is contemplating or has completed. Revenue Rulings are broader, generalized interpretations the IRS publishes for taxpayer guidance.

What this does well:
- Mature program with formal request, fee, and review process.
- Public release of redacted PLRs through the Freedom of Information Act process.
- Numbered, indexed, and citable — `PLR-202504001` is a stable identifier.
- Distinguishes ruling from precedent: PLRs cannot be cited by other taxpayers as authority, but they signal the IRS's reasoning.

What is missing:
- Redaction process is slow and inconsistent.
- Released PLRs are PDF only — text is not reliably machine-readable.
- No structured connection between a PLR and the Internal Revenue Code sections it interprets.
- Third parties cannot rely on PLRs by design, which is a feature of the tax system but limits the registry's public utility.

PubLedge inherits the permanent-identifier discipline (`PL-PLR-NNNN` for IRS-style instruments in jurisdictions that adopt the pattern) and the explicit reliance-scope frontmatter field.

## 4. CFPB Advisory Opinion Program

The Consumer Financial Protection Bureau's Advisory Opinion Program issues written interpretations clarifying ambiguities in the consumer financial laws the bureau administers. Advisory opinions are published in the Federal Register and on consumerfinance.gov.

What this does well:
- Explicitly designed to provide regulatory clarity to good-faith actors.
- Published openly with versioned numbering.
- Tied to specific statutory or regulatory provisions in the response text.
- Distinguishes between advisory opinions (the bureau's interpretation) and compliance bulletins (statements of enforcement priority).

What is missing:
- Federal Register publication format is rich but not designed for cross-system citation.
- No structured frontmatter; the statutory anchors are narrative, not linked.
- No machine-readable index.
- Limited backwards reach: only opinions issued under the formal program are part of the registry.

PubLedge's `statute_anchors[]` field is closest in spirit to CFPB advisory opinion citations, with the critical difference that PubLedge requires a resolvable URL — preferring Every AI Law anchors where they exist.

## 5. Utah Court Forms Library

The Utah State Courts publish a library of standardized court forms — not interpretations themselves, but a directly comparable artifact: a state authority publishing structured documents that private parties rely on, with version history, official endorsement, and the explicit posture that the forms are starting points adaptable to specific facts.

What this does well:
- State-authority maintained, openly downloadable.
- Forms are categorized by procedural area.
- Each form carries a revision date and effective date.
- Cross-linked with statutory and rule references.

What is missing relative to PubLedge:
- Forms are HTML or PDF — no JSON view, no structured machine reading.
- No hash-pinned integrity layer.
- The forms are blank templates, not interpretations of how the form's provisions apply to a named party's facts.

The Utah Court Forms Library matters here as a model of *posture*: a state authority comfortable publishing canonical, adaptable, structured documents. PubLedge inherits the structured-and-adaptable spirit but applies it to interpretations rather than forms.

## 6. Ancillary precedents (briefly)

- **CFTC No-Action and Interpretive Letters** — same structure as SEC no-action letters, narrower domain. PubLedge schema applies without modification.
- **FINRA Regulatory Notices and Interpretive Letters** — self-regulatory organization analog; would map as `gist:Organization` rather than `gist:GovernmentOrganization` in the Authority role.
- **State Attorney General opinions** — formal, published, citable opinions issued at a requesting public official's request. Closer to advisory opinions than to JIAs because the requesting party is itself governmental.
- **UK FCA Regulatory Sandbox cohort agreements** — the closest international parallel to Utah's sandbox. Currently published only as case studies, not as machine-readable instruments.
- **HOA decision logs and co-op governance records** — the civic analog of regulatory interpretations. Same artifact shape (two parties, written, fact-specific, future-binding) at a different scale.

## Reference remaps

To show that the PubLedge schema is not Utah-specific — that the same frontmatter shape applies to existing federal-agency interpretive artifacts — three reference instruments have been retrofitted from publicly archived authority artifacts into PubLedge v0.2 frontmatter. These are demonstration remaps, not authority-issued PubLedge instruments; each carries `source: demonstration-remap` and a composed disclaimer directing readers to the official source for any reliance question.

| Remap | Source letter | Demonstrates |
|---|---|---|
| [SEC no-action letter](data/examples/instruments/sec-latham-watkins-rule-506c-2025.md) | Latham & Watkins re Rule 506(c) (2025-03-12) | `obligation_kind: [permission]`, `reliance_scope: similarly-situated-third-parties` |
| [CFPB advisory opinion](data/examples/instruments/cfpb-pay-to-pay-fees-2022.md) | Pay-to-Pay Fees, Regulation F (2022-06-29) | `obligation_kind: [restriction]`, `reliance_scope: public`, `requesting_party: null` |
| [IRS private letter ruling](data/examples/instruments/irs-plr-202506001.md) | PLR 202506001 re §141 management contracts (2025-02-07) | `reliance_scope: requesting-party-only`, `redaction_level: full`, PDF-only source |

Combined, the three remaps exercise every value of `obligation_kind` and `reliance_scope` and every release posture (HTML, PDF, redacted PDF) the schema anticipates.

## What PubLedge adds

PubLedge does not invent a new instrument class. It treats an existing class as a single, ontology-bound, version-controlled, machine-readable resource and provides:

1. A shared upper ontology (`gist`) so instruments from different authorities can be queried together.
2. A shared frontmatter schema so a JIA, an RMA, a no-action letter, and a PLR all expose the same core fields.
3. Hash-pinned integrity so any third-party copy can be verified against the publishing authority's canonical version.
4. A drafting-in-public posture so interpretations can be staged and discussed before authority sign-off, with the reliance disclaimer rendered prominently until that sign-off occurs.
5. A supersession discipline so the historical chain of interpretation is preserved and discoverable.

## See also

- [PROTOCOL.md](PROTOCOL.md) — the protocol specification this prior art motivates
- `_workshop/TAXONOMY.md` — site organization
- `_workshop/CONTENT-GUIDE.md` — per-content-type conventions
