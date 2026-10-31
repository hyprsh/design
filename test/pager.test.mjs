// Tests for the Pager's pure parts: the range maths, which buttons are disabled, the labels and when the announcement changes.
// Pager.js is plain script that runs inside the bundle's scope, so it runs here in a vm context with stub globals, and the
// parts are read back from the component the file hands to `define` (Pager.range, Pager.label, Pager.live).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const file = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src/Pager.js');
const registry = {};
const context = vm.createContext({
  HY: { Button: 'Button', Icon: 'Icon' },
  Intl,
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  useMemo: (fn) => fn(),
  useRef: (v) => ({ current: v }),
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(file, 'utf8'), context, { filename: file });
const Pager = registry.Pager;
const range = (page, pageSize, total) => ({ ...Pager.range(page, pageSize, total) });
const plain = { format: (n) => String(n) };

describe('Pager.range', () => {
  it('computes the first and last item of a middle page', () => {
    assert.deepEqual(range(2, 50, 240), { page: 2, lastPage: 5, first: 51, last: 100, total: 240, paged: true, prevDisabled: false, nextDisabled: false });
  });
  it('ends the last page at total', () => {
    const r = range(5, 50, 240);
    assert.equal(r.first, 201);
    assert.equal(r.last, 240);
    assert.equal(r.nextDisabled, true);
    assert.equal(r.prevDisabled, false);
  });
  it('disables previous on the first page', () => {
    const r = range(1, 50, 240);
    assert.equal(r.prevDisabled, true);
    assert.equal(r.nextDisabled, false);
    assert.equal(r.first, 1);
    assert.equal(r.last, 50);
  });
  it('rounds the last page up when total is not a multiple of pageSize', () => {
    assert.equal(range(1, 50, 101).lastPage, 3);
    assert.equal(range(3, 50, 101).first, 101);
    assert.equal(range(3, 50, 101).last, 101);
  });
  it('shows the last page for a page beyond the end, with next disabled', () => {
    const r = range(9, 50, 240);
    assert.equal(r.page, 5);
    assert.equal(r.first, 201);
    assert.equal(r.last, 240);
    assert.equal(r.nextDisabled, true);
  });
  it('treats a page below 1 or not a number as the first page', () => {
    assert.equal(range(0, 50, 240).page, 1);
    assert.equal(range(-3, 50, 240).page, 1);
    assert.equal(range(NaN, 50, 240).page, 1);
  });
  it('has no buttons when everything fits on one page', () => {
    const r = range(1, 12, 12);
    assert.equal(r.paged, false);
    assert.equal(r.first, 1);
    assert.equal(r.last, 12);
    assert.equal(range(1, 50, 7).paged, false);
  });
  it('shows the only page even when page is beyond it', () => {
    const r = range(4, 50, 12);
    assert.equal(r.page, 1);
    assert.equal(r.paged, false);
  });
  it('has nothing to show when total is 0', () => {
    assert.equal(Pager.range(1, 50, 0), null);
    assert.equal(Pager.range(1, 50, -5), null);
  });
  it('has nothing to show for an unusable pageSize', () => {
    assert.equal(Pager.range(1, 0, 100), null);
    assert.equal(Pager.range(1, NaN, 100), null);
  });
});

describe('Pager.label', () => {
  it('joins the range with an en dash', () => {
    assert.equal(Pager.label(Pager.range(2, 50, 240), plain), '51–100 of 240');
    assert.equal(Pager.label(Pager.range(5, 50, 240), plain), '201–240 of 240');
    assert.equal(Pager.label(Pager.range(1, 12, 12), plain), '1–12 of 12');
  });
  it('formats numbers with the formatter it is given', () => {
    const en = new Intl.NumberFormat('en-US');
    assert.equal(Pager.label(Pager.range(25, 50, 3400), en), '1,201–1,250 of 3,400');
  });
});

describe('Pager.live', () => {
  const next = (prev, page, total = 240) => Pager.live(prev, Pager.range(page, 50, total), plain);

  it('is silent on first render', () => {
    const s = next(null, 2);
    assert.equal(s.text, '');
    assert.equal(s.page, 2);
  });
  it('announces the range after the page changes', () => {
    const s = next(next(null, 2), 3);
    assert.equal(s.text, 'Showing 101–150 of 240');
    assert.equal(s.page, 3);
  });
  it('keeps the announcement when only total changes', () => {
    const a = next(next(null, 2), 3);
    const b = next(a, 3, 300);
    assert.equal(b.text, a.text);
    assert.equal(next(next(null, 2), 2, 300).text, '');
  });
  it('keeps the state when a re-render has the same page', () => {
    const a = next(next(null, 2), 3);
    assert.deepEqual(next(a, 3), a);
  });
  it('announces when the shown page is clamped to a new last page', () => {
    const a = next(null, 5);
    const b = next(a, 5, 100);
    assert.equal(b.page, 2);
    assert.equal(b.text, 'Showing 51–100 of 100');
  });
  it('stays as it was when there is nothing to show', () => {
    const a = next(next(null, 2), 3);
    assert.deepEqual(Pager.live(a, null, plain), a);
  });
});

describe('Pager render', () => {
  const find = (node, pred, out = []) => {
    if (!node || typeof node !== 'object') return out;
    if (pred(node)) out.push(node);
    (node.children || []).forEach((c) => find(c, pred, out));
    return out;
  };
  const buttons = (tree) => find(tree, (n) => n.type === 'Button');
  const rangeNodes = (tree) => find(tree, (n) => n.props && n.props['aria-hidden'] === 'true' && /–/.test(n.children[0] || ''));

  it('renders nothing for total 0', () => {
    assert.equal(Pager({ page: 1, pageSize: 50, total: 0, onPageChange() {} }), null);
  });
  it('names the nav "Pages" by default and renders both named buttons', () => {
    const tree = Pager({ page: 2, pageSize: 50, total: 240, onPageChange() {} });
    assert.equal(tree.type, 'nav');
    assert.equal(tree.props['aria-label'], 'Pages');
    assert.deepEqual(buttons(tree).map((b) => b.props['aria-label']), ['Previous Page', 'Next Page']);
    assert.deepEqual(buttons(tree).map((b) => !!b.props.disabled), [false, false]);
    assert.equal(rangeNodes(tree)[0].children[0], '51–100 of 240');
  });
  it('calls onPageChange with the neighbouring page, only on click', () => {
    const calls = [];
    const tree = Pager({ page: 2, pageSize: 50, total: 240, onPageChange: (p) => calls.push(p) });
    assert.deepEqual(calls, []);
    const [prev, next] = buttons(tree);
    next.props.onClick();
    prev.props.onClick();
    assert.deepEqual(calls, [3, 1]);
  });
  it('disables both buttons while loading and keeps the range', () => {
    const tree = Pager({ page: 2, pageSize: 50, total: 240, loading: true, onPageChange() {} });
    assert.deepEqual(buttons(tree).map((b) => !!b.props.disabled), [true, true]);
    assert.equal(rangeNodes(tree).length, 1);
  });
  it('disables next beyond the end without calling back', () => {
    const calls = [];
    const tree = Pager({ page: 9, pageSize: 50, total: 240, onPageChange: (p) => calls.push(p) });
    assert.deepEqual(buttons(tree).map((b) => !!b.props.disabled), [false, true]);
    assert.equal(rangeNodes(tree)[0].children[0], '201–240 of 240');
    assert.deepEqual(calls, []);
  });
  it('has no buttons on one page', () => {
    const tree = Pager({ page: 1, pageSize: 50, total: 12, onPageChange() {} });
    assert.equal(buttons(tree).length, 0);
    assert.equal(rangeNodes(tree)[0].children[0], '1–12 of 12');
  });
  it('hides the visible range from assistive tech and adds a polite atomic live region', () => {
    const tree = Pager({ page: 2, pageSize: 50, total: 240, onPageChange() {} });
    const live = find(tree, (n) => n.props && n.props['aria-live'] === 'polite');
    assert.equal(live.length, 1);
    assert.equal(live[0].props['aria-atomic'], 'true');
    assert.equal(rangeNodes(tree).length, 1);
  });
});
