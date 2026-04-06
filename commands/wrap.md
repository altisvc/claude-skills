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
MAIN_REPO=/Users/preparedmindchris/Desktop/altis-brain
```

All paths below are relative to `MAIN_REPO`. When executing file reads/writes, always prepend this root.

## What It Does

### 1. Archive to Claude History

Create session summary in `$MAIN_REPO/05-archive/claude/YYYY-MM-DD_<title>.md`:

```markdown
# <Title>

**Date:** YYYY-MM-DD HH:MM
**Source:** Claude Session

---

## Summary
[2-3 paragraph summary of what was discussed/accomplished]

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

Append to or create `$MAIN_REPO/06-daily-log/YYYY-MM-DD.md`:

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

**Why:** Action items captured in markdown archives don't get acted on. Trello is the canonical task system (since 2026-03-14). Open items should land where work actually gets tracked.

**What goes to Trello Review list (inbox):**
- Action items from the session that need triage
- Open threads that require a next step
- Commitments Christopher made during the session

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

**Why:** Sessions generate knowledge that should compound across the vault, not stay trapped in daily logs. The wiki at `03-research/wiki/` contains concept articles that get smarter over time as new evidence is incorporated.

**Wiki article inventory (29 articles, 7 clusters):**

| Cluster | Articles |
|---------|----------|
| Strategy | `positioning-evolution`, `fund-expense-strategy`, `competitive-landscape`, `manifesto` |
| Sales | `beta-partnerships`, `pricing-strategy`, `outbound-campaigns`, `inbound-engagement`, `sales-objections` |
| Research | `research-methodology`, `expert-sourcing`, `report-format`, `sector-coverage`, `research-team` |
| Voice & People | `voice-christopher`, `voice-altis`, `ben-sun`, `key-prospects` |
| Product | `researchos`, `gtmos`, `expertOS` |
| Governance | `fundraise-narrative`, `primary-relationship`, `legal-compliance` |
| Infrastructure | `gtm-agent-stack`, `deck-review-system`, `claude-code-system`, `campaign-infrastructure`, `tool-routing` |

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

Scan the session for topics with durable knowledge value (not ephemeral task chatter). Map each to an article from the inventory above. A session about pricing strategy produces knowledge for `pricing-strategy.md`. A session about fixing a broken cron job probably touches nothing. If a topic doesn't map to any existing article, evaluate whether it warrants a new one (see criteria above).

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
