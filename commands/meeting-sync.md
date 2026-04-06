---
name: meeting-sync
description: Sync Granola meetings — classify, extract follow-ups, flag for GitHub
---

Sync new Granola meetings to the vault with type-specific follow-up extraction.

**Invoke the `meeting-sync` skill from `.claude/skills/meeting-sync/SKILL.md` and follow it exactly.**

## Stages (cannot be skipped or reordered)

1. **Discover** — List recent Granola meetings, diff against sync state, identify new meetings
2. **Sync and Classify** — Fetch transcripts, classify meeting type, write to 04-meetings/
3. **Follow-ups** — Load type-specific template, extract actionable follow-ups with owner tags
4. **Review** — User confirms follow-ups, toggles GitHub flag, adds anything missed

All unsynced meetings sync automatically. No selection gate. User decisions happen downstream at the follow-up and GitHub stages.

## Flags

- `--days=N` — Lookback window (default: 14 days)
- `--dry-run` — Show what would sync without writing files

## Meeting Types

Classified automatically from participants + transcript:
- `team` — Internal Altis (@altis.vc only)
- `investor` — VC meetings, fundraise conversations
- `prospect` — Potential Altis customers
- `recruiting` — Candidate interviews
- `board-advisor` — Emily, board members
- `partner` — External collaborators, vendors

## Deferred Capabilities

- **Task routing** — pending backlog architecture redesign
- ~~**GitHub push**~~ — **RESOLVED:** pushes to `altisvc/notes` (Stage 5)
- **Checkin integration** — pending checkin rearchitecture
