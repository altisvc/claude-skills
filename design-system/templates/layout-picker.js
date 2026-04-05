'use strict';

/**
 * layout-picker.js
 *
 * Content-aware layout selection for Altis Day 10 reports.
 * Analyzes markdown sections and chooses the best template layout(s).
 *
 * Design principles (derived from David AI deck — 40 slides, tightest published):
 *   - Max ~150 words per content slide (David AI avg: ~140 for text slides)
 *   - Section dividers ("Contents") between every major section
 *   - KPI-stat for any section whose headline is a number
 *   - Pull-quote for expert quotes or "net net" summaries
 *   - Evidence-light-list for bulleted findings
 *   - Text-narrative only when prose is unavoidable
 *   - Chapter-divider for section breaks
 *   - Visual rhythm: no more than 3 text-heavy slides in a row without a break
 *
 * Usage:
 *   const { pickLayouts } = require('./layout-picker');
 *   const slides = pickLayouts(markdownSections);
 */

const SLIDE_LAYOUTS = require('./google-slides-template').SLIDE_LAYOUTS;
const placeholderMap = require('./template-placeholders.json').layouts;

// ── Content analysis ────────────────────────────────────────────────────────────

/**
 * Analyzes a markdown section and returns content signals.
 */
function analyzeContent(markdown) {
  const lines = markdown.split('\n').filter(l => l.trim().length > 0);
  const text = lines.join(' ');
  const words = text.split(/\s+/).filter(w => w.length > 0);

  const bullets = lines.filter(l => /^\s*[-*•]\s/.test(l));
  const numberedItems = lines.filter(l => /^\s*\d+[.)]\s/.test(l));

  // Detect headline numbers (TAM, NRR, headcount, etc.)
  const bigNumberPattern = /(?:^|\s)[$~]?[\d,.]+[%xBMKT]+|\b\d{1,3}(?:,\d{3})+\b|\$[\d,.]+[BMK]?\b/g;
  const bigNumbers = text.match(bigNumberPattern) || [];

  // Detect quotes (lines starting with > or containing attribution patterns)
  const quotes = lines.filter(l =>
    /^\s*>/.test(l) ||
    /[""][^""]{20,}[""]/.test(l) ||
    /\s[-—]\s*(Former|Current|CEO|CTO|VP|Director|Head of|Manager|Analyst)/i.test(l)
  );

  // Detect comparison/table patterns
  const tableRows = lines.filter(l => (l.match(/\|/g) || []).length >= 2);
  const hasComparison = tableRows.length >= 3 ||
    /\bvs\.?\b/i.test(text) ||
    /head-to-head/i.test(text);

  // Detect section-level markers
  const h2Match = markdown.match(/^##\s+(.+)/m);
  const h3Match = markdown.match(/^###\s+(.+)/m);

  return {
    wordCount: words.length,
    bulletCount: bullets.length,
    numberedItemCount: numberedItems.length,
    bigNumberCount: bigNumbers.length,
    bigNumbers: bigNumbers.slice(0, 3),
    quoteCount: quotes.length,
    firstQuote: quotes[0] || null,
    hasComparison,
    tableRowCount: tableRows.length,
    h2Title: h2Match ? h2Match[1].trim() : null,
    h3Title: h3Match ? h3Match[1].trim() : null,
    lineCount: lines.length,
    text,
    lines,
  };
}

// ── Layout selection rules ──────────────────────────────────────────────────────

const MAX_WORDS_PER_SLIDE = 150;
const MAX_BULLETS_PER_SLIDE = 6;

/**
 * Section-type detection based on Day 10 report structure.
 */
const SECTION_PATTERNS = {
  cover:          /^(cover|title page)/i,
  execSummary:    /executive\s+summary/i,
  keyDebates:     /key\s+debate/i,
  keyStats:       /key\s+stat/i,
  sources:        /primary.*secondary\s+sources|sources/i,
  marketOverview: /market\s+overview/i,
  tam:            /total\s+addressable\s+market|TAM/i,
  companyOverview:/company\s+overview/i,
  productGtm:    /product.*go-to-market|product.*GTM/i,
  competitive:   /competitive\s+dynamics/i,
  customer:      /customer\s+signal/i,
  teamCulture:   /team.*culture/i,
  closing:       /^(closing|end|appendix)/i,
};

function detectSectionType(title) {
  if (!title) return 'unknown';
  for (const [type, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(title)) return type;
  }
  return 'unknown';
}

/**
 * Picks layout(s) for a single markdown section.
 * May return multiple slides if content exceeds single-slide capacity.
 *
 * @param {string} markdown - Section markdown content (from ## to next ##)
 * @param {string} sectionTitle - The ## heading text
 * @param {object} opts - { prevLayouts: string[] } for rhythm tracking
 * @returns {Array<{ layout: string, title: string, subtitle: string, body: string, note: string }>}
 */
function pickLayoutsForSection(markdown, sectionTitle, opts = {}) {
  const analysis = analyzeContent(markdown);
  const sectionType = detectSectionType(sectionTitle);
  const slides = [];

  // ── Special section types with fixed layouts ──

  if (sectionType === 'cover') {
    slides.push({
      layout: 'cover-dark',
      title: sectionTitle,
      subtitle: '',
      body: '',
      note: 'Cover slide',
    });
    return slides;
  }

  if (sectionType === 'closing') {
    slides.push({
      layout: 'closing-blank',
      title: '',
      subtitle: '',
      body: '',
      note: 'Closing slide',
    });
    return slides;
  }

  // ── Section divider (always precedes a major section) ──

  if (sectionType !== 'unknown') {
    slides.push({
      layout: 'chapter-divider-1',
      title: cleanSectionTitle(sectionTitle),
      subtitle: '',
      body: '',
      note: `Section divider for ${sectionType}`,
    });
  }

  // ── Content slides ──

  // Extract subsections (### headings)
  const subsections = splitSubsections(markdown);

  for (const sub of subsections) {
    const subAnalysis = analyzeContent(sub.content);

    // Rule 1: KPI stat — if the subsection leads with or centers on a big number
    if (subAnalysis.bigNumberCount > 0 && subAnalysis.wordCount < 30) {
      slides.push({
        layout: 'kpi-stat',
        title: subAnalysis.bigNumbers[0],
        subtitle: sub.heading || sectionTitle,
        body: '',
        note: 'Big number headline',
      });
      continue;
    }

    // Rule 2: Pull quote — if there's a notable quote
    if (subAnalysis.quoteCount > 0 && subAnalysis.wordCount < 80) {
      slides.push({
        layout: 'pull-quote-1',
        title: cleanQuote(subAnalysis.firstQuote),
        subtitle: sub.heading || '',
        body: '',
        note: 'Expert quote',
      });
      continue;
    }

    // Rule 3: Comparison table
    if (subAnalysis.hasComparison && subAnalysis.tableRowCount >= 3) {
      slides.push({
        layout: 'table-grid',
        title: sub.heading || sectionTitle,
        subtitle: '',
        body: extractTableContent(sub.content),
        note: 'Comparison table',
      });
      continue;
    }

    // Rule 4: Numbered list with exactly 3 items
    if (subAnalysis.numberedItemCount === 3 && subAnalysis.wordCount < MAX_WORDS_PER_SLIDE) {
      slides.push({
        layout: 'numbered-3-no-images',
        title: sub.heading || sectionTitle,
        subtitle: '',
        body: extractBullets(sub.content),
        note: '3-item numbered list',
      });
      continue;
    }

    // Rule 5: Bullet list — split if needed
    if (subAnalysis.bulletCount > 0) {
      const bulletSlides = splitBulletsIntoSlides(sub.content, sub.heading || sectionTitle);
      slides.push(...bulletSlides);
      continue;
    }

    // Rule 6: Narrative text — split if long
    if (subAnalysis.wordCount > MAX_WORDS_PER_SLIDE) {
      const narrativeSlides = splitNarrativeIntoSlides(sub.content, sub.heading || sectionTitle);
      slides.push(...narrativeSlides);
      continue;
    }

    // Rule 7: Default — text narrative or evidence list
    const defaultLayout = subAnalysis.wordCount > 80 ? 'text-narrative' : 'evidence-light-list';
    slides.push({
      layout: defaultLayout,
      title: sub.heading || sectionTitle,
      subtitle: '',
      body: cleanBody(sub.content),
      note: `Default ${defaultLayout}`,
    });
  }

  // ── Visual rhythm enforcement ──
  return enforceVisualRhythm(slides);
}

// ── Splitting helpers ───────────────────────────────────────────────────────────

function splitSubsections(markdown) {
  const lines = markdown.split('\n');
  const sections = [];
  let current = { heading: '', lines: [] };

  for (const line of lines) {
    const h3 = line.match(/^###\s+(.+)/);
    const h2 = line.match(/^##\s+(.+)/);

    if (h3) {
      if (current.lines.length > 0 || current.heading) {
        sections.push({ heading: current.heading, content: current.lines.join('\n') });
      }
      current = { heading: h3[1].trim(), lines: [] };
    } else if (h2) {
      // Skip h2 — it's the section title, handled by the caller
    } else {
      current.lines.push(line);
    }
  }

  if (current.lines.length > 0 || current.heading) {
    sections.push({ heading: current.heading, content: current.lines.join('\n') });
  }

  // If no subsections found, treat the whole thing as one
  if (sections.length === 0) {
    sections.push({ heading: '', content: markdown.replace(/^##\s+.+\n?/, '') });
  }

  return sections;
}

function splitBulletsIntoSlides(content, title) {
  const lines = content.split('\n');
  const bullets = [];
  const nonBullets = [];

  for (const line of lines) {
    if (/^\s*[-*•]\s/.test(line)) {
      bullets.push(line);
    } else if (line.trim().length > 0 && !/^###?\s/.test(line)) {
      nonBullets.push(line);
    }
  }

  const slides = [];
  const chunks = chunkArray(bullets, MAX_BULLETS_PER_SLIDE);

  for (let i = 0; i < chunks.length; i++) {
    const slideTitle = chunks.length > 1 ? `${title} (${i + 1}/${chunks.length})` : title;
    slides.push({
      layout: 'evidence-light-list',
      title: slideTitle,
      subtitle: '',
      body: chunks[i].map(b => cleanBullet(b)).join('\n'),
      note: `Bullet list chunk ${i + 1}/${chunks.length}`,
    });
  }

  return slides;
}

function splitNarrativeIntoSlides(content, title) {
  const words = content.split(/\s+/).filter(w => w.length > 0);
  const slides = [];
  const chunkSize = MAX_WORDS_PER_SLIDE;

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    const slideNum = Math.floor(i / chunkSize) + 1;
    const totalSlides = Math.ceil(words.length / chunkSize);
    const slideTitle = totalSlides > 1 ? `${title} (${slideNum}/${totalSlides})` : title;

    slides.push({
      layout: 'text-narrative',
      title: slideTitle,
      subtitle: '',
      body: chunk,
      note: `Narrative chunk ${slideNum}/${totalSlides}`,
    });
  }

  return slides;
}

// ── Visual rhythm ───────────────────────────────────────────────────────────────

const TEXT_HEAVY_LAYOUTS = new Set([
  'text-narrative', 'evidence-light-list', 'evidence-dark-list',
  'evidence-dark-bullets', 'evidence-dark-bullets-2', 'extended-content',
]);

function enforceVisualRhythm(slides) {
  // Don't insert breaks into very short sequences
  if (slides.length <= 4) return slides;

  const result = [];
  let textHeavyStreak = 0;

  for (const slide of slides) {
    if (slide.layout === 'chapter-divider-1' || slide.layout === 'closing-blank') {
      textHeavyStreak = 0;
      result.push(slide);
      continue;
    }

    if (TEXT_HEAVY_LAYOUTS.has(slide.layout)) {
      textHeavyStreak++;
    } else {
      textHeavyStreak = 0;
    }

    result.push(slide);

    // After 3 consecutive text-heavy slides, the rhythm is off.
    // Don't auto-insert here — flag it for the slide design consultant (Build 2).
    // For now, just track it.
    if (textHeavyStreak >= 4) {
      slide._rhythmWarning = 'Consider inserting a visual break (kpi-stat, pull-quote, or half-image)';
    }
  }

  return result;
}

// ── Text cleaning ───────────────────────────────────────────────────────────────

function cleanSectionTitle(title) {
  return title
    .replace(/^Section\s+\d+:\s*/i, '')
    .replace(/^Slide\s+[\d.]+:\s*/i, '')
    .trim();
}

function cleanBullet(line) {
  return line.replace(/^\s*[-*•]\s+/, '').trim();
}

function cleanBody(content) {
  return content
    .replace(/^##?\s+.+\n?/gm, '')  // strip headings
    .replace(/^###\s+.+\n?/gm, '')
    .trim();
}

function cleanQuote(quoteLine) {
  if (!quoteLine) return '';
  return quoteLine
    .replace(/^\s*>\s*/, '')
    .replace(/^[""]/, '').replace(/[""]$/, '')
    .trim();
}

function extractTableContent(content) {
  const lines = content.split('\n').filter(l => (l.match(/\|/g) || []).length >= 2);
  return lines.join('\n');
}

function extractBullets(content) {
  return content.split('\n')
    .filter(l => /^\s*[-*•\d]/.test(l))
    .map(l => l.trim())
    .join('\n');
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ── Main entry point ────────────────────────────────────────────────────────────

/**
 * Detects whether a document is a net-net summary (not a full report).
 * Net-nets are single-slide documents with "net net" in the H1 title
 * and the standard make/break/view structure.
 */
function isNetNet(markdown) {
  const title = extractReportTitle(markdown).toLowerCase();
  return title.includes('net net');
}

/**
 * Generates a single-slide plan for a net-net document.
 * Published decks (Cartesia, ElevenLabs) render net-net as ONE slide
 * with ~160 words, structured as make/break/view sections.
 */
function generateNetNetPlan(reportMarkdown) {
  const reportTitle = extractReportTitle(reportMarkdown);
  const sections = splitTopLevelSections(reportMarkdown);

  // Build structured body: flatten all sections into one slide
  const bodyParts = [];

  for (const section of sections) {
    // Extract subsection content
    const subs = splitSubsections(section.content);
    for (const sub of subs) {
      if (sub.heading) {
        bodyParts.push(sub.heading);
      }
      const bullets = sub.content.split('\n')
        .filter(l => /^\s*[-*•]\s/.test(l))
        .map(l => cleanBullet(l));

      if (bullets.length > 0) {
        bodyParts.push(...bullets.map(b => `- ${b}`));
      } else {
        const prose = sub.content
          .replace(/^##?\s+.+\n?/gm, '')
          .replace(/^###\s+.+\n?/gm, '')
          .trim();
        if (prose) bodyParts.push(prose);
      }
      bodyParts.push(''); // spacing between sections
    }
  }

  return [{
    layout: 'text-narrative',
    title: reportTitle,
    subtitle: '',
    body: bodyParts.join('\n').trim(),
    note: 'Net-net summary (single slide)',
  }];
}

/**
 * Takes a full report's markdown and returns a slide plan.
 * Detects document type (net-net vs full report) and routes accordingly.
 * @param {string} reportMarkdown - Full Day 10 report or net-net
 * @returns {Array<{ layout, title, subtitle, body, note }>}
 */
function generateSlidePlan(reportMarkdown) {
  // Net-net documents get a single slide — no cover, no closing, no dividers
  if (isNetNet(reportMarkdown)) {
    return generateNetNetPlan(reportMarkdown);
  }

  const sections = splitTopLevelSections(reportMarkdown);
  const allSlides = [];

  // Cover
  const reportTitle = extractReportTitle(reportMarkdown);
  allSlides.push({
    layout: 'cover-dark',
    title: reportTitle,
    subtitle: '',
    body: '',
    note: 'Cover',
  });

  for (const section of sections) {
    const sectionSlides = pickLayoutsForSection(section.content, section.heading);
    allSlides.push(...sectionSlides);
  }

  // Closing
  allSlides.push({
    layout: 'closing-blank',
    title: '',
    subtitle: '',
    body: '',
    note: 'Closing',
  });

  return allSlides;
}

function splitTopLevelSections(markdown) {
  const lines = markdown.split('\n');
  const sections = [];
  let current = null;

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/);
    if (h2) {
      if (current) sections.push(current);
      current = { heading: h2[1].trim(), contentLines: [] };
    } else if (current) {
      current.contentLines.push(line);
    }
  }
  if (current) sections.push(current);

  return sections.map(s => ({
    heading: s.heading,
    content: `## ${s.heading}\n${s.contentLines.join('\n')}`,
  }));
}

function extractReportTitle(markdown) {
  const h1 = markdown.match(/^#\s+(.+)/m);
  return h1 ? h1[1].trim() : 'Altis Diligence Report';
}

// ── Exports ─────────────────────────────────────────────────────────────────────

module.exports = {
  analyzeContent,
  pickLayoutsForSection,
  generateSlidePlan,
  generateNetNetPlan,
  isNetNet,
  detectSectionType,
  MAX_WORDS_PER_SLIDE,
  MAX_BULLETS_PER_SLIDE,
};
