#!/usr/bin/env node
// Chika loop — state machine for the 9-step design loop (/chika).
//
// Why this exists as a file on disk rather than a checklist in the SKILL.md:
// the loop is meant to survive a session handoff, a context compaction, or a
// later turn with different motivation. A process rule written in prose gets
// skipped, because the turn that skips a gate is not the turn that read the
// rule. A state file a fresh agent must read and satisfy before it can advance
// persists across all three.
//
// What this ACTUALLY guarantees (do not oversell it):
//   - steps run in order, once each: no skip-ahead, no silent redo
//   - screenshot evidence is a real PNG, at the declared viewport width, written
//     after the current round started (a stale capture from an earlier round
//     cannot satisfy the gate), and desktop/mobile are not the same file
//   - findings files exist, are non-empty, and were written this round
//   - the loop cannot rotate forever (MAX_ROUNDS hard stop)
// What it CANNOT do: stop the agent calling `advance` from pointing evidence at
// a garbage file. No JSON gate can. That is what the downstream reader is for.
//
// Usage:
//   chika-loop.mjs init <slug> --surface <path-or-url> [--force]
//   chika-loop.mjs status [<slug>]
//   chika-loop.mjs advance <slug> --step N --evidence <spec> [--evidence <spec>...]
//   chika-loop.mjs close <slug> --verdict pass|fix|escalate
//   chika-loop.mjs check [<slug>]              exit 2 (stderr reason) if a PASSED surface changed
//   chika-loop.mjs reopen <slug> [--escalate]  reopen a passed loop at step 4 (round+1); --escalate at the cap
//   chika-loop.mjs list
//
// Evidence specs:
//   note:<text>              free text (steps 1, 4)
//   file:<path>              non-empty file written this round (steps 2,3,6,7,8,9)
//   shot:<viewport>:<path>   PNG at desktop|mobile width, written this round (5, 9)
//   lint:<path>              render-lint JSON (pass:true, same surface), written this round (5, 9)
//
// Two gates beyond ordering, both added after a loop closed "pass", the surface
// was regenerated afterwards with nothing watching it, and it shipped a footer
// collision and a wrapped column head:
//   - steps 5 and 9 also demand a render-lint JSON (geometry is numbers, not
//     judgment: footer gap, wrapped single-line roles, overflow, type floor)
//   - `close --verdict pass` records a sha256 of every local surface file. If
//     you wire `check` into a Stop hook in .claude/settings.json, it blocks the
//     turn from ending while a passed surface differs from its hash until the
//     loop is reopened (`reopen`) or escalated. Claude Code caps consecutive
//     Stop blocks, so this is a strong gate, not an absolute one.

import {
  readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readdirSync, copyFileSync,
} from 'node:fs';
import { join, dirname, resolve, isAbsolute } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

// Derive the repo root from THIS script's location, never a hardcoded path.
// Agent sessions commonly run in git worktrees; a hardcoded root makes a
// worktree session read and write the shared checkout instead of its own, which
// silently corrupts loop state. CHIKA_REPO overrides, for tests and for
// projects that keep loop state elsewhere.
export function repoRoot(from = dirname(fileURLToPath(import.meta.url))) {
  if (process.env.CHIKA_REPO) return process.env.CHIKA_REPO;
  return execFileSync('git', ['-C', from, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
}

// Loop state is working state, not a deliverable: gitignore `.chika/`.
export const stateDir = (root = repoRoot()) => join(root, '.chika');

// Three rounds, then hand it to a human. An unbounded 9->4 rotation is how a
// session burns into the context wall, and a multi-agent run that dies
// mid-pipeline loses its subordinate outputs entirely — they are not
// recoverable in a new session.
export const MAX_ROUNDS = 3;

export const VIEWPORTS = { desktop: 1512, mobile: 390 };

export const STEPS = [
  { n: 1, id: 'frame', title: 'Frame', requires: { notes: 1, noteMin: 40 },
    brief: 'Name the surface, WEB vs REPORTS, what coverage it proves, and inventory the REAL existing components it will reuse. Never invent a component.' },
  { n: 2, id: 'plan', title: 'Coverage Craft plan', requires: { files: 1 },
    brief: 'Run /coverage-craft plan (or your composition doctrine). Write the spec to a file: first-paint inventory, anatomy, chrome budget, disclosure map, states, tokens used.' },
  { n: 3, id: 'direction', title: 'Advisor direction consult', requires: { files: 1 },
    brief: 'Consult your design advisor on the SPEC, before any code exists. Editorial findings are blockers, not polish. Save the findings to a file.' },
  { n: 4, id: 'build', title: 'Build', requires: { notes: 1, noteMin: 20 },
    brief: 'Build it yourself — never delegate the build. Note what was built and every file touched.' },
  { n: 5, id: 'capture', title: 'Capture', requires: { shots: ['desktop', 'mobile'], lint: 1 },
    brief: 'Capture LIVE full-page screenshots at branch HEAD, every affected surface, desktop 1512 and mobile 390. Then run the render lint on the surface and pass its JSON.' },
  { n: 6, id: 'advisor-review', title: 'Advisor review', requires: { files: 1 },
    brief: 'Consult your design advisor on the captured renders, BOTH viewports. Save severity-rated findings to a file.' },
  { n: 7, id: 'coverage-review', title: 'Coverage Craft review', requires: { files: 1 },
    brief: 'Review against the live surface, not the screenshots alone, so structure and tokens can be checked. Save the verdict to a file.' },
  { n: 8, id: 'polish', title: 'Impeccable polish', requires: { files: 1 },
    brief: 'Run your on-token craft reviewer for the chrome pass plus any deterministic drift check. Save findings to a file.' },
  { n: 9, id: 'verify', title: 'Verify & gate', requires: { files: 1, shots: ['desktop', 'mobile'], lint: 1 },
    brief: 'RE-CAPTURE after the fixes and RE-RUN the render lint, then confirm the step-6 findings specifically are resolved. This is a regression check, not a fresh audit — new findings go to the NEXT round, not this one.' },
];

export const AWAITING_CLOSE = STEPS.length + 1;

export const stepDef = (n) => STEPS.find((s) => s.n === n) || null;

// Slug becomes a filename. Reject anything that could escape the state dir.
export function validSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9][a-z0-9-]{0,63}$/.test(slug);
}

export function parseEvidence(specs) {
  return specs.map((spec) => {
    if (typeof spec !== 'string') throw new Error('evidence must be a string');
    if (spec.startsWith('note:')) return { kind: 'note', text: spec.slice(5).trim() };
    if (spec.startsWith('file:')) return { kind: 'file', path: spec.slice(5).trim() };
    if (spec.startsWith('lint:')) {
      const path = spec.slice(5).trim();
      if (!path) throw new Error(`lint evidence needs a path: "${spec}"`);
      return { kind: 'lint', path };
    }
    if (spec.startsWith('shot:')) {
      const rest = spec.slice(5);
      const sep = rest.indexOf(':');
      if (sep < 1) throw new Error(`shot evidence needs a viewport: shot:desktop:<path> (got "${spec}")`);
      const viewport = rest.slice(0, sep).trim();
      const path = rest.slice(sep + 1).trim();
      if (!(viewport in VIEWPORTS)) {
        throw new Error(`unknown viewport "${viewport}" — use ${Object.keys(VIEWPORTS).join(' or ')}`);
      }
      if (!path) throw new Error(`shot evidence needs a path: "${spec}"`);
      return { kind: 'shot', viewport, path };
    }
    throw new Error(`unrecognised evidence "${spec}" — use note:, file:, lint:, or shot:<viewport>:`);
  });
}

// PNG IHDR is at a fixed offset, so dimensions read straight off the header with
// no image dependency. Returns null for anything that is not a PNG.
export function pngSize(buf) {
  const SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!buf || buf.length < 24) return null;
  for (let i = 0; i < 8; i += 1) if (buf[i] !== SIG[i]) return null;
  if (buf.toString('latin1', 12, 16) !== 'IHDR') return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

// Accept the CSS width or an integer device-pixel-ratio multiple of it (retina
// captures are 2x/3x), with 10% slack for scrollbar and chrome differences.
export function viewportMatches(viewport, width) {
  const nominal = VIEWPORTS[viewport];
  if (!nominal || !width) return false;
  for (const dpr of [1, 2, 3]) {
    const target = nominal * dpr;
    if (Math.abs(width - target) <= target * 0.1) return true;
  }
  return false;
}

// Default probe. Tests inject a fake so the pure logic is exercised without I/O.
export function fsProbe(path) {
  if (!existsSync(path)) return { exists: false };
  const st = statSync(path);
  let png = null, json;
  if (st.size > 0) {
    let buf = null;
    try { buf = readFileSync(path); } catch { buf = null; }
    if (buf) {
      png = pngSize(buf);
      if (!png) { try { json = JSON.parse(buf.toString('utf8')); } catch { json = undefined; } }
    }
  }
  return { exists: true, size: st.size, mtimeMs: st.mtimeMs, png, json };
}

// Two spellings of the same surface must compare equal: the loop was started
// with a repo-relative path and the lint was pointed at an absolute one. URLs
// compare after trailing-slash trim. A surface may list several files, comma-separated.
export const isUrl = (s) => /^https?:\/\//i.test(String(s || ''));
export function surfaceKey(surface, root = '') {
  return String(surface || '').split(',').map((s) => s.trim()).filter(Boolean).map((s) => {
    if (isUrl(s)) return s.replace(/\/+$/, '');
    return isAbsolute(s) ? resolve(s) : resolve(root || '/', s);
  }).sort().join(',');
}

export function sha256File(path) {
  try {
    if (!existsSync(path) || !statSync(path).isFile()) return null;
    return createHash('sha256').update(readFileSync(path)).digest('hex');
  } catch { return null; }
}

// How fresh evidence has to be. Normally "after this round started". For step 9
// it is stricter: after step 5 was recorded in this round. The comparison is
// `<=`, not `<`: evidence whose mtime lands exactly on the floor is rejected, so
// the gate fails closed at the boundary. Being strict costs a spurious recapture;
// being lax lets step 9 reuse the step-5 screenshots, which is the whole failure. Step 9 exists to prove
// the fix landed, so re-presenting the very screenshots that showed the defect
// must fail — round-start freshness alone would let them through, which it did
// on the first end-to-end run of this script.
export function evidenceFloor(state, step) {
  if (step === 9) {
    const capture = [...state.history].reverse()
      .find((h) => h.round === state.round && h.step === 5);
    if (capture) return capture.at;
  }
  return state.roundStartedAt;
}

export function checkEvidence(state, step, parsed, probe, root = '') {
  const def = stepDef(step);
  if (!def) throw new Error(`no such step: ${step}`);
  const req = def.requires;
  const floorIso = evidenceFloor(state, step);
  const roundStart = Date.parse(floorIso);
  const since = step === 9 ? `the step-5 capture (${floorIso})` : `round ${state.round} (started ${floorIso})`;
  const problems = [];

  const notes = parsed.filter((e) => e.kind === 'note');
  const files = parsed.filter((e) => e.kind === 'file');
  const shots = parsed.filter((e) => e.kind === 'shot');
  const lints = parsed.filter((e) => e.kind === 'lint');

  if (req.notes) {
    if (notes.length < req.notes) problems.push(`step ${step} needs ${req.notes} note: evidence, got ${notes.length}`);
    for (const n of notes) {
      if (n.text.length < (req.noteMin || 1)) {
        problems.push(`note is ${n.text.length} chars, needs at least ${req.noteMin} — say what you actually did`);
      }
    }
  }

  if (req.files) {
    if (files.length < req.files) problems.push(`step ${step} needs ${req.files} file: evidence, got ${files.length}`);
    for (const f of files) {
      const p = probe(f.path);
      if (!p.exists) { problems.push(`file does not exist: ${f.path}`); continue; }
      if (!p.size) { problems.push(`file is empty: ${f.path}`); continue; }
      if (p.mtimeMs <= roundStart) {
        problems.push(`file predates ${since}: ${f.path} — findings must be from THIS round`);
      }
    }
  }

  if (req.shots) {
    const seen = new Map();
    for (const want of req.shots) {
      const got = shots.filter((s) => s.viewport === want);
      if (!got.length) {
        problems.push(`step ${step} needs a ${want} screenshot (${VIEWPORTS[want]}px) — both viewports are required, every round`);
      }
    }
    for (const s of shots) {
      if (seen.has(s.path)) {
        problems.push(`same file used for ${seen.get(s.path)} and ${s.viewport}: ${s.path}`);
      }
      seen.set(s.path, s.viewport);
      const p = probe(s.path);
      if (!p.exists) { problems.push(`screenshot does not exist: ${s.path}`); continue; }
      if (!p.size) { problems.push(`screenshot is empty: ${s.path}`); continue; }
      if (!p.png) { problems.push(`not a PNG: ${s.path}`); continue; }
      if (!viewportMatches(s.viewport, p.png.width)) {
        problems.push(`${s.path} is ${p.png.width}px wide, not a ${s.viewport} capture (${VIEWPORTS[s.viewport]}px)`);
      }
      if (p.mtimeMs <= roundStart) {
        problems.push(`screenshot predates ${since}: ${s.path} — re-capture at branch HEAD${step === 9 ? ' AFTER the fixes; step 9 proves the fix landed, it cannot reuse the step-5 captures' : ''}`);
      }
    }
  }

  if (req.lint) {
    if (lints.length < req.lint) {
      problems.push(`step ${step} needs a lint: evidence — run: node .claude/skills/chika/scripts/render-lint.mjs ${state.surface} --out <path>.json`);
    }
    for (const l of lints) {
      const p = probe(l.path);
      if (!p.exists) { problems.push(`lint report does not exist: ${l.path}`); continue; }
      if (!p.size) { problems.push(`lint report is empty: ${l.path}`); continue; }
      if (!p.json || typeof p.json !== 'object') { problems.push(`lint report is not JSON: ${l.path}`); continue; }
      if (p.mtimeMs <= roundStart) {
        problems.push(`lint report predates ${since}: ${l.path} — re-run the lint${step === 9 ? ' AFTER the fixes' : ''}`);
      }
      if (!('surface' in p.json) || surfaceKey(p.json.surface, root) !== surfaceKey(state.surface, root)) {
        problems.push(`lint report is for "${p.json.surface}", not this loop's surface "${state.surface}"`);
      }
      if (p.json.pass !== true) {
        const failed = Array.isArray(p.json.checks) ? p.json.checks.filter((c) => c && c.pass === false).map((c) => c.detail || c.id) : [];
        problems.push(`render lint did not pass: ${l.path}${failed.length ? ` — ${failed.join('; ')}` : ''}`);
      }
    }
  }

  if (problems.length) {
    const e = new Error(`step ${step} (${def.title}) evidence rejected:\n  - ${problems.join('\n  - ')}`);
    e.problems = problems;
    throw e;
  }
}

export function newState({ slug, surface, now }) {
  if (!slug) throw new Error('a slug is required: init <slug> --surface <path-or-url>');
  if (!validSlug(slug)) throw new Error(`invalid slug "${slug}" — use lowercase letters, digits and dashes`);
  if (!surface) throw new Error('--surface is required: the path or URL this loop is about');
  return {
    slug, surface, created: now, round: 1, step: 1, roundStartedAt: now,
    closed: false, outcome: null, history: [],
  };
}

export function advanceState(state, { step, evidence, now, probe, root = '' }) {
  if (state.closed) throw new Error(`loop "${state.slug}" is closed (${state.outcome}) — init a new one`);
  if (state.step === AWAITING_CLOSE) {
    throw new Error(`step 9 is complete — run: close ${state.slug} --verdict pass|fix|escalate`);
  }
  if (step !== state.step) {
    const at = stepDef(state.step);
    throw new Error(`out of order: loop is at step ${state.step} (${at.title}), you tried to advance step ${step}. No skipping, no redoing in place.`);
  }
  const parsed = parseEvidence(evidence);
  checkEvidence(state, step, parsed, probe, root);
  return {
    ...state,
    step: step + 1,
    history: [...state.history, { round: state.round, step, at: now, evidence }],
  };
}

// Every local file in the surface gets a sha256 at pass time; URLs and
// directories record null (not enrolled) so `check` can never fail on them.
export function passHashes(surface, hasher = sha256File, root = '') {
  const out = {};
  for (const s of String(surface || '').split(',').map((x) => x.trim()).filter(Boolean)) {
    out[s] = isUrl(s) ? null : hasher(isAbsolute(s) ? s : resolve(root || '/', s));
  }
  return out;
}

export function closeState(state, { verdict, now, hasher = sha256File, root = '' }) {
  if (state.closed) throw new Error(`loop "${state.slug}" is already closed (${state.outcome})`);
  if (state.step !== AWAITING_CLOSE) {
    throw new Error(`step 9 is not complete — loop is at step ${state.step}. Finish the round before closing.`);
  }
  if (verdict === 'pass') {
    return { ...state, closed: true, outcome: 'pass', closedAt: now, passHash: passHashes(state.surface, hasher, root) };
  }
  if (verdict === 'escalate') return { ...state, closed: true, outcome: 'escalate', closedAt: now };
  if (verdict === 'fix') {
    if (state.round >= MAX_ROUNDS) {
      throw new Error(`round cap reached (${MAX_ROUNDS} rounds). Stop and hand it to a human: close ${state.slug} --verdict escalate`);
    }
    return { ...state, round: state.round + 1, step: 4, roundStartedAt: now };
  }
  throw new Error(`unknown verdict "${verdict}" — use pass, fix, or escalate`);
}

// A passed loop whose surface no longer matches its hash. Legacy states (no
// passHash) and null hashes (URL / directory surfaces) are "not enrolled" and
// never reported. Pure: the hasher is injected.
export function surfaceDrift(state, hasher = sha256File, root = '') {
  if (!state || !state.closed || state.outcome !== 'pass' || !state.passHash || typeof state.passHash !== 'object') return [];
  const changed = [];
  for (const [path, was] of Object.entries(state.passHash)) {
    if (was === null || was === undefined) continue;
    const now = hasher(isAbsolute(path) ? path : resolve(root || '/', path));
    if (now !== was) changed.push({ path, was, now });
  }
  return changed;
}

export function reopenState(state, { now, escalate = false, reason = '' }) {
  if (!state.closed || state.outcome !== 'pass') throw new Error(`loop "${state.slug}" is not a passed loop (${state.closed ? state.outcome : 'open'}) — nothing to reopen`);
  const entry = { round: state.round, step: 'reopen', at: now, reason: reason || 'surface changed after pass' };
  if (escalate) return { ...state, outcome: 'escalate', escalatedAt: now, history: [...state.history, { ...entry, step: 'escalate' }] };
  if (state.round >= MAX_ROUNDS) {
    throw new Error(`round cap reached (${MAX_ROUNDS} rounds) — the passed surface changed but there is no round left. Hand it to a human: reopen ${state.slug} --escalate`);
  }
  const { passHash, closedAt, ...rest } = state;
  return { ...rest, closed: false, outcome: null, round: state.round + 1, step: 4, roundStartedAt: now, reopenedAt: now, history: [...state.history, entry] };
}

export function describeNext(state) {
  if (state.closed) return `closed (${state.outcome})`;
  if (state.step === AWAITING_CLOSE) return `round ${state.round}: step 9 done — close --verdict pass|fix|escalate`;
  const d = stepDef(state.step);
  const req = [];
  if (d.requires.notes) req.push(`${d.requires.notes}x note:<text> (min ${d.requires.noteMin} chars)`);
  if (d.requires.files) req.push(`${d.requires.files}x file:<path> (non-empty, written this round)`);
  if (d.requires.shots) req.push(d.requires.shots.map((v) => `shot:${v}:<path> (${VIEWPORTS[v]}px PNG, this round)`).join(' + '));
  if (d.requires.lint) req.push(`lint:<path>.json (pass:true, this round — node .claude/skills/chika/scripts/render-lint.mjs ${state.surface} --out <path>.json)`);
  return `round ${state.round}/${MAX_ROUNDS} · step ${d.n} — ${d.title}\n  ${d.brief}\n  evidence: ${req.join(', ')}`;
}

// ---------------------------------------------------------------- CLI shell

const statePath = (slug, root) => join(stateDir(root), `${slug}.json`);

function readState(slug, root) {
  if (!slug) throw new Error('which loop? pass a slug, or run `list` to see them');
  if (!validSlug(slug)) throw new Error(`invalid slug "${slug}" — lowercase letters, digits and dashes only`);
  const p = statePath(slug, root);
  if (!existsSync(p)) throw new Error(`no chika loop "${slug}" — run \`list\`, or start it with \`init ${slug} --surface <path>\``);
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (e) {
    throw new Error(`loop state for "${slug}" is unreadable (${e.message}). Do not hand-edit ${p} — restart with \`init ${slug} --force\`, which backs the old file up.`);
  }
}

function writeState(state, root) {
  const dir = stateDir(root);
  mkdirSync(dir, { recursive: true });
  writeFileSync(statePath(state.slug, root), `${JSON.stringify(state, null, 2)}\n`);
}

export function parseArgv(argv) {
  const out = { _: [], evidence: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--evidence' || a === '-e') { out.evidence.push(argv[++i]); continue; }
    if (a === '--force') { out.force = true; continue; }
    if (a === '--escalate') { out.escalate = true; continue; }
    if (a.startsWith('--')) { out[a.slice(2)] = argv[++i]; continue; }
    out._.push(a);
  }
  return out;
}

export function main(argv) {
  try {
    return dispatch(argv);
  } catch (e) {
    // One line, never a stack trace: the caller is an agent mid-loop, and a
    // stack trace reads as "tool broken" rather than "you skipped step N".
    console.error(e.message);
    return 1;
  }
}

function dispatch(argv) {
  const args = parseArgv(argv);
  const [cmd, slug] = args._;
  const root = repoRoot();
  const now = new Date().toISOString();

  if (!cmd || cmd === 'help') {
    console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n')
      .filter((l) => l.startsWith('//')).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
    return 0;
  }

  if (cmd === 'list') {
    const dir = stateDir(root);
    if (!existsSync(dir)) { console.log('no chika loops yet'); return 0; }
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    if (!files.length) { console.log('no chika loops yet'); return 0; }
    for (const f of files) {
      let s;
      try { s = JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch { console.log(`${f.padEnd(24)} UNREADABLE — do not hand-edit; init <slug> --force backs it up`); continue; }
      console.log(`${String(s.slug || f).padEnd(24)} r${s.round} step ${s.step === AWAITING_CLOSE ? '9(done)' : s.step}${s.closed ? ` — closed: ${s.outcome}` : ''}`);
    }
    return 0;
  }

  if (cmd === 'init') {
    const state = newState({ slug, surface: args.surface, now });
    const p = statePath(slug, root);
    if (existsSync(p)) {
      if (!args.force) {
        console.error(`loop "${slug}" already exists at ${p} — pass --force to restart it (the old state is backed up)`);
        return 1;
      }
      const bak = `${p}.bak-${now.replace(/[:.]/g, '')}`;
      copyFileSync(p, bak);
      console.error(`backed up existing state to ${bak}`);
    }
    writeState(state, root);
    console.log(`chika loop "${slug}" started on ${state.surface}\n\n${describeNext(state)}`);
    return 0;
  }

  if (cmd === 'status') {
    if (!slug) return main(['list']);
    const state = readState(slug, root);
    console.log(`${state.slug} — ${state.surface}\n${describeNext(state)}`);
    if (state.history.length) {
      console.log('\ncompleted:');
      for (const h of state.history) {
        const d = stepDef(h.step);
        console.log(`  r${h.round} ${d ? `step ${h.step} (${d.title})` : `${h.step}${h.reason ? ` — ${h.reason}` : ''}`} ${h.at}`);
      }
    }
    return 0;
  }

  if (cmd === 'advance') {
    const state = readState(slug, root);
    const step = Number(args.step);
    if (!Number.isInteger(step)) { console.error('--step N is required'); return 1; }
    try {
      const next = advanceState(state, { step, evidence: args.evidence, now, probe: fsProbe, root });
      writeState(next, root);
      console.log(`step ${step} recorded.\n\n${describeNext(next)}`);
      return 0;
    } catch (e) { console.error(e.message); return 1; }
  }

  if (cmd === 'close') {
    const state = readState(slug, root);
    try {
      const next = closeState(state, { verdict: args.verdict, now, root });
      writeState(next, root);
      if (next.closed && next.outcome === 'pass') {
        const enrolled = Object.entries(next.passHash || {}).filter(([, h]) => h).map(([p]) => p);
        const skipped = Object.entries(next.passHash || {}).filter(([, h]) => !h).map(([p]) => p);
        console.log(`loop "${slug}" closed: pass — surface hash recorded for ${enrolled.length ? enrolled.join(', ') : 'nothing'}`);
        if (skipped.length) console.error(`not enrolled (URL, directory or missing): ${skipped.join(', ')} — \`check\` will not watch these`);
      } else if (next.closed) console.log(`loop "${slug}" closed: ${next.outcome}`);
      else console.log(`round ${state.round} closed with fixes needed.\n\n${describeNext(next)}`);
      return 0;
    } catch (e) { console.error(e.message); return 1; }
  }

  if (cmd === 'reopen') {
    const state = readState(slug, root);
    try {
      const next = reopenState(state, { now, escalate: Boolean(args.escalate), reason: args.reason });
      writeState(next, root);
      if (next.closed) console.log(`loop "${slug}" escalated — hand it to a human`);
      else console.log(`loop "${slug}" reopened.\n\n${describeNext(next)}`);
      return 0;
    } catch (e) { console.error(e.message); return 1; }
  }

  // The Stop-hook gate. Never throws, never blocks on legacy or unreadable state;
  // exit 2 + a block decision only when a PASSED surface differs from its hash.
  if (cmd === 'check') {
    const dir = stateDir(root);
    if (!existsSync(dir)) return 0;
    const files = slug ? [`${slug}.json`] : readdirSync(dir).filter((f) => f.endsWith('.json'));
    const drift = [];
    for (const f of files) {
      let st;
      try { st = JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch { console.error(`chika check: ${f} is unreadable — not gating on it`); continue; }
      for (const d of surfaceDrift(st, sha256File, root)) drift.push({ slug: st.slug, ...d });
    }
    if (!drift.length) return 0;
    const lines = drift.map((d) => `${d.slug}: ${d.path} changed after the loop passed`);
    const reason = `${lines.join('; ')}. Passed design work was edited without re-verification. Run \`node .claude/skills/chika/scripts/chika-loop.mjs reopen <slug>\` and take it back through steps 4–9 (or \`reopen <slug> --escalate\` at the round cap) before ending the turn.`;
    // Exit 2 is the documented Stop-hook block; stderr is what Claude sees.
    console.error(`CHIKA GATE: ${reason}`);
    return 2;
  }

  console.error(`unknown command "${cmd}" — try: init, status, advance, close, check, reopen, list`);
  return 1;
}

if (process.argv[1] && process.argv[1].endsWith('chika-loop.mjs')) {
  process.exit(main(process.argv.slice(2)));
}
