# Skill: Week in Review

> Draft a company-facing weekly summary from daily logs, session wraps, Granola meetings, and GTMos traction data. Produce a Slack digest (<500 words) and a detailed GitHub markdown. Stage for Christopher's review before publishing.

---

## Skill Metadata

```yaml
id: week-in-review
trigger: /week-in-review
context: orchestrated
returns: slack_draft + github_markdown
required: false
stages:
  - gather
  - pull-traction
  - draft
  - review
  - publish
```

---

## Purpose

Replace ad-hoc internal updates with a consistent, curated weekly summary. Christopher's voice, company-appropriate content only. The summary serves three consumption layers:

| Layer | Format | Where |
|-------|--------|-------|
| **Slack** | <500 word digest, 4 sections | #primary-altis |
| **GitHub** | Full detail with reasoning | `altisvc/notes` → `weekly/YYYY-WXX.md` |
| **Montis** | Q&A over GitHub content | Slack bot (Stanley's build) |

---

## Invocation

```
/week-in-review
```

### Flags (optional)

- `--days=N` — Lookback window (default: 7 days)
- `--dry-run` — Draft only, do not publish
- `--week=YYYY-WXX` — Override week label (default: current ISO week)

---

## Overnight Preflight Mode

The Friday 2am automation runs Stages 1-2 headlessly, staging gathered data for morning review. When `/week-in-review` is invoked interactively, check for staged data first.

### Detection

On invocation, check for `02-projects/operations/overnight/week-in-review-staged.json`. If it exists and `staged_at` is from today (Friday):

1. **Skip Stages 1-2** — data already gathered
2. **Load staged data** — read the JSON
3. **Jump to Stage 3 (Draft)** — produce both Slack and GitHub versions
4. **Stage 4 (Review)** — present drafts for Christopher's review
5. **Stage 5 (Publish)** — on approval, commit to GitHub and send Slack
6. After publish completes, **delete the staged file**

### If staged data is stale or missing

Fall back to the standard Stages 1-2 execution (full data gather).

### Staged file format

```json
{
  "staged_at": "<ISO timestamp>",
  "week_label": "2026-W12",
  "week_start": "2026-03-16",
  "week_end": "2026-03-22",
  "status": "ready_for_drafting",
  "daily_logs": {
    "2026-03-16": "<full content>",
    "2026-03-17": "<full content>"
  },
  "wraps": [
    {"date": "2026-03-16", "title": "...", "content": "<full content>"}
  ],
  "meetings_summary": "<condensed meeting list with classifications>",
  "traction": {
    "report_unlocks_this_week": 0,
    "report_unlocks_total": 0,
    "campaigns_sent": 0,
    "campaign_opens": 0,
    "campaign_clicks": 0,
    "calendly_bookings": 0,
    "new_contacts": 0,
    "hot_contacts": 0,
    "warm_contacts": 0
  },
  "thoughtful_threads": [
    {
      "id": "...",
      "providerThreadId": "...",
      "title": "...",
      "updatedAt": "...",
      "messages": [
        {"role": "user", "content": "...", "createdAt": "..."},
        {"role": "assistant", "content": "...", "createdAt": "..."}
      ]
    }
  ],
  "errors": []
}
```

---

## Content Classification

### What to INCLUDE (company-appropriate)

- Research progress: reports shipped, pipeline, expert sourcing updates
- Product and tooling: infrastructure built, process changes, automation
- Traction: pipeline milestones and deal progress from daily logs/wraps, plus compressed platform metrics
- Decisions made that affect the team
- What's coming next week

### What to SKIP (do not attempt to sanitize — just omit)

- Fundraising details, investor terms, cap table, board strategy
- Compensation, performance feedback, hiring negotiations
- Personal reflections, frustrations, self-coaching notes
- Specific investor names in pipeline context (unless already public/announced)
- Internal team dynamics or interpersonal issues
- Anything the agent is uncertain about — when in doubt, leave it out

### Failure mode

The agent should produce a SHORT section rather than padding with optimistic narrative. If a section has little content, say so honestly (e.g., *"Light week on new inbound — GTMos is now instrumented to surface these going forward."*). Never inflate access into conversion, interest into commitment, or planning into shipping.

**Never fill gaps with conjecture.** If the logs don't say how something was sourced, who initiated it, or why a decision was made — don't invent the detail. State what happened. Stop. A missing attribution is invisible to the reader; a wrong attribution erodes trust.

**Write about what Christopher did and learned, not what the team did.** The daily logs and wraps only capture Christopher's sessions. Thoughtful threads now provide partial visibility into async team work — use this to surface decisions, tool builds, and coordination that happened outside Claude sessions. But don't narrate the full team research effort (expert calls, surveys, analysis) — the team already knows what they did. The value of this document is making Christopher's work and cross-team decisions visible.

**Research section is CEO-level.** Report milestones (published, in progress, blocked) and operational decisions only. If Christopher was on a specific call, mention what he learned — but don't position it as representative of the team's full research effort.

---

## Stage 1: Gather

Read all inputs from the past 7 days (or `--days=N`):

### 1A. Daily Logs

Read all files in `06-daily-log/` within the date range. These contain session summaries, outcomes, open threads, and forward implications.

### 1B. Session Wraps

Read all files in `05-archive/claude/` within the date range. These contain key decisions, action items, and notable context.

### 1C. Meetings

Read `02-projects/operations/granola-sync.json` to get meeting list for the period. Do NOT read full transcripts — use titles, classifications, and attendee lists only. If meeting markdown files exist in `04-meetings/`, read the Summary section (not full transcript).

### 1D. Thoughtful Threads (Full Content)

Fetch recent Thoughtful.app threads from the past 7 days **with full message content**. These capture async work, decisions, and context that may not appear in daily logs — especially conversations between team members outside of Claude sessions. This is the primary source for team activity that happens outside Christopher's Claude sessions.

**Step 1: Fetch thread list**

```bash
curl -s -H "Authorization: Bearer $THOUGHTFUL_API_KEY" \
  "https://www.thoughtful.app/api/v1/threads" | \
  jq '[.threads[] | select(.updatedAt >= "WEEK_START") | {id, providerThreadId, title, updatedAt, lastMessageAt}]'
```

Replace `WEEK_START` with the ISO date for 7 days ago.

**Step 2: Fetch full messages for each thread**

For each thread in the filtered list, fetch the complete conversation:

```bash
curl -s -H "Authorization: Bearer $THOUGHTFUL_API_KEY" \
  "https://www.thoughtful.app/api/v1/threads/{providerThreadId}/messages"
```

This returns `{ "messages": [{ "id", "role", "content", "createdAt" }, ...] }` — both user and assistant messages with full text.

**Step 3: Classify threads for the draft**

Look for threads that indicate:
- Decisions made outside of Claude sessions
- Team coordination (Jason, Stanley, Maxine, Mehdi)
- Work-in-progress on deliverables
- Tool builds, debugging sessions, infrastructure changes
- Topics that should appear in the summary but aren't in the logs

**Step 4: Prepare for persistence**

For each thread, prepare a markdown file for GitHub (see Stage 5B for format). Thread content is persisted to `altisvc/notes` so Montis can index it — this is the durable knowledge asset, not just input to the weekly draft.

**Rate limiting:** If more than 20 threads updated in the period, batch the message fetches with a 500ms delay between calls to avoid rate limits.

### 1E. Agent Status

Read `~/GTM_Agents/agent-status.json` for latest GTMos health metrics.

---

## Stage 2: Pull Traction Data

Run the traction data pull script to get metrics from Supabase (unlocks), Mailchimp (campaigns), and Calendly (bookings).

```bash
node ~/GTM_Agents/scripts/weekly-traction-pull.js
```

This produces `/tmp/week-in-review-traction.json` with the metrics defined in the staged file format above.

**If the script fails or doesn't exist yet:** Skip this stage gracefully. Use `agent-status.json` metrics as a fallback, and flag in the draft that traction numbers are approximate.

---

## Stage 3: Draft

Produce two artifacts:

### Slack Version (<500 words, #primary-altis)

```
Chris's Week in Review — Week of [Month Day]

RESEARCH
- [2-3 bullets: reports shipped, pipeline, expert sourcing]

PRODUCT & TOOLS
- [2-3 bullets: infrastructure, automation, process changes]

TRACTION
- [Lead with pipeline milestones: deals closed, partnerships confirmed, prospect meetings of significance, credible next steps — mine daily logs and session wraps for these]
- [Platform metrics compressed to 1 line: unlocks, readers, reports live, contacts updated]

NEXT WEEK
- [2-3 bullets: what's coming]
```

**Traction leads with pipeline milestones, not metrics.** Scan daily logs and session wraps for deal closings, partnership confirmations, significant prospect meetings, and credible next steps. These are the headline — they tell the team what's moving. Compress platform metrics (unlocks, readers, contacts synced) into a single summary line at the end of the section. The audience is the team, not a dashboard. When Lola (linkedin-tracker) data becomes available, add top-of-funnel metrics to the summary line.

### GitHub Version (`weekly/YYYY-WXX.md`)

The GitHub version is a **structured knowledge document consumed by Montis** (Stanley's Claude-backed Slack bot, which indexes the `altisvc/notes` repo). The audience is an LLM, not a human reader. Optimize for retrieval and extraction, not narrative flow.

**Montis-optimization rules:**
- **Structured data over prose.** Use tables, key-value pairs, and consistent schemas. Avoid paragraphs where a table row would do.
- **No narrative.** Facts, decisions, and context only. No transitions, no editorializing, no "this week we..."
- **Self-contained entries.** Every fact should be interpretable without reading the rest of the document. Repeat context (agent names, tool names) rather than using pronouns or references.
- **Decisions include reasoning.** Format: `Decision: X. Reason: Y.` So Montis can answer both "what happened?" and "why?"
- **Explicit relationships.** "Emmy (gmail-sync) writes to HubSpot property `outbound_count`" — not "Emmy syncs email data."
- **Temporal anchoring.** Tag facts with the date they became true when relevant: "As of 2026-03-19, Scout uses incremental sync."
- **Include file paths, env var names, CLI commands, API endpoints, property names.** These are the highest-value retrieval targets.
- **No redundancy compression.** If two sections reference the same tool, name it fully in both. Montis may retrieve one section without the other.

Header:

```markdown
# Week in Review — YYYY-WXX

**Period:** March 16 - March 22, 2026

---
```

---

## Stage 4: Review

Present both drafts to Christopher in the conversation:

1. Show Slack version first (this is what goes out to #primary-altis)
2. Show GitHub version second
3. Ask: "Ready to publish both, or do you want to edit?"

**There is no Slack draft mode.** Slack MCP sends messages directly. Christopher edits the text in the conversation (tells you what to change, or provides revised text), then approves. Only then does Claude send via Slack.

**If Christopher edits:** Apply changes, re-present the updated version, and confirm again.
**If Christopher approves:** Proceed to Stage 5.

---

## Stage 5: Publish

### 5A. GitHub Commit (Weekly + Thoughtful Threads)

```bash
cd /tmp/altis-notes || git clone git@github.com:altisvc/notes.git /tmp/altis-notes
cd /tmp/altis-notes
git pull origin main
mkdir -p weekly
mkdir -p thoughtful/YYYY-WXX
# Write the GitHub version to weekly/YYYY-WXX.md
# Write each Thoughtful thread to thoughtful/YYYY-WXX/{sanitized-title}.md
git add weekly/YYYY-WXX.md thoughtful/YYYY-WXX/
git commit -m "Week in review: YYYY-WXX (+ N Thoughtful threads)"
git push origin main
```

**Thoughtful thread file format:**

Each thread becomes a standalone markdown file optimized for Montis retrieval:

```markdown
# {Thread Title}

**Thread ID:** {providerThreadId}
**Created:** {createdAt}
**Last updated:** {updatedAt}
**Participants:** {inferred from message content — user = Christopher or team member}

---

## Messages

### {role} — {createdAt formatted}

{message content}

### {role} — {createdAt formatted}

{message content}

...
```

**Content rules:**
- Include ALL messages (user + assistant) — the assistant responses contain decisions, code references, and reasoning that are high-value retrieval targets for Montis
- Preserve file paths, env var names, CLI commands, API endpoints mentioned in messages — these are the highest-value search terms
- Do NOT summarize or compress — Montis needs the raw content for accurate retrieval
- Sanitize title for filename: lowercase, replace spaces with hyphens, remove special chars, truncate to 60 chars
- If a thread has >50 messages, split into `{title}-part1.md`, `{title}-part2.md` (25 messages each)

**Dedup:** Before writing, check if `thoughtful/YYYY-WXX/{filename}.md` already exists with the same `providerThreadId`. If so, overwrite (thread may have new messages since last sync). Do NOT duplicate threads across weeks — a thread goes in the week it was last updated.

### 5B. Slack Message

Send the Slack version to #primary-altis (channel ID: C0A6MCUSTQS) using Slack MCP tools.

**Important:** Use `mcp__slack__conversations_add_message` (not native Slack connector) since native connector may not be loaded in overnight sessions. If MCP is unavailable, fall back to native `slack_send_message`.

### 5C. Cleanup

Delete `02-projects/operations/overnight/week-in-review-staged.json` if it exists.

---

## Voice and Tone

This is **Chris's voice** — not a corporate update, not an AI summary. Match the voice guide at `01-context/voice-christopher.md`:

- Start with the frame, not the detail
- Structure over flourish
- Be honest about what's thin
- No buzzwords, no inflation
- Sentence case, no emoji, no periods on bullets

The audience is the Primary team and Altis leadership. They're sophisticated — don't over-explain. They'd rather know what actually happened than read a polished version of what you wish happened.

---

## State Management

No persistent state file needed. Each run reads the current week's data fresh. The staged file is ephemeral (created by overnight script, consumed and deleted by the skill).

---

## Error Handling

| Error | Action |
|-------|--------|
| No daily logs found | Warn Christopher, draft from wraps + meetings only |
| Traction pull fails | Use agent-status.json fallback, note "approximate" |
| GitHub push fails | Show the markdown, ask Christopher to push manually |
| Slack send fails | Show the message, ask Christopher to paste into channel |
| Less than 3 days of data | Warn that summary may be thin, offer to expand lookback |
