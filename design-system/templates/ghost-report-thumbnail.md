# Altis Ghost Report Thumbnail Spec

Thumbnail templates for Ghost post covers and social sharing cards.

---

## Canvas dimensions

| Use case | Dimensions | Notes |
|----------|-----------|-------|
| Social sharing (OG image) | 1200 × 630px | Twitter, LinkedIn link previews |
| Ghost post card | 800 × 450px | 16:9, shown on index pages |
| Ghost feature image (wide) | 1600 × 900px | Full-width hero inside post |

---

## Layout structure

```
┌─────────────────────────────────────────────────────┐
│ [ALTIS LOGO]                          [DATE]         │  ← top bar, 72px
│─────────────────────────────────────────────────────│
│                                                      │
│                                                      │
│        [REPORT TITLE — centered, 2–3 lines]         │  ← center zone
│        [SUBTITLE or company name]                    │
│                                                      │
│                                                      │
│─────────────────────────────────────────────────────│
│ [SERIES TYPE / TAG]               [altis.co]         │  ← bottom bar, 48px
└─────────────────────────────────────────────────────┘
```

---

## Color variants

### Variant A — Blue background (primary, recommended)
- Background: brand blue `#015AE9`
- Title text: white `#FFFFFF`
- Subtitle text: white at 75% opacity
- Logo: white version (`altis-logo-2c-reverse.svg`)
- Bottom bar: navy `#030F1F` at 40% opacity overlay
- Use for: Day 10 reports, primary research, featured content

### Variant B — White background (secondary)
- Background: white `#FFFFFF`
- Title text: navy `#030F1F`
- Accent bar (top 4px): brand blue `#015AE9`
- Logo: dark version (`altis-logo-2c-positive.svg`)
- Use for: news updates, process memos, lighter content

---

## Typography

| Element | Font | Size | Weight | Case |
|---------|------|------|--------|------|
| Report title | Inter Tight | 48–56px (scale to fit) | 700 | Sentence case |
| Subtitle / company | Inter | 22–26px | 400 | Sentence case |
| Series label | Inter | 13px | 500 | UPPERCASE |
| Date | Inter | 13px | 400 | e.g. "March 1, 2026" |
| Logo (if text) | Inter Tight | 20px | 700 | ALTIS |

---

## Pattern overlay

- Use `pattern-blue.svg` or `pattern-light.svg` from `assets/patterns/`
- Opacity: 6–10% maximum — subtle texture only, never obscure text
- Position: full-bleed behind content, or anchored to one corner
- On blue background: use the blue pattern variant (white icons, low opacity)

---

## Photo treatment

- Use focus-effect photo (`assets/photos/photo-focus-effect.jpg`) for editorial/market reports
- Apply brand blue gradient overlay at 60–70% opacity before adding text
- Use untreated photo only if the image is abstract enough not to distract
- Never use photos without a color treatment on a thumbnail — text legibility degrades

---

## Logo placement

- Top-left: 32–40px from edges
- Minimum clear space: equal to the height of the chevron mark on all sides
- On blue bg: white reverse logo
- On white bg: dark positive logo
- Never place logo on a photo without a solid color overlay beneath it

---

## Production notes

- Export as JPG (quality 90%) for social OG images — PNG adds unnecessary size
- Export as PNG for Ghost post card if transparency is needed
- Ghost recommends a minimum of 1000px wide for feature images
- Canva, Figma, or any design tool works — use hex values from `tokens.json`
- The Ghost Report Thumbnail Graphics page in the Figma file has live templates
  (`ppt/slides/Ghost Report Thumbnail Graphics` — node IDs: Lovable 120:222,
  David AI 200:2, Elevenlabs 120:227, Cartesia 121:249)
