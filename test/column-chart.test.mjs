// Tests for ColumnChart's pure parts (hyprsh/design#74): tick choice, scaling, segment geometry, label thinning and the
// accessible names. ColumnChart.js is plain script for the bundle's scope, so it runs here in a vm context with stub
// globals and the parts are read back from the component it hands to `define` (ColumnChart.ticks and so on).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const file = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src/ColumnChart.js');
const registry = {};
// Numbers are formatted as en-US whatever the machine's locale, so the expectations are literals.
const EnIntl = { ...Intl, NumberFormat: function (_l, o) { return new Intl.NumberFormat('en-US', o); } };
const context = vm.createContext({
  HY: {},
  Intl: EnIntl,
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  useMemo: (fn) => fn(),
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(file, 'utf8'), context, { filename: file });
const C = registry.ColumnChart;
const plain = (x) => JSON.parse(JSON.stringify(x));

describe('ColumnChart.ticks', () => {
  it('starts at 0 and steps cleanly past the largest total', () => {
    assert.deepEqual(plain(C.ticks(37)), [0, 10, 20, 30, 40]);
    assert.deepEqual(plain(C.ticks(40)), [0, 10, 20, 30, 40]);
    assert.deepEqual(plain(C.ticks(26)), [0, 10, 20, 30]);
    assert.deepEqual(plain(C.ticks(7)), [0, 2, 4, 6, 8]);
    assert.deepEqual(plain(C.ticks(100)), [0, 50, 100]);
  });
  it('never has more than 5 ticks', () => {
    for (const max of [1, 3, 9, 11, 19, 45, 99, 101, 360, 999, 1234, 4800, 98765, 2500000]) {
      const t = C.ticks(max);
      assert.ok(t.length <= 5, `${max} gave ${t.length} ticks`);
      assert.ok(t[t.length - 1] >= max, `${max} is above the top tick ${t[t.length - 1]}`);
    }
  });
  it('gives a scale for nothing to show', () => {
    assert.deepEqual(plain(C.ticks(0)), [0, 1]);
  });
  it('steps by tenths for small fractions without float noise', () => {
    assert.deepEqual(plain(C.ticks(0.3)), [0, 0.1, 0.2, 0.3]);
  });
});

describe('ColumnChart.tickLabel', () => {
  it('writes plain numbers below 1,000 and compact ones from there', () => {
    assert.equal(C.tickLabel(0), '0');
    assert.equal(C.tickLabel(40), '40');
    assert.equal(C.tickLabel(999), '999');
    assert.equal(C.tickLabel(1000), '1K');
    assert.equal(C.tickLabel(2000), '2K');
    assert.equal(C.tickLabel(1500), '1.5K');
    assert.equal(C.tickLabel(2000000), '2M');
  });
});

describe('ColumnChart.segments', () => {
  const series = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
  const seg = (values, max, height) => plain(C.segments(series, values, max, height));
  it('stacks bottom first on a shared scale, with a 2px gap between touching segments', () => {
    // 200px for 0-40: 10 is 50px, 20 is 100px.
    assert.deepEqual(seg({ a: 10, b: 20 }, 40, 200), [
      { key: 'a', bottom: 0, height: 50, top: false },
      { key: 'b', bottom: 52, height: 98, top: true },
    ]);
  });
  it('draws nothing for zero or missing values and gives the radius to the top non-zero segment', () => {
    assert.deepEqual(seg({ a: 10, b: 0 }, 40, 200), [{ key: 'a', bottom: 0, height: 50, top: true }]);
    assert.deepEqual(seg({ a: 0, b: 0, c: 0 }, 40, 200), []);
    assert.deepEqual(seg({}, 40, 200), []);
  });
  it('starts the first drawn segment at the baseline even when the lower series are zero, and gaps only touching ones', () => {
    assert.deepEqual(seg({ a: 0, b: 10, c: 10 }, 40, 200), [
      { key: 'b', bottom: 0, height: 50, top: false },
      { key: 'c', bottom: 52, height: 48, top: true },
    ]);
  });
  it('never draws a non-zero segment under 2px, and the next one starts above it', () => {
    const s = seg({ a: 1, b: 1 }, 1000, 200); // 0.2px each
    assert.equal(s[0].height, 2);
    assert.equal(s[1].height, 2);
    assert.equal(s[1].bottom, 4);
  });
  it('treats negative and non-numeric values as zero', () => {
    assert.deepEqual(seg({ a: -5, b: 'x', c: 10 }, 40, 200), [{ key: 'c', bottom: 0, height: 50, top: true }]);
  });
});

describe('ColumnChart.total', () => {
  it('adds the non-negative values of the series', () => {
    assert.equal(C.total([{ key: 'a' }, { key: 'b' }], { a: 25, b: 1, z: 99 }), 26);
    assert.equal(C.total([{ key: 'a' }, { key: 'b' }], { a: -3 }), 0);
  });
});

describe('ColumnChart.thinStep', () => {
  it('shows every label when they fit', () => {
    assert.equal(C.thinStep(60, 6), 1);
  });
  it('shows every nth label when they would collide', () => {
    // "Oct 28" is 6 characters: about 50px with padding, so 24px slots need every 3rd.
    assert.equal(C.thinStep(24, 6), 3);
    assert.equal(C.thinStep(12, 6), 5);
  });
  it('never returns less than 1, also for odd input', () => {
    assert.equal(C.thinStep(0, 6), 1);
    assert.equal(C.thinStep(NaN, 6), 1);
    assert.equal(C.thinStep(100, 0), 1);
  });
});

describe('ColumnChart.columnName', () => {
  const series = [{ key: 'ready', label: 'ready' }, { key: 'canceled', label: 'canceled' }, { key: 'error', label: 'error' }];
  it('reads the label and every series value in series order, zeros included', () => {
    assert.equal(C.columnName({ label: 'Oct 28', values: { ready: 25, canceled: 1 } }, series, String), 'Oct 28: 25 ready, 1 canceled, 0 error');
  });
  it('formats values with the given formatter', () => {
    assert.equal(C.columnName({ label: 'Oct 29', values: { ready: 1200 } }, series, (v) => v.toLocaleString('en-US')), 'Oct 29: 1,200 ready, 0 canceled, 0 error');
  });
});

describe('ColumnChart.tooltipRows', () => {
  it('lists series from the top of the stack down, then the total', () => {
    const series = [{ key: 'a', label: 'Ready' }, { key: 'b', label: 'Error' }];
    const rows = plain(C.tooltipRows({ label: 'x', values: { a: 3, b: 1 } }, series, String));
    assert.deepEqual(rows.map((r) => [r.key, r.value]), [['b', '1'], ['a', '3']]);
    assert.equal(C.tooltipTotal({ label: 'x', values: { a: 3, b: 1 } }, series, String), '4');
  });
});
