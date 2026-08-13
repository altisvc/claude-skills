# Altis Brand Guidelines

*For Claude Code context and AI-assisted output generation. Last updated 2026-06-05.*

---

## Two systems — read this first

Altis runs **two coordinated visual systems**. Pick by output surface:

| System | Use for | Fonts | Neutrals |
|--------|---------|-------|----------|
| **WEB** | The live product + marketing site (browser-rendered) | ABC Diatype · DM Sans · Freight Text Pro | Navy-slate scale |
| **REPORTS / PRINT** | Altis Reports PDFs and presentation decks | Inter Tight · Inter | Single navy `#030F1F` + brand palette |

**Brand blue `#015AE9` is shared by both.** Everything else differs. The web system was re-derived from the live `altisvc/web-v2` code (the source of truth where the designer's Figma and the code disagreed). The reports system is the original brand toolkit — unchanged, because Inter Tight + the original palette render cleanly for print and as native Google Slides fonts.

Machine-readable values: `tokens.json` (`colors.web` / `colors.reports`, `typography.web` / `typography.reports`). Web build outputs (Tailwind/CSS/SCSS/JS) in `build/` carry the **web** system only.

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
- Approved backgrounds: white, brand blue (#015AE9), cyan, navy, black
- Never distort, rotate, recolor, or place on busy/photo backgrounds without a solid overlay
- Minimum digital size: 120px wide
- Never use the logo as a pattern or at sizes where the mark becomes illegible

---

## Color — WEB system

The live product/marketing palette. Neutrals are a navy → slate ramp, not a single navy.

### Brand
| Name | Hex | Use |
|------|-----|-----|
| Blue | `#015AE9` | Hero color — primary CTA bg, accent borders, highlight tints (`rgba(1,90,233,0.05)`) |
| Cyan | `#02B3F4` | Accent **only** — uppercase eyebrow/kicker labels. Never a content background |

### Ink (navy text + dark surfaces)
| Token | Hex | Use |
|-------|-----|-----|
| ink-900 | `#030D1F` | Darkest navy — dark backgrounds, max-contrast text |
| ink-800 | `#081830` | Headings / high-emphasis text |
| ink-700 | `#162840` | **Primary body text** — most common text color |
| ink-600 | `#2E4660` | Mid-tone sub-copy |

### Slate (muted text)
| Token | Hex | Use |
|-------|-----|-----|
| slate-500 | `#5C6F80` | Secondary / muted text — primary muted token |
| slate-400 | `#7A8B9B` | Tertiary muted, eyebrow color, placeholders |
| slate-300 | `#98A6B5` | Faint / disabled text |

### Surface & border
| Token | Hex | Use |
|-------|-----|-----|
| white | `#FFFFFF` | Page bg, reverse text, button text |
| surface (page) | `#F6F7FA` | Off-white section bg; light text on dark |
| surface-raised | `#E8EDF5` | Card / panel surface |
| border | `#CBD4DF` | Borders / dividers |

### Semantic
| Token | Hex | Use |
|-------|-----|-----|
| positive | `#21A87A` | Positive / bull signal text (about-page variant `#1A9D6F`) |
| positive-strong | `#156634` | Positive accent — borders, strong headings |
| negative | `#E84040` | Negative / bear signal text (about-page variant `#D9482F`) |
| negative-strong | `#B52318` | Negative accent — borders, strong headings |
| danger | `#B84040` | UI destructive — button bg, error text, focus ring |

**Web color rules**
- Blue is the hero; cyan is accent-only (eyebrows), never a content-area background
- Body text is ink-700 on light; surface-page/white on dark
- Use semantic tokens for bull/bear and risk signals — not the reports data-viz palette

---

## Color — REPORTS / PRINT system

Altis Reports PDFs and decks. Unchanged original palette; print-optimized.

### Primary
| Name | Hex | Use |
|------|-----|-----|
| Navy | `#030F1F` | Dark backgrounds, body text, headings |
| Blue | `#015AE9` | Hero brand color — CTAs, primary backgrounds, icon fills (shared with web) |
| Cyan | `#01B2F4` | Secondary accent — highlights, links, data callouts |
| White | `#FFFFFF` | Light backgrounds, reverse text, icon fills on dark |

### Secondary / data-viz
Purple `#814DC6` · Teal `#00A6A6` · Coral `#FF6663` · Orange `#F28C59` · Yellow `#F2DA3D` · Green `#4BD66A`

The full expanded palette (9 families × 3 tones: core/mid/light) lives in `tokens.json → colors.reports.expanded`. Use mid/light tints for chart fills and data tables — never as primary brand expression. Never use warm colors (coral/orange/yellow) for primary chrome.

---

## Typography — WEB system

web-v2 has **no single heading font**. ABC Diatype is the global default and carries most headings; DM Sans is the most explicitly-applied font (and powers hero display); Freight Text Pro is a small serif accent only.

**ABC Diatype** — primary / global default
- Body default (inherited everywhere), most headings, company names
- Licensed local webfont: `public/fonts/abc-diatype-variable.woff2` (variable). **Not** a Google/Slides font
- CSS var `--font-abc-diatype` → mapped to `--font-sans`

**DM Sans** — UI workhorse + display
- UI copy, form fields, dialog body, labels, AND hero/display headlines
- Free Google font (variable) — renders in Google Slides. The safest cross-surface font in the web system
- CSS var `--font-dm-sans-family`

**Freight Text Pro** — small editorial accent
- Source citations, signal links, footnotes (text-xs/sm). **Not** a display serif — never headings
- Licensed local webfont: `public/fonts/freight-text-pro-book.woff2`
- CSS var `--font-freight-text-pro-book`

**Web fallback stack:** `var(--font-abc-diatype), ui-sans-serif, system-ui, -apple-system, sans-serif`

### Web type scale
| Tier | Size | Weight | Leading | Tracking | Font | Use |
|------|------|--------|---------|----------|------|-----|
| Display | 48 (32 mobile) | 400 | 1.4 | 0.24px | DM Sans / ABC Diatype | Hero headlines |
| H1 | 30 | 700 | 1.2 | — | ABC Diatype | Utility/legal titles |
| H2 | 24 | 500 | 1.4 | 0.12px | ABC Diatype / DM Sans | Section headings |
| Subhead | 20 | 400 | 1.4 | — | ABC Diatype | Secondary headings, TOC |
| Lead | 18 | 500 | 1.4 | 0.12px | ABC Diatype | Lead / emphasis body |
| Body | 16 | 400 | 1.4 | 0.08px | ABC Diatype | Primary body |
| Body-sm | 14 | 400 | 1.5 | 0.07px | DM Sans | **Workhorse UI text** |
| Caption | 12 | 400 | 1.5 | 0.06px | DM Sans | Sub-labels, meta |
| Eyebrow | 10–12 | 600 | 1.0 | 0.14–0.25em | ABC Diatype, UPPERCASE | Kicker labels |
| Micro | 10 | 400 | 1.4 | — | DM Sans | Dense table text |

Tracking is small positive px that scales with size; eyebrows are the exception (em-based). Leading is `1.4` for body/headings, `1.5` (normal) for small UI text.

> **Tightening recommendation (open):** the web system would benefit from one designated heading font instead of the current ABC Diatype/DM Sans split across headings. Worth resolving with the designer; not yet decided.

---

## Typography — REPORTS / PRINT system

**Inter** (body/UI) + **Inter Tight** (headings). Both are native Google Slides fonts — Altis presentations and PDFs render without embedding, substitution, or reflow. This is a deliberate technical choice for the deck/print pipeline.

- Inter weights: 400 / 500 / 700 · Inter Tight weights: 500 / 600 / 700
- Fallback (web/CSS): `Inter, 'Inter Tight', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
- Fallback (email): `Inter, Arial, Helvetica, sans-serif`

### Reports type scale
| Style | Size | Weight | Font | Use |
|-------|------|--------|------|-----|
| Display | 48 | 700 | Inter Tight | Hero, major slide titles |
| H1 | 36 | 700 | Inter Tight | Page titles, report section headers |
| H2 | 28 | 600 | Inter Tight | Section headings |
| H3 | 22 | 600 | Inter Tight | Sub-headings |
| H4 | 18 | 600 | Inter Tight | Card titles |
| Body | 16 | 400 | Inter | Paragraphs, analysis |
| Small | 14 | 400 | Inter | Supporting text, footnotes |
| Label | 12 | 500 | Inter | Tags, badges |
| Caption | 11 | 400 | Inter | Captions, timestamps |

---

## Shared typography rules

- Sentence case everywhere — no ALL CAPS except very short labels / eyebrows (2–3 words)
- No periods at the end of bullet points
- Never mix more than two font families in a single document
- **Logo font is proprietary** (Neue Haas Grotesk Display Pro 65 Medium, embedded as outlines in the logo SVG) — never apply to any other text, never recreate the wordmark in type. For vendor tools that only offer a font list, see [Merch & promo](#merch--promo-vendor-printed)

---

## Radii & shape (web)

`8px` (md) is the default — cards, buttons, inputs, panels. Pills use `full`. Scale: `sm` 6 · `md` 8 (default) · `lg` 16 · `brand-md` 32 · `brand-lg` 64 (signature oversized radius on large feature/hero surfaces) · `full` 9999. Reports/print use the original `sm` 4 · `md` 8 · `lg` 16 · `xl` 24 scale.

## Buttons (web)

No shared Button component — composed inline; canonical pattern in `components/Paywalls/PaywallFooter.tsx`.

| Variant | bg | text | radius | size | font |
|---------|-----|------|--------|------|------|
| Primary | `#015AE9` | white | full (pill) | h-12 px-6 | ABC Diatype, medium |
| Secondary/dark | `#030D1F` | `#F6F7FA` | md (8px) | px-2 py-1 | DM Sans |
| Neutral/light | `#E8EDF5` | `#030D1F` | md (8px) | — | DM Sans |
| Destructive | `#B84040` | white | — | — | — |

Common: `text-sm`, `tracking-[0.07px]`, opacity- or `/90`-based hover; primary focus ring `#162840/40`.

## Layout (web)

Container max-width `1440px` (`mx-auto px-4`). Readable content columns nest inside at ~480–986px. Vertical section rhythm: `py-12` (48px) dominant, then `py-16` (64px), `py-24` (96px).

---

## Graphic Library

16 geometric abstract icons built from the same construction vocabulary as the Altis chevron mark — consistent stroke/fill weight, arc-based geometry, legible 16px–128px+.

**Construction rule:** *"Use this grid (or variations on it) to create new shapes informed by our logo design."* New icons must use only arcs, curves, and angles present in the existing set.

Icons: signal, echo, sweep, corner, crescent, arc, horizon, ring, stack, quarter, lens, orbit, target, brackets, peak, layers — see `tokens.json → graphic_library` for SVG paths and shape descriptions.

### Colorway rules
- **Light variant** (`icon-*-light.svg`): brand blue `#015AE9` fill — use on white/light backgrounds
- **Dark variant** (`icon-*-dark.svg`): white `#FFFFFF` fill — use on navy/blue backgrounds
- Never use icons in secondary/data-viz colors · never mix icon styles · never add shadows, strokes, or effects

---

## Patterns

- `pattern-light.svg` / `@2x.png` — icons on white, for light sections
- `pattern-blue.svg` / `@2x.png` — icons on brand blue, for dark sections

Use at 5–20% opacity as section backgrounds, report covers, or dividers. Never full opacity as a primary content background. Don't crop in ways that isolate individual icons.

---

## Photography

- Subjects: mountain peaks, bridges, infrastructure, upward perspective views
- Aesthetic: architectural, aspirational, precise framing. Never generic stock
- Treatments: **untreated** (editorial — reports, data) · **focus effect** (brand blue gradient overlay — marketing, hero, covers)

---

## Merch & promo (vendor-printed)

Screen print, embroidery, engraving, headwear, stickers, business cards — anything produced through a third party's design tool (Custom Ink, MOO). Color follows the **REPORTS / PRINT** system; logo variant rules above apply unchanged.

### Place the logo as art — never re-set it

Upload the SVG from `assets/logos/`. Do not rebuild the wordmark out of the vendor's type, even when the vendor's font list looks close. Every tool has an upload path (Custom Ink: Design Lab → Upload). Use 1C Positive/Reverse for single-color print, 1C Reverse on brand blue.

### When the vendor forces a font choice

Applies to secondary text only — tagline, names, back-of-garment copy. Never the wordmark.

The logo is set in Neue Haas Grotesk Display Pro 65 Medium, which *is* Helvetica: Miedinger drew it as Haas Grotesk in 1957, it was renamed Helvetica in 1960, and Neue Haas Grotesk Display is the 2010 revival of those original drawings. So the on-brand pick in any vendor library is Helvetica, in this order:

1. **Helvetica Bold** — listed as `Helvetica B` in Custom Ink. Closest to the wordmark and the safer weight in production
2. **Helvetica Regular** — listed as `Helvetica`. Right shapes, too light: thin strokes choke in knit and stitch
3. Anything else — Arial, Univers, Swiss 721 are near-misses, not matches, and read wrong beside the mark

The wordmark's 65 Medium sits between Regular and Bold, so neither cut is exact. **Default to Bold** — under-weighting is the failure mode that survives a screen proof and dies on the garment.

### Licensing

Check that a typeface's licence covers physical production *before* sending the file to a vendor — webfont and trial licences generally do not. This is a separate grant from the web licence the same family may already have.

### Open

Minimum stitched/printed logo size is not specified here — confirm with the vendor before the first embroidery run rather than reusing the 120px digital minimum.

---

## Voice Alignment

The visual brand and written voice should feel continuous: direct, confident, precise. No decoration for decoration's sake — every visual element earns its place. Structure over flourish; organized information is the product.
