# Altis LinkedIn Templates

Four layout templates for LinkedIn content. All use brand tokens from `tokens.json`.

---

## Canvas dimensions

| Format | Dimensions | Use for |
|--------|-----------|---------|
| Link post / landscape | 1200 × 627px | Report promotions, article shares |
| Square | 1080 × 1080px | Data highlights, quotes, insights |
| Portrait | 1080 × 1350px | Carousels, longer-form content |

---

## Universal rules

- **Logo:** bottom-right corner, 24px from edges, white reverse version on blue; dark version on white
- **Pattern:** use at 10–15% opacity maximum as background texture only — never as a dominant visual
- **Typography:** Inter Tight for headlines, Inter for body — both native to LinkedIn's renderer
- **Case:** sentence case throughout — no ALL CAPS except very short labels (2–3 words)
- **No periods** at the end of bullet points or callout text
- **Minimum font size:** 16px for body, 24px for headlines — smaller text becomes illegible on mobile

---

## Template 1 — Data highlight

**Best for:** Leading with a striking statistic. The most scroll-stopping format.

**Canvas:** 1080 × 1080px (square)

```
┌─────────────────────────────────────────┐
│                                         │
│   [pattern texture at 12% opacity]      │
│                                         │
│         73%                             │  ← stat: Inter Tight, 120–140px, white
│                                         │
│   of Series A investors cite            │  ← context: Inter, 22px, white 85%
│   diligence quality as a top 3          │
│   decision factor                       │
│                                         │
│   ─────────────────────────             │  ← cyan divider line, 2px
│                                         │
│   Altis Series A Intelligence Report   │  ← source: Inter, 14px, white 60%
│                                   [logo]│
└─────────────────────────────────────────┘
```

**Spec:**
- Background: brand blue `#015AE9`
- Stat number: Inter Tight, 120–140px, 700 weight, white
- Stat label: Inter, 22–26px, 400 weight, white at 85%
- Source line: Inter, 13–14px, white at 60%
- Divider: cyan `#01B2F4`, 2px height, 60px width
- Pattern: `pattern-blue.svg` at 10% opacity, full-bleed

---

## Template 2 — Quote card

**Best for:** Founder quotes, investor reactions, interview pull quotes.

**Canvas:** 1080 × 1080px (square)

```
┌─────────────────────────────────────────┐
│ ▌                                       │  ← brand blue left bar, 6px wide
│ ▌                                       │
│ ▌  "The companies that win Series A     │  ← quote: Inter Tight, 26–32px, navy
│ ▌   aren't the ones with the best       │
│ ▌   deck — they're the ones who can     │
│ ▌   answer every hard question."        │
│ ▌                                       │
│    — Chris Freeberg                     │  ← attribution: Inter, 16px, gray
│      Founder & CEO, Altis               │
│                                         │
│                                   [logo]│
└─────────────────────────────────────────┘
```

**Spec:**
- Background: white `#FFFFFF`
- Left accent bar: brand blue `#015AE9`, 6px wide, full height
- Quote text: Inter Tight, 26–32px, 600 weight, navy `#030F1F`
- Opening quote mark: Inter Tight, 96px, blue `#015AE9` at 15% opacity
- Attribution name: Inter, 16px, 500 weight, navy
- Attribution title: Inter, 14px, 400 weight, gray `#7A8899`
- Logo: dark positive version, bottom-right

---

## Template 3 — Report promotion

**Best for:** Announcing a new Altis report or research piece.

**Canvas:** 1200 × 627px (landscape)

```
┌──────────────────────┬──────────────────────────────┐
│                      │                              │
│  [REPORT THUMBNAIL]  │  New research                │  ← eyebrow: Inter, 13px, blue
│  (left 45% of card)  │                              │
│                      │  Company Name: Series A      │  ← title: Inter Tight, 28–32px
│                      │  Diligence Overview          │
│                      │                              │
│                      │  Key finding: [one sentence  │  ← body: Inter, 16px, navy
│                      │  from the report]            │
│                      │                              │
│                      │  → Read the full report      │  ← CTA: Inter, 14px, blue
│                      │                         [logo]│
└──────────────────────┴──────────────────────────────┘
```

**Spec:**
- Left panel: report thumbnail image or blue bg with title text
- Right panel: white background
- Eyebrow: Inter, 13px, 500 weight, brand blue, UPPERCASE, letter-spacing 0.06em
- Title: Inter Tight, 28–32px, 700 weight, navy
- Body: Inter, 16px, 400 weight, navy
- CTA: Inter, 14px, 500 weight, brand blue, with → arrow
- Vertical divider: gray `#E8ECF2`, 1px
- Logo: dark positive version, bottom-right of right panel

---

## Template 4 — Insight teaser

**Best for:** Driving traffic to a report with 2–3 extracted insights.

**Canvas:** 1080 × 1080px (square) or 1080 × 1350px (portrait for more bullets)

```
┌─────────────────────────────────────────┐
│ [top bar — brand blue, 8px]             │
│                                         │
│  3 things we learned about              │  ← headline: Inter Tight, 32–36px, navy
│  Series A market dynamics               │
│                                         │
│  ──────────────                         │  ← blue accent line
│                                         │
│  01  Deal velocity is down 18%          │  ← numbered insight: Inter, 18px, navy
│      year-over-year                     │
│                                         │
│  02  Diligence timelines have           │
│      compressed to under 3 weeks        │
│                                         │
│  03  Technical founders are closing     │
│      at 2.4× the rate of repeat        │
│      founders                           │
│                                         │
│  Read the full report at altis.co  [logo]│ ← footer CTA: Inter, 13px, gray
└─────────────────────────────────────────┘
```

**Spec:**
- Background: white `#FFFFFF`
- Top accent bar: brand blue `#015AE9`, 8px
- Headline: Inter Tight, 32–36px, 700 weight, navy
- Accent line: brand blue, 2px, 48px wide
- Numbers (01/02/03): Inter Tight, 14px, 700 weight, blue `#015AE9`
- Insight text: Inter, 18px, 400 weight, navy
- Footer CTA: Inter, 13px, gray `#7A8899`
- Logo: dark positive version, bottom-right

---

## Pattern usage guidance

| Template | Pattern use |
|----------|------------|
| Data highlight | Full-bleed at 10–12% opacity |
| Quote card | None (clean white bg) |
| Report promotion | Optional on left panel only, 8% opacity |
| Insight teaser | None (clean white bg) |

## Production workflow

1. Start from the LinkedIn Graphics page in the Figma Brand Toolkit
2. For new graphics: use hex values from `tokens.json`, Inter + Inter Tight fonts
3. Export as PNG for LinkedIn (JPG compression degrades text edges)
4. Recommended tools: Figma (templates live there), Canva with custom brand kit
