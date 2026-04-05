# Altis Design System

Extracted from the Figma Brand Toolkit Shareout on 2026-03-01.
Figma file: `NRmjBmJBIGJj5DTw3Lfe4a`

This design system gives Claude Code (and any other tooling) a complete, machine-readable reference for all Altis-branded output — frontends, reports, presentations, social media, email.

---

## Files

| File | Purpose |
|------|---------|
| `tokens.json` | Machine-readable design tokens — colors, typography, spacing, logo metadata, icon manifest |
| `tokens.css` | CSS custom properties generated from tokens.json |
| `brand-guidelines.md` | Qualitative brand rules — color application, typography rules, icon usage, voice alignment |
| `assets/logos/` | All logo SVGs (primary, 2C positive/reverse, 1C positive/reverse, colorways sheet) |
| `assets/icons/` | 16 icons × 2 colorways = 32 SVG files (light: blue on white; dark: white on navy) |
| `assets/patterns/` | Pattern tiles as SVG + PNG@2x (light and blue variants) |
| `assets/photos/` | Brand photography (untreated + focus-effect treatment) |
| `assets/construction-logic@2x.png` | Figma construction grid reference for creating new icons |

---

## How to Use

### For Claude Code

Before building any Altis-branded frontend, UI, presentation, or visual output:

1. Read `tokens.json` for all color values, type settings, and spacing
2. Follow the rules in `brand-guidelines.md`
3. Use SVG assets from `assets/` — never recreate logos or icons from scratch
4. Use `tokens.css` for web/HTML output — import or copy the custom properties
5. Default to brand blue (`#015AE9`) for hero elements
6. Use expanded palette colors for data visualization and charts only

### Quick Reference

**Primary colors:**
- Navy `#030F1F` — dark backgrounds, body text
- Blue `#015AE9` — hero brand color, CTAs, icon fill on light
- Cyan `#01B2F4` — accent only
- White `#FFFFFF` — light backgrounds, icon fill on dark

**Fonts:**
- Sofia Pro — brand headlines (commercial license required)
- Inter — body, UI, social (free via Google Fonts)

**Logo:** Use `altis-logo-2c-positive.svg` on white; `altis-logo-2c-reverse.svg` on blue/navy

**Icons:** Use `-light` variant on white backgrounds, `-dark` variant on blue/navy backgrounds

---

## Re-extracting

If the Figma file is updated, re-run the extraction script or follow the plan in:
`00-inbox/figma-brand-extraction-plan.md`

You will need a Figma personal access token. The file key is `NRmjBmJBIGJj5DTw3Lfe4a`.
