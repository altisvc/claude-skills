# Follow-up Template: Discovery Meeting

> Exploratory conversations — industry experts, potential partners, knowledge exchanges, demo sessions. The primary value is intelligence, not tasks.

---

## Classification Signals

- External participant with domain expertise (expert networks, industry operators, technologists)
- Conversation is exploratory, not transactional — no deal, no pitch, no hire
- Topics: industry dynamics, competitive landscape, technology demos, workflow sharing
- No clear "next step" commitment expected
- May overlap with prospect or recruiting — if the meeting has a clear sales or hiring intent, classify as that instead

---

## Extraction Priority

**Intelligence first, tasks second.** Discovery meetings rarely produce direct follow-ups. Their value is strategic context that changes how Christopher and the team think about decisions downstream.

The extraction question is NOT "what do I need to do?" but rather:
- **What did I learn that I didn't know before?**
- **What assumption did this confirm or challenge?**
- **Who on the team would benefit from knowing this?**

---

## Extraction Dimensions

### 1. Strategic Intelligence (PRIMARY)

What new information surfaced that affects Altis strategy, hiring, product, or GTM?

For each insight, capture:
- **What was learned** — specific enough to be useful without reading the transcript
- **Who it matters to** — which team member or function benefits
- **Reinforces or challenges** — does this confirm or contradict existing thinking?
- **Actionability** — is this "file for later" or "changes a decision we're making now"?

Categories to watch for:
- **Competitive dynamics:** What competitors are doing, market share shifts, consolidation signals
- **Hiring intelligence:** Where to find talent, what profiles work, who to recruit, compensation benchmarks
- **Compliance/regulatory:** Protocols, risks, cautionary tales from adjacent industries
- **Technology/tools:** New integrations, plugins, workflows, architecture patterns worth exploring
- **Customer/buyer behavior:** How buyers think, what they value, what frustrates them
- **Industry structure:** How the market works, who the real players are, where value accrues
- **Pricing/positioning:** Signals about what the market will bear, how to frame the offering

### 2. Relationship Context

Who was this person and why might they matter again?

- Their role and sphere of influence
- Offered to help with anything specific? ("Feel free to reach out about X")
- Connected to anyone relevant? (warm intro potential)
- Would they be a good expert call candidate for a future research report?

### 3. Follow-ups (SECONDARY)

Only extract if explicitly committed to in the conversation. Discovery meetings should NOT generate phantom tasks.

**What qualifies:**
- "I'll send you [specific thing]" — from either party
- "Let me introduce you to [person]" — warm intro committed
- "Let's reconnect about [topic] in [timeframe]" — scheduled follow-up

**What does NOT qualify:**
- "Let's stay in touch" — too vague, not a task
- "That would be interesting to explore" — interest, not commitment
- "You should look into X" — suggestion, not assignment
- "I'd be happy to answer questions" — open offer, not a follow-up unless Christopher plans to take them up on it

---

## Output Format

Produce TWO sections. **Key Intelligence is the primary output.** Follow-ups are secondary and may be empty.

### Key Intelligence

```yaml
- insight: "[What was learned — specific enough to be useful without reading transcript]"
  category: competitive | hiring | compliance | technology | customer | industry | pricing
  relevant_to: "[Team member or function who benefits]"
  reinforces_or_challenges: "[What existing assumption this relates to]"
  actionability: file_for_later | changes_active_decision
  source: "[Brief quote from transcript]"
```

### Confirmed Follow-ups

```yaml
- action: "[Specific, committed action — not vague]"
  owner: "[Name]"
  source: "[Brief quote from transcript showing commitment]"
  urgency: now | this_week | when_possible
  type: active | waiting_for
```

If no follow-ups were committed to, write:
```
None — discovery session, insights captured above.
```

---

## What NOT to Extract

- Suggestions made TO the other person ("you should try X") — these are not Christopher's tasks
- General enthusiasm ("that's really cool") — note the WHAT, not the reaction
- Status updates about Altis shared during the call — Christopher already knows this
- Brainstorming that neither party committed to acting on
- The other person's internal priorities or challenges (unless they create an opportunity for Altis)
- Things Christopher demonstrated or explained — he already knows what he showed them

---

## Meeting File Structure

Discovery meetings use a different file structure than task-heavy meetings:

```markdown
---
title: [Meeting Title]
date: [YYYY-MM-DD]
type: discovery
participants: [Names and affiliations]
github: flagged
granola_id: [UUID]
---

## Summary

[3-5 sentences: who, context, what was discussed, key takeaway]

## Key Intelligence

[Extracted insights in prose — this is what gets pushed to GitHub]

## Confirmed Follow-ups

[If any — otherwise "None — discovery session, insights captured above."]

## Transcript

Available via Granola MCP: meeting ID `[UUID]`
```
