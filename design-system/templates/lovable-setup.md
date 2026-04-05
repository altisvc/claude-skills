# Altis Lovable Setup Guide

Brand-compliant Lovable project in under 5 minutes. Follow these four steps in order.

---

## Step 1 — Lovable system prompt (paste first)

Paste this into the Lovable project settings → "Project instructions" or the initial system prompt field before writing any code.

```
You are building a web application for Altis, a venture intelligence platform. Apply the Altis design system exactly as specified below. Do not invent colors, fonts, or spacing outside this system.

COLORS
Primary blue (hero elements, buttons, links): #015AE9
Navy (dark backgrounds, body text): #030F1F
Cyan (accent only, never primary background): #01B2F4
White (light backgrounds, reverse text): #FFFFFF

Supporting palette (charts and data viz only — not UI chrome):
  Purple: #814DC6 | Teal: #00A6A6 | Coral: #FF6663 | Orange: #F28C59
  Yellow: #F2DA3D | Green: #4BD66A

UI surface colors:
  Page background: #F0F2F5
  Card background: #FFFFFF
  Border: #E8ECF2
  Text secondary: #3D4E63
  Text muted: #7A8899

TYPOGRAPHY
Headlines, section headers, card titles: Inter Tight (600–700 weight)
  Fallback stack: 'Inter Tight', Inter, system-ui, -apple-system, 'Segoe UI', sans-serif

Body text, bullets, labels, captions, buttons: Inter (400–500 weight)
  Fallback stack: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif

Font import (add to index.html or global CSS):
  https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700&display=swap

Font sizes: display 48px | h1 36px | h2 28px | h3 22px | h4 18px | body 16px | small 14px | label 12px | caption 11px

SPACING
Base unit: 8px. Use multiples: 4 | 8 | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64 | 80 | 96px

BORDER RADIUS
Default cards/inputs: 8px | Small chips/tags: 4px | Large panels: 16px | Pills: 9999px

BUTTONS
Primary: background #015AE9, text white, 600 weight, 8px radius, padding 14px 24px, no border
Hover state: darken background to #0148C4 (10%)
No outline/ghost buttons as primary actions — use only for secondary/destructive

CARDS
Background: white (#FFFFFF)
Border: 1px solid #E8ECF2
Border radius: 8px
Padding: 24px
Hover shadow: 0 4px 16px rgba(3,15,31,0.08)

TEXT RULES
Sentence case for all UI text — no ALL CAPS headlines (labels/tags: max 2–3 words OK in caps)
No periods at the end of bullet points or list items
Minimal punctuation in headings

LOGO
Never recreate the Altis logo in code. Use the SVG files from design-system/assets/logos/.
On white background: altis-logo-2c-positive.svg
On blue/navy background: altis-logo-2c-reverse.svg
```

---

## Step 2 — Global CSS (paste into your global stylesheet)

Paste this into `src/index.css` or `src/global.css` (replace the top of the file, keeping any Tailwind directives you already have).

```css
/* Google Fonts — Inter + Inter Tight */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Inter+Tight:wght@500;600;700&display=swap');

/* Altis Design System — CSS Custom Properties */
:root {
  /* Core colors */
  --color-navy:  #030F1F;
  --color-blue:  #015AE9;
  --color-cyan:  #01B2F4;
  --color-white: #FFFFFF;

  /* Secondary colors */
  --color-purple: #814DC6;
  --color-teal:   #00A6A6;
  --color-coral:  #FF6663;
  --color-orange: #F28C59;
  --color-yellow: #F2DA3D;
  --color-green:  #4BD66A;

  /* Expanded — Blue family */
  --color-blue-mid:   #4089FF;
  --color-blue-light: #AAC5F2;

  /* Expanded — Navy family */
  --color-navy-mid:   #0A3166;
  --color-navy-light: #0F4A99;

  /* Expanded — Cyan/Sky family */
  --color-sky-mid:   #86D6F4;
  --color-sky-light: #ACD6E5;

  /* UI surfaces */
  --color-bg:          #F0F2F5;
  --color-surface:     #FFFFFF;
  --color-border:      #E8ECF2;
  --color-text-body:   #030F1F;
  --color-text-mid:    #3D4E63;
  --color-text-muted:  #7A8899;

  /* Typography */
  --font-primary: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-heading: 'Inter Tight', Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;

  /* Font sizes */
  --text-display: 48px;
  --text-h1:      36px;
  --text-h2:      28px;
  --text-h3:      22px;
  --text-h4:      18px;
  --text-body:    16px;
  --text-small:   14px;
  --text-label:   12px;
  --text-caption: 11px;

  /* Font weights */
  --weight-regular: 400;
  --weight-medium:  500;
  --weight-bold:    700;

  /* Spacing (8px base) */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* Border radius */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-full: 9999px;
}

/* Base reset */
*,
*::before,
*::after { box-sizing: border-box; }

body {
  font-family: var(--font-primary);
  font-size: var(--text-body);
  line-height: 1.6;
  color: var(--color-text-body);
  background-color: var(--color-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: var(--weight-bold);
  line-height: 1.2;
  color: var(--color-navy);
}

/* Primary button */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-primary);
  font-size: var(--text-body);
  font-weight: var(--weight-medium);
  color: #FFFFFF;
  background-color: var(--color-blue);
  border: none;
  border-radius: var(--radius-md);
  padding: 14px 24px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.15s ease;
}
.btn-primary:hover { background-color: #0148C4; }

/* Card */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  transition: box-shadow 0.15s ease;
}
.card:hover { box-shadow: 0 4px 16px rgba(3, 15, 31, 0.08); }
```

---

## Step 3 — Tailwind config `theme.extend` (if using Tailwind)

If your Lovable project uses Tailwind CSS, paste this into your `tailwind.config.js` or `tailwind.config.ts` as the `theme.extend` block.

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core
        'altis-navy':  '#030F1F',
        'altis-blue':  '#015AE9',
        'altis-cyan':  '#01B2F4',
        'altis-white': '#FFFFFF',

        // Secondary
        'altis-purple': '#814DC6',
        'altis-teal':   '#00A6A6',
        'altis-coral':  '#FF6663',
        'altis-orange': '#F28C59',
        'altis-yellow': '#F2DA3D',
        'altis-green':  '#4BD66A',

        // Expanded — Navy family
        'altis-navy-dark':  '#030F1F',
        'altis-navy-mid':   '#0A3166',
        'altis-navy-light': '#0F4A99',

        // Expanded — Blue family
        'altis-blue-core':  '#015AE9',
        'altis-blue-mid':   '#4089FF',
        'altis-blue-light': '#AAC5F2',

        // Expanded — Cyan/Sky family
        'altis-sky-core':  '#01B2F4',
        'altis-sky-mid':   '#86D6F4',
        'altis-sky-light': '#ACD6E5',

        // Expanded — Other families
        'altis-teal-core':   '#00A6A6',
        'altis-teal-mid':    '#60BFBF',
        'altis-teal-light':  '#A3D9D9',
        'altis-purple-core': '#814DC6',
        'altis-purple-mid':  '#AD92D1',
        'altis-purple-light':'#DECEF2',
        'altis-coral-core':  '#FF6663',
        'altis-coral-mid':   '#FF8987',
        'altis-coral-light': '#FFC0BF',
        'altis-orange-core': '#F28C59',
        'altis-orange-mid':  '#F2A985',
        'altis-orange-light':'#FFCCB2',
        'altis-yellow-core': '#F2DA3D',
        'altis-yellow-mid':  '#F2E279',
        'altis-yellow-light':'#F2ECC2',
        'altis-green-core':  '#4BD66A',
        'altis-green-mid':   '#82ED9A',
        'altis-green-light': '#B8F5C5',

        // UI surfaces
        'altis-bg':         '#F0F2F5',
        'altis-surface':    '#FFFFFF',
        'altis-border':     '#E8ECF2',
        'altis-text-mid':   '#3D4E63',
        'altis-text-muted': '#7A8899',
      },

      fontFamily: {
        // Body text, bullets, captions, UI elements
        'altis-primary': ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        // Headlines, section headers, card titles
        'altis-heading': ['Inter Tight', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        // NOTE: The Altis wordmark uses a proprietary display font in the logo SVG.
        // Never apply it to any text. Use the SVG logo files only.
      },

      fontSize: {
        'altis-display': ['48px', { lineHeight: '1.1' }],
        'altis-h1':      ['36px', { lineHeight: '1.15' }],
        'altis-h2':      ['28px', { lineHeight: '1.2' }],
        'altis-h3':      ['22px', { lineHeight: '1.25' }],
        'altis-h4':      ['18px', { lineHeight: '1.3' }],
        'altis-body':    ['16px', { lineHeight: '1.6' }],
        'altis-small':   ['14px', { lineHeight: '1.5' }],
        'altis-label':   ['12px', { lineHeight: '1.4' }],
        'altis-caption': ['11px', { lineHeight: '1.4' }],
      },

      spacing: {
        'altis-1':  '4px',
        'altis-2':  '8px',
        'altis-3':  '12px',
        'altis-4':  '16px',
        'altis-5':  '20px',
        'altis-6':  '24px',
        'altis-8':  '32px',
        'altis-10': '40px',
        'altis-12': '48px',
        'altis-16': '64px',
        'altis-20': '80px',
        'altis-24': '96px',
      },

      borderRadius: {
        'altis-sm':   '4px',
        'altis-md':   '8px',
        'altis-lg':   '16px',
        'altis-xl':   '24px',
        'altis-full': '9999px',
      },
    },
  },
  plugins: [],
};
```

**Usage examples:**
```html
<!-- Button -->
<button class="bg-altis-blue text-white font-altis-primary font-medium
               rounded-altis-md px-altis-6 py-altis-4 hover:bg-blue-700">
  Get started
</button>

<!-- Card -->
<div class="bg-altis-surface border border-altis-border rounded-altis-md p-altis-6
            hover:shadow-md transition-shadow">
  <h3 class="font-altis-heading text-altis-h3 text-altis-navy">Card title</h3>
  <p class="font-altis-primary text-altis-body text-altis-navy mt-altis-2">Body text here</p>
</div>

<!-- Section headline -->
<h1 class="font-altis-heading text-altis-h1 text-altis-navy font-bold">
  Section headline in sentence case
</h1>
```

---

## Step 4 — Adding Altis SVG icons to a Lovable project

**Available icons** (16 total):
`signal` `echo` `sweep` `corner` `crescent` `arc` `horizon` `ring`
`stack` `quarter` `lens` `orbit` `target` `brackets` `peak` `layers`

**Two colorways per icon:**
- `icon-[name]-light.svg` — blue fill (`#015AE9`), use on white/light backgrounds
- `icon-[name]-dark.svg` — white fill (`#FFFFFF`), use on blue/navy backgrounds

**Method A — Copy SVG files into your project (recommended for Lovable)**

1. Copy the entire `design-system/assets/icons/` directory into your Lovable project's `public/` or `src/assets/` folder
2. Reference in code:
```html
<!-- HTML -->
<img src="/icons/icon-signal-light.svg" alt="" aria-hidden="true" width="24" height="24">
```
```jsx
// React/JSX
<img src="/icons/icon-signal-light.svg" alt="" aria-hidden width={24} height={24} />
```

**Method B — Inline SVG (for color theming via CSS)**

1. Open the icon SVG file, copy the inner `<svg>` element
2. Paste inline — this lets you use `currentColor` fills:
```jsx
// Change fill="currentColor" in the SVG then control via CSS
<span className="text-altis-blue">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    {/* paste path data here */}
  </svg>
</span>
```

**Sizing rules:**
- Navigation / inline: 20×20px
- Feature icons / cards: 32×32px or 40×40px
- Hero / large callout: 48–64px
- Never rescale disproportionately or apply CSS filters that alter the fill color

**Never do:**
- Recolor icons outside the two approved colorways
- Use both light and dark variants on the same background
- Apply drop shadows, strokes, or other effects to icon SVGs

---

## Quick reference — brand decisions at a glance

| Decision | Correct choice |
|----------|---------------|
| Primary button color | `#015AE9` (brand blue) — never cyan or navy |
| Body font | Inter, 400–500 weight |
| Headline font | Inter Tight, 600–700 weight |
| Heading case | Sentence case — first word capitalised only |
| Bullet endings | No period |
| Card background | White `#FFFFFF` with `#E8ECF2` border |
| Page background | `#F0F2F5` (light blue-gray) |
| Logo on white | `altis-logo-2c-positive.svg` |
| Logo on blue/dark | `altis-logo-2c-reverse.svg` |
| Cyan usage | Accent only — dividers, highlights, active states. Never primary bg |
| Data viz colors | Use expanded palette in order: blue → cyan → teal → purple → coral → orange → yellow → green |

---

*Source: `design-system/tokens.json` + `design-system/brand-guidelines.md` — extracted from Figma `NRmjBmJBIGJj5DTw3Lfe4a` on 2026-03-01.*
