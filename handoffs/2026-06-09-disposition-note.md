# Disposition note: PubLedge — reposition as convention, park standalone ambitions

Date: 2026-06-09
Author: Claude (Fable 5) session with Sam, from portfolio competitive review 2026-06-09
Status: Disposition decided with Sam. This is a record, not a work order. Revisit after Legal Graph handoffs execute (see every-ai-law and ai-incident-law handoffs dated 2026-06-09).

## Competitive finding (verified 2026-06-09)

Verifiable publication-record infrastructure is mature and crowded: RFC 3161 trusted timestamping (2001, PKI-grade, eIDAS-recognized), OpenTimestamps (Bitcoin-anchored, free), C2PA (content provenance manifests, major-vendor backing), OriginStamp and similar commercial services. Competing with these as infrastructure is not viable and not necessary.

## Disposition

1. **Do not compete with timestamping infrastructure.** PubLedge's value is not proving when bytes existed; incumbents do that better and free.
2. **Reposition as the thin convention atop them**: how a civic/legal/regulatory publisher structures, names, and links publication records so they are agent-readable and graph-joinable — with timestamp proof delegated to OpenTimestamps/RFC 3161 as pluggable evidence, not reimplemented.
3. **Primary identity is the recordkeeping layer of the PAICE Legal Graph** (Obligation First → EveryAILaw/Pro → PubLedge → AI Incident Law). AI Incident Law's case records rest on public documents; the design sketch for carrying PubLedge-style verifiable publication metadata on those citations is queued in ai-incident-law/handoffs/2026-06-09-legal-graph-integration-handoff.md Phase 2.4 (design-only until PubLedge direction is set — which is this note).
4. **Park standalone product ambitions.** No dedicated push until Legal Graph integration work creates concrete demand for the recordkeeping layer.

## What stays live

- OF naming-profile publication for this repo (open task from the 2026-06-03 Obligation-First v0.4.0 handoff: publedge + ai-incident-law profiles still pending). That work proceeds regardless of the park; it is graph plumbing, not product investment.
- Routine maintenance, hygiene, existing demonstration remaps.

## Revisit triggers

- Legal Graph licensing conversations surface a recordkeeping requirement from a real counterparty.
- AI Incident Law Phase 2.4 design wants to become code.
- A regulator or court signals interest in machine-verifiable publication records for AI-related filings.
