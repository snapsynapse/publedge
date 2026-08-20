---
title: "Google Search Console follow-up"
property: "sc-domain:publedge.org"
observed: 2026-08-19
status: active
---
# Google Search Console follow-up

## Property and production gate

- Canonical origin: `https://publedge.org/`
- Search Console property: `sc-domain:publedge.org`
- The `resource_id` and visible property selector both matched `sc-domain:publedge.org` before console work.
- The production search contract passed all 160 sitemap pages with zero defects and zero infrastructure failures before console mutation.
- An earlier validator pass received one transient HTTP 503 for `favicon.svg`. A direct retry returned HTTP 200 with `image/svg+xml`, and the complete validator then passed.

## Sitemap processing

The accepted sitemap index remains processed successfully. Its displayed last-read date is August 18, 2026. The previously pending statutes child has now resolved without resubmission:

| Child sitemap | Status | Discovered URLs |
|---|---|---:|
| `sitemap-statutes.xml` | Success | 10 |

All seven child sitemaps are now successful. Together they account for the full 160-URL canonical HTML inventory.

## Reports

- The property-level Dataset report still says `Processing data, please check again in a day or so` and exposes no issue row or validation control.
- The Page indexing report also remains in the same processing state and exposes no category rows.
- These report counts are unknown, not zero.
- No console export was captured because neither report has populated rows.

## URL inspection and recrawl

The stored homepage inspection still reported:

- Page is indexed.
- Page is served over HTTPS.
- Three invalid Dataset items detected in Google's indexed copy.

Production remained correct, and Google's live test on August 18 had already detected all three Dataset items as valid. A single new indexing request was submitted at approximately 2026-08-19 19:37 MDT. Google confirmed `Indexing requested` and stated that the URL was added to a priority crawl queue.

The request is accepted and pending recrawl. It must not be repeated because Google explicitly states that multiple submissions do not change queue position or priority.

## Console action ledger

| Action and target | Accepted at | Confirmation | Result class | Repeat policy | Next review |
|---|---|---|---|---|---|
| Observe `https://publedge.org/sitemap-statutes.xml` | 2026-08-19 | `Success`; 10 discovered URLs | Completed | Do not resubmit | None |
| Start Dataset issue validation | Not available 2026-08-19 | Report still processing; no issue row or validation control | Provider-lagged | Do not invent or repeat an unavailable action | Review when report populates |
| Request recrawl of `https://publedge.org/` | 2026-08-19 19:37 MDT | `Indexing requested`; URL added to a priority crawl queue | Accepted and pending | Never repeat this request while pending | Review indexed Dataset state after recrawl |

Later observations must preserve the distinction between an accepted request, a completed recrawl, and populated aggregate reports.
