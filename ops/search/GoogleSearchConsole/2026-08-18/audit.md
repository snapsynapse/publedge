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
- No provider report date or performance data range was available.
- Indexed and excluded counts, Page indexing reason groups, and representative category URLs were unknown because the report exposed no rows.

## Repository and production evidence

- The generated `docs/` artifact and full 160-URL sitemap inventory passed the repository search contract before deployment and submission.
- The deployed 160-URL sitemap inventory passed the production contract before console mutation.
- Exact validator command output was not retained in this sanitized dated record; the passes were recorded in the repository task evidence and living search document.

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

After deployment, the Search Console live test completed at 2026-08-18 21:11 local time and reported `3 valid items detected`. The indexed copy still showed the earlier three invalid items, which is expected until Google recrawls it.

The property-level Dataset report remained in `Processing data, please check again in a day or so` state. It exposed no issue row or `Validate fix` control, so issue-group validation could not be started.

## Evidence coverage and classification

| Surface | Observation | Classification |
|---|---|---|
| Homepage URL Inspection | Indexed and HTTPS-valid | Confirmed provider observation |
| Stored homepage Dataset items | Three invalid items from pre-repair markup | Defect in stale indexed copy; repaired in production |
| Homepage live Dataset test | Three valid items | Production fix confirmed live |
| Dataset aggregate report | Processing; no issue row or validation control | Provider-lagged; counts unknown |
| Page indexing counts and reason groups | No populated report rows | Unknown, not zero |
| Manual actions, security issues, Core Web Vitals, and other enhancements | Not captured in this dated observation | Unknown, not zero |
| Provider exports | None available | Absent |

No Dataset issue-group validation batch was active. The sitemap submission was accepted; the homepage recrawl attempt was rejected by quota and was not an active request.

## Sitemap processing

The sitemap index was accepted and processed successfully on 2026-08-18.

| Child sitemap | Status | Discovered URLs |
|---|---|---:|
| `sitemap-authorities.xml` | Success | 1 |
| `sitemap-bridges.xml` | Success | 65 |
| `sitemap-meta.xml` | Success | 62 |
| `sitemap-records.xml` | Success | 10 |
| `sitemap-reference.xml` | Success | 6 |
| `sitemap-templates.xml` | Success | 6 |
| `sitemap-statutes.xml` | Couldn't fetch | 0 reported; 10 URLs independently validated live |

The remaining child status is treated as provider processing latency, not a site defect. The full sitemap inventory passed the repository and production contracts before submission.

## Console action ledger

| Action and target | Accepted at | Confirmation | Result class | Repeat policy |
|---|---|---|---|---|
| Submit `https://publedge.org/sitemap.xml` | 2026-08-18 | Sitemap index processed successfully; six child sitemaps `Success`; 150 URLs discovered; statutes child pending fetch | Accepted and partially processed | Do not repeat while accepted |
| Live-test corrected Dataset markup | 2026-08-18 | Three valid items detected | Confirmed live | Do not repeat without a material change |
| Request recrawl of `https://publedge.org/` | Rejected 2026-08-18 | Daily quota exceeded | Rejected, not accepted | Do not retry the same day |
| Validate Dataset issue group | Not available 2026-08-18 | Report still processing; no issue row or validation control | Provider-lagged | Review when the report populates |

Provider processing latency is not classified as a site defect. Later observations must be added without replacing this dated baseline.

## Next review condition

Review after the statutes child refreshes, the Dataset or Page indexing report populates, or a later accepted homepage recrawl changes the stored indexed result. Do not resubmit the accepted sitemap index.
