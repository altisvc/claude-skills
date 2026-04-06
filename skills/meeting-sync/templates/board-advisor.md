# Follow-up Template: Board / Advisor Meeting

> Meetings with Emily Man, board members, or formal advisors. Strategic guidance conversations with governance implications.

---

## Classification Signals

- Participants include Emily Man or other board members
- Advisory context: strategic review, portfolio guidance, governance
- Topics: board updates, strategic pivots, fundraise strategy, key hires, company direction
- May overlap with investor — classify as board-advisor when Emily/board members are advising, not evaluating a new investment

---

## Extraction Dimensions

### 1. Strategic Directives

What guidance was given that should influence near-term decisions?

- "You should [do X]" or "I'd prioritize [Y]" — advisor recommendation
- "The board expects [Z] by [date]" — governance commitment
- "Based on what I'm seeing in the portfolio..." — pattern-matched advice

For each directive, capture:
- What was recommended
- Whether Christopher agreed, pushed back, or deferred
- What it implies for current workstreams

### 2. Commitments (both directions)

- Christopher to board: "I'll have [deliverable] by [date]"
- Board to Christopher: "I'll connect you with [person]" or "I'll send [resource]"
- Shared commitments: "Let's reconvene on [topic] at [time]"

### 3. Concerns Raised

What worried the advisor? These shape narrative and priorities.

- Market concerns: competition, timing, regulatory
- Execution concerns: team, speed, quality
- Fundraise concerns: positioning, valuation, investor dynamics
- Product concerns: differentiation, scalability, defensibility

### 4. Portfolio Intelligence

What did the advisor share from their broader portfolio or network?

- Relevant portfolio company experiences or comparisons
- Market signals from other investments
- People to meet (potential hires, customers, partners)
- Cautionary tales or failure modes to avoid

### 5. Governance Items

Any formal or semi-formal items:

- Board meeting scheduling
- Reporting requirements or format changes
- Approval needed for specific decisions
- Equity, compensation, or structural discussions

---

## Output Format

### Active Follow-ups

```yaml
- action: "[Specific action or deliverable]"
  owner: "[Name]"
  source: "[Brief quote from transcript]"
  urgency: now | this_week | when_possible
  type: active | waiting_for
  dimension: directive | commitment | governance
```

### Advisory Intelligence

```yaml
- insight: "[Strategic guidance, portfolio pattern, or market signal]"
  relevant_to: "[strategy | fundraise | hiring | product | GTM]"
  source: "[Brief quote]"
```

---

## What NOT to Extract as Follow-ups

- General encouragement ("you're doing great")
- Background context Christopher provided to the advisor
- Advisor thinking out loud without a recommendation ("I wonder if...")
- Historical anecdotes without actionable takeaway
- Things already completed or in motion that were discussed for context
