# Follow-up Template: Partner Meeting

> External collaborators — design team (Gabe, Savannah), vendors, service providers, non-investor non-customer externals working with Altis.

---

## Classification Signals

- External participants who are neither investors, prospects, candidates, nor advisors
- Working relationship: delivering services to Altis or collaborating on shared projects
- Topics: design reviews, vendor check-ins, integration work, project updates
- Participants: Primary Design team (Gabe, Savannah), external contractors, tool vendors

---

## Extraction Dimensions

### 1. Deliverables and Deadlines

What's being delivered, by whom, and when?

- "[Partner] will deliver [X] by [date]"
- "We need [Y] from Altis by [date] to proceed"
- Milestone check-ins: what's done, what's next
- Scope changes: anything added, removed, or modified from the original plan

### 2. Decisions Made

What was decided that affects the project?

- Design direction chosen
- Tool or technology selected
- Approach agreed upon
- Scope explicitly cut or added

### 3. Feedback and Revisions

What feedback was given (in either direction)?

- Christopher's feedback on partner deliverables
- Partner's feedback on Altis requirements or constraints
- Revision requests with specific changes needed
- Approval given on specific items

### 4. Blockers

What's stuck?

- Waiting on Altis for content, decisions, or access
- Waiting on partner for deliverables or information
- Technical blockers: integration issues, tool limitations
- Dependency chains: X can't start until Y is done

### 5. Process and Relationship

Working relationship health signals:

- Communication cadence changes ("let's move to weekly check-ins")
- New points of contact or handoffs
- Budget or scope renegotiation signals
- Timeline pressure from either side

---

## Output Format

### Active Follow-ups

```yaml
- action: "[Specific deliverable or action]"
  owner: "[Name — Christopher, partner name, or Altis team member]"
  source: "[Brief quote from transcript]"
  urgency: now | this_week | when_possible
  type: active | waiting_for
  dimension: deliverable | decision | blocker | feedback
```

### Partner Intelligence

```yaml
- insight: "[Tool capability discovered, process improvement, or vendor landscape signal]"
  relevant_to: "[product | design | operations | infrastructure]"
  source: "[Brief quote]"
```

---

## What NOT to Extract as Follow-ups

- Status updates with no action implied ("the design is coming along")
- Routine process steps that are already in motion
- Social conversation
- Things completed during the meeting itself (live reviews, real-time edits)
- Partner's internal process details that don't affect Altis
