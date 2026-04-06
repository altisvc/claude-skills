# Follow-up Template: Team Meeting

> Internal Altis meetings — Jason, Stanley, Mehdi, Olivia, Maxine, or any @altis.vc attendees only.

---

## Classification Signals

- All attendees have @altis.vc email domains
- Participants include: Jason Seu, Stanley Gu, Mehdi Lazrak, Olivia Ozino Caligaris, Maxine Litre
- Meeting titles reference internal topics: standup, sync, sprint, planning, review, brainstorm
- No external participants

---

## Extraction Dimensions

When reading the transcript, extract follow-ups along these dimensions:

### 1. Decisions Made

What was decided? Decisions imply execution steps.

- For each decision, ask: "What is the concrete next action to make this happen?"
- "We're going with approach X" -> first implementation step, assigned to someone
- "Let's hold off on Y" -> remove from active work, notify anyone waiting on it
- "We agreed to Z timeline" -> calendar/deadline items

### 2. Task Assignments

Explicit or implicit task ownership.

- "[Name] will..." or "[Name] to..." -> direct assignment
- "Can someone..." or "We need to..." -> flag as unassigned, ask Christopher who owns it
- "I'll..." from Christopher -> Christopher task
- "I'll..." from others -> their task, Christopher should track

### 3. Blockers Surfaced

What's stuck and what unblocks it?

- "Waiting on..." -> who/what is blocking, and what's the unblock action
- "Can't proceed until..." -> dependency to track
- "Need input from..." -> outreach task

### 4. Information Shared That Changes Plans

New context that affects existing work.

- Timeline changes -> update affected tasks, notify stakeholders
- Scope changes -> update project docs, confirm with team
- Resource changes -> adjust assignments
- External feedback incorporated -> may trigger outbound follow-ups

### 5. Items Deferred

What was explicitly punted?

- "Let's revisit next week" -> create a reminder/follow-up for that date
- "Not a priority right now" -> remove from active, note in backlog
- "We'll come back to this" -> capture so it doesn't disappear

### 6. Intelligence Worth Filing

Strategic insights, market intelligence, tool discoveries, or competitive signals that aren't tasks but would be valuable if surfaced at the right moment later. **This is the primary reason meetings get pushed to GitHub as team knowledge assets.**

- Customer feedback on product (format preferences, feature requests, complaints)
- Competitive intelligence (what competitors are doing, market shifts)
- Tool or technology discoveries (new integrations, plugins, workflows)
- Hiring/talent insights (who to recruit, where to find people, what profiles work)
- Industry dynamics (regulatory, compliance, market structure changes)
- Pricing/positioning signals from conversations

For each intelligence item, note:
- What was learned
- Who on the team would benefit from knowing this
- Whether it reinforces or contradicts existing assumptions

---

## Follow-up Format

Produce TWO sections:

### Active Follow-ups

```yaml
- action: "[Specific, actionable — someone could do this without reading the transcript]"
  owner: "[Name]"
  source: "[Brief quote from transcript showing where this came from]"
  urgency: now | this_week | when_possible
  type: active | waiting_for
  dimension: decision | assignment | blocker | plan_change | deferred
```

**Active** = someone needs to do something.
**Waiting_for** = Christopher is waiting on someone else's action. Don't present as Christopher's task — present as a tracking item.

### Key Intelligence

```yaml
- insight: "[What was learned — specific enough to be useful without reading transcript]"
  relevant_to: "[Team member or function who benefits]"
  source: "[Brief quote]"
```

---

## What NOT to Extract as Follow-ups

- Status updates with no action implied ("things are going well with X")
- Brainstorming ideas that weren't committed to ("what if we tried...")
- Social/personal conversation
- Restatements of known information with no new decision
- Suggestions made TO someone outside Altis (e.g., advice to a friend) — these are not Christopher's tasks
- Things already completed during the meeting itself
