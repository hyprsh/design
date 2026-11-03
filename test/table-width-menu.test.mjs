// Tests for resizing from Table.ColumnsMenu (ADR 0003): the Wider, Narrower and Reset Width items, their limits (shared with the
// resize handle's keys), the announcements, a resize-only table without the reorder props, and touch-only devices.
// Table.js runs in a vm context like table-reorder.test.mjs; `touch` switches the stubbed media query.
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const file = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src/Table.js');
const registry = {};
let touch = false;
const context = vm.createContext({
  HY: { Skeleton: 'Skeleton', Menu: 'Menu' },
  React: { createContext: () => ({ Provider: 'Provider' }), useContext: () => null, Children: { toArray: (c) => [].concat(c || []) }, Fragment: 'Fragment' },
  window: { matchMedia: (q) => ({ matches: touch && q === '(hover: none) and (pointer: coarse)', addEventListener() {}, removeEventListener() {} }) },
  useId: () => 'id-1',
  useState: (v) => [typeof v === 'function' ? v() : v, () => {}],
  useEffect: () => {},
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(file, 'utf8'), context, { filename: file });
const { registerWidthTable, keyWidth } = context;
const plain = (o) => JSON.parse(JSON.stringify(o));

// Status 120 (48..300), Branch 100 (>= 48, no cap), Notes truncate, Id not resizable.
const columns = [
  { key: 'status', header: 'Status', resizable: true },
  { key: 'branch', header: 'Branch', resizable: true },
  { key: 'notes', header: 'Notes', truncate: true, resizable: true },
  { key: 'id', header: 'Id' },
];
const measured = (container = 800) => ({
  keys: ['status', 'branch'], container, sticky: false,
  cols: [
    { key: 'status', resizable: true, truncate: false, def: 120, min: 48, max: 300 },
    { key: 'branch', resizable: true, truncate: false, def: 100, min: 48, max: Infinity },
    { key: null, resizable: false, truncate: true, def: 0, min: 60, max: Infinity },
    { key: null, resizable: false, truncate: false, def: 80, min: 80, max: 80 },
  ],
});

let unregister = null;
function table(entry) { if (unregister) unregister(); unregister = registerWidthTable(entry); }
beforeEach(() => { touch = false; table(measured()); });

const find = (items, label) => items.filter((i) => i.label === label)[0];
function menu(props) {
  const widthCalls = [];
  const tree = registry.TableColumnsMenu(Object.assign({ columns, onColumnWidthsChange: (w, c) => widthCalls.push(plain([w, c])) }, props));
  const nodes = [tree].concat(tree.children);
  const m = nodes.filter((n) => n && n.type === 'Menu')[0];
  return { items: m ? m.props.items : [], menu: m, calls: widthCalls, tree, live: nodes.filter((n) => n && n.props && n.props['aria-live'])[0] };
}
const labels = (items) => plain(items.filter((i) => i.label).map((i) => i.label));

describe('Table.ColumnsMenu width items', () => {
  it('lists Wider, Narrower and Reset Width for each resizable column, none for a truncate or fixed column', () => {
    const { items } = menu({ columnWidths: {} });
    assert.deepEqual(labels(items), [
      'Make Status Wider', 'Make Status Narrower', 'Reset Status Width',
      'Make Branch Wider', 'Make Branch Narrower', 'Reset Branch Width',
    ]);
  });

  it('steps by 32px and reports each change with phase end, like Shift+Right on the handle', () => {
    const { items, calls } = menu({ columnWidths: {} });
    find(items, 'Make Status Wider').onSelect();
    find(items, 'Make Branch Narrower').onSelect();
    assert.deepEqual(calls, [[{ status: 152 }, { key: 'status', phase: 'end' }], [{ branch: 68 }, { key: 'branch', phase: 'end' }]]);
    assert.equal(keyWidth({ key: 'ArrowRight', shiftKey: true }, 120, { min: 48, max: 300 }), 152);
  });

  it('works from the current widths, and drops the key when a step returns to the default', () => {
    const { items, calls } = menu({ columnWidths: { status: 152, branch: 132 } });
    find(items, 'Make Status Narrower').onSelect();
    find(items, 'Make Branch Narrower').onSelect();
    assert.deepEqual(calls, [[{ branch: 132 }, { key: 'status', phase: 'end' }], [{ status: 152 }, { key: 'branch', phase: 'end' }]]);
  });

  it('clamps to maxWidth and the minimum, and disables a step that would change nothing', () => {
    let { items, calls } = menu({ columnWidths: { status: 290, branch: 50 } });
    assert.equal(find(items, 'Make Status Wider').disabled, false);
    find(items, 'Make Status Wider').onSelect();
    find(items, 'Make Branch Narrower').onSelect();
    assert.deepEqual(calls, [[{ status: 300, branch: 50 }, { key: 'status', phase: 'end' }], [{ status: 290, branch: 48 }, { key: 'branch', phase: 'end' }]]);
    ({ items } = menu({ columnWidths: { status: 300, branch: 48 } }));
    assert.equal(find(items, 'Make Status Wider').disabled, true);
    assert.equal(find(items, 'Make Branch Narrower').disabled, true);
    assert.equal(find(items, 'Make Status Narrower').disabled, false);
  });

  it('keeps stickyHeader columns inside the container, as the handle does', () => {
    const t = measured(500);
    t.sticky = true;
    table(t);
    // Status can use what Branch, the fixed Id column and Notes' minimum leave: 500 - 100 - 80 - 60 = 260.
    let { items, calls } = menu({ columnWidths: { status: 250 } });
    find(items, 'Make Status Wider').onSelect();
    assert.deepEqual(calls, [[{ status: 260 }, { key: 'status', phase: 'end' }]]);
    // A wider Branch leaves Status less than it has: Wider would shrink it, so it is disabled.
    ({ items } = menu({ columnWidths: { branch: 250 } }));
    assert.equal(find(items, 'Make Status Wider').disabled, true);
    ({ items } = menu({ columnWidths: {} }));
    assert.equal(find(items, 'Make Status Wider').disabled, false);
  });

  it('resets like Enter on the handle: the key goes, and it is disabled at the default', () => {
    const { items, calls } = menu({ columnWidths: { status: 200 } });
    assert.equal(find(items, 'Reset Branch Width').disabled, true);
    find(items, 'Reset Status Width').onSelect();
    assert.deepEqual(calls, [[{}, { key: 'status', phase: 'end' }]]);
  });

  it('asks the menu to stay open after a width item, not after a move', () => {
    const { items } = menu({ columnWidths: {}, columnOrder: [] });
    for (const l of ['Make Status Wider', 'Make Status Narrower', 'Reset Status Width']) assert.equal(find(items, l).keepOpen, true);
    assert.equal(find(items, 'Move Status Right').keepOpen, undefined);
  });

  it('disables Wider and Narrower until a table resizing those keys has measured, but still lists Reset Width', () => {
    unregister(); unregister = null;
    const cols = [{ key: 'a', header: 'A', resizable: true, width: 100 }, { key: 'b', header: 'B', resizable: true, width: 100, maxWidth: 300 }];
    const { items, calls } = menu({ columns: cols, columnWidths: { a: 140 } });
    for (const l of ['Make A Wider', 'Make A Narrower', 'Make B Wider', 'Make B Narrower']) assert.equal(find(items, l).disabled, true, l);
    assert.equal(find(items, 'Reset A Width').disabled, false);
    assert.equal(find(items, 'Reset B Width').disabled, true);
    find(items, 'Reset A Width').onSelect();
    assert.deepEqual(calls, [[{}, { key: 'a', phase: 'end' }]]);
  });

  it('uses the first measured table that resizes the same keys', () => {
    const second = measured();
    second.cols[0].max = 130;
    const off = registerWidthTable(second);
    const { items } = menu({ columnWidths: { status: 120 } });
    off();
    assert.equal(find(items, 'Make Status Wider').disabled, false);
  });
});

describe('Table.ColumnsMenu announcements', () => {
  // The live region shows the message set by the last change; useState is a stub here, so the message is read from the
  // pure helpers it is built from.
  const { widthMessage } = context;
  it('says the new width, or that the width was reset', () => {
    const cols = measured().cols;
    assert.equal(widthMessage(columns, cols, 'status', { status: 240 }), 'Status 240 pixels wide');
    assert.equal(widthMessage(columns, cols, 'status', {}), 'Status 120 pixels wide');
  });
  it('has a polite live region next to the menu', () => {
    const { live } = menu({ columnWidths: {} });
    assert.equal(live.props['aria-live'], 'polite');
  });
});

describe('Table.ColumnsMenu without reorder props', () => {
  it('lists only width items, with no moves and no Reset Order, for a resize-only table', () => {
    const { items } = menu({ columnWidths: {} });
    assert.ok(!items.some((i) => i.separator));
    assert.ok(labels(items).every((l) => !/Move|Order/.test(l)));
    assert.equal(labels(items).length, 6);
  });
  it('still lists the moves and Reset Order with the order props, and only those without the width props', () => {
    const both = menu({ columnWidths: {}, columnOrder: [], onColumnOrderChange() {} }).items;
    assert.ok(find(both, 'Move Status Left') && find(both, 'Reset Order') && find(both, 'Make Status Wider'));
    const order = menu({ columnOrder: [], onColumnOrderChange() {}, onColumnWidthsChange: undefined }).items;
    assert.deepEqual(labels(order).filter((l) => /Make|Width/.test(l)), []);
  });
});

describe('Table.ColumnsMenu on a touch-only device', () => {
  it('hides the width items and keeps the moves', () => {
    touch = true;
    const { items } = menu({ columnWidths: {}, columnOrder: [], onColumnOrderChange() {} });
    assert.deepEqual(labels(items).filter((l) => /Make|Width/.test(l)), []);
    assert.ok(find(items, 'Move Status Left'));
  });
  it('does not render the trigger when only width items would be left', () => {
    touch = true;
    const { menu: m, tree } = menu({ columnWidths: {} });
    assert.equal(m, undefined);
    assert.equal(tree.props['aria-live'], 'polite');
  });
});
