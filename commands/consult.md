# /consult

Invoke an advisor persona with full context isolation.

## Usage

```
/consult <advisor-id>
<your question or situation>
```

## Available Advisors

- `advisor-founding-tegus-cio` — GTM-first technical architecture
- `advisor-harrison-chase` — AI architecture and agent design red-team
- `advisor-mom-test` — Customer discovery and problem validation
- `advisor-gartner-cso` — Analyst/research buyer perspective
- `advisor-founding-pitchbook-cso` — Early-stage data business growth, perception-as-moat, capital efficiency
- `advisor-fundraising` — Series A negotiation with Primary, term sheet strategy, dilution scenarios, investor narrative
- `advisor-design-review` — Visual QA on live URLs, screenshots, or built component code, grounded in the design system; picks WEB vs REPORTS surface first
- `impeccable-reviewer` — Craft and anti-slop execution review (Impeccable critique / audit / polish / layout / clarify / detect) strictly inside the existing design system; on-system ideation for layout, hierarchy, density, states, copy hierarchy. Never for new palette, type, radius, or "bolder"

## Examples

```
/consult advisor-founding-tegus-cio
Should we hardcode pricing tiers or use a config table?
```

```
/consult advisor-harrison-chase
Is our research agent really an agent or just a chain?
```

## Behavior

This command invokes the `consult-advisor` skill with full isolation. The advisor sees only its spec and your question—never the main conversation context. You receive a structured summary.
