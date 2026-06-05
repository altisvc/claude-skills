# Altis Design System

Two coordinated systems. Last updated 2026-06-05.
- **WEB** (live product + marketing site): ABC Diatype · DM Sans · Freight Text Pro + navy-slate palette. Re-derived from `altisvc/web-v2` (source of truth where Figma and the code disagree).
- **REPORTS / PRINT** (Altis Reports PDFs + decks): Inter Tight · Inter + the original brand palette. From the Figma Brand Toolkit `NRmjBmJBIGJj5DTw3Lfe4a`; print-optimized, unchanged.

Brand blue `#015AE9` is shared. This gives Claude Code (and any tooling) a machine-readable reference for all Altis-branded output. **Always pick WEB vs REPORTS/PRINT by output surface first.**

---

## Files

| File | Purpose |
|------|---------|
| `tokens.json` | Machine-readable tokens — `colors.web`/`colors.reports`, `typography.web`/`typography.reports`, spacing, logo metadata, icon manifest |
| `build/tokens.css` | WEB CSS custom properties (auto-generated — run `npm run build-tokens`) |
| `build/tailwind-tokens.js` | WEB Tailwind tokens |
| `build/tokens.mjs` / `.scss` / `tokens-flat.json` | WEB tokens for JS / SCSS / flat JSON |
| `tokens.css` (root) | DEPRECATED — stale duplicate; use `build/tokens.css` |
| `sd-tokens/` | Style-dictionary source for the WEB build outputs |
| `brand-guidelines.md` | Qualitative rules for both systems — color, typography, icons, voice |
| `templates/pdf-report-template.js` | REPORTS PDF renderer (reads `colors.reports`, Inter Tight) |
| `assets/logos/` | All logo SVGs (primary, 2C positive/reverse, 1C positive/reverse, colorways sheet) |
| `assets/icons/` | 16 icons × 2 colorways = 32 SVG files (light: blue on white; dark: white on navy) |
| `assets/patterns/` | Pattern tiles as SVG + PNG@2x (light and blue variants) |
| `assets/photos/` | Brand photography (untreated + focus-effect treatment) |
| `assets/construction-logic@2x.png` | Figma construction grid reference for creating new icons |

---

## How to Use

### For Claude Code

Before building any Altis-branded frontend, UI, presentation, or visual output:

1. Decide **WEB** or **REPORTS/PRINT** by output surface
2. Read the matching block of `tokens.json` for colors, type, spacing
3. Follow the rules in `brand-guidelines.md`
4. Use SVG assets from `assets/` — never recreate logos or icons from scratch
5. For web/HTML, use `build/tokens.css` or `build/tailwind-tokens.js`
6. Default to brand blue (`#015AE9`) for hero elements

### Quick Reference

**WEB**
- Text: ink-700 `#162840` (body), ink-900 `#030D1F` (dark bg); muted slate-500 `#5C6F80`
- Surfaces: page `#F6F7FA`, raised `#E8EDF5`; border `#CBD4DF`
- Brand blue `#015AE9`; cyan `#02B3F4` (eyebrows only); bull/bear `#21A87A`/`#E84040`
- Fonts: ABC Diatype (default + most headings), DM Sans (UI + display), Freight Text Pro (small serif accent)

**REPORTS / PRINT**
- Navy `#030F1F`, Blue `#015AE9`, Cyan `#01B2F4`, White `#FFFFFF`; expanded palette for charts
- Fonts: Inter Tight (headings) + Inter (body) — native Google Slides fonts

**Logo:** `altis-logo-2c-positive.svg` on white; `altis-logo-2c-reverse.svg` on blue/navy
**Icons:** `-light` variant on white, `-dark` variant on blue/navy

---

## Re-deriving

- **WEB:** re-extract from `altisvc/web-v2` (fonts in `app/layout.tsx`, tokens in `app/globals.css`, colors inline across `app/` + `components/`). Update `sd-tokens/*.json` then run `npm run build-tokens`; mirror in `tokens.json → *.web` and `brand-guidelines.md`.
- **REPORTS/PRINT:** from Figma Brand Toolkit `NRmjBmJBIGJj5DTw3Lfe4a` (needs a Figma PAT). Plan: `00-inbox/figma-brand-extraction-plan.md`.
