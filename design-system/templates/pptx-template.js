/**
 * Altis PPTX Template
 * Built on PptxGenJS — https://gitbrent.github.io/PptxGenJS
 *
 * Usage:
 *   const { createDeck, addTitleSlide, addContentSlide, addChartSlide } =
 *     require('./design-system/templates/pptx-template');
 *
 *   const prs = createDeck();
 *   addTitleSlide(prs, { title: 'Company Name', subtitle: 'Series A Diligence' });
 *   addContentSlide(prs, { heading: 'Market', bullets: ['Point 1', 'Point 2'] });
 *   prs.writeFile({ fileName: 'report.pptx' });
 */

'use strict';

const PptxGenJS = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

// ── Token imports ─────────────────────────────────────────────────────────────
const tokens = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../tokens.json'), 'utf8')
);

// ── Brand colors (pptxgenjs uses hex without #) ───────────────────────────────
const C = {
  blue:   '015AE9',
  navy:   '030F1F',
  cyan:   '01B2F4',
  white:  'FFFFFF',
  // Data viz sequence (9 families, core tones first)
  chart: [
    '015AE9',  // blue
    '00A6A6',  // teal
    '814DC6',  // purple
    'FF6663',  // coral
    'F28C59',  // orange
    'F2DA3D',  // yellow
    '4BD66A',  // green
    '01B2F4',  // sky
    '4089FF',  // blue-mid
    '60BFBF',  // teal-mid
  ],
};

// ── Typography ────────────────────────────────────────────────────────────────
// Inter Tight for headings, Inter for body — both native Google Slides fonts
const F = {
  heading: 'Inter Tight',
  primary: 'Inter',
};

// Font sizes in points
const SZ = {
  display: 36,
  h1:      28,
  h2:      22,
  h3:      18,
  h4:      14,
  body:    12,
  small:   10,
  label:    9,
  caption:  8,
};

// ── Slide dimensions (Widescreen 16:9, inches) ────────────────────────────────
const SLIDE = { w: 13.33, h: 7.5 };

// Layout zones (inches)
const HEADER = { x: 0, y: 0,    w: SLIDE.w, h: 0.55 };
const FOOTER = { x: 0, y: 7.1,  w: SLIDE.w, h: 0.4  };
const BODY   = {
  x: 0.6,
  y: HEADER.h + 0.25,
  w: SLIDE.w - 1.2,
  h: FOOTER.y - HEADER.h - 0.5,
};

// ── Shared slide objects ──────────────────────────────────────────────────────

function headerBar() {
  return {
    shape: 'rect',
    x: HEADER.x, y: HEADER.y, w: HEADER.w, h: HEADER.h,
    fill: { color: C.blue },
    line: { color: C.blue },
  };
}

function footerBar() {
  return {
    shape: 'rect',
    x: FOOTER.x, y: FOOTER.y, w: FOOTER.w, h: FOOTER.h,
    fill: { color: 'F5F7FA' },
    line: { color: 'E0E4EA', width: 0.5 },
  };
}

function logoText(x, y, color = C.blue) {
  return {
    text: 'ALTIS',
    options: {
      x, y, w: 1.2, h: 0.3,
      fontSize: 11,
      fontFace: F.heading,
      bold: true,
      color,
      align: 'left',
    },
  };
}

// ── Slide masters config (for reference/documentation) ───────────────────────

const SLIDE_MASTERS = {
  TITLE_SLIDE: {
    description: 'Full brand blue background — cover page, opening slide',
    background: C.blue,
    titleFont: F.heading,
    titleSize: SZ.display,
    titleColor: C.white,
    subtitleFont: F.primary,
    subtitleSize: SZ.h3,
    subtitleColor: C.white,
    subtitleOpacity: 0.8,
  },
  SECTION_DIVIDER: {
    description: 'Brand blue background — marks new report sections',
    background: C.blue,
    titleFont: F.heading,
    titleSize: SZ.h1,
    titleColor: C.white,
  },
  CONTENT_SLIDE: {
    description: 'White background — standard content, bullets, analysis',
    background: C.white,
    headerColor: C.blue,
    headingFont: F.heading,
    headingSize: SZ.h2,
    headingColor: C.navy,
    bodyFont: F.primary,
    bodySize: SZ.body,
    bodyColor: C.navy,
  },
  TWO_COLUMN: {
    description: 'White background — two equal content columns',
    background: C.white,
    headerColor: C.blue,
    colWidth: (SLIDE.w - 1.5) / 2,
  },
  CHART_SLIDE: {
    description: 'White background — full-width chart area with expanded palette series',
    background: C.white,
    headerColor: C.blue,
    chartColors: C.chart,
  },
};

// ── Core API ──────────────────────────────────────────────────────────────────

/**
 * Creates a new PptxGenJS instance with Altis defaults.
 * @returns {PptxGenJS}
 */
function createDeck() {
  const prs = new PptxGenJS();
  prs.layout = 'LAYOUT_WIDE';  // 16:9, 13.33" × 7.5"
  prs.author  = 'Altis';
  prs.company = 'Altis';
  prs.subject = 'Altis Research Report';
  prs.title   = 'Altis Report';
  return prs;
}

/**
 * Adds a title (cover) slide.
 * @param {PptxGenJS} prs
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} [opts.subtitle]
 * @param {string} [opts.date]
 * @param {string} [opts.eyebrow] - Small label above the title
 */
function addTitleSlide(prs, { title, subtitle = '', date = '', eyebrow = '' }) {
  const slide = prs.addSlide();
  slide.background = { color: C.blue };

  // Logo (top left)
  slide.addText(...Object.values(logoText(0.5, 0.25, C.white)));

  // Eyebrow
  if (eyebrow) {
    slide.addText(eyebrow.toUpperCase(), {
      x: 0.6, y: SLIDE.h / 2 - 1.4, w: SLIDE.w - 1.2, h: 0.3,
      fontSize: SZ.label,
      fontFace: F.primary,
      color: C.white,
      transparency: 40,
    });
  }

  // Title
  slide.addText(title, {
    x: 0.6, y: SLIDE.h / 2 - 1.0, w: SLIDE.w - 1.2, h: 1.6,
    fontSize: SZ.display,
    fontFace: F.heading,
    bold: true,
    color: C.white,
    align: 'left',
    valign: 'top',
    wrap: true,
  });

  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.6, y: SLIDE.h / 2 + 0.7, w: SLIDE.w - 1.2, h: 0.5,
      fontSize: SZ.h3,
      fontFace: F.primary,
      color: C.white,
      transparency: 20,
    });
  }

  // Date
  if (date) {
    slide.addText(date, {
      x: 0.6, y: SLIDE.h / 2 + 1.2, w: SLIDE.w - 1.2, h: 0.3,
      fontSize: SZ.small,
      fontFace: F.primary,
      color: C.white,
      transparency: 40,
    });
  }

  return slide;
}

/**
 * Adds a section divider slide.
 * @param {PptxGenJS} prs
 * @param {object} opts
 * @param {string} opts.title
 * @param {string|number} [opts.sectionNumber]
 */
function addSectionDivider(prs, { title, sectionNumber = null }) {
  const slide = prs.addSlide();
  slide.background = { color: C.blue };

  // Logo
  slide.addText(...Object.values(logoText(0.5, 0.25, C.white)));

  // Large faded section number
  if (sectionNumber !== null) {
    slide.addText(String(sectionNumber).padStart(2, '0'), {
      x: 0.5, y: SLIDE.h / 2 - 1.5, w: 3, h: 1.8,
      fontSize: 96,
      fontFace: F.heading,
      bold: true,
      color: C.white,
      transparency: 82,
    });
  }

  // Section title
  slide.addText(title, {
    x: 0.6, y: SLIDE.h / 2 - 0.4, w: SLIDE.w - 1.2, h: 1.2,
    fontSize: SZ.h1,
    fontFace: F.heading,
    bold: true,
    color: C.white,
  });

  return slide;
}

/**
 * Adds a standard content slide with heading and bullets.
 * @param {PptxGenJS} prs
 * @param {object} opts
 * @param {string} opts.heading
 * @param {string[]} [opts.bullets]
 * @param {string} [opts.body] - Paragraph text alternative to bullets
 * @param {number} [opts.slideNumber]
 */
function addContentSlide(prs, { heading, bullets = [], body = '', slideNumber = null }) {
  const slide = prs.addSlide();
  slide.background = { color: C.white };

  // Header bar
  slide.addShape('rect', { ...HEADER, fill: { color: C.blue } });

  // Logo in header
  slide.addText('ALTIS', {
    x: 0.4, y: 0.12, w: 1.5, h: 0.3,
    fontSize: 11,
    fontFace: F.heading,
    bold: true,
    color: C.white,
  });

  // Heading
  slide.addText(heading, {
    x: BODY.x, y: BODY.y, w: BODY.w, h: 0.55,
    fontSize: SZ.h2,
    fontFace: F.heading,
    bold: true,
    color: C.navy,
  });

  // Body content
  const contentY = BODY.y + 0.65;
  const contentH = FOOTER.y - contentY - 0.15;

  if (bullets.length > 0) {
    const bulletItems = bullets.map((b) => ({
      text: b,
      options: { bullet: { type: 'number' }, color: C.navy, paraSpaceAfter: 6 },
    }));
    slide.addText(bulletItems, {
      x: BODY.x, y: contentY, w: BODY.w, h: contentH,
      fontSize: SZ.body,
      fontFace: F.primary,
      color: C.navy,
      valign: 'top',
    });
  } else if (body) {
    slide.addText(body, {
      x: BODY.x, y: contentY, w: BODY.w, h: contentH,
      fontSize: SZ.body,
      fontFace: F.primary,
      color: C.navy,
      valign: 'top',
      wrap: true,
    });
  }

  // Footer
  slide.addShape('rect', { ...FOOTER, fill: { color: 'F5F7FA' } });
  slide.addText('ALTIS', {
    x: 0.4, y: FOOTER.y + 0.08, w: 1.2, h: 0.25,
    fontSize: SZ.caption,
    fontFace: F.heading,
    bold: true,
    color: C.navy,
  });
  slide.addText('Confidential', {
    x: 0, y: FOOTER.y + 0.08, w: SLIDE.w, h: 0.25,
    fontSize: SZ.caption,
    fontFace: F.primary,
    color: C.navy,
    align: 'center',
  });
  if (slideNumber !== null) {
    slide.addText(String(slideNumber), {
      x: 0, y: FOOTER.y + 0.08, w: SLIDE.w - 0.4, h: 0.25,
      fontSize: SZ.caption,
      fontFace: F.primary,
      color: C.navy,
      align: 'right',
    });
  }

  return slide;
}

/**
 * Adds a two-column content slide.
 * @param {PptxGenJS} prs
 * @param {object} opts
 * @param {string} opts.heading
 * @param {string[]} opts.leftBullets
 * @param {string[]} opts.rightBullets
 * @param {string} [opts.leftLabel]
 * @param {string} [opts.rightLabel]
 * @param {number} [opts.slideNumber]
 */
function addTwoColumnSlide(prs, { heading, leftBullets = [], rightBullets = [], leftLabel = '', rightLabel = '', slideNumber = null }) {
  const slide = prs.addSlide();
  slide.background = { color: C.white };

  // Header
  slide.addShape('rect', { ...HEADER, fill: { color: C.blue } });
  slide.addText('ALTIS', {
    x: 0.4, y: 0.12, w: 1.5, h: 0.3,
    fontSize: 11, fontFace: F.heading, bold: true, color: C.white,
  });

  // Heading
  slide.addText(heading, {
    x: BODY.x, y: BODY.y, w: BODY.w, h: 0.55,
    fontSize: SZ.h2, fontFace: F.heading, bold: true, color: C.navy,
  });

  const colW = (BODY.w - 0.3) / 2;
  const colY  = BODY.y + 0.65;
  const colH  = FOOTER.y - colY - 0.15;

  // Left column label
  if (leftLabel) {
    slide.addText(leftLabel, {
      x: BODY.x, y: colY - 0.3, w: colW, h: 0.28,
      fontSize: SZ.label, fontFace: F.heading, bold: true, color: C.blue,
    });
  }

  // Left column bullets
  if (leftBullets.length > 0) {
    slide.addText(leftBullets.map((b) => ({ text: b, options: { bullet: true, paraSpaceAfter: 5 } })), {
      x: BODY.x, y: colY, w: colW, h: colH,
      fontSize: SZ.body, fontFace: F.primary, color: C.navy, valign: 'top',
    });
  }

  // Divider
  slide.addShape('line', {
    x: BODY.x + colW + 0.1, y: colY, w: 0, h: colH,
    line: { color: 'E0E4EA', width: 0.5 },
  });

  // Right column label
  if (rightLabel) {
    slide.addText(rightLabel, {
      x: BODY.x + colW + 0.3, y: colY - 0.3, w: colW, h: 0.28,
      fontSize: SZ.label, fontFace: F.heading, bold: true, color: C.blue,
    });
  }

  // Right column bullets
  if (rightBullets.length > 0) {
    slide.addText(rightBullets.map((b) => ({ text: b, options: { bullet: true, paraSpaceAfter: 5 } })), {
      x: BODY.x + colW + 0.3, y: colY, w: colW, h: colH,
      fontSize: SZ.body, fontFace: F.primary, color: C.navy, valign: 'top',
    });
  }

  // Footer
  slide.addShape('rect', { ...FOOTER, fill: { color: 'F5F7FA' } });
  slide.addText('Confidential', {
    x: 0, y: FOOTER.y + 0.08, w: SLIDE.w, h: 0.25,
    fontSize: SZ.caption, fontFace: F.primary, color: C.navy, align: 'center',
  });
  if (slideNumber !== null) {
    slide.addText(String(slideNumber), {
      x: 0, y: FOOTER.y + 0.08, w: SLIDE.w - 0.4, h: 0.25,
      fontSize: SZ.caption, fontFace: F.primary, color: C.navy, align: 'right',
    });
  }

  return slide;
}

/**
 * Adds a chart slide with a bar chart using expanded palette colors.
 * @param {PptxGenJS} prs
 * @param {object} opts
 * @param {string} opts.heading
 * @param {Array}  opts.chartData - Array of { name, labels, values, color? }
 * @param {string} [opts.chartType] - 'bar' | 'bar3D' | 'line' (default: 'bar')
 * @param {number} [opts.slideNumber]
 */
function addChartSlide(prs, { heading, chartData, chartType = 'bar', slideNumber = null }) {
  const slide = prs.addSlide();
  slide.background = { color: C.white };

  // Header
  slide.addShape('rect', { ...HEADER, fill: { color: C.blue } });
  slide.addText('ALTIS', {
    x: 0.4, y: 0.12, w: 1.5, h: 0.3,
    fontSize: 11, fontFace: F.heading, bold: true, color: C.white,
  });

  // Heading
  slide.addText(heading, {
    x: BODY.x, y: BODY.y, w: BODY.w, h: 0.45,
    fontSize: SZ.h2, fontFace: F.heading, bold: true, color: C.navy,
  });

  // Chart
  const chartColors = C.chart.slice(0, chartData.length);
  slide.addChart(prs.ChartType[chartType] || prs.ChartType.bar, chartData, {
    x: BODY.x,
    y: BODY.y + 0.6,
    w: BODY.w,
    h: FOOTER.y - BODY.y - 0.9,
    chartColors,
    showLegend: chartData.length > 1,
    legendPos: 'b',
    legendFontSize: SZ.caption,
    dataLabelFontSize: SZ.caption,
    valAxisLabelFontSize: SZ.small,
    catAxisLabelFontSize: SZ.small,
    valAxisLabelColor: C.navy,
    catAxisLabelColor: C.navy,
  });

  // Footer
  slide.addShape('rect', { ...FOOTER, fill: { color: 'F5F7FA' } });
  slide.addText('Confidential', {
    x: 0, y: FOOTER.y + 0.08, w: SLIDE.w, h: 0.25,
    fontSize: SZ.caption, fontFace: F.primary, color: C.navy, align: 'center',
  });
  if (slideNumber !== null) {
    slide.addText(String(slideNumber), {
      x: 0, y: FOOTER.y + 0.08, w: SLIDE.w - 0.4, h: 0.25,
      fontSize: SZ.caption, fontFace: F.primary, color: C.navy, align: 'right',
    });
  }

  return slide;
}

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  createDeck,
  addTitleSlide,
  addSectionDivider,
  addContentSlide,
  addTwoColumnSlide,
  addChartSlide,
  SLIDE_MASTERS,
  COLORS: C,
  FONTS: F,
  SIZES: SZ,
  SLIDE,
  BODY,
  HEADER,
  FOOTER,
};
