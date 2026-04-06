# Follow-up Template: Recruiting Meeting

> Candidate conversations — HBS/GSB/MBA students, MBB consultants, expert network professionals, anyone being evaluated for an Altis role.

---

## Classification Signals

- Participant has MBA, MBB, or expert network background
- Discussion of roles, summer internships, full-time positions at Altis
- Resume/background walkthrough
- Topics: PE/VC experience, research skills, deal experience, summer plans

---

## Extraction Dimensions

### 1. Candidate Profile

Build a structured snapshot:

- **Background:** School, prior firms, years of experience, notable deals/projects
- **Relevant skills:** Research, diligence, expert calls, financial modeling, sector expertise
- **Motivation:** Why exploring Altis vs. returning to prior firm? What excites them?
- **Constraints:** Location, timeline (summer only vs. full-time), competing offers, visa/sponsorship
- **Cultural signals:** Self-starter? Comfortable with ambiguity? AI-curious?

### 2. Roles Discussed

What positions were explored? For each:

- Role name and scope
- Who they'd work with (Jason's team, Christopher directly, Stanley)
- How their experience maps to the role
- Their level of interest

### 3. Committed Next Steps

Only extract explicit commitments:

- "I'll send you [materials/references/writing sample]" — from candidate
- "I'll set up time with [Jason/Stanley/team member]" — from Christopher
- "Let me send you [job description/sample report/more info]" — from Christopher
- "I'll review [website/research tab/materials] this weekend" — from candidate (waiting_for)

### 4. Evaluation Signals

Christopher's implicit or explicit assessment during the call:

- Strong interest indicators ("I could see you in role X")
- Concerns or gaps identified
- Comparison to other candidates (if mentioned)
- Whether Christopher sees this as an immediate hire vs. pipeline candidate

---

## Output Format

### Candidate Assessment

One paragraph: who they are, what role(s) fit, and where they stand in the process.

### Active Follow-ups

```yaml
- action: "[Specific next step]"
  owner: "[Name — Christopher or candidate name]"
  source: "[Brief quote from transcript]"
  urgency: now | this_week | when_possible
  type: active | waiting_for
```

### Recruiting Intelligence

```yaml
- insight: "[What was learned about the talent market, compensation, or recruiting dynamics]"
  relevant_to: "[hiring | team building | compensation]"
  source: "[Brief quote]"
```

---

## What NOT to Extract as Follow-ups

- Candidate explaining their background (already captured in profile)
- Christopher explaining Altis (he knows what he said)
- General enthusiasm from either party without specific commitment
- "Stay in touch" without concrete next step
- Advice given to the candidate about their career (not an Altis task)
- Things the candidate needs to do for their OTHER job search (not Altis's concern)
