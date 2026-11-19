import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const run = (file, out) => spawnSync('node', [join(here, 'render-lint.mjs'), file, '--out', out], { encoding: 'utf8' });

test('render-lint: the broken fixture fails on footer gap, wrap, row alignment and type floor, and the report names them', () => {
  const dir = mkdtempSync(join(tmpdir(), 'rl-'));
  try {
    const r = run(join(here, 'fixtures/render-lint-bad.html'), join(dir, 'bad.json'));
    assert.equal(r.status, 1, r.stdout + r.stderr);
    const rep = JSON.parse(readFileSync(join(dir, 'bad.json'), 'utf8'));
    assert.equal(rep.pass, false);
    assert.equal(rep.surface, join(here, 'fixtures/render-lint-bad.html'));
    const failed = Object.fromEntries(rep.checks.map((c) => [c.id, c.pass]));
    for (const id of ['footer-gap', 'wrapped', 'row-align', 'type-floor', 'split-link', 'continued']) assert.equal(failed[id], false, id);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('render-lint: the fixed fixture passes every check including mobile width', () => {
  const dir = mkdtempSync(join(tmpdir(), 'rl-'));
  try {
    const r = run(join(here, 'fixtures/render-lint-good.html'), join(dir, 'good.json'));
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const rep = JSON.parse(readFileSync(join(dir, 'good.json'), 'utf8'));
    assert.equal(rep.pass, true);
    assert.ok(rep.checks.every((c) => c.pass));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
