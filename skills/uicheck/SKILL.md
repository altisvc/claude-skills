---
name: uicheck
description: Browser-driven interaction QA on a web app — click everything, break forms, walk states, score health, fix loop. Adapted from gstack /qa v2.0 for the Altis stack.
---

# /uicheck — Interaction QA

Systematically QA a running web app **through the browser**: exercise every
interactive element, break every form, walk every state, watch the console,
re-check at mobile viewport — then triage, fix, and re-test until the health
score holds. This is the test class the other gates don't cover: structural
loops verify markup, design gates verify composition, /uicheck verifies that
**clicking things works**.

Adapted from gstack `/qa` v2.0 (garrytan/gstack): methodology, taxonomy, and
health rubric kept; gstack's telemetry/config/versioning plumbing stripped;
tooling rebased on Claude in Chrome.

## Invocation

```
/uicheck <url> [--quick | --exhaustive] [--fix]
```

- Default target: ask, or use the obvious in-flight build (e.g. the dev server
  at http://localhost:3000 — prefer the LOCAL server over SSO-gated deploy
  hosts; identical code, no auth wall).
- **--quick**: homepage + top 5 nav targets; loads? console errors? dead
  links? No per-page checklist.
- Standard (default): critical + high + medium findings, core pages deep,
  secondary pages shallow.
- **--exhaustive**: + cosmetic findings, every page in the sitemap/nav graph.
- **--fix**: after the report, enter the fix loop (Phase 6). Without it,
  report only.

## Setup

1. Browser: `tabs_context_mcp` first (batch-load the Chrome tools via one
   ToolSearch). If the extension isn't connected, ASK the user to reconnect —
   do not retry. Create one tab for the run; close it when done.
2. Server: verify the target answers 200 before opening the browser.
3. Evidence dir: save screenshots to the session scratchpad
   (`<scratchpad>/uicheck/<n>-<page>-<finding>.jpg`), named meaningfully.
4. Note where submissions land: on a local or preview build, forms and
   capture endpoints may still post to LIVE analytics or a real inbox. Prefix
   test submissions with `uicheck:` where a text field allows it. On
   production surfaces, do NOT submit forms — verify to the point of
   submission only, and say so in the report.

## Phase 1 — Orient

Load the entry URL. Screenshot. Enumerate the nav graph (primary nav,
subnavs, footer, in-page tab rows). Build the page list and mark each core
(homepage, search, primary destinations, anything money-path) or secondary
(about/legal). Depth follows importance.

## Phase 2 — Explore (per page)

The per-page checklist. Fetch once, then:

1. **Visual scan** — screenshot; look for overlap, clipped text, horizontal
   scroll, broken images, z-index errors, theme inconsistencies.
2. **Interactive elements** — click every button, tab, link, disclosure.
   Panel tabs must switch; link tabs must navigate where they claim;
   hover/focus states must exist. Keyboard: Tab reaches controls, arrows work
   where a tablist claims them.
3. **Forms** — fill and submit. Then break them: empty submit, invalid email,
   absurd lengths, double-submit. Error states must be specific, success
   states must confirm.
4. **Navigation** — every path in AND out. No dead ends: every page offers a
   next action. Back button behaves.
5. **States** — empty, loading, error, overflow (long names, many rows). If a
   state can't be reached naturally, note it as untestable rather than
   skipping silently.
6. **Console** — `read_console_messages` after interactions. Any new error or
   warning is a finding (errors ≥ high, hydration warnings ≥ medium).
7. **Responsive** — re-check core pages at 375×812 (resize_window or
   viewport): nav collapses correctly, tab rows scroll, nothing clips, text
   legible.

## Phase 3 — Taxonomy

Severity:

| Severity | Definition |
|---|---|
| **critical** | Blocks a core workflow, data loss, crash, or a page that fails to render |
| **high** | Major feature broken/unusable, no workaround (dead primary CTA, form silently fails, console error) |
| **medium** | Works with noticeable problems or a workaround (mobile-only layout break, missing validation, >5s load) |
| **low** | Cosmetic/polish (alignment, hover inconsistency, typo) |

Categories: **Visual/UI · Functional · UX · Content · Performance ·
Accessibility**. Every finding = severity + category + page + reproduction +
screenshot path.

## Phase 4 — Health score

Per category, score 0–10 (10 = no findings; −3 per critical, −2 per high,
−1 per medium, −0.25 per low, floor 0). Composite:

Console 15% · Functional 25% · Visual 15% · UX 15% · Content 10% ·
Performance 10% · Accessibility 10% — and links (404s/dead ends) fold into
Functional. Report the composite as the ship-readiness number, with the
before score preserved if a fix loop runs.

## Phase 5 — Report

One report, most-severe first: findings table (severity · category · page ·
issue · repro · screenshot), health score, untestable list (what and why),
and a one-line ship-readiness verdict, with the paths of the key screenshots.
No fix without the user's ask unless `--fix` was given.

## Phase 6 — Fix loop (only with --fix)

1. Triage: group findings by defect class, not instance. Fix critical + high
   only unless told otherwise.
2. Per class: locate source, MINIMAL fix, `npx tsc --noEmit` + the repo's
   test runner must pass, add a regression test where a harness exists (an
   uncovered behavioral fix is an open finding — say so when a finding lives
   in untested UI), commit atomically.
3. Rebuild + restart the target server, re-run the affected checks, then ONE
   full re-pass of the touched pages. Two clean passes = done.
4. Re-report: before/after health score, per-finding outcome
   (fixed/skipped/untestable), commits.

## Rules

- Evidence verbatim: a finding quotes what was seen (console text, HTTP
  status, screenshot), never a paraphrase.
- Editorial/design judgments are NOT findings — route those to
  a design reviewer (`advisor-design-review`). /uicheck reports what is
  broken, not what is ugly.
- Never test destructive actions on shared data without asking.
- Stale-frame trap: client-router caches serve old builds after a restart —
  hard-reload (cmd+shift+r) before trusting a visual, and verify against
  server HTML (curl) before filing a rendering finding.
- SSR text interpolation inserts `<!-- -->` boundaries — never grep across
  them.
- If the browser extension fails twice, stop and ask; don't loop.

## Field notes

- **Logged-out pass:** launch a fresh Playwright Chromium context (`createRequire('<repo>/package.json')` → `require('playwright')`; browsers already in `~/Library/Caches/ms-playwright`). Never sign the Chrome session out — re-login needs a password. Collect `console`, `pageerror`, and `response` ≥400 per page; screenshot desktop 1280×900 and mobile 375×812 (`isMobile: true`).
- **Mobile in Chrome:** `resize_window` reports success but the viewport does not change. Emulate with a same-origin `<iframe width=375 height=812>` over the page and read `contentDocument`; remove it when done.
- **Console after a crash:** pattern `.` re-dumps the whole minified stack on every call. Use `^(?![\s\S]*#185)[\s\S]*$` (or the relevant error id) or check `document.body.innerText` for "couldn't load".
- **Link check:** `fetch('/path')` only parses from a navigated page; a fresh `newPage()` is `about:blank`. Use node `fetch` with absolute URLs for the anonymous link sweep.
- **Production side effects:** some clicks are writes (opening a metered item, unlocking gated content, requesting a call). Say so in the report; never submit a gate, a request form, or a sign-in email on production.
- **Hidden state:** carousels/tracks with `overflow-x:auto` can open pre-scrolled (`scrollLeft` ≠ 0) — measure it before filing a "text clipped" finding as CSS.
