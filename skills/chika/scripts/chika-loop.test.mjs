import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  main, parseArgv,
  newState, advanceState, closeState, checkEvidence, parseEvidence, pngSize,
  viewportMatches, validSlug, describeNext, stepDef, STEPS, MAX_ROUNDS, AWAITING_CLOSE, evidenceFloor,
} from './chika-loop.mjs';

const T0 = '2026-09-04T10:00:00.000Z';
const T1 = '2026-09-04T11:00:00.000Z';
const T2 = '2026-09-04T12:00:00.000Z'; // a later round, so T1 evidence reads as stale
const ms = (iso) => Date.parse(iso);

// A probe that reports whatever the test declares, so the pure gate logic is
// exercised with no filesystem.
const probeFrom = (map) => (path) => map[path] || { exists: false };
// Artifacts in the shared happy-path probe are stamped later than any round this
// suite opens, so freshness never accidentally decides a test that is about
// something else. The freshness rules get their own tests, with their own probes.
const FRESH = ms(T2) + 3_600_000;
const goodFile = { exists: true, size: 120, mtimeMs: FRESH, png: null };
const shot = (width) => ({ exists: true, size: 9000, mtimeMs: FRESH, png: { width, height: 3000 } });

const fresh = () => newState({ slug: 'demo', surface: 'app/research', now: T0 });

// Evidence that satisfies each step, given the probe below.
const PROBE = probeFrom({
  '/s/spec.md': goodFile,
  '/s/advisor.md': goodFile,
  '/s/coverage.md': goodFile,
  '/s/polish.md': goodFile,
  '/s/verify.md': goodFile,
  '/s/d.png': shot(1512),
  '/s/m.png': shot(390),
  '/s/d2.png': shot(1512),
  '/s/m2.png': shot(390),
});

const EVIDENCE = {
  1: ['note:Research coverage tab, WEB surface, proves sector x company coverage; reuses navy band, mosaic, stat strip'],
  2: ['file:/s/spec.md'],
  3: ['file:/s/advisor.md'],
  4: ['note:Built the coverage matrix in app/research/page.tsx'],
  5: ['shot:desktop:/s/d.png', 'shot:mobile:/s/m.png'],
  6: ['file:/s/advisor.md'],
  7: ['file:/s/coverage.md'],
  8: ['file:/s/polish.md'],
  9: ['file:/s/verify.md', 'shot:desktop:/s/d2.png', 'shot:mobile:/s/m2.png'],
};

const runTo = (upTo, state = fresh()) => {
  let s = state;
  for (let n = s.step; n <= upTo; n += 1) {
    s = advanceState(s, { step: n, evidence: EVIDENCE[n], now: T1, probe: PROBE });
  }
  return s;
};

test('parseEvidence: recognises the three kinds and rejects malformed specs', () => {
  assert.deepEqual(parseEvidence(['note:hello']), [{ kind: 'note', text: 'hello' }]);
  assert.deepEqual(parseEvidence(['file:/a/b.md']), [{ kind: 'file', path: '/a/b.md' }]);
  assert.deepEqual(parseEvidence(['shot:mobile:/a/b.png']), [{ kind: 'shot', viewport: 'mobile', path: '/a/b.png' }]);
  assert.throws(() => parseEvidence(['screenshot:/a.png']), /unrecognised evidence/);
  assert.throws(() => parseEvidence(['shot:/a.png']), /needs a viewport/);
  assert.throws(() => parseEvidence(['shot:tablet:/a.png']), /unknown viewport/);
  assert.throws(() => parseEvidence(['shot:desktop:']), /needs a path/);
});

test('pngSize: reads IHDR dimensions, rejects non-PNG', () => {
  const buf = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.write('IHDR', 12, 'latin1');
  buf.writeUInt32BE(1512, 16);
  buf.writeUInt32BE(4200, 20);
  assert.deepEqual(pngSize(buf), { width: 1512, height: 4200 });
  assert.equal(pngSize(Buffer.from('not a png at all........')), null);
  assert.equal(pngSize(Buffer.alloc(4)), null);
  assert.equal(pngSize(null), null);
});

test('viewportMatches: accepts 1x/2x/3x with slack, rejects the wrong viewport', () => {
  assert.ok(viewportMatches('desktop', 1512));
  assert.ok(viewportMatches('desktop', 3024)); // retina
  assert.ok(viewportMatches('mobile', 390));
  assert.ok(viewportMatches('mobile', 780));
  assert.ok(viewportMatches('desktop', 1440)); // within 10% slack
  assert.equal(viewportMatches('mobile', 1512), false); // desktop shot labelled mobile
  assert.equal(viewportMatches('desktop', 390), false);
  assert.equal(viewportMatches('desktop', 0), false);
});

test('validSlug: rejects path traversal and shouting', () => {
  assert.ok(validSlug('research-coverage'));
  assert.equal(validSlug('../etc/passwd'), false);
  assert.equal(validSlug('a/b'), false);
  assert.equal(validSlug('Research'), false);
  assert.equal(validSlug('-leading'), false);
  assert.equal(validSlug(''), false);
});

test('newState: starts at round 1 step 1 and demands a surface', () => {
  const s = fresh();
  assert.equal(s.round, 1);
  assert.equal(s.step, 1);
  assert.equal(s.roundStartedAt, T0);
  assert.equal(s.closed, false);
  assert.throws(() => newState({ slug: 'x', now: T0 }), /--surface is required/);
  assert.throws(() => newState({ slug: '../x', surface: 'a', now: T0 }), /invalid slug/);
});

test('newState: names the missing piece rather than echoing undefined', () => {
  assert.throws(() => newState({ surface: 'a', now: T0 }), /a slug is required/);
  assert.throws(() => newState({ slug: 'ok-slug', now: T0 }), /--surface is required/);
});

test('happy path: 1 through 9 then close pass', () => {
  const s = runTo(9);
  assert.equal(s.step, AWAITING_CLOSE);
  assert.equal(s.history.length, 9);
  const closed = closeState(s, { verdict: 'pass', now: T1 });
  assert.equal(closed.closed, true);
  assert.equal(closed.outcome, 'pass');
});

test('order: cannot skip ahead, cannot redo a completed step in place', () => {
  const s = fresh();
  assert.throws(() => advanceState(s, { step: 3, evidence: EVIDENCE[3], now: T1, probe: PROBE }),
    /out of order: loop is at step 1/);
  const s1 = advanceState(s, { step: 1, evidence: EVIDENCE[1], now: T1, probe: PROBE });
  assert.throws(() => advanceState(s1, { step: 1, evidence: EVIDENCE[1], now: T1, probe: PROBE }),
    /out of order: loop is at step 2/);
});

test('every step has a definition and a brief', () => {
  assert.equal(STEPS.length, 9);
  for (let n = 1; n <= 9; n += 1) {
    const d = stepDef(n);
    assert.ok(d, `step ${n} missing`);
    assert.ok(d.brief.length > 30, `step ${n} brief too thin`);
    assert.ok(d.requires.notes || d.requires.files || d.requires.shots, `step ${n} demands no evidence`);
  }
});

test('notes: a one-word note does not satisfy a note step', () => {
  const s = fresh();
  assert.throws(() => advanceState(s, { step: 1, evidence: ['note:done'], now: T1, probe: PROBE }),
    /needs at least 40/);
  assert.throws(() => advanceState(s, { step: 1, evidence: [], now: T1, probe: PROBE }),
    /needs 1 note: evidence/);
});

test('files: missing, empty, and stale files are all rejected', () => {
  const s = runTo(1);
  const p = probeFrom({
    '/s/missing.md': { exists: false },
    '/s/empty.md': { exists: true, size: 0, mtimeMs: ms(T1), png: null },
    '/s/stale.md': { exists: true, size: 100, mtimeMs: ms('2026-09-01T00:00:00.000Z'), png: null },
  });
  assert.throws(() => advanceState(s, { step: 2, evidence: ['file:/s/missing.md'], now: T1, probe: p }),
    /file does not exist/);
  assert.throws(() => advanceState(s, { step: 2, evidence: ['file:/s/empty.md'], now: T1, probe: p }),
    /file is empty/);
  assert.throws(() => advanceState(s, { step: 2, evidence: ['file:/s/stale.md'], now: T1, probe: p }),
    /predates round 1/);
});

test('capture: both viewports required — desktop alone fails', () => {
  const s = runTo(4);
  assert.throws(() => advanceState(s, { step: 5, evidence: ['shot:desktop:/s/d.png'], now: T1, probe: PROBE }),
    /needs a mobile screenshot/);
  assert.throws(() => advanceState(s, { step: 5, evidence: ['shot:mobile:/s/m.png'], now: T1, probe: PROBE }),
    /needs a desktop screenshot/);
});

test('capture: the same file cannot stand in for both viewports', () => {
  const s = runTo(4);
  assert.throws(() => advanceState(s, {
    step: 5, evidence: ['shot:desktop:/s/d.png', 'shot:mobile:/s/d.png'], now: T1, probe: PROBE,
  }), /same file used for desktop and mobile/);
});

test('capture: a desktop PNG labelled mobile is rejected on its width', () => {
  const s = runTo(4);
  assert.throws(() => advanceState(s, {
    step: 5, evidence: ['shot:desktop:/s/d.png', 'shot:mobile:/s/d2.png'], now: T1, probe: PROBE,
  }), /is 1512px wide, not a mobile capture/);
});

test('capture: a non-PNG and a stale capture are both rejected', () => {
  const s = runTo(4);
  const p = probeFrom({
    '/s/d.png': shot(1512),
    '/s/fake.png': { exists: true, size: 500, mtimeMs: ms(T1), png: null },
    '/s/old.png': { exists: true, size: 9000, mtimeMs: ms('2026-09-01T00:00:00.000Z'), png: { width: 390, height: 800 } },
  });
  assert.throws(() => advanceState(s, {
    step: 5, evidence: ['shot:desktop:/s/d.png', 'shot:mobile:/s/fake.png'], now: T1, probe: p,
  }), /not a PNG/);
  assert.throws(() => advanceState(s, {
    step: 5, evidence: ['shot:desktop:/s/d.png', 'shot:mobile:/s/old.png'], now: T1, probe: p,
  }), /predates round 1/);
});

test('step 9 demands a re-capture AND the regression file', () => {
  const s = runTo(8);
  assert.throws(() => advanceState(s, { step: 9, evidence: ['file:/s/verify.md'], now: T1, probe: PROBE }),
    /needs a desktop screenshot/);
  assert.throws(() => advanceState(s, {
    step: 9, evidence: ['shot:desktop:/s/d2.png', 'shot:mobile:/s/m2.png'], now: T1, probe: PROBE,
  }), /needs 1 file: evidence/);
});

test('step 9 cannot reuse the step-5 captures — it must prove the fix landed', () => {
  // The whole point of step 9. Caught on the first end-to-end run: round-start
  // freshness alone let the step-5 screenshots satisfy step 9, so "verify the
  // fix" was satisfiable by the very renders that showed the defect.
  const s = runTo(8);
  const capturedAt = s.history.find((h) => h.step === 5).at;
  assert.equal(evidenceFloor(s, 9), capturedAt);
  assert.equal(evidenceFloor(s, 5), s.roundStartedAt);

  const sameShots = probeFrom({
    '/s/ver.md': { exists: true, size: 50, mtimeMs: ms(T1) + 5000, png: null },
    // taken at the same instant step 5 was recorded — i.e. not re-captured
    '/s/d.png': { exists: true, size: 9000, mtimeMs: ms(T1) - 1, png: { width: 1512, height: 900 } },
    '/s/m.png': { exists: true, size: 9000, mtimeMs: ms(T1) - 1, png: { width: 390, height: 900 } },
  });
  assert.throws(() => advanceState(s, {
    step: 9, evidence: ['file:/s/ver.md', 'shot:desktop:/s/d.png', 'shot:mobile:/s/m.png'],
    now: T1, probe: sameShots,
  }), /step 9 proves the fix landed, it cannot reuse the step-5 captures/);

  const recaptured = probeFrom({
    '/s/ver.md': { exists: true, size: 50, mtimeMs: ms(T1) + 5000, png: null },
    '/s/d2.png': { exists: true, size: 9000, mtimeMs: ms(T1) + 5000, png: { width: 1512, height: 900 } },
    '/s/m2.png': { exists: true, size: 9000, mtimeMs: ms(T1) + 5000, png: { width: 390, height: 900 } },
  });
  const ok = advanceState(s, {
    step: 9, evidence: ['file:/s/ver.md', 'shot:desktop:/s/d2.png', 'shot:mobile:/s/m2.png'],
    now: T1, probe: recaptured,
  });
  assert.equal(ok.step, AWAITING_CLOSE);
});

test('close fix: rotates to step 4, bumps the round, and resets the freshness clock', () => {
  const s = runTo(9);
  const r2 = closeState(s, { verdict: 'fix', now: T2 });
  assert.equal(r2.round, 2);
  assert.equal(r2.step, 4);
  assert.equal(r2.roundStartedAt, T2);
  assert.equal(r2.closed, false);
  // This is the load-bearing one: round 1's captures were taken at T1, round 2
  // opened at T2, so re-presenting them must fail. "Verify the fix" cannot be
  // satisfied by the screenshots that showed the bug.
  const roundOneEra = probeFrom({
    '/s/d.png': { exists: true, size: 9000, mtimeMs: ms(T1), png: { width: 1512, height: 900 } },
    '/s/m.png': { exists: true, size: 9000, mtimeMs: ms(T1), png: { width: 390, height: 900 } },
  });
  const built = advanceState(r2, { step: 4, evidence: EVIDENCE[4], now: T2, probe: PROBE });
  assert.throws(() => advanceState(built, {
    step: 5, evidence: ['shot:desktop:/s/d.png', 'shot:mobile:/s/m.png'], now: T2, probe: roundOneEra,
  }), /predates round 2/);
  // A genuine re-capture, taken after the round opened, passes.
  const recaptured = probeFrom({
    '/s/d3.png': { exists: true, size: 9000, mtimeMs: ms(T2) + 1000, png: { width: 1512, height: 3000 } },
    '/s/m3.png': { exists: true, size: 9000, mtimeMs: ms(T2) + 1000, png: { width: 390, height: 3000 } },
  });
  const ok = advanceState(built, {
    step: 5, evidence: ['shot:desktop:/s/d3.png', 'shot:mobile:/s/m3.png'], now: T2, probe: recaptured,
  });
  assert.equal(ok.step, 6);
});

test('round cap: fix is refused at the cap and escalate is the way out', () => {
  let s = runTo(9);
  s = closeState(s, { verdict: 'fix', now: T1 }); // round 2
  s = runTo(9, s);
  s = closeState(s, { verdict: 'fix', now: T1 }); // round 3
  assert.equal(s.round, MAX_ROUNDS);
  s = runTo(9, s);
  assert.throws(() => closeState(s, { verdict: 'fix', now: T1 }), /round cap reached \(3 rounds\)/);
  const out = closeState(s, { verdict: 'escalate', now: T1 });
  assert.equal(out.closed, true);
  assert.equal(out.outcome, 'escalate');
});

test('close: refused before step 9, and the loop is dead once closed', () => {
  const mid = runTo(5);
  assert.throws(() => closeState(mid, { verdict: 'pass', now: T1 }), /step 9 is not complete/);
  const done = closeState(runTo(9), { verdict: 'pass', now: T1 });
  assert.throws(() => closeState(done, { verdict: 'pass', now: T1 }), /already closed/);
  assert.throws(() => advanceState(done, { step: 4, evidence: EVIDENCE[4], now: T1, probe: PROBE }),
    /is closed \(pass\)/);
});

test('after step 9 the only move is close', () => {
  const s = runTo(9);
  assert.throws(() => advanceState(s, { step: 9, evidence: EVIDENCE[9], now: T1, probe: PROBE }),
    /step 9 is complete — run: close/);
  assert.throws(() => closeState(s, { verdict: 'maybe', now: T1 }), /unknown verdict/);
});

test('describeNext: names the step, the brief, and the exact evidence demanded', () => {
  const s = fresh();
  assert.match(describeNext(s), /round 1\/3 · step 1 — Frame/);
  assert.match(describeNext(runTo(4)), /shot:desktop:<path> \(1512px PNG, this round\)/);
  assert.match(describeNext(runTo(9)), /close --verdict pass\|fix\|escalate/);
  assert.match(describeNext(closeState(runTo(9), { verdict: 'pass', now: T1 })), /closed \(pass\)/);
});

test('history records round and step so a fresh session can read what happened', () => {
  const s = closeState(runTo(9), { verdict: 'fix', now: T1 });
  const s2 = runTo(9, s);
  assert.equal(s2.history.length, 15); // 9 in round 1, steps 4-9 in round 2
  assert.deepEqual(s2.history.at(-1), { round: 2, step: 9, at: T1, evidence: EVIDENCE[9] });
  assert.equal(s2.history.filter((h) => h.round === 2).length, 6);
});

// --- the exact-millisecond boundary -----------------------------------------

test('evidence landing exactly on the floor is rejected — the gate fails closed', () => {
  // With a strict `<`, a step-5 screenshot whose mtime equalled the recorded
  // step-5 time was accepted as step-9 evidence, so the renders that showed the
  // defect could stand in for the renders proving it fixed. Being strict costs a
  // spurious recapture; being lax costs the loop its whole purpose.
  const s = runTo(8);
  const floor = evidenceFloor(s, 9);
  const onTheDot = probeFrom({
    '/s/ver.md': { exists: true, size: 50, mtimeMs: ms(floor) + 1, png: null },
    '/s/d.png': { exists: true, size: 9000, mtimeMs: ms(floor), png: { width: 1512, height: 900 } },
    '/s/m.png': { exists: true, size: 9000, mtimeMs: ms(floor), png: { width: 390, height: 900 } },
  });
  assert.throws(() => advanceState(s, {
    step: 9, evidence: ['file:/s/ver.md', 'shot:desktop:/s/d.png', 'shot:mobile:/s/m.png'],
    now: T1, probe: onTheDot,
  }), /predates the step-5 capture/);

  // One millisecond later is a genuine recapture and passes.
  const justAfter = probeFrom({
    '/s/ver.md': { exists: true, size: 50, mtimeMs: ms(floor) + 1, png: null },
    '/s/d.png': { exists: true, size: 9000, mtimeMs: ms(floor) + 1, png: { width: 1512, height: 900 } },
    '/s/m.png': { exists: true, size: 9000, mtimeMs: ms(floor) + 1, png: { width: 390, height: 900 } },
  });
  assert.equal(advanceState(s, {
    step: 9, evidence: ['file:/s/ver.md', 'shot:desktop:/s/d.png', 'shot:mobile:/s/m.png'],
    now: T1, probe: justAfter,
  }).step, AWAITING_CLOSE);
});

test('a file landing exactly on the round start is rejected too', () => {
  const s = runTo(1);
  const onTheDot = probeFrom({
    '/s/spec.md': { exists: true, size: 100, mtimeMs: ms(s.roundStartedAt), png: null },
  });
  assert.throws(() => advanceState(s, { step: 2, evidence: ['file:/s/spec.md'], now: T1, probe: onTheDot }),
    /predates round 1/);
});

// --- CLI shell ---------------------------------------------------------------
// The CLI layer needs its own coverage: deleting readState's slug validation
// leaves the state-machine tests green. These drive main() against a temp repo.

const withRepo = (fn) => {
  const dir = mkdtempSync(join(tmpdir(), 'chika-cli-'));
  const prev = process.env.CHIKA_REPO;
  process.env.CHIKA_REPO = dir;
  const out = [];
  const log = console.log; const err = console.error;
  console.log = (...a) => out.push(a.join(' '));
  console.error = (...a) => out.push(a.join(' '));
  try { return fn((argv) => ({ code: main(argv), out: out.join('\n') }), dir); }
  finally {
    console.log = log; console.error = err;
    if (prev === undefined) delete process.env.CHIKA_REPO; else process.env.CHIKA_REPO = prev;
    rmSync(dir, { recursive: true, force: true });
  }
};

test('CLI: init writes state, refuses a duplicate, and backs up on --force', () => {
  withRepo((run, dir) => {
    assert.equal(run(['init', 'demo', '--surface', 'app/x']).code, 0);
    const p = join(dir, '.chika/demo.json');
    assert.ok(existsSync(p));
    assert.equal(JSON.parse(readFileSync(p, 'utf8')).surface, 'app/x');

    assert.equal(run(['init', 'demo', '--surface', 'app/x']).code, 1); // duplicate

    const forced = run(['init', 'demo', '--surface', 'app/y', '--force']);
    assert.equal(forced.code, 0);
    const backups = readdirSync(join(dir, '.chika')).filter((f) => f.includes('.bak-'));
    assert.equal(backups.length, 1, 'force must back up, never clobber');
    assert.equal(JSON.parse(readFileSync(join(dir, '.chika', backups[0]), 'utf8')).surface, 'app/x');
  });
});

test('CLI: a traversal slug is refused as a bad slug, not merely as a missing file', () => {
  // Assert the REASON, not just the exit code. Deleting readState's slug check
  // still yields exit 1 (the traversed path simply does not exist), so a test
  // that only checks the code passes against the vulnerable version.
  withRepo((run) => {
    const s = run(['status', '../../etc/passwd']);
    assert.equal(s.code, 1);
    assert.match(s.out, /invalid slug/);
    const i = run(['init', '../escape', '--surface', 'x']);
    assert.equal(i.code, 1);
    assert.match(i.out, /invalid slug/);
    const a = run(['advance', '../x', '--step', '1', '-e', `note:${'y'.repeat(50)}`]);
    assert.equal(a.code, 1);
    assert.match(a.out, /invalid slug/);
  });
});

test('CLI: unknown loop, unknown command, and a missing --step all exit 1 cleanly', () => {
  withRepo((run) => {
    assert.match(run(['status', 'nope']).out, /no chika loop "nope"/);
    assert.equal(run(['frobnicate']).code, 1);
    run(['init', 'demo', '--surface', 'x']);
    assert.equal(run(['advance', 'demo', '--step']).code, 1);
    assert.equal(run(['close', 'demo', '--verdict', 'pass']).code, 1); // step 9 not done
  });
});

test('CLI: out-of-order advance is refused and leaves the state file untouched', () => {
  withRepo((run, dir) => {
    run(['init', 'demo', '--surface', 'x']);
    const p = join(dir, '.chika/demo.json');
    const before = readFileSync(p, 'utf8');
    assert.equal(run(['advance', 'demo', '--step', '4', '-e', 'note:' + 'z'.repeat(50)]).code, 1);
    assert.equal(readFileSync(p, 'utf8'), before, 'a rejected advance must not persist anything');
  });
});

test('CLI: corrupt state reports plainly instead of throwing a stack trace', () => {
  withRepo((run, dir) => {
    const d = join(dir, '.chika');
    mkdirSync(d, { recursive: true });
    writeFileSync(join(d, 'demo.json'), '{not json');
    const r = run(['status', 'demo']);
    assert.equal(r.code, 1);
    assert.match(r.out, /unreadable/);
    assert.match(r.out, /Do not hand-edit/);
  });
});

test('CLI: list reports loops and their position', () => {
  withRepo((run) => {
    assert.match(run(['list']).out, /no chika loops yet/);
    run(['init', 'alpha', '--surface', 'x']);
    run(['init', 'beta', '--surface', 'y']);
    const r = run(['list']);
    assert.match(r.out, /alpha/);
    assert.match(r.out, /beta/);
    assert.equal(r.code, 0);
  });
});

test('parseArgv: collects repeated evidence, flags, and survives a trailing flag', () => {
  assert.deepEqual(parseArgv(['advance', 'x', '--step', '5', '-e', 'a', '-e', 'b']),
    { _: ['advance', 'x'], evidence: ['a', 'b'], step: '5' });
  assert.equal(parseArgv(['init', 'x', '--force']).force, true);
  assert.equal(parseArgv(['advance', 'x', '--step']).step, undefined);
});
