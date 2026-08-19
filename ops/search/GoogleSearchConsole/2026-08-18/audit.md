---
title: "Google Search Console audit"
property: "sc-domain:publedge.org"
observed: 2026-08-18
status: active
---
# Google Search Console audit

## Property identity

- Canonical origin: `https://publedge.org/`
- Search Console property: `sc-domain:publedge.org`
- Repository and production identity matched before console work.

## Initial report state

- Overview and indexing reports were still processing data for the newly added property.
- The Sitemaps report contained no submitted sitemap.
- No report export was available because the provider had not populated report rows.

## URL inspection

| URL | Indexing state | HTTPS | Action |
|---|---|---|---|
| `https://publedge.org/` | URL is on Google | Valid | No indexing request submitted |

## Search appearance

The homepage exposed three invalid `Dataset` items:

| Dataset | Critical issue | Recommended fields |
|---|---|---|
| Legal Instruments | Missing `description` | `license`, `creator` |
| Obligations | Missing `description` | `license`, `creator` |
| Coverage Matrix | Missing `description` | `license`, `creator` |

The authoritative generator was repaired to emit all three fields for every Dataset. Validation must start only after that output is deployed.

## Console action ledger

| Action and target | Accepted at | Confirmation | Result class | Repeat policy |
|---|---|---|---|---|
| Submit `https://publedge.org/sitemap.xml` | Pending production gate | Not yet submitted | Pending | Submit once after production validation passes |
| Validate Dataset issue group | Pending production gate | Not yet started | Pending | Start once after corrected JSON-LD is live |

Provider processing latency is not classified as a site defect. Later observations must be added without replacing this dated baseline.
