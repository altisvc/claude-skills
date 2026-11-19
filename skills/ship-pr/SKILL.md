---
name: ship-pr
description: SOP for taking a change from branch to merged — raise the PR with a self-explanatory description, run an independent subagent review in a loop, address real findings, prove the change with tests, re-loop until clean, then merge per the repo's rules. Use when asked to ship / land / raise a PR, or after finishing a change that should go out. Adapted from the Altis engineering pr-sop.
allowed-tools: Bash, Agent, Read, Edit, Write, Skill
user_invocable: true
---

# Ship a PR

End-to-end SOP for landing a change: raise → verify → address → re-loop → merge.

The point of this skill is the **independent reviewer**: a fresh subagent that never saw the implementation reasoning. It does not get skipped because an agent wrote the code, or because the change looks small.

## Merge policy — resolve first

Before anything else, find out who is allowed to merge and deploy in this repo. Read its `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md` and branch protection (`gh api repos/{owner}/{repo}/branches/{branch}/protection`).

| Kind of repo | What this skill does |
|---|---|
| Production site or app with an engineering owner (at Altis: the altis.vc site repo and its `staging` branch) | **PR + green checks, then STOP. The owner merges. Never self-merge, never deploy from your clone.** Request the owner as reviewer with `gh pr create --reviewer <login>`, not only in the PR body |
| Anything that can run database migrations on merge | PR, then STOP. The owner merges |
| A repo you own outright (internal tools, mock sites, docs) | Merge when clean, deploy if the repo has a deploy path, then report what went out |
| Unsure | Treat it as the first row and ask |

If the invocation says "no deploy" or "PR only", stop after the PR is green.

## 1. Raise

- **Go green locally before committing.** Run the repo's full gate (Makefile or npm target over a raw command), including its tests. Don't commit until it passes.
- If on the default branch, branch first. Never PR from the trunk. Branch from a freshly fetched `origin/<default>`, not a stale local one.
- Commit only the work for this change. Stage your paths by name; leave unrelated working-tree edits alone. Commit as the person whose work it is.
- Push, then `gh pr create` with a **self-explanatory** title and body.

### PR description standard

The body must stand on its own months later. No "Phase 1, see Slack." Structure:

1. **What & why** — the problem in one or two plain sentences, then what changed. Problem → change → impact.
2. **Plan reference** — if the change implements a checked-in plan, cite the file by path and name the phase.
3. **Test evidence** — what tests cover this change and their result. If coverage is missing, the PR says so explicitly. That disclosure is mandatory.
4. **Visual changes** — a before and after screenshot committed to the repo and linked by a permalink pinned to the commit SHA, plus the preview URL.

## 2. Verify — review, and CI where it exists

Run in parallel:

- **Independent subagent review (authoritative).** Spawn a fresh Agent on the *diff alone*: give it `git diff <base>...HEAD` and ask for correctness bugs and meaningful simplifications, not nits. Do **not** hand it your conclusions.
- **A second reviewer if you have one** (`/code-review`, or a different model through its plugin). A reviewer that only reads the diff is weaker than one that also runs the tests; prefer the second kind.
- **CI.** `gh pr checks <pr> --watch` until required checks complete. Where there is no CI, the local gate plus the reviews are the bar.
- **Post the review to the PR** as a `gh pr comment`, so the trail lives on the PR and not only in this session. Skip only if review found nothing.

## 3. Address

- Fix every real finding (bugs, correctness, missing coverage). Note-and-skip pure nits, stating which and why.
- **Tests:** a behavioural change without a test that proves it is an open finding, not a completed task. Add or extend coverage. If the repo lacks a harness for the code you touched, extract the pure logic so it is testable, or say plainly what was verified by hand.
- Commit and push the fixes.
- **Post the resolution** as a PR comment: how each finding was handled (fixed in `<sha>` / skipped because …).

## 4. Re-loop or proceed

- Pushed anything in step 3 → return to step 2.
- Clean = local gate green, CI green where it exists, and no meaningful findings left. When unsure, loop once more.

## 5. Merge

- Honour the merge policy from the top. On an owner-merged repo: stop at green and hand over the PR link and the preview URL.
- Where you may merge: squash by default, deploy if that is the repo's rule, verify it succeeded.
- Report final state: PR link, merge status, deploy status, anything outstanding.

## Rules

- The independent reviewer gets the diff, never your conclusions. That independence is the value.
- One change per PR. Don't sweep unrelated edits.
- Never merge red, over unaddressed meaningful findings, or into a repo someone else owns.
- Prefer Makefile / npm-script targets over raw commands.
