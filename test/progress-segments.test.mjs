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

// Segments with a scale, a tooltip or an ariaLabel (hyprsh/design#95). The focusable form keeps its hooks in a child
// component, so these tests render function elements with stub hooks and read the resulting tree.
const hooked = () => {
  const reg = {};
  const ctx = vm.createContext({
    HY: { Tooltip: 'Tooltip' },
    React: { Fragment: 'Fragment' },
    useId: () => 'id-1',
    useMemo: (fn) => fn(),
    useState: (v) => [v, () => {}],
    useRef: (v) => ({ current: v }),
    h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
    cx: (...a) => a.filter(Boolean).join(' '),
    define: (name, fn) => { reg[name] = fn; },
  });
  vm.runInContext(readFileSync(file, 'utf8'), ctx, { filename: file });
  const expand = (n) => {
    if (!n || typeof n !== 'object') return n;
    if (typeof n.type === 'function') return expand(n.type(Object.assign({}, n.props, { children: n.children })));
    return { ...n, children: (n.children || []).map(expand) };
  };
  return (props) => expand(reg.Progress(props));
};
const render = hooked();
const walk = (n, fn) => { if (n && typeof n === 'object') { fn(n); (n.children || []).forEach((c) => walk(c, fn)); } };
const nodes = (tree, pred) => { const out = []; walk(tree, (n) => { if (pred(n)) out.push(n); }); return out; };
const track = (tree) => find(tree, 'hy-progress__track');
const focusable = (tree) => nodes(tree, (n) => n.props && n.props.tabIndex !== undefined);

describe('Progress segments: scale', () => {
  it('draws each scale step with its own class and an unknown or missing colour as neutral', () => {
    const scales = ['seq-1', 'seq-2', 'seq-3', 'seq-4', 'seq-5', 'series'];
    const segs = segments(Progress({ max: 100, 'aria-label': 'x', segments: scales.map((scale) => ({ value: 10, scale })).concat([{ value: 10 }, { value: 10, scale: 'seq-9' }, { value: 10, tone: 'seq-1' }]) }));
    scales.forEach((s, i) => assert.ok(segs[i].props.className.includes('hy-progress__segment--' + s), s));
    segs.slice(6).forEach((s) => assert.ok(s.props.className.includes('hy-progress__segment--neutral')));
  });

  it('keeps tone to the five statuses, and a tone wins over a scale', () => {
    const segs = segments(Progress({ max: 100, 'aria-label': 'x', segments: [{ value: 10, tone: 'error', scale: 'seq-1' }, { value: 10, tone: 'teal' }] }));
    assert.ok(segs[0].props.className.includes('segment--error'));
    assert.ok(segs[1].props.className.includes('segment--neutral'));
  });

  it('maps every scale class to its chart token in the CSS', () => {
    const css = readFileSync(join(dirname(file), 'Progress.css'), 'utf8');
    for (const s of ['seq-1', 'seq-2', 'seq-3', 'seq-4', 'seq-5']) assert.match(css, new RegExp(`segment--${s} \\{ --hy-seg: var\\(--chart-${s}\\); \\}`));
    assert.match(css, /segment--series \{ --hy-seg: var\(--chart-series\); \}/);
  });

  it('a bar with scales but no tooltip or ariaLabel renders as before: one image, no focusable children', () => {
    const tree = Progress({ max: 100, 'aria-label': 'x', segments: [{ value: 10, scale: 'seq-1' }, { value: 20, scale: 'seq-2' }] });
    assert.equal(track(tree).props.role, 'img');
    assert.equal(find(tree, 'hy-progress__cell'), undefined);
    segments(tree).forEach((s) => { assert.equal(s.props.tabIndex, undefined); assert.equal(s.props['aria-hidden'], undefined); });
  });
});

describe('Progress segments: focus and tooltip', () => {
  it('names a focusable segment by ariaLabel, else the tooltip string', () => {
    const tree = render({ max: 100, 'aria-label': 'x', segments: [{ value: 10, tooltip: 'Remux: 412 Titles, 38 %' }, { value: 10, ariaLabel: 'Web-DL', tooltip: { node: 1 } }, { value: 10, ariaLabel: 'Encode' }] });
    assert.deepEqual(focusable(tree).map((n) => n.props['aria-label']), ['Remux: 412 Titles, 38 %', 'Web-DL', 'Encode']);
  });

  it('wraps a tooltip segment in HY.Tooltip, above the bar', () => {
    const tips = nodes(render({ max: 100, 'aria-label': 'x', segments: [{ value: 10, tooltip: 'A' }, { value: 10, ariaLabel: 'B' }] }), (n) => n.type === 'Tooltip');
    assert.equal(tips.length, 1);
    assert.equal(tips[0].props.text, 'A');
    assert.equal(tips[0].props.position, 'top');
  });

  it('shares one Tab stop and hides the segments that are not focusable', () => {
    const tree = render({ max: 100, 'aria-label': 'x', segments: [{ value: 10, tooltip: 'A' }, { value: 10 }, { value: 10, tooltip: 'C' }] });
    assert.deepEqual(focusable(tree).map((n) => n.props.tabIndex), [0, -1]);
    const plain = segments(tree).filter((s) => s.props.tabIndex === undefined);
    assert.equal(plain.length, 1);
    assert.equal(plain[0].props['aria-hidden'], 'true');
  });

  it('puts no focusable element inside a role="img": the bar is a named group instead', () => {
    const tree = render({ label: 'Library', max: 100, segments: [{ value: 10, tooltip: 'A' }, { value: 10, tooltip: 'B' }] });
    assert.equal(track(tree).props.role, 'group');
    assert.equal(track(tree).props['aria-labelledby'], 'id-1');
    nodes(tree, (n) => n.props && n.props.role === 'img').forEach((img) => assert.deepEqual(focusable(img).filter((n) => n !== img), []));
    assert.equal(track(render({ max: 100, 'aria-label': 'Formats', segments: [{ value: 10, tooltip: 'A' }] })).props['aria-label'], 'Formats');
  });

  it('keeps the segment widths and gaps of the unfocusable form', () => {
    const tree = render({ max: 100, gap: true, 'aria-label': 'x', segments: [{ value: 10, tooltip: 'A' }, { value: 30 }, { value: 20, tooltip: 'C' }] });
    const cells = nodes(tree, (n) => n.props && n.props.style && n.props.style.flexBasis !== undefined);
    assert.deepEqual(cells.map((c) => c.props.style.marginLeft), [undefined, 2, 2]);
    assert.deepEqual(cells.map((c) => c.props.style.minWidth), [2, 2, 2]);
    assert.equal(run(tree).props.style.minWidth, 10);
    assert.equal(run(tree).props.style.width, '60%');
  });

  it('draws stops after the segments, unchanged', () => {
    const tree = render({ max: 100, 'aria-label': 'x', stops: [{ value: 50, tooltip: 'Limit' }], segments: [{ value: 40, tooltip: 'A' }] });
    const order = nodes(tree, (n) => n.props && (n.props.tabIndex !== undefined || String(n.props.className || '').includes('hy-progress__trigger')));
    assert.equal(order[0].props.tabIndex, 0);
    assert.ok(order[1].props.className.includes('hy-progress__trigger'));
  });

  it('a bar with no focusable segments is identical with and without the hooks', () => {
    const props = { max: 100, gap: true, label: 'x', stops: [{ value: 5, tooltip: 'S' }], segments: [{ value: 10, tone: 'success' }, { value: 20, tone: 'error' }] };
    const a = Progress(props);
    const b = render(props);
    assert.deepEqual(JSON.parse(JSON.stringify(b)), JSON.parse(JSON.stringify(a)));
    assert.equal(track(b).props.role, 'img');
  });
});
