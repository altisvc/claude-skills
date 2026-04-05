'use strict';

/**
 * introspect-deck.js
 *
 * Extracts a compact structural fingerprint from a Google Slides presentation.
 * Outputs one line per slide with: index, word count, element types, image count,
 * placeholder types, and first ~80 chars of title text.
 *
 * Usage:
 *   node design-system/templates/introspect-deck.js <presentationId> [--json]
 *
 * The --json flag outputs machine-readable JSON instead of the human-readable table.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '../../gcp-oauth.keys.json');
const TOKEN_PATH       = path.join(__dirname, '../../gcp-token.json');

async function getAuth() {
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH)).installed;
  const oauth2 = new google.auth.OAuth2(
    creds.client_id, creds.client_secret, 'http://localhost:3000/oauth2callback'
  );
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
  oauth2.setCredentials(token);
  return oauth2;
}

function extractText(element) {
  if (!element.shape || !element.shape.text) return '';
  return element.shape.text.textElements
    .filter(te => te.textRun)
    .map(te => te.textRun.content)
    .join('')
    .trim();
}

function classifyElement(element) {
  if (element.image) return 'image';
  if (element.table) return 'table';
  if (element.sheetsChart) return 'chart';
  if (element.line) return 'line';
  if (element.shape) {
    const ph = element.shape.placeholder;
    if (ph) return `placeholder:${ph.type}`;
    const text = extractText(element);
    if (text.length === 0) return 'shape:empty';
    if (text.length < 50) return 'shape:label';
    return 'shape:text';
  }
  if (element.elementGroup) return 'group';
  return 'other';
}

function analyzeSlide(slide, index) {
  const elements = slide.pageElements || [];

  let wordCount = 0;
  let imageCount = 0;
  let titleText = '';
  const elementTypes = {};
  const placeholderTypes = [];

  for (const el of elements) {
    const type = classifyElement(el);
    elementTypes[type] = (elementTypes[type] || 0) + 1;

    if (type === 'image') imageCount++;

    if (type.startsWith('placeholder:')) {
      const phType = type.split(':')[1];
      placeholderTypes.push(phType);
      if (phType === 'TITLE' || phType === 'CENTERED_TITLE') {
        titleText = extractText(el).substring(0, 80);
      }
    }

    const text = extractText(el);
    if (text) {
      wordCount += text.split(/\s+/).filter(w => w.length > 0).length;
    }
  }

  // If no placeholder title found, try to get the first substantial text
  if (!titleText) {
    for (const el of elements) {
      const text = extractText(el);
      if (text && text.length > 3 && text.length < 120) {
        titleText = text.substring(0, 80);
        break;
      }
    }
  }

  return {
    index,
    objectId: slide.objectId,
    wordCount,
    imageCount,
    elementCount: elements.length,
    elementTypes,
    placeholderTypes,
    titleText: titleText.replace(/\n/g, ' ').trim(),
    bgColor: extractBgColor(slide),
  };
}

function extractBgColor(slide) {
  try {
    const bg = slide.slideProperties?.pageBackgroundFill;
    if (!bg) return 'default';
    if (bg.solidFill) {
      const c = bg.solidFill.color?.rgbColor;
      if (!c) return 'theme';
      const r = Math.round((c.red || 0) * 255);
      const g = Math.round((c.green || 0) * 255);
      const b = Math.round((c.blue || 0) * 255);
      const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
      if (hex === '#030f1f' || hex === '#03101f') return 'navy';
      if (hex === '#ffffff') return 'white';
      return hex;
    }
    return 'other';
  } catch { return 'unknown'; }
}

async function introspect(presentationId) {
  const auth = await getAuth();
  const slides = google.slides({ version: 'v1', auth });

  const res = await slides.presentations.get({ presentationId });
  const prs = res.data;

  return {
    title: prs.title,
    slideCount: prs.slides.length,
    slides: prs.slides.map((s, i) => analyzeSlide(s, i)),
  };
}

function printTable(result) {
  console.log(`\n${result.title} (${result.slideCount} slides)\n`);
  console.log(
    'Idx'.padEnd(4) +
    'Words'.padEnd(7) +
    'Imgs'.padEnd(5) +
    'Elems'.padEnd(6) +
    'Bg'.padEnd(8) +
    'Placeholders'.padEnd(30) +
    'Title'
  );
  console.log('-'.repeat(120));

  for (const s of result.slides) {
    console.log(
      String(s.index).padEnd(4) +
      String(s.wordCount).padEnd(7) +
      String(s.imageCount).padEnd(5) +
      String(s.elementCount).padEnd(6) +
      s.bgColor.padEnd(8) +
      (s.placeholderTypes.join(', ') || '-').padEnd(30) +
      s.titleText.substring(0, 50)
    );
  }
}

// ── CLI ─────────────────────────────────────────────────────────────────────────

if (require.main === module) {
  const args = process.argv.slice(2);
  const presentationId = args.find(a => !a.startsWith('--'));
  const jsonMode = args.includes('--json');

  if (!presentationId) {
    console.error('Usage: node introspect-deck.js <presentationId> [--json]');
    process.exit(1);
  }

  introspect(presentationId)
    .then(result => {
      if (jsonMode) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        printTable(result);
      }
    })
    .catch(e => { console.error('Error:', e.message); process.exit(1); });
}

module.exports = { introspect };
