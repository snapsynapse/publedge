---
type: audit-index
project: publedge
---

# PubLedge Audit Log

Running record of conformance and security audits performed against this
repository. Each audit is preserved as a dated report in this directory.

When a new audit runs, append a row to the table and commit the report.

## Audit history

| Date | Scope | Standard / Rubric | Report | Outcome |
|---|---|---|---|---|
| 2026-04-19 | Web frontend (17 pages) | WCAG 2.1 AA | [a11y-2026-04-19.md](a11y-2026-04-19.md) | 0 violations; 4 violation classes found and fixed during the audit |
| 2026-04-19 | Repository + MCP server + build pipeline | OWASP Top 10:2021 | [security-2026-04-19.md](security-2026-04-19.md) | 0 critical/high/medium; 3 low (1 fixed inline, 2 deferred); 2 informational |
| 2026-04-19 | https://publedge.org/ | Siteline SNAP rubric | pending (see note) | Cache-stale result — Grade F because HTTPS was still provisioning at scan time. Re-run next session after Siteline's daily cache clears |

## Running an audit

### WCAG 2.1 AA (accessibility)

Run axe-core against the built site:

```bash
npm run build
python3 -m http.server 8088 --directory docs &
# Open http://localhost:8088/ in a browser
# Inject axe via the devtools extension, or via the iframe harness used
# in audits/a11y-2026-04-19.md.
```

Automated CI equivalent: see `.github/workflows/ci.yml` — the `a11y` job runs
a minimal axe pass on the home page on every push.

### OWASP Top 10 (security)

Manual review. No runtime deps means `npm audit` is trivially clean.

Verify no secret leaks:

```bash
git ls-files '*.env*' '*.pem' '*.key'
git log --all --diff-filter=A -- '*.env*' '*.pem' '*.key'
```

### Siteline SNAP scan (agent readiness)

```bash
curl -sL "https://siteline.snapsynapse.com/api/scan?url=publedge.org" \
  | python3 -m json.tool
```

Rate limit: one scan per domain per day. Use `/api/result?id=publedge-org-YYYYMMDD` for cached reads.

### MANIFEST integrity

The hash manifest is the project's own integrity check. Run it any time:

```bash
./scripts/validate-hashes.sh         # verify only
./scripts/validate-hashes.sh --update # recompute after intentional edits
```

## Retention

Audit reports are tracked in git — do not delete old reports. The report
history is part of the project's public record under PubLedge's
drafting-in-public posture.

## Pre-release checklist (v0.1)

Before the public release, confirm the following have been re-run against
the final main commit:

- [ ] WCAG 2.1 AA audit (axe-core + manual keyboard / screen-reader pass)
- [ ] OWASP Top 10 code review (on the diff since 2026-04-19)
- [ ] Siteline SNAP scan — aim for B or higher
- [ ] MANIFEST hash verification green
- [ ] Link check (`node scripts/check-links.js`)
- [ ] Lawyer review checkpoint complete (Sam)
- [ ] Private snapshot delivered to Boyd + Cullimore + Moss + Cutler (Sam)

The CI workflow (`.github/workflows/ci.yml`) automates the first three
build-level checks on every push; the rest are manual gates.
