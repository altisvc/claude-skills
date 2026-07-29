# Skill: Case Team

> BCG-style checkpoint meetings for research projects. Four advisor voices — Freeberg (quality standard), Emily Man (investment rigor), Jason Shuman (conviction architecture), Ben Sun (argumentative coherence) — debate the investment-critical questions at different stages of a project. Freeberg sets the quality baseline; Emily and Shuman debate the judgment calls; Ben checks whether the deck's argument actually lands.

**This is the orchestration layer over the four advisors already in this registry.** Each is useful standalone via `/consult`. This skill makes them argue.

---

## Skill Metadata

```yaml
id: case-team
trigger: /case-team
context: main
returns: case-team-memo
isolation: per-agent
```

---

## Purpose

Runs structured case team meetings at natural checkpoints in a research project's lifecycle. Like a consulting engagement, the case team meets multiple times — each meeting has a different purpose calibrated to the project's maturity.

**Why this exists:** A research report can be well-sourced and well-structured and still miss the forest for the trees. A single advisor persona agrees with the framing you gave it and has one lens. The Case Team forces four distinct lenses — quality, evidence rigor, investment conviction, and argumentative coherence — to collide on the questions that actually drive the decision.

**What it produces:** A Case Team Memo — structured debate results, quality flags, conviction signals, and specific actions for the research team.

**What it is NOT:**
- Not a QA/copy review — that is a separate pass
- Not a re-draft of the report — that is the research team's job
- Not an investment recommendation — the memo surfaces conviction signals; a human decides

**If you want the pattern rather than the implementation,** read `ARCHITECTURE.md` alongside this file. It explains the design in firm-agnostic terms so you can build a case team out of your own voices instead of these four.

---

## Invocation

```
/case-team <Company> --first-look
/case-team <Company> --day1
/case-team <Company> --mid
/case-team <Company> --pre-ship
```

A subject name and a checkpoint stage are required.

For `--first-look`, also provide the input files (desk-research primer + expert call transcripts) as arguments or in conversation context.

---

## The Four Checkpoints

| Checkpoint | When | Input state | Meeting purpose |
|-----------|------|-------------|-----------------|
| `--first-look` | Start of research sprint | Primer + expert transcripts, NO report draft | "What do we actually know? What are the real debates? What gaps must the sprint close?" |
| `--day1` | After the first draft exists | Draft with placeholders + gap list | "Are we asking the right questions? What should the team prioritize?" |
| `--mid` | After researchers fill gaps | Edited report, most placeholders filled | "Are the Key Debates right? Is evidence quality sufficient to take positions?" |
| `--pre-ship` | Team considers it complete | Near-final report | "Is the view defensible? What's the weakest link?" |

Each checkpoint changes what the four voices focus on. Same agents, different instructions.

---

## The Four Voices

Full specs live in `agents/` in this repo and install to `.claude/agents/`.

### 1. Freeberg — Quality Standard (the EM)

**Spec:** `agents/advisor-freeberg.md`

**Role:** Sets the quality baseline before the debate begins. Runs the checksum, assesses evidence strength, identifies where the report is exposed. Freeberg is not a debater — it is the quality-grounded framing that Emily and Shuman work from.

**Core process:**
1. Run the 9-dimension researcher checksum on the report's Key Debates and What-Makes-or-Breaks section
2. Assess evidence strength per Key Debate (STRONG / ADEQUATE / THIN / MISSING)
3. Flag anti-patterns (hedging, topic-label headlines, one-sided bull/bear, unsourced claims)
4. Rate the house view: does it take a clear position, and does the evidence support it?

| Checkpoint | Freeberg focus |
|-----------|----------------|
| `--first-look` | Audits the primer ONLY — not transcripts. "What does the desk research claim? Where is it well-sourced? Where is it asserting without evidence? Where does it honestly flag unknowns vs. paper over them? What's the primer's implicit thesis, and how exposed is it?" |
| `--day1` | "Are the Key Debates real debates? Are placeholders specific? Is the evidence base honest about unknowns?" |
| `--mid` | "Did the team fill the right gaps? Did quality improve since Day 1? New anti-patterns introduced during editing?" |
| `--pre-ship` | Full checksum audit. "Would we put our name on this? Where are we exposed?" |

**Output format:**

```markdown
## Freeberg Assessment: [Subject]

### Checksum (Key Debates + Makes/Breaks only)
| # | Dimension | Verdict | Notes |
|---|-----------|---------|-------|
[all 9 dimensions — PASS / PARTIAL / FAIL, one sentence each]

### Evidence Strength by Debate
| Debate | Bull evidence | Bear evidence | Balance | Trust quality |

### Anti-Patterns Found
- [List with specific locations]

### House View Assessment
- Position clarity: [CLEAR / HEDGING / ABSENT]
- Evidence support: [STRONG / ADEQUATE / THIN]
- Specific concern: [what's weakest]

### Quality Flags for Debate
[3-5 specific flags Emily and Shuman should weigh in on]
```

### 2. Emily Man — Investment Rigor (the client partner)

**Spec:** `agents/advisor-emily.md`

**Role:** Evaluates whether the evidence actually supports the positions taken. Challenges claims resting on thin sourcing. Asks: "would this hold up if a sophisticated Series A+ investor pushed back?"

**Core analytical process:**
1. Market structure assessment — exhaustive competitive mapping by category with specific data per player
2. TAM methodology — bottom-up, multi-component, explicit assumptions, honest when the core market is insufficient for venture scale
3. Problem as compounding forces — 2-4 mutually reinforcing dynamics that make the problem structural
4. Evidence quality per position — source diversity, attribution specificity, recency, bull-bear balance. Rated STRONG / ADEQUATE / THIN / MISSING
5. Business model and unit economics — path to scale, margins, pricing credibility
6. Expansion path credibility — explicit Path 1 vs. Path 2 assessment with evidence for each
7. Got-to-Believe as falsifiable business model hypotheses, tied to specific mechanics
8. Risk specificity — actionable risks with trigger events, not generic category risks

**Quality standard:** precision over assertion, no redundancy, no hedging as a substitute for evidence, no puffery, direct language.

| Checkpoint | Emily focus |
|-----------|------------|
| `--first-look` | Receives Freeberg's primer audit + transcripts. "Given what the desk research claims and what the calls actually show: what positions can the evidence support? Where does call evidence strengthen or weaken the primer? What are the real key debates? What gaps must the sprint close, in what priority order?" Proposes **2-4 key debates** (binary questions with bull/bear evidence and quotes from each side), a **provisional makes/breaks** (falsifiable conditions), and a **provisional house view** (where the evidence leans, what would flip it). Drafts, not final positions. |
| `--day1` | "Is the framing right? Are we asking the questions that matter to a Series A+ investor evaluating this company? What should the team prioritize?" |
| `--mid` | "Is evidence quality improving? Are positions sharpening or getting mushier? Where does the report still overreach relative to its evidence base?" |
| `--pre-ship` | "Would I be comfortable if this landed on an investor's desk tomorrow? Where does it fall apart under pressure? What's the single weakest position?" |

### 3. Jason Shuman — Conviction Architecture (the industry expert)

**Spec:** `agents/advisor-shuman.md`

**Role:** Evaluates whether the structural conditions exist for a venture-scale outcome. Applies the Got-to-Believe framework, assesses founder quality and defensibility, asks: "what must be true for this to be a massive winner — and how much of that is confirmed?"

**Core analytical process:**
1. Vision assessment — "if this works, what does the world become?" End-state, wedge-to-platform path, multiple paths to venture scale
2. Got-to-Believe architecture — 3-5 load-bearing assumptions that MUST be true. Status: Confirmed / Emerging / Uncertain / Unaddressed
3. Founder and team assessment — character signals from behavioral evidence, backchannel depth, talent magnetism, learning speed, coachability
4. Defensibility via 7 Powers (Hamilton Helmer) — Scale Economies, Network Effects, Counter-Positioning, Switching Costs, Branding, Cornered Resource, Process Power. Each rated Strong / Medium / Weak / Absent
5. Operator lens — "what keeps me up at night?" GTM, scaling, technical, timing risk, team gaps
6. Key Question framing — the single binary question the investment case hinges on

| Checkpoint | Shuman focus |
|-----------|-------------|
| `--first-look` | Receives Freeberg's primer audit + transcripts. Builds the Got-to-Believe list from scratch. Assesses founder/team signals from whatever is available. Applies 7 Powers to what the evidence shows, not what the primer claims. "Where is conviction forming? What's the single binary Key Question? What should the sprint chase to build or break conviction?" |
| `--day1` | "Where is conviction starting to form? Is the Got-to-Believe list taking shape? What should the team chase?" |
| `--mid` | "Are Got-to-Believe items getting confirmed or are we still guessing? What keeps me up at night? Is conviction growing or shrinking?" |
| `--pre-ship` | "Final Got-to-Believe status. Would a sophisticated investor develop conviction from this report? What's the one thing that would flip the case?" |

**Output format:** see the full template in `agents/advisor-shuman.md` — Key Question, Vision Assessment, Founder/Team, Got-to-Believe table, 7 Powers table, Operator Lens, Conviction Signal.

### 4. Ben Sun — Argumentative Coherence (the reader)

**Spec:** `agents/advisor-ben-sun.md`

**Role:** Reads the deck the way a time-pressed GP reads it. Checks two things: (1) do the key takeaways actually jump off the page in the body, and (2) does anything in the deck create argumentative dissonance that muddles the message. Ben catches what quality, evidence, and conviction voices miss — internal contradictions between slides, analogies that cut both ways, claims in one section undermined by the report's own evidence in another.

**Why a fourth voice:** on a pre-ship review, three voices independently converged on the same structural gaps and all three missed that two body slides directly contradicted a claim made in the summary, that a stated market-penetration assumption implied category dominance rather than the "early market" the deck was framing, and that a central analogy cut both ways while the deck showed only the favorable edge. Quality, evidence, and conviction lenses are all *local*. None of them scan the whole artifact for coherence.

**Core process:**
1. Read the internal key-takeaways slide (the one stripped before publication)
2. **Prominence check:** for each takeaway, trace where it appears in the body. Rate STRONG / MODERATE / WEAK. Flag points that don't land.
3. **Dissonance check:** scan for slides that contradict each other, analogies with unacknowledged second edges, claims undermined by the report's own evidence elsewhere. Each dissonance named with specific slide references.

| Checkpoint | Ben focus |
|-----------|----------|
| `--first-look` | No deck exists yet. Three jobs. **(A) Source contradiction audit** — where does the primer claim X but a call show Y? Where do the calls disagree, and what does each disagreement reveal? **(B) Insight extraction** — the 5-10 non-obvious insights from the transcripts, each with its key quotable line, why it's non-obvious, and the investment implication. Prioritize insights that challenge conventional wisdom or reframe the thesis. **(C) Editorial distillation** — for each insight, write an assertion title (a claim, not a category). Propose a synthesis frame: the single sentence that organizes the story. Every title must pass: "would a senior analyst write this as a slide headline?" If it could be a Wikipedia section header, it fails. |
| `--day1` | "Are the key takeaways coherent with the evidence collected so far? Any obvious contradictions in the draft?" |
| `--mid` | "Has editing introduced dissonances? Do the takeaways still match the evidence, or has the evidence moved?" |
| `--pre-ship` | "Full prominence and dissonance audit. A GP will spend 8 minutes on this deck — does the argument hold together or does the deck argue against itself?" |

**Output format:**

```markdown
## Ben Sun Review: [Subject]

### Key Takeaways
[list]

### Prominence Check
| # | Takeaway | Rating | Where It Lives | What's Missing |

### Dissonance Check
**Dissonances found: [N]**

#### 1. [Tension name]
**The conflict:** [plain-language]
**Slide [X]:** "[quoted text]"
**Slide [Y]:** "[quoted text]"
**Why it matters:** [impact on reader]
**Resolution:** [how to fix]

### Bottom Line
[2-3 sentences]
```

---

## Execution Protocol

### First Look Mode (`--first-look`)

There is no report to load — only raw research inputs.

#### FL-Phase 0: Identify Inputs

- **Desk-research primer** (required)
- **Expert call transcripts** — at least 1 required

Confirm you have all inputs before proceeding. If the primer exceeds token limits, read in chunks.

#### FL-Phase 1: Freeberg Audits the Primer

Launch a single agent call to `advisor-freeberg` (best available reasoning model, foreground).

Include in the prompt:
- The First Look role: "You are auditing the desk-research primer as the baseline evidence assessment. You are NOT evaluating expert calls. Map what the primer claims, how well-sourced each claim is, and where the primer is exposed."
- The quality checksum
- The full primer text
- Instructions:
  1. **Claims inventory** — the primer's 5-8 most important claims (market size, competitive position, defensibility, margin thesis, growth trajectory)
  2. **Source quality per claim** — STRONG / ADEQUATE / THIN / ASSERTED (asserted = stated without sourcing)
  3. **Implicit thesis** — what investment thesis is the primer building toward? Stated or implied?
  4. **Honest unknowns vs. papered-over gaps** — where the primer explicitly flags what it doesn't know (good) vs. elides unknowns with hedging language (exposed)
  5. **Soft spots** — the 3-5 areas where expert evidence would most change the picture, confirming or breaking
  6. **Anti-patterns** — consultant gloss, one-sided framing, unsourced assertions carrying load-bearing weight

```markdown
## Freeberg First Look: [Subject]

### Primer Claims Inventory
| # | Claim | Source quality | Notes |
[5-8 claims]

### Implicit Thesis
[1-2 sentences]

### Honest Unknowns
[Claims explicitly flagged as unknown — credit where due]

### Papered-Over Gaps
[Confident claims lacking evidence — these are exposure points]

### Soft Spots for Expert Evidence
[3-5 items, each with why expert calls would change the picture]

### Anti-Patterns
- [List with specific locations]
```

#### FL-Phase 2: Agenda Setting (Interactive)

Present to the user:

```
=== CASE TEAM: [Subject] — FIRST LOOK ===

Inputs:
- Primer: [filename]
- Expert calls: [N] transcripts ([names/roles])

Freeberg Primer Audit Summary:
- Claims: [N] inventoried, [N] well-sourced, [N] thin/asserted
- Implicit thesis: [1 sentence]
- Top soft spots: [3]

Proposed agenda for Emily / Shuman / Ben debate:
1. [Soft spot or tension]
2. [...]
[up to 5]

Want to modify the agenda or add specific questions before the debate?
```

**Wait for input.** Proceed on "go" or "looks good."

#### FL-Phase 3: Independent Assessment (Parallel Agents)

**MANDATORY: launch all three in a SINGLE message. Foreground only.**

Each agent receives its spec, **Freeberg's primer audit**, the **full text of all transcripts**, the agenda, and its `--first-look` instruction from the voice tables above.

**Key difference from standard checkpoints:** in `--first-look`, agents do NOT receive existing Key Debates or makes/breaks. They receive the primer audit plus raw transcripts and must *generate* the debates and story structure, not evaluate existing ones.

- **Emily** produces 2-4 proposed key debates (binary questions, bull/bear evidence with strength ratings, attributed quotes), provisional makes/breaks, provisional house view, and evidence gaps prioritized for the sprint.
- **Shuman** produces the Got-to-Believe list from scratch, Key Question, 7 Powers assessment, founder/team signals, conviction status, what the sprint should chase.
- **Ben** produces the source contradiction audit, insight extraction (5-10 non-obvious insights with quotable lines and assertion titles), the synthesis frame, narrative arc assessment, and proposed key takeaways. Ben is the editorial voice in first-look — his output determines slide titles and framing.

#### FL-Phase 4: Cross-Examination (One Round)

Emily and Shuman only. Ben's source contradictions feed directly into the memo.

Classify each agenda item ALIGNED / TENSION / DISAGREEMENT / ORTHOGONAL. Cross-exam TENSION and DISAGREEMENT only.

The question shifts: instead of "who's right about the report's position," it is "what should the sprint prioritize — and what story should the deck tell?"

#### FL-Phase 5: First Look Memo

The first-look memo IS a draft deck outline. It mirrors the published deck structure: Executive Summary → Key Debates → Makes/Breaks + House View → Story Pages, organized by deck section flow. At first-look these are proposals with evidence-readiness notes, not finished sections.

**Assembly rules:**
- **Executive Summary** — distill the 3-5 most important findings across all agent outputs into tight bullets, plus a synthesis sentence (typically from Ben). No agent attribution.
- **Key Debates** — synthesize Emily's proposed debates + Shuman's conviction signals into 2-4 unified debates. Bull/bear as bullets, not agent columns. Include "what resolves it" per debate.
- **Makes/Breaks** — merge Emily's proposed conditions with Shuman's Got-to-Believe into one falsifiable list. House view synthesizes Emily's provisional view + Shuman's conviction signal. Direct, 2-3 sentences.
- **Story Pages** — organized by deck section flow, NOT by insight strength. Default order: **TAM / SAM → Company Overview → Product + Go to Market → Competitive Dynamics → Team & Culture.** Include only sections with material findings. Each non-obvious insight becomes a story page with a section header, an assertion title, bullets, a key quote, and an inline evidence note. Page count is material-dependent. Put founder/team assessment in Team & Culture at the end — team is a supporting signal, not the lead of the story.
- **Work Plan** — priority expert calls with specific questions, plus other gaps.
- **Never use agent names in the memo.** No "Emily says," "Shuman's framework," "Ben reacts," "Freeberg found." All findings are synthesized.

**Tone:** observational, not verdictive. "Core market is already largely penetrated," not "evidence leans bearish." Present findings; let the research team form the view.

**Voice check — strip before finalizing:**
- Filler: "increasingly," "is positioned to," "it should be noted that," "with respect to," "has the ability to," "is able to," "a large number of," "in order to," "due to the fact that," "at this point in time"
- Consultant gloss: "underscoring," "highlighting," "reinforcing," "signaling strong investor conviction," "representing a significant step forward"
- Indirect verbs: "is responsible for driving" → "drives"; "is able to generate" → "generates"
- Nominalizations: "the implementation of" → "implementing"; "reliance on" → "relying on"

**Qualifier framework — preserve vs. strip:**
- **Strip** attribution padding when the claim rests on data or your own analysis: "is increasingly viewed as" → assert directly
- **Preserve** qualifiers when the claim is interview-sourced perception: "is viewed as," "buyers tend to," "widely regarded as." Make them precise: "interviewees described X as" or "9 of 13 customers cited X"
- **Always preserve** probability hedges ("may," "likely," "could"), frequency markers ("often," "sometimes"), and scope markers ("a key" ≠ "the core"; "some" ≠ "all")

**Assertion title standard:** declarative findings, not topic labels. If a title could be a Wikipedia section header, rewrite it as a claim.

| Don't write this (topic label) | Write this (assertion title) |
|-------------------------------|------------------------------|
| "Unit Economics" | "AI-enabled firms unlock step-function margin expansion on standardized work" |
| "Competitive Landscape" | "Five firms running the same model in a massive market — this is a land-grab" |
| "Customer Value Proposition" | "Speed and cost — not AI — are the true value proposition to buyers" |
| "Defensibility Analysis" | "Technology is not a durable moat; execution and distribution are" |
| "Market Opportunity" | "Bottom-of-funnel work is structurally broken and migrating away from incumbents" |

```markdown
# Case Team First Look: [Subject]

**[Date]** | **Inputs:** [primer] + [N] expert calls ([roles])

## Executive Summary
- [3-5 findings — tight, observational]
> "[Killer synthesis sentence — the frame that organizes the entire story]"

## Key Debates (2-4)
### [Binary question headline — a claim, not a topic]
**Bull:** [sourced bullets]
**Bear:** [sourced bullets]
**What resolves it:** [specific evidence the sprint must close]

## What Makes or Breaks It
### What makes it
- **[Condition label]:** [falsifiable condition]  [4-5 bullets]
### What breaks it
- **[Condition label]:** [falsifiable condition]  [4-5 bullets]
### House View
[2-3 sentences. Where evidence leans. What would flip it. Direct, not hedged.
A working position the sprint will confirm or challenge.]

## Story Pages
### [Section: TAM/SAM | Company Overview | Product + GTM | Competitive Dynamics | Team & Culture]
### [Page N]: [Assertion title]
- [Bullet]
> "[Key quote]" — [source]
**Evidence:** [what we have vs. what's missing]
[Typically 8-12 pages total; material-dependent. Omit sections with no findings.]

## Recommended Work Plan
### Priority experts to source
1. **[Expert type]** — [specific question] — [why critical]  [3-5, ordered by impact]
### Other evidence gaps
1. [Gap] — [why it matters] — [suggested source]  [3-5]
```

Save to `<reports-dir>/<subject>-case-team-first-look.md`.

#### FL-Phase 6: Present and Discuss

The memo is a deck outline — the conversation is about story structure and sprint priorities, not analytical process. The user may challenge a proposed debate ("that's not the real question"), reorder or cut story pages, add questions for specific expert targets, or reprioritize the work plan. Ends on "wrap."

---

### Standard Mode (`--day1` / `--mid` / `--pre-ship`)

#### Phase 0: Load and Extract

1. Locate the report in `<reports-dir>/`
2. Read it in full
3. Extract: **Key Debates** (full text), **Makes/Breaks** (full text), **Executive Summary** (context), and an **evidence digest** — compress the body sections into ~500 words: key stats, market position, competitive standing, customer signals, team highlights
4. Read the quality checksum and format guide (see Calibration)
5. If a previous memo exists for this subject, note it — but do not chain it in as input

#### Phase 1: Freeberg Assessment

Launch a single call to `advisor-freeberg` (foreground). Include the Case Team role description, the checksum, full text of Key Debates + Makes/Breaks, the evidence digest, the checkpoint stage, and:

- `--day1`: "Assess the Day 1 draft. Are Key Debates real binary questions with evidence on both sides? Are placeholders specific enough to guide the team? Is the evidence base honest about what it doesn't know? Checksum the debate sections only."
- `--mid`: "Assess quality improvement since the first draft. Were the right gaps filled? Has evidence quality improved? New anti-patterns from editing? Has the house view sharpened or gotten mushier?"
- `--pre-ship`: "Full quality audit. Would we put our name on this? Run the complete 9-dimension checksum. Flag every exposure point. Last quality gate before the investment debate."

**IMPORTANT:** this is a lighter invocation than a full QA pass. Freeberg runs the checksum and quality assessment on the investment-critical sections only — no format, consistency, or simplification subordinates.

#### Phase 2: Agenda Setting (Interactive)

```
=== CASE TEAM: [Subject] — [CHECKPOINT] ===

Freeberg Assessment Summary:
- Checksum: [N] PASS, [N] PARTIAL, [N] FAIL
- Evidence strength: [summary across debates]
- Key exposure: [biggest flag]

Agenda:
1. [Key Debate headline]
   Freeberg flag: [quality note, if any]
[... up to 5]

Deal conditions — Makes: [summary] / Breaks: [summary]
Current house view: [summary]

Want to modify the agenda before Emily and Shuman debate?
```

**Wait for input.**

#### Phase 3: Independent Assessment (Parallel Agents)

**MANDATORY: launch all three in a SINGLE message. Foreground only.**

**Emily** receives: her spec, the agenda, the evidence digest, **Freeberg's quality flags**, full Key Debates + Makes/Breaks text, and:
- `--day1`: "This is a Day 1 draft from automated desk research. Is the framing right? Are we asking the questions that matter? What should the team prioritize?"
- `--mid`: "The team has filled gaps and edited. Does evidence quality support the positions taken? Is evidence getting stronger? Are positions defensible?"
- `--pre-ship`: "This is going to an investor. Stress-test every position. Where does the argument fall apart under pressure? What's the weakest link?"

**Shuman** receives: the same inputs, and:
- `--day1`: "Build your initial Got-to-Believe list. Assess founder signal if available. Where is conviction starting to form?"
- `--mid`: "Midpoint check. Update Got-to-Believe status. Are assumptions getting confirmed? What keeps you up at night? Is conviction growing or shrinking?"
- `--pre-ship`: "Final conviction assessment. Lock the Got-to-Believe table. Would you put capital behind this? What's the one thing that would flip you?"

**Ben** receives: his spec, the **internal key-takeaways slide** (full), **full deck text** slide-by-slide with enough detail to trace claims across slides, **Freeberg's quality flags**, and:
- `--day1`: "Check whether the key takeaways are coherent with collected evidence. Flag obvious contradictions in the draft."
- `--mid`: "The team has edited. Did editing introduce dissonances? Do the takeaways still match the evidence?"
- `--pre-ship`: "Full prominence and dissonance audit. A GP will spend 8 minutes on this — does the argument hold together or does the deck argue against itself?"

**Note:** Ben gets the full deck, not just the debate sections, because his job is cross-slide coherence. Emily and Shuman stay focused on the investment-critical sections.

#### Phase 4: Cross-Examination (One Round)

**Ben does not participate.** His dissonance findings feed directly into the memo. Cross-examination is Emily and Shuman only.

1. Compare assessments side-by-side per agenda item:

| Classification | Meaning | Action |
|---|---|---|
| ALIGNED | Similar conclusions | Skip |
| TENSION | Same issue, different weight | Cross-exam |
| DISAGREEMENT | Substantively different conclusions | Cross-exam |
| ORTHOGONAL | Each surfaced what the other missed | Skip, but capture — often the most valuable output |

2. For TENSION and DISAGREEMENT only, launch one round. Each agent receives its spec, its original assessment, the other's positions **on the disputed items only**, and:

> "[Other voice] disagrees with you on these points. For each: (1) where they're right and you should update, (2) where you maintain your position and why, (3) what evidence would resolve this. One round."

**Launch both in a SINGLE message.** Skip the phase entirely if nothing is TENSION or DISAGREEMENT.

#### Phase 5: Case Team Memo (Skill-Level Synthesis)

The skill assembles the memo. **No synthesizer agent** — spawning one launders the disagreement into mush.

```markdown
# Case Team Memo: [Subject]
## [Checkpoint] — [Date]

**Voices:** Freeberg, Emily Man, Jason Shuman, Ben Sun
**Report:** [filename]  |  **Agenda items:** [count]
[If previous memo exists: "Previous checkpoint: [date] — [stage]"]

## Freeberg Baseline
### Checksum Summary
| # | Dimension | Verdict | Notes |
### Quality Flags
[key exposure points]

## Debate Results
### [Key Debate headline]
| | Emily | Shuman |
|---|---|---|
| Position | [1-2 sentences] | [1-2 sentences] |
| Confidence | [assessment] | [conviction level] |
| Key concern | [weakest link] | [Got-to-Believe risk] |

**Status:** ALIGNED / TENSION / DISAGREEMENT
**The tension:** [what specifically they disagree on]
**Cross-exam result:** [updates, if any]
**What would resolve this:** [specific evidence or conversation]
[Repeat per debate]

### What Makes or Breaks It
**Freeberg:** [are conditions specific and falsifiable?]
**Emily:** [evidence quality of each condition]
**Shuman:** [Got-to-Believe mapping — which conditions drive conviction?]
**Combined:** [where all four align, where gaps remain]

## Ben Sun Review: Prominence & Dissonance
### Prominence Check
| # | Takeaway | Rating | Assessment |
### Dissonances Found ([N])
[Per dissonance: name, conflicting slides, why it matters, resolution]

## Synthesis
### Agreements
### Unresolved Tensions          [tension + what resolves it]
### Blind Spots Surfaced         [the ORTHOGONAL items]
### Got-to-Believe Status
| # | Assumption | Status | Evidence | What resolves it |
### Evidence Quality Summary
| Debate | Bull evidence | Bear evidence | Balance | Key gap |

## Recommended Actions
[Ordered by impact. Each specific and assignable.]
1. [Action] — Source: [which voice flagged it]
[3-7 actions]

## Bottom Line
**Conviction signal:** [what the debate revealed]
**Biggest exposure:** [weakest point across all voices]
**The call:**
- `--day1`: priorities for the team this week
- `--mid`: what must improve before pre-ship
- `--pre-ship`: ship / hold / revise
```

Save to `<reports-dir>/<subject>-case-team-<stage>.md`. Checkpoint labels in the filename preserve the history.

#### Phase 6: Present and Discuss

The skill stays active for follow-ups: probe a tension deeper, re-run one agent with additional context, send actions to the team, compare against a previous checkpoint memo. Ends on "wrap."

---

## Agent Architecture

| Agent | Phase | Model | Tools | Spec |
|-------|-------|-------|-------|------|
| `advisor-freeberg` | 1 | best reasoning model | Read | `agents/advisor-freeberg.md` |
| `advisor-emily` | 3, 4 | best reasoning model | none | `agents/advisor-emily.md` |
| `advisor-shuman` | 3, 4 | best reasoning model | none | `agents/advisor-shuman.md` |
| `advisor-ben-sun` | 3 | best reasoning model | none | `agents/advisor-ben-sun.md` |

**Total agent calls per run: 4-6.** One grounder + three debaters + zero-to-two cross-exams. If a run creeps past six, a voice is redundant.

---

## Design Decisions

**Why checkpoints, not one-shot.** A Day 1 meeting has a fundamentally different purpose than a pre-ship meeting. Running the same debate on a thin draft and a polished final report wastes the model's judgment.

**Why one round of cross-examination, not iterative.** Two agents converging over multiple rounds produce agreement, not insight. The value is in the first disagreement. One round surfaces the real tensions; multiple rounds smooth them away.

**Why focused input, not the full report.** Token budget and focus quality. Agents get the investment questions plus a ~500-word digest. They are debating judgment calls, not reviewing slides.

**Why Freeberg runs first, not in parallel.** Emily and Shuman produce better assessments when they already know where the quality standard sees exposure. Running all four in parallel means the debaters burn their pass rediscovering problems Freeberg already found. Sequential grounder → parallel debaters is more token-efficient and sharper. This is the single biggest quality lever in the design.

**Why Ben owns the editorial layer in first-look.** An early first-look run produced strong analytical output (evidence maps, Got-to-Believe, source contradictions) and weak editorial output (topic-label titles, no quotable lines, buried synthesis). A parallel run of the same material through a general-purpose assistant produced sharper insight extraction and a better organizing frame. The gap: these agents were configured as analysts, not editors. Ben is the reader voice — his mandate is already "does this land for a time-pressed GP?" — making him the natural home for insight extraction, assertion titles, and synthesis framing.

**Why the best reasoning model everywhere.** Judgment-intensive work. These agents take positions, identify weak links, and respond to disagreement. Smaller models produce competent, bland, agreeable assessments — which defeats the purpose.

**Why explicit checkpoints, not persistent state.** Explicit checkpoint parameters are simpler and less fragile than automatic state chaining. Memos are saved to disk with checkpoint labels, so a human can reference previous ones. Automatic chaining adds complexity without clear benefit.

---

## What This Skill Does NOT Do

1. **No report editing.** It recommends actions; the team implements.
2. **No investment recommendation.** It surfaces conviction signals; a human decides.
3. **No copy QA.** Format, spelling, and consistency belong to a separate pass.
4. **No evidence gathering.** Gaps revealed by debate are the team's job.
5. **No infinite loops.** One cross-exam round. Unresolved tensions stay unresolved — that's a feature.
6. **No automatic state chaining.** Each checkpoint is self-contained.

---

## Forbidden Shortcuts

| Shortcut | Why forbidden | What happens instead |
|----------|--------------|---------------------|
| Giving the debaters the primer directly in `--first-look` | They rediscover primer weaknesses instead of bringing expert evidence to bear on them | Freeberg audits first; the other three receive his output + transcripts |
| Running `--first-look` without expert calls | The point is colliding desk research against primary evidence. Primer-only is just a more expensive read. | At least 1 transcript required |
| Skipping Freeberg (Phase 1) | Emily and Shuman waste tokens rediscovering quality issues | Freeberg always runs first |
| Skipping Ben (Phase 3) | Dissonances go undetected — the deck argues against itself | Ben always runs in the Phase 3 parallel |
| Skipping agenda setting (Phase 2) | The user has context the report doesn't reflect | Always present and wait |
| Cross-examining ALIGNED items | Pure spend, no output | Skip Phase 4 if all aligned |
| More than one cross-exam round | Convergence destroys the tension you ran this for | One round |
| A cheaper model for the advisors | Bland assessments | Best reasoning model, always |
| Loading advisor prompts into the main context instead of isolated agents | They converge — you get an average of four voices instead of four voices | Each runs as an isolated sub-agent |
| A synthesizer agent for Phase 5 | Launders disagreement into mush | The skill assembles the memo mechanically |
| Full report as agent input | Token budget, lost focus | Compress to debate sections + digest |
| Running `--pre-ship` on Day 1 output | Wrong calibration for maturity | Match checkpoint to actual state |
| Chaining checkpoints automatically | Fragile state management | Each checkpoint reads fresh |

---

## Prerequisites

**Advisors installed:** `advisor-freeberg`, `advisor-emily`, `advisor-shuman`, `advisor-ben-sun` — all four are in this registry. Install them first.

**Input requirements by checkpoint:**
- `--first-look`: primer (required) + at least 1 expert transcript. No draft needed.
- `--day1`: report with Key Debates drafted, even if thin
- `--mid`: Key Debates + Makes/Breaks + at least 6 body sections with evidence
- `--pre-ship`: all sections populated (placeholders acceptable but flagged)

---

## Calibration

This skill ships calibrated to venture research decks. Three things to replace for your own use:

| Key | What to change | Required |
|-----|----------------|----------|
| `reports_dir` | `<reports-dir>` → wherever your work-in-progress reports live | Yes |
| `quality_checksum` | Point Freeberg at your firm's writing standard and quality bar. `advisor-freeberg` has its own calibration for this. | Yes |
| `format_guide` | Point Phase 0 at your report format guide — the document defining your section order and headline conventions. Referenced for assertion-title standards. | Yes |
| `section_flow` | The story-page section order in FL-Phase 5 (TAM/SAM → Company Overview → Product + GTM → Competitive Dynamics → Team & Culture) | If your deck differs |
| `checkpoints` | The four stages assume a ~10-day research sprint. Compress or extend to match your cycle. | If your cycle differs |

**Adapting the roster:** the four voices here are calibrated to venture diligence. To build a case team from different voices, read `ARCHITECTURE.md` in this directory — it covers the archetypes, how to source and write a voice, and how to test whether a roster is actually adversarial rather than four flavors of agreement.

---

## Install

Install the four advisors first (each is a separate registry entry), then:

1. `skills/case-team/SKILL.md` → `.claude/skills/case-team/SKILL.md`
2. `skills/case-team/ARCHITECTURE.md` → `.claude/skills/case-team/ARCHITECTURE.md`
3. `commands/case-team.md` → `.claude/commands/case-team.md`

Trigger command (`.claude/commands/case-team.md`):

```markdown
---
name: case-team
description: Run a structured case team debate — four advisor voices collide on the investment-critical questions at a given project checkpoint.
---

Invoke the `case-team` skill. Parse the subject name and checkpoint flag
(--first-look | --day1 | --mid | --pre-ship) from the arguments. Follow the
skill's phase protocol exactly — the sequencing (grounder first, debaters in
parallel, one cross-exam round) is what makes the output worth having.
```

Then: `/case-team <Company> --first-look`
