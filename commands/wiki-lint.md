# /wiki-lint

Periodic health check for the knowledge wiki.

## Usage

```
/wiki-lint
```

No arguments needed.

## What It Does

Scans all wiki articles in `03-research/wiki/` and produces a health report covering:

- **Staleness** — articles not updated in 14/30+ days
- **Thin sections** — articles with sparse evidence or missing open questions
- **Cross-reference gaps** — articles that should link to each other but don't
- **Orphans** — articles missing from index.md or content-registry.md
- **Contradictions** — conflicting facts across articles or position drift from evidence

## When to Run

- Automatically staged every Wednesday at 3am via overnight maintenance
- Wednesday morning check-in surfaces findings if maintenance ran
- Can be run manually anytime

## Skill

Delegates to `.claude/skills/wiki-lint/SKILL.md`.
