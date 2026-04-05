/**
 * Altis PDF Report Template
 * Built on PDFKit — https://pdfkit.org
 *
 * Usage:
 *   const { createReport } = require('./design-system/templates/pdf-report-template');
 *   const doc = createReport({
 *     title: 'Company Name — Day 10 Diligence',
 *     subtitle: 'Series A Diligence Report',
 *     date: '2026-03-01',
 *     sections: [{ heading: 'Market', body: '...' }, ...]
 *   });
 *   doc.pipe(fs.createWriteStream('report.pdf'));
 *   doc.end();
 */

'use strict';

const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// ── Token imports ─────────────────────────────────────────────────────────────
const tokens = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../tokens.json'), 'utf8')
);

const ASSETS = path.join(__dirname, '../assets');

// ── Brand colors ──────────────────────────────────────────────────────────────
const COLORS = {
  blue:         tokens.colors.core.blue.hex,          // #015AE9
  navy:         tokens.colors.core.navy.hex,          // #030F1F
  cyan:         tokens.colors.core.cyan.hex,          // #01B2F4
  white:        tokens.colors.core.white.hex,         // #FFFFFF
  // Expanded — data viz sequence
  chartColors: [
    tokens.colors.expanded['blue-core'].hex,          // #015AE9
    tokens.colors.expanded['teal-core'].hex,          // #00A6A6
    tokens.colors.expanded['purple-core'].hex,        // #814DC6
    tokens.colors.expanded['coral-core'].hex,         // #FF6663
    tokens.colors.expanded['orange-core'].hex,        // #F28C59
    tokens.colors.expanded['yellow-core'].hex,        // #F2DA3D
    tokens.colors.expanded['green-core'].hex,         // #4BD66A
    tokens.colors.expanded['sky-core'].hex,           // #01B2F4
    tokens.colors.expanded['blue-mid'].hex,           // #4089FF
    tokens.colors.expanded['teal-mid'].hex,           // #60BFBF
  ],
};

// ── Typography ────────────────────────────────────────────────────────────────
// Paths to Inter TTF files in design-system/assets/fonts/
const FONT_DIR = path.join(__dirname, '../assets/fonts');
const FONT_FILES = {
  'Inter-Regular':       path.join(FONT_DIR, 'Inter-Regular.ttf'),
  'Inter-Medium':        path.join(FONT_DIR, 'Inter-Medium.ttf'),
  'Inter-SemiBold':      path.join(FONT_DIR, 'Inter-SemiBold.ttf'),
  'Inter-Bold':          path.join(FONT_DIR, 'Inter-Bold.ttf'),
  'InterTight-Medium':   path.join(FONT_DIR, 'InterTight-Medium.ttf'),
  'InterTight-SemiBold': path.join(FONT_DIR, 'InterTight-SemiBold.ttf'),
  'InterTight-Bold':     path.join(FONT_DIR, 'InterTight-Bold.ttf'),
};

const FONTS = {
  primary:        'Inter-Regular',
  primaryMedium:  'Inter-Medium',
  primaryBold:    'Inter-Bold',
  heading:        'InterTight-Bold',
  headingSemi:    'InterTight-SemiBold',
  headingMedium:  'InterTight-Medium',
  italic:         'Inter-Regular',   // PDFKit italic emulation via oblique transform
};

const TYPE = {
  display: { size: 36, font: FONTS.heading },
  h1:      { size: 28, font: FONTS.heading },
  h2:      { size: 20, font: FONTS.heading },
  h3:      { size: 16, font: FONTS.heading },
  body:    { size: 11, font: FONTS.primary },
  small:   { size: 9,  font: FONTS.primary },
  label:   { size: 8,  font: FONTS.heading },
  caption: { size: 8,  font: FONTS.italic  },
};

// ── Layout constants ──────────────────────────────────────────────────────────
const PAGE = { width: 612, height: 792 };  // US Letter
const MARGIN = { top: 72, right: 56, bottom: 72, left: 56 };
const CONTENT_WIDTH = PAGE.width - MARGIN.left - MARGIN.right;
const HEADER_HEIGHT = 36;
const FOOTER_HEIGHT = 28;
const FOOTER_Y = PAGE.height - MARGIN.bottom + 8;

// ── Helpers ───────────────────────────────────────────────────────────────────

function hexToRGB(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function setFill(doc, hex) {
  const [r, g, b] = hexToRGB(hex);
  doc.fillColor([r, g, b]);
}

function setStroke(doc, hex) {
  const [r, g, b] = hexToRGB(hex);
  doc.strokeColor([r, g, b]);
}

// ── Core template functions ───────────────────────────────────────────────────

/**
 * Returns all brand styles as a plain object.
 * Useful for referencing tokens without creating a doc.
 */
function getReportStyles() {
  return {
    colors: COLORS,
    fonts: FONTS,
    type: TYPE,
    page: PAGE,
    margin: MARGIN,
    contentWidth: CONTENT_WIDTH,
  };
}

/**
 * Returns the expanded palette colors in the order they should be
 * applied to data series in charts (most legible sequence first).
 */
function getChartColorSequence() {
  return [...COLORS.chartColors];
}

/**
 * Draws the standard page header bar.
 * @param {PDFDocument} doc
 * @param {string} sectionLabel - Optional right-aligned label
 */
function drawHeader(doc, sectionLabel = '') {
  // Blue bar across top of content area
  setFill(doc, COLORS.blue);
  doc.rect(MARGIN.left, MARGIN.top - HEADER_HEIGHT - 8, CONTENT_WIDTH, 3).fill();

  // Section label right-aligned in header
  if (sectionLabel) {
    doc
      .font(TYPE.label.font)
      .fontSize(TYPE.label.size)
      .fillColor('white');
    setFill(doc, COLORS.navy);
    doc.text(sectionLabel.toUpperCase(), MARGIN.left, MARGIN.top - HEADER_HEIGHT + 2, {
      width: CONTENT_WIDTH,
      align: 'right',
    });
  }
}

/**
 * Draws the standard page footer: logo path left, "Confidential" center, page number right.
 * @param {PDFDocument} doc
 * @param {number} pageNum
 */
function drawFooter(doc, pageNum) {
  // Footer rule
  setStroke(doc, COLORS.blue);
  doc.moveTo(MARGIN.left, FOOTER_Y - 6).lineTo(PAGE.width - MARGIN.right, FOOTER_Y - 6).lineWidth(0.5).stroke();

  doc.font(TYPE.caption.font).fontSize(TYPE.caption.size);
  setFill(doc, COLORS.navy);

  // Left: Altis
  doc.fillColor('#030F1F').text('Altis', MARGIN.left, FOOTER_Y, { width: 80, align: 'left' });

  // Center: Confidential
  doc.text('Confidential', MARGIN.left, FOOTER_Y, { width: CONTENT_WIDTH, align: 'center' });

  // Right: page number
  doc.text(`${pageNum}`, MARGIN.left, FOOTER_Y, { width: CONTENT_WIDTH, align: 'right' });
}

/**
 * Adds a cover page to the document.
 * @param {PDFDocument} doc
 * @param {string} title
 * @param {string} subtitle
 * @param {string} date - e.g. "March 1, 2026"
 */
function createCoverPage(doc, title, subtitle, date) {
  // Full blue background
  setFill(doc, COLORS.blue);
  doc.rect(0, 0, PAGE.width, PAGE.height).fill();

  // Altis wordmark (text placeholder — replace with SVG if rasterized logo available)
  doc
    .font(FONTS.heading)
    .fontSize(18)
    .fillColor('white')
    .text('ALTIS', MARGIN.left, MARGIN.top, { align: 'left' });

  // Title
  doc
    .font(TYPE.display.font)
    .fontSize(TYPE.display.size)
    .fillColor('white')
    .text(title, MARGIN.left, PAGE.height / 2 - 60, {
      width: CONTENT_WIDTH,
      align: 'left',
      lineGap: 6,
    });

  // Subtitle
  doc
    .font(TYPE.h3.font)
    .fontSize(TYPE.h3.size)
    .fillColor('white')
    .opacity(0.75)
    .text(subtitle, MARGIN.left, PAGE.height / 2 + 20, {
      width: CONTENT_WIDTH,
      align: 'left',
    });

  // Date
  doc
    .font(TYPE.body.font)
    .fontSize(TYPE.body.size)
    .fillColor('white')
    .opacity(0.6)
    .text(date, MARGIN.left, PAGE.height / 2 + 48, {
      width: CONTENT_WIDTH,
      align: 'left',
    });

  // Reset opacity
  doc.opacity(1);
}

/**
 * Adds a section divider page (brand blue, white heading).
 * @param {PDFDocument} doc
 * @param {string} sectionTitle
 * @param {number} sectionNumber - Optional section number
 */
function createSectionDivider(doc, sectionTitle, sectionNumber = null) {
  doc.addPage();

  // Full blue background
  setFill(doc, COLORS.blue);
  doc.rect(0, 0, PAGE.width, PAGE.height).fill();

  // Section number
  if (sectionNumber !== null) {
    doc
      .font(TYPE.label.font)
      .fontSize(48)
      .fillColor('white')
      .opacity(0.15)
      .text(String(sectionNumber).padStart(2, '0'), MARGIN.left, PAGE.height / 2 - 80, {
        width: CONTENT_WIDTH,
        align: 'left',
      });
    doc.opacity(1);
  }

  // Section title
  doc
    .font(TYPE.h1.font)
    .fontSize(TYPE.h1.size)
    .fillColor('white')
    .text(sectionTitle, MARGIN.left, PAGE.height / 2 - 20, {
      width: CONTENT_WIDTH,
      align: 'left',
    });
}

/**
 * Adds a standard body content page.
 * @param {PDFDocument} doc
 * @param {object} opts
 * @param {string} opts.heading - Page heading
 * @param {string} opts.body - Body text content
 * @param {number} opts.pageNum - Page number for footer
 * @param {string} [opts.sectionLabel] - Optional header label
 * @param {Array}  [opts.bullets] - Optional bullet list
 */
function createBodyPage(doc, { heading, body, pageNum, sectionLabel = '', bullets = [] }) {
  doc.addPage();

  drawHeader(doc, sectionLabel);
  drawFooter(doc, pageNum);

  let y = MARGIN.top;

  // Heading
  doc
    .font(TYPE.h2.font)
    .fontSize(TYPE.h2.size)
    .fillColor(COLORS.navy)
    .text(heading, MARGIN.left, y, { width: CONTENT_WIDTH });

  y = doc.y + 12;

  // Body text
  if (body) {
    doc
      .font(TYPE.body.font)
      .fontSize(TYPE.body.size)
      .fillColor(COLORS.navy)
      .text(body, MARGIN.left, y, {
        width: CONTENT_WIDTH,
        lineGap: 3,
        align: 'left',
      });
    y = doc.y + 12;
  }

  // Bullets
  if (bullets.length > 0) {
    bullets.forEach((bullet) => {
      doc
        .font(TYPE.body.font)
        .fontSize(TYPE.body.size)
        .fillColor(COLORS.navy)
        .text(`— ${bullet}`, MARGIN.left + 12, doc.y + 4, {
          width: CONTENT_WIDTH - 12,
          lineGap: 2,
        });
    });
  }

  return doc.y;
}

/**
 * Draws a simple horizontal bar chart.
 * @param {PDFDocument} doc
 * @param {object} opts
 * @param {Array}  opts.data - Array of { label, value } objects
 * @param {number} opts.x
 * @param {number} opts.y
 * @param {number} opts.width
 * @param {number} opts.maxValue - Max axis value
 * @param {string} [opts.title]
 */
function drawBarChart(doc, { data, x, y, width, maxValue, title = '' }) {
  const barHeight = 18;
  const gap = 8;
  const labelWidth = 100;
  const chartWidth = width - labelWidth - 40;
  const colors = getChartColorSequence();

  if (title) {
    doc
      .font(TYPE.h3.font)
      .fontSize(TYPE.h3.size)
      .fillColor(COLORS.navy)
      .text(title, x, y, { width });
    y = doc.y + 8;
  }

  data.forEach(({ label, value }, i) => {
    const barW = Math.max(2, (value / maxValue) * chartWidth);
    const barY = y + i * (barHeight + gap);

    // Label
    doc
      .font(TYPE.caption.font)
      .fontSize(TYPE.caption.size)
      .fillColor(COLORS.navy)
      .text(label, x, barY + 4, { width: labelWidth - 8, align: 'right' });

    // Bar
    setFill(doc, colors[i % colors.length]);
    doc.rect(x + labelWidth, barY, barW, barHeight).fill();

    // Value label
    doc
      .font(TYPE.caption.font)
      .fontSize(TYPE.caption.size)
      .fillColor(COLORS.navy)
      .text(String(value), x + labelWidth + barW + 4, barY + 4);
  });

  return y + data.length * (barHeight + gap) + 8;
}

// ── Main report builder ───────────────────────────────────────────────────────

/**
 * Creates a complete branded Altis report.
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} opts.subtitle
 * @param {string} opts.date
 * @param {Array}  opts.sections - Array of { heading, body, bullets?, chartData? }
 * @returns {PDFDocument}
 */
function createReport({ title, subtitle, date, sections = [] }) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: MARGIN.top, right: MARGIN.right, bottom: MARGIN.bottom, left: MARGIN.left },
    autoFirstPage: false,
    info: {
      Title: title,
      Author: 'Altis',
      Creator: 'Altis Design System — pdf-report-template.js',
    },
  });

  // Register Inter + Inter Tight fonts
  Object.entries(FONT_FILES).forEach(([name, filePath]) => {
    if (fs.existsSync(filePath)) {
      doc.registerFont(name, filePath);
    }
  });

  // Cover page
  doc.addPage();
  createCoverPage(doc, title, subtitle, date);

  // Body pages
  sections.forEach((section, i) => {
    const pageNum = i + 2;

    if (section.chartData) {
      createBodyPage(doc, {
        heading: section.heading,
        body: section.body || '',
        bullets: section.bullets || [],
        pageNum,
        sectionLabel: section.label || '',
      });
      drawBarChart(doc, {
        data: section.chartData,
        x: MARGIN.left,
        y: doc.y + 16,
        width: CONTENT_WIDTH,
        maxValue: Math.max(...section.chartData.map((d) => d.value)),
        title: section.chartTitle || '',
      });
    } else {
      createBodyPage(doc, {
        heading: section.heading,
        body: section.body || '',
        bullets: section.bullets || [],
        pageNum,
        sectionLabel: section.label || '',
      });
    }
  });

  return doc;
}

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  createReport,
  createCoverPage,
  createBodyPage,
  createSectionDivider,
  drawBarChart,
  drawHeader,
  drawFooter,
  getReportStyles,
  getChartColorSequence,
  COLORS,
  FONTS,
  TYPE,
  PAGE,
  MARGIN,
  CONTENT_WIDTH,
};
