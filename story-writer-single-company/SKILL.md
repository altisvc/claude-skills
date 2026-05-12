# Story Writer — Single Company

Read a single-company Altis diligence deck (PDF or workspace page) and produce a concise narrative summary. The summary distills the entire report into ≤6 paragraphs that a VC partner can read in 2 minutes and walk away with a clear view of the opportunity, the product thesis, growth dynamics, risks, team, and the core investment question.

## Input

- A single-company diligence deck PDF attachment or a workspace page containing a full report (Day 1 Report, Key Debates, Company Screener, or summary memo)
- Optional: specific angle or context the reader cares about (e.g., "this is for a growth fund focused on AI infrastructure")

## Process

1. Read the entire source material. For PDFs, read all pages. For workspace pages, use `get_page_details`, `get_page_structure`, and `search_page_description` to ensure complete coverage.
2. Extract: market size (TAM/SAM), company financials (ARR, valuation, funding), product architecture and differentiation, competitive positioning, growth dynamics, key risks, team signals, and the Altis view.
3. Cross-check every data point against the source. Do not round, estimate, or infer numbers that are not explicitly stated.
4. Draft the summary following the paragraph structure below.
5. Present the summary to the user for review. Iterate on their edits.

## Output Structure: ≤6 Paragraphs

### Paragraph 1 — Market and Company Position

- What market is this? How big is the addressable opportunity?
- Where does this company sit in the market? What's the current scale (ARR, customers, geographic footprint)?
- State the SAM/TAM figure and the company's current revenue or spend figures from the deck.
- How much of the market has been captured? How early or late is the company relative to the category?

### Paragraph 2 — Product Architecture and Defensibility

- What is the product at its core? (e.g., thin wrapper, platform, infrastructure, workflow tool)
- What makes it valuable to the core customer segment? Name the specific mechanism, not generic "moat" language.
- Where does the value proposition weaken? Which segments or use cases matter less?
- If the company has a technical architecture advantage, describe it concretely. If it doesn't, say so.

### Paragraph 3 — Growth Dynamics and Headwinds

- Acknowledge growth trajectory, then enumerate specific reasons it may decelerate.
- When survey or spend data exists, use it to calibrate claims. Lead with what the data actually says, then name the real risk.
- Cover relevant threat vectors: competitive pricing pressure, platform subsumption, incumbent response, adoption friction in new segments, model/technology commoditization, customer concentration.
- Use the deck's own data, survey results, and interview quotes to ground each point. Cite specific percentages when available.

### Paragraph 4 — Valuation and Expansion Paths

- State current valuation and what it implies about growth expectations.
- Identify what the company needs to do beyond its current product to justify that valuation (broader workflows, adjacent verticals, infrastructure plays, international expansion).
- If growth decelerates, note whether the company transitions from venture into growth equity territory, where investors underwrite durable revenue growth and profitability path rather than hypergrowth.
- Name company-specific advantages or disadvantages for expansion.

### Paragraph 5 — Team and Culture

- Keep this short (3–4 sentences).
- One concrete signal about the founders — a reference quote, a prior company, a domain insight. Not generic praise.
- Where leadership style or culture creates a competitive advantage or vulnerability, name it directly with specific evidence.
- Note team gaps honestly if the source material surfaces them.

### Paragraph 6 — The Investment Question

- Frame the core investment question as a race condition, a binary bet, or a threshold the company must cross.
- State what the company needs to prove and by when. Name the observable milestones, not abstract conditions.
- If the source material contains an Altis view, state it plainly. If not, frame the question the investor needs to answer.
- End with the real question, not a summary of previous paragraphs.

## Adapting to Source Material Richness

- **Full Day 1 Report (market + product + competitive + team + key debates + customer signals)** → All 6 paragraphs, full depth.
- **Key Debates only** → Paragraphs 1–4 primary. Paragraphs 5–6 included only if evidence supports team and investment question views.
- **Company Screener** → Lighter treatment. Paragraphs 1, 2, 4, 6. May produce 3–4 paragraphs instead of 6.
- **Summary Memo** → All 6 paragraphs. The memo contains the richest synthesized material.

## Writing Rules

1. **Altis voice.** Direct, analytical, opinionated. No consulting-speak, no filler, no hedging.
2. **Max 1 em dash per paragraph.** Use periods, commas, or semicolons instead.
3. **No unsupported claims.** Every data point must appear in the source. If the user adds editorial framing, flag that it's not sourced from the deck.
4. **Acknowledge both bull and bear.** Growth can be fast and still have limits. The product can be strong and still face structural threats. Name both sides.
5. **Short sentences mixed with long.** Vary rhythm. No monotone cadence.
6. **No "X, not Y" dismissive constructions.** Present factors as additive.
7. **Limit "structural" / "structurally" to max 1 use in the entire summary.**
8. **No hedging language.** Ban: "it remains to be seen," "only time will tell," "could potentially," "it is worth noting."
9. **Name specific competitors with specifics.** Never write "several emerging players." Write the name, the funding, and what they do differently.
10. **Consistency check.** Before finalizing, re-read the entire source and verify every claim. Flag any inconsistency to the user.
11. **No valuation commentary.** Do not say whether a valuation is "hard to justify" or "reasonable." State facts (ARR, multiple, growth rate) and let the reader conclude.
12. **Weave bear signals throughout.** Don't quarantine negative evidence in one paragraph. A weakness that affects growth, defensibility, and expansion should surface in Paragraphs 2, 3, and 4.

## Collaborative Workflow

This skill is designed for iterative co-writing:

1. **User provides raw sentences or key points** they want included.
2. **AI weaves them into the paragraph structure** while preserving the user's voice and intent.
3. **User edits directly** — adding, removing, or rephrasing.
4. **AI adjusts tone** to match Altis voice on request.
5. **AI cross-checks against source** after each round of edits and flags inconsistencies.

The user drives the substance. The AI handles structure, flow, and fact-checking.

## Reference: How This Differs from the A vs. B and Market Segment Story Writers

| Dimension | Single Company | A vs. B | Market Segment |
|---|---|---|---|
| Subject | One company | Two competing companies | Entire category / multiple segments |
| Paragraph 1 | Market + company position | Market + penetration (shared) | Market shift + why now |
| Core tension | Company vs. its own growth ceiling | Company A vs. Company B | Segment vs. segment investability |
| Paragraph 6 | Investment question (threshold/bet) | Competitive framing (analogy) | Competitive endgame (consolidation) |
| Team section | Standalone paragraph | Contrasting cultures | Omitted (too many players) |
| Typical source | Day 1 Report, Summary Memo | Comparative deck, Head-to-Head | Category report, Master Narrative |

## Naming Convention

- If saved as a page: `[Company] — Story Summary`
- Place as a sibling to the source report (same parent page)

## Calibration Notes (from GC AI story, March 2026)

The first draft produced from this skill was too analytical and structured. The Harvey vs. Legora A vs. B story is the tone benchmark. Key lessons:

1. **Narrative over analysis.** The first draft read like a structured report with parenthetical citations (N=29) and explicit section logic. The final version reads like prose. Write sentences, not bullet points in paragraph form.
2. **Fewer numbers per paragraph.** The first draft of P1 had 8+ numbers. The final version has 4. Front-load the one or two numbers that matter; let the rest emerge naturally or cut them.
3. **Survey data gets its own short paragraph.** Don't scatter survey stats across every paragraph. One tight paragraph that captures win rate, satisfaction, adoption preference, and the primary weakness. Keep it to 4–6 sentences.
4. **The Altis view must appear.** The WMOBTD slide and Altis view from the deck should be woven into the closing. State it plainly: "GC AI can sustain X near-term, but long-term value shifts to Y."
5. **Name the strategic move, but hedge appropriately.** If the deck shows the company expanding into a new layer (e.g., cognitive → process automation), state it specifically in the valuation paragraph. But distinguish between what the company has signaled vs. what the market perceives as credible. If the expansion path requires capabilities the company hasn't built and isn't perceived as having, say so plainly. Use "has signaled ambitions" rather than "has begun moving in this direction" when the move is aspirational.
6. **Quotes earn their place through specificity.** The HubSpot/Salesforce quote and the Ironclad/Claude/Word plugin quote survived every round of edits because they make concrete arguments. Generic praise quotes get cut.
7. **Team paragraph should be short.** 2–3 sentences. Name, background, distribution channel, culture signal. Don't over-explain.
8. **The closing is one or two sentences, not a paragraph.** Merge it into the team paragraph. State the Altis view, then the bet. Done.
9. **Target length: ~3,500–4,000 characters.** The Harvey vs. Legora story is ~3,800 characters. Match that density.
10. **Verify derived math.** If you state "full penetration of X users at $Y yields Z," multiply it out and check. The GC AI story initially claimed 220K × $5K = "sub-$1B" which is wrong ($1.1B). Catch this before the researcher does.
11. **Bridge the closing, don't jump.** When merging team + Altis view into one paragraph, don't abruptly switch from CEO bio to long-term market dynamics. Bridge through what the company has going for it, then pose the question. Pattern: "[CEO detail]. That [founder advantage], combined with [company advantages], is what [Company] has going for it. The question is whether those advantages compound into X before Y."

## Reference Example

The GC AI story summary (March 2026) is the canonical example of this skill's output. It was co-written iteratively from a 43-slide diligence deck (N=25 market participant interviews, N=100 decision-maker survey). The final version is 6 paragraphs at ~3,650 characters. Key editorial decisions: P1 was revised to remove number density; a standalone survey paragraph was added then tightened; the growth paragraph was shortened by removing redundant tailwind data; the valuation paragraph led with the near-term path (gain share in a 98% unpenetrated market), then hedged the longer-term expansion path (cognitive → process automation) as aspirational after researcher feedback that the market doesn't perceive GC AI as a credible workflow tool; the team paragraph was compressed and the closing merged into it. See GC AI — Story Summary for the final output.