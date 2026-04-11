---
name: headcount-analysis
description: >
  LinkedIn headcount analysis for VC/investor research. Use this skill whenever
  the user wants to analyze a company's org structure from LinkedIn data —
  classifying people into GTM, Builders, Strategy & Ops, and Support functions,
  computing key ratios (Builder:GTM, overhead %), and identifying forward-deployed
  professionals with specialist backgrounds (lawyers, doctors, nurses, PhDs, etc.).

  Trigger on any of: "headcount analysis", "org analysis", "LinkedIn CSV",
  "classify employees", "headcount breakdown", "run the headcount", "analyze
  [company] headcount", or whenever the user provides a Sales Navigator /
  Evaboot CSV and wants functional breakdowns or ratios. Also trigger when the
  user asks to "run this on [company]" in a headcount context.
---

# LinkedIn Headcount Analysis v2.0

## What this skill does

Given an Evaboot LinkedIn export CSV and a company name, this skill:

1. **Asks upfront** about any industry-specific specialist subset to track (doctors, lawyers, nurses, PhDs, etc.)
2. **Cleans the data** — removes noise records (wrong company, unrelated industries, investors/board members)
3. **Classifies each person** into one of four functional buckets, or marks them for review
4. **Surfaces gray profiles** — instead of silently excluding uncertain records, flags up to 10 for human review before building the final output
5. **Detects specialist backgrounds** generically — lawyers for legaltech, doctors for healthtech, nurses, PhDs, CPAs, etc.
6. **Outputs an Excel file** with two sheets:
   - **People Data** — every row annotated with Category, Sub-Category, Confidence, Specialist flag, and Included in HC. **Colors are conditional** — if you change a Category value, the row recolors automatically.
   - **Summary Dashboard** — headcount by bucket, key ratios (Builder:GTM, overhead %), GTM sub-breakdown, and a dynamic specialist section

---

## Taxonomy

| Bucket | What goes here |
|---|---|
| **GTM** | Sales, BD, Marketing, Partnerships, CS, Revenue Ops, SDRs, AEs, field roles; also forward-deployed specialists (e.g. Legal Engineers, clinical consultants) |
| **Builders** | Engineering, Product, Design, Data, AI/ML, Research, DevRel, Solutions Engineering |
| **Strategy & Ops** | Strategy, BizOps, CoS, Program/Project Mgmt, Founders/Exec |
| **Support Functions** | Finance, HR/People, Legal/Compliance, IT, RevOps, Marketing/Comms, Admin |
| **REVIEW** | Uncertain profiles — company confirmed in headline but function is ambiguous. Present these to the user for manual classification (max 10 questions). **Not EXCLUDE** — they are real employees. |
| **EXCLUDE** | Noise (wrong company, unrelated industry, email-as-title), investors/board/advisors confirmed not employed |

> **Key v2.0 change:** In v1, profiles that couldn't be classified were silently EXCLUDE'd as "Ambiguous/Unclassifiable". This caused false negatives — real employees disappearing from headcount. In v2.0, if the company name appears in a person's headline (confirming employment) but the role is unclear, they are marked REVIEW instead. REVIEW profiles are included in active headcount (Included in HC = TRUE) and presented for human review.

---

## Specialist presets

| Key | Detects | Use for |
|---|---|---|
| `lawyers` | J.D., LLB, BigLaw firms, attorney/counsel/solicitor titles | LegalTech companies |
| `doctors` | M.D., MBBS, hospital backgrounds, physician/surgeon titles | HealthTech, clinical AI |
| `nurses` | RN, NP, BSN, clinical nurse specialist credentials | HealthTech, care coordination |
| `phds` | Ph.D., academic institutions, postdoc/research fellow titles | Deep tech, research-heavy startups |
| `pharmacists` | Pharm.D., RPh, pharmacy backgrounds | PharmaTech, healthcare |
| `engineers` | P.E. license, civil/mechanical/electrical titles | Industrial tech, hardware |
| `accountants` | CPA, CA, CFA, Big Four backgrounds | FinTech, accounting software |

Custom specialist configs can also be built on the fly (see How to run, Step 2).

---

## How to run

### Step 0: Ask upfront (always do this before running)

Before touching any file, ask two questions:

**Question 1 — specialist subset:**
> "Is there an industry-specific background I should track? For example:
> - **LegalTech**: lawyers (J.D., BigLaw experience)
> - **HealthTech**: doctors (M.D.) or nurses (RN/NP)
> - **Deep tech / AI research**: PhDs
> - **FinTech / accounting software**: CPAs/CFAs
> - **Other** — describe the background and I'll build a custom detector
> - **None** — skip specialist detection"

**Question 2 — known classification edge cases:**
> "Are there any job titles at [Company] that have unusual meaning I should know about? For example, 'Legal Engineer' at Harvey is a GTM role, not a legal/compliance role."

### Step 1: Identify inputs

- **CSV file path** — Evaboot "filtered" export preferred (removes `wrong_company` and `no_current_position` at source)
- **Company name** — exact name as it appears on LinkedIn (e.g. "Harvey", "Legora", "Medallion")

### Step 2: Run the classifier

```python
import sys
sys.path.insert(0, '/path/to/skill/scripts')
from classify_company import process_data, build_excel, SPECIALIST_PRESETS, print_summary

company = "Medallion"
input_path = "/path/to/input.csv"
output_path = "/path/to/output.xlsx"

# Use a preset (or build a custom config dict)
specialist = SPECIALIST_PRESETS['doctors']   # or None if no specialist

classified, review_items = process_data(input_path, company=company, specialist=specialist)
print_summary(classified, company=company, specialist=specialist)
```

**Custom specialist config** (if the user describes a non-preset specialist):
```python
specialist = {
    'name': 'Radiologist',
    'credential_patterns': [r'\bmd\b', r'\bdiagnostic radiology\b', r'\bradiology\b'],
    'institution_keywords': ['radiology group', 'imaging center', 'mass general'],
    'title_keywords': ['radiologist', 'interventional radiology', 'diagnostic imaging'],
    'industry_keywords': ['medical and diagnostic laboratories', 'hospitals and health care'],
    'summary_patterns': [r'\bmd\b', r'\bradiology residency\b'],
}
```

### Step 3: Review gray profiles (up to 10, no more)

After running `process_data`, check `review_items`. If there are any REVIEW profiles, present them to the user — but **cap at 10 questions**. If there are more than 10, handle the rest as a batch or skip (they'll appear in amber in the Excel for the user to fix manually).

**Format for presenting each profile:**
```
[N] NAME — Title at Company
    Headline: [headline text, truncated to 120 chars]
    Why flagged: [Classification Notes]
    Assign to: GTM / Builders / Strategy & Ops / Support Functions / EXCLUDE ?
```

**Example:**
```
I found 4 profiles I couldn't confidently classify. What function do these people belong to?

[0] Sarah Chen — "Operations @ Medallion"
    Headline: "Building healthcare infrastructure | Operations at Medallion"
    Why flagged: Company confirmed in headline but "Operations" is ambiguous (could be BizOps, RevOps, or clinical ops)
    → GTM / Builders / Strategy & Ops / Support Functions / EXCLUDE?

[1] ...
```

Collect the user's answers as a corrections dict:
```python
corrections = {
    0: {'Category': 'Strategy & Ops', 'Sub-Category': 'Biz Ops'},
    1: {'Category': 'GTM', 'Sub-Category': 'Customer Success'},
    # ...
}
```

If there are **more than 10 REVIEW profiles**, note to the user: "I found N ambiguous profiles total. I've asked about the top 10 — the remaining ones appear in amber in the Excel file for you to reclassify manually."

### Step 4: Apply corrections and build Excel

```python
# Re-run with corrections applied
classified, _ = process_data(input_path, company=company,
                              specialist=specialist, corrections=corrections)

# Build the Excel file
build_excel(classified, output_path, company=company, specialist=specialist)
```

### Step 5: Recalculate formulas

```bash
python scripts/recalc.py output.xlsx 60
```

Or use the xlsx skill's recalc if unavailable:
```bash
python /path/to/skills/xlsx/scripts/recalc.py output.xlsx 60
```

### Step 6: Report results

After running, summarize key numbers:

```
[Company] Headcount Analysis
─────────────────────────────────────
Total active HC:  ###
  GTM:               ## (##%)
  Builders:          ## (##%)
  Strategy & Ops:    ## (##%)
  Support Functions: ## (##%)
  REVIEW (pending):  ##       ← tells user to check Excel if non-zero

Builder:GTM ratio:  0.##x
Overhead %:         ##%

[If specialist was specified:]
[Specialist] Analysis:
  Total [specialist]s identified:  ##
  [Specialist]s in GTM:            ##
  [Specialist]s as % of GTM:       ##%
```

---

## Understanding the output

### People Data sheet

| Column | Description |
|---|---|
| Full Name, Current Job, Profile Headline | From LinkedIn |
| Category | GTM / Builders / Strategy & Ops / Support Functions / **REVIEW** / EXCLUDE |
| S