# publedge source-link check

Generated 2026-10-03T18:55:42.770552+00:00. Status: **partial** until all HTTP and identity checks pass.

Coverage: expected **61** records, actual **61** records; **143** source-link occurrences, **98** unique URLs. Records without their own external links remain explicitly covered.

| Outcome | Link occurrences |
|---|---:|
| BLOCKED | 65 |
| HTTP-FAILURE | 11 |
| NEEDS-HUMAN | 62 |
| PASS | 5 |

Every intended record and URL, including failed/blocked sources, is retained in [link-ledger.json](link-ledger.json); body, receipt, sha256, attempts, redirects and extraction paths are included there.

## Environment blocker

The initial environment blocked source-host tunnels with proxy CONNECT403. After the hostallowlist was applied, the corpus was resumed once under the same TLS, robots and request-budget controls. Current failures may instead be origin/proxy HTTP errors, upstream certificate-verification errors, robots exclusions or source-specific challenges; each result is distinguished in its receipt. Prior committed bytes/receipts are retained and each ledger row links its previous result. No failed fetch establishes unchanged text or no-new-docket status.

## Findings

### us-cfpb-ao-2022-001 — CFPB Advisory Opinion — Pay-to-Pay Fees (Regulation F)

Source: `data/examples/instruments/us-cfpb-ao-2022-001.md`. {"NEEDS-HUMAN": 4}
- ref: [https://www.consumerfinance.gov/](https://www.consumerfinance.gov/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/3f757d4cb33088c13ff3afbd.json`; sha256 `f6ccbc69b7824f83fca9c8513e51b97b43249e260a6b573b0a31e7faff78876a`.
- body-source: [https://www.consumerfinance.gov/rules-policy/final-rules/advisory-opinion-on-debt-collectors-collection-of-pay-to-pay-fees/](https://www.consumerfinance.gov/rules-policy/final-rules/advisory-opinion-on-debt-collectors-collection-of-pay-to-pay-fees/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/d6e4c8164e56ccfdd4446202.json`; sha256 `76f8533dd31b1041976bc3d494dbfcea3fe92bb373631facfc32e387faffbfd2`.
- body-source: [https://www.law.cornell.edu/uscode/text/15/1692f](https://www.law.cornell.edu/uscode/text/15/1692f) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/359eff89d6d294285db84cde.json`; sha256 `329ac74e997ee8262e806059e8b19daae2d326a84569603af236cb714d39cb55`.
- body-source: [https://www.ecfr.gov/current/title-12/chapter-X/part-1006/subpart-B/section-1006.22](https://www.ecfr.gov/current/title-12/chapter-X/part-1006/subpart-B/section-1006.22) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/24dbee7900490ccb0a9a00c1.json`; sha256 `0d29097dc12a37446b3fa70daec81a5cb7c6ed6d14517d4cc3331ea108520b8a`.

### us-cftc-dsio-il-2017-001 — CFTC Letter 17-65 — CTA Registration Exemption Survives MiFID II Fee Unbundling

Source: `data/examples/instruments/us-cftc-dsio-il-2017-001.md`. {"NEEDS-HUMAN": 5}
- body-source: [https://cftc.gov/LawRegulation/CFTCStaffLetters/index.htm](https://cftc.gov/LawRegulation/CFTCStaffLetters/index.htm) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/f3ace698dd4f1fb46c081689.json`; sha256 `623af5757a065b2b0c95870c0b97ed7e6561412648e2d7dfa40bd49cb6bf9c0e`. Redirects: [{"from": "https://cftc.gov/LawRegulation/CFTCStaffLetters/index.htm", "to": "https://www.cftc.gov/LawRegulation/CFTCStaffLetters/index.htm", "status": 301}]
- body-source: [https://cftc.gov/csl/17-65/download](https://cftc.gov/csl/17-65/download) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/57e003049cad9a14f9c52255.json`; sha256 `fbdc793d5aa48227eeafbed936790af1313902cc8c36675fa6fdf26793c60b50`. Redirects: [{"from": "https://cftc.gov/csl/17-65/download", "to": "https://www.cftc.gov/csl/17-65/download", "status": 301}]
- body-source: [https://www.law.cornell.edu/uscode/text/7/1a](https://www.law.cornell.edu/uscode/text/7/1a) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/ca8c64435bc57c7a2547cf72.json`; sha256 `89f8c3802aa3fe23de381fa65fd611638787b95e7990371c125f710caeae6d9f`.
- body-source: [https://www.ecfr.gov/current/title-17/chapter-I/part-4/section-4.6](https://www.ecfr.gov/current/title-17/chapter-I/part-4/section-4.6) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/9ad20e5c2c657b6fa282f853.json`; sha256 `d5faf69113e755339e6f37fc29a44f57fa16653c182a3401021690a7432ff89f`. Redirects: [{"from": "https://www.ecfr.gov/current/title-17/chapter-I/part-4/section-4.6", "to": "https://www.ecfr.gov/current/title-17/chapter-I/part-4/subpart-A/section-4.6", "status": 302}]
- body-source: [https://www.ecfr.gov/current/title-17/chapter-I/part-4/section-4.14](https://www.ecfr.gov/current/title-17/chapter-I/part-4/section-4.14) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/71858675cb628ed6354365e2.json`; sha256 `f72eff1152ec8ae4a4b71ea1ad7d6569cb5fbd01fad741255e8538ef41a474ee`. Redirects: [{"from": "https://www.ecfr.gov/current/title-17/chapter-I/part-4/section-4.14", "to": "https://www.ecfr.gov/current/title-17/chapter-I/part-4/subpart-A/section-4.14", "status": 302}]

### us-co-legislature-statute-2024-sb24-205 — Colorado SB 24-205 (2024) — Consumer Protections for Interactions with Artificial Intelligence Systems

Source: `data/examples/instruments/us-co-legislature-statute-2024-sb24-205.md`. {"NEEDS-HUMAN": 4, "HTTP-FAILURE": 1, "BLOCKED": 1, "PASS": 1}
- describesSameEntityAs: [https://everyailaw.com/instrument/colorado-sb24-205.json](https://everyailaw.com/instrument/colorado-sb24-205.json) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/d3c64edc2c27f810a0c40c2f.json`; sha256 `279d457a17c044ce909af1e7bfafe486df9e0002aa08257a013283c978843550`.
- ref: [https://leg.colorado.gov/](https://leg.colorado.gov/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/3a12934708b2b8c2b194a3fa.json`; sha256 `e5bf9af5c11e9efe4b59392ba660b58aa9addb9892532bb9125e4774de8e9978`.
- body-source: [https://leg.colorado.gov/bills/sb24-205](https://leg.colorado.gov/bills/sb24-205) — **HTTP-FAILURE**, HTTP 406, HTTP 406. Receipt: `_codex-out/sources/links/resume-20261003/886f3fed50ae776d583b7ddb.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://leg.colorado.gov/sites/default/files/2024a_205_signed.pdf](https://leg.colorado.gov/sites/default/files/2024a_205_signed.pdf) — **BLOCKED**, HTTP 301, Environment anonymous proxy CONNECT denied HTTP 403 while fetching robots.txt; origin HTTP status unknown. Source retrieval not authorized because robots policy unknown. Earlier direct DNS route failures, where present, are preserved.. Receipt: `_codex-out/sources/links/resume-20261003/ec24f393b852fc90d3391d48.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Redirects: [{"from": "https://leg.colorado.gov/sites/default/files/2024a_205_signed.pdf", "to": "https://content.leg.colorado.gov/sites/default/files/2024a_205_signed.pdf", "status": 301}]
- body-source: [https://everyailaw.com/regulation/colorado-sb24-205/](https://everyailaw.com/regulation/colorado-sb24-205/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/2a787ec1af1dfbc500cb2812.json`; sha256 `6366559044c6b6894ae16b69eb06b66e029626eb4ae468bcb8a998a97cac33e1`.
- body-source: [https://storage.courtlistener.com/recap/gov.uscourts.cod.253513/gov.uscourts.cod.253513.24.0.pdf](https://storage.courtlistener.com/recap/gov.uscourts.cod.253513/gov.uscourts.cod.253513.24.0.pdf) — **PASS**, HTTP 200, HTTP 200; normalized text identical to URL-associated retained snapshot. Receipt: `_codex-out/sources/links/resume-20261003/99205956bb0a3eddfcc8b4b1.json`; sha256 `59fc68432753abc356065683a23379d0378fbecb811ec30105ca7d28a293587d`.
- body-source: [https://everyailaw.com/regulation/colorado-sb26-189/](https://everyailaw.com/regulation/colorado-sb26-189/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/58715e172f5a5e3f5462c6d3.json`; sha256 `d9187142e5445411a07246645af2b6d36ee133f99020ea7aa93a66b013326fa2`.

### us-co-legislature-statute-2025-sb25b-004 — Colorado SB 25B-004 (2025) — Increase Transparency for Algorithmic Systems (Colorado AI Act Effective-Date Delay)

Source: `data/examples/instruments/us-co-legislature-statute-2025-sb25b-004.md`. {"NEEDS-HUMAN": 3, "HTTP-FAILURE": 1}
- ref: [https://leg.colorado.gov/](https://leg.colorado.gov/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/3a12934708b2b8c2b194a3fa.json`; sha256 `e5bf9af5c11e9efe4b59392ba660b58aa9addb9892532bb9125e4774de8e9978`.
- body-source: [https://leg.colorado.gov/bills/sb25b-004](https://leg.colorado.gov/bills/sb25b-004) — **HTTP-FAILURE**, HTTP 406, HTTP 406. Receipt: `_codex-out/sources/links/resume-20261003/e11ed730484e3c2849fe74dc.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://everyailaw.com/regulation/colorado-sb24-205/](https://everyailaw.com/regulation/colorado-sb24-205/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/2a787ec1af1dfbc500cb2812.json`; sha256 `6366559044c6b6894ae16b69eb06b66e029626eb4ae468bcb8a998a97cac33e1`.
- body-source: [https://www.gtlaw.com/en/insights/2025/9/colorado-delays-comprehensive-ai-law-with-further-changes-anticipated](https://www.gtlaw.com/en/insights/2025/9/colorado-delays-comprehensive-ai-law-with-further-changes-anticipated) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/a2ab12d7fd3306f8e9a5681e.json`; sha256 `8e634f454ecf277fcdcc948f3e4f26f2b603ed2058d1b986b872e69d12eece1d`.

### us-co-legislature-statute-2026-sb26-189 — Colorado SB 26-189 (2026) — Automated Decision-Making Technology (ADMT) Act

Source: `data/examples/instruments/us-co-legislature-statute-2026-sb26-189.md`. {"NEEDS-HUMAN": 5, "HTTP-FAILURE": 1}
- describesSameEntityAs: [https://everyailaw.com/instrument/colorado-sb26-189.json](https://everyailaw.com/instrument/colorado-sb26-189.json) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/53049ca501608964826f846a.json`; sha256 `91611c392a7257b0ed01b73356ad0ff0ffe77475ed807cd61abc0c2e86921cac`.
- ref: [https://leg.colorado.gov/](https://leg.colorado.gov/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/3a12934708b2b8c2b194a3fa.json`; sha256 `e5bf9af5c11e9efe4b59392ba660b58aa9addb9892532bb9125e4774de8e9978`.
- body-source: [https://leg.colorado.gov/bills/sb26-189](https://leg.colorado.gov/bills/sb26-189) — **HTTP-FAILURE**, HTTP 406, HTTP 406. Receipt: `_codex-out/sources/links/resume-20261003/5dd2534f0624170b87bd3e00.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://everyailaw.com/regulation/colorado-sb26-189/](https://everyailaw.com/regulation/colorado-sb26-189/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/58715e172f5a5e3f5462c6d3.json`; sha256 `d9187142e5445411a07246645af2b6d36ee133f99020ea7aa93a66b013326fa2`.
- body-source: [https://everyailaw.com/regulation/colorado-sb24-205/](https://everyailaw.com/regulation/colorado-sb24-205/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/2a787ec1af1dfbc500cb2812.json`; sha256 `6366559044c6b6894ae16b69eb06b66e029626eb4ae468bcb8a998a97cac33e1`.
- body-source: [https://paice.work/blog/modeling-colorado-ai-act-obligationfirst](https://paice.work/blog/modeling-colorado-ai-act-obligationfirst) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/46224355be1a6b4226eec173.json`; sha256 `f0ed10ced982448467725cab84b1a15b3c68a4238421a45ebe5ac2e1af208d90`.

### us-irs-chief-counsel-plr-2025-001 — IRS Private Letter Ruling 202506001 — Management Contract Private Business Use (§141)

Source: `data/examples/instruments/us-irs-chief-counsel-plr-2025-001.md`. {"HTTP-FAILURE": 1, "NEEDS-HUMAN": 3}
- body-source: [https://www.irs.gov/privacy-disclosure/written-determinations](https://www.irs.gov/privacy-disclosure/written-determinations) — **HTTP-FAILURE**, HTTP 404, HTTP 404. Receipt: `_codex-out/sources/links/resume-20261003/85ba14a4ab19cdca14eac83b.json`; sha256 `f10566c170a8f0c3ec0af6573efc346f8a377cd7af3a1358defdeeec0782f157`.
- body-source: [https://www.irs.gov/pub/irs-wd/202506001.pdf](https://www.irs.gov/pub/irs-wd/202506001.pdf) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/b6e9f104143c194a936f91fe.json`; sha256 `47c333dc5aa2f2f7a8f1f6cb708104189b0c500ad776233f95a08a4c999fad7d`.
- body-source: [https://www.law.cornell.edu/uscode/text/26/141](https://www.law.cornell.edu/uscode/text/26/141) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/d2f2e71e82266cb444509100.json`; sha256 `a55389be50a8dfd03c781837e1fa2616bcb21d47188818933dfbc937b0eb24b4`.
- body-source: [https://www.irs.gov/pub/irs-drop/rp-17-13.pdf](https://www.irs.gov/pub/irs-drop/rp-17-13.pdf) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/38b42e3e8538872099e0dbc5.json`; sha256 `9478da9fdd60e731ed821d383579c4392e0b954bebbd0c427dc56159b7ba0aa7`.

### us-irs-tege-plr-2026-001 — IRS PLR 202614036 — Adverse Determination: §501(c)(3) Exemption Denied, Mixed-Use Facility

Source: `data/examples/instruments/us-irs-tege-plr-2026-001.md`. {"HTTP-FAILURE": 2, "NEEDS-HUMAN": 6}
- body-source: [https://irs.gov/privacy-disclosure/written-determinations](https://irs.gov/privacy-disclosure/written-determinations) — **HTTP-FAILURE**, HTTP 404, HTTP 404. Receipt: `_codex-out/sources/links/resume-20261003/7004f1b3ca646aec9b6cd641.json`; sha256 `f10566c170a8f0c3ec0af6573efc346f8a377cd7af3a1358defdeeec0782f157`. Redirects: [{"from": "https://irs.gov/privacy-disclosure/written-determinations", "to": "https://www.irs.gov/privacy-disclosure/written-determinations", "status": 301}]
- body-source: [https://irs.gov/pub/irs-wd/202614036.pdf](https://irs.gov/pub/irs-wd/202614036.pdf) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/814bcc8fdbbc6509119f02d3.json`; sha256 `b968aefaaff0681be5d597295a96aa86e9d672759808fe0f9ec409763e5b44d6`. Redirects: [{"from": "https://irs.gov/pub/irs-wd/202614036.pdf", "to": "https://www.irs.gov/pub/irs-wd/202614036.pdf", "status": 301}]
- body-source: [https://www.law.cornell.edu/uscode/text/26/501](https://www.law.cornell.edu/uscode/text/26/501) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/30263b01936c132d33f4a3c7.json`; sha256 `60eec45ac4a1c9e706d0544940baf0e47e230d521ef4c23e4cd664b317aa8a64`.
- body-source: [https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/section-1.501(c)(3)-1](https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/section-1.501(c)(3)-1) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/96c2004d11adbea22032a4a0.json`; sha256 `25f05d4e472367e0e37d48099acf3b4997f0b36276c1d76e42b345900340f5ab`. Redirects: [{"from": "https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/section-1.501(c)(3)-1", "to": "https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/subject-group-ECFR062882ac6495890/section-1.501(c)(3)-1", "status": 302}]
- body-source: [https://www.law.cornell.edu/uscode/text/26/170](https://www.law.cornell.edu/uscode/text/26/170) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/6abe32c645343c68f7b8bb84.json`; sha256 `8e20ca983673b500ff3ee40053c6b8515718f1c56142bd8e2c198e6107b0a191`.
- body-source: [https://www.irs.gov/pub/irs-tege/rr74-587.pdf](https://www.irs.gov/pub/irs-tege/rr74-587.pdf) — **HTTP-FAILURE**, HTTP 404, HTTP 404. Receipt: `_codex-out/sources/links/resume-20261003/af6c7727dc4656d7fbf445ba.json`; sha256 `37a68c12f7d47799501caa9999e904ec1bb7d7fc866f1665486c7e133b8d5a64`.
- body-source: [https://www.irs.gov/pub/irs-tege/rr76-419.pdf](https://www.irs.gov/pub/irs-tege/rr76-419.pdf) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/40db8a71c4364296754e4d67.json`; sha256 `e38e0cebd5d1b0a887b063cedb7b2e07d22939becc5ef077a0d1c99256ce3788`.
- body-source: [https://www.irs.gov/pub/irs-tege/rr77-111.pdf](https://www.irs.gov/pub/irs-tege/rr77-111.pdf) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/409d09ab13e0187721884d26.json`; sha256 `60c3d66a84aa40d638aa7137e4f033021078cbfdc0a9a4abf3847302164e25c3`.

### us-sec-corpfin-nal-2025-001 — SEC No-Action Letter — Latham & Watkins (Rule 506(c) Verification)

Source: `data/examples/instruments/us-sec-corpfin-nal-2025-001.md`. {"BLOCKED": 1, "NEEDS-HUMAN": 3}
- ref: [https://www.sec.gov/divisions/corpfin](https://www.sec.gov/divisions/corpfin) — **BLOCKED**, HTTP 301, BLOCKED: robots HTTP 403 blocks access. Receipt: `_codex-out/sources/links/resume-20261003/4de3046982db25be84624793.json`; sha256 `24b8b427482bf21b76dbfc57e616c41a27d3317c5c13dca9fb0125903aa2d138`. Redirects: [{"from": "https://www.sec.gov/divisions/corpfin", "to": "http://dc.aws-sec.akadns.net/divisions/corpfin/", "status": 301}]
- body-source: [https://www.sec.gov/rules-regulations/no-action-interpretive-exemptive-letters/division-corporation-finance-no-action/latham-watkins-503c-031225](https://www.sec.gov/rules-regulations/no-action-interpretive-exemptive-letters/division-corporation-finance-no-action/latham-watkins-503c-031225) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/1a1054477e968fb63f18911a.json`; sha256 `867f46492ea59d9232223e5808770412d511b52f0bac471cce2890c618382b43`.
- body-source: [https://www.ecfr.gov/current/title-17/chapter-II/part-230/subject-group-ECFRfdd94b1cf5a5091/section-230.506](https://www.ecfr.gov/current/title-17/chapter-II/part-230/subject-group-ECFRfdd94b1cf5a5091/section-230.506) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/4860c3de3cbb0c8db7b9a13b.json`; sha256 `022896777aaed76809f79b2517727c894f5669090215d2131b26982d023d3b5c`. Redirects: [{"from": "https://www.ecfr.gov/current/title-17/chapter-II/part-230/subject-group-ECFRfdd94b1cf5a5091/section-230.506", "to": "https://www.ecfr.gov/current/title-17/chapter-II/part-230/subject-group-ECFR6e651a4c86c0174/section-230.506", "status": 302}]
- body-source: [https://www.law.cornell.edu/cfr/text/17/230.506](https://www.law.cornell.edu/cfr/text/17/230.506) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/b78b63516b8c1d6a02fa4148.json`; sha256 `6915473687572a5c54a5b30d5b470cc97faec2bb3941e71b167b506e55a91f40`.

### us-ut-legislature-statute-2024-sb149 — Utah SB 149 (2024) — Artificial Intelligence Amendments

Source: `data/examples/instruments/us-ut-legislature-statute-2024-sb149.md`. {"BLOCKED": 4, "NEEDS-HUMAN": 2}
- ref: [https://le.utah.gov/](https://le.utah.gov/) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/6132a1f43728abe4cc599682.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://le.utah.gov/~2024/bills/static/SB0149.html](https://le.utah.gov/~2024/bills/static/SB0149.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/2a6d2a027edf81b46567c4a0.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72/13-72.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/c4e2bacbe19e1a7962fa35a1.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title76/Chapter2/76-2-S107.html](https://le.utah.gov/xcode/Title76/Chapter2/76-2-S107.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/4176c09d43986d221b7ea423.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://everyailaw.com/regulation/utah-sb149/](https://everyailaw.com/regulation/utah-sb149/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/e944e11631abaa22c6953fbe.json`; sha256 `7f34b722f0e1d1e193dd1df073753603acbb6b7bef9715f42aee492526cf4ae6`.
- body-source: [https://commerce.utah.gov/ai/](https://commerce.utah.gov/ai/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/6b131796910209c78e14c433.json`; sha256 `91c0e2310df9238ab2912be82a5417258ef771d3d0b569c019f7e4036ce1d941`.

### us-ut-legislature-statute-2025-hb452 — Utah HB 452 (2025) — Artificial Intelligence Amendments (Mental Health Chatbots)

Source: `data/examples/instruments/us-ut-legislature-statute-2025-hb452.md`. {"BLOCKED": 7, "NEEDS-HUMAN": 3}
- ref: [https://le.utah.gov/](https://le.utah.gov/) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/6132a1f43728abe4cc599682.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://le.utah.gov/~2025/bills/static/HB0452.html](https://le.utah.gov/~2025/bills/static/HB0452.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/5db55d16e4e4ee151a0a6a98.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72a/13-72a.html](https://le.utah.gov/xcode/Title13/Chapter72a/13-72a.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/13d1fa4ad8110be828163f79.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72a/13-72a-S101.html](https://le.utah.gov/xcode/Title13/Chapter72a/13-72a-S101.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/5c2b3c0e9fc9a0946a09a9ec.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72a/13-72a-S201.html](https://le.utah.gov/xcode/Title13/Chapter72a/13-72a-S201.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/bec3645ba32f1d52393f20d3.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72a/13-72a-S203.html](https://le.utah.gov/xcode/Title13/Chapter72a/13-72a-S203.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/3d577b724f602c6aa47e67f0.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title58/Chapter60/58-60-S118.html](https://le.utah.gov/xcode/Title58/Chapter60/58-60-S118.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/69931ebf7dbe2619dc523e13.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-disclosure](https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-disclosure) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/55b48cda289d7b7354cf70b0.json`; sha256 `7f34b722f0e1d1e193dd1df073753603acbb6b7bef9715f42aee492526cf4ae6`.
- body-source: [https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-data-protection](https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-data-protection) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/d042203c4cc1e219b19f8779.json`; sha256 `7f34b722f0e1d1e193dd1df073753603acbb6b7bef9715f42aee492526cf4ae6`.
- body-source: [https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-safety-policy](https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-safety-policy) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/bb44d0d4dc53cf8116f42c11.json`; sha256 `7f34b722f0e1d1e193dd1df073753603acbb6b7bef9715f42aee492526cf4ae6`.

### us-ut-legislature-statute-2025-sb226 — Utah SB 226 (2025) — Artificial Intelligence Consumer Protection Amendments

Source: `data/examples/instruments/us-ut-legislature-statute-2025-sb226.md`. {"BLOCKED": 3, "NEEDS-HUMAN": 2}
- ref: [https://le.utah.gov/](https://le.utah.gov/) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/6132a1f43728abe4cc599682.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://le.utah.gov/~2025/bills/static/SB0226.html](https://le.utah.gov/~2025/bills/static/SB0226.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/fb0d81d5d39e66bd84944f44.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter75/13-75.html](https://le.utah.gov/xcode/Title13/Chapter75/13-75.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/1476cfc20ced3a6c9cb1eb44.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://everyailaw.com/regulation/utah-sb149/#general-genai-disclosure](https://everyailaw.com/regulation/utah-sb149/#general-genai-disclosure) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/c4335fcfe848a7221a935cfc.json`; sha256 `7f34b722f0e1d1e193dd1df073753603acbb6b7bef9715f42aee492526cf4ae6`.
- body-source: [https://everyailaw.com/regulation/utah-sb149/#high-risk-genai-disclosure-in-regulated-occupations](https://everyailaw.com/regulation/utah-sb149/#high-risk-genai-disclosure-in-regulated-occupations) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/60df450b6e1ec4cf45e2e293.json`; sha256 `7f34b722f0e1d1e193dd1df073753603acbb6b7bef9715f42aee492526cf4ae6`.

### us-ut-legislature-statute-2025-sb332 — Utah SB 332 (2025) — Artificial Intelligence Revisions (AIPA Sunset Extension)

Source: `data/examples/instruments/us-ut-legislature-statute-2025-sb332.md`. {"BLOCKED": 5, "NEEDS-HUMAN": 1}
- ref: [https://le.utah.gov/](https://le.utah.gov/) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/6132a1f43728abe4cc599682.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://le.utah.gov/~2025/bills/static/SB0332.html](https://le.utah.gov/~2025/bills/static/SB0332.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/210fdc31b73b22436a1c0ecd.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://le.utah.gov/xcode/Title63I/Chapter2/63I-2-S213.html](https://le.utah.gov/xcode/Title63I/Chapter2/63I-2-S213.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/54af468a42b29e0e29fa4ae9.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://le.utah.gov/xcode/Title13/Chapter72/13-72.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/c4e2bacbe19e1a7962fa35a1.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://le.utah.gov/Session/2025/bills/enrolled/SB0332.pdf](https://le.utah.gov/Session/2025/bills/enrolled/SB0332.pdf) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/804ba98612841cd9f9638086.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://everyailaw.com/regulation/utah-sb149/index.html](https://everyailaw.com/regulation/utah-sb149/index.html) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/3f103ecc2ce9563beedd8f8c.json`; sha256 `7f34b722f0e1d1e193dd1df073753603acbb6b7bef9715f42aee492526cf4ae6`.

### us-ut-legislature-statute-2026-hb320 — Utah HB 320 (2026) — Office of Artificial Intelligence Policy Amendments (Learning Lab Restructure + Joint Interpretation Agreements)

Source: `data/examples/instruments/us-ut-legislature-statute-2026-hb320.md`. {"BLOCKED": 7, "NEEDS-HUMAN": 2}
- ref: [https://le.utah.gov/](https://le.utah.gov/) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/6132a1f43728abe4cc599682.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://le.utah.gov/~2026/bills/static/HB0320.html](https://le.utah.gov/~2026/bills/static/HB0320.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/03379ef3832f72c5e7f568c7.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72/13-72.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/c4e2bacbe19e1a7962fa35a1.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72/13-72-S201.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72-S201.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/7b6f0590ace9b53e67a10a46.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72/13-72-S401.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72-S401.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/1aecfb1a2f2fe32f2f7d46af.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72/13-72-S402.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72-S402.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/3ee43ed9d0c2843085853a04.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72/13-72-S403.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72-S403.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/81bfe37f94c23f03459c46da.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://everyailaw.com/regulation/utah-sb149/#regulatory-mitigation-and-joint-interpretation-agreements](https://everyailaw.com/regulation/utah-sb149/#regulatory-mitigation-and-joint-interpretation-agreements) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/a106710e33d512793b431340.json`; sha256 `7f34b722f0e1d1e193dd1df073753603acbb6b7bef9715f42aee492526cf4ae6`.
- body-source: [https://commerce.utah.gov/ai/](https://commerce.utah.gov/ai/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/6b131796910209c78e14c433.json`; sha256 `91c0e2310df9238ab2912be82a5417258ef771d3d0b569c019f7e4036ce1d941`.

### us-ut-oaip-jia-2026-001 — Utah Mental Health Chatbot Disclosure — Joint Interpretation

Source: `data/examples/instruments/us-ut-oaip-jia-2026-001.md`. {"NEEDS-HUMAN": 2, "BLOCKED": 2}
- official_url: [https://commerce.utah.gov/ai/](https://commerce.utah.gov/ai/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/6b131796910209c78e14c433.json`; sha256 `91c0e2310df9238ab2912be82a5417258ef771d3d0b569c019f7e4036ce1d941`.
- body-source: [https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-disclosure](https://everyailaw.com/regulation/utah-sb149/#mental-health-chatbot-disclosure) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/55b48cda289d7b7354cf70b0.json`; sha256 `7f34b722f0e1d1e193dd1df073753603acbb6b7bef9715f42aee492526cf4ae6`.
- body-source: [https://le.utah.gov/~2025/bills/static/HB0452.html](https://le.utah.gov/~2025/bills/static/HB0452.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/5db55d16e4e4ee151a0a6a98.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://le.utah.gov/xcode/Title13/Chapter72A/13-72a-S203.html](https://le.utah.gov/xcode/Title13/Chapter72A/13-72a-S203.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/007fee3acf9fb8306b4e9bb1.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

### us-ut-oaip-rma-2024-001 — Utah OAIP × ElizaChat — Teen Mental-Health App RMA (2024)

Source: `data/examples/instruments/us-ut-oaip-rma-2024-001.md`. {"NEEDS-HUMAN": 4, "PASS": 1, "BLOCKED": 9}
- ref: [https://commerce.utah.gov/ai/](https://commerce.utah.gov/ai/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/6b131796910209c78e14c433.json`; sha256 `91c0e2310df9238ab2912be82a5417258ef771d3d0b569c019f7e4036ce1d941`.
- body-source: [https://commerce.utah.gov/ai/regulatory-relief-4/authorized-pilots/elizachat/](https://commerce.utah.gov/ai/regulatory-relief-4/authorized-pilots/elizachat/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/23cdddf8ef79d8324e2e91f2.json`; sha256 `3b65f027af884c0f5e0cd85abd200a482728fec1ccd7b40653edf3f2dcc53b0c`.
- body-source: [https://commerce.utah.gov/wp-content/uploads/2024/11/Signed-Elizachat-Agreement-November-2024.pdf](https://commerce.utah.gov/wp-content/uploads/2024/11/Signed-Elizachat-Agreement-November-2024.pdf) — **PASS**, HTTP 200, HTTP 200; SHA256 equals retained source bytes. Receipt: `_codex-out/sources/links/resume-20261003/579b41724bc2dfd7e43dbf09.json`; sha256 `3b02de08d771cfe3b90f3f7913cb84c3516d61fd7041fcd60fd6deffb6b7cf1c`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72/13-72-S201.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72-S201.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/7b6f0590ace9b53e67a10a46.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72/13-72-S302.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72-S302.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/ae75b270d41d9bb926ab8883.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter2/13-2-S12.html](https://le.utah.gov/xcode/Title13/Chapter2/13-2-S12.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/6102dc9ddc01eb5c16fe1e11.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title58/Chapter1/58-1-S501.html](https://le.utah.gov/xcode/Title58/Chapter1/58-1-S501.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/b7bc6c81cb3126a4496f0809.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title58/Chapter60/58-60-S102.html](https://le.utah.gov/xcode/Title58/Chapter60/58-60-S102.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/2cc12fd147548826a2510b0d.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title58/Chapter61/58-61-S102.html](https://le.utah.gov/xcode/Title58/Chapter61/58-61-S102.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/cee6e444a7a88669f690e909.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title63A/Chapter19/63A-19-S102.html](https://le.utah.gov/xcode/Title63A/Chapter19/63A-19-S102.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/3513bc3c59d05f9277f5be68.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://commerce.utah.gov/ai/regulatory-relief-4/authorized-pilots/](https://commerce.utah.gov/ai/regulatory-relief-4/authorized-pilots/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/b5af94b27c06b4f7612cab6e.json`; sha256 `be7d9ae77c3dedeb834d6b99ee296f4d4c0d2fa480034ad525b4dcf240f98d9d`.
- body-source: [https://github.com/snapsynapse/publedge/blob/main/ops/evidence/elizachat-source-review-2026-09-08.json](https://github.com/snapsynapse/publedge/blob/main/ops/evidence/elizachat-source-review-2026-09-08.json) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; exact repository file path/title and og:url are identity candidates, but continuity against retained source bytes/text is unproven. Receipt: `_codex-out/sources/links/resume-20261003/123281d65b6f2797eddd4735.json`; sha256 `bd49bf9c7ac43aa0e82e987dec69c6fa057fbeccc1a24d431cbedbd9ed669b00`.
- body-source: [https://le.utah.gov/xcode/Title13/Chapter72/13-72.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/c4e2bacbe19e1a7962fa35a1.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://le.utah.gov/xcode/Title58/Chapter60/58-60.html](https://le.utah.gov/xcode/Title58/Chapter60/58-60.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/104005d86a204602cb6d1c69.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

### us-ut-oaip-rma-2025-001 — Utah OAIP × Dentacor — AI-Assisted Dental Radiograph Diagnosis RMA (2025)

Source: `data/examples/instruments/us-ut-oaip-rma-2025-001.md`. {"HTTP-FAILURE": 1, "NEEDS-HUMAN": 2, "BLOCKED": 7}
- ref: [https://commerce.utah.gov/ai/learning-lab/](https://commerce.utah.gov/ai/learning-lab/) — **HTTP-FAILURE**, HTTP 404, HTTP 404. Receipt: `_codex-out/sources/links/resume-20261003/6316bf974e93b82d5a8da743.json`; sha256 `f0b0d7b01d2bfcbedea1d6979c7f57fef38a53deb0c3e33039addd8ab4cae8f4`.
- body-source: [https://commerce.utah.gov/ai/regulatory-relief/authorized-ai-pilots/dentacor/](https://commerce.utah.gov/ai/regulatory-relief/authorized-ai-pilots/dentacor/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/2971359e3949de96ff6a55a3.json`; sha256 `f2b163b1030ffb7bc32ab38fc113b5f9643eefd8ba24161ebc4ea6cf4fe3889f`. Redirects: [{"from": "https://commerce.utah.gov/ai/regulatory-relief/authorized-ai-pilots/dentacor/", "to": "https://commerce.utah.gov/ai/regulatory-relief-4/authorized-pilots/dentacor/", "status": 301}]
- body-source: [https://commerce.utah.gov/wp-content/uploads/2025/06/Dentacor-Mitigation-Agreement.pdf](https://commerce.utah.gov/wp-content/uploads/2025/06/Dentacor-Mitigation-Agreement.pdf) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/d7e7c3bc85ba249c090122cf.json`; sha256 `066abb3c61caf45ab9c88aa58ec76134c352191c57d9b75361c375cbe5d5d9be`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72/13-72-S201.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72-S201.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/7b6f0590ace9b53e67a10a46.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72/13-72-S302.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72-S302.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/ae75b270d41d9bb926ab8883.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://le.utah.gov/xcode/Title58/Chapter69/58-69.html](https://le.utah.gov/xcode/Title58/Chapter69/58-69.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/f975c79cc69ba76791dae83d.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title58/Chapter69/58-69-S301.html](https://le.utah.gov/xcode/Title58/Chapter69/58-69-S301.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/9af575db5efc83dcac0265da.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title58/Chapter69/58-69-S102.html](https://le.utah.gov/xcode/Title58/Chapter69/58-69-S102.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/236c41cb7f0676acda070f86.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title58/Chapter69/58-69-S5.html](https://le.utah.gov/xcode/Title58/Chapter69/58-69-S5.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/758b9fde8748cb90bdca1f1b.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title63A/Chapter19/63A-19-S102.html](https://le.utah.gov/xcode/Title63A/Chapter19/63A-19-S102.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/3513bc3c59d05f9277f5be68.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

### us-ut-oaip-rma-2025-002 — Utah OAIP × Doctronic — AI Prescription Renewal RMA (2025)

Source: `data/examples/instruments/us-ut-oaip-rma-2025-002.md`. {"NEEDS-HUMAN": 4, "PASS": 2, "BLOCKED": 9}
- body-source: [https://commerce.utah.gov/ai/](https://commerce.utah.gov/ai/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/6b131796910209c78e14c433.json`; sha256 `91c0e2310df9238ab2912be82a5417258ef771d3d0b569c019f7e4036ce1d941`.
- body-source: [https://commerce.utah.gov/ai/regulatory-relief-4/authorized-pilots/doctronic/](https://commerce.utah.gov/ai/regulatory-relief-4/authorized-pilots/doctronic/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/fa22739bee7409a6c149111d.json`; sha256 `d10441b0c359cc52b1b44ea33b8512d27beadd9c4732fb1d220e5cbe7a88af85`.
- body-source: [https://commerce.utah.gov/wp-content/uploads/2026/01/Doctronic-Final-Agreement.pdf](https://commerce.utah.gov/wp-content/uploads/2026/01/Doctronic-Final-Agreement.pdf) — **PASS**, HTTP 200, HTTP 200; SHA256 equals retained source bytes. Receipt: `_codex-out/sources/links/resume-20261003/d9838473fec6f643779fd2e6.json`; sha256 `a608ae66c362d6b6dd87a68d25055642d6dfcc6a19685aa614c9bb48c5340f7f`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72/13-72-S201.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72-S201.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/7b6f0590ace9b53e67a10a46.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72/13-72-S301.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72-S301.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/5aca83db274ff84ca57be1cc.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72/13-72-S302.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72-S302.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/ae75b270d41d9bb926ab8883.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter77/13-77-S103.html](https://le.utah.gov/xcode/Title13/Chapter77/13-77-S103.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/32858af35457fd9a578f4fbb.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title58/Chapter17B/58-17b.html](https://le.utah.gov/xcode/Title58/Chapter17B/58-17b.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/605aa810dd2352dc7f6506fd.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title58/Chapter1/58-1-S501.html](https://le.utah.gov/xcode/Title58/Chapter1/58-1-S501.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/b7bc6c81cb3126a4496f0809.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title26B/Chapter4/26B-4-S704.html](https://le.utah.gov/xcode/Title26B/Chapter4/26B-4-S704.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/1b074573b5e5e02a79739e75.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title63A/Chapter19/63A-19-S102.html](https://le.utah.gov/xcode/Title63A/Chapter19/63A-19-S102.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/3513bc3c59d05f9277f5be68.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://commerce.utah.gov/ai/regulatory-relief-4/authorized-pilots/](https://commerce.utah.gov/ai/regulatory-relief-4/authorized-pilots/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/b5af94b27c06b4f7612cab6e.json`; sha256 `be7d9ae77c3dedeb834d6b99ee296f4d4c0d2fa480034ad525b4dcf240f98d9d`.
- body-source: [https://commerce.utah.gov/wp-content/uploads/2026/05/Doctronic-Outcomes-May-2026.pdf](https://commerce.utah.gov/wp-content/uploads/2026/05/Doctronic-Outcomes-May-2026.pdf) — **PASS**, HTTP 200, HTTP 200; normalized text identical to URL-associated retained snapshot. Receipt: `_codex-out/sources/links/resume-20261003/f6187711898df2c5f35ded03.json`; sha256 `ebddbd00bd97e950eba215ecabcbeac7b0ff08a41929bba24f76e58cea0cd940`.
- body-source: [https://commerce.utah.gov/ai/ai-faq/](https://commerce.utah.gov/ai/ai-faq/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/5fc0cf26b99a973d33293b2d.json`; sha256 `d2d60f991a4b1633b81a294d0f4d80b0f72486a02172116dd7a55730ec73d902`.
- body-source: [https://le.utah.gov/xcode/Title13/Chapter72/13-72.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/c4e2bacbe19e1a7962fa35a1.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

### us-ut-oaip-rma-2026-001 — Utah OAIP × Legion Health — AI Maintenance Psychiatric Refill RMA (2026)

Source: `data/examples/instruments/us-ut-oaip-rma-2026-001.md`. {"NEEDS-HUMAN": 3, "PASS": 1, "BLOCKED": 8}
- ref: [https://commerce.utah.gov/ai/](https://commerce.utah.gov/ai/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/6b131796910209c78e14c433.json`; sha256 `91c0e2310df9238ab2912be82a5417258ef771d3d0b569c019f7e4036ce1d941`.
- body-source: [https://commerce.utah.gov/ai/regulatory-relief-4/authorized-pilots/ai-legion-health/](https://commerce.utah.gov/ai/regulatory-relief-4/authorized-pilots/ai-legion-health/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/a3135792da786963e598430d.json`; sha256 `4bd68bbddaabe61e3656e8942420267de1ad18297c9ca4216e0d32e74535731c`.
- body-source: [https://commerce.utah.gov/wp-content/uploads/2026/03/Legion-Agreement.pdf](https://commerce.utah.gov/wp-content/uploads/2026/03/Legion-Agreement.pdf) — **PASS**, HTTP 200, HTTP 200; SHA256 equals retained source bytes. Receipt: `_codex-out/sources/links/resume-20261003/9e6f18e6eff182b38428f135.json`; sha256 `6b7c88c3117323ed84ac2e7e59820193aec5677a8d6cda04637cba9edff36b8d`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72/13-72-S201.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72-S201.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/7b6f0590ace9b53e67a10a46.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter72/13-72-S302.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72-S302.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/ae75b270d41d9bb926ab8883.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://le.utah.gov/xcode/Title13/Chapter72A/13-72a.html](https://le.utah.gov/xcode/Title13/Chapter72A/13-72a.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/d429278821b7abacb99468e9.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title13/Chapter77/13-77-S103.html](https://le.utah.gov/xcode/Title13/Chapter77/13-77-S103.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/32858af35457fd9a578f4fbb.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title58/Chapter17B/58-17b.html](https://le.utah.gov/xcode/Title58/Chapter17B/58-17b.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/605aa810dd2352dc7f6506fd.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title58/Chapter1/58-1-S501.html](https://le.utah.gov/xcode/Title58/Chapter1/58-1-S501.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/b7bc6c81cb3126a4496f0809.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- url: [https://le.utah.gov/xcode/Title26B/Chapter4/26B-4-S704.html](https://le.utah.gov/xcode/Title26B/Chapter4/26B-4-S704.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/1b074573b5e5e02a79739e75.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- body-source: [https://commerce.utah.gov/ai/regulatory-relief-4/authorized-pilots/](https://commerce.utah.gov/ai/regulatory-relief-4/authorized-pilots/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/b5af94b27c06b4f7612cab6e.json`; sha256 `be7d9ae77c3dedeb834d6b99ee296f4d4c0d2fa480034ad525b4dcf240f98d9d`.
- body-source: [https://le.utah.gov/xcode/Title13/Chapter72/13-72.html](https://le.utah.gov/xcode/Title13/Chapter72/13-72.html) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/c4e2bacbe19e1a7962fa35a1.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

### admt-60-day-cure-period — ADMT Sixty-Day Cure Period Before Enforcement

Source: `data/examples/obligations/admt-60-day-cure-period.md`. No external source links on this record page.

### admt-correction-and-human-review — ADMT Data Correction And Human Review Of Adverse Outcomes

Source: `data/examples/obligations/admt-correction-and-human-review.md`. No external source links on this record page.

### admt-deployer-3-year-record-retention — ADMT Deployer Three-Year Record Retention

Source: `data/examples/obligations/admt-deployer-3-year-record-retention.md`. No external source links on this record page.

### admt-deployer-pre-decision-notice — ADMT Deployer Notice Before Consequential Decision

Source: `data/examples/obligations/admt-deployer-pre-decision-notice.md`. No external source links on this record page.

### admt-developer-documentation-to-deployer — ADMT Developer Documentation To Deployer

Source: `data/examples/obligations/admt-developer-documentation-to-deployer.md`. No external source links on this record page.

### admt-post-adverse-explanation-30-days — ADMT Post-Adverse Explanation Within 30 Days

Source: `data/examples/obligations/admt-post-adverse-explanation-30-days.md`. No external source links on this record page.

### ai-authorized-rx-renewal — AI-Authorized Prescription Renewal (Utah Pilot)

Source: `data/examples/obligations/ai-authorized-rx-renewal.md`. No external source links on this record page.

### ai-defense-elimination — GenAI Is Not A Defense — Civil And Criminal

Source: `data/examples/obligations/ai-defense-elimination.md`. No external source links on this record page.

### cfpb-pay-to-pay-fee-prohibited — Pay-To-Pay Fee Prohibited Without Express Authorization

Source: `data/examples/obligations/cfpb-pay-to-pay-fee-prohibited.md`. No external source links on this record page.

### cftc-unbundled-fee-not-cta-trigger — Unbundled Advice Fee Does Not Trigger CTA Registration

Source: `data/examples/obligations/cftc-unbundled-fee-not-cta-trigger.md`. No external source links on this record page.

### chatbot-data-no-third-party-sharing — Mental Health Chatbot — No Third-Party Data Sharing

Source: `data/examples/obligations/chatbot-data-no-third-party-sharing.md`. No external source links on this record page.

### chatbot-safety-policy-filing — Mental Health Chatbot — File 15-Element Safety Policy

Source: `data/examples/obligations/chatbot-safety-policy-filing.md`. No external source links on this record page.

### dentacor-58-69-5-enforcement-forborne — Dentacor — §58-69-5 Enforcement Forborne

Source: `data/examples/obligations/dentacor-58-69-5-enforcement-forborne.md`. No external source links on this record page.

### dentacor-hygienist-ai-concurrence-diagnosis — Dentacor — Hygienist + AI Concurrence Diagnosis

Source: `data/examples/obligations/dentacor-hygienist-ai-concurrence-diagnosis.md`. No external source links on this record page.

### dentacor-informed-consent-no-dentist — Dentacor — Informed Consent Disclosing Absence Of Dentist

Source: `data/examples/obligations/dentacor-informed-consent-no-dentist.md`. No external source links on this record page.

### disclose-genai-high-risk-proactive — Proactive GenAI Disclosure In High-Risk Interactions

Source: `data/examples/obligations/disclose-genai-high-risk-proactive.md`. No external source links on this record page.

### disclose-genai-on-first-session — Disclose GenAI on First Session

Source: `data/examples/obligations/disclose-genai-on-first-session.md`. No external source links on this record page.

### disclose-genai-on-request — Disclose GenAI On Consumer Request

Source: `data/examples/obligations/disclose-genai-on-request.md`. No external source links on this record page.

### elizachat-phased-rollout — ElizaChat — Three-Phase Rollout Gate

Source: `data/examples/obligations/elizachat-phased-rollout.md`. No external source links on this record page.

### elizachat-pre-access-disclosure-bundle — ElizaChat — Pre-Access Disclosure Bundle

Source: `data/examples/obligations/elizachat-pre-access-disclosure-bundle.md`. No external source links on this record page.

### high-risk-ai-consumer-notice-correction-and-appeal — High-Risk AI Consumer Notice, Correction, And Appeal

Source: `data/examples/obligations/high-risk-ai-consumer-notice-correction-and-appeal.md`. No external source links on this record page.

### high-risk-ai-impact-assessment — High-Risk AI Impact Assessment

Source: `data/examples/obligations/high-risk-ai-impact-assessment.md`. No external source links on this record page.

### high-risk-ai-reasonable-care-against-algorithmic-discrimination — High-Risk AI Reasonable Care Against Algorithmic Discrimination

Source: `data/examples/obligations/high-risk-ai-reasonable-care-against-algorithmic-discrimination.md`. No external source links on this record page.

### irs-501c3-dual-test-failure — §501(c)(3) Exemption Denied — Organizational And Operational Test Failure

Source: `data/examples/obligations/irs-501c3-dual-test-failure.md`. No external source links on this record page.

### irs-incentive-fee-not-net-profits-share — Incentive-Fee Management Contract Not A Share Of Net Profits

Source: `data/examples/obligations/irs-incentive-fee-not-net-profits-share.md`. No external source links on this record page.

### learning-lab-agreement-participation — Learning Lab Agreement — Eligibility and Participation

Source: `data/examples/obligations/learning-lab-agreement-participation.md`. No external source links on this record page.

### named-prescriber-enforcement-forborne — Named-Prescriber Enforcement Forborne

Source: `data/examples/obligations/named-prescriber-enforcement-forborne.md`. No external source links on this record page.

### rma-data-security-63a-19-102 — RMA — Data Security Under §63A-19-102

Source: `data/examples/obligations/rma-data-security-63a-19-102.md`. No external source links on this record page.

### rma-end-of-term-report — RMA — 30-Day End-Of-Term Report

Source: `data/examples/obligations/rma-end-of-term-report.md`. No external source links on this record page.

### rma-hold-harmless-state — RMA — Hold Harmless The State

Source: `data/examples/obligations/rma-hold-harmless-state.md`. No external source links on this record page.

### rma-incident-notification-24hr — RMA — 24-Hour Incident Notification

Source: `data/examples/obligations/rma-incident-notification-24hr.md`. No external source links on this record page.

### rma-monthly-report-to-oaip — RMA — Monthly Report To OAIP

Source: `data/examples/obligations/rma-monthly-report-to-oaip.md`. No external source links on this record page.

### rma-no-advertising-reference — RMA — No Advertising Reference To Agreement

Source: `data/examples/obligations/rma-no-advertising-reference.md`. No external source links on this record page.

### sec-reg-d-506c-verification-safe-harbor — Rule 506(c) Verification Via High-Minimum + Representation

Source: `data/examples/obligations/sec-reg-d-506c-verification-safe-harbor.md`. No external source links on this record page.

### telehealth-compliance-per-proposal — Telehealth Compliance Anchored To Participant Proposal

Source: `data/examples/obligations/telehealth-compliance-per-proposal.md`. No external source links on this record page.

### cfpb — Consumer Financial Protection Bureau

Source: `data/examples/authorities/cfpb.md`. {"NEEDS-HUMAN": 1}
- website: [https://www.consumerfinance.gov/](https://www.consumerfinance.gov/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/3f757d4cb33088c13ff3afbd.json`; sha256 `f6ccbc69b7824f83fca9c8513e51b97b43249e260a6b573b0a31e7faff78876a`.

### cftc-dsio — CFTC Division of Swap Dealer and Intermediary Oversight

Source: `data/examples/authorities/cftc-dsio.md`. {"HTTP-FAILURE": 1}
- website: [https://www.cftc.gov/About/CFTCOrganization/DSIO/index.htm](https://www.cftc.gov/About/CFTCOrganization/DSIO/index.htm) — **HTTP-FAILURE**, HTTP 404, HTTP 404. Receipt: `_codex-out/sources/links/resume-20261003/e0ec4ed17d0b7826c7199475.json`; sha256 `c3505a3cb16646847b57e69c38f62ce685d57a6b602a9f9d58a93a519b75745d`.

### colorado-legislature — Colorado General Assembly

Source: `data/examples/authorities/colorado-legislature.md`. {"NEEDS-HUMAN": 3}
- body-source: [https://leg.colorado.gov/](https://leg.colorado.gov/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/3a12934708b2b8c2b194a3fa.json`; sha256 `e5bf9af5c11e9efe4b59392ba660b58aa9addb9892532bb9125e4774de8e9978`.
- body-source: [https://everyailaw.com/regulation/colorado-sb24-205/](https://everyailaw.com/regulation/colorado-sb24-205/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/2a787ec1af1dfbc500cb2812.json`; sha256 `6366559044c6b6894ae16b69eb06b66e029626eb4ae468bcb8a998a97cac33e1`.
- body-source: [https://everyailaw.com/regulation/colorado-sb26-189/](https://everyailaw.com/regulation/colorado-sb26-189/) — **NEEDS-HUMAN**, HTTP 200, HTTP 200; same-document identity not established. Receipt: `_codex-out/sources/links/resume-20261003/58715e172f5a5e3f5462c6d3.json`; sha256 `d9187142e5445411a07246645af2b6d36ee133f99020ea7aa93a66b013326fa2`.

### irs-chief-counsel — IRS Office of Chief Counsel

Source: `data/examples/authorities/irs-chief-counsel.md`. {"HTTP-FAILURE": 1}
- website: [https://www.irs.gov/privacy-disclosure/written-determinations](https://www.irs.gov/privacy-disclosure/written-determinations) — **HTTP-FAILURE**, HTTP 404, HTTP 404. Receipt: `_codex-out/sources/links/resume-20261003/85ba14a4ab19cdca14eac83b.json`; sha256 `f10566c170a8f0c3ec0af6573efc346f8a377cd7af3a1358defdeeec0782f157`.

### irs-tege — IRS Tax Exempt and Government Entities Division

Source: `data/examples/authorities/irs-tege.md`. {"HTTP-FAILURE": 1}
- website: [https://www.irs.gov/about-irs/tax-exempt-government-entities-at-a-glance](https://www.irs.gov/about-irs/tax-exempt-government-entities-at-a-glance) — **HTTP-FAILURE**, HTTP 404, HTTP 404. Receipt: `_codex-out/sources/links/resume-20261003/d5676365ad1411ab8ab40acc.json`; sha256 `2f6b4fb3758db180262dac71392b3bab4aa3547e8ac60531dda0914b20e15561`.

### sec-corpfin — SEC Division of Corporation Finance

Source: `data/examples/authorities/sec-corpfin.md`. {"BLOCKED": 1}
- website: [https://www.sec.gov/divisions/corpfin](https://www.sec.gov/divisions/corpfin) — **BLOCKED**, HTTP 301, BLOCKED: robots HTTP 403 blocks access. Receipt: `_codex-out/sources/links/resume-20261003/4de3046982db25be84624793.json`; sha256 `24b8b427482bf21b76dbfc57e616c41a27d3317c5c13dca9fb0125903aa2d138`. Redirects: [{"from": "https://www.sec.gov/divisions/corpfin", "to": "http://dc.aws-sec.akadns.net/divisions/corpfin/", "status": 301}]

### utah-legislature — Utah State Legislature

Source: `data/examples/authorities/utah-legislature.md`. {"BLOCKED": 1}
- body-source: [https://le.utah.gov/](https://le.utah.gov/) — **BLOCKED**, HTTP None, Robots retrieval received proxy/upstream HTTP503 with explicit CERTIFICATE_VERIFY_FAILED; origin TLS could not be verified. TLS verification preserved; current robots policy and source document unknown.. Receipt: `_codex-out/sources/links/resume-20261003/6132a1f43728abe4cc599682.json`; sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

### utah-oaip — Utah Office of Artificial Intelligence Policy

Source: `data/examples/authorities/utah-oaip.md`. {"HTTP-FAILURE": 1}
- website: [https://commerce.utah.gov/ai/learning-lab/](https://commerce.utah.gov/ai/learning-lab/) — **HTTP-FAILURE**, HTTP 404, HTTP 404. Receipt: `_codex-out/sources/links/resume-20261003/6316bf974e93b82d5a8da743.json`; sha256 `f0b0d7b01d2bfcbedea1d6979c7f57fef38a53deb0c3e33039addd8ab4cae8f4`.

## Methods and limits

- HTTP 200 does not establish identity. PASS requires SHA256 matching retained document or normalized retained source text; title matches alone remain human review.
- All attempt receipts, redirects, MIME types, bytes and extracted text retained under _codex-out/sources/links. Transport retries and robots checks are centralized.
- Empty-body SHA256 on blocked receipts is a transport artifact, not a retrieved official-source digest. Shared robots failure receipts apply across host URLs; zero source attempts must not be confused with successful or failed origin requests.
- Historical MIME type unavailable for many sources; unknown remains unknown.
- 403/429 are failures or blocked access, never treated as passes, even though original AIL checker allows known bot-filtered hosts.
- A metadata/docket title is a lead, not a determination; latest docket and comparable baseline are needed to infer new entries.
- Inspected existing AIL `assessSourceResponse` and PubLedge `check-links.js`. The latter is an internal generated-page link checker. Direct network checkers were not run because they do not implement the sweep's shared politeness/robots policy and stricter identity/403 requirements.
- No paid providers, secret values, data updates, Verified/Checked updates or human attestations used or written.

## Cumulative evidence and transport counts

Initial blocked receipts remain in the prior ledger and original source files. Each current row includes prior_result and cumulative_attempts. New body/receipt artifacts use sources/links/resume-20261003/. Full physical attempt evidence is copied under sources/transport-resume/.

98 unique URL checks; 70 cumulative physical source retrieval attempts; 39 shared robots transport attempts on these hosts. Robots traffic overlaps portfolio/repository reports and must not be summed.

| Host | Source URLs | Source physical attempts | Shared robots attempts |
|---|---:|---:|---:|
| cftc.gov | 2 | 2 | 3 |
| commerce.utah.gov | 13 | 14 | 3 |
| content.leg.colorado.gov | 0 | 0 | 1 |
| dc.aws-sec.akadns.net | 0 | 0 | 1 |
| everyailaw.com | 12 | 12 | 3 |
| github.com | 1 | 1 | 1 |
| irs.gov | 2 | 2 | 2 |
| le.utah.gov | 37 | 0 | 3 |
| leg.colorado.gov | 5 | 5 | 3 |
| paice.work | 1 | 1 | 2 |
| storage.courtlistener.com | 1 | 1 | 3 |
| www.cftc.gov | 1 | 3 | 2 |
| www.consumerfinance.gov | 2 | 2 | 2 |
| www.ecfr.gov | 5 | 9 | 2 |
| www.gtlaw.com | 1 | 1 | 2 |
| www.irs.gov | 7 | 9 | 2 |
| www.law.cornell.edu | 6 | 6 | 2 |
| www.sec.gov | 2 | 2 | 2 |

Generated-page coverage unchanged: **117** native/provision record pages and **123** rendered external source URL occurrences; all covered by source inventory. See [generated-page-link-coverage.json](generated-page-link-coverage.json).

Independent coverage/integrity validation passed; see [link-validation.json](link-validation.json). This validates corpus completeness, durable evidence and each claimed identity comparison; it does not turn blocked or ambiguous links into passing sources.
