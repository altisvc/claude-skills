# Altis Brand Guidelines

*Extracted from Figma Brand Toolkit Shareout — for Claude Code context and AI-assisted output generation.*

---

## Brand Essence

Altis delivers institutional-quality venture intelligence. The brand conveys:

- **Elevation** — Latin "altus" = height and depth. Everything reaches upward or goes deeper
- **Precision** — clean, confident, no clutter. Every element earns its place
- **Authority** — VC/institutional credibility without being stuffy

The visual brand should feel like the written voice: direct, confident, precise.

---

## Logo

### Variants

| Variant | File | Use on |
|---------|------|--------|
| 2C Positive | `assets/logos/altis-logo-2c-positive.svg` | White backgrounds — primary |
| 2C Reverse | `assets/logos/altis-logo-2c-reverse.svg` | Navy / blue backgrounds |
| 1C Positive | `assets/logos/altis-logo-1c-positive.svg` | Single-color print, light bg |
| 1C Reverse | `assets/logos/altis-logo-1c-reverse.svg` | Single-color print, dark bg |

### Rules

- Always maintain clear space equal to the height of the chevron mark on all sides
- Approved backgrounds: white, brand blue (#015AE9), cyan (#01B2F4), navy (#030F1F), black
- Never distort, rotate, recolor, or place on busy/photo backgrounds without a solid overlay
- Minimum digital size: 120px wide
- Never use the logo as a pattern or at sizes where the mark becomes illegible

---

## Color

### Primary Palette

| Name | Hex | Use |
|------|-----|-----|
| Navy | `#030F1F` | Dark backgrounds, body text, headings |
| Blue | `#015AE9` | Hero brand color — CTAs, primary backgrounds, icon fills on light |
| Cyan | `#01B2F4` | Secondary accent — highlights, links, data callouts |
| White | `#FFFFFF` | Light backgrounds, reverse text, icon fills on dark |

### Secondary Palette

| Name | Hex | Use |
|------|-----|-----|
| Purple | `#814DC6` | Data visualization, supplemental UI |
| Teal | `#00A6A6` | Data visualization, supplemental UI |
| Coral | `#FF6663` | Alerts, warm data viz accents |
| Orange | `#F28C59` | Warm accent, data viz |
| Yellow | `#F2DA3D` | Highlights, data viz |
| Green | `#4BD66A` | Positive signals, data viz |

### Color Application Rules

- Primary blue is the hero — use for backgrounds, CTAs, key UI elements
- Cyan is accent only — never as a primary content area background
- Expanded palette colors are for data visualization, charts, and secondary UI only
- Body text: navy on white; white on blue/navy backgrounds
- Never use expanded palette warm colors (coral, orange, yellow) for primary UI chrome
- The full expanded palette (27 colors including tints) is in `tokens.json → colors.expanded`

### Expanded Palette Structure

The palette is organized in 9 color families × 3 tones (core, mid, light):
Navy · Blue · Sky · Teal · Purple · Coral · Orange · Yellow · Green

Use the mid and light tints for chart fills, data table backgrounds, and supporting UI — never as primary brand expression.

---

## Typography

### Fonts

**Primary (body/UI): Inter**
- Use for: body text, bullets, captions, UI labels, social media text, all running prose
- Weights: Regular (400), Medium (500), Bold (700)
- Free via Google Fonts: https://fonts.google.com/specimen/Inter
- Native Google Slides font — renders in presentations without embedding or substitution

**Heading: Inter Tight**
- Use for: headlines, section headers, slide titles, bold display text
- Weights: Medium (500), SemiBold (600), Bold (700)
- Free via Google Fonts: https://fonts.google.com/specimen/Inter+Tight
- Native Google Slides font — renders in presentations without embedding or substitution

**Logo font: PROPRIETARY — never use outside the logo SVG**
- The "Altis" wordmark uses a custom display font that is embedded in the logo SVG file
- Never attempt to use this font for any other text, in any context
- Never try to recreate the wordmark in type — always use the logo SVG files
- This font is not available for general use and has no name in the design system

**Fallback stack (web/CSS):** `Inter, 'Inter Tight', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`

**Fallback stack (email):** `Inter, Arial, Helvetica, sans-serif` — Inter may not be installed on all email clients; Arial is the closest safe substitute

**Why Inter and Inter Tight:** Both are native Google Slides fonts. Any Altis presentation generated from the brand template renders correctly without font embedding, substitution warnings, or layout reflow. This is a deliberate technical choice, not a compromise.

### Type Scale

| Style | Size | Weight | Font | Use |
|-------|------|--------|------|-----|
| Display | 48px | 700 | Inter Tight | Hero sections, major slide titles |
| H1 | 36px | 700 | Inter Tight | Page titles, report section headers |
| H2 | 28px | 600 | Inter Tight | Section headings |
| H3 | 22px | 600 | Inter Tight | Sub-headings |
| H4 | 18px | 600 | Inter Tight | Card titles, sidebar headings |
| Body | 16px | 400 | Inter | Paragraphs, analysis text |
| Small | 14px | 400 | Inter | Supporting text, footnotes |
| Label | 12px | 500 | Inter | Tags, badges, UI labels |
| Caption | 11px | 400 | Inter | Captions, timestamps |

### Typography Rules

- Headlines: sentence case. No ALL CAPS except very short labels (2–3 words max)
- Body: regular weight, generous line height (1.6) for readability
- No periods at the end of bullet points
- Consistent with Christopher's standing instructions: sentence case everywhere
- Never mix more than two font families in a single document
- Never use the logo wordmark font for any text outside the logo SVG

---

## Graphic Library

### Overview

16 geometric abstract icons built from the same construction vocabulary as the Altis chevron mark. All icons share:
- Consistent stroke/fill weight
- Arc-based geometry derived from circles and curves
- Designed to work from 16px to 128px+

### Construction Rule

*"Use this grid (or variations on it) to create new shapes informed by our logo design."*

All icons use the same circular construction grid as the chevron mark. New icons must use only arcs, curves, and angles present in the existing icon set.

### Icon Reference

| Name | Light SVG | Dark SVG | Shape Description |
|------|-----------|----------|-------------------|
| signal | icon-signal-light.svg | icon-signal-dark.svg | 5 concentric arcs — signal / broadcast / reach |
| echo | icon-echo-light.svg | icon-echo-dark.svg | 2 half-arcs — echo / pulse pair |
| sweep | icon-sweep-light.svg | icon-sweep-dark.svg | 3 sweeping arcs — expand / reach |
| corner | icon-corner-light.svg | icon-corner-dark.svg | L-shaped corner bracket — pivot / anchor |
| crescent | icon-crescent-light.svg | icon-crescent-dark.svg | Single crescent arc — curvature / potential |
| arc | icon-arc-light.svg | icon-arc-dark.svg | Single wide arc — trajectory / path |
| horizon | icon-horizon-light.svg | icon-horizon-dark.svg | Wide panoramic wave — landscape / scale |
| ring | icon-ring-light.svg | icon-ring-dark.svg | 3 arc ring segments — cycle / orbit |
| stack | icon-stack-light.svg | icon-stack-dark.svg | 5 stacked arcs — layers / depth / progress |
| quarter | icon-quarter-light.svg | icon-quarter-dark.svg | Quarter-circle element — fragment / beginning |
| lens | icon-lens-light.svg | icon-lens-dark.svg | Circular orbital shape — focus / insight |
| orbit | icon-orbit-light.svg | icon-orbit-dark.svg | Crescent with orbital paths — rotation / movement |
| target | icon-target-light.svg | icon-target-dark.svg | Circle with bracket crosshair — scope / precision |
| brackets | icon-brackets-light.svg | icon-brackets-dark.svg | Mirrored L-brackets — structure / contain |
| peak | icon-peak-light.svg | icon-peak-dark.svg | 4 concentric mountain arcs — elevation / summit |
| layers | icon-layers-light.svg | icon-layers-dark.svg | 6-path double nested arcs — depth / complexity |

### Colorway Rules

- **Light variant** (icon-\*-light.svg): Brand blue (#015AE9) fill on transparent — use on white/light backgrounds
- **Dark variant** (icon-\*-dark.svg): White (#FFFFFF) fill on transparent — use on navy/blue backgrounds
- Never use icons in secondary palette colors
- Never mix icon styles — only use official graphic library assets
- Never add drop shadows, strokes, or effects to icons

---

## Patterns

### Variants
- `pattern-light.svg` / `pattern-light@2x.png` — Icons on white, for light-background sections
- `pattern-blue.svg` / `pattern-blue@2x.png` — Icons on brand blue, for dark-background sections

### Usage Rules
- Use at 5–20% opacity as section backgrounds, report covers, or dividers
- Never use patterns at full opacity as a primary content background
- Light pattern on white sections; blue pattern on brand blue sections
- Do not crop patterns in ways that isolate individual icons from context

---

## Photography

### Style
- Subjects: mountain peaks, bridges, infrastructure, upward perspective views
- Aesthetic: architectural, aspirational, precise framing
- Never use generic stock photography — maintain the aspirational, architectural look

### Treatments
- **Untreated**: Editorial use — reports, data contexts, research documents
- **Focus effect**: Brand blue gradient overlay — marketing materials, hero sections, covers

---

## Voice Alignment

The visual brand and written voice should feel continuous:
- Direct, confident, precise
- No decorative elements for decoration's sake
- Every visual element earns its place
- Structure over flourish — organized information is the product
