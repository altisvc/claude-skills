# Follow-up Template: Prospect Meeting

> Sales conversations — VC firms evaluating Altis as a research service provider, pilot discussions, pricing conversations.

---

## Classification Signals

- External participants from VC firms discussing Altis as a SERVICE (not as an investment)
- Topics: research reports, diligence support, pilot programs, pricing, deliverables
- Phrases: "we'd be interested in trying," "what does a report look like," "how does pricing work"
- May overlap with investor — if they're evaluating both investing AND buying, classify based on the PRIMARY intent of the meeting

---

## Extraction Dimensions

### 1. Prospect Qualification

Assess the prospect against Altis ICP during extraction:

- **Firm size and AUM** — do they have budget for research?
- **Deal flow volume** — enough activity to justify recurring research?
- **Current research process** — what are they replacing? (AlphaSense, Tegus, internal analysts, nothing?)
- **Decision maker present?** — who needs to approve a pilot?
- **Timeline** — active deals they'd use Altis for, or hypothetical interest?

### 2. Commitments and Next Steps

- Materials promised: sample reports, pricing docs, case studies
- Pilot structure discussed: scope, timeline, deliverables
- Follow-up meetings scheduled or proposed
- Introductions to other team members (theirs or ours)

### 3. Objections and Concerns

- Price sensitivity signals
- Compliance or data concerns
- Comparison to existing solutions
- Skepticism about AI-generated research quality
- "We'd need to see X before moving forward"

### 4. Intelligence

- How they currently make investment decisions
- What research they pay for today and what they think of it
- Other tools or services in their workflow
- Fund strategy or thesis (relevant for matching research topics)

---

## Assessment

After extracting dimensions, provide a one-line assessment:

```
**Pursue** / **Deprioritize** / **Nurture** — [one sentence rationale]
```

- **Pursue:** Active need, budget, decision-maker engaged, timeline exists
- **Deprioritize:** Below ICP, no budget, tire-kicking, or primarily interested in investing (not buying)
- **Nurture:** Interesting but not ready — check back in N months

---

## Output Format

### Active Follow-ups

```yaml
- action: "[Specific deliverable or next step]"
  owner: "[Name]"
  source: "[Brief quote from transcript]"
  urgency: now | this_week | when_possible
  type: active | waiting_for
  dimension: commitment | objection_response | qualification
```

### Pipeline Follow-up (for HubSpot — required for all prospect meetings)

Derive this from the conversation. The `follow_up_date` is computed from what was discussed, not a generic "1 week later." The `context` is what Oscar needs to write a good follow-up email — what happened, what to reference, what to ask about. The `waiting_on` is what the prospect said they'd do.

```yaml
follow_up:
  contact_email: "[prospect's email]"
  follow_up_date: "[YYYY-MM-DD — computed from conversation: 'follow up Friday' = that Friday's date, '~1 week' = meeting date + 7 days, '~2 weeks' = meeting date + 14 days]"
  context: "[1-2 sentences for Oscar: what to reference in the follow-up, what to ask about, what angle to take]"
  waiting_on: "[What the prospect committed to doing — e.g., 'discussing with CIO', 'sharing with team', 'confirming budget']"
```

### Prospect Intelligence

```yaml
- insight: "[What was learned about their buying process, needs, or competitive set]"
  relevant_to: "[GTM | pricing | product | competitive]"
  source: "[Brief quote]"
```

---

## What NOT to Extract as Follow-ups

- Christopher explaining the Altis model — he knows what he said
- Positive reactions without specific next steps ("that's really cool")
- The prospect's internal challenges (unless they create an Altis opportunity)
- Materials already sent before or during the meeting
- Vague interest without commitment ("we should talk again sometime")
