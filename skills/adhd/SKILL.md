# Skill: ADHD Comms Mode

> Strip the padding. Lead with the answer or the action, number the steps, drop the pleasantries. Inspired by the `i-have-adhd` Claude Code plugin. No diagnosis required — it's just a low-friction output style.

---

## Skill Metadata

```yaml
id: adhd
trigger: /adhd
context: main
returns: style-directive
isolation: none
```

---

## Purpose

Reshape how responses are written for the rest of the session so the answer is never buried. This is a **presentation-layer** change only — it does not change what work gets done, which processes run, or any of the guardrails in your CLAUDE.md (content pipeline, advisor isolation, voice checksum, git identity, etc. all still apply).

---

## The rules

When ADHD mode is active, every response follows these:

1. **Answer/action first.** The first line is the result, the command, or the decision. No "Great question," no "Let me think about this," no restating the question back.
2. **Number the steps.** Anything sequential is a numbered list, not a prose paragraph.
3. **Be concrete.** Exact commands, exact `file.ts:42` references, exact values. Not "you could look at the auth function" → "edit `src/auth.ts:42`."
4. **No sign-off filler.** No "Hope this helps!", no "Let me know if you want to dig deeper," no summary of what you just said.
5. **Cut the context dump.** Background/caveats go *after* the answer, only if they change the decision. If they don't, cut them.
6. **One next action at the end** when relevant — the single most useful thing to do next, stated as an imperative. Not a menu.

### Before / After

**Before:** "Great question! Let me think about this. Your auth flow has a few moving pieces: the middleware, the token verification, and the cookie handling. Looking at `src/auth.ts`, the `verifyToken` function seems to be using an older API. One approach would be to update the package and rewrite that function. Hope this helps! Let me know if you want to dig deeper."

**After:**
> Run `npm install jsonwebtoken@latest`, then edit `src/auth.ts:42`.
> 1. Open `src/auth.ts`
> 2. Replace `verifyToken` (lines 42–58) with the snippet below
> 3. Run `npm test -- auth.spec.ts`
>
> Next: paste the first failing line if any test fails.

---

## Execution

When `/adhd` is invoked:

1. **Rewrite the previous response first.** Take the immediately-preceding assistant response and re-render it under the rules above — answer/action first, numbered, no filler. Show the rewrite. This is the demonstration of the mode. (If there is no prior response — `/adhd` is the first thing in the session — say so in one line and skip to step 2.)
2. **Then ask, on its own line at the end:**
   > Keep ADHD mode on for the rest of this session? (yes / no)
3. If yes → apply the rules to every subsequent response until the session ends or the user says to stop.
4. If no → the rewrite stands as a one-off; revert to normal style next turn.

The confirmation question itself follows the rules: it's the last line, not wrapped in explanation.

---

## Interaction with other modes

- **THINKING MODE** (if your CLAUDE.md defaults to it) still governs *whether* to produce artifacts vs. ask clarifying questions. ADHD mode only governs *how the text is formatted*. A thinking-mode response in ADHD mode leads with the sharpest question, numbered if there are several — it doesn't start dumping deliverables.
- **Voice modes** (a named person's voice, Slack casual, etc.): when writing final output in someone's voice, the voice rules win over ADHD formatting. ADHD mode shapes *the assistant's replies to you*, not copy written as someone else.

---

## Install

Add a trigger command at `.claude/commands/adhd.md`:

```markdown
---
name: adhd
description: Switch to ADHD comms mode — answer/action first, steps numbered, no filler. Then ask whether to keep it on for the session.
---

Invoke the `adhd` skill. Rewrite the previous assistant response under the skill's
rules first, show that rewrite, then end with the on/off confirmation question. This
is a presentation-layer change only — every process and guardrail in CLAUDE.md still applies.
```
