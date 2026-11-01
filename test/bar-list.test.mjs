// Tests for BarList (hyprsh/design#72). BarList.js is plain script that runs in the bundle's scope,
// so it runs here in a vm context with stub hooks; the vnode tree it returns is inspected directly.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '../project/components');
const registry = {};
const warnings = [];
const slots = [];
const slot = { i: 0 };
const mount = () => { slots.length = 0; };
const render = (props) => { slot.i = 0; return registry.BarList(props); };
const context = vm.createContext({
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity) }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  useRef: (init) => (slots[slot.i] || (slots[slot.i] = { current: init }), slots[slot.i++]),
  Intl,
  console: { warn: (m) => warnings.push(m) },
  define: (n, fn) => { registry[n] = fn; },
});
vm.runInContext(readFileSync(join(root, 'src/BarList.js'), 'utf8'), context, { filename: 'BarList.js' });

const find = (node, pred) => {
  if (!node || typeof node !== 'object') return null;
  if (pred(node)) return node;
  for (const c of node.children || []) { const f = find(c, pred); if (f) return f; }
  return null;
};
const findAll = (node, pred, out = []) => {
  if (!node || typeof node !== 'object') return out;
  if (pred(node)) out.push(node);
  for (const c of node.children || []) findAll(c, pred, out);
  return out;
};
const hidden = (n) => n.props['aria-hidden'] === 'true' || n.props['aria-hidden'] === true;
const name = (node) => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node !== 'object') return String(node);
  if (hidden(node)) return '';
  return node.children.map(name).join('');
};
const rows = (tree) => findAll(tree, (n) => n.type === 'li');
const bars = (li) => findAll(li, (n) => n.props.className && /hy-bar-list__bar\b/.test(n.props.className) && !/__bar-/.test(n.props.className));
const fill = (li) => find(li, (n) => /hy-bar-list__fill/.test(n.props.className || ''));
const NAMED = { 'aria-label': 'Top routes' };

describe('BarList structure', () => {
  it('renders a ul with a li per item, in the order given', () => {
    mount();
    const t = render({ ...NAMED, items: [{ label: 'b', value: 1 }, { label: 'a', value: 9 }] });
    assert.equal(t.type, 'ul');
    assert.equal(t.props['aria-label'], 'Top routes');
    assert.deepEqual(rows(t).map((li) => find(li, (n) => n.props.title).props.title), ['b', 'a']);
  });
  it('puts the full label in title', () => {
    mount();
    const li = rows(render({ ...NAMED, items: [{ label: 'a-very-long-label', value: 1 }] }))[0];
    const label = find(li, (n) => n.props.title === 'a-very-long-label');
    assert.match(label.props.className, /hy-bar-list__label/);
  });
});

describe('BarList bar sizing', () => {
  const widths = (props) => { mount(); return rows(render({ ...NAMED, ...props })).map((li) => { const f = fill(li); return f ? f.props.style : null; }); };
  it('scales to the largest value', () => {
    const w = widths({ items: [{ label: 'a', value: 200 }, { label: 'b', value: 50 }] });
    assert.equal(w[0].width, '100%');
    assert.equal(w[1].width, '25%');
  });
  it('scales to max when given', () => {
    const w = widths({ max: 400, items: [{ label: 'a', value: 200 }] });
    assert.equal(w[0].width, '50%');
  });
  it('draws no bar for zero', () => {
    const w = widths({ items: [{ label: 'a', value: 0 }, { label: 'b', value: 5 }] });
    assert.equal(w[0], null);
    assert.ok(w[1]);
  });
  it('draws no bar when everything is zero', () => {
    assert.deepEqual(widths({ items: [{ label: 'a', value: 0 }] }), [null]);
  });
  it('never draws a non-zero bar under 2px', () => {
    const w = widths({ items: [{ label: 'a', value: 100000 }, { label: 'b', value: 1 }] });
    assert.equal(w[1].minWidth, '2px');
  });
  it('clamps a value above max to the full width', () => {
    assert.equal(widths({ max: 10, items: [{ label: 'a', value: 50 }] })[0].width, '100%');
  });
  it('hides the bar from assistive technology', () => {
    mount();
    const li = rows(render({ ...NAMED, items: [{ label: 'a', value: 5 }] }))[0];
    const bar = find(li, (n) => /hy-bar-list__bar/.test(n.props.className || ''));
    assert.ok(hidden(bar));
  });
});

describe('BarList accessible text', () => {
  const text = (props) => { mount(); return rows(render({ ...NAMED, items: [{ label: 'api-gateway', value: 318 }], ...props })).map(name); };
  it('is "label, value"', () => {
    assert.deepEqual(text({}), ['api-gateway, 318']);
  });
  it('formats values with Intl.NumberFormat by default', () => {
    assert.deepEqual(text({ items: [{ label: 'a', value: 1234567 }] }), ['a, ' + new Intl.NumberFormat().format(1234567)]);
  });
  it('uses valueFormatter', () => {
    assert.deepEqual(text({ valueFormatter: (v) => v + ' ms' }), ['api-gateway, 318 ms']);
  });
  it('appends unit after the value', () => {
    assert.deepEqual(text({ unit: 'minutes' }), ['api-gateway, 318 minutes']);
  });
});

describe('BarList links', () => {
  it('renders a link for an item with href and plain text without', () => {
    mount();
    const [a, b] = rows(render({ ...NAMED, items: [{ label: 'a', value: 1, href: '/a' }, { label: 'b', value: 2 }] }));
    const link = find(a, (n) => n.type === 'a');
    assert.equal(link.props.href, '/a');
    assert.equal(find(b, (n) => n.type === 'a' || n.type === 'button'), null);
  });
  it('keeps the accessible text inside the link', () => {
    mount();
    const li = rows(render({ ...NAMED, unit: 'minutes', items: [{ label: 'a', value: 3, href: '/a' }] }))[0];
    assert.equal(name(find(li, (n) => n.type === 'a')), 'a, 3 minutes');
  });
});

describe('BarList options and states', () => {
  it('mono adds a modifier class', () => {
    mount();
    assert.match(render({ ...NAMED, mono: true, items: [{ label: 'a', value: 1 }] }).props.className || '', /hy-bar-list--mono/);
    mount();
    assert.doesNotMatch(render({ ...NAMED, items: [{ label: 'a', value: 1 }] }).props.className || '', /--mono/);
  });
  it('shows empty when there are no items, else nothing', () => {
    mount();
    assert.equal(render({ ...NAMED, items: [], empty: 'No data' }), 'No data');
    mount();
    assert.equal(render({ ...NAMED, items: [] }), null);
  });
  it('merges className and passes aria-labelledby', () => {
    mount();
    const t = render({ 'aria-labelledby': 'h', className: 'x', items: [{ label: 'a', value: 1 }] });
    assert.match(t.props.className, /hy-bar-list x/);
    assert.equal(t.props['aria-labelledby'], 'h');
  });
});

describe('BarList accessible name warning', () => {
  it('warns once without aria-label or aria-labelledby', () => {
    mount(); warnings.length = 0;
    render({ items: [{ label: 'a', value: 1 }] });
    render({ items: [{ label: 'a', value: 1 }] });
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /BarList/);
  });
  it('does not warn when named', () => {
    mount(); warnings.length = 0;
    render({ ...NAMED, items: [{ label: 'a', value: 1 }] });
    render({ 'aria-labelledby': 'h', items: [] });
    assert.equal(warnings.length, 0);
  });
});

describe('BarList files', () => {
  it('ships css on --chart-series with a 36px row and touch sizing', () => {
    assert.ok(existsSync(join(root, 'BarList/README.md')) && existsSync(join(root, 'BarList/preview.html')));
    const css = readFileSync(join(root, 'src/BarList.css'), 'utf8');
    assert.match(css, /var\(--chart-series\)/);
    assert.match(css, /height: 36px/);
    assert.match(css, /var\(--touch-target\)/);
  });
});
