---
name: audit
description: Weekly task list integrity audit — find unlogged commitments, stale tasks, duplicates
---

Run the task audit skill with enforced stages. This reconciles your Trello board against Slack commitments, Granola meeting action items, and session archives.

**Invoke the `audit` skill from `.claude/skills/audit/SKILL.md` and follow it exactly.**

## Stages (cannot be skipped or reordered)

1. **Snapshot** — Pull all active Trello cards (Review, Action, Waiting lists) via API
2. **Commitment Scan** — Search 7 days of Slack (Altis + Primary + DMs) for commitment language
3. **Granola + Archive Scan** — Extract action items from recent meetings and Claude session archives
4. **Diff** — Cross-reference commitments against Trello cards. Classify: UNLOGGED, STALE, AT_RISK, OVERDUE, DUPLICATE, COMPLETED
5. **Report** — Present findings with proposed Trello updates. Wait for approval before applying.

Each stage produces a checkpoint output. Each stage requires the previous stage to be complete.

## Critical Rules

- **NEVER auto-apply changes.** Present the report and wait for Christopher's approval.
- **NEVER skip the DM scan.** 1:1 commitments are highest accountability.
- **NEVER skip Granola.** Meeting action items are the most commonly dropped.
- **ALWAYS show evidence.** Every unlogged commitment must include the source message/meeting.
- **Use browser tools** (not WebFetch) for Primary Slack search.
- **One action = one card.** Sub-steps go in card description, not as separate cards.
- **Owner prefix on all cards.** `Christopher:`, `Jason:`, `Stanley:`, etc.

## Flags

- `--days=N` — Lookback window (default: 7 days)
- `--source=<name>` — Limit to: `slack`, `granola`, `archives`
- `--quick` — Slack commitment scan + Trello diff only (skip Granola and archives)

## Recommended Cadence

Weekly, Monday mornings before the family meal. Can also be run ad-hoc.

## Relationship to Other Commands

```
/checkin  — Daily morning briefing (fast, 60-90s)
/audit    — Weekly integrity check (thorough, 3-5 min)
```

`/checkin` catches what's visible. `/audit` catches what's invisible.
