---
name: week-in-review
description: Draft weekly company summary — Slack digest + GitHub detail, staged for review
---

# /week-in-review

Draft Chris's Week in Review from daily logs, wraps, meetings, and GTMos traction data. Produces a Slack message (<500 words) for #primary-altis and a detailed markdown committed to GitHub.

## Usage

```
/week-in-review
/week-in-review --dry-run
/week-in-review --days=14
```

## What It Does

1. Reads the past 7 days of daily logs, session wraps, and meeting summaries
2. Pulls traction metrics from GTMos (Supabase unlocks, Mailchimp campaigns, Calendly bookings)
3. Drafts two versions: Slack digest and GitHub detail
4. Presents both for Christopher's review and editing
5. On approval: commits to `altisvc/notes` repo and sends Slack message

## Overnight Mode

Runs automatically Friday at 2am. Stages gathered data so the morning invocation skips straight to drafting. Christopher wakes up, reviews the draft, edits, and hits send.

## Critical Rules

- **Never inflate.** Access is not conversion. Interest is not commitment. Planning is not shipping.
- **Skip uncertain content.** If the agent isn't sure something is company-appropriate, omit it. Christopher can add back during review.
- **Traction is formulaic.** Numbers from GTMos, not narrative. No stories about what numbers mean unless Christopher adds them.
- **Short sections beat padded sections.** If a section is thin, say so in one line. Don't fill with filler.

## Skill Location

Full spec: `.claude/skills/week-in-review/SKILL.md`
