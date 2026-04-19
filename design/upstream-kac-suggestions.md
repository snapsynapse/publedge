---
type: upstream-suggestion
target_repo: https://github.com/snapsynapse/knowledge-as-code-template
created: 2026-04-19
source_project: publedge (https://github.com/snapsynapse/publedge)
---

# Upstream suggestions for knowledge-as-code-template

Two accessibility fixes and one XSS hardening item surfaced while auditing
a PubLedge build that inherits the KaC template. Each is small, isolated,
and equally valuable for every downstream project. PubLedge currently
applies these fixes via a local `scripts/build-extras.js` post-processor
and stylesheet overrides; accepting them upstream lets the patches retire.

Open as three small PRs against `knowledge-as-code-template`, or bundle
into one labelled `a11y: WCAG 2.1 AA fixes`.

---

## Suggestion 1 — Emit `<main>` landmark, not `<div id="main-content">`

**File**: `scripts/build.js`

**Where**: the `renderPageShell`, `renderBridgeShell`, and 404 shell
functions (currently lines 492, 531, 1098 on PubLedge's pinned copy —
`grep -n 'id="main-content"' scripts/build.js`).

**Change**:

```diff
-    <div class="container" id="main-content">
+    <main class="container" id="main-content">
         ${content}
-    </div>
+    </main>
```

Do the same in the three shells and the 404 page.

**Why it matters**:

- **WCAG 2.1 AA — landmark-one-main, region**: axe flags every KaC page
  as missing a `<main>` landmark and as having content outside landmarks.
  The existing `#main-content` anchor already exists for the skip-link
  target; upgrading the element type costs nothing and resolves both
  rules at once.
- **Screen reader navigation**: assistive tech uses landmarks to jump
  between regions. `<main>` is the standard primary-content landmark.
- **Zero breakage**: `<main>` accepts the same attributes and children
  as `<div>`. The `.container` class still applies. Existing CSS
  continues to work.

**Tested in PubLedge**: applied via regex post-process (see
`scripts/build-extras.js` `patchA11y()` function); 15 HTML files patched
per build; no visual or behavioral regressions; axe landmark violations
cleared.

---

## Suggestion 2 — Add `tabindex="0"` to scrollable `<pre>` blocks

**File**: `scripts/build.js` — anywhere `<pre>` is emitted (e.g., the
homepage `Quickstart` block around line 1193 in PubLedge's copy, plus
any markdown rendering paths).

**Change**: emit `<pre tabindex="0">` instead of `<pre>`.

Or, for a safer sweep across all generated pages, add at the end of the
build step:

```js
// Make scrollable <pre> keyboard-focusable (WCAG 2.1.1)
for (const page of generatedPages) {
    const html = fs.readFileSync(page, 'utf8');
    fs.writeFileSync(page, html.replace(/<pre(?![^>]*tabindex)/g, '<pre tabindex="0"'));
}
```

**Why it matters**:

- **WCAG 2.1 AA — scrollable-region-focusable**: if a `<pre>` block
  overflows horizontally (long code lines, wide output), a keyboard-only
  user cannot scroll it. `tabindex="0"` lets them tab into it and use
  arrow keys.
- **Non-intrusive**: mouse users see no change. Keyboard users gain
  access to content they currently can't reach.

---

## Suggestion 3 — Escape or avoid `innerHTML` in generated client JS

**File**: `scripts/build.js` — the inlined JavaScript in the containers
page (`generateContainersPage`) and compare page (`generateComparePage`).

**Lines** (PubLedge's copy):

```js
// Line 708
document.getElementById('itemCount').innerHTML = '<strong>' + count + '</strong> ${cPlural.toLowerCase()}';

// Lines 833, 849
document.getElementById('compareResult').innerHTML = '<p style="color:var(--text-secondary);">Select at least 2.</p>';
document.getElementById('compareResult').innerHTML = html;
```

**Change**: use `textContent` for simple text or build DOM nodes for
markup. For the compare page specifically, the interpolated `html`
string is built from user-selected IDs and entity names. Escape them:

```js
function esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
// then use esc(name) wherever untrusted strings are interpolated
```

**Why it matters**:

- **OWASP A03:2021 — Injection (XSS)**: the inlined script composes HTML
  from frontmatter-derived entity names. If a downstream project adds a
  container with a hostile name, the compare page renders the name as
  unescaped HTML.
- **Low real-world risk** — frontmatter is repo-authored — but the fix
  is a one-line `esc()` helper and it removes an entire class of
  concern for every downstream project.

---

## Additional nice-to-haves (not blocking)

- Emit a `<footer>` element with a class (`site-footer` or similar) so
  downstream stylesheets can target it without relying on the bare tag.
- Let `project.yml` specify a custom `assets/styles.css` path; today
  the stylesheet must be pre-committed at `docs/assets/styles.css`
  (documented in the emission block) which surprises new projects.
- Add a note in README about `docs/` being the Pages publish directory
  AND part of the build output — make the commit-workflow explicit
  (run `npm run build` before commit).

---

## How to open these upstream

One PR per suggestion, or one bundled PR titled:

> `a11y + XSS: emit <main>, tabindex scrollable <pre>, escape compare-page DOM writes`

In the PR description, reference this document and the PubLedge audit:

- Source: https://github.com/snapsynapse/publedge/blob/main/design/upstream-kac-suggestions.md
- Original a11y audit: https://github.com/snapsynapse/publedge/blob/main/audits/a11y-2026-04-19.md
- Original security audit: https://github.com/snapsynapse/publedge/blob/main/audits/security-2026-04-19.md

Each suggestion includes the diff, the rationale, the WCAG / OWASP
reference, and evidence from a downstream project (PubLedge) that the
change is non-breaking.
