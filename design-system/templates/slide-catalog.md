# Altis Google Slides template — slide catalog

**Template ID:** `1pY6SoMTTG1bzg_99v1-xwzLxVEVZSx-T3X-gMx4tBz0`
**View in Slides:** https://docs.google.com/presentation/d/1pY6SoMTTG1bzg_99v1-xwzLxVEVZSx-T3X-gMx4tBz0/edit
**Cataloged:** 2026-03-01 — 42 slides

---

## Quick start

```js
const {
  createPresentation,
  getPresentation,
  replaceText,
  deleteUnusedSlides,
} = require('./google-slides-template');

// 1. Copy template → new presentation
const { presentationId, url } = await createPresentation('Q1 2026 — Acme diligence');

// 2. Populate text (by slide objectId from getPresentation)
const prs = await getPresentation(presentationId);
await replaceText(presentationId, prs.slides[0].objectId, [
  { find: 'Rise above the noise.', replaceWith: 'Acme Co — Series A diligence' },
]);

// 3. Delete unused slides (pass 0-based indices to KEEP)
await deleteUnusedSlides(presentationId, [0, 11, 28]);

console.log(url);
```

**Auth setup (first time only):**
```bash
node design-system/templates/google-slides-template.js --auth
```

---

## Slide selection guide

| Content type | Use slide # | Layout key |
|---|---|---|
| Presentation opener — dark | 1 | `cover-dark` |
| Presentation opener — light | 2 | `cover-light` |
| Alternate cover (graphic variants) | 3–8 | `cover-alt-1` … `cover-alt-6` |
| Agenda / table of contents | 10 | `agenda` |
| Chapter / section break | 12 | `chapter-divider-1` |
| Headline-only statement | 17 | `headline-only-1` |
| 4-up icon or company grid | 20 | `4-up-grid-header` |
| Text-heavy narrative | 23 | `text-narrative` |
| Pull quote or key insight | 24 | `pull-quote-1` |
| Big number / KPI | 27 | `kpi-stat` |
| Evidence — dark bg, with images | 28 | `evidence-dark-4img` |
| Evidence — light bg, list | 29 | `evidence-light-list` |
| Evidence — dark bg, list | 30 | `evidence-dark-list` |
| Numbered list (3 items) | 31 | `numbered-3-light` |
| Dark bullet evidence | 32 | `evidence-dark-bullets` |
| Checklist / verified items | 34 | `checklist-light` |
| 3-step process with images | 35 | `numbered-3-with-images` |
| 3-step process, text only | 36 | `numbered-3-no-images` |
| Image + content, image right | 37 | `half-image-right` |
| Image + content, image left | 38 | `half-image-left` |
| Image + content + callout | 39 | `half-image-callout` |
| Comparison / pricing table | 40 | `table-grid` |
| Closing slide | 42 | `closing-blank` |

---

## Full slide catalog

### Group 1 — Cover slides (slides 1–9)

| # | Layout key | Background | Key placeholders | Images | Notes |
|---|---|---|---|---|---|
| 1 | `cover-dark` | Navy `#030F1F` | `title` | 2 | Primary dark cover — logo, 2 graphic elements, no subtitle |
| 2 | `cover-light` | White | `title`, slide number | 1 | Light cover with half-image panel |
| 3 | `cover-alt-1` | Template | `title`, slide number | — | Graphic variant 1 |
| 4 | `cover-alt-2` | Template | `title`, slide number | — | Graphic variant 2 |
| 5 | `cover-alt-3` | Template | `title`, slide number | — | Graphic variant 3 |
| 6 | `cover-alt-4` | Template | `title`, slide number | — | Graphic variant 4 |
| 7 | `cover-alt-5` | Template | `title`, slide number | — | Graphic variant 5 |
| 8 | `cover-alt-6` | Template | `title`, slide number | — | Graphic variant 6 |
| 9 | `cover-dark-alt` | Navy `#030F1F` | `title`, slide number | 1 | Dark cover with single image panel |

Default: slide 1. Use slide 2 for a lighter-branded context. Slides 3–8 share the same placeholder structure as slide 2 but with distinct graphic treatments — pick by visual preference.

---

### Group 2 — Agenda (slides 10–11)

| # | Layout key | Background | Key placeholders | Images | Notes |
|---|---|---|---|---|---|
| 10 | `agenda` | Light | `title`, slide number | — | 5-item numbered agenda, no image |
| 11 | `agenda-with-image` | White | `title`, slide number | 1 | 5-item numbered agenda + image panel |

Item text boxes are static (not standard body placeholders) — replace text by element ID or direct edit in Slides. Use for 3+ section presentations. Skip for short decks.

---

### Group 3 — Chapter/section dividers (slides 12–16)

| # | Layout key | Background | Key placeholders | Images | Notes |
|---|---|---|---|---|---|
| 12 | `chapter-divider-1` | Template | `title`, `subtitle`, slide number | — | Variant 1 |
| 13 | `chapter-divider-2` | Template | `title`, `subtitle`, slide number | — | Variant 2 |
| 14 | `chapter-divider-3` | Template | `title`, `subtitle`, slide number | — | Variant 3 |
| 15 | `chapter-divider-4` | Template | `title`, `subtitle`, slide number | — | Variant 4 |
| 16 | `chapter-divider-5` | Template | `title`, `subtitle`, slide number | — | Variant 5 |

`title` → chapter name (e.g., "Market sizing"). `subtitle` → optional short descriptor. One divider per major section.

---

### Group 4 — Headline-only (slides 17–19)

| # | Layout key | Background | Key placeholders | Images | Notes |
|---|---|---|---|---|---|
| 17 | `headline-only-1` | Template | `title`, slide number | — | Full-width single headline statement |
| 18 | `headline-only-2` | Template | `title`, slide number | — | Chapter-title style headline |
| 19 | `headline-only-3` | Template | `title`, slide number | — | Alternate headline layout |

Title placeholder only — no body text. Use for transition moments, bold assertions, or "the answer" reveals.

---

### Group 5 — 4-up icon/image grids (slides 20–22)

| # | Layout key | Background | Key placeholders | Images | Notes |
|---|---|---|---|---|---|
| 20 | `4-up-grid-header` | Light | `title`, `subtitle`, body, slide number | 4 | Title + subtitle header, 4 image/icon slots, optional description column |
| 21 | `4-up-grid-body` | Light | `title`, `subtitle`, body, slide number | 4 | Same as 20 with a body text column |
| 22 | `4-up-grid-minimal` | Light | `title`, slide number | 4 | Title only + 4 image/icon slots |

4 square image slots with static label text below each. Use for: portfolio company logos, partner logos, team photos, 4-feature showcases.

---

### Group 6 — Text/narrative (slide 23)

| # | Layout key | Background | Key placeholders | Images | Notes |
|---|---|---|---|---|---|
| 23 | `text-narrative` | Light | `title`, `body`, slide number | — | Long-form paragraph body |

Use for background context, methodology, or any slide needing 2–4 sentences without visuals.

---

### Group 7 — Pull quotes and KPI statements (slides 24–27)

| # | Layout key | Background | Key placeholders | Images | Notes |
|---|---|---|---|---|---|
| 24 | `pull-quote-1` | Template | `title` (large), `subtitle`, slide number | — | Centered quote/statement + attribution |
| 25 | `pull-quote-2` | Template | `title` (large), `subtitle`, slide number | — | Pull quote alternate layout |
| 26 | `pull-quote-blank` | Template | `title`, `subtitle`, slide number | — | Empty pull quote — blank placeholders |
| 27 | `kpi-stat` | Template | `title`, `subtitle`, slide number | — | Big number + label + supporting text (static "$10B"-style element) |

Slides 24–25: `title` → quote or statement (up to ~120 chars), `subtitle` → attribution or context. Use for notable customer quotes, "the number that matters", key proof points.

---

### Group 8 — Evidence and data slides (slides 28–34)

| # | Layout key | Background | Key placeholders | Images | Notes |
|---|---|---|---|---|---|
| 28 | `evidence-dark-4img` | Navy `#030F1F` | multiple `body`, `title`, slide number | 4 | Dark: 4 rows each with image + text evidence |
| 29 | `evidence-light-list` | Light | `title`, `body`, slide number | — | Light: title + numbered/bulleted list |
| 30 | `evidence-dark-list` | Navy `#030F1F` | `title`, `body`, slide number | — | Dark: title + numbered list |
| 31 | `numbered-3-light` | Light | `title`, `subtitle`, slide number | — | Light: 3 numbered items with descriptions (static layout) |
| 32 | `evidence-dark-bullets` | Navy `#030F1F` | `title`, `body`, slide number | — | Dark: title + short bullet rows |
| 33 | `evidence-dark-bullets-2` | Navy `#030F1F` | `title`, `body`, slide number | — | Dark: bullet list, alternate layout |
| 34 | `checklist-light` | White | `title`, slide number | — | White: title + checkmark (✓) list (static) |

Dark backgrounds = high-stakes or hero evidence. Light = secondary or supplementary. Slide 28's 4 image slots accept product screenshots or company logos.

---

### Group 9 — Numbered 3-item lists (slides 35–36)

| # | Layout key | Background | Key placeholders | Images | Notes |
|---|---|---|---|---|---|
| 35 | `numbered-3-with-images` | Light | `title`, `subtitle`, slide number | 3 | 3 numbered items, image above each |
| 36 | `numbered-3-no-images` | Light | `title`, `subtitle`, slide number | — | 3 numbered items, text only |

Use for process flows, 3-pillar frameworks, or "here's how it works" with exactly 3 steps.

---

### Group 10 — Half-image + content (slides 37–39)

| # | Layout key | Background | Key placeholders | Images | Notes |
|---|---|---|---|---|---|
| 37 | `half-image-right` | Light | `title`, `body`, slide number | 1 | Image on right half, content + list on left |
| 38 | `half-image-left` | Light | `title`, `body`, slide number | 1 | Image on left half, content + list on right |
| 39 | `half-image-callout` | Light | `title`, `body`, slide number | 1 | Image + content + callout sidebar panel |

Use for product screenshots, team photos, or any slide needing visual proof alongside written context.

---

### Group 11 — Table/comparison grid (slide 40)

| # | Layout key | Background | Key placeholders | Images | Notes |
|---|---|---|---|---|---|
| 40 | `table-grid` | Light | `title`, slide number | — | 5-column comparison table (designed static element) |

Table structure is part of the designer's layout — replace cell text directly in Google Slides. Use for competitive comparisons, pricing tiers, feature matrices.

---

### Group 12 — Extended content (slide 41)

| # | Layout key | Background | Key placeholders | Images | Notes |
|---|---|---|---|---|---|
| 41 | `extended-content` | Light | `title`, `body`, slide number | — | Title + extended body, alternate layout |

Use for appendix slides or longer analysis that doesn't fit a standard content layout.

---

### Group 13 — Closing (slide 42)

| # | Layout key | Background | Key placeholders | Images | Notes |
|---|---|---|---|---|---|
| 42 | `closing-blank` | Template | slide number | — | Branded closing/end slide |

Leave as-is or add a single line of contact text. Always include as the final slide.

---

*Cataloged from PPTX export of template `1pY6SoMTTG1bzg_99v1-xwzLxVEVZSx-T3X-gMx4tBz0` on 2026-03-01.*
