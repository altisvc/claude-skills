# Skill: Chika (Design Loop)

> The meta-skill that corrals your design agents into one enforced loop. Nine steps, rotating up to three rounds. A composition doctrine plans, a design advisor judges, a craft reviewer polishes on-token, your framework skills implement. A state file on disk makes the order mechanical, so a later turn cannot quietly skip the verify pass.

---

## Skill Metadata

```yaml
id: chika
trigger: /chika
context: main
returns: loop-report
isolation: none
depends_on:
  - skill: loop-state
    check_file: ".claude/skills/chika/scripts/chika-loop.mjs"
    message: "chika-loop.mjs is missing. Without it the steps are unenforced; do not run the loop from memory."
next_steps:
  - "Interaction QA once the loop closes"
```

---

**Core rules:**
- Launch parallel agents in a SINGLE message, **foreground only**. Background task IDs
  become unresolvable after completion and the outputs are lost.
- Structured findings only from sub-agents. No prose, no reasoning chains, no source
  quotes.
- Never paste a full sub-agent output into the conversation. Extract issue + location +
  severity + fix.
- Never invent a token, a font, a radius, or a component. Drift is reported, not
  resolved.

---

## Purpose

Most teams have several design agents and no discipline connecting them. Run
individually they each do their job and the work still ships wrong, because the failure
has never been the agents. It has been the sequence: a direction consult that happened
after the build, a review that read code instead of renders, a fix presented as
verified when nothing re-rendered.

`/chika` makes the sequence mechanical. Each step must record evidence before the next
unlocks, and the evidence is checked against the filesystem, not taken on the model's
word.

**What the loop actually guarantees.** Steps run in order, once each. Screenshots are
real PNGs at the declared viewport, written during the current round, and desktop and
mobile are different files. The step-9 captures must postdate the step-5 captures, so
"I verified the fix" cannot be satisfied by the very renders that showed the defect.
The loop cannot rotate more than three times.

**What it does not guarantee.** It cannot stop an agent from pointing evidence at a
file full of nonsense. No state file can. That is what the reviewing agents and a human
are for. Do not describe this loop as impossible to skip — describe it as impossible to
skip *silently*.

---

## Invocation

```
/chika <slug> <surface>          start a new loop
/chika status [<slug>]           where am I, and what does the next step demand
/chika resume <slug>             pick up a loop from a previous session
```

`<slug>` is lowercase-dashed and becomes the state filename. `<surface>` is the path or
URL the loop is about.

```
/chika research-coverage app/research/page.tsx
/chika status research-coverage
```

---

## The state file is the source of truth

Every step boundary goes through the script. It derives its own repo root, so it is
worktree-safe.

```bash
node .claude/skills/chika/scripts/chika-loop.mjs init <slug> --surface <path-or-url>
node .claude/skills/chika/scripts/chika-loop.mjs status <slug>
node .claude/skills/chika/scripts/chika-loop.mjs advance <slug> --step N -e "<evidence>" [-e "<evidence>"...]
node .claude/skills/chika/scripts/chika-loop.mjs close <slug> --verdict pass|fix|escalate
```

Evidence specs:

| Spec | Means | Checked for |
|---|---|---|
| `note:<text>` | what you did, in your words | minimum length — a one-word note is rejected |
| `file:<path>` | findings or a spec on disk | exists, non-empty, written this round |
| `shot:desktop:<path>` | a desktop capture | real PNG, right width, written this round (step 9: after step 5) |
| `shot:mobile:<path>` | a mobile capture | same |

**Never hand-maintain the state file.** If `advance` rejects your evidence, the answer
is to produce the evidence, not to edit the JSON. Read the rejection: it names exactly
what is missing.

State lives in `.chika/<slug>.json`. **Add `.chika/` to your `.gitignore`** — it carries
local paths and in-flight findings.

Evidence artifacts go in your session scratchpad under
`<scratchpad>/chika/<slug>/round<N>/` — `spec.md`, `direction.md`, `advisor.md`,
`coverage.md`, `polish.md`, `verify.md`, `desktop-<page>.png`, `mobile-<page>.png`.

---

## The nine steps

| # | Step | Who runs it | Evidence |
|---|---|---|---|
| 1 | Frame | you, in main context | `note:` |
| 2 | Composition plan | your coverage/composition doctrine | `file:` |
| 3 | Advisor direction consult | your design advisor | `file:` |
| 4 | Build | you, plus framework skills | `note:` |
| 5 | Capture | headless browser | `shot:` × 2 |
| 6 | Advisor review | your design advisor | `file:` |
| 7 | Composition review | your composition doctrine | `file:` |
| 8 | Craft polish | your on-token craft reviewer | `file:` |
| 9 | Verify & gate | advisor, regression-scoped | `file:` + `shot:` × 2 |

Steps 1–3 run once, in round 1. A `fix` verdict rotates to step 4, so every later round
is build → capture → review → verify.

### Step 1 — Frame

State the surface and which output system it belongs to. State what it must prove:
which entities are the rows, which proof is the columns. Then **inventory the real
components** it will reuse by reading the target repo — the live vocabulary outranks
the token file where they differ, and that difference is drift to report, not resolve.

Never invent a component. If the surface needs one that does not exist, name the
nearest existing one and flag the gap.

### Step 2 — Composition plan

Run your composition doctrine (`coverage-craft` is the one this pairs with). Produce
the spec: first-paint inventory, anatomy, chrome budget, disclosure map, states, tokens
used, hand-offs. Write it to `round1/spec.md`.

This is composition only. If the spec wants a new colour or type role, that is a step-3
question, not a decision you make here.

### Step 3 — Advisor direction consult

Consult your design advisor **on the spec, before any code exists.** This is the
cheapest place to catch a wrong direction, and skipping it is the most common way a
design-forward build goes wrong.

Give the advisor the spec, the surface, and the component inventory from step 1, and
ask for a direction verdict plus blockers. **Editorial findings are blockers, not
polish.** Fold them into the spec before building, and say in the step-4 note which
ones you folded in.

### Step 4 — Build

You execute. Never delegate the build. Use your framework skills for implementation
questions — a11y and interface rules, framework performance, component APIs.

The note records what was built and every file touched.

### Step 5 — Capture

Live full-page screenshots at branch HEAD, in this session, for **every affected
surface** at both viewports. Not the surface under construction only — the classic miss
is a page the reviewer clicks first that no round ever looked at.

Playwright is the reliable path:

```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [name, w] of [['desktop', 1512], ['mobile', 390]]) {
    const c = await b.newContext({ viewport: { width: w, height: 900 } });
    const p = await c.newPage();
    await p.goto(process.env.URL, { waitUntil: 'networkidle' });
    await p.screenshot({ path: process.env.OUT + '/' + name + '-home.png', fullPage: true });
    await c.close();
  }
  await b.close();
})();
"
```

A browser-control MCP is the fallback for auth-gated surfaces. Prefer a LOCAL dev
server over an SSO-gated deploy host: identical code, no auth wall.

The gate reads the PNG header, so a mislabelled or copy-pasted capture is rejected on
its width. Viewport widths are configurable in `VIEWPORTS` at the top of the script.

### Steps 6, 7, 8 — the review fan-out

**Launch all three in a SINGLE message, foreground.** They are read-only against the
same renders, so they are safe in parallel, and they advance one at a time afterwards.

- **6 — design advisor**: the captured renders, **both viewports**, every affected
  surface. Severity-rated findings tied to tokens or brand rules. This is the visual
  gate; a text or code sweep never substitutes for it.
- **7 — composition review**: point it at the **live surface**, not the screenshots
  alone, so it can check structure and tokens rather than pixels.
- **8 — craft reviewer**: the on-token chrome pass plus any deterministic drift
  detector. Check the detector actually ran with its full rule engine rather than
  silently degrading.

Collect structured findings into three files. Extract issue, location, severity, fix.
Discard the reasoning.

Then apply the fixes. A fix is not a step of its own because a fix without verification
is not a result — which is what step 9 is for.

### Step 9 — Verify and gate

**Re-capture after the fixes.** The script enforces this: step 9's screenshots must
postdate step 5's, so the renders that showed the defect cannot stand in for the
renders that prove it gone.

Then run the advisor once more, **scoped as a regression check**: "confirm findings 1–N
from step 6 are resolved." Not a fresh audit. A fresh full audit at step 9 surfaces new
findings every round and the loop never converges. New findings go into the **next**
round's step 3, not this one.

Write the verdict to `verify.md`, listing each step-6 finding as resolved or not.

---

## Closing a round

```bash
node .claude/skills/chika/scripts/chika-loop.mjs close <slug> --verdict pass|fix|escalate
```

- **`pass`** — every blocker resolved and confirmed on the re-render. Present with the
  live preview URL alongside the screenshots. Screenshots are illustrations; the
  preview link is the artifact.
- **`fix`** — blockers remain. Rotates to step 4, round + 1, and the freshness clock
  resets so last round's evidence no longer counts.
- **`escalate`** — hand it to a human. Required at the round cap.

**The cap is three rounds.** At the cap `fix` is refused and the script says so. That is
deliberate: an unbounded loop is how a session burns into the context wall, and a
multi-agent run that dies mid-pipeline loses its subordinate outputs entirely. Three
rounds without convergence is a signal the direction is wrong, which is a human
question, not another rotation.

---

## Checkpoint format

After each step, print:

```
━━━━━━━━━━━━━━━━━━━
Chika <slug> · round N/3 · step K — <title>
Status: Complete | Blocked
━━━━━━━━━━━━━━━━━━━

<findings or what was done, compressed>

Evidence recorded: <the specs passed to advance>
Next: step K+1 — <title>
```

When a round closes, print the round summary: blockers found, blockers fixed, what
carried to the next round.

---

## When the agents disagree

A design advisor's "whitespace does the work" heuristic and a craft reviewer's
`distill` / `quieter` commands can push a dense surface sparse. On a coverage surface,
the composition doctrine wins on *information* and they win on *chrome*. Put the
disagreement in the round summary rather than splitting the difference.

**Identity never moves.** Every agent in the loop reads the tokens; none writes them. A
finding that would change palette, type, radius, or brand direction is routed to a
human, not resolved in the loop.

---

## Forbidden shortcuts

| Shortcut | Why |
|---|---|
| Running the steps from memory without the script | The script is the persistence. A later turn will skip the verify pass |
| Editing `<slug>.json` by hand | Produce the evidence instead |
| Reviewing code or rendered text instead of screenshots | Text sweeps supplement, never substitute |
| Desktop only | Both viewports, every round, every affected surface |
| Presenting a fix as verified without step 9 | A fix applied from findings is a claim, not a result |
| A fresh full audit at step 9 | Guarantees non-convergence. Step 9 is a regression check |
| Launching the review agents sequentially or in background | Sequential wastes wall clock; background loses outputs |
| Rotating past three rounds | Escalate to a human instead |
| Skipping step 3 because the build seems obvious | Direction consult before code is the cheapest gate in the loop |

---

## Tests

The state machine ships with its suite:

```bash
node --test .claude/skills/chika/scripts/chika-loop.test.mjs
```

32 tests. They are worth re-running after any edit to the script, and the suite is
built to fail when a gate is disabled rather than merely when the code crashes —
disabling any one of the nine gates breaks at least one test.

---

## Calibration

- **Design advisor** — the agent consulted at steps 3, 6 and 9.
- **Composition doctrine** — the skill run at steps 2 and 7. Pairs with
  `coverage-craft`; substitute your own if you have one.
- **Craft reviewer** — the on-token polish agent at step 8.
- **Viewport widths** — `VIEWPORTS` at the top of `chika-loop.mjs`, default 1512 and
  390. The PNG width check keys off these.
- **Round cap** — `MAX_ROUNDS`, default 3.
- **State directory** — `.chika/` at the repo root, or set `CHIKA_REPO`. Add it to
  `.gitignore`.
