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
  useState: (init) => [init, () => {}],
  useLayoutEffect: () => {},
  Intl,
  console: { warn: (m) => warnings.push(m) },
  define: (n, fn) => { registry[n] = fn; },
});
vm.runInContext(readFileSync(join(root, 'src/BarList.js'), 'utf8'), context, { filename: 'BarList.js' });
const hiddenKeys = (columns, width) => Object.keys(context.blHiddenKeys(columns, width));

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

describe('BarList.hiddenKeys', () => {
  const col = (key, priority) => ({ key, label: key, ...(priority === undefined ? {} : { priority }) });
  // The label, bar and value need 320px, and each extra column 100px more.
  it('hides nothing when everything fits or the width is not measured', () => {
    assert.deepEqual(hiddenKeys([col('a', 1), col('b', 2)], 520), []);
    assert.deepEqual(hiddenKeys([col('a', 1), col('b', 2)], 0), []);
  });
  it('hides the largest priority number first', () => {
    assert.deepEqual(hiddenKeys([col('a', 2), col('b', 1), col('c', 3)], 520), ['c']);
    assert.deepEqual(hiddenKeys([col('a', 2), col('b', 1), col('c', 3)], 420), ['c', 'a']);
  });
  it('hides ties from the right', () => {
    assert.deepEqual(hiddenKeys([col('a', 1), col('b', 1), col('c', 1)], 520), ['c']);
    assert.deepEqual(hiddenKeys([col('a', 1), col('b', 1), col('c', 1)], 420), ['c', 'b']);
  });
  it('hides a column without a priority before any column with one', () => {
    assert.deepEqual(hiddenKeys([col('a'), col('b', 9), col('c')], 420), ['c', 'a']);
    assert.deepEqual(hiddenKeys([col('a', 1), col('b')], 420), ['b']);
  });
  it('never hides the label, bar and value: at the narrowest every extra column is hidden', () => {
    assert.deepEqual(hiddenKeys([col('a', 1), col('b', 2)], 100).sort(), ['a', 'b']);
  });
});

describe('BarList columns', () => {
  const columns = [{ key: 'p50', label: 'P50' }, { key: 'p99', label: 'P99', priority: 1 }];
  const items = [{ label: 'api-gateway', value: 318, columns: { p50: '12 ms', p99: h2('240 ms') } }, { label: 'edge-cache', value: 204, columns: { p50: '9 ms' } }];
  function h2(text) { return { type: 'b', props: {}, children: [text] }; }
  const table = (props) => { mount(); return render({ ...NAMED, columns, items, ...props }); };
  const cells = (row) => row.children.filter((n) => n && n.props && n.props.role);
  it('is an ARIA table with a header row of column headers and a row of cells per item', () => {
    const t = table();
    assert.equal(t.type, 'div');
    assert.equal(t.props.role, 'table');
    assert.equal(t.props['aria-label'], 'Top routes');
    const [head, ...body] = t.children;
    assert.equal(head.props.role, 'row');
    assert.deepEqual(cells(head).map((c) => [c.props.role, name(c)]), [['columnheader', 'Label'], ['columnheader', 'Value'], ['columnheader', 'P50'], ['columnheader', 'P99']]);
    assert.equal(body.length, 2);
    for (const row of body) {
      assert.equal(row.props.role, 'row');
      assert.deepEqual(cells(row).map((c) => c.props.role), ['cell', 'cell', 'cell', 'cell']);
    }
  });
  it('names the first two headers with labelHeader and valueHeader', () => {
    const head = table({ labelHeader: 'Route', valueHeader: 'Requests' }).children[0];
    assert.deepEqual(cells(head).slice(0, 2).map(name), ['Route', 'Requests']);
  });
  it('puts the label, the value and each figure in its cell, and an empty cell for a missing figure', () => {
    const [, a, b] = table({ unit: 'requests' }).children;
    assert.deepEqual(cells(a).map(name), ['api-gateway', '318 requests', '12 ms', '240 ms']);
    assert.deepEqual(cells(b).map(name), ['edge-cache', '204 requests', '9 ms', '']);
    assert.equal(cells(b).length, 4);
  });
  it('lays every row out on the same column template', () => {
    const t = table();
    assert.match(t.props.style['--hy-bar-list-cols'], /repeat\(2, 88px\)/);
  });
  it('keeps the bar in the value cell, hidden from assistive technology', () => {
    const [, a] = table().children;
    assert.ok(hidden(find(a, (n) => /hy-bar-list__bar/.test(n.props.className || ''))));
  });
  it('treats an empty columns array as no columns', () => {
    mount();
    assert.equal(render({ ...NAMED, columns: [], items }).type, 'ul');
  });
});

describe('BarList onOpen', () => {
  const opened = [];
  const item = { label: 'api-gateway', value: 318 };
  const list = (props) => { mount(); return render({ ...NAMED, items: [item, { label: 'edge-cache', value: 4, href: '/edge' }], ...props }); };
  it('renders a row as a button when it has onOpen and no href, and keeps a link for an href', () => {
    const [a, b] = rows(list({ onOpen: () => {} }));
    const button = find(a, (n) => n.type === 'button');
    assert.equal(button.props.type, 'button');
    assert.match(button.props.className, /hy-bar-list__row/);
    assert.equal(find(b, (n) => n.type === 'a').props.href, '/edge');
    assert.equal(find(b, (n) => n.type === 'button'), null);
  });
  it('names the row with its label first', () => {
    const [a, b] = rows(list({ onOpen: () => {}, unit: 'minutes' }));
    assert.equal(name(find(a, (n) => n.type === 'button')), 'api-gateway, 318 minutes');
    assert.equal(name(find(b, (n) => n.type === 'a')), 'edge-cache, 4 minutes');
  });
  it('calls onOpen with the item on a button click', () => {
    opened.length = 0;
    const [a] = rows(list({ onOpen: (...args) => opened.push(args) }));
    find(a, (n) => n.type === 'button').props.onClick({ type: 'click' });
    assert.equal(opened.length, 1);
    assert.equal(opened[0][0], item);
  });
  it('makes an item with both href and onOpen a link that calls onOpen with the event', () => {
    opened.length = 0;
    const li = rows(list({ onOpen: (...args) => opened.push(args) }))[1];
    const link = find(li, (n) => n.type === 'a');
    const event = { type: 'click' };
    link.props.onClick(event);
    assert.equal(opened[0][0].href, '/edge');
    assert.equal(opened[0][1], event);
  });
  it('leaves a link without onOpen alone', () => {
    const link = find(rows(list({}))[1], (n) => n.type === 'a');
    assert.equal(link.props.onClick, undefined);
  });
  it('opens table rows from the label cell, with the label as the name', () => {
    opened.length = 0;
    mount();
    const t = render({ ...NAMED, columns: [{ key: 'x', label: 'X' }], onOpen: (...a) => opened.push(a), items: [item, { label: 'edge-cache', value: 4, href: '/edge' }] });
    const [, a, b] = t.children;
    const button = find(a, (n) => n.type === 'button');
    assert.equal(name(button), 'api-gateway');
    button.props.onClick({});
    assert.equal(opened[0][0], item);
    assert.equal(find(b, (n) => n.type === 'a').props.href, '/edge');
  });
});

describe('BarList without the new props', () => {
  it('renders the same markup as before: a ul of li rows, with no table roles, buttons or handlers', () => {
    mount();
    const t = render({ ...NAMED, items: [{ label: 'a', value: 1 }, { label: 'b', value: 2, href: '/b' }] });
    assert.equal(t.type, 'ul');
    assert.equal(t.props.role, 'list');
    assert.equal(t.props.ref, undefined);
    assert.equal(t.props.style, undefined);
    assert.equal(findAll(t, (n) => n.type === 'button' || n.props.role === 'row' || n.props.role === 'cell').length, 0);
    const [a, b] = rows(t);
    assert.equal(a.props.className, 'hy-bar-list__item');
    assert.deepEqual(a.children.map((c) => c.props.className), ['hy-bar-list__row']);
    assert.deepEqual({ ...find(b, (n) => n.type === 'a').props }, { className: 'hy-bar-list__row hy-bar-list__row--link', href: '/b' });
    assert.deepEqual(find(a, (n) => /hy-bar-list__row/.test(n.props.className || '')).children.map((c) => c.props.className), ['hy-bar-list__label', 'hy-sr', 'hy-bar-list__bar', 'hy-bar-list__value']);
  });
});
