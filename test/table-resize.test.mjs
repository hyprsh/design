// Tests for resizable Table columns: the pure width maths (absorb into the truncate column, stickyHeader clamp, min/max,
// reset, keyboard steps, change phases) and the resize handle never sorting. Table.js runs in a vm context like
// table-skeleton.test.mjs; its top-level helpers are globals of that context, and the parts come back through `define`.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const file = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src/Table.js');
const registry = {};
let ctxValue = null;
const context = vm.createContext({
  HY: { Skeleton: 'Skeleton' },
  React: { createContext: () => ({ Provider: 'Provider' }), useContext: () => ctxValue, Children: { toArray: (c) => [].concat(c || []) } },
  useId: () => 'id-1',
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(file, 'utf8'), context, { filename: file });
const { layoutTable, columnMin, columnMax, resolveWidth, columnLimits, keyWidth, columnResizer, MIN_COLUMN } = context;

// A measured table: a fixed 80px column, two resizable ones and a truncate column with a 60px minimum.
const col = (o) => Object.assign({ key: null, resizable: false, truncate: false, def: 0, min: 0, max: Infinity }, o);
const cols = [
  col({ def: 80, min: 80, max: 80 }),
  col({ key: 'name', resizable: true, def: 120, min: 64, max: 300 }),
  col({ key: 'branch', resizable: true, def: 100, min: 48 }),
  col({ truncate: true, min: 60 }),
];
const plain = (o) => JSON.parse(JSON.stringify(o));

describe('layoutTable', () => {
  it('lets the truncate column take the rest of the row at the defaults', () => {
    const l = layoutTable(cols, {}, 800);
    assert.deepEqual(plain(l.widths), [80, 120, 100, null]);
    assert.equal(l.tableWidth, 800);
    assert.equal(l.truncateWidth, 500);
  });

  it('takes a wider column out of the truncate column, and leaves the others alone', () => {
    const l = layoutTable(cols, { name: 250 }, 800);
    assert.deepEqual(plain(l.widths), [80, 250, 100, null]);
    assert.equal(l.tableWidth, 800);
    assert.equal(l.truncateWidth, 370);
  });

  it('grows the table once the truncate column is at its minimum', () => {
    const l = layoutTable(cols, { name: 300, branch: 400 }, 800);
    assert.equal(l.truncateWidth, 60);
    assert.equal(l.tableWidth, 80 + 300 + 400 + 60);
    assert.equal(l.css, 'max(100%, 840px)');
  });

  it('shares the remaining room equally between several truncate columns', () => {
    const two = cols.concat([col({ truncate: true, min: 40 })]);
    const l = layoutTable(two, {}, 800);
    assert.equal(l.truncateWidth, 250);
    assert.equal(l.css, 'max(100%, 400px)');
  });

  it('sizes a table without a truncate column to the sum of its columns, wider than the container if need be', () => {
    const fixed = cols.slice(0, 3);
    assert.equal(layoutTable(fixed, {}, 800).css, '300px');
    assert.equal(layoutTable(fixed, { branch: 900 }, 800).tableWidth, 1100);
  });
});

describe('column limits', () => {
  it('uses the measured header width with a 48px floor', () => {
    assert.equal(columnMin(90), 90);
    assert.equal(columnMin(20), MIN_COLUMN);
    assert.equal(columnMin(undefined), 48);
  });

  it('lets minWidth replace the measured minimum, still above the floor', () => {
    assert.equal(columnMin(90, 120), 120);
    assert.equal(columnMin(90, 60), 60);
    assert.equal(columnMin(90, 10), 48);
  });

  it('has no maximum unless maxWidth sets one, and never below the minimum', () => {
    assert.equal(columnMax(64), Infinity);
    assert.equal(columnMax(64, 200), 200);
    assert.equal(columnMax(64, 30), 64);
  });

  it('clamps stored widths to the column limits', () => {
    assert.equal(resolveWidth(cols[1], { name: 10 }), 64);
    assert.equal(resolveWidth(cols[1], { name: 900 }), 300);
    assert.equal(resolveWidth(cols[1], {}), 120);
  });

  it('ignores stored widths for columns that are not resizable', () => {
    assert.equal(resolveWidth(cols[0], { name: 500 }), 80);
  });

  it('caps the drag at maxWidth, else nothing; End and aria-valuemax fall back to the container width', () => {
    assert.deepEqual(plain(columnLimits(cols, {}, 'name', { container: 800 })), { min: 64, max: 300, dragMax: 300 });
    const b = columnLimits(cols, {}, 'branch', { container: 800 });
    assert.equal(b.min, 48);
    assert.equal(b.dragMax, null);
    assert.equal(b.max, 800);
  });

  it('with stickyHeader, keeps the table inside its container: the others plus the truncate minimum', () => {
    // 800 - 80 - 120 (name) - 60 (truncate min) = 540 for branch.
    const b = columnLimits(cols, {}, 'branch', { container: 800, sticky: true });
    assert.equal(b.max, 540);
    assert.equal(b.dragMax, 540);
    // Without a truncate column the others alone: 800 - 80 - 100 = 620, capped by maxWidth 300.
    assert.equal(columnLimits(cols.slice(0, 3), {}, 'name', { container: 800, sticky: true }).max, 300);
    assert.equal(columnLimits(cols.slice(0, 3), {}, 'branch', { container: 800, sticky: true }).max, 600);
  });

  it('with stickyHeader, never lets the max fall under the minimum', () => {
    assert.equal(columnLimits(cols, {}, 'branch', { container: 200, sticky: true }).max, 48);
  });
});

describe('keyWidth', () => {
  const lim = { min: 48, max: 300 };
  it('steps 8px with the arrows and 32px with Shift', () => {
    assert.equal(keyWidth({ key: 'ArrowRight' }, 100, lim), 108);
    assert.equal(keyWidth({ key: 'ArrowLeft' }, 100, lim), 92);
    assert.equal(keyWidth({ key: 'ArrowRight', shiftKey: true }, 100, lim), 132);
    assert.equal(keyWidth({ key: 'ArrowLeft', shiftKey: true }, 100, lim), 68);
  });
  it('stays inside the limits', () => {
    assert.equal(keyWidth({ key: 'ArrowLeft', shiftKey: true }, 60, lim), 48);
    assert.equal(keyWidth({ key: 'ArrowRight' }, 296, lim), 300);
  });
  it('jumps to the limits with Home and End, and resets with Enter', () => {
    assert.equal(keyWidth({ key: 'Home' }, 100, lim), 48);
    assert.equal(keyWidth({ key: 'End' }, 100, lim), 300);
    assert.equal(keyWidth({ key: 'Enter' }, 100, lim), 'reset');
  });
  it('ignores other keys', () => {
    assert.equal(keyWidth({ key: 'a' }, 100, lim), null);
    assert.equal(keyWidth({ key: 'ArrowUp' }, 100, lim), null);
  });
});

describe('columnResizer', () => {
  function setup(initial) {
    const calls = [];
    let widths = initial || {};
    const r = columnResizer({
      getWidths: () => widths,
      emit: (next, meta) => { calls.push([plain(next), plain(meta)]); widths = next; },
    });
    return { r, calls };
  }
  const name = { key: 'name', width: 120, def: 120, min: 64, max: 300, dragMax: 300 };

  it('emits drag while the pointer moves and end on release, with the final widths', () => {
    const { r, calls } = setup();
    const s = r.start(name, 500);
    s.move(510); s.move(530); s.move(530); s.end();
    assert.deepEqual(calls, [
      [{ name: 130 }, { key: 'name', phase: 'drag' }],
      [{ name: 150 }, { key: 'name', phase: 'drag' }],
      [{ name: 150 }, { key: 'name', phase: 'end' }],
    ]);
  });

  it('emits nothing for a click without movement', () => {
    const { r, calls } = setup();
    const s = r.start(name, 500);
    s.end();
    assert.deepEqual(calls, []);
  });

  it('clamps the drag to the limits, and stops at dragMax', () => {
    const { r, calls } = setup();
    const s = r.start(name, 500);
    s.move(0); s.move(2000); s.end();
    assert.deepEqual(calls.map((c) => c[0].name), [64, 300, 300]);
  });

  it('has no upper limit without dragMax', () => {
    const { r, calls } = setup();
    r.start(Object.assign({}, name, { max: 800, dragMax: null }), 0).move(5000);
    assert.equal(calls[0][0].name, 5120);
  });

  it('drops the key when a column goes back to its default, so {} is the default layout', () => {
    const { r, calls } = setup({ name: 140, other: 90 });
    const s = r.start(Object.assign({}, name, { width: 140 }), 500);
    s.move(480); s.end();
    assert.deepEqual(calls[0][0], { other: 90 });
  });

  it('emits end on each keyboard step, and nothing when the step changes nothing', () => {
    const { r, calls } = setup();
    assert.equal(r.key(name, { key: 'ArrowRight', shiftKey: true }), true);
    assert.deepEqual(calls[0], [{ name: 152 }, { key: 'name', phase: 'end' }]);
    r.key(name, { key: 'End' });
    assert.equal(calls.length, 2);
    assert.deepEqual(calls[1], [{ name: 300 }, { key: 'name', phase: 'end' }]);
    assert.equal(r.key(Object.assign({}, name, { width: 300 }), { key: 'End' }), true);
    assert.equal(calls.length, 2);
    assert.equal(r.key(name, { key: 'x' }), false);
  });

  it('resets by removing the key, with phase end, on Enter and on reset()', () => {
    const { r, calls } = setup({ name: 200, branch: 90 });
    r.key(Object.assign({}, name, { width: 200 }), { key: 'Enter' });
    assert.deepEqual(calls[0], [{ branch: 90 }, { key: 'name', phase: 'end' }]);
    r.reset('branch');
    assert.deepEqual(calls[1], [{}, { key: 'branch', phase: 'end' }]);
    r.reset('branch');
    assert.equal(calls.length, 2);
  });
});

describe('resize handle', () => {
  function head(props, ctx) {
    ctxValue = Object.assign({ ready: true, loading: false, width: () => 120, limits: () => ({ min: 64, max: 300 }), dragging: null,
      startDrag: () => {}, keyDown: () => {}, reset: () => {}, heads: {}, els: {} }, ctx);
    const th = registry.TableHead(Object.assign({ resizable: true, columnKey: 'name', children: 'Name' }, props));
    ctxValue = null;
    return th;
  }
  const find = (node, pred) => {
    if (!node || typeof node !== 'object') return null;
    if (pred(node)) return node;
    for (const c of node.children || []) { const f = find(c, pred); if (f) return f; }
    return null;
  };
  const isHandle = (n) => n.props && n.props.role === 'separator';
  const ev = () => ({ preventDefault() {}, stopPropagation() {}, button: 0, clientX: 10, pointerId: 1, currentTarget: { setPointerCapture() {} } });

  it('sits outside the sort button, and dragging, clicking or double-clicking it never sorts', () => {
    let sorts = 0; const started = []; const resets = [];
    const th = head({ onSort: () => { sorts++; }, sort: 'none' }, { startDrag: (k) => started.push(k), reset: (k) => resets.push(k) });
    const button = find(th, (n) => n.type === 'button');
    assert.ok(button);
    assert.equal(find(button, isHandle), null);
    const handle = find(th, isHandle);
    assert.ok(handle);
    for (const name of ['onPointerDown', 'onPointerMove', 'onPointerUp', 'onClick', 'onDoubleClick', 'onMouseDown']) {
      if (handle.props[name]) handle.props[name](ev());
    }
    handle.props.onKeyDown(Object.assign(ev(), { key: 'Enter' }));
    assert.equal(sorts, 0);
    assert.deepEqual(started, ['name']);
    assert.deepEqual(resets, ['name']);
  });

  it('is a focusable vertical separator named by the header, with its width in px', () => {
    const handle = find(head({}), isHandle);
    assert.equal(handle.props.tabIndex, 0);
    assert.equal(handle.props['aria-orientation'], 'vertical');
    assert.equal(handle.props['aria-valuenow'], 120);
    assert.equal(handle.props['aria-valuemin'], 64);
    assert.equal(handle.props['aria-valuemax'], 300);
    const labelId = handle.props['aria-labelledby'];
    assert.ok(labelId);
    assert.ok(find(head({}), (n) => n.props && n.props.id === labelId && n !== handle));
  });

  it('is visible but inert while loading', () => {
    let started = 0;
    const handle = find(head({}, { loading: true, startDrag: () => { started++; } }), isHandle);
    assert.ok(handle);
    assert.equal(handle.props.tabIndex, undefined);
    assert.equal(handle.props['aria-disabled'], 'true');
    if (handle.props.onPointerDown) handle.props.onPointerDown(ev());
    assert.equal(started, 0);
  });

  it('renders no handle on a head that is not resizable, or before the widths are measured', () => {
    assert.equal(find(head({ resizable: false }), isHandle), null);
    assert.equal(find(head({}, { ready: false }), isHandle), null);
  });
});

describe('Table data form', () => {
  const columns = [
    { key: 'time', header: 'Time', resizable: true, width: 96 },
    { key: 'level', header: 'Level', sortable: true, resizable: true, minWidth: 64, maxWidth: 160 },
    { key: 'message', header: 'Message', truncate: true, resizable: true },
  ];
  const heads = (tree) => {
    const out = [];
    (function walk(n) { if (!n || typeof n !== 'object') return; if (n.type === registry.TableHead) out.push(n); (n.children || []).forEach(walk); })(tree);
    return out;
  };

  it('wraps a table with resizable columns in the width owner and marks its heads; truncate ignores resizable', () => {
    const tree = registry.Table({ columns, rows: [], columnWidths: { time: 120 } });
    assert.equal(tree.type, context.TableResizer);
    assert.deepEqual(plain(tree.props.columnWidths), { time: 120 });
    const hs = heads(tree);
    assert.deepEqual(hs.map((x) => x.props.resizable), [true, true, false]);
    assert.deepEqual(hs.map((x) => x.props.columnKey), ['time', 'level', 'message']);
    assert.equal(hs[0].props.width, 96);
    assert.equal(hs[1].props.minWidth, 64);
    assert.equal(hs[1].props.maxWidth, 160);
    assert.equal(hs[2].props.truncate, true);
  });

  it('renders a table without resizable columns as before: no width owner, no extra head props', () => {
    const tree = registry.Table({ columns: [{ key: 'a', header: 'A' }, { key: 'b', header: 'B', truncate: true }], rows: [] });
    assert.equal(tree.type, registry.TableRoot);
    for (const x of heads(tree)) {
      assert.equal('resizable' in x.props, false);
      assert.equal('truncate' in x.props, false);
      assert.equal('columnKey' in x.props, false);
    }
  });
});
