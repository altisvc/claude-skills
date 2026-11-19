---
name: design-system
description: Altis design system reference — read BEFORE building any branded output (web pages, decks, PDF reports, graphics, emails, Slides). Covers the two systems (WEB vs REPORTS/PRINT), color and typography rules, logo/icon usage, and the output-type template map.
---

# Skill: Altis Design System

**Source of truth:** `design-system/tokens.json` + `design-system/brand-guidelines.md`, in the root of https://github.com/altisvc/claude-skills. Paths below are relative to wherever you keep that `design-system/` folder: the repo you are working in, or a clone of `claude-skills` beside it. If the folder is not in the current repo, find it before building and say where you read it from.

The web system is derived from the live altis.vc code, which outranks Figma and this file where they disagree. If you are working inside the site repo itself, its existing components are the first reference and these tokens are the second; a difference between them is drift to report, not to resolve.

**TWO SYSTEMS — pick by output surface:**
- **WEB** (browser-rendered product/marketing) → ABC Diatype · DM Sans · Freight Text Pro + navy-slate palette. Lives in `colors.web` / `typography.web` and the `build/` outputs.
- **REPORTS / PRINT** (Altis Reports PDFs + decks) → Inter Tight · Inter + original palette (navy `#030F1F`). Lives in `colors.reports` / `typography.reports`. Print-optimized; do not switch these to the web fonts.
- Brand blue `#015AE9` is shared by both.

## Before building any branded output

1. Decide WEB vs REPORTS/PRINT first, then read the matching block of `design-system/tokens.json` (colors, typography, spacing, icon manifest)
2. Read `design-system/brand-guidelines.md` — qualitative rules, logo usage, voice alignment (organized by the two systems)
3. Never recreate logos or icons — always reference SVG files from `design-system/assets/`

## Output-type reference

| Output type | Use this |
|-------------|----------|
| Web / HTML | `design-system/build/tokens.css` (CSS custom properties) or `tailwind.config.js` |
| React / JS | `design-system/build/tokens.mjs` (ES module) or `build/tailwind-tokens.js` |
| SCSS projects | `design-system/build/tokens.scss` |
| PDF reports | `design-system/templates/pdf-report-template.js` |
| Google Slides | `design-system/templates/google-slides-template.js` — copies designer template, populates via API. See `slide-catalog.md` for layout reference. `pptx-template.js` is deprecated. |
| Ghost theme | `design-system/templates/ghost-theme.css` *(Phase 4 — coming)* |
| LinkedIn graphics | `design-system/templates/linkedin-templates.md` *(Phase 4 — coming)* |
| Email | `design-system/templates/email-template.html` *(Phase 5 — coming)* |
| Lovable projects | `design-system/templates/lovable-setup.md` *(Phase 5 — coming)* |
| Merch / promo (Custom Ink, MOO) | `design-system/brand-guidelines.md → Merch & promo` — upload the logo SVG as art, never re-set the wordmark in vendor type |

## Color rules

- Hero/primary elements (both systems): brand blue `#015AE9`
- **WEB** text: ink-700 `#162840` (body), ink-900 `#030D1F` (dark bg); muted slate-500 `#5C6F80`; surfaces `#F6F7FA`/`#E8EDF5`; border `#CBD4DF`; accent cyan `#02B3F4` (eyebrows only); bull/bear via semantic `#21A87A`/`#E84040`
- **REPORTS/PRINT** text: navy `#030F1F`; accent cyan `#01B2F4`; charts use the expanded palette — never for primary UI chrome
- Logo on white: `altis-logo-2c-positive.svg` | On navy: `altis-logo-2c-reverse.svg` | On brand blue: `altis-logo-1c-reverse.svg` (all white — the 2c mark is blue-gradient and disappears on blue)

## Typography rules

- **WEB:** ABC Diatype (global default + most headings), DM Sans (UI + hero display), Freight Text Pro (small serif accent — citations/footnotes, never headings). Web fallback: `var(--font-abc-diatype), ui-sans-serif, system-ui, sans-serif`
- **REPORTS/PRINT:** Inter Tight (headlines, slide titles, section headers, 600–700) + Inter (body, bullets, captions, labels, 400–500). Fallback: `Inter, 'Inter Tight', system-ui, sans-serif`; email: `Inter, Arial, Helvetica, sans-serif`
- **Logo wordmark font:** proprietary — embedded in SVG only, never use in text. In a vendor font list (merch), the on-brand equivalent for *secondary* text is Helvetica Bold (`Helvetica B` in Custom Ink), then Helvetica Regular — never Arial
- Sentence case everywhere — no ALL CAPS except very short labels / eyebrows (2–3 words max)
- No periods at the end of bullet points

## Icon usage

- Light backgrounds: `design-system/assets/icons/icon-[name]-light.svg` (blue fill)
- Dark/blue backgrounds: `design-system/assets/icons/icon-[name]-dark.svg` (white fill)
- Available icons: signal, echo, sweep, corner, crescent, arc, horizon, ring, stack, quarter, lens, orbit, target, brackets, peak, layers
- Artifact kind icons (a row or card that knows its kind): call, tam, survey, as `icon-[name]-light.svg`, `-dark.svg`, and `-gradient.svg` for social and print only
- Never recolor, rescale disproportionately, or add effects to icons

## Rebuild tokens

If `sd-tokens/` source files change (e.g. after a Figma update):
```bash
npm run build-tokens
```
This regenerates `build/tokens.css`, `build/tokens.scss`, `build/tokens-flat.json`, `build/tokens.mjs`.
