# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| 0.1.x-pre | :white_check_mark: |
| < 0.1.0 | :x: |

PubLedge is in pre-release drafting. The latest commit on `main` is the currently supported version; earlier tags are snapshots, not maintained branches.

## Scope

PubLedge is a static site and a read-only MCP server over a public dataset. The substantive security concerns are:

- **Supply chain** — integrity of `data/examples/instruments/*.md`, `data/examples/obligations/*.md`, `data/examples/mapping/index.yml`, `_templates/`, `schema/`, the build scripts, and the MCP server.
- **Integrity claims** — `MANIFEST.yaml` pins a SHA-256 over every canonical file. Any mismatch between the file tree and the manifest is a security-relevant bug.
- **AI-crawler policy** — `robots.txt` is intentionally permissive. A change that restricts crawler access without explicit discussion is a security-relevant regression for this project's goals.
- **Build pipeline** — `scripts/build.js` and `scripts/build-extras.js` generate every HTML page and JSON API response. Injection points in those generators are security-relevant.

Out of scope (please do not report):

- Typos, broken non-security links, content disagreements about statute interpretation (open a regular issue instead)
- The legal content itself; PubLedge is not legal advice and is published under CC-BY 4.0 with a Disclaimer & Source Policy at `/reference/disclaimer/`
- Denial-of-service against publedge.org (GitHub Pages is the host; report to GitHub)

## Reporting a vulnerability

Preferred channel — GitHub private security advisories:

> <https://github.com/snapsynapse/publedge/security/advisories/new>

If you cannot use GitHub, email `subscriptions@snapsynapse.com` with the subject line starting `[publedge security]`.

Include:

- A clear description of the issue and the affected surface
- Steps to reproduce or a minimal proof of concept
- The commit SHA or version you observed the issue on
- Your preferred contact for follow-up

## Response timeline

- **Acknowledgement**: within 5 business days
- **Triage + severity assessment**: within 10 business days
- **Fix or mitigation**: targeted within 30 days for high and critical severity; medium and low are prioritized against the roadmap

We will coordinate a disclosure timeline with the reporter. By default, vulnerabilities are disclosed after a fix lands, with credit to the reporter unless anonymity is requested.

## Integrity verification

Every canonical file in the repository is hashed in `MANIFEST.yaml`. To verify a local clone:

```bash
./scripts/validate-hashes.sh
```

A non-zero exit code indicates either an intentional edit that needs a manifest refresh (`./scripts/validate-hashes.sh --update`) or an unexpected tamper that warrants investigation.

## Cryptographic signing

Commits are not currently signed. Adding signed commits and a hash-chain verification step in CI is tracked in `ROADMAP.md` under v0.2 engineering.
