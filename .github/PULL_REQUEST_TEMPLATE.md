## Summary

One or two sentences describing what this PR does and why.

## Type of change

- [ ] New instrument or obligation record
- [ ] Schema / frontmatter change
- [ ] Build pipeline or generator change
- [ ] Bug fix
- [ ] Documentation
- [ ] CI / infrastructure
- [ ] Other:

## Checklist

- [ ] `node scripts/validate.js` passes (cross-reference checks)
- [ ] `node scripts/build.js && node scripts/build-extras.js` regenerates `docs/` cleanly
- [ ] `./scripts/validate-hashes.sh --update` run if canonical files changed
- [ ] `CHANGELOG.md` updated under `[Unreleased]` if user-visible
- [ ] `ROADMAP.md` updated if a milestone moved
- [ ] For new instruments: source PDF + OCR text committed alongside the record; stable identifier matches filename; frontmatter conforms to v0.2 spec
- [ ] For schema changes: affected demo records retrofitted; `_workshop/CONTENT-GUIDE.md` reflects the new shape

## Notes for reviewer

Anything worth flagging: drafting-in-public caveats, paywalled sources, OCR transcription uncertainties, status transitions, etc.
