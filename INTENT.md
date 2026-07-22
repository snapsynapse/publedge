# PubLedge Intent

## Scope

This file governs strategy for the PubLedge repository. Cross-portfolio strategy remains authoritative in the PAICE Foundation INTENT. Schema semantics remain authoritative in Obligation First.

## Current disposition

PubLedge is the thin recordkeeping convention of the PAICE legal graph. It defines how civic, legal, and regulatory publication records are structured, named, linked, and exposed to agents.

PubLedge does not compete with established timestamp or provenance infrastructure. SHA-256 and the current manifest provide file-to-manifest consistency. Independent publication-time evidence, when required, should be delegated to established mechanisms such as RFC 3161 or OpenTimestamps and represented as pluggable evidence.

Standalone product ambitions are parked. The repository remains public and maintained, and its stable MCP server remains supported, but new product investment requires a concrete demand signal.

## Active work

- Routine security, dependency, accessibility, build, and registry maintenance.
- Accurate maintenance of existing demonstration remaps.
- Obligation-First naming-profile and schema compatibility.
- Legal-graph integration work required by an active downstream consumer.
- Corrections and authority responses that improve record fidelity.

## Parked work

- Browser-side registry and comparison product development.
- Broad new-jurisdiction or full-corpus ingestion.
- Branch-and-strip into a reusable standalone protocol product.
- Dedicated promotional campaign.
- New cryptographic or timestamp infrastructure.

## Revisit triggers

Reconsider parked work only when at least one of these occurs:

- A Legal Graph licensing conversation surfaces a concrete recordkeeping requirement.
- AI Incident Law needs PubLedge publication metadata in production code.
- A regulator, court, or civic body signals interest in machine-verifiable publication records.
- A real adopter requests a reusable protocol distribution or additional jurisdiction coverage.

## Decision history

- 2026-06-09: Repositioned PubLedge as a convention atop established timestamp infrastructure and parked standalone ambitions.
- 2026-07-21: Promoted that disposition into the repository's authoritative intent and aligned maintenance priorities around it.
