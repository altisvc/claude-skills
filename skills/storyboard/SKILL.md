---
name: storyboard
description: Turns a finished to-camera script into a shot-by-shot storyboard for Altis short-form videos — branded overlays, burned-in captions, the recurring question card, and the end card, prescriptive enough to build in Descript without follow-up questions.
slash_command: /storyboard
---

# Storyboard — Altis Short-Form Video

Take a finished to-camera script (or the outline from the script agent) and design the visuals that go over the shoulder / on screen for an Altis short-form video. The video is an outline — two points → the one question → the close, delivered naturally — so the storyboard is **light**: a supporting visual per point, the recurring branded **"The question to be asking"** card at the question moment, burned-in captions, and the end card. Do not over-produce. That's usually 3–5 overlays total for the whole video.

The output is a build sheet: someone should be able to assemble the video in Descript from it without asking a single question.

## Input

- A finished to-camera script, or the outline from the script agent (two points → the question → the close).
- The report PDF the video is based on, when there is one — attach it so you can reference actual pages as b-roll.
- Optional: a news peg (a raise, a launch) to open on a real press headline.

## Visual theme — use the Altis brand

Style every on-screen element to the Altis brand (`brand/README.md` distilled, or the full `tokens.json`). This is the **WEB** color system.

### House style (default to these — from Chris's editor pass)

- **No background boxes / bars / pills.** On-screen text is just **white text** over the footage (soft shadow for legibility). Brand blue `#015AE9` for emphasis (a stat number, a kicker word).
- **Single-word emphasis (a "kicker" like COMMODITY):** brand blue, ALL CAPS, placed **above Chris** — do NOT cut away from him to show it.
- **Diagrams / multi-part graphics → a contained white PANEL, not floating text and not full-frame.** Any explanatory graphic with more than one element (a pipeline, a before/after, a small comparison) goes in a **rounded white horizontal card with a soft drop shadow** that sits **over the footage** (below Chris, or across his face) — so it reads as a designed object while keeping him on screen (no cut). On the white panel: dark ink text (`#030D1F`), brand blue for the eyebrow and the one emphasized token, slate labels. Auto-fit the widest row so nothing clips. This is the `pipeline` style in `production/make_cards.py` — reuse that panel treatment for any diagram.
- **Layering (Descript) — overlays always on TOP.** Every overlay asset (logos, cards, panels, report crops, the cover band, captions) goes on the topmost layer, above the footage and above each other, so each stays directly selectable. Never bury an overlay. When two overlays share a moment, stack them (don't merge) so they can be nudged, retimed, or restyled solo.
- **Logos: go BIG and keep them editable.** The centered company logo should be **large — roughly ⅔ of the frame width (~680px on 1080)**, not a small mark. For anything to be resized/repositioned by hand (esp. logos), hand over the **tight logo file** (`logos/logo-<company>-<color>.png` — just the logo on transparent), which drops in as a scalable, draggable object on the top layer. The pre-placed full-canvas `00-logo` overlay is the "correct default position," but the tight file is what gets edited directly. Logos: transparent white, no chip; 2C positive on white, 2C reverse on navy/blue; min 120px wide, keep clear space.
- **Nothing overlaps the full-frame question card.** The blue-gradient question card is a hard cut off Chris — no other card, logo, or deck crop plays over that blue background. Supporting cards resume only after it clears and we're back on Chris.
- **Overlay placement (confirmed on the final cut):** sit overlays and panels **mid-frame, over his shirt**, roughly across the chest — not forced into the lower third. The chest is the cleanest backing and the baked dark halo keeps text legible. Keep them out of the caption zone below.
- **Check the shirt color each shoot — it changes the overlay/logo color.** White tee (ElevenLabs) → dark/black logos read; black Altis quarter-zip (Town) → **white** logos and text read. Look at the actual take and pick the variant that contrasts with his chest. Keep both a black and a white variant of each pulled logo.
- **Opening hook — lead with a real press headline when there's a news peg.** For a news-pegged Breadth (a raise, a launch), open on a **screenshot of the actual headline** (e.g. a Bloomberg card, full-width top) rather than a plain stat card. It hooks harder and publicly sources the number, so it's altitude-safe. When the headline already states the figure, it **replaces** the standalone stat card (don't do both).
- **Timing — cap 5 seconds.** No overlay (logo, kicker, diagram, stat) stays on screen longer than **5 seconds**. If a point needs longer, cut back to Chris full-frame and re-pop later. Most overlays should be 2–4s; a quick fact can be a 2–3s pop. One exception: the full-frame **question card** may hold ~6s, because it's a hard cut the viewer has to read.
- **Close on the black end card** (see "The close"): `Rise Above the Noise` / `altis.vc/research`. Prefer holding a logo longer over stacking a text card next to it.
- **Report-page b-roll stays as-is** — it's a deck screenshot, already in the reports font system.

### Colors — use these exact hexes (WEB system)

- **Brand blue `#015AE9`** — the hero. All accents, emphasis, kicker words, and the question-card eyebrow.
- **Question-card gradient:** highlight `#228CFA` (top-right) → shadow `#023AB0` (bottom-left). (Matches `BLUE_HI` / `BLUE_LO` in `production/make_cards.py`.)
- **Cyan `#02B3F4`** — tiny eyebrow labels only, never a background or emphasis.
- **Ink-900 `#030D1F`** — dark backgrounds and dark text on the white diagram panel.
- **Ink-700 `#162840`** — body text on light. **Slate-500 `#5C6F80`** — muted labels / arrows.
- **White `#FFFFFF` / page `#F6F7FA`** — light backgrounds. **Black `#000000`** — the end card only.
- **Bull `#21A87A` / bear `#E84040`** — signals only.
- Never use the reports data-viz palette (purple / coral / orange / yellow) as chrome.

**Type:** DM Sans for all on-screen text (cross-surface safe). Sentence case; no ALL CAPS except short eyebrows; no periods on short labels; never more than two font families.

**Feel:** direct, confident, precise — lots of whitespace, restrained color, one recurring template so the audience learns the format.

## Closed captions — ALWAYS on (every video)

Every Altis short ships with **burned-in closed captions** of Chris's speech. Short-form is watched sound-off, so captions are non-negotiable — include them in every storyboard by default; never omit them.

- **Source:** Descript auto-transcribes the take; correct any errors against the script, then style.
- **Style (confirmed on the final cut):** DM Sans **bold, ALL CAPS**, white, with the same baked **dark halo** (so they read on his white shirt / a bright window). No box. 1–2 lines at a time, active-word / phrase level. **Emphasize exactly one keyword per caption in brand blue `#015AE9`** (e.g. "ELEVENLABS is raising again", "the CLEAR LEADER", "ORCHESTRATION layer") — same blue as the on-screen kickers, so captions and overlays feel like one system. Never colour more than one word per line.
- **Placement:** centered, in a **fixed safe zone raised into the lower-MID frame (~62–70% down), NOT the bottom third.** Platforms (LinkedIn especially) overlay their own caption/UI across the bottom, which covers text placed too low. Captions and other overlays must not collide: when a lower overlay or a stat pop lands, nudge captions or hold the overlay higher so both stay readable. The **full-frame question card and the black end card suppress captions** while they're up (the card carries its own text). Keep captions clear of the bottom ~20% of the frame.

Note this caption track once in the storyboard (it runs the whole video); you don't need a row per line.

## Opening cover (every video — STANDARD, locked)

**There is NO separate cover screen — no black frame, no title card, no held poster.** The video **opens on the live first shot of Chris talking**, and we overlay two things on that live footage for a beat:

1. the **blue "The question to be asking" band** pinned to the **top** of the frame (`cover.png`), and
2. the **subject company's logo, centered over his chest** (`00-logo-<company>.png`).

- **Timing:** both come up **at 0:00 on the first frame and clear at ~0:00.3** (the first third of a second — long enough to register, short enough that we're immediately just watching Chris). Do NOT hold a static cover frame; Chris is live and talking underneath.
- **The band** (`#015AE9`) sits flush at the top (y=0, full width, ~255px / top ~13%), subtle brand pattern inside, **white Altis logo top-left**, **"The question to be asking"** in large white bold. Only the Altis logo + the line live in the band — the company logo is NOT in the band.
- **The company logo** is centered over Chris's chest. Pick the variant that contrasts his shirt — black on a white tee, white on the dark quarter-zip.
- **In Descript:** on the very first clip, add `cover.png` and `00-logo-<company>.png` as full-frame overlays starting at 0:00, ending at ~0:00.3 (a quick fade is fine). Both are 1080×1920 PNGs already placed — don't reposition. Keep this identical across every video so the feed reads as one series.

## The video's fixed shape (keep it simple)

The outline is: Point 1 → Point 2 → the question → the close. Map visuals to that, and only that.

- **Point 1 and Point 2:** Chris on camera, with **at most one supporting visual each** — a stat kicker, a logo, or a single report-page crop. When in doubt, keep him full-frame and add nothing.
- **The question — the one fixed, recurring beat.** When Chris asks the question, bring up the branded **"The question to be asking"** card (the design-team toolkit `brand/question-card-system/`, rendered by `production/make_cards.py` style `question_card`). Spec: full-bleed **blue-gradient** card (navy / white / photo variants also approved), white Altis lockup top-left, **"The question to be asking"** eyebrow, then the question as a big left-aligned headline. **Headline 3 lines max — keep it short.** If the spoken question is long, the card carries a compressed version. It's a hard cut off Chris — hold ≤5s, then cut back. Every Altis video uses this same card so the audience learns it.
  - **Punch, then shift to the visual (preferred when the question names a showable concept).** Rather than parking on the card for the full ~6s, play it as a short **~3s branded punch** — long enough to read the line — then **shift straight into a supporting visual that unpacks the question** (e.g. the question raises "speech-to-speech" → shift to the speech-to-speech pipeline panel). Keeps energy up and lets the visual explain. Still hold the card long enough to register as the recurring beat.
- **The close — the black end card**, only at the very end, **after Chris stops talking** — never while he's still speaking. Black screen, centered white Altis logo, **"Rise Above the Noise"**, then **"altis.vc/research"** below. Hold ~2 seconds, then out. (Rendered by `make_cards.py` `end_card`.)

If you're specifying more than one visual per point, cut back.

## Be prescriptive within that shape

Vague direction is a failure. Never write "a text card here" or "some b-roll." For each beat of the script, give a row with:

1. **Beat #**
2. **Timecode** — start–end (e.g. `0:06–0:16`). Timecodes must be continuous and sum to the runtime.
3. **Spoken line** — the exact words from the script, verbatim, that this beat covers.
4. **On-screen text** — the exact copy that appears, verbatim, as it should be typed. If nothing appears, write "none (Chris full-frame)."
5. **Visual** — talking-head / text card / report page / logo / chart / b-roll.
6. **Source or prompt** — for a report page: the deck name, page number, and exactly what to crop to. For a logo: which logo. For generated b-roll: the exact prompt (subject, style, mood, 9:16).
7. **Duration** — in seconds.
8. **Transition** — cut / hold / punch-in.

Also specify where the overlay sits (lower third / right half / full frame) and when it clears.

## Use the report itself as b-roll (important)

The report PDF is a primary visual source — like Claire Zau cutting to a chart mid-sentence. Wherever the script cites a number or a finding, prefer **showing the actual report page** (a clean screenshot, or a zoom-in on one chart/table) over generating decorative b-roll. Name the **page number** and what to crop to. Strong candidates: boxed "Altis Takeaway" / "Key debate" callouts, market-size and trend charts, comparison tables, survey-result slides.

For a **Depth** ("sneak peek") video, build the visuals around a **single hero report page** — the one chart, table, or quote the whole script hinges on — and let it stay on screen.

## Flag pages to include and to avoid (do this explicitly)

Go through the report and produce two lists:

- **Show these pages** — the specific pages worth putting on screen, each with the page number, what to crop to, and the script line it backs.
- **Do NOT show these pages** — pages to keep off screen, with a one-word reason: leaks paywalled data (survey internals, the verdict, deal specifics), too dense to read in a short clip, off altitude, or visually messy. When a page is borderline, default to excluding it.

Be decisive — this is what the downstream production build works from.

## Rules

- **No overlay stays up more than 5 seconds** (see house style). The black end card appears only after Chris finishes talking, for ~2s. Never overlap it with his voice.
- Default to **report pages, simple text cards, and real data** over decorative b-roll; only generate b-roll where it genuinely adds energy.
- Every stat that appears on screen must trace back to something the script is allowed to say (respect the altitude rules — no leaking paywalled data into a chart).
- Keep cuts minimal; the script is single-take, so visuals should support, not chop it up.

## Output format

1. **Captions line** — state that burned-in closed captions run the full video (style + safe zone above).
2. A table: Beat # | Timecode | Spoken line (verbatim) | On-screen text (verbatim) | Visual | Source or prompt | Duration | Transition.
3. **Pages to show** — deck, page #, exact crop, and the script line it backs.
4. **Pages to avoid** — deck, page #, one-word reason (leaks / too dense / off-altitude / messy).
5. **Runtime check** — durations sum to the script's target runtime.

## Confirmed template — ElevenLabs Breadth final cut (the first shipped video)

Bank these as defaults:

- **Press-headline opener works.** Led on a Bloomberg card ("ElevenLabs in Talks on Tender Offer at $22B Valuation") — strong hook, public sourcing, replaced the stat card.
- **Captions = ALL CAPS, bold, white, one brand-blue keyword per line.** The house caption look; reads as one system with the kicker/emphasis words.
- **Overlays live mid-frame over the shirt.** Logo, pipeline panel, and report cards all sat across the chest and read cleanly with the baked halo. Lower-third was reserved for captions.
- **Cover band opener is the standard, locked opener** — blue header band ("The question to be asking" + Altis logo) across the top of Chris's first frame.
- **Full sequence that shipped (~43s):** cover band on frame 1 → press headline → company logo → (Point 1 to camera) → framework card (narrow, low) → question card (full-frame blue, ~2s) → back to camera → speech-to-speech panel (mid-frame) → close to camera → black end card.
- **Watch small crops:** a narrow framework crop reads tiny without a punch-in — either punch in or use an on-brand vertical treatment.
