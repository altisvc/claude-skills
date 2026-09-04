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
//   chika-loop.mjs list
//
// Evidence specs:
//   note:<text>              free text (steps 1, 4)
//   file:<path>              non-empty file written this round (steps 2,3,6,7,8,9)
//   shot:<viewport>:<path>   PNG at desktop|mobile width, written this round (5, 9)

import {
  readFileSync, writeFileSync, existsSync, mkdirSync, statSync, readdirSync, copyFileSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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
  { n: 5, id: 'capture', title: 'Capture', requires: { shots: ['desktop', 'mobile'] },
    brief: 'Capture LIVE full-page screenshots at branch HEAD, every affected surface, desktop 1512 and mobile 390.' },
  { n: 6, id: 'advisor-review', title: 'Advisor review', requires: { files: 1 },
    brief: 'Consult your design advisor on the captured renders, BOTH viewports. Save severity-rated findings to a file.' },
  { n: 7, id: 'coverage-review', title: 'Coverage Craft review', requires: { files: 1 },
    brief: 'Review against the live surface, not the screenshots alone, so structure and tokens can be checked. Save the verdict to a file.' },
  { n: 8, id: 'polish', title: 'Impeccable polish', requires: { files: 1 },
    brief: 'Run your on-token craft reviewer for the chrome pass plus any deterministic drift check. Save findings to a file.' },
  { n: 9, id: 'verify', title: 'Verify & gate', requires: { files: 1, shots: ['desktop', 'mobile'] },
    brief: 'RE-CAPTURE after the fixes, then confirm the step-6 findings specifically are resolved. This is a regression check, not a fresh audit — new findings go to the NEXT round, not this one.' },
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
    throw new Error(`unrecognised evidence "${spec}" — use note:, file:, or shot:<viewport>:`);
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
  let png = null;
  if (st.size > 0) {
    try { png = pngSize(readFileSync(path)); } catch { png = null; }
  }
  return { exists: true, size: st.size, mtimeMs: st.mtimeMs, png };
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

export function checkEvidence(state, step, parsed, probe) {
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

export function advanceState(state, { step, evidence, now, probe }) {
  if (state.closed) throw new Error(`loop "${state.slug}" is closed (${state.outcome}) — init a new one`);
  if (state.step === AWAITING_CLOSE) {
    throw new Error(`step 9 is complete — run: close ${state.slug} --verdict pass|fix|escalate`);
  }
  if (step !== state.step) {
    const at = stepDef(state.step);
    throw new Error(`out of order: loop is at step ${state.step} (${at.title}), you tried to advance step ${step}. No skipping, no redoing in place.`);
  }
  const parsed = parseEvidence(evidence);
  checkEvidence(state, step, parsed, probe);
  return {
    ...state,
    step: step + 1,
    history: [...state.history, { round: state.round, step, at: now, evidence }],
  };
}

export function closeState(state, { verdict, now }) {
  if (state.closed) throw new Error(`loop "${state.slug}" is already closed (${state.outcome})`);
  if (state.step !== AWAITING_CLOSE) {
    throw new Error(`step 9 is not complete — loop is at step ${state.step}. Finish the round before closing.`);
  }
  if (verdict === 'pass') return { ...state, closed: true, outcome: 'pass', closedAt: now };
  if (verdict === 'escalate') return { ...state, closed: true, outcome: 'escalate', closedAt: now };
  if (verdict === 'fix') {
    if (state.round >= MAX_ROUNDS) {
      throw new Error(`round cap reached (${MAX_ROUNDS} rounds). Stop and hand it to a human: close ${state.slug} --verdict escalate`);
    }
    return { ...state, round: state.round + 1, step: 4, roundStartedAt: now };
  }
  throw new Error(`unknown verdict "${verdict}" — use pass, fix, or escalate`);
}

export function describeNext(state) {
  if (state.closed) return `closed (${state.outcome})`;
  if (state.step === AWAITING_CLOSE) return `round ${state.round}: step 9 done — close --verdict pass|fix|escalate`;
  const d = stepDef(state.step);
  const req = [];
  if (d.requires.notes) req.push(`${d.requires.notes}x note:<text> (min ${d.requires.noteMin} chars)`);
  if (d.requires.files) req.push(`${d.requires.files}x file:<path> (non-empty, written this round)`);
  if (d.requires.shots) req.push(d.requires.shots.map((v) => `shot:${v}:<path> (${VIEWPORTS[v]}px PNG, this round)`).join(' + '));
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
      const s = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      console.log(`${s.slug.padEnd(24)} r${s.round} step ${s.step === AWAITING_CLOSE ? '9(done)' : s.step}${s.closed ? ` — closed: ${s.outcome}` : ''}`);
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
      for (const h of state.history) console.log(`  r${h.round} step ${h.step} (${stepDef(h.step).title}) ${h.at}`);
    }
    return 0;
  }

  if (cmd === 'advance') {
    const state = readState(slug, root);
    const step = Number(args.step);
    if (!Number.isInteger(step)) { console.error('--step N is required'); return 1; }
    try {
      const next = advanceState(state, { step, evidence: args.evidence, now, probe: fsProbe });
      writeState(next, root);
      console.log(`step ${step} recorded.\n\n${describeNext(next)}`);
      return 0;
    } catch (e) { console.error(e.message); return 1; }
  }

  if (cmd === 'close') {
    const state = readState(slug, root);
    try {
      const next = closeState(state, { verdict: args.verdict, now });
      writeState(next, root);
      if (next.closed) console.log(`loop "${slug}" closed: ${next.outcome}`);
      else console.log(`round ${state.round} closed with fixes needed.\n\n${describeNext(next)}`);
      return 0;
    } catch (e) { console.error(e.message); return 1; }
  }

  console.error(`unknown command "${cmd}" — try: init, status, advance, close, list`);
  return 1;
}

if (process.argv[1] && process.argv[1].endsWith('chika-loop.mjs')) {
  process.exit(main(process.argv.slice(2)));
}
