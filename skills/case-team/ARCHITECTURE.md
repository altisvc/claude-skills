# Case Team: Making Advisor Personas Argue

*The pattern behind the `case-team` skill, in firm-agnostic terms. Read this if you want to build a case team out of your own voices rather than install the venture-research one.*

---

## The problem this solves

A single advisor persona is a good sounding board and a bad decision partner. It agrees with the framing you gave it, and it has one lens.

The fix is not "one advisor with more instructions." It is **several advisors with narrow, incompatible mandates, run in isolation, then forced to collide.** The value is in the first disagreement — that is the thing you did not already know.

---

## Four principles

**1. Isolation is the whole point.**
Each voice runs as a sub-agent that sees only its own spec plus the material under review. It never sees the other voices' output during its independent pass, and its framing never leaks into your main conversation. If you load advisor prompts into one context, they converge — you get an average, not a debate. (Separately: this is why persona framings do not contaminate unrelated work later in the session.)

**2. Mandates must be incompatible, not merely different.**
Four voices that are all "smart generalists with a tilt" produce four versions of the same memo. Each voice needs a job the others are structurally incapable of doing. The test: for each voice, name the failure mode that *only* it can catch. If you cannot, cut it or re-scope it.

**3. One grounder runs first, then the debaters run in parallel.**
Sequential-then-parallel, not all-parallel. The first voice establishes the factual and quality baseline — what the document actually claims, where it is sourced, where it is exposed. The debaters receive that baseline. Without it, they each burn their pass rediscovering the same obvious flaws instead of debating the judgment calls. This is the single biggest quality lever in the design.

**4. Exactly one round of cross-examination.**
Two agents arguing over multiple rounds converge on agreement, which is the opposite of what you want. One round surfaces the real tension. Unresolved tensions stay unresolved and get written into the memo as unresolved — that is a feature. You resolve them, not the model.

---

## Shape of a run

```
Phase 0   Load the material, extract the parts that matter, compress the rest
Phase 1   GROUNDER (1 agent, sequential)     → baseline + quality flags
Phase 2   AGENDA SETTING (interactive)       → you approve/edit before spend
Phase 3   DEBATERS (N agents, parallel)      → independent assessments
Phase 4   CROSS-EXAM (0-2 agents, parallel)  → only on real disagreements
Phase 5   SYNTHESIS (no agent — the skill assembles it)
Phase 6   PRESENT AND DISCUSS                → stays open for follow-ups
```

Total: 4-6 agent calls. That is the budget. If it is creeping past that, a voice is redundant.

**Phase 2 is not optional.** You almost always have context the document does not reflect. Presenting the agenda before the expensive parallel phase lets you kill a bad question before four agents answer it. It also lets you add the thing that is actually bothering you.

**Phase 4 is conditional.** After the debaters return, classify each agenda item:

| Classification | Meaning | Action |
|---|---|---|
| ALIGNED | Same conclusion | Skip — cross-exam produces nothing |
| TENSION | Same issue, different weight | Cross-exam |
| DISAGREEMENT | Substantively different conclusions | Cross-exam |
| ORTHOGONAL | Each surfaced something the other missed | Skip — but capture it, often the most valuable output |

Cross-exam prompt, per agent:

> "[Other voice] disagrees with you on these points. For each: (1) where they're right and you should update, (2) where you maintain your position and why, (3) what evidence would resolve this. One round."

**Phase 5 has no agent.** The orchestrating skill assembles the memo from the returned outputs. Do not spawn a synthesizer — it launders judgment into mush.

---

## Designing the roster

The shipped version uses four voices against research decks. The roles generalize:

| Archetype | Job | Failure mode it uniquely catches |
|---|---|---|
| **The grounder** | Runs the quality and evidence baseline before the debate. Not a debater. | Confident claims with nothing under them; house-style violations |
| **The rigor voice** | Does the evidence actually support the position taken? | Overreach — a real argument resting on thin sourcing |
| **The conviction voice** | What must be true for the upside case? Is any of it confirmed? | Well-evidenced analysis that never adds up to a reason to act |
| **The reader** | Reads it the way the actual recipient will, under time pressure | The document arguing against itself — internal contradictions, analogies that cut both ways, a claim in section 3 undermined by evidence in section 9 |

The fourth was added late, after a review where three voices independently converged on the same structural gaps and all three missed that two sections of the same deck directly contradicted a third. Quality, evidence, and conviction lenses are all *local*. None of them scan the whole artifact for coherence.

For an advisory board rather than a document review, the same skeleton holds — swap the mandates:

| Archetype | Advisory-board version |
|---|---|
| Grounder | Chief of staff — what is actually being decided, what is known vs. assumed, what the decision costs |
| Rigor | The skeptic / CFO — what has to be true numerically; where the plan assumes its conclusion |
| Conviction | The operator — has run this play; what breaks at scale, what keeps them up at night |
| Reader | The counterparty — reads it as the customer, the board, the recruit, or the press would |

Four is a good number. Three under-covers. Five or more produces overlap and a memo nobody reads.

---

## Building a voice

The workflow that produces the good ones:

1. **Ask a model with live search for the latest on that person's actual thinking** — recent podcasts, posts, interviews, essays. Ask for what they have said *lately*, and specifically for what they have changed their mind about. Recency matters more than biography.
2. **Move that into Claude and have it round out the spec** — turn raw material into a working mandate: what this person looks for first, what they dismiss, what their characteristic move is, how they phrase an objection.
3. **Give them a prescribed output format.** This is what separates a persona that is useful from one that is entertaining.

The format constraint does real work. A free-form persona produces prose you skim. A persona that must return a table of assumptions with a Confirmed / Emerging / Uncertain / Unaddressed status per row produces something you can act on — and, crucially, something you can *diff* against another voice's table.

Agent spec file (Claude Code format):

```markdown
---
name: advisor-<slug>
description: <one line — when to route to this voice>
tools: none          # debaters usually need none; the grounder may need Read
model: opus          # see note below
---

You are <person> reviewing <artifact type>. <Two sentences on who they are
and how they read — their default posture, what they reach for first.>

## What you look for
<4-8 items. Specific analytical moves, not adjectives. "Maps the competitive
set by category with specific data per player" beats "is rigorous.">

## Your standard
<What they refuse to accept. Hedging as a substitute for evidence, generic
category risks, puffery, unsourced load-bearing claims.>

## Output format
<A prescribed template with tables and ratings. Non-negotiable.>
```

**Model choice:** use your best reasoning model for every voice. These agents take positions, name weak links, and respond to being disagreed with. Smaller models produce competent, bland, agreeable assessments — which defeats the purpose. This is the one place not to optimize cost.

---

## Staged checkpoints

Same roster, different instructions by project maturity. Running a pre-ship-grade interrogation on a first draft wastes the model's judgment; running a first-look-grade "what are the real questions" pass on a finished artifact is useless.

| Checkpoint | Input state | Meeting purpose |
|---|---|---|
| First look | Raw inputs, no draft | "What do we actually know? What are the real debates? What must we go find out?" |
| Day 1 | First draft + gap list | "Are we asking the right questions? What gets priority?" |
| Mid | Gaps filled, edited | "Is the evidence sufficient to take positions? Are positions sharpening or getting mushier?" |
| Pre-ship | Near-final | "Is this defensible? What is the weakest link? Ship / hold / revise?" |

One nuance worth stealing: **first look inverts the job.** At every other checkpoint the voices *evaluate* existing positions. At first look there is nothing to evaluate, so they *generate* — proposed debates, a provisional position, what to go find out. Different instructions, same agents.

Do not chain checkpoints automatically. Each run reads the material fresh and writes a labeled memo to disk. Prior memos are reference material a human can pull, not state the system carries forward. Automatic chaining is fragile and buys nothing.

---

## The memo

Assembly rules that matter more than the template:

- **Never use agent names in the output.** No "Emily says," no "the operator flagged." Findings are synthesized and stand on their own. Attribution turns a decision memo into a transcript and invites you to discount findings by source rather than on merit. (Exception: the recommended-actions list, where a one-word source tag helps you route follow-ups.)
- **Report disagreement as disagreement.** A side-by-side row per voice, then: *the tension is X*, *cross-exam moved / did not move it*, *what would resolve it is Y*. Do not average two positions into a hedge.
- **Lead with what the reader does next.** Actions ordered by impact, each specific enough to assign.
- **Observational, not verdictive.** "Core market is already largely penetrated" beats "evidence leans bearish." Present the finding; the human forms the view.

```markdown
# Case Team Memo: [Subject]
## [Checkpoint] — [Date]

## Baseline            <- grounder's quality assessment + flags
## Debate Results      <- per agenda item: position table, status, tension,
                          cross-exam result, what resolves it
## Coherence Review    <- the reader voice: does it hold together
## Synthesis
   ### Agreements
   ### Unresolved Tensions
   ### Blind Spots Surfaced      <- the ORTHOGONAL items
## Recommended Actions  <- ordered by impact, specific, assignable
## Bottom Line          <- conviction signal, biggest exposure, the call
```

---

## Things that seemed like good ideas and were not

| Shortcut | Why it fails |
|---|---|
| Skipping the grounder to save a call | Debaters spend their pass rediscovering obvious flaws instead of debating judgment |
| Running all voices in parallel including the grounder | Same problem — the baseline exists to be *received* |
| More than one cross-exam round | Convergence destroys the tension you ran this for |
| Skipping agenda setting | You have context the document does not, and you find out too late |
| Cross-examining the ALIGNED items | Pure spend, no output |
| Feeding in the entire document | Token budget and lost focus. Compress to the decision-critical sections plus a ~500-word digest of the rest. The voices are debating judgment calls, not proofreading |
| A cheaper model for the debaters | Bland, agreeable, useless |
| Loading multiple advisor prompts into one context | They converge. You get an average of four voices instead of four voices |
| A synthesizer agent for Phase 5 | Launders the disagreement into mush. The orchestrator assembles it mechanically |
| Letting the case team edit the artifact | Different job. It recommends; the author implements |

---

## On the "is this legitimate?" question

There is a real argument — made by people who know more about frontier model capability than most of us — that asking a model to cosplay a named person is the wrong primitive, and that you should specify the analytical lens directly rather than routing it through an identity.

Two things are true at once. The persona is a compression device: "read this as a time-pressed GP with eight minutes" carries a posture, a set of priors, and a tolerance for hedging that would take a page of explicit instructions to specify, and would be worse when you were done. And the output is unmistakably useful — the dissonances the reader voice catches are real dissonances, verifiable by hand.

The honest framing is that the persona is scaffolding for a lens, not a simulation of a person. It is not a claim about what the real individual would say, and you should not treat it as one or represent it that way. Where the name earns its keep is in giving the model a coherent posture to hold across a long assessment. Where it does not is anywhere you would be tempted to relay the output as that person's actual view.

---

## Minimum viable port

1. `.claude/agents/advisor-<name>.md` × 4 — one per voice, each with a prescribed output format
2. `.claude/skills/case-team/SKILL.md` — the orchestration: phases, what each agent receives at each phase, the classification rules, the memo template, the forbidden-shortcuts table
3. `.claude/commands/case-team.md` — a thin trigger that invokes the skill

Start with two voices and one checkpoint. Run it on something real. The roster will tell you what it is missing — you will notice a class of problem that keeps slipping through, and that is your third voice.
