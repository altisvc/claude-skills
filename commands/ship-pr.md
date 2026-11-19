# /ship-pr

Take a change from branch to merged with an enforced review and testing loop. Adapted from the Altis engineering `pr-sop`.

## Usage

```
/ship-pr                      # raise and review the current branch
/ship-pr no-deploy            # stop once the PR is green
```

## What it does

1. **Raise** — go green locally (the repo's Makefile or npm gate, tests included), branch if on trunk, `gh pr create` with a self-explanatory body.
2. **Verify** — independent subagent review on the diff alone, plus CI. Findings are posted as a PR comment.
3. **Address** — fix real findings, prove changes with tests, post the resolution.
4. **Re-loop** until the gate is green and no meaningful findings remain.
5. **Merge per the repo's policy.** On a production repo with an engineering owner it stops at green and the owner merges.

## Behavior

Invokes the `ship-pr` skill.
