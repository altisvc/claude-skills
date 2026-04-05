'use strict';

const fs   = require('fs');
const path = require('path');

const { createReport, getReportStyles, getChartColorSequence } =
  require('../templates/pdf-report-template');
const { createDeck, addTitleSlide, addSectionDivider, addContentSlide, addChartSlide } =
  require('../templates/pptx-template');

const OUT = path.join(__dirname);

// ── PDF Smoke Test ────────────────────────────────────────────────────────────
console.log('Building test-report.pdf...');

const doc = createReport({
  title:    'Altis Test Report',
  subtitle: 'Design System Verification',
  date:     'March 1, 2026',
  sections: [
    {
      heading: 'Executive summary',
      label:   'Overview',
      body:    'This report verifies that the Altis PDF report template renders correctly using brand colors, typography, and layout. The cover page uses brand blue (#015AE9) as the full-bleed background with white text. Body pages use the standard header bar and footer with page numbers.',
      bullets: [
        'Brand blue (#015AE9) renders as the primary color throughout',
        'Inter Tight used for headings, Inter for body text',
        'Footer shows "Altis", "Confidential", and page number',
        'Sentence case applied to all text — no ALL CAPS',
        'No periods at the end of bullet points',
      ],
    },
    {
      heading:   'Market sizing',
      label:     'Market',
      body:      'The following chart shows example data using the expanded palette color sequence.',
      chartTitle: 'Series A deal volume by sector (2025)',
      chartData: [
        { label: 'AI / ML',        value: 47 },
        { label: 'Fintech',        value: 38 },
        { label: 'Health tech',    value: 29 },
        { label: 'Infrastructure', value: 24 },
      ],
    },
  ],
});

const pdfPath = path.join(OUT, 'test-report.pdf');
doc.pipe(fs.createWriteStream(pdfPath));
doc.end();
console.log(`  ✓ test-report.pdf written`);

// ── PPTX Smoke Test ───────────────────────────────────────────────────────────
console.log('Building test-deck.pptx...');

const prs = createDeck();

addTitleSlide(prs, {
  title:    'Altis Test Deck',
  subtitle: 'Design System Verification',
  eyebrow:  'Confidential',
  date:     'March 1, 2026',
});

addSectionDivider(prs, { title: 'Section 1 — Content slides', sectionNumber: 1 });

addContentSlide(prs, {
  heading: 'Key findings',
  bullets: [
    'Brand blue (#015AE9) renders correctly on blue slides',
    'Inter Tight is the heading font for all slide titles',
    'Inter is the body font for bullets and captions',
    'The footer shows logo, "Confidential", and slide number',
    'No periods at the end of bullet points',
  ],
  slideNumber: 3,
});

addChartSlide(prs, {
  heading: 'Market sizing — sector breakdown',
  chartData: [
    {
      name: '2025 deal volume',
      labels: ['AI / ML', 'Fintech', 'Health tech', 'Infrastructure', 'Defense tech'],
      values: [47, 38, 29, 24, 18],
    },
  ],
  chartType: 'bar',
  slideNumber: 4,
});

const pptxPath = path.join(OUT, 'test-deck.pptx');
prs.writeFile({ fileName: pptxPath }).then(() => {
  console.log(`  ✓ test-deck.pptx written`);
  console.log('\nAll smoke tests passed.');

  // Print sizes
  const pdfSize  = fs.statSync(pdfPath).size;
  const pptxSize = fs.statSync(pptxPath).size;
  console.log(`  test-report.pdf:  ${(pdfSize / 1024).toFixed(1)} KB`);
  console.log(`  test-deck.pptx:   ${(pptxSize / 1024).toFixed(1)} KB`);
});
