'use strict';

/**
 * report-to-slides.js
 *
 * Two-pass orchestrator: markdown report → JSON slide plan → Google Slides deck.
 *
 * Pass 1 (plan):  Reads markdown, runs layout-picker, writes JSON plan to disk.
 * Pass 2 (exec):  Creates presentation from template, executes plan via Slides API.
 *
 * Usage:
 *   # Full pipeline — plan + execute
 *   node report-to-slides.js <report.md> [--title "Deck Title"]
 *
 *   # Plan only — inspect before executing
 *   node report-to-slides.js <report.md> --plan-only
 *
 *   # Execute existing plan
 *   node report-to-slides.js --exec <plan.json>
 *
 *   # Dry run — show plan without writing or executing
 *   node report-to-slides.js <report.md> --dry-run
 */

const fs   = require('fs');
const path = require('path');

const { generateSlidePlan } = require('./layout-picker');
const {
  SLIDE_LAYOUTS,
  createPresentation,
  executeSlidePlan,
} = require('./google-slides-template');
const placeholderMap = require('./template-placeholders.json').layouts;

// ── Plan generation ─────────────────────────────────────────────────────────────

/**
 * Converts a layout-picker slide plan into the format expected by executeSlidePlan.
 * Maps layout names → template indices and builds content map keyed by placeholder type.
 *
 * executeSlidePlan uses deleteText + insertText by element ID,
 * finding elements by placeholder type (TITLE, BODY, SUBTITLE, CENTERED_TITLE).
 */
function compilePlan(slidePlan) {
  const compiled = [];

  for (const slide of slidePlan) {
    const layoutName = slide.layout;
    const layoutInfo = placeholderMap[layoutName];

    if (!layoutInfo) {
      console.warn(`  ⚠ Unknown layout '${layoutName}' — skipping slide: ${slide.title}`);
      continue;
    }

    // Build content map keyed by Google Slides placeholder type
    const content = {};

    if (slide.title) {
      content.TITLE = slide.title;
      // Some cover slides use CENTERED_TITLE instead of TITLE
      if (layoutName.startsWith('cover')) {
        content.CENTERED_TITLE = slide.title;
      }
    }
    if (slide.subtitle) {
      content.SUBTITLE = slide.subtitle;
    }
    if (slide.body) {
      content.BODY = slide.body;
    }

    compiled.push({
      layoutIndex: layoutInfo.index,
      layoutName,
      content,
      title: slide.title,
      note: slide.note,
      _rhythmWarning: slide._rhythmWarning,
    });
  }

  return compiled;
}

// ── Plan display ────────────────────────────────────────────────────────────────

function printPlanSummary(compiledPlan) {
  console.log(`\n━━ Slide Plan (${compiledPlan.length} slides) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  const layoutCounts = {};
  let warningCount = 0;

  for (let i = 0; i < compiledPlan.length; i++) {
    const s = compiledPlan[i];
    const warn = s._rhythmWarning ? ' ⚠' : '';
    if (s._rhythmWarning) warningCount++;

    layoutCounts[s.layoutName] = (layoutCounts[s.layoutName] || 0) + 1;

    const contentCount = Object.keys(s.content || {}).length;
    const titlePreview = (s.title || '(no title)').substring(0, 50);
    console.log(
      `  ${String(i + 1).padStart(3)}. [${s.layoutName}]`.padEnd(40) +
      `${contentCount} fld`.padEnd(10) +
      titlePreview + warn
    );
  }

  console.log('\n── Layout distribution ──');
  for (const [name, count] of Object.entries(layoutCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${name}: ${count}`);
  }

  if (warningCount > 0) {
    console.log(`\n  ⚠ ${warningCount} rhythm warnings — consecutive text-heavy slides`);
  }
  console.log('');
}

// ── Execution ───────────────────────────────────────────────────────────────────

async function executeFromPlan(compiledPlan, title) {
  console.log(`\n━━ Creating presentation: "${title}" ━━━━━━━━━━━━━━━━━━━\n`);

  // 1. Create presentation from template
  console.log('  1/3  Copying template...');
  const { presentationId, url } = await createPresentation(title);
  console.log(`        → ${url}`);

  // 2. Execute the plan
  console.log(`  2/3  Building ${compiledPlan.length} slides (duplicate → replace → reorder → cleanup)...`);
  const { slideIds, errors } = await executeSlidePlan(presentationId, compiledPlan);
  console.log(`        → ${slideIds.length} slides created`);

  if (errors.length > 0) {
    console.log(`        ⚠ ${errors.length} errors:`);
    errors.forEach(e => console.log(`          - ${e}`));
  }

  // 3. Done
  console.log(`  3/3  Done.\n`);
  console.log(`  📎 ${url}\n`);

  return { presentationId, url, slideCount: slideIds.length };
}

// ── CLI ─────────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  const dryRun   = args.includes('--dry-run');
  const planOnly = args.includes('--plan-only');
  const execMode = args.includes('--exec');

  const titleIdx = args.indexOf('--title');
  const customTitle = titleIdx >= 0 ? args[titleIdx + 1] : null;

  // Mode: execute existing plan
  if (execMode) {
    const planFile = args.find(a => a.endsWith('.json'));
    if (!planFile) {
      console.error('Usage: node report-to-slides.js --exec <plan.json> [--title "..."]');
      process.exit(1);
    }
    const plan = JSON.parse(fs.readFileSync(planFile, 'utf-8'));
    const title = customTitle || plan.title || 'Altis Diligence Report';
    await executeFromPlan(plan.compiled, title);
    return;
  }

  // Mode: generate plan from markdown
  const mdFile = args.find(a => a.endsWith('.md'));
  if (!mdFile) {
    console.error('Usage: node report-to-slides.js <report.md> [--plan-only] [--dry-run] [--title "..."]');
    process.exit(1);
  }

  const markdown = fs.readFileSync(mdFile, 'utf-8');
  const reportTitle = customTitle || extractTitle(markdown);

  console.log(`\n  Report: ${path.basename(mdFile)}`);
  console.log(`  Title:  ${reportTitle}`);

  // Pass 1: Generate plan
  console.log('\n  Pass 1: Analyzing content and picking layouts...');
  const slidePlan = generateSlidePlan(markdown);
  const compiledPlan = compilePlan(slidePlan);

  printPlanSummary(compiledPlan);

  // Save plan to disk
  const planPath = mdFile.replace('.md', '-slide-plan.json');
  const planOutput = {
    title: reportTitle,
    source: path.basename(mdFile),
    generated: new Date().toISOString(),
    slideCount: compiledPlan.length,
    compiled: compiledPlan,
  };
  fs.writeFileSync(planPath, JSON.stringify(planOutput, null, 2));
  console.log(`  Plan saved: ${planPath}`);

  if (dryRun) {
    console.log('\n  --dry-run: No presentation created.\n');
    return;
  }

  if (planOnly) {
    console.log('\n  --plan-only: Review the plan, then run:');
    console.log(`  node report-to-slides.js --exec "${planPath}" --title "${reportTitle}"\n`);
    return;
  }

  // Pass 2: Execute
  await executeFromPlan(compiledPlan, reportTitle);
}

function extractTitle(markdown) {
  const h1 = markdown.match(/^#\s+(.+)/m);
  return h1 ? h1[1].trim() : 'Altis Diligence Report';
}

if (require.main === module) {
  main().catch(err => {
    console.error('\nFatal error:', err.message);
    if (err.response?.data) {
      console.error(JSON.stringify(err.response.data, null, 2));
    }
    process.exit(1);
  });
}

module.exports = { compilePlan, executeFromPlan, printPlanSummary };
