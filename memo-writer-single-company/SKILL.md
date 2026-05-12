# Memo Writer - Single Company v3

Investment memo skill calibrated on GC AI, Sandstone, and DeepJudge (March–April 2026). Prose-driven, ~10 pages, Key Debates without Bull/Bear labels, bold inline sub-headers, one quote per debate.

## Structure (11 sections)

1. **Executive Summary** — Dense, multi-paragraph. Covers: positioning, SAM/TAM, valuation context, product thesis, core risk, customer signal summary, team summary, central tension. Ends with a **Sources:** block (plain text label, bullet list by call type, survey info, access disclaimer).
2. **Key Debates** — 1–3 questions as bold headers. Each has a bull paragraph, then a bear paragraph opening with "However,". No explicit Bull/Bear labels. One strong italicized quote per debate with bolded attribution.
3. **Altis View — What Makes or Breaks the Deal** — "What makes the deal:" header + 2–4 ■ bullets. "What breaks the deal:" header + 2–4 ■ bullets. Then a boxed **"Altis view:"** paragraph (2–3 sentences, opinionated judgment).
4. **Market Overview** — Landscape description, stack layers, where the company sits. ROI dynamics and buyer behavior. Quotes from market participants.
5. **TAM** (or **SAM**) — Quantified build-up (total → narrow → addressable). Geographic splits if available. Growth outlook with upside/downside conditions.
6. **Company Overview** — One factual paragraph: founded, HQ, headcount, ARR, valuation, funding rounds, key investors, named customers.
7. **Product & GTM** — Two sub-sections with bold headers. **Product:** capabilities, differentiation, market fit. **GTM:** target segment, sales motion, implementation.
8. **Competitive Dynamics** — Categorized competitors (direct, partial, indirect). Overlap vs. differentiation. Convergence risk.
9. **Customer Signals** — Qualitative and quantitative (when available). Quotes from customers/evaluators. Win/loss and satisfaction data if it exists. Honest about data limitations (flag low N).
10. **Team & Culture** — Founder backgrounds, strengths, weaknesses. Market participant characterizations. Culture observations. Closing italicized quote with bolded attribution.
11. **Legal Notices** — Standard Altis boilerplate, 12 numbered paragraphs, plain text (no bold headers).

## Voice & Writing Conventions

- **Prose-driven throughout.** Flowing paragraphs, not bullet lists. Bullets only appear in WMOBTD and Sources.
- **Key Debate questions are full interrogative sentences.** No labels, no "Bull case / Bear case." Two paragraphs per debate — the second always pivots with "However,".
- **One quote per Key Debate.** Italicized block. Attribution: `– Title | Company descriptor` (both bolded).
- **Executive Summary quote attribution** follows the same format inline (not italicized).
- **Altis view is a clear judgment.** Not hedge-both-sides. States what must happen for a venture-scale outcome and what the likely path is.
- **Dense but clear sentences.** Specific numbers, company names, and product names. No filler adjectives.
- **Cross-references competitors as named entities** with funding/backer details where relevant.
- **ROI framing is specific to the company's positioning.** Tailor to the company's value proposition.
- **Customer signals are honest about stage.** Flag low sample sizes, nascent adoption, wait-and-see dynamics.
- **Team section surfaces weaknesses alongside strengths.** Be specific about gaps (e.g., GTM maturity, limited tenure, domain depth).
- **Sources block is plain text** — no bold on "Sources:", "Interviews:", "Survey:", "Note:".
- **Legal notices use plain numbered paragraphs** — no bold on header labels (e.g., "1. Informational Purposes Only: ...").

## Executive Summary Pattern

The exec summary must match the report deck's executive summary verbatim (with cosmetic parenthesis fixes only). Do not add tildes, stats, or sentences not in the source deck's exec summary. The exec summary in the memo IS the exec summary from the deck.

## Key Debates Pattern

Each debate follows this structure:

```
**[Full interrogative question]?**

[Bull paragraph — why the thesis holds. 4-6 sentences. Specific evidence, stats, named companies.]

However, [bear paragraph — why it might not hold. 4-8 sentences. Opens with "However,". Specific counterevidence, convergence risks, survey data. May include an inline quote.]

_"[Strong quote that captures the tension]"_ — **Title | Company descriptor**
```

## WMOBTD Pattern

```
**What makes the deal: [Declarative sentence]**

■ [Bullet 1]
■ [Bullet 2]
■ [Bullet 3]

**What breaks the deal: [Declarative sentence]**

■ [Bullet 1]
■ [Bullet 2]
■ [Bullet 3]
■ [Bullet 4]

**Altis view:**

[2-3 sentence opinionated judgment. Clear on what the most likely path is.]
```

## Quote Attribution Format

- **Inline (exec summary, body paragraphs):** "[Quote]," said a [Title] at a [Company descriptor].
- **Block (Key Debates, Team & Culture closing):** _"[Quote]"_ — **Title | Company descriptor**
- Title and company descriptor are both bolded in block format.
- Always include role + company descriptor. No names in customer-facing text (anonymized).

## Calibration Notes

- **GC AI memo:** 3 Key Debates. ~$555M valuation, ~$10M ARR. In-house legal assistant. Central tension: SAM ceiling + wrapper risk + CLM convergence. Survey data (N=38 in-house). NPS +58.
- **Sandstone memo:** 2 Key Debates. Seed stage, pre-revenue. In-house legal orchestration. Central tension: convergence from CLMs, AI assistants, LLMs, point solutions. No survey data — qualitative only.
- **DeepJudge memo:** 1 Key Debate. ~$300M valuation, ~$3.7M ARR. Law firm retrieval. Central tension: standalone vs. embedded (DMS/assistant). Survey data (N=100, but DeepJudge-specific NPS N=8). M&A/partnership thesis is the primary framing.

## What Varies Per Company

| Dimension | Adjust based on |
|---|---|
| Number of Key Debates | Deck content — use what the deck supports, don't invent |
| Section 5 header | "TAM" for law-firm-focused, "SAM" for in-house-focused |
| Section 6 header | "Company Overview" or "Company Profile" — match the deck |
| Data richness | If survey data exists, cite it with N. If not, say so honestly |
| Central tension | Company-specific — don't reuse another company's framing |
| Altis view tone | Can be bullish, bearish, or conditional — match the deck's judgment |

## Hard Constraints (from AGENTS.md)

1. No research-process language in narrative body.
2. Never comment on valuations editorially. State facts and stop.
3. No editorial adjective-phrases without attributable evidence.
4. Every inline quote: role + company descriptor. No exceptions.
5. Strong competitive assertions need 2+ corroborating sources.
6. Always distinguish company-stated vs. third-party estimates.
7. Max 1 em dash per paragraph. Prefer periods, commas, or colons.