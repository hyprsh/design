// Tests for ColumnChart's pure parts (hyprsh/design#74): tick choice, scaling, segment geometry, label thinning and the
// accessible names. ColumnChart.js is plain script for the bundle's scope, so it runs here in a vm context with stub
// globals and the parts are read back from the context: top-level functions of a script are properties of its global.
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
// The helpers are module-private in the bundle, so they are not on the component or in its d.ts.
const C = {
  ticks: context.ccTicks, tickLabel: context.ccTickLabel, segments: context.ccSegments, total: context.ccTotal,
  thinStep: context.ccThinStep, columnName: context.ccColumnName, tooltipRows: context.ccTooltipRows,
  totalText: context.ccTotalText, value: context.ccValue,
  target: context.ccTarget, openColumnName: context.ccOpenColumnName, openMarkName: context.ccOpenMarkName, markPointer: context.ccMarkPointer, stepTo: context.ccStepTo, openMarks: context.ccOpenMarks,
  labelShown: context.ccLabelShown, targetSize: context.ccTargetSize, slotWidth: context.ccSlotWidth, fit: context.ccFit, pickIndex: context.ccPickIndex, xLabels: context.ccXLabels,
};
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
  const seg = (values, max, height) => plain(C.segments(series, { values }, max, height));
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
  it('carries each series\' tone, so the renderer needs no lookup', () => {
    const toned = [{ key: 'a', tone: 'success' }, { key: 'b' }];
    assert.deepEqual(plain(C.segments(toned, { values: { a: 10, b: 10 } }, 40, 200)).map((g) => g.tone), ['success', undefined]);
  });
  it('treats negative and non-numeric values as zero', () => {
    assert.deepEqual(seg({ a: -5, b: 'x', c: 10 }, 40, 200), [{ key: 'c', bottom: 0, height: 50, top: true }]);
  });
});

describe('ColumnChart helpers stay private', () => {
  it('hangs nothing off the public component', () => {
    assert.deepEqual(Object.keys(registry.ColumnChart), []);
  });
});

describe('ColumnChart.value', () => {
  it('reads one series value as a non-negative number, 0 when missing or invalid', () => {
    assert.equal(C.value({ values: { a: 5 } }, { key: 'a' }), 5);
    assert.equal(C.value({ values: { a: -5 } }, { key: 'a' }), 0);
    assert.equal(C.value({ values: { a: 'x' } }, { key: 'a' }), 0);
    assert.equal(C.value({ values: {} }, { key: 'a' }), 0);
    assert.equal(C.value({}, { key: 'a' }), 0);
  });
});

describe('ColumnChart.total', () => {
  it('adds the non-negative values of the series', () => {
    assert.equal(C.total([{ key: 'a' }, { key: 'b' }], { values: { a: 25, b: 1, z: 99 } }), 26);
    assert.equal(C.total([{ key: 'a' }, { key: 'b' }], { values: { a: -3 } }), 0);
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
    assert.equal(C.totalText({ label: 'x', values: { a: 3, b: 1 } }, series, String), '4');
  });
});

describe('ColumnChart.target', () => {
  const d = { label: 'Oct 28', values: { ready: 25 } };
  it('is no target without onOpen or a URL', () => {
    assert.equal(C.target({}, d), null);
    assert.equal(C.target({ href: () => undefined }, d), null);
    assert.equal(C.target({ href: () => '' }, d), null);
  });
  it('is a button with onOpen and no URL', () => {
    assert.deepEqual(plain(C.target({ onOpen() {} }, d)), {});
    assert.deepEqual(plain(C.target({ onOpen() {}, href: () => undefined }, d)), {});
  });
  it('is a link when href returns a URL, with or without onOpen', () => {
    assert.deepEqual(plain(C.target({ href: () => '/d/1' }, d)), { href: '/d/1' });
    assert.deepEqual(plain(C.target({ onOpen() {}, href: () => '/d/1' }, d)), { href: '/d/1' });
  });
  it('asks href for the column with the datum alone and for a mark with the series key', () => {
    const calls = [];
    const props = { href: (...a) => { calls.push(a.length === 1 ? [a[0].label] : [a[0].label, a[1]]); return '/x'; } };
    C.target(props, d); C.target(props, d, 'ready');
    assert.deepEqual(calls, [['Oct 28'], ['Oct 28', 'ready']]);
  });
});

describe('ColumnChart open names', () => {
  const series = [{ key: 'ready', label: 'ready' }, { key: 'canceled', label: 'canceled' }, { key: 'error', label: 'error' }];
  const d = { label: 'Oct 28', values: { ready: 25, canceled: 1 } };
  it('names a column "Open " plus its current name', () => {
    assert.equal(C.openColumnName(d, series, String), 'Open Oct 28: 25 ready, 1 canceled, 0 error');
  });
  it('names a mark with the column label, the series and the formatted value', () => {
    assert.equal(C.openMarkName(d, series[1], String), 'Open Oct 28 canceled: 1');
    assert.equal(C.openMarkName({ label: 'Oct 29', values: { ready: 1200 } }, series[0], (v) => v.toLocaleString('en-US')), 'Open Oct 29 ready: 1,200');
  });
});

describe('ColumnChart.markPointer', () => {
  it('makes a mark a pointer target from 8px', () => {
    assert.equal(C.markPointer(8), true);
    assert.equal(C.markPointer(7.9), false);
    assert.equal(C.markPointer(2), false);
  });
});

describe('ColumnChart.stepTo', () => {
  it('maps Right, Left, Home and End to a column, clamped, and other keys to null', () => {
    assert.equal(C.stepTo('ArrowRight', 1, 4), 2);
    assert.equal(C.stepTo('ArrowRight', 3, 4), 3);
    assert.equal(C.stepTo('ArrowLeft', 0, 4), 0);
    assert.equal(C.stepTo('ArrowLeft', 2, 4), 1);
    assert.equal(C.stepTo('Home', 2, 4), 0);
    assert.equal(C.stepTo('End', 0, 4), 3);
    assert.equal(C.stepTo('ArrowUp', 0, 4), null);
  });
});

describe('ColumnChart.openMarks', () => {
  const series = [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }, { key: 'c', label: 'C' }];
  const d = { label: 'x', values: { a: 3, c: 1 } };
  it('lists the non-zero series with a target of their own, whatever the column does', () => {
    assert.deepEqual(plain(C.openMarks({ href: (_d, k) => (k === 'c' ? '/c' : undefined) }, series, d)), ['c']);
    assert.deepEqual(plain(C.openMarks({ onOpen() {} }, series, d)), ['a', 'c']);
    assert.deepEqual(plain(C.openMarks({}, series, d)), []);
  });
  it('has none for a single series', () => {
    assert.deepEqual(plain(C.openMarks({ onOpen() {} }, series.slice(0, 1), d)), []);
  });
});

describe('ColumnChart.labelShown', () => {
  const shown = (n, step) => Array.from({ length: n }, (_, i) => i).filter((i) => C.labelShown(i, n, step));
  it('counts back from the last column, so the last one is always labelled', () => {
    assert.deepEqual(shown(10, 3), [0, 3, 6, 9]);
    assert.deepEqual(shown(11, 3), [1, 4, 7, 10]);
    assert.deepEqual(shown(30, 7), [1, 8, 15, 22, 29]);
    for (const [n, step] of [[1, 1], [2, 5], [30, 4], [90, 13]]) assert.equal(C.labelShown(n - 1, n, step), true, `${n} columns, every ${step}th`);
  });
  it('shows every label with a step of 1, and treats a bad step as 1', () => {
    assert.deepEqual(shown(4, 1), [0, 1, 2, 3]);
    assert.deepEqual(shown(3, 0), [0, 1, 2]);
  });
});

describe('ColumnChart.xLabels', () => {
  const xl = (...a) => plain(C.xLabels(...a));
  const every = (from, to, by) => Array.from({ length: Math.floor((to - from) / by) + 1 }, (_, k) => from + k * by);
  it('labels every column that fits, and thins from the end so the last one is labelled', () => {
    assert.deepEqual(xl(4, 200, 6), [0, 1, 2, 3]);
    // "Oct 28" in 60px slots: all of them; "D30" in 12px slots: every 3rd, back from D30.
    assert.deepEqual(xl(5, 60, 6), [0, 1, 2, 3, 4]);
    assert.deepEqual(xl(30, 12, 3), every(2, 29, 3));
    // In 10px slots D30 shifts left to stay inside the plot, so D27 would touch it and goes.
    assert.deepEqual(xl(30, 10, 3), every(2, 23, 3).concat([29]));
  });
  it('drops a label that, kept inside the plot at an edge, would touch its neighbour, but never the last', () => {
    // 4px slots, every 8th: D2 would have to shift right into D10, and D90 shifts left into D82.
    assert.deepEqual(xl(90, 4, 3), every(9, 73, 8).concat([89]));
  });
  it('always labels a lone column, and falls back to plain thinning for odd input', () => {
    assert.deepEqual(xl(1, 300, 6), [0]);
    assert.deepEqual(xl(3, 0, 6), [0, 1, 2]);
  });
});

describe('ColumnChart.targetSize', () => {
  it('is 24px, or the touch target under touch sizing', () => {
    assert.equal(C.targetSize(false, 44), 24);
    assert.equal(C.targetSize(true, 44), 44);
    assert.equal(C.targetSize(true, 48), 48);
  });
  it('falls back to 44px when the token cannot be read', () => {
    assert.equal(C.targetSize(true, NaN), 44);
    assert.equal(C.targetSize(true, 0), 44);
  });
});

describe('ColumnChart.slotWidth', () => {
  it('divides the room between the columns, and is 0 for nothing to measure', () => {
    assert.equal(C.slotWidth(300, 30), 10);
    assert.equal(C.slotWidth(0, 30), 0);
    assert.equal(C.slotWidth(300, 0), 0);
  });
});

describe('ColumnChart.fit', () => {
  const fit = (...a) => plain(C.fit(...a));
  const DIRECT = { pick: false, scroll: false, minWidth: 0 };
  it('keeps direct targets while a slot is at least the target size', () => {
    assert.deepEqual(fit(240, 10, true, 24), DIRECT);
    assert.deepEqual(fit(440, 10, true, 44), DIRECT);
  });
  it('picks, then opens below the target size, fitting the width', () => {
    // 30 columns in about 320px of plot: 10.7px a slot.
    assert.deepEqual(fit(320, 30, true, 24), { pick: true, scroll: false, minWidth: 0 });
    assert.deepEqual(fit(239, 10, true, 24), { pick: true, scroll: false, minWidth: 0 });
  });
  it('needs 44px slots for direct targets under touch sizing', () => {
    assert.deepEqual(fit(320, 8, true, 24), DIRECT, '40px slots are direct at 24px');
    assert.deepEqual(fit(320, 8, true, 44), { pick: true, scroll: false, minWidth: 0 }, 'and picked at 44px');
  });
  it('fits down to 4px a slot, then scrolls at 4px a slot', () => {
    assert.deepEqual(fit(120, 30, true, 24), { pick: true, scroll: false, minWidth: 0 });
    // 90 columns in about 280px: 3.1px a slot.
    assert.deepEqual(fit(280, 90, true, 24), { pick: true, scroll: true, minWidth: 360 });
  });
  it('never picks or scrolls a chart that opens nothing', () => {
    assert.deepEqual(fit(280, 90, false, 24), DIRECT);
    assert.deepEqual(fit(320, 30, false, 44), DIRECT);
  });
  it('stays as it is until the width is measured', () => {
    assert.deepEqual(fit(0, 30, true, 24), DIRECT);
  });
});

describe('ColumnChart.pickIndex', () => {
  it('picks the column under the pointer, clamped to the ends', () => {
    assert.equal(C.pickIndex(0, 300, 30), 0);
    assert.equal(C.pickIndex(9.9, 300, 30), 0);
    assert.equal(C.pickIndex(10, 300, 30), 1);
    assert.equal(C.pickIndex(295, 300, 30), 29);
    assert.equal(C.pickIndex(-20, 300, 30), 0);
    assert.equal(C.pickIndex(400, 300, 30), 29);
  });
  it('is 0 for nothing to measure', () => {
    assert.equal(C.pickIndex(10, 0, 30), 0);
    assert.equal(C.pickIndex(10, 300, 0), 0);
  });
});
