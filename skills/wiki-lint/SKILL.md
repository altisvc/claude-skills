# Skill: Wiki Lint

> Periodic health check for the knowledge wiki. Identifies staleness, contradictions, thin sections, orphan pages, and missing cross-references. Produces a prioritized health report for human review.

---

## Skill Metadata

```yaml
id: wiki-lint
trigger: /wiki-lint
context: orchestrated
returns: wiki_health_report
required: false
```

---

**Today's date:** {{DATE}}
**Session context:** This skill runs inside Claude Code with access to file system tools.

**Core rules (apply to all skills):**
- Never use `run_in_background: true` for sub-agents — foreground only, launched in parallel via single message
- Never skip stages — each stage gate must be satisfied before proceeding
- Structured findings only from sub-agents — no prose, no reasoning chains, no source quotes

---

## Purpose

Wiki articles decay silently. A pricing strategy article written 60 days ago with no updates looks authoritative but may reflect outdated thinking. Cross-references break as articles are created or renamed. Some articles accumulate evidence while others stay thin. Without periodic lint, the wiki degrades from "living knowledge" to "historical artifacts with false freshness."

This skill catches decay before it compounds.

---

## Shared State Root

```
MAIN_REPO=/Users/preparedmindchris/Desktop/altis-brain
WIKI_DIR=$MAIN_REPO/03-research/wiki
REGISTRY=$MAIN_REPO/01-context/content-registry.md
CHANGELOG=$MAIN_REPO/03-research/wiki/changelog.md
INDEX=$MAIN_REPO/03-research/wiki/index.md
```

---

## Overnight Preflight Mode

The overnight maintenance pipeline stages wiki lint data at ~3am Wednesday. When `/wiki-lint` is invoked interactively, check for staged data first.

### Detection

On invocation, check for `02-projects/operations/overnight/maintenance-staged.json`. If it exists and the `date` field matches today:

1. **Load staged data** — read the JSON for pre-gathered wiki health metrics
2. **Skip Stage 1 (Scan)** — article metadata already collected
3. **Proceed to Stage 2 (Analysis)** with staged data as input

### If staged data is stale or missing

Run the full pipeline from Stage 1.

---

## Stage 1: Scan (Silent)

Read every wiki article. For each, extract:

```json
{
  "filename": "pricing-strategy.md",
  "last_updated": "2026-04-03",
  "days_since_update": 1,
  "current_position_length": 85,
  "key_inputs_count": 14,
  "key_inputs_latest_date": "2026-04-03",
  "open_questions_count": 4,
  "sources_count": 3,
  "mentions_other_articles": ["beta-partnerships", "fund-expense-strategy"],
  "mentioned_by_other_articles": ["beta-partnerships", "outbound-campaigns"]
}
```

Also read:
- `index.md` — check if all articles are listed
- `changelog.md` — check last 10 entries for update frequency
- `content-registry.md` — check which articles are referenced

**Gate:** All 29+ articles scanned. Proceed only when scan is complete.

---

## Stage 2: Analysis

Run five checks against the scan data:

### Check 1: Staleness

Flag articles where:
- `last_updated` is >30 days ago → **STALE**
- `last_updated` is >14 days ago → **AGING**
- `key_inputs_latest_date` is >45 days ago (evidence not refreshed even if header was) → **EVIDENCE_STALE**

### Check 2: Thin Sections

Flag articles where:
- `key_inputs_count` < 5 → **THIN_EVIDENCE**
- `current_position_length` < 30 words → **THIN_POSITION**
- `open_questions_count` == 0 → **NO_QUESTIONS** (suspicious — every topic should have open questions)
- `sources_count` == 0 → **NO_SOURCES**

### Check 3: Cross-Reference Gaps

For each article, check whether related articles mention it and vice versa. Flag:
- Articles that mention 0 other articles → **ISOLATED**
- Article pairs that should cross-reference based on cluster membership but don't → **MISSING_XREF**

Cluster membership (from wrap.md):

| Cluster | Articles |
|---------|----------|
| Strategy | positioning-evolution, fund-expense-strategy, competitive-landscape, manifesto |
| Sales | beta-partnerships, pricing-strategy, outbound-campaigns, inbound-engagement, sales-objections |
| Research | research-methodology, expert-sourcing, report-format, sector-coverage, research-team |
| Voice & People | voice-christopher, voice-altis, ben-sun, key-prospects |
| Product | researchos, gtmos, expertOS |
| Governance | fundraise-narrative, primary-relationship, legal-compliance |
| Infrastructure | gtm-agent-stack, deck-review-system, claude-code-system, campaign-infrastructure, tool-routing |

### Check 4: Orphan Detection

Flag articles that:
- Are NOT referenced in `content-registry.md` → **ORPHAN_REGISTRY**
- Are NOT listed in `index.md` → **ORPHAN_INDEX**

### Check 5: Contradiction Scan

Read the `## Current position` of all articles. Flag cases where:
- Two articles state conflicting facts (e.g., different pricing numbers, different team sizes, different dates for the same event) → **CONTRADICTION**
- An article's `## Current position` contradicts its own `## Key inputs` (position not updated after new evidence) → **POSITION_DRIFT**

This check requires reading article content, not just metadata. Use judgment — minor phrasing differences are not contradictions. Flag only factual conflicts.

**Gate:** All 5 checks complete. Proceed to report.

---

## Stage 3: Report

Present findings in a structured format, sorted by severity:

```
━━━━━━━━━━━━━━━━━━━
Wiki Health Report — {{DATE}}
━━━━━━━━━━━━━━━━━━━

## Critical (action needed)
[CONTRADICTION, POSITION_DRIFT, EVIDENCE_STALE items]

## Maintenance (update when convenient)
[STALE, THIN_EVIDENCE, THIN_POSITION, NO_SOURCES items]

## Hygiene (nice to fix)
[AGING, ISOLATED, MISSING_XREF, ORPHAN_REGISTRY, ORPHAN_INDEX, NO_QUESTIONS items]

## Stats
- Total articles: X
- Avg days since update: X
- Most active (last 7 days): [list]
- Least active (30+ days): [list]
- Total key inputs across wiki: X
- Changelog entries this month: X

## Recommended Actions
1. [Highest priority fix]
2. [Second priority]
3. [Third priority]
```

After presenting the report, ask Christopher which items to fix now vs. defer. Do NOT auto-fix anything — the human decides what gets updated.

---

## Staged Output Format

When run from overnight maintenance, write findings to:

```json
{
  "wiki_lint": {
    "run_at": "<ISO timestamp>",
    "critical_count": 0,
    "maintenance_count": 3,
    "hygiene_count": 7,
    "findings": [
      {
        "severity": "maintenance",
        "check": "STALE",
        "article": "manifesto.md",
        "detail": "Last updated 45 days ago",
        "suggested_action": "Review current position against recent positioning sessions"
      }
    ],
    "stats": {
      "total_articles": 29,
      "avg_days_since_update": 12,
      "most_active": ["pricing-strategy.md", "beta-partnerships.md"],
      "least_active": ["manifesto.md", "legal-compliance.md"]
    }
  }
}
```
