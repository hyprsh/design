// Tests for Progress segments' spacing (hyprsh/design#71): a 2px gap with `gap`, and a 2px minimum width for any
// segment above zero. Progress.js is plain script, so it runs here in a vm context with a stub `h` that keeps the tree.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const file = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src/Progress.js');
const registry = {};
const context = vm.createContext({
  HY: { Tooltip: 'Tooltip' },
  React: { Fragment: 'Fragment' },
  useId: () => 'id-1',
  useMemo: (fn) => fn(),
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
  cx: (...a) => a.filter(Boolean).join(' '),
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(file, 'utf8'), context, { filename: file });
const Progress = registry.Progress;

const find = (node, cls) => (node && node.props && String(node.props.className || '').split(' ').includes(cls) ? node : (node && node.children || []).map((c) => (c && c.props ? find(c, cls) : null)).find(Boolean));
const all = (node, cls, out = []) => {
  if (!node || typeof node !== 'object') return out;
  if (node.props && String(node.props.className || '').split(' ').includes(cls)) out.push(node);
  (node.children || []).forEach((c) => all(c, cls, out));
  return out;
};
const segments = (tree) => all(tree, 'hy-progress__segment');
const run = (tree) => find(tree, 'hy-progress__run');

describe('Progress segments: gap', () => {
  it('separates adjacent segments by 2px with gap', () => {
    const segs = segments(Progress({ max: 100, gap: true, 'aria-label': 'x', segments: [{ value: 10, tone: 'success' }, { value: 20, tone: 'error' }, { value: 30, tone: 'info' }] }));
    assert.equal(segs.length, 3);
    assert.equal(segs[0].props.style.marginLeft, undefined);
    assert.equal(segs[1].props.style.marginLeft, 2);
    assert.equal(segs[2].props.style.marginLeft, 2);
  });

  it('adds no gap without gap', () => {
    const segs = segments(Progress({ max: 100, 'aria-label': 'x', segments: [{ value: 10, tone: 'success' }, { value: 20, tone: 'error' }] }));
    assert.equal(segs[1].props.style.marginLeft, undefined);
    assert.equal(find(Progress({ max: 100, 'aria-label': 'x', segments: [{ value: 10, tone: 'success' }] }), 'has-gap'), undefined);
  });

  it('paints the run in the page colour when gap is on, so the gap shows the page', () => {
    assert.ok(run(Progress({ max: 100, gap: true, 'aria-label': 'x', segments: [{ value: 10, tone: 'success' }, { value: 20, tone: 'error' }] })).props.className.includes('has-gap'));
    assert.equal(run(Progress({ max: 100, 'aria-label': 'x', segments: [{ value: 10, tone: 'success' }, { value: 20, tone: 'error' }] })).props.className.includes('has-gap'), false);
  });

  it('a zero segment adds no element and no gap', () => {
    const segs = segments(Progress({ max: 100, gap: true, 'aria-label': 'x', segments: [{ value: 20, tone: 'success' }, { value: 0, tone: 'error' }, { value: 30, tone: 'info' }] }));
    assert.equal(segs.length, 2);
    assert.equal(segs[1].props.style.marginLeft, 2);
    assert.equal(segs[1].props.className.includes('hy-progress__segment--info'), true);
  });

  it('the run holds its segments and their gaps', () => {
    const r = (gap) => run(Progress({ max: 100, gap, 'aria-label': 'x', segments: [{ value: 20, tone: 'success' }, { value: 30, tone: 'info' }] }));
    assert.equal(r(true).props.style.minWidth, 6);
    assert.equal(r(false).props.style.minWidth, 4);
  });
});

describe('Progress segments: minimum width', () => {
  it('gives a segment of 1 among 1000 at least 2px, with and without gap', () => {
    for (const gap of [false, true]) {
      const segs = segments(Progress({ max: 1000, gap, 'aria-label': 'x', segments: [{ value: 1, tone: 'error' }, { value: 999, tone: 'success' }] }));
      assert.ok(segs[0].props.style.minWidth >= 2, `gap=${gap}`);
    }
  });

  it('every segment above zero is at least 2px wide', () => {
    const segs = segments(Progress({ max: 500, gap: true, 'aria-label': 'x', segments: [{ value: 1, tone: 'error' }, { value: 1, tone: 'warning' }, { value: 498, tone: 'success' }] }));
    assert.equal(segs.length, 3);
    segs.forEach((s) => assert.equal(s.props.style.minWidth, 2));
  });

  it('keeps the run as wide as its filled share, so the bar width is unchanged', () => {
    const tree = Progress({ max: 400, gap: true, 'aria-label': 'x', segments: [{ value: 100, tone: 'success' }] });
    assert.equal(run(tree).props.style.width, '25%');
    assert.equal(find(tree, 'hy-progress__track').props.className, 'hy-progress__track');
  });
});
