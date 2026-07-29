---
name: case-team
description: Run a structured case team debate — four advisor voices collide on the investment-critical questions at a given project checkpoint.
---

Invoke the `case-team` skill. Parse the subject name and checkpoint flag
(--first-look | --day1 | --mid | --pre-ship) from the arguments.

Follow the skill's phase protocol exactly. The sequencing is what makes the
output worth having:

- Freeberg (grounder) runs FIRST and alone — the debaters receive his baseline
- Emily, Shuman, and Ben run in PARALLEL, in a single message, in isolation
- Agenda setting happens BEFORE the parallel phase and waits for the user
- Cross-examination is ONE round, and only on items classified TENSION or
  DISAGREEMENT
- Phase 5 synthesis is assembled by the skill, not by an agent

Requires the four advisors installed: advisor-freeberg, advisor-emily,
advisor-shuman, advisor-ben-sun.
