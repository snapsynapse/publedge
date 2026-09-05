# P1 shared-instrument mitigation

Scope: PubLedge OF binding, review F06-F07. Local implementation dated 2026-09-04.

The generator now preserves source supersedes and describesSameEntityAs. Colorado SB26-189 supersedes its predecessor in the export, and both source records explicitly name their EveryAILaw counterparts. The predecessor's native status superseded is preserved as pub:status; explicit OF lifecycle repealed records the repeal-and-reenactment mechanism. Operative status is separately inactive. A notes field explains that the retained scheduled date is not evidence of operative history and that section 5 qualifies replacement timing.

Source basis: EveryAILaw raw/us-co/sb26-189-signed-act.md section 1 and section 5, after consulting native records and wiki analysis; the current Attorney General page https://coag.gov/ai/ confirms repeal and reenactment. The legislature landing page returned 403. This bounded alignment does not settle every time-qualified legal assertion in the older prose, certify never-operative history, or infer a date from signature alone. The F14 handoff carries the qualified-time problem.

Review limitation, 2026-09-05: Section 5 generally sets January 1, 2027 effectiveness, with enumerated provisions effective upon passage. The current machine lifecycle and operative statuses remain unqualified assertions inherited from the P1 candidate. The notes field does not supply a machine-readable time qualifier. Passing serialization, schema, or federation checks must not be presented as validating those assertions or the older never-operative prose. Resolve the qualified-time question in F14 before relying on these records for historical applicability.

Regression coverage uses synthetic instruments to verify canonical predecessor links, correspondence without identity substitution, source notes, independent native and OF statuses, and the unchanged fallback mapping for sources without overrides. Synthetic status values are serialization fixtures, not legal findings.

The final Node 20 canonical check exposed a pre-existing test-transport assumption: the MCP parser-lockstep helper parsed each stdout chunk as a complete JSON line. A deterministic split-response regression reproduced its unterminated-JSON failure. The two affected MCP evals now share a line-buffered UTF-8 decoder; regressions cover split bytes, split multibyte characters, coalesced notifications, malformed frames, and premature EOF. Only test infrastructure changed, not the production MCP server. The full Node 20 gate is rerun on the corrected snapshot.

Shared federation now compares declared corresponding Instruments and rebuilds current source projections in an isolated temporary directory. The adopter fingerprint records exact relationship and provenance values; generated outputs and intentionally updated content hashes travel with source edits. Broad statutory ingestion and special-case anchor expansion remain outside this patch.
