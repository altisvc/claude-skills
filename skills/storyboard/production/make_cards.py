#!/usr/bin/env python3
"""Altis short-form video card generator — Simile Breadth.

Rebuilt from the storyboard skill spec (the ElevenLabs-era toolkit is not on
this machine). Renders every overlay in the storyboard as a drag-in-ready PNG.

Outputs (1080x1920 unless noted):
  cover.png                  blue top band: Altis lockup + "The question to be asking"
  00-logo-simile.png         full-canvas white Simile wordmark over chest
  logo-simile-white.png      tight wordmark, transparent (the editable file)
  question-card.png          full-bleed blue-gradient question card
  end-card.png               black end card
  kicker-up-to-10x-white.png tight kicker w/ baked halo (black-shirt variant)
  kicker-up-to-10x-blue.png  tight kicker, brand-blue variant
  crop-p22-method.png        report p.22 steps 2-6, rounded + shadow
  crop-p8-synthetic.png      report p.8 synthetic-respondents box, rounded + shadow
  thumb-p1-cover.png         report cover thumbnail, rounded + shadow
"""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "src"
OUT = ROOT / "assets"
FONTS = Path.home() / "altis-brain/design-system/assets/fonts"
PATTERN = Path.home() / "altis-brain/design-system/assets/patterns/pattern-blue@2x.png"

W, H = 1080, 1920
BLUE = (1, 90, 233)        # 015AE9
BLUE_HI = (34, 140, 250)   # 228CFA
BLUE_LO = (2, 58, 176)     # 023AB0
INK = (3, 13, 31)          # 030D1F
WHITE = (255, 255, 255)


def font(size, weight="Medium"):
    return ImageFont.truetype(str(FONTS / f"DMSans-{weight}.ttf"), size)


def text_bold(draw, xy, s, size, fill, anchor=None):
    """DM Sans has no Bold on disk — fake it with Medium + same-color stroke."""
    draw.text(xy, s, font=font(size), fill=fill, anchor=anchor,
              stroke_width=max(1, size // 40), stroke_fill=fill)


def extract_white_mark(page_png, box, out_w):
    """Lift a white-on-dark wordmark from a deck render: luminance -> alpha."""
    im = Image.open(page_png).convert("L").crop(box)
    # steep ramp -> solid-white mark (the deck icon is blue-gradient; a soft
    # ramp leaves it ghosted, invisible on dark backgrounds)
    a = im.point(lambda v: max(0, min(255, (v - 70) * 4)))
    bbox = a.getbbox()
    a = a.crop(bbox)
    mark = Image.new("RGBA", a.size, WHITE + (0,))
    mark.putalpha(a)
    return mark.resize((out_w, int(a.size[1] * out_w / a.size[0])), Image.LANCZOS)


def with_halo(layer, blur=18, strength=1.6):
    """Bake the house dark halo behind a transparent layer."""
    halo = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    halo.paste((0, 0, 0, 255), mask=layer.getchannel("A"))
    halo = halo.filter(ImageFilter.GaussianBlur(blur))
    a = halo.getchannel("A").point(lambda v: min(255, int(v * strength)))
    halo.putalpha(a)
    out = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    out.alpha_composite(halo)
    out.alpha_composite(layer)
    return out


def rounded_shadow_card(im, radius=28, pad=48, shadow_blur=24):
    """Round an image's corners and float it on a soft drop shadow."""
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, *im.size], radius, fill=255)
    card = im.convert("RGBA")
    card.putalpha(mask)
    out = Image.new("RGBA", (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    sh = Image.new("RGBA", out.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle(
        [pad, pad + 10, pad + im.width, pad + 10 + im.height], radius, fill=(0, 0, 0, 110))
    out.alpha_composite(sh.filter(ImageFilter.GaussianBlur(shadow_blur)))
    out.alpha_composite(card, (pad, pad))
    return out


def canvas():
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


# ---- source marks, lifted from the deck cover render (300dpi) -------------
P1 = SRC / "page1-01.png"


def lockup_from_svg_render(png, out_w):
    """White lockup from the qlmanage render of the 1c-POSITIVE logo SVG:
    darkness -> alpha, recolored white. (Every deck lockup has a blue-gradient
    icon that extracts ghosted; the 1c SVG is the only flat-silhouette source.)"""
    im = Image.open(png).convert("L")
    a = im.point(lambda v: max(0, min(255, (185 - v) * 4)))
    a = a.crop(a.getbbox())
    mark = Image.new("RGBA", a.size, WHITE + (0,))
    mark.putalpha(a)
    return mark.resize((out_w, int(a.size[1] * out_w / a.size[0])), Image.LANCZOS)


altis_lockup = lockup_from_svg_render(SRC / "altis-logo-1c-positive.svg.png", 400)
# 1200dpi region render (pdftoppm -r 1200 -x/-y/-W/-H) — logos are vector in
# the PDF, so this is native-crisp; the 300dpi page renders upscale blurry
simile_mark = extract_white_mark(SRC / "hi-simile-01.png", (0, 0, 2360, 1000), 1400)

simile_mark.save(OUT / "logo-simile-white.png")

# ---- cover.png : top band ------------------------------------------------
BAND_H = 255
im = canvas()
d = ImageDraw.Draw(im)
d.rectangle([0, 0, W, BAND_H], fill=BLUE + (255,))
if PATTERN.exists():
    pat = Image.open(PATTERN).convert("RGBA").resize((W, W))
    pat.putalpha(pat.getchannel("A").point(lambda v: v // 8))
    im.alpha_composite(pat.crop((0, 0, W, BAND_H)))
lk = altis_lockup.resize((190, int(altis_lockup.height * 190 / altis_lockup.width)), Image.LANCZOS)
im.alpha_composite(lk, (48, 42))
text_bold(ImageDraw.Draw(im), (48, 190), "The question to be asking", 62, WHITE, anchor="lm")
im.save(OUT / "cover.png")

# ---- 00-logo-simile.png : wordmark over the chest ------------------------
im = canvas()
mark = simile_mark.resize((680, int(simile_mark.height * 680 / simile_mark.width)), Image.LANCZOS)
mark = with_halo(mark.crop(mark.getbbox()).resize(mark.size))
im.alpha_composite(mark, ((W - mark.width) // 2, 1250 - mark.height // 2))
im.save(OUT / "00-logo-simile.png")

# ---- question-card.png ---------------------------------------------------
g = Image.new("RGB", (108, 192))
px = g.load()
for y in range(192):
    for x in range(108):
        t = (x / 107 + (1 - y / 191)) / 2  # 1 at top-right, 0 at bottom-left
        px[x, y] = tuple(int(BLUE_LO[i] + (BLUE_HI[i] - BLUE_LO[i]) * t) for i in range(3))
im = g.resize((W, H), Image.BICUBIC).convert("RGBA")
lk = altis_lockup.resize((280, int(altis_lockup.height * 280 / altis_lockup.width)), Image.LANCZOS)
im.alpha_composite(lk, (72, 110))
d = ImageDraw.Draw(im)
d.text((72, 760), "THE QUESTION TO BE ASKING", font=font(40), fill=(210, 228, 255, 255))
for i, line in enumerate(["Is Simile's approach", "to simulation", "the winning one?"]):
    text_bold(d, (72, 880 + i * 128), line, 94, WHITE)
im.convert("RGB").save(OUT / "question-card.png")

# ---- end-card.png --------------------------------------------------------
im = Image.new("RGBA", (W, H), (0, 0, 0, 255))
lk = altis_lockup.resize((400, int(altis_lockup.height * 400 / altis_lockup.width)), Image.LANCZOS)
im.alpha_composite(lk, ((W - lk.width) // 2, 830))
d = ImageDraw.Draw(im)
text_bold(d, (W // 2, 1060), "Rise Above the Noise", 58, WHITE, anchor="mm")
d.text((W // 2, 1150), "altis.vc/research", font=font(44), fill=(160, 175, 195, 255), anchor="mm")
im.convert("RGB").save(OUT / "end-card.png")

# ---- kickers -------------------------------------------------------------
for name, color in [("white", WHITE), ("blue", BLUE)]:
    tmp = Image.new("RGBA", (900, 260), (0, 0, 0, 0))
    text_bold(ImageDraw.Draw(tmp), (450, 130), "UP TO 10x", 150, color + (255,), anchor="mm")
    tmp = tmp.crop(tmp.getbbox())
    pad = Image.new("RGBA", (tmp.width + 120, tmp.height + 120), (0, 0, 0, 0))
    pad.alpha_composite(tmp, (60, 60))
    with_halo(pad).save(OUT / f"kicker-up-to-10x-{name}.png")

# ---- report crops --------------------------------------------------------
# 300dpi renders are 3000x1688 (page 720x405pt); coords scaled from 1000-wide preview x3
p22 = Image.open(SRC / "page22-22.png").convert("RGB").crop((60, 525, 2940, 1395))   # steps 2-6
rounded_shadow_card(p22.resize((1960, int(p22.height * 1960 / p22.width)), Image.LANCZOS)
                    .resize((980, int(p22.height * 980 / p22.width)), Image.LANCZOS)) \
    .save(OUT / "crop-p22-method.png")

p8 = Image.open(SRC / "page8-08.png").convert("RGB").crop((1215, 1020, 2925, 1590))  # respondent layer
rounded_shadow_card(p8.resize((980, int(p8.height * 980 / p8.width)), Image.LANCZOS)) \
    .save(OUT / "crop-p8-synthetic.png")

p1 = Image.open(P1).convert("RGB").resize((640, 360), Image.LANCZOS)
rounded_shadow_card(p1, radius=20, pad=36).save(OUT / "thumb-p1-cover.png")

# ---- Chris's slide screenshots as overlay cards --------------------------
for name in ["finetuning", "basemodel", "pricing", "vendors"]:
    p = SRC / f"slide-{name}.png"
    if p.exists():
        im = Image.open(p).convert("RGB")
        im = im.resize((980, int(im.height * 980 / im.width)), Image.LANCZOS)
        rounded_shadow_card(im).save(OUT / f"overlay-slide-{name}.png")


def extract_dark_mark(page_png, box, out_w):
    """Lift a dark-on-light logo from a deck render and recolor it white
    (black-shirt variant): darkness -> alpha."""
    im = Image.open(page_png).convert("L").crop(box)
    a = im.point(lambda v: max(0, min(255, (185 - v) * 4)))
    bbox = a.getbbox()
    a = a.crop(bbox)
    mark = Image.new("RGBA", a.size, WHITE + (0,))
    mark.putalpha(a)
    return mark.resize((out_w, int(a.size[1] * out_w / a.size[0])), Image.LANCZOS)


# ---- closing trio: Simile / Aaru / Listen logos over the chest -----------
P9 = SRC / "page9-09.png"
if P9.exists():
    aaru = extract_dark_mark(SRC / "hi-aaru-09.png", (110, 80, 700, 310), 520)
    listen = extract_dark_mark(SRC / "hi-listen-09.png", (100, 100, 810, 300), 520)
    sim = simile_mark.resize((520, int(simile_mark.height * 520 / simile_mark.width)), Image.LANCZOS)
    marks = []
    for m in [sim, aaru, listen]:
        padded = Image.new("RGBA", (m.width + 120, m.height + 120), (0, 0, 0, 0))
        padded.alpha_composite(m, (60, 60))
        marks.append(with_halo(padded))
    gap = 10  # visual gap ~70px once the 60px halo padding is counted
    total_h = sum(m.height for m in marks) + gap * 2
    trio = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    y = 1250 - total_h // 2
    for m in marks:
        trio.alpha_composite(m, ((W - m.width) // 2, y))
        y += m.height + gap
    trio.save(OUT / "logos-trio.png")

# ---- press-headline opener card (TC masthead + headline screenshot) ------
if (SRC / "tc-masthead.png").exists():
    mast = Image.open(SRC / "tc-masthead.png").convert("RGB")
    head = Image.open(SRC / "tc-headline.png").convert("RGB")
    cw = 980
    mast = mast.resize((cw, int(mast.height * cw / mast.width)), Image.LANCZOS)
    head = head.resize((cw, int(head.height * cw / head.width)), Image.LANCZOS)
    card = Image.new("RGB", (cw, mast.height + head.height), WHITE)
    card.paste(mast, (0, 0))
    card.paste(head, (0, mast.height))
    rounded_shadow_card(card, radius=24).save(OUT / "headline-techcrunch.png")

print("done ->", OUT)
