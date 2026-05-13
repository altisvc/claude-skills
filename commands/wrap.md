# /wrap

End-of-session command that archives the session and updates operational state.

## Usage

```
/wrap [optional title]
```

If no title provided, generate one from session content.

## Shared State Root

**CRITICAL:** All shared state files (daily logs, archives, backlogs, task lists) MUST be read from and written to the **main repo**, not the current worktree. Worktrees have their own copies of these directories, but only the main repo copy is canonical.

```
MAIN_REPO=$(git rev-parse --show-toplevel)
```

All paths below are relative to `MAIN_REPO`. When executing file reads/writes, always prepend this root.

## Session Scope — Read This First

**The wrap covers ONLY the conversation and work in the active Claude session.** Not yesterday's session. Not other entries already in today's daily log. Not topics in MEMORY.md, wiki articles, or recent archive files that happen to be visible.

When appending to an existing daily log file or scanning prior archive entries, read them ONLY for (a) format reference and (b) Trello dedup. Do not echo, summarize, or build on their content. Sibling entries in `06-daily-log/YYYY-MM-DD.md` are out of scope by default.

**Before each write step**, ask: "Did this content come from this session's actual conversation and the files I created or edited during it?" If not, remove it. If unsure, leave it out. The cost of an under-scoped wrap is small; the cost of an over-scoped wrap is mixing strategically distinct work, which makes everything harder to retrieve later.

**Why this exists (May 13, 2026):** A wrap pulled forward implications and context from unrelated sessions already logged in that day's `06-daily-log/` file. The drift happened during the "append to or create" step in Step 2 — sibling entries were right next to the cursor, inviting tone-matching and topic-borrowing. The rule above closes that gap explicitly.

## Step 0 — Sensitivity Check (run BEFORE any writes)

Some sessions touch material that cannot be exposed via tracked files, shared Trello boards, or marketplace-sync logs. The default `/wrap` flow writes to several tracked or shared surfaces. Before doing any of that, classify the session.

### Hard triggers — auto-enter SENSITIVE MODE

If any of the following appear in the session, route as sensitive without asking:

- Counsel disputes, malpractice claims, engagement-letter issues, "fire counsel," "switch firms"
- Verbatim transcripts of meetings with attorneys, board members, or investors discussing terms
- Specific damages calculations or settlement-range intel
- Off-record intel from any party (phrases like "off the record," "back-channel," "don't put this in writing," "the recording was turned off")
- Outside-investor signals naming funds not currently on the deal (e.g., any named competing leads)
- Specific cap-table math tied to a named investor's internal targets (e.g., "an investor's internal ownership target")
- Personnel evaluations or HR matters (terminations, severance, performance disputes)
- Privileged-adjacent material: anything you'd send to outside counsel and not to the team

### Soft triggers — ASK the user

If any of the following appear, ask explicitly: *"This looks like it may be sensitive. Route as private (gitignored) or as standard?"*

- Detailed cap-table math without external-investor naming
- Specific Primary partner quotes not in distributed materials (the May 5 memo etc.)
- Internal disagreements between the user and a counterparty
- Compensation discussions involving named team members

### User override

The user can declare a session sensitive at any point: *"this is a sensitive session"* or *"route this private."* That declaration is binding for the entire wrap regardless of trigger detection.

### What SENSITIVE MODE changes

When entering sensitive mode, adjust every subsequent step. The adjustments are inlined in each step below under `**Sensitive mode:**` callouts. Summary:

| Step | Standard mode | Sensitive mode |
|------|---------------|----------------|
| 1. Archive | `05-archive/claude/<title>.md` — already gitignored, write fully | Same location, but front-matter flag `Sensitivity: PRIVATE`. Do not include verbatim transcripts in the archive — reference a separate gitignored transcript file. |
| 2. Daily log | Tracked file in `06-daily-log/`, full content | **Add explicit gitignore rule for the day's file BEFORE writing**, then write full content |
| 3. Trello cards (open items) | Public to board members | Pause and ask user about board visibility; offer (a) generic card names, (b) personal-list routing, (c) skip Trello entirely and capture action items in archive only |
| 4. Trello intel cards | Public to board members | Same options as Step 3. Generic Intel tags do not adequately mask sensitive matters — default to skipping. |
| 5.5. Marketplace sync log | Header uses session title verbatim | Header uses a generic descriptor that does not name the matter (e.g., "fundraise strategy session," "ongoing engagement"). NEVER use words like "malpractice," "[counsel]," "[counsel]," or named-counsel/named-fund references in the header. |
| 6. Wiki compile | Update any relevant article, including tracked ones | Restrict updates to gitignored wiki files ONLY: `coaching-fundraising.md`, `coaching-collison.md`, `fundraise-strategy.md`, `fundraise-narrative.md`. **Do not edit tracked wiki files** (ben-sun, primary-relationship, ESOP, governance, etc.) even if relevant. |
| 6D. Changelog | Append entry naming the session | Skip entirely OR use a generic descriptor that does not name the matter. The changelog is tracked. |
| 6C. Content registry | Add new source pointers | Skip if the source pointer would reveal the matter. Content registry is tracked. |
| 7. Suggest next steps | Standard output | Standard output, but flag any items that themselves should be handled privately (e.g., "Draft email to outside counsel" goes in archive, not Trello) |

### Sensitive-file preflight (REQUIRED in sensitive mode)

Before writing any new file in the session that contains sensitive content (transcripts, malpractice timelines, counsel correspondence, cap-table strategy memos), add an explicit `.gitignore` rule for the file or its parent folder BEFORE creating it. The patterns currently in place cover:

- `02-projects/legal/` (entire folder)
- `02-projects/fundraise/<matter-specific patterns>`
- `02-projects/**/*-transcript*.md`
- `06-daily-log/<date>.md` (per-day rule, added during sensitive wrap)
- `05-archive/` (entire folder)
- `03-research/wiki/coaching-*.md`, `fundraise-*.md`

If a sensitive file would land outside these patterns, add a new rule to `.gitignore` first, verify with `git check-ignore -v <path>`, THEN create the file.

### Final output in sensitive mode

End the wrap with a `## Protected Files` section that lists every file written or modified during the session, its gitignore status, and an explicit verification (`git check-ignore` output) for each sensitive file. This gives the user a clear audit trail to verify nothing leaked into tracked content.

Also flag any out-of-vault surfaces that the user needs to manage themselves:
- Trello board visibility (if any cards were created)
- Granola transcript visibility (if any meeting transcripts are referenced)
- Outside counsel intake records (if any new counsel was contacted during the session)
- Email forwards or Slack threads that may have surfaced the matter to additional parties

**Why this exists (May 13, 2026):** A session covering sensitive legal and investor-strategy matters was wrapped using the standard flow. The standard wrap touched tracked wiki files (`ben-sun.md`, `changelog.md`), wrote a sensitive-matter title into the tracked `marketplace-sync-log.md`, and created a daily-log entry in the tracked `06-daily-log/` tree. None of it was committed because the user paused to ask before pushing — but the next user without that instinct would have pushed sensitive material to GitHub. The Step 0 gate and per-step adjustments above close that gap by default rather than relying on the user to catch it.

## What It Does

### 1. Archive to Claude History

**Sensitive mode:** Add front-matter flag `Sensitivity: PRIVATE` after the title. Do NOT inline verbatim transcripts or full counsel correspondence in the archive — reference a separate gitignored transcript/timeline file instead. Verbatim material belongs in its own file under a gitignored path so it can be moved, redacted, or deleted independently.

Create session summary in `$MAIN_REPO/05-archive/claude/YYYY-MM-DD_<title>.md`:

```markdown
# <Title>

**Date:** YYYY-MM-DD HH:MM
**Source:** Claude Session

---

## Summary
[2-3 paragraph summary of what was discussed/accomplished **in this session only**]

## Key Decisions
- [Decision 1]
- [Decision 2]

## Action Items
- [ ] [Action 1]
- [ ] [Action 2]

## Notable Context
[Searchable facts, names, numbers worth preserving]
```

### 2. Update Daily Log

**Sensitive mode:** Add an explicit gitignore rule for `06-daily-log/YYYY-MM-DD.md` to `.gitignore` BEFORE writing the entry. Verify the rule with `git check-ignore -v 06-daily-log/YYYY-MM-DD.md`. Only after verification, write the entry. The entry can contain full session detail because the file is now gitignored — but the file MUST be ignored before any content is written.

If the day already has a tracked entry from a prior session (the file exists and isn't gitignored), do not retroactively gitignore — that would hide already-acceptable content. Instead, write today's sensitive content to a separate file at `06-daily-log/YYYY-MM-DD-private.md` (covered by a wildcard gitignore rule `06-daily-log/*-private.md` — add it if missing) and add a one-line pointer in the public file: *"See private log for additional session detail."*

Append to or create `$MAIN_REPO/06-daily-log/YYYY-MM-DD.md`.

**Scope rule:** Read the existing file only to find the correct append point and match formatting. Do not summarize, reference, or borrow content from sibling entries already in that file — they are out of scope. Your new entry must be derived only from this session's conversation and the files this session touched.

```markdown
## Session: <title>

**Time:** HH:MM
**Summary:** [1-2 sentences]
**Outcomes:** [Key deliverables or decisions]
**Open threads:** [What's unresolved]
**Forward implications:**
- [What other workstreams, deliverables, or upcoming commitments are affected by today's changes?]
- [If a positioning doc, voice guide, strategy, or architecture changed — what downstream materials need to reflect it?]
- [If feedback came in — what deliverable does it apply to, and is that deliverable due soon?]
```

**Why Forward Implications exists (Feb 16, 2026):** The morning check-in reads daily logs to surface second-order effects. But it can only find implications that were captured at wrap-time, when context is fresh. A log entry that says "updated Ben voice guide with positioning changes" is useful. A log entry that *also* says "outbound email templates (Option A/B) may need revision before Tuesday board review" is what actually prevents the next morning's blind spot. Push the thinking to wrap-time.

### 3. Push Open Items to Trello (Inbox)

**Sensitive mode:** PAUSE before any Trello write. Surface the visibility question to the user with this exact prompt:

> "This session is sensitive. The Trello board is visible to anyone with board access (currently includes team members and possibly Primary). I can route Trello in one of three ways:
> (a) **Generic card names** — create cards but use language that doesn't reveal the matter (e.g., "Christopher: Internal corporate-counsel decision" instead of "naming the firms involved")
> (b) **Personal/private list** — if you have a private list on the board (or a separate board), I can create cards there only
> (c) **Skip Trello entirely** — capture all action items in the archive file and skip Trello. You'll need to track these yourself.
> Which?"

Do not create any cards until the user answers. Default if no answer received: option (c), skip Trello entirely. Sensitivity beats convenience.

If the user picks (a), apply the substitution rule: never name counsel, never name outside investors not currently on the deal, never name specific damages or settlement amounts, never name verbatim transcript quotes. Use category-level descriptions only.

**Why:** Action items captured in markdown archives don't get acted on. Trello is the canonical task system (since 2026-03-14). Open items should land where work actually gets tracked.

**What goes to Trello Review list (inbox):**
- Action items from THIS session that need triage
- Open threads from THIS session that require a next step
- Commitments Christopher made during THIS session

(Do not surface action items from prior sessions or unrelated daily log entries. If they exist, they were captured in their own wrap.)

**What does NOT go to Trello:**
- Vague "we should think about" items — only concrete actions
- Items that are already on the Trello board (check before creating duplicates)
- Items completed during the session

**Execution:**

**Step A — Dedup check (REQUIRED before creating any cards):**

Fetch all open cards from Review, Action, and Waiting lists:

```bash
eval "$(grep 'TRELLO_' ~/.zshrc)"
EXISTING=$(curl -s "https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}&fields=name,desc,idList&filter=open")
```

For each item you plan to create a card for, check `EXISTING` for a card covering the same action. Match by core topic — e.g., if you're about to create "Christopher: UTM discipline with Ben — send message about links" and there's already "Christopher: Establish UTM discipline with Ben — process change before Lola launch", those are the same action.

**If a match exists:** Append new context to the existing card's description instead of creating a new card:

```bash
curl -s -X PUT "https://api.trello.com/1/cards/{existingCardId}" \
  -d "key=${TRELLO_API_KEY}" \
  -d "token=${TRELLO_TOKEN}" \
  --data-urlencode "desc={existing description}
---
Update [YYYY-MM-DD]: [new context from this session]"
```

**If no match exists:** Create a new card:

```bash
curl -s -X POST "https://api.trello.com/1/cards" \
  -d "key=${TRELLO_API_KEY}" \
  -d "token=${TRELLO_TOKEN}" \
  -d "idList=${TRELLO_LIST_REVIEW}" \
  -d "name=Owner: Card title — specific enough to act on without context" \
  -d "desc=Source: Claude session — [session title]
Date: YYYY-MM-DD
Context: [1-2 sentences of context from the session]"
```

**Step B — One action = one card:**

Group by distinct action/outcome, NOT by sub-steps. Sub-steps go in the card description or a checklist on the card. Ask: "Is this a new action or a detail of an existing one?" If two items share the same owner and the same goal, they are one card.

**Card naming:** Lead with owner prefix (e.g., `Christopher:`, `Jason:`, `Stanley:`). This matches the meeting-sync convention established 2026-03-16.

**List routing:**
- Active items Christopher or team must do → `TRELLO_LIST_REVIEW` (inbox for triage)
- Items waiting on someone else → `TRELLO_LIST_WAITING`

### 4. Push Learnings to Trello (Intel Stack)

**Sensitive mode:** Default to SKIP. Strategic insights from sensitive sessions are exactly the kind of content that should not sit in a board-visible Intel list. Capture the learnings in the archive's `## Notable Context` section instead. The archive is gitignored; the Intel list is not.

If the user explicitly wants something into Intel anyway (because the insight is generic enough to be useful and doesn't reveal the matter), use the substitution rule: generic category, no named parties, no quotes.

**Why:** Sessions surface strategic insights, market signals, and competitive intelligence that aren't tasks but are valuable context. The Intel list in Trello is the searchable knowledge base (245+ items as of 2026-03-14).

**What goes to Trello Intel list:**
- Key decisions and the reasoning behind them
- Market signals, competitive intelligence, customer insights
- Strategic frameworks or mental models that emerged
- Anything someone on the team would benefit from knowing later

**What does NOT go to Intel:**
- Action items (those go to Review/Waiting)
- Session logistics or process notes
- Things already well-documented elsewhere in the vault

**Execution:**

For each learning/insight, create a Trello card:

```bash
curl -s -X POST "https://api.trello.com/1/cards" \
  -d "key=${TRELLO_API_KEY}" \
  -d "token=${TRELLO_TOKEN}" \
  -d "idList=${TRELLO_LIST_INTEL}" \
  -d "name=[Category] Insight title — specific enough to be useful" \
  -d "desc=Source: Claude session — [session title]
Date: YYYY-MM-DD
Context: [The insight with enough detail to be useful without reading the full session]"
```

**Card naming:** Lead with category tag in brackets. Categories match the intel extractor taxonomy: `[competitive]`, `[customer]`, `[product]`, `[pricing]`, `[fundraise]`, `[hiring]`, `[technology]`, `[industry]`, `[compliance]`.

### 5. Update Backlogs (Legacy — Deprecated)

> **Note:** As of 2026-03-14, Trello is the canonical task system. The markdown backlogs (`ms-claudia-backlog.md`, `christopher-tactical-todos.md`) are no longer actively maintained. Steps 3 and 4 above replace this step. These files remain as historical reference but should NOT be manually updated — all task changes flow through Trello.

### 5.5. Marketplace Sync Log (Automated Script)

**Sensitive mode:** Pass a generic descriptor as the session title argument to the script, NOT the actual session title. The marketplace-sync-log.md is tracked and will push to GitHub. Acceptable generic descriptors:
- `"fundraise strategy session"`
- `"corporate governance discussion"`
- `"ongoing engagement"`
- `"deal mechanics review"`

NEVER pass any of: counsel firm names ([counsel], [counsel], [counsel], etc.), fund names not on the public deal (Patrick [fund], [fund], etc.), "malpractice," "claim," "dispute," "litigation," or named-team-member personnel matters.

**Why:** Skills and agents are built/modified in altis-brain but the marketplace (`altisvc/claude-skills` registry + `altisvc/altis-venture-insight` app) drifts silently. This step catches changes mechanically so they accumulate in a visible backlog.

**This is a shell script, not LLM judgment.** It cannot be skipped or rationalized away.

**Execution:**

```bash
$MAIN_REPO/.claude/scripts/marketplace-sync-check.sh "<session title>"
```

The script:
1. Runs `git diff` against HEAD for `.claude/skills/`, `.claude/agents/`, `.claude/commands/`, `.claude/scripts/`, `.claude/hooks.json`
2. Classifies each change as `NEW` (file didn't exist), `RETROFIT` (published skill changed), or `CHECK` (unpublished change)
3. Appends a table entry to `$MAIN_REPO/02-projects/operations/marketplace-sync-log.md`
4. Prints a summary to stdout

Exit code 0 = entries logged. Exit code 1 = nothing to log (no `.claude/` changes). Either way, proceed to Step 6.

**Report the script's stdout in the wrap output.** Do not suppress or summarize it.

**Maintaining the published list:** The script has a hardcoded list of published skills/agents at the top. When a skill is pushed to the marketplace, update the list in the script.

### 6. Compile Wiki (Knowledge Compounding)

**Sensitive mode — RESTRICTED ARTICLE LIST:** Only the following wiki articles may be touched. They are all gitignored.

- `03-research/wiki/coaching-fundraising.md` — fundraise advisor coaching log
- `03-research/wiki/coaching-collison.md` — leadership advisor coaching log
- `03-research/wiki/fundraise-strategy.md` — Series A negotiation playbook
- `03-research/wiki/fundraise-narrative.md` — investor narrative

**Sensitive mode — FORBIDDEN updates:** Do NOT edit any tracked wiki article in sensitive mode, even if it seems relevant. Specifically:
- `ben-sun.md`, `primary-relationship.md` — tracked; personnel/counterparty notes do not belong here in sensitive mode
- `legal-compliance.md` — tracked; counsel-dispute and malpractice context do not belong here
- Any other tracked file in `03-research/wiki/` — not safe for sensitive-matter content

If durable knowledge surfaced in a sensitive session would otherwise update a tracked article, instead append it to the equivalent gitignored coaching log (e.g., a personnel note about Ben goes into `coaching-fundraising.md` under Key Inputs, not `ben-sun.md`).

**Sensitive mode — Changelog skip:** Skip step 6D (changelog update) entirely OR use a generic descriptor that does not name the matter. The changelog is tracked.

**Sensitive mode — Content registry skip:** Skip step 6C (content registry update) if the source pointer would reveal the matter. Source pointers like "Nov 17 2025 attorney call transcript" or "May 12 2026 outside-counsel intake notes" do not belong in a tracked registry.

**Why:** Sessions generate knowledge that should compound across the vault, not stay trapped in daily logs. The wiki at `03-research/wiki/` contains concept articles that get smarter over time as new evidence is incorporated.

**Wiki article inventory (29 articles, 7 clusters):**

| Cluster | Articles |
|---------|----------|
| Strategy | `positioning-evolution`, `fund-expense-strategy`, `competitive-landscape`, `manifesto` |
| Sales | `beta-partnerships`, `pricing-strategy`, `outbound-campaigns`, `inbound-engagement`, `sales-objections` |
| Research | `research-methodology`, `expert-sourcing`, `report-format`, `sector-coverage`, `research-team` |
| Voice & People | `voice-christopher`, `voice-altis`, `ben-sun`, `user-manuals`, `key-prospects` |
| Product | `researchos`, `gtmos`, `expertOS` |
| Governance | `primary-relationship`, `legal-compliance` (fundraise specifics go to gitignored `fundraise-strategy`) |
| Infrastructure | `gtm-agent-stack`, `deck-review-system`, `claude-code-system`, `campaign-infrastructure`, `tool-routing` |
| Coaching (gitignored) | `coaching-collison`, `coaching-fundraising` |

**What gets updated:**
- Concept articles in `$MAIN_REPO/03-research/wiki/` that are touched by this session's topics
- Content registry at `$MAIN_REPO/01-context/content-registry.md` if new source pointers emerged

**When to create a NEW article:**

If the session produced durable knowledge that doesn't fit any of the 29 articles above, create a new one. The test: "Would a future session benefit from having this knowledge pre-compiled?" If yes, create it using the standard template and add it to the inventory table above (edit this file) and to the content registry.

Examples of valid new articles:
- A new product vertical emerges (e.g., `investor-portal.md`)
- A new strategic partnership type that doesn't fit existing articles
- A new person becomes important enough to warrant their own article (like `ben-sun.md`)

Examples of what does NOT warrant a new article:
- One-off debugging sessions
- Ephemeral task planning
- Topics already covered by an existing article (update it instead)

**What does NOT get updated:**
- Articles unrelated to this session's topics

**Execution:**

**Step A — Identify touched concepts:**

Scan THIS session for topics with durable knowledge value (not ephemeral task chatter). Map each to an article from the inventory above. A session about pricing strategy produces knowledge for `pricing-strategy.md`. A session about fixing a broken cron job probably touches nothing. If a topic doesn't map to any existing article, evaluate whether it warrants a new one (see criteria above).

**Scope check:** Only update an article where THIS session produced material new evidence — not articles brushed past, recalled from memory, or related to other open work. Wiki articles compound over time; the compounding is only valuable if each update is genuinely sourced in the session that triggers it.

**Step B — Update articles:**

For each touched article, read it, then append new evidence to the `## Key inputs` section with today's date. If the `## Current position` has materially changed, update it. If new open questions emerged, add them.

Example update to `## Key inputs`:
```markdown
- (2026-04-03) Trimer confirmed PE-style diligence pattern — validates late-stage segment hypothesis
```

**Step C — Update content registry:**

If the session surfaced new source pointers (e.g., a Thoughtful thread, a Slack channel, a meeting transcript with key knowledge), add them to the relevant section in `01-context/content-registry.md`.

**Step D — Update changelog:**

If any articles were updated in Steps A-C, append an entry to `$MAIN_REPO/03-research/wiki/changelog.md`:

```markdown
## [YYYY-MM-DD] wrap | <session title>
- article-name.md — what changed
- other-article.md — what changed
```

Also update `$MAIN_REPO/03-research/wiki/index.md` if any article's one-line summary is now inaccurate, or if a new article was created.

**Step E — Report:**

In the wrap output, list which wiki articles were updated so Christopher can see the system compounding:
```
Wiki updated:
  - pricing-strategy.md — added Trimer data point
  - beta-partnerships.md — updated GIC status to closed
```

If no articles were touched, say: `Wiki: no durable knowledge to compile from this session.`

### 7. Suggest Next Steps

End with:
- What might be worth picking up next
- Any time-sensitive items surfaced

**Sensitive mode — Add Protected Files audit:** Before the "Next Steps" section, include a `## Protected Files` section that lists EVERY file written or modified during the session along with its gitignore status. Run `git check-ignore -v <path>` against each sensitive file and include the output verbatim. Example format:

```
## Protected Files

| File | Status | Verification |
|------|--------|-------------|
| 02-projects/legal/<matter>-timeline.md | gitignored | .gitignore:28:02-projects/legal/ |
| 06-daily-log/2026-05-12.md | gitignored | .gitignore:37:06-daily-log/2026-05-12.md |
| 05-archive/claude/2026-05-12_session.md | gitignored | .gitignore:8:05-archive/ |
| 03-research/wiki/coaching-fundraising.md | gitignored | .gitignore:23:03-research/wiki/coaching-fundraising.md |
```

Also flag out-of-vault surfaces the user must manage themselves:
- Trello board sharing — if any cards were created
- Granola transcript visibility — if any meeting transcripts are referenced or saved
- Outside counsel intake records — if any new counsel was contacted during the session
- Email or Slack threads that may have surfaced the matter to additional parties

This audit gives the user verifiable proof that nothing sensitive leaked into tracked content, and a clear list of remaining out-of-vault risks.

## Trello Environment Variables

Required in `~/.zshrc`:

```bash
export TRELLO_API_KEY="..."
export TRELLO_TOKEN="..."
export TRELLO_BOARD_ID="..."
export TRELLO_LIST_REVIEW="..."    # Inbox — items needing triage
export TRELLO_LIST_ACTION="..."    # Triaged — committed work
export TRELLO_LIST_WAITING="..."   # Waiting on others
export TRELLO_LIST_INTEL="..."     # Strategic intelligence
export TRELLO_LIST_DONE="..."      # Completed
```

## Example

```
/wrap deep-research implementation
```

Creates:
- `$MAIN_REPO/05-archive/claude/2026-01-29_deep-research-implementation.md`
- Appends to `$MAIN_REPO/06-daily-log/2026-01-29.md`
- Trello cards created for open items (Review/Waiting lists) and learnings (Intel list)

## Why This Exists

Combines five end-of-session tasks into one command:
1. **Archival** — Session becomes searchable via `/deep-research`
2. **Logging** — Progress tracked in daily log
3. **Task capture** — Open items land in Trello where work is tracked
4. **Knowledge capture** — Learnings land in Intel stack for future reference
5. **Wiki compile** — Durable knowledge flows into concept articles that compound over time

Run `/wrap` at the end of substantive sessions.

## Sensitive-Mode Recap (read once, internalize)

The Step 0 sensitivity check is not optional. If any hard trigger appears in the session — counsel disputes, malpractice, off-record intel, outside-investor signals not on the public deal, specific cap-table math tied to a named investor's internal target, personnel evaluations, or privileged-adjacent material — auto-enter sensitive mode and apply every per-step adjustment above.

If unsure, ask. The cost of over-routing is small (a few seconds of user confirmation). The cost of under-routing is leaking sensitive material into tracked files that push to GitHub, which is potentially catastrophic for the user's negotiating posture, relationship with counterparties, and ability to preserve legal claims.

Default to private when in doubt. The user can always loosen later; you cannot un-push from GitHub once it lands.
