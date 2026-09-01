<!-- Upstream template: portfolio-search-indexing-audit bundle v5; repository contract v4 -->
---
title: "Search indexing"
purpose: "Property-specific index policy, validation commands, deployment gate, and console follow-up."
status: active
updated: 2026-08-20
owner: "PAICE.work PBC"
open_tasks: []
---
# Search indexing

Canonical origin: `https://publedge.org/`

Console property ID: `sc-domain:publedge.org`

Property mode: `website`

Generated output: `docs`

If deployment assembles a separate staging directory, this path must name that exact deployable artifact, not its source directory.

## Source and deployment boundary

- Maintained source lives in `data/`, `about/`, `reference/`, and the generators under `scripts/`.
- `npm run build` writes the public site and machine surfaces to the committed `docs/` tree. Generated HTML and discovery files under `docs/` are not source.
- GitHub Pages serves the `main` branch `/docs` directory at `https://publedge.org/`. The repository search contract therefore validates `docs` as the exact deployable artifact.
- Normal CI runs the canonical repository verification, including the offline search contract. The production validator is a post-deployment gate and is not ordinary pull-request CI.

## Index policy

| Surface | Policy | Reason |
|---|---|---|
| Canonical registry, record, authority, obligation, reference, template, and substantive bridge pages | Index and include in section sitemaps | Primary human-readable destinations |
| Legacy `/container/`, `/authority/`, `/applies-to/`, `/utah/`, moved filenames, and zero-overlap comparison pages | Redirect or `noindex`; omit from sitemaps | Compatibility aliases or non-substantive combinations |
| APIs, JSON-LD, schemas, feeds, calendar, robots, and agent surfaces | Crawlable machine surfaces, omit from sitemaps | Machine consumption or discovery, not canonical HTML |
| `/404.html` | `noindex` and omit from sitemaps | Error route, not a content destination |

PubLedge currently publishes English-language canonical pages only. Generated and hand-authored HTML declares `lang="en"`; no translated route family or `hreflang` contract exists, so a multilingual indexing policy is not applicable. Any future translated route family requires an explicit canonical and `hreflang` policy before publication.

## Validation lanes

- Offline: `node scripts/check-search.mjs`
- Production after deployment: `node scripts/check-production-search.mjs`
- Machine-readable output: add `--json`
- Local HTTP test: add `--base=http://127.0.0.1:8765/` after starting the static server on port 8765

Exit code `0` is pass, `1` is a site defect, and `2` is configuration or infrastructure failure.

For a creator-profile or external-platform property, replace the website validation lanes with the reports and controls the property actually exposes. Do not invent repository, production, sitemap, or indexing work.

## Evidence governance

- Store concise, sanitized observations at `ops/search/<provider>/YYYY-MM-DD/audit.md`. Preserve each dated observation; record later provider state in a new dated file rather than rewriting history.
- Repository truth, production truth, and provider observation are separate lanes. A provider report cannot override a repository or production contradiction, and console mutation is gated on passing production evidence.
- Record provider report dates, data ranges, visible confirmations, action acceptance times, and next-review conditions when observed. A click alone is not proof that an action was accepted.
- Treat missing, stale, insufficient, unknown, and zero as different states. Do not convert an unpopulated report into a zero count.
- Keep raw exports, account identity, private queries, authenticated URLs, screenshots, traces, cookies, profiles, and browser state outside Git. Local raw evidence may exist only under ignored `.search-evidence-private/` or outside the repository. `.playwright-mcp/` is also ignored.
- Never place private evidence under `docs/`, which is the public deployment directory.

## Deployment and console sequence

1. Run the normal build and offline search contract.
2. If deployment copies or transforms output, stage the exact deployable artifact with the same builder used by release automation.
3. Ensure repository-wide checks include newly scaffolded files, including checks based on `git ls-files`.
4. Deploy through the repository's normal release path.
5. Wait for the deployment to complete.
6. Run the production search contract.
7. Confirm the deployed sitemap URL set matches the repository sitemap.
8. Refresh a materially changed stale sitemap at most once, using its full canonical URL for a domain property.
9. Inspect or request indexing for canonical HTML pages.
10. Start issue-group validation only when matching production behavior is live.
11. Record console state under `ops/search/<provider>/YYYY-MM-DD/`.

## Expected noise

- HTTP and `www` variants redirect to the canonical bare HTTPS origin.
- Legacy and marketing aliases are retained as `noindex` redirect stubs.
- Comparison pages with no shared obligations are intentionally `noindex`; substantive comparisons are linked from `/compare.html`.
- Machine-readable endpoints remain crawlable and are intentionally absent from the HTML sitemap inventory.

## Current baseline

Initial evidence: [Google Search Console audit, 2026-08-18](search/GoogleSearchConsole/2026-08-18/audit.md).

Latest follow-up: [Google Search Console follow-up, 2026-08-19](search/GoogleSearchConsole/2026-08-19/audit.md).

At the initial console inspection, the property was processing data and had no submitted sitemap. The homepage URL inspection reported indexed and HTTPS-valid. Search appearance detected three invalid Dataset items on the homepage because each lacked a description; license and creator were also recommended.

After deployment, Google's live test detected all three Dataset items as valid. The sitemap index processed successfully; six child sitemaps reported `Success` with 150 discovered URLs, while the 10-URL statutes child remained in transient `Couldn't fetch` state despite passing independent production validation. The property-level Dataset report is still processing and exposes no issue row or validation control.

On 2026-08-19, the statutes child resolved to `Success` with 10 discovered URLs without resubmission. All seven child sitemaps now account for the full 160-URL inventory. The Dataset and Page indexing reports remain provider-lagged and have no populated rows. Because Google's indexed homepage copy still reported the three repaired Dataset errors, one recrawl request was submitted and accepted into the priority crawl queue. Do not repeat it while pending.

## Current classified state

| Surface | State | Classification |
|---|---|---|
| Repository and generated artifact | 2026-08-20 offline contract passed all 160 sitemap pages with zero defects and zero infrastructure failures | No known defect |
| Production | 2026-08-19 production contract passed all 160 sitemap pages with zero defects and zero infrastructure failures | No known defect |
| Sitemap processing | Sitemap index and all seven children succeeded, covering 160 discovered canonical HTML URLs | Completed provider processing |
| Homepage Dataset markup | Live test found three valid items; Google's stored indexed copy still showed the pre-repair errors | Pending recrawl |
| Homepage recrawl request | Accepted 2026-08-19 at 19:37 MDT into the priority crawl queue | Accepted and pending |
| Dataset report | Still processing with no issue row or validation control | Provider-lagged; counts unknown |
| Page indexing report | Still processing with no category rows | Provider-lagged; indexed and excluded counts unknown |
| Dataset issue-group validation | No batch could be started because the control was unavailable | No active validation batch |
| Manual actions, security issues, Core Web Vitals, and other enhancements | Not captured in the sanitized dated evidence | Unknown, not zero |

## Console action ledger

Read this table before opening the console. Add only observed actions and confirmations. An accepted request remains pending until a later report proves completion.

| Provider and property | Action and target | Accepted at | Confirmation | Result class | Repeat policy | Next review |
|---|---|---|---|---|---|---|
| Google Search Console, `sc-domain:publedge.org` | Submit `https://publedge.org/sitemap.xml` | 2026-08-18 | Sitemap index processed successfully; six child sitemaps `Success`; 150 URLs discovered; statutes child pending fetch | Accepted and partially processed | Do not repeat while accepted | Review statutes child after provider refresh |
| Google Search Console, `sc-domain:publedge.org` | Live-test homepage Dataset markup | 2026-08-18 | Three valid items detected | Confirmed live | Do not repeat without a material change | Review indexed report after recrawl |
| Google Search Console, `sc-domain:publedge.org` | Request recrawl of `https://publedge.org/` | Rejected 2026-08-18 | Daily quota exceeded | Rejected, not accepted | Do not retry the same day | Retry once after quota resets if the indexed copy is still stale |
| Google Search Console, `sc-domain:publedge.org` | Start Dataset issue validation | Not available 2026-08-18 | Report still processing; no issue row or validation control | Provider-lagged | Do not invent or repeat an unavailable action | Review when report populates |
| Google Search Console, `sc-domain:publedge.org` | Observe `https://publedge.org/sitemap-statutes.xml` | 2026-08-19 | `Success`; 10 discovered URLs | Completed | Do not resubmit | None |
| Google Search Console, `sc-domain:publedge.org` | Request recrawl of `https://publedge.org/` | 2026-08-19 19:37 MDT | `Indexing requested`; URL added to a priority crawl queue | Accepted and pending | Never repeat while pending | Review indexed Dataset state after recrawl |
| Google Search Console, `sc-domain:publedge.org` | Start Dataset issue validation | Not available 2026-08-19 | Report still processing; no issue row or validation control | Provider-lagged | Do not invent or repeat an unavailable action | Review when report populates |

Keep rejected attempts and unknown outcomes distinct from accepted actions. Do not repeat an accepted action merely because the provider report remains stale.

## Do-not-repeat list

- Do not resubmit `https://publedge.org/sitemap.xml`; its accepted submission and all seven child results are recorded.
- Do not repeat the accepted homepage indexing request while it remains pending.
- Do not repeat the homepage live test without a material markup or deployment change.
- Do not attempt Dataset issue validation until the provider exposes an issue row and validation control. No Dataset validation batch is active.
- Do not infer completion of the recrawl or Dataset repair from the accepted request.

## Next review conditions

Review the property only when at least one of these occurs:

- Google refreshes the stored homepage inspection after the accepted 2026-08-19 recrawl request.
- The Dataset or Page indexing report populates, exposing a report date, counts, categories, or a validation control.
- A material sitemap or structured-data deployment occurs.
- A repository or production search gate reports a contradiction.

No GSC export was available in either dated observation. Indexed and excluded counts, representative Page indexing reason groups, manual-actions state, security-issues state, Core Web Vitals state, and non-Dataset enhancement state remain absent from the sanitized evidence and therefore unknown.
