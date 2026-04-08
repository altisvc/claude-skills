# Skill: Consult Advisor

> Invokes an advisor persona with **full context isolation**. The advisor sees only its spec and your question—never the main conversation context.

---

## Skill Metadata

```yaml
id: consult-advisor
trigger: /consult
context: fork
returns: summary
isolation: full
```

---

## Purpose

This skill prevents persona contamination. When you consult the AI Red Team about context engineering, that framing should inform Christopher's decision—but it should NOT leak into subsequent responses.

**Without this skill:** Claudia invokes AI Red Team, Harrison Chase's "first draft framing" enters the main context, and suddenly all recommendations are filtered through that lens even for unrelated topics.

**With this skill:** The advisor runs in isolation. You get a structured summary. The main context stays clean.

---

## Available Advisors

| Advisor | ID | Use For |
|---------|-----|---------|
| **Founding Tegus CIO** | `advisor-founding-tegus-cio` | Build vs. buy, user gating, CRM sync, balancing security with GTM speed |
| **Harrison Chase** | `advisor-harrison-chase` | Agent architecture, context engineering, AI engineering decisions |
| **Gartner CSO** | `advisor-gartner-cso` | Analyst/research buyer perspective, compounding growth |
| **Founding PitchBook CSO** | `advisor-founding-pitchbook-cso` | Early-stage data business growth, perception-as-moat, capital efficiency |
| **Mom Test** | `advisor-mom-test` | Customer discovery, problem validation, interview design |
| **Fundraising** | `advisor-fundraising` | Series A negotiation with Primary, term sheet strategy, dilution scenarios, investor narrative |
| **Collison (Leadership)** | `advisor-collison` | Leadership coaching as Patrick Collison — hiring, culture, craft, decisions, long-term company building |

---

## Invocation

```
/consult <advisor-id>
<your question or situation>
```

### Examples

```
/consult advisor-founding-tegus-cio
Stanley wants to hardcode report limits in the Supabase schema.
I'm worried this creates developer dependencies for every pricing change.
Should I push for a config table approach?
```

```
/consult advisor-harrison-chase
We're building a research agent that pulls company data from multiple sources.
Current plan: stuff everything into context and let the model figure it out.
What am I missing?
```

---

## Execution Protocol

When this skill is invoked:

### Step 1: Validate advisor exists

Check `.claude/agents/` for the requested advisor ID. If not found, list available advisors.

### Step 2: Load advisor spec (ISOLATION BEGINS)

Read ONLY the advisor's agent spec from `.claude/agents/<advisor-id>.md`. Do NOT include:
- Main conversation context
- Other loaded files
- Previous advisor consultations
- Project-specific knowledge outside the question

### Step 2.5: Inject live Altis context from wiki

Read wiki articles and append their content to the advisor prompt as a `## Current Altis State (live context)` section. This replaces hardcoded company state that drifts.

**Tier 1 — always inject (4 articles):**
- `03-research/wiki/about-altis.md` — company overview, problem, solution, traction
- `03-research/wiki/research-team.md` — current team roster, compensation, unit economics
- `03-research/wiki/fundraise-narrative.md` — fundraise status, valuation, timeline
- `03-research/wiki/user-manuals.md` — how each team member works, communicates, gives/receives feedback

**Tier 2 — inject when relevant to the question topic:**
- `03-research/wiki/beta-partnerships.md` — if question involves sales, traction, clients
- `03-research/wiki/competitive-landscape.md` — if question involves positioning, competitors
- `03-research/wiki/positioning-evolution.md` — if question involves messaging, ICP, GTM
- `03-research/wiki/pricing-strategy.md` — if question involves pricing, packaging
- `03-research/wiki/researchos.md` — if question involves product, engineering, Stanley
- `03-research/wiki/gtmos.md` — if question involves GTM automation, agents

**Format:** Extract only the `## Current position` and `## Key inputs` sections from each article. Omit `## Open questions`, `## Sources`, and `## Related articles` to save tokens.

**Token budget:** Keep total injected wiki context under 3,000 tokens. If Tier 1 + Tier 2 exceeds this, summarize Tier 2 articles to key facts only.

### Step 3: Format the question

Present the question to the advisor exactly as provided. Do not summarize or pre-interpret.

### Step 4: Get advisor response

Run the advisor with its spec as system prompt and the question as user input. The advisor returns using its defined output format.

### Step 5: Return summary (ISOLATION ENDS)

Present the advisor's structured response to the main thread. Mark it clearly:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADVISOR CONSULTATION: [Advisor Name]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Advisor's structured response]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## What This Skill Prevents

### 1. Persona Bleed

**Before:** You ask AI Red Team about compaction strategy. Now every recommendation references "traces" and "harnesses" even when discussing GTM.

**After:** AI Red Team's response is boxed. Main context remains in Christopher's voice and framing.

### 2. Context Contamination

**Before:** You consult GTM Architect about a developer issue. Now the "Golden Record" framing influences unrelated product decisions.

**After:** GTM Architect's response stays in the consultation box. You can reference it, but it doesn't become the default lens.

### 3. Advisor Conflation

**Before:** You consulted AI Red Team, then GTM Architect. Now responses blend both perspectives incoherently.

**After:** Each consultation is isolated. You integrate insights deliberately.

---

## Critical Rules

1. **Never consult multiple advisors simultaneously** — Run one consultation at a time

2. **Never pass advisor output as input to another advisor** — That's your job to synthesize

3. **Never skip the isolation** — If you need the advisor to know main context, explicitly include it in your question text

4. **Always present the structured response** — Don't summarize the advisor's output; show it as-is

---

## Hooks

```yaml
hooks:
  PreInvoke:
    - name: validate-advisor-exists
      action: Check .claude/agents/ for requested advisor ID
      failure: List available advisors and abort

  PostInvoke:
    - name: ensure-isolation-boundary
      action: Verify advisor response is boxed and main context unchanged
```
