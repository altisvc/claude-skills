#!/usr/bin/env node
// Render lint — deterministic geometry checks for a design surface, as `lint:`
// evidence for the chika loop (steps 5 and 9). Geometry is numbers, not judgment:
// a wrapped column head and an 8px footer collision will both pass an advisor
// regression check that is scoped to its own findings list.
//
// Needs `playwright` resolvable from the repo this file is installed into.
//
// Usage: render-lint.mjs <file-or-url> [--out <report.json>] [--floor 13] [--mobile 390] [--desktop 1920] [--gap 24]
//   exit 0 = pass, 1 = fail, 2 = usage. Prints a one-line summary per check.
//   The JSON report carries `surface` exactly as given, so the loop can match it
//   to the state's surface (spellings are normalised on the loop side).
//
// Checks (each skips cleanly when its selectors are absent):
//   overflow      an element exits its nearest overflow:hidden ancestor, or the document, at the desktop width
//   footer-gap    last body content sits >= --gap px above `.slide-foot` / `footer`
//   wrapped       single-line roles (h1, h2, .lbl, .th, .statline, [data-oneline]) wrap
//   split-link    a hyperlink broken across two lines (a split name reads as two names)
//   row-align     children of a shared header row (.covhead, [data-row]) share a bottom edge
//   type-floor    no rendered text below --floor px
//   mobile-x      no horizontal document overflow at the mobile width
//   mobile-overflow  no element clipped by an overflow:hidden ancestor or the viewport at the mobile width
//   mobile-split-link  no hyperlink broken across lines at the mobile width
import { chromium } from 'playwright';
import { writeFileSync, realpathSync, existsSync } from 'node:fs';

const argv = process.argv.slice(2);
const opt = { floor: 13, mobile: 390, desktop: 1920, gap: 24, out: null };
const pos = [];
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  if (a === '--out') opt.out = argv[++i];
  else if (a.startsWith('--')) opt[a.slice(2)] = Number(argv[++i]);
  else pos.push(a);
}
const surface = pos[0];
if (!surface) { console.error('usage: render-lint.mjs <file-or-url> [--out report.json]'); process.exit(2); }
const isUrl = /^https?:\/\//i.test(surface);
if (!isUrl && !existsSync(surface)) { console.error(`no such file: ${surface}`); process.exit(2); }
const target = isUrl ? surface : 'file://' + realpathSync(surface);

const browser = await chromium.launch();
const checks = [];
const add = (id, pass, detail) => checks.push({ id, pass, detail });

// ---- desktop pass
{
  const page = await browser.newPage({ viewport: { width: opt.desktop, height: 1080 } });
  await page.goto(target, { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
  const r = await page.evaluate(({ floor, gap }) => {
    const out = [];
    const px = (n) => Math.round(n);
    const vis = (e) => { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || e.getBoundingClientRect().width <= 0) return false; const d = e.closest('details:not([open])'); return !d || !!e.closest('summary'); }; // closed <details> content keeps a layout box in Chromium but is not rendered
    const all = [...document.body.querySelectorAll('*')].filter(vis);
    // overflow: nearest overflow:hidden ancestor, else the document
    let over = null;
    for (const e of all) {
      if (e.hasAttribute('data-bleed')) continue; // a motif meant to run off the page edge
      if (getComputedStyle(e).position === 'fixed') continue; // a fixed element (a floating button) is never clipped by an ancestor
      const r = e.getBoundingClientRect();
      let anc = e.parentElement, box = null;
      while (anc) { const cs = getComputedStyle(anc); if (cs.position === 'fixed') break; if (/hidden|clip/.test(cs.overflow + cs.overflowX + cs.overflowY)) { box = anc.getBoundingClientRect(); break; } anc = anc.parentElement; } // a fixed ancestor (a floating button's icon) escapes every clipping box above it
      const limitR = box ? box.right : document.documentElement.scrollWidth;
      const limitB = box ? box.bottom : Infinity;
      if (r.right > limitR + 1 || r.bottom > limitB + 1) { over = `<${e.tagName.toLowerCase()}${e.className ? ' class="' + e.className + '"' : ''}> exits ${box ? 'its overflow:hidden ancestor' : 'the document'} by ${px(Math.max(r.right - limitR, r.bottom - limitB))}px`; break; }
    }
    out.push(['overflow', !over, over || 'nothing exits its container']);
    // footer gap
    const foot = document.querySelector('.slide-foot, footer');
    if (foot && vis(foot)) {
      const top = foot.getBoundingClientRect().top;
      const body = foot.parentElement;
      const leaves = [...body.querySelectorAll('*')].filter((e) => vis(e) && !foot.contains(e) && (e.children.length === 0 || e.classList.contains('row')));
      const last = leaves.length ? Math.max(...leaves.map((e) => e.getBoundingClientRect().bottom)) : top;
      const g = top - last;
      out.push(['footer-gap', g >= gap, `footer gap ${px(g)}px (min ${gap}px)`]);
    } else out.push(['footer-gap', true, 'no footer element — skipped']);
    // wrapped single-line roles
    const wrapped = [];
    for (const e of document.querySelectorAll('h1, h2, .lbl, .th, .statline, [data-oneline]')) {
      if (!vis(e)) continue;
      const cs = getComputedStyle(e); let lh = parseFloat(cs.lineHeight); if (!Number.isFinite(lh)) lh = parseFloat(cs.fontSize) * 1.2;
      const h = e.getBoundingClientRect().height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom); // the text box, not the padding
      if (h > lh * 1.6) wrapped.push(`${e.tagName.toLowerCase()}${e.className ? '.' + String(e.className).split(' ')[0] : ''} "${e.textContent.trim().slice(0, 32)}" ${px(h)}px tall`);
    }
    out.push(['wrapped', !wrapped.length, wrapped.length ? wrapped.join('; ') : 'no single-line role wraps']);
    // continued tables: a table or list that carries on from another page is a composition failure
    const cont = [...document.querySelectorAll('h1, h2, h3, h4, th, caption, .sub')].filter((e) => vis(e) && /\bcontinued\b|\bcont\.|\(cont'd\)/i.test(e.textContent)).map((e) => `${e.tagName.toLowerCase()} "${e.textContent.trim().slice(0, 40)}"`);
    out.push(['continued', !cont.length, cont.length ? `continued across pages: ${cont.join('; ')}` : 'no table continues across pages']);
    // split links: a hyperlinked name broken across lines reads as two names
    const split = [];
    for (const e of document.querySelectorAll('a')) {
      if (!vis(e) || e.children.length) continue;
      const rects = e.getClientRects(); if (rects.length < 2) continue;
      const tops = new Set([...rects].map((r) => px(r.top)));
      if (tops.size > 1) split.push(`"${e.textContent.trim().slice(0, 32)}"`);
    }
    out.push(['split-link', !split.length, split.length ? `links broken across lines: ${split.slice(0, 6).join(', ')}${split.length > 6 ? ` +${split.length - 6}` : ''}` : 'no link breaks across lines']);
    // shared rows align
    const mis = [];
    for (const row of document.querySelectorAll('.covhead, [data-row]')) {
      if (!vis(row)) continue;
      const bs = [...row.children].filter(vis).map((c) => px(c.getBoundingClientRect().bottom));
      if (new Set(bs).size > 1) mis.push(`row bottoms ${bs.join('/')}`);
    }
    out.push(['row-align', !mis.length, mis.length ? mis.join('; ') : 'shared rows aligned']);
    // type floor
    let small = null;
    for (const e of all) { if (e.children.length || !e.textContent.trim()) continue; const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < floor) { small = `${fs}px "${e.textContent.trim().slice(0, 30)}"`; break; } }
    out.push(['type-floor', !small, small ? `text below ${floor}px: ${small}` : `no text below ${floor}px`]);
    return out;
  }, { floor: opt.floor, gap: opt.gap });
  for (const [id, pass, detail] of r) add(id, pass, detail);
  await page.close();
}

// ---- mobile pass
{
  const page = await browser.newPage({ viewport: { width: opt.mobile, height: 800 } });
  await page.goto(target, { waitUntil: 'networkidle' }); await page.waitForTimeout(300);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  add('mobile-x', sw <= opt.mobile + 1, `document is ${sw}px wide at ${opt.mobile}px viewport`);
  // overflow:hidden keeps scrollWidth honest while clipping text — check elements against their clipping ancestor
  const mover = await page.evaluate(() => {
    const px = (n) => Math.round(n);
    const vis = (e) => { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || e.getBoundingClientRect().width <= 0) return false; const d = e.closest('details:not([open])'); return !d || !!e.closest('summary'); }; // closed <details> content keeps a layout box in Chromium but is not rendered
    for (const e of document.body.querySelectorAll('*')) {
      if (!vis(e) || e.hasAttribute('data-bleed')) continue;
      const r = e.getBoundingClientRect();
      const fixed = getComputedStyle(e).position === 'fixed'; // clipped by the viewport only, never by an ancestor
      let anc = fixed ? null : e.parentElement, box = null;
      while (anc) { const cs = getComputedStyle(anc); if (cs.position === 'fixed') break; if (/hidden|clip/.test(cs.overflow + cs.overflowX + cs.overflowY)) { box = anc.getBoundingClientRect(); break; } anc = anc.parentElement; } // a fixed ancestor (a floating button's icon) escapes every clipping box above it
      const limitR = box ? box.right : document.documentElement.clientWidth;
      if (r.right > limitR + 1) return `<${e.tagName.toLowerCase()}${e.className ? ' class="' + String(e.className).split(' ')[0] + '"' : ''}> "${e.textContent.trim().slice(0, 24)}" exits ${box ? 'its clipping ancestor' : 'the viewport'} by ${px(r.right - limitR)}px`;
    }
    return null;
  });
  add('mobile-overflow', !mover, mover || 'nothing clipped at the mobile width');
  const msplit = await page.evaluate(() => {
    const out = [];
    for (const e of document.querySelectorAll('a')) {
      if (e.children.length) continue; const cs = getComputedStyle(e); if (cs.display === 'none') continue;
      const rects = e.getClientRects(); if (rects.length < 2) continue;
      if (new Set([...rects].map((r) => Math.round(r.top))).size > 1) out.push(`"${e.textContent.trim().slice(0, 32)}"`);
    }
    return out;
  });
  add('mobile-split-link', !msplit.length, msplit.length ? `links broken across lines at ${opt.mobile}px: ${msplit.slice(0, 6).join(', ')}${msplit.length > 6 ? ` +${msplit.length - 6}` : ''}` : 'no link breaks across lines at the mobile width');
  await page.close();
}
await browser.close();

const pass = checks.every((c) => c.pass);
const report = { surface, at: new Date().toISOString(), pass, checks };
for (const c of checks) console.log(`  ${c.pass ? 'PASS' : 'FAIL'}  ${c.id.padEnd(11)} ${c.detail}`);
console.log(pass ? 'RENDER LINT PASS' : `RENDER LINT FAILED — ${checks.filter((c) => !c.pass).length}`);
if (opt.out) writeFileSync(opt.out, JSON.stringify(report, null, 2) + '\n');
process.exit(pass ? 0 : 1);
