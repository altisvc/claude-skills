# Skill: Meeting Sync

> Sync new Granola meetings to local vault, classify by type, extract follow-ups using type-specific templates, route tasks with owner tags, and flag meetings for GitHub knowledge sharing.

---

## Skill Metadata

```yaml
id: meeting-sync
trigger: /meeting-sync
context: orchestrated
returns: sync_report
required: false
stages:
  - discover
  - sync-and-classify
  - extract (parallel: task + intel agents)
  - review
```

---

## Purpose

Replace the Granola -> Zapier -> Slack pipeline with a direct Granola MCP integration. Every meeting gets synced, classified, and mined for follow-ups. User decision points are downstream — which follow-ups to act on, who owns them, whether to share as a team knowledge asset.

**This is NOT a selection flow.** All unsynced meetings get pulled automatically. The user's attention goes where it matters: confirming follow-ups and tagging for GitHub.

---

## Invocation

```
/meeting-sync
```

### Flags (optional)

- `--days=N` — Lookback window (default: 14 days)
- `--dry-run` — Show what would sync without writing files or state

---

## Overnight Preflight Mode

The overnight automation pipeline runs Stages 1-3 headlessly at midnight, staging results for morning review. When `/meeting-sync` is invoked interactively, check for staged data first.

### Detection

On invocation, check for `02-projects/operations/overnight/meeting-sync-staged.json`. If it exists and `staged_at` is from today:

1. **Skip Stages 1-3** — data already gathered, meetings already classified and extracted
2. **Load staged data** — read the JSON, present each meeting's classification, follow-ups, and intelligence
3. **Jump to Stage 4 (Review)** — present decisions for human confirmation:
   - Ambiguous classifications (confidence: "ambiguous") → ask user to confirm type
   - No-show/fragment meetings (needs_ignore_decision: true) → ask user to ignore or keep
   - Follow-up confirmation → standard Stage 4 multiSelect
   - Intelligence review → standard Stage 4 accuracy check
   - GitHub flag → standard Stage 4 toggle
4. After review completes, **delete the staged file** to prevent re-processing
5. Continue to Stage 5 (GitHub Push) as normal

### If staged data is stale or missing

Fall back to the standard Stages 1-3 execution (full sync from Granola MCP).

### Staged file format

```json
{
  "staged_at": "<ISO timestamp>",
  "status": "ready_for_review",
  "meetings": [
    {
      "granola_id": "<uuid>",
      "title": "<title>",
      "date": "<YYYY-MM-DD>",
      "classification": "<type>",
      "classification_confidence": "high|ambiguous",
      "needs_ignore_decision": false,
      "filepath": "<path in 04-meetings/>",
      "follow_ups": [{"action":"...", "owner":"...", "urgency":"...", "type":"...", "source_quote":"..."}],
      "intelligence": [{"insight":"...", "category":"...", "actionability":"...", "source_quote":"..."}],
      "decisions_needed": ["confirm_classification", "confirm_followups", "github_flag"]
    }
  ]
}
```

---

## State

Sync state lives at:
```
02-projects/operations/granola-sync.json
```

Structure:
```json
{
  "synced_meetings": {
    "meeting-uuid": {
      "title": "Meeting Title",
      "date": "2026-02-27T20:31:48+00:00",
      "synced_at": "2026-02-28T10:00:00+00:00",
      "meeting_type": "investor",
      "filepath": "04-meetings/2026-02-27 Meeting Title.md",
      "attendee_emails": ["person@fund.com"],
      "github_flagged": false
    }
  },
  "ignored_meetings": {
    "meeting-uuid": {"title": "Phone call with X", "reason": "Granola phone fragment"}
  },
  "last_sync": "2026-02-28T10:00:00+00:00"
}
```

**Ignored meetings:** The `ignored_meetings` object stores meeting UUIDs that should be permanently excluded from sync (e.g., Granola phone call fragments, duplicate entries, test recordings). During Stage 1 discovery, filter out any meeting whose ID appears in `ignored_meetings` OR `synced_meetings`. When the user says to permanently skip a meeting, add it to `ignored_meetings` — never rely on session memory alone.

---

## Meeting Types

Classification uses LLM inference from title + participants + transcript content. No Granola templates required.

| Type | Detection Signals | Template |
|------|------------------|----------|
| `investor` | VC firm domains, "raise," "terms," "round," Primary team members | `templates/investor.md` |
| `prospect` | VC firm names as customers, "research," "diligence," "pilot," "Altis" as service | `templates/prospect.md` |
| `recruiting` | "candidate," MBB firm names, HBS/GSB/MBA domains, interview language | `templates/recruiting.md` |
| `team` | @altis.vc domains only, Jason/Stanley/Mehdi/Olivia/Maxine | `templates/team.md` |
| `board-advisor` | Emily Man, board members, "board," advisory context | `templates/board-advisor.md` |
| `partner` | Design team, external vendors, non-investor non-customer externals | `templates/partner.md` |
| `discovery` | Industry experts, exploratory conversations, demo sessions, no deal/pitch/hire intent | `templates/discovery.md` |

**Ambiguous cases:** When signals overlap, ask the user: "This looks like it could be [type A] or [type B] — which fits better?" Don't guess.

**Discovery vs. Prospect:** If the conversation has a clear sales intent (pricing, pilot, deliverables), classify as prospect. If it's exploratory knowledge exchange with no transactional next step, classify as discovery. When in doubt, ask.

---

## Execution Protocol

### Stage 1: Discover

**Gate:** Must complete before any transcript fetching.

**Execution:**

1. Read `02-projects/operations/granola-sync.json` (create empty state if file doesn't exist)
2. Call `mcp__granola__find_recent_meetings` with limit=50
3. Filter to last 14 days (or `--days=N`)
4. Diff against synced_meetings to find unsynced meetings
5. If zero new meetings: report "No new meetings since last sync on [date]" and exit

**Checkpoint output:**
```
MEETING SYNC — DISCOVER
========================
Last sync: [date]
New meetings found: [N]

1. [Title] — [Date] — [Attendees summary]
2. [Title] — [Date] — [Attendees summary]
...

Syncing all [N] meetings...
```

---

### Stage 2: Sync and Classify

**Gate:** Stage 1 complete. Cannot skip any meeting.

**Execution:**

For each unsynced meeting:

1. Call `mcp__granola__get_transcript` with the meeting ID
2. Classify meeting type using title + participants + transcript content (see Meeting Types table)
3. **Extract attendee emails** for the `attendee_emails` frontmatter field:
   - **Primary source:** Granola's `attendees` array from `find_recent_meetings` — filter for valid email addresses, exclude internal domains (`@altis.vc`, `@primary.vc`, `@deck.support`)
   - **Fallback (Calendly meetings):** If Granola has no external emails, run the Calendly lookup script:
     ```bash
     cd /Users/preparedmindchris/GTM_Agents && node scripts/calendly-email-lookup.js --date YYYY-MM-DD --title "meeting title substring"
     ```
     The script returns JSON with `{ event, start, invitees: [{ email, name }] }`. Match events to meetings by start time (±1 hour). Use the `email` values for `attendee_emails`.
   - **If neither source has emails:** Leave `attendee_emails` blank. Do NOT guess emails from names. Agent 5 will prompt Christopher to add them manually.
   - Internal domains to exclude: `altis.vc`, `primary.vc`, `deck.support`
4. Write meeting file to `04-meetings/` with format:

```markdown
---
title: [Meeting Title]
date: [YYYY-MM-DD]
type: [meeting_type]
participants: [comma-separated names with affiliations]
attendee_emails: [comma-separated external emails from step 3, or blank if none found]
github: pending
granola_id: [UUID]
---

## Summary

[LLM-generated 3-5 sentence summary from transcript]

## Key Intelligence

[Strategic insights, market signals, competitive intelligence — the PRIMARY reason
meetings get pushed to GitHub as team knowledge assets. Not all meetings produce
intelligence; team standups may have none. Discovery meetings are intelligence-heavy.]

## Confirmed Follow-ups

[Confirmed follow-ups after user review — or "None" with brief explanation]

## Transcript

Available via Granola MCP: meeting ID `[UUID]`
```

**Note on transcripts:** Do NOT embed full transcripts in the meeting file. Store the Granola meeting ID and reference via MCP. This keeps files small and avoids duplication. The transcript is always available on-demand.

4. File naming: `04-meetings/YYYY-MM-DD [Title].md`
   - Sanitize title: remove special characters, truncate to 60 chars
   - If duplicate filename, append ` (2)`, ` (3)`, etc.

**Performance note:** If syncing 5+ meetings, process sequentially. The MCP transcript fetch is the bottleneck. If this becomes too slow (>5 min for typical sync), we'll add a Python script layer. For now, MCP is sufficient.

**After ALL meetings are synced:**

Update `granola-sync.json` with all new entries (including `attendee_emails` array) in a single write.

**Agent 5 HubSpot sync:** After all meetings are synced and reviewed, for any `prospect` or `discovery` type meetings with `attendee_emails` populated, offer to run Agent 5 `--sync` to push meeting notes to HubSpot:

```
Prospect meetings with attendee emails ready for HubSpot sync:
1. "Crissy / Chris re Altis" — cbehrens@insightpartners.com
2. "GA & Concertiv // Altis" — nsambor@generalatlantic.com, ...

Run Agent 5 --sync for these? (This logs meeting notes to HubSpot contacts and enables decay tracking.)
```

If Christopher confirms, run: `cd /tmp/GTM_Agents && node agent-5-post-meeting.js --sync "<filepath>"` for each meeting. If the repo isn't cloned, clone it first: `git clone git@github.com:altisvc/GTM_Agents.git /tmp/GTM_Agents && cp ~/Desktop/altis-brain/.env.gtm-agents /tmp/GTM_Agents/.env && cd /tmp/GTM_Agents && npm install`

**Checkpoint output:**
```
MEETING SYNC — SYNC COMPLETE
==============================
Synced: [N] meetings
Files written to 04-meetings/

1. [Title] — classified as [type]
2. [Title] — classified as [type]
...

Extracting follow-ups...
```

---

### Stage 3: Extract (Parallel Fork)

**Gate:** Stage 2 complete. All meetings synced and classified.

**Architecture:** Two specialized agents run **in parallel** per meeting — one for tasks, one for intelligence. This split exists because the first production run (Feb 27) proved these are fundamentally different reading postures. A single agent in "task-hunting mode" both over-generated phantom tasks AND missed strategic intelligence. Specialization fixes both failure modes simultaneously.

**Agents:**

| Agent | Spec | Reading Posture | Output |
|-------|------|----------------|--------|
| **Task Extractor** | `.claude/agents/meeting-sync-task-extractor.md` | "Who committed to what?" | Structured follow-ups (action, owner, urgency, type) |
| **Intel Extractor** | `.claude/agents/meeting-sync-intel-extractor.md` | "What did I learn that I didn't know before?" | Structured intelligence (insight, category, relevance, actionability) |

**Execution:**

For each synced meeting:

1. Read the meeting transcript (from Stage 2 — already fetched, or re-fetch from Granola if needed)
2. Read the corresponding template from `templates/[type].md`
3. Read both agent specs from `.claude/agents/`
4. Launch TWO `general-purpose` Task agents **in a single message** (parallel execution):

   **Task Agent prompt:**
   ```
   You are the Meeting Sync Task Extractor.
   [Contents of meeting-sync-task-extractor.md]

   MEETING TYPE: [type]
   TEMPLATE: [contents of templates/[type].md]
   TRANSCRIPT: [transcript text]

   Extract follow-ups only. Return structured YAML. No intelligence, no prose.
   ```

   **Intel Agent prompt:**
   ```
   You are the Meeting Sync Intelligence Extractor.
   [Contents of meeting-sync-intel-extractor.md]

   MEETING TYPE: [type]
   TEMPLATE: [contents of templates/[type].md]
   TRANSCRIPT: [transcript text]

   Extract intelligence only. Return structured YAML. No follow-ups, no prose.
   ```

5. Collect both outputs. Parse YAML from each.

**Batching:** For N meetings, launch up to 2N agents. To avoid overwhelming context, process in batches of 3 meetings (6 agents) at a time if syncing more than 3 meetings.

**Performance:** Two agents per meeting doubles token cost but NOT wall-clock time (parallel execution via single-message Task calls). For 6 meetings, expect ~3-5 min total.

**Error handling:** If either agent returns empty results, that's valid — a routine standup may have zero intelligence, a discovery session may have zero tasks. Only flag as an error if an agent fails to return parseable output.

**Present results grouped by meeting (both outputs merged):**
```
## "[Meeting Title]" ([type])

### Follow-ups (from Task Extractor)
1. [Action] — Owner: [name] — Urgency: [level] — Type: [active|waiting_for]
   Source: "[transcript excerpt]"

### Intelligence (from Intel Extractor)
1. [Insight] — Category: [cat] — Relevant to: [who] — Actionability: [level]
   Source: "[transcript excerpt]"
```

---

### Stage 4: Review via Trello Staging Board

**Gate:** Stage 3 complete. All follow-ups AND intelligence extracted.

**Why Trello:** Reviewing 8+ meetings of follow-ups in the terminal is brutal. Trello gives mouse-based review — check done, archive rejects, edit descriptions. See `memory/feedback_meeting_sync_trello_staging.md`.

**Staging board:** https://trello.com/b/U3Klhxbp/staging
- **Christopher** list: `69cae927a636f1513286c4c8`
- **Others** list: `69cae92724267c237b534e78`

#### Step 4A: Push follow-ups to Trello staging board

For each extracted follow-up, create a Trello card:

- **List:** "Christopher" for Christopher's follow-ups, "Others" for everyone else (including `waiting_for` items)
- **Card name:** `[Owner]: [Action]` — or `[WAIT] [Name]: [Action]` for waiting_for items
- **Card description:** Context + source meeting name + date + urgency
- **API:** Direct Trello REST API (not the GTM_Agents lib, which is hardcoded to a different board)

```bash
cd /Users/preparedmindchris/GTM_Agents && node -e "
require('dotenv').config();
const KEY = process.env.TRELLO_API_KEY;
const TOKEN = process.env.TRELLO_TOKEN;
const params = new URLSearchParams({key: KEY, token: TOKEN, idList: 'LIST_ID', name: 'CARD_NAME', desc: 'CARD_DESC', pos: 'bottom'});
fetch('https://api.trello.com/1/cards?' + params.toString(), {method: 'POST'}).then(r => r.json()).then(c => console.log(c.id));
"
```

#### Step 4B: Intelligence stays in terminal

Present intelligence items per meeting as compact text. Use default-accept pattern:
```
## Intelligence (default: keep all — tell me what to kill/edit)

**[Meeting Title]:** [insight 1]. [insight 2]. [insight 3].
**[Meeting Title]:** [insight 1]. [insight 2].
...

Any corrections?
```

Intelligence items don't need individual selection — just an accuracy check. Write confirmed items to meeting files immediately.

#### Step 4C: GitHub toggle

Ask once for all meetings:
```
Push all [N] meetings to GitHub? (or list exceptions)
```

#### Step 4D: Direct user to staging board

```
Follow-ups pushed to Trello staging board:
https://trello.com/b/U3Klhxbp/staging

Christopher: [N] cards | Others: [N] cards

Review in Trello — archive what you don't want. Tell me "go" when ready to promote survivors to Ticket Tracker.
```

#### Step 4E: Promote survivors (on user signal)

When user says "go" or similar:

**MUST use the promotion script** — do NOT manually move cards via API calls. Cross-board moves require `idBoard` parameter which is easy to forget and fails silently.

```bash
bash .claude/scripts/trello-promote.sh
```

The script handles:
1. Reads cards from both staging lists (skips archived/closed)
2. Dedup against existing Ticket Tracker cards (exact match → substring 15+ chars → 60%+ keyword overlap)
3. Duplicates: appends meeting context to existing card, archives staging card
4. Non-duplicates: moves cross-board with `idBoard` + `idList` (the critical fix)
5. Verifies each card landed on the correct board
6. Returns JSON summary: promoted N, merged N, errors []

Report the script output to the user.

**After review complete:**

1. Write confirmed intelligence to meeting files (Key Intelligence section)
2. Write confirmed follow-ups to meeting files (from surviving Trello cards)
3. Update `granola-sync.json` with `github_flagged: true/false`
4. **Write pipeline follow-up data to HubSpot** (see Stage 4.5 below)
5. **Push to GitHub** (see Stage 5 below)
6. Present final report

---

### Stage 4.5: HubSpot Follow-up Writeback

**Gate:** Stage 4 complete. Follow-ups confirmed by user.

**Trigger:** Any `prospect` meeting that completed Stage 4 review.

**Execution:**

#### Part A: Pipeline card moves for Deprioritize/Pass assessments

For each prospect meeting assessed as **Deprioritize** or **Pass** (from the assessment in the meeting file):

1. Find the matching card on the Pipeline board (`69c93a4cec8a0921d74a693d`) by firm name or email tag
2. Move it to the corresponding list (Deprioritize or Pass) and clear the due date:
   ```bash
   cd /Users/preparedmindchris/GTM_Agents && node -e "
   require('dotenv').config();
   const trello = require('./lib/trello');
   (async () => {
     const lists = await trello.getLists();
     const cards = await trello.getCards();
     const targetList = lists.find(l => l.name === 'TARGET_LIST');
     const card = cards.find(c => !c.closed && c.name.toLowerCase().includes('FIRM_LOWER'));
     if (!card) { console.log('Card not found for FIRM'); return; }
     if (!targetList) { console.log('List not found'); return; }
     await trello.moveCard(card.id, targetList.id);
     await trello.updateCard(card.id, { due: null });
     console.log('Moved', card.name, '->', 'TARGET_LIST');
   })();
   "
   ```
3. Report each move to Christopher

#### Part B: HubSpot writeback for Pursue assessments

For each prospect meeting assessed as **Pursue** with follow-up data (contact_email, follow_up_date, context, waiting_on):

1. Look up the contact in HubSpot by email (from `follow_up.contact_email`)
2. If contact found, write four properties:
   - `last_meeting_date` — the meeting date (midnight UTC epoch ms). **Critical for Luigi:** without this, Luigi doesn't know a meeting occurred and won't auto-advance the card from Scheduled → Considering.
   - `follow_up_date` — the computed follow-up date (midnight UTC epoch ms)
   - `follow_up_context` — Oscar's drafting context (what to reference, what to ask)
   - `follow_up_waiting_on` — what the prospect committed to doing
3. If contact NOT found, log warning but don't block — the contact may not be in HubSpot yet (Larry will discover them later)
4. **Sync Pipeline card due date:** Find the matching card on the Pipeline board (`69c93a4cec8a0921d74a693d`) by firm name or email tag, and update its due date to match `follow_up_date`. Cal sets the initial due date to day-after-Calendly-meeting, but the real follow-up date comes from the conversation (e.g., "follow up Friday after their Thursday CIO meeting"). Without this sync, Luigi alerts on Cal's stale date instead of the conversation-aware date.

**HubSpot write method:** Use the same `hubspot.batchUpdate()` from the GTM_Agents lib, or direct API call:

```bash
cd /Users/preparedmindchris/GTM_Agents && node -e "
  require('dotenv').config();
  const hubspot = require('./lib/hubspot');
  (async () => {
    const contact = await hubspot.findContactByEmail('EMAIL');
    if (!contact) { console.log('Not found'); return; }
    const d = new Date('YYYY-MM-DD'); d.setUTCHours(0,0,0,0);
    await hubspot.getClient().crm.contacts.basicApi.update(contact.id, {
      properties: {
        follow_up_date: String(d.getTime()),
        follow_up_context: 'CONTEXT',
        follow_up_waiting_on: 'WAITING_ON',
      }
    });
    console.log('Updated:', contact.id);
  })();
"
```

**Why this matters:** Luigi reads these properties when managing Trello cards. The `follow_up_date` becomes the card due date. The `follow_up_context` gets passed to Oscar at draft time. Without this writeback, Luigi falls back to dumb timing (5 days after last email) instead of conversation-aware timing ("follow up Friday after CIO meeting").

**Overwrite behavior:** Each new prospect meeting overwrites the previous follow-up data for that contact. This is correct — the most recent conversation is always the most relevant context for the next touch.

**Chain to Luigi:** After all HubSpot writebacks complete, run Luigi's scan so the fresh follow-up data flows through to Pipeline board cards immediately — don't wait for the nightly cron.

```bash
cd /Users/preparedmindchris/GTM_Agents && node agent-luigi-pipeline.js --scan
```

Report Luigi's output inline (discoveries, overdue alerts, chase updates) so Christopher sees the full pipeline state before ending the sync.

---

### Stage 5: GitHub Push

**Gate:** Stage 4 complete. All meetings reviewed and flagged.

**Destination:** `git@github.com:altisvc/notes.git`

**Local clone location:** `/tmp/altis-notes` (cloned fresh if not present)

**Execution:**

1. Check if `/tmp/altis-notes` exists and is a valid git repo with correct remote. If not, clone fresh:
   ```bash
   git clone git@github.com:altisvc/notes.git /tmp/altis-notes
   ```

2. Pull latest to avoid conflicts:
   ```bash
   cd /tmp/altis-notes && git pull --rebase origin main
   ```

3. For each meeting where `github_flagged: true` in this sync batch:
   - Copy the meeting MD from `04-meetings/` to `/tmp/altis-notes/meetings/`
   - Track which files are new vs. updated

4. Copy the updated `granola-sync.json` to `/tmp/altis-notes/granola-sync.json`

5. Stage, commit, and push:
   ```bash
   cd /tmp/altis-notes
   git add meetings/ granola-sync.json
   git commit -m "Sync [N] meetings from [date range]"
   git push origin main
   ```

6. Update `granola-sync.json` with `github_pushed: true` for each pushed meeting.

**Error handling:**
- If push fails (auth, conflict), report the error and continue. The files are in `/tmp/altis-notes` and can be pushed manually.
- Never block the sync report on a failed push.
- If the repo doesn't exist yet or SSH keys aren't configured, skip push and note it in the report.

**What gets pushed:**
- Meeting MDs where `github_flagged: true` — the full vault file including Summary, Key Intelligence, and Confirmed Follow-ups
- `granola-sync.json` — so the team can see sync state and meeting metadata programmatically

**What does NOT get pushed:**
- Meetings where `github_flagged: false` — private notes, recruiting, personal
- Full transcripts — only the Granola meeting ID reference

---

**Final output:**
```
MEETING SYNC — COMPLETE
=========================
Synced: [N] meetings
Follow-ups confirmed: [N]
Intelligence items filed: [N]
GitHub pushed: [N] meetings to altisvc/notes

Follow-ups by owner:
- Christopher: [N] items
- Jason: [N] items
- Stanley: [N] items
- [Other]: [N] items

Intelligence by category:
- competitive: [N]
- hiring: [N]
- technology: [N]
- [etc.]

Task routing is deferred pending backlog architecture redesign.
```

---

## Deferred Capabilities

These are designed but not yet active, pending upstream decisions:

### Task Routing (pending backlog redesign)
Confirmed follow-ups will route to the new task system with owner tags. Until then, follow-ups are captured in the meeting file and presented in the sync report.

**When this activates:** Must include the same dedup check as `/wrap` — fetch existing open cards and match by core topic before creating. One action = one card; sub-steps go in the card description, not as separate cards. See `wrap.md` Step A for the pattern.

### ~~GitHub Knowledge Push~~ — RESOLVED (2026-03-09)
Destination: `git@github.com:altisvc/notes.git`. Push integrated into Stage 5. Meetings flagged `github_flagged: true` push MDs + sync JSON to `meetings/` directory in the notes repo.

### Checkin Integration (pending checkin rearchitecture)
`/meeting-sync` can be called as a stage within `/checkin`. Until then, it runs standalone.

---

## Known Failure Modes (from first run, Feb 27 2026)

These were identified during the first production run and are now encoded in the extraction rules and templates:

| Failure | What Happened | Fix |
|---------|---------------|-----|
| Over-indexed on tasks, under-indexed on intelligence | Missed Maggie's key hiring recommendation and the Figma MCP excitement from Dashboarding | Added intelligence extraction as co-equal with task extraction. Discovery template is intelligence-first. |
| Generated follow-ups for wrong owners | Suggestions TO an external friend were listed as Christopher's tasks | Added rule: suggestions made TO external people are not Altis follow-ups |
| No active/waiting_for distinction | "Expect email from Cameryn" was listed as an active task | Added `type: active | waiting_for` to follow-up format |
| Misclassified discovery as prospect | Maggie (GuidePoint expert, no sales intent) was labeled prospect | Added `discovery` type and disambiguation guidance for discovery vs. prospect |
| Listed already-completed items | Good Reason VC materials already sent were flagged as follow-ups | Added rule: things completed before/during the meeting are not follow-ups |
| Missed the assessment layer | Good Reason VC was presented neutrally when Christopher assessed them as "amateurs trying to give money they don't have" | Prospect template now includes assessment (Pursue/Deprioritize/Nurture) |

---

## Forbidden Shortcuts

| Shortcut | Why It's Forbidden |
|----------|-------------------|
| Skipping transcript fetch | Summaries alone miss commitments buried in conversation |
| Auto-classifying ambiguous meetings | Wrong template produces wrong follow-ups |
| Presenting follow-ups without source quotes | User can't validate extraction accuracy |
| Auto-confirming follow-ups | User decides what's real |
| Skipping the GitHub toggle | Knowledge sharing is a deliberate choice |
| Writing state before files | If file write fails, state says it succeeded |

---

## Reference

**Granola MCP tools:**
- `mcp__granola__find_recent_meetings` — list recent meetings
- `mcp__granola__search_meetings` — search by title/attendee/content
- `mcp__granola__get_transcript` — full transcript by meeting ID

**Extraction agents (Stage 3):**
- `.claude/agents/meeting-sync-task-extractor.md` — "Who committed to what?"
- `.claude/agents/meeting-sync-intel-extractor.md` — "What did I learn that I didn't know before?"

**Output location:** `04-meetings/YYYY-MM-DD [Title].md`

**State file:** `02-projects/operations/granola-sync.json`

**Templates:** `.claude/skills/meeting-sync/templates/[type].md`
