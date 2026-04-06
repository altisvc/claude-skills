# Follow-up Template: Investor Meeting

> Meetings with investors — Primary Venture Partners, other VCs considering investing, board-adjacent capital conversations.

---

## Classification Signals

- Participants from VC firms (Primary team: Emily Man, John Lehr, Tanmaye Bhatia, Barbara, Bridget)
- Discussion of fundraising: terms, valuation, round size, timeline, cap table
- Investor updates: metrics, milestones, strategy presentations
- Due diligence conversations initiated by investors

---

## Extraction Dimensions

### 1. Commitments Made (by either side)

What did Christopher commit to delivering, and what did the investor commit to?

- "I'll send you [document/data/update]" — deliverable with implied deadline
- "We'll have [milestone] by [date]" — timeline commitment investors will track
- "Let me connect you with [person]" — intro committed
- Investor: "We'll get back to you by [date]" — waiting_for item

### 2. Investor Concerns or Objections

What questions or pushback surfaced? These inform narrative refinement.

- Direct objections ("I'm worried about X")
- Probing questions that reveal concern ("How do you handle X?")
- Comparisons to competitors or alternatives
- Requests for more information on specific topics

### 3. Strategic Signals

What did the investor reveal about their thinking, portfolio, or market view?

- Portfolio company mentions (potential partnerships or conflicts)
- Market thesis alignment or divergence
- Timing signals ("we're looking to deploy in Q2")
- Decision process clues ("our IC meets on Thursdays")

### 4. Narrative Feedback

How did the Altis pitch land? What resonated, what fell flat?

- Moments of visible excitement or engagement
- Points where the investor wanted to go deeper
- Framings that didn't land — need to rework for next pitch
- New angles or framings suggested by the investor

### 5. Deal Mechanics

Any concrete movement on terms, process, or timeline.

- Valuation discussion
- Round structure or sizing
- Timeline for next steps
- Legal or structural considerations
- Other investors mentioned (syndicate dynamics)

---

## Output Format

### Active Follow-ups

```yaml
- action: "[Specific deliverable or action]"
  owner: "[Name]"
  source: "[Brief quote from transcript]"
  urgency: now | this_week | when_possible
  type: active | waiting_for
  dimension: commitment | objection_response | deal_mechanic
```

### Investor Intelligence

```yaml
- insight: "[What was learned about the investor's position, concerns, or market view]"
  relevant_to: "[fundraise narrative | deal terms | GTM | team]"
  source: "[Brief quote]"
```

---

## What NOT to Extract as Follow-ups

- Christopher explaining the Altis model (he already knows what he said)
- General positive sentiment ("this is really interesting") — note WHAT interested them instead
- Investor small talk or relationship building
- Background information Christopher shared for context
- Things already sent or completed before/during the meeting
