// Tests for the chart colour tokens (hyprsh/design#70). Run with `node --test test/chart-tokens.test.mjs`.
// They read the generated stylesheet, so they cover the alias -> var() step as well as tokens.json.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileTokens } from '../scripts/tokens-css.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(ROOT, 'project/tokens.json'), 'utf8'));
const css = compileTokens(tokens);

// The declarations of one theme block, as { name: value }.
function theme(id) {
  const re = new RegExp(`^(?::root, )?\\[data-theme="${id}"\\] \\{\\n([\\s\\S]*?)\\n\\}`, 'm');
  const body = re.exec(css)[1];
  const vars = {};
  for (const m of body.matchAll(/--([\w-]+): (.+);/g)) vars[m[1]] = m[2];
  return vars;
}
// Follow var(--x) chains to a hex colour.
function resolve(vars, name) {
  let v = vars[name];
  for (let m; (m = /^var\(--(.+)\)$/.exec(v)); ) v = vars[m[1]];
  return v;
}
function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const STEPS = ['chart-seq-1', 'chart-seq-2', 'chart-seq-3', 'chart-seq-4', 'chart-seq-5'];
const EXPECTED = {
  light: { 'chart-seq-1': 'teal-400', 'chart-seq-2': 'teal-600', 'chart-seq-3': 'teal-700', 'chart-seq-4': 'teal-900', 'chart-seq-5': 'teal-1000', 'chart-series': 'chart-seq-4' },
  dark: { 'chart-seq-1': 'teal-400', 'chart-seq-2': 'teal-500', 'chart-seq-3': 'teal-600', 'chart-seq-4': 'teal-900', 'chart-seq-5': 'teal-1000', 'chart-series': 'chart-seq-4' },
};

for (const id of ['light', 'dark']) {
  describe(`chart tokens in the ${id} theme`, () => {
    const vars = theme(id);

    it('defines the six variables as the teal steps', () => {
      for (const [name, target] of Object.entries(EXPECTED[id])) {
        assert.equal(vars[name], `var(--${target})`, name);
      }
    });

    it('moves each sequential step further from background-100 than the step before', () => {
      const bg = luminance(resolve(vars, 'background-100'));
      const dist = STEPS.map((s) => Math.abs(luminance(resolve(vars, s)) - bg));
      for (let i = 1; i < dist.length; i++) assert.ok(dist[i] > dist[i - 1], `${STEPS[i]} vs ${STEPS[i - 1]}`);
    });

    it('keeps chart-series at 4.5:1 against background-100', () => {
      assert.ok(contrast(resolve(vars, 'chart-series'), resolve(vars, 'background-100')) >= 4.5);
    });
  });
}

describe('chart token usage notes', () => {
  it('every chart token says what it is for', () => {
    for (const name of [...STEPS, 'chart-series']) {
      const t = tokens.color.tokens.find((c) => c.name === name);
      assert.ok(t && t.usage.length > 20, name);
    }
  });
});
