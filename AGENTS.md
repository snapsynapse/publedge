# PubLedge — agent instructions

## Build pipeline — IMPORTANT for agents

**`docs/` is generated, not source.** Every `.html` file under `docs/` is written by `scripts/build.js` + `scripts/build-extras.js` (entrypoint: `npm run build`). Direct edits to `docs/index.html` (or any other generated `.html`) will be overwritten on the next build.

Key templates inside the build scripts:

- `scripts/build.js` → `generateHomepage(config, data, configCSS)` (homepage body)
- `scripts/build.js` → `homepageStructuredData` constant near line 833 (site-wide JSON-LD: WebSite, Organization, legal-graph CreativeWork)
- `scripts/build-extras.js` → `FOOTER_NAV` array near line 117 (footer-nav sections including "Part of the PAICE legal graph" + "External references")
- `scripts/build-extras.js` → `renderSiteFooter(relRoot)` (the small site-footer line with copyright + manifest + GitHub)
- `scripts/build-extras.js` → `pageShell(...)` (page wrapper)

Always edit at the source level, then regenerate:

```bash
# After editing scripts/* or data/
npm run build       # build.js + build-extras.js
npm run validate    # cross-reference + JSON validity
git add scripts/ docs/   # commit source AND its outputs together
```

Other generated artifacts: `docs/api/v1/*.json`, `docs/llms.txt`, `docs/agents.json`, `docs/sitemap*.xml`, `docs/feed.xml`, `docs/feed.json`, `docs/atom.xml`, `docs/calendar.ics`. All come from the build scripts.

Safe to edit directly: `docs/CNAME`, `docs/assets/*`, `docs/imgs/*`, source data files outside `docs/`. When in doubt, grep `scripts/` for the file path before editing.

## Cross-portfolio context

PubLedge is part of the PAICE legal graph. Schema canon is at https://obligationfirst.org/. Portfolio canon is at https://paice.foundation/ (`~/Git/paice-foundation/INTENT.md` for strategic context).
