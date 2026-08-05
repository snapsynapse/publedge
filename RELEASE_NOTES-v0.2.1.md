# PubLedge v0.2.1

PubLedge `v0.2.1` is a narrow MCP release-identity correction discovered by installing and initializing the exact `v0.2.0` release tarball before registry publication.

## Fixed

- MCP `initialize` now reports package version `0.2.1` in `serverInfo.version`.
- Modern `server/discover` reports the same package version in its server metadata.
- Both values are derived from `package.json`, removing the stale `1.0.0` literal.
- Source and installed-package evals now reject version drift across these surfaces.
- Public-claim evaluation now treats protocol specification `v0.2.0` and MCP package `v0.2.1` as separate, explicit version identities.

## Unchanged

- The PubLedge protocol specification remains `v0.2.0`.
- The Obligation-First v0.6 projection remains 130 validated records.
- The registry remains 18 instruments, 35 obligations, 8 authorities, and 16 mappings.

## Release handling

The GitHub-only `v0.2.0` release remains immutable. It was not published to npm or the MCP Registry. Registry consumers should use `v0.2.1`.

See [CHANGELOG.md](CHANGELOG.md) for the complete `v0.2.0` migration inventory.
