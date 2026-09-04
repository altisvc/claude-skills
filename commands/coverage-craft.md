# /coverage-craft

Composition doctrine for surfaces that sell completeness — matrices, inventories, catalogs, service graphs, status grids.

## Usage

```
/coverage-craft plan <surface or feature>         composition spec before code
/coverage-craft review <path | URL | screenshot>  pass/fail against the doctrine
```

## The rule

High information density, low chrome density. Many facts, few containers.

The default question: can a prospect point at this screen in three seconds and say what you cover that a competitor does not? The FOMO comes from the map, never from the copy.

## Examples

```
/coverage-craft plan a sector-by-company coverage matrix for the research tab
/coverage-craft review https://staging.example.com/research
```

## Behavior

Runs six passes in order — coverage, chrome, grouping, disclose, state, token — and returns either a composition spec or a pass/fail verdict with a delete list. It argues layout, hierarchy, grouping, first paint, and what gets removed as chrome. It never changes a token: identity findings are routed to your design advisor.

Pairs with `/chika`, which sequences this doctrine together with your design advisor and craft reviewer through an enforced nine-step loop.
