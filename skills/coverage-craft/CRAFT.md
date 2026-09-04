# CRAFT.md — composition doctrine for coverage surfaces

Short form of `SKILL.md`. Put this at your repo root and load it for every UI task
that shows how complete your product is — a matrix, inventory, catalog, service
graph, or status grid. Identity lives in your design system. This file never changes
a token.

## The rule

**High information density, low chrome density.** Many facts, few containers.

The cramp engineering sees comes from boxes and padding. The depth prospects want
comes from information. Remove the first, keep the second.

**Default question.** Can a prospect point at this screen in three seconds and say
what we cover that a competitor does not?

The FOMO is the map, never the copy.

## Allow

- Many rows, named modules, counts, statuses, comparisons, live indicators
- One first-class coverage object: matrix, inventory, service graph, or status grid
- Peek of depth: count + 2–4 examples + "and N more"
- Typographic density: small type roles, tight leading, tabular numbers, label/value pairs
- Space between groups, not around every field
- One primary action, sticky if needed

## Forbid

- Card-in-card, equal-weight KPI tiles, 3×4 feature grids
- Helper paragraphs, badge rows, decorative charts, three CTAs
- Sparse "calm" first paint that hides the catalog behind three feature cards
- New palette, type, radius, or components
- Copy that performs the FOMO ("don't fall behind")

## Anatomy

- Left or top: compact domain list, always visible
- Center: coverage canvas. Rows = entities. Columns = proof (have / gap / count / freshness)
- Detail only for the selected cell (rail or overlay)
- Every module: name, status, count, one secondary fact. Same anatomy everywhere
- Absence is visible: empty cell, missing competitor, gap state

## Passes, in order

1. Coverage — whole service graph implied on first paint?
2. Chrome — remove containers, shadows, extra titles, duplicate labels
3. Grouping — proximity and shared headings, not nested surfaces
4. Disclose — depth peekable, not dumped
5. State — default, hover, focus, selected, empty, loading, error, gap
6. Token — existing tokens and components only

## Fail if

- A prospect cannot explain coverage vs a competitor from the first screen
- An engineer calls it cramped because of boxes and padding, not information
- Depth exists only after a click, with no scent on first paint
- Any new visual identity leaked in

## Steal structurally, not visually

Stripe dashboard tables · Datadog control room · Linear lists · a spec/comparison
matrix. Not AWS. Not HubSpot. Not a marketing bento.

## Routing

A whole design-forward build, sequencing every design agent → `/chika <slug> <surface>`
Coverage / inventory / "show how complete we are" surfaces → `/coverage-craft`
On-token polish / anti-slop chrome → your craft reviewer (distill, quieter, polish, critique)
Product critique / live audit → your design advisor
Framework / a11y / implementation → your implementation skills
Do not use a general-purpose restyling skill on these surfaces — it will sparse them down.
