---
name: checkin
description: Run the morning check-in — Slack sweep, calendar check, task review, daily briefing
---

Run the morning check-in skill with enforced stages. This is the ONLY way to do a morning check-in.

**Invoke the `checkin` skill from `.claude/skills/checkin/SKILL.md` and follow it exactly.**

## Stages (cannot be skipped or reordered)

1. **Date Confirm** — State today's date explicitly. Do not assume.
2. **Slack Sweep** — Read #altis-brain-inbox, #primary-altis, #all-altis. MUST happen before tasks.
3. **Calendar Check** — Open Google Calendar in Chrome browser. Read today + next working day. Flag meetings needing prep. Acknowledge solo time blocks as task commitments.
4. **Task Review** — Read christopher-tactical-todos.md, ms-claudia-backlog.md. Cross-reference Slack commits, calendar blocks, and Granola meeting action items.
5. **Briefing** — Unified daily brief: urgent items, today's calendar, today's focus, tomorrow preview, Slack highlights, stale tasks, proposed updates.
6. **Completeness Check** — Ask: "Does this look complete, or am I missing anything?"

Each stage produces a checkpoint output. Each stage requires the previous stage to be complete.

## Critical Rules

- **NEVER skip the Slack sweep.** Not even if you think Slack is quiet. Check it.
- **NEVER skip the calendar check.** Solo time blocks are commitments. Meetings need prep flagged.
- **NEVER assume dates.** Confirm today's actual date before referencing any events.
- **NEVER display partial task lists.** Cross-reference all sources before presenting.
- **ALWAYS ask the completeness question** at the end. Christopher catches things you miss.
- **Use browser tools** (not WebFetch) for Google Calendar and any URLs/web content.

## Flags

- `--quick` — Run all stages but output abbreviated briefing (Needs Attention + Today's Calendar + Today's Focus only)

## If a stage fails

If a tool fails (Slack unavailable, Granola not connected, etc.):
- Report the failure explicitly in the checkpoint
- Do NOT silently skip the stage
- Continue to the next stage after noting the gap
