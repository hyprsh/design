// Tests for reorderable Table columns (ADR 0003): order resolution (missing, unknown and pinned keys), the moves behind
// drag, Alt+arrows and the Columns menu, the announcements, the head's pointer and key behaviour, and the menu items.
// Table.js runs in a vm context like table-resize.test.mjs, with a React stub whose contexts are told apart.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const file = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src/Table.js');
const registry = {};
const values = new Map();
const context = vm.createContext({
  HY: { Skeleton: 'Skeleton', Menu: 'Menu' },
  React: {
    createContext: () => { const c = { Provider: 'Provider' }; return c; },
    useContext: (c) => (values.has(c) ? values.get(c) : null),
    Children: { toArray: (c) => [].concat(c || []) },
    Fragment: 'Fragment',
  },
  useId: () => 'id-1',
  useState: (v) => [v, () => {}],
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(file, 'utf8'), context, { filename: file });
const { resolveColumnOrder, moveColumn, moveColumnTo, orderMessage } = context;
const plain = (o) => JSON.parse(JSON.stringify(o));

const abc = [{ key: 'a', header: 'A' }, { key: 'b', header: 'B' }, { key: 'c', header: 'C' }];
const pinB = [{ key: 'a', header: 'A' }, { key: 'b', header: 'B', pinned: true }, { key: 'c', header: 'C' }, { key: 'd', header: 'D' }];

describe('resolveColumnOrder', () => {
  it('follows the given order, then the columns that are missing from it in their own order', () => {
    assert.deepEqual(plain(resolveColumnOrder(abc, ['b', 'a'])), ['b', 'a', 'c']);
    assert.deepEqual(plain(resolveColumnOrder(abc, ['c'])), ['c', 'a', 'b']);
  });
  it('ignores unknown and repeated keys', () => {
    assert.deepEqual(plain(resolveColumnOrder(abc, ['x', 'c', 'c', 'y', 'a'])), ['c', 'a', 'b']);
  });
  it('is the default order for [], undefined and null', () => {
    for (const o of [[], undefined, null]) assert.deepEqual(plain(resolveColumnOrder(abc, o)), ['a', 'b', 'c']);
  });
  it('keeps a pinned column at its index in the default order, whatever the order says', () => {
    assert.deepEqual(plain(resolveColumnOrder(pinB, ['d', 'c', 'a'])), ['d', 'b', 'c', 'a']);
    assert.deepEqual(plain(resolveColumnOrder(pinB, ['b', 'd'])), ['d', 'b', 'a', 'c']);
  });
});

describe('moveColumn', () => {
  it('moves a column one step and reports the full order with { key, from, to }', () => {
    const r = moveColumn(abc, [], 'a', 1);
    assert.deepEqual(plain(r), { order: ['b', 'a', 'c'], change: { key: 'a', from: 0, to: 1 } });
    assert.deepEqual(plain(moveColumn(abc, ['b', 'a'], 'c', -1)), { order: ['b', 'c', 'a'], change: { key: 'c', from: 2, to: 1 } });
  });
  it('does nothing at the ends', () => {
    assert.equal(moveColumn(abc, [], 'a', -1), null);
    assert.equal(moveColumn(abc, [], 'c', 1), null);
    assert.equal(moveColumn(abc, [], 'zzz', 1), null);
  });
  it('skips over a pinned column, which stays at its index', () => {
    const r = moveColumn(pinB, [], 'a', 1);
    assert.deepEqual(plain(r), { order: ['c', 'b', 'a', 'd'], change: { key: 'a', from: 0, to: 2 } });
    assert.deepEqual(plain(moveColumn(pinB, [], 'c', -1).order), ['c', 'b', 'a', 'd']);
  });
  it('cannot move a pinned column', () => {
    assert.equal(moveColumn(pinB, [], 'b', 1), null);
    assert.equal(moveColumn(pinB, [], 'b', -1), null);
  });
});

describe('pinned columns', () => {
  it('are read from the columns once per column for a move', () => {
    let reads = 0;
    const cols = pinB.map((c) => ({ key: c.key, header: c.header, get pinned() { reads++; return c.pinned; } }));
    moveColumn(cols, [], 'a', 1);
    assert.equal(reads, cols.length);
  });
});

describe('moveColumnTo (a drop on another head)', () => {
  it('puts the column in the target head\'s slot: dragging a onto c gives b, c, a', () => {
    assert.deepEqual(plain(moveColumnTo(abc, [], 'a', 'c')), { order: ['b', 'c', 'a'], change: { key: 'a', from: 0, to: 2 } });
    assert.deepEqual(plain(moveColumnTo(abc, [], 'c', 'a')), { order: ['c', 'a', 'b'], change: { key: 'c', from: 2, to: 0 } });
  });
  it('ignores a drop on itself, on a pinned head, or of a pinned head', () => {
    assert.equal(moveColumnTo(abc, [], 'a', 'a'), null);
    assert.equal(moveColumnTo(pinB, [], 'a', 'b'), null);
    assert.equal(moveColumnTo(pinB, [], 'b', 'd'), null);
  });
  it('reorders around a pinned column', () => {
    assert.deepEqual(plain(moveColumnTo(pinB, [], 'a', 'd').order), ['c', 'b', 'd', 'a']);
  });
});

describe('columnOrderEditor', () => {
  function setup(columns, initial) {
    const calls = [];
    let order = initial || [];
    const editor = context.columnOrderEditor({
      getColumns: () => columns, getOrder: () => order,
      emit: (next, change) => { calls.push(plain([next, change])); order = next; },
    });
    return { editor, calls };
  }
  const key = (k, extra) => Object.assign({ key: k, altKey: true }, extra);

  it('emits the full new order with { key, from, to } for a drop, and nothing when it does not move', () => {
    const { editor, calls } = setup(abc);
    assert.equal(editor.drop('a', 'c'), true);
    assert.deepEqual(calls, [[['b', 'c', 'a'], { key: 'a', from: 0, to: 2 }]]);
    assert.equal(editor.drop('a', 'a'), false);
    assert.equal(calls.length, 1);
  });
  it('moves a step with Alt+ArrowRight and Alt+ArrowLeft', () => {
    const { editor, calls } = setup(abc);
    assert.equal(editor.key('a', key('ArrowRight')), true);
    assert.equal(editor.key('a', key('ArrowLeft')), true);
    assert.deepEqual(calls.map((c) => c[0]), [['b', 'a', 'c'], ['a', 'b', 'c']]);
  });
  it('handles the key, without emitting, where the column cannot move', () => {
    const { editor, calls } = setup(abc);
    assert.equal(editor.key('a', key('ArrowLeft')), true);
    assert.equal(calls.length, 0);
  });
  it('leaves other keys alone: plain arrows, other modifiers, other keys', () => {
    const { editor, calls } = setup(abc);
    assert.equal(editor.key('a', { key: 'ArrowRight' }), false);
    assert.equal(editor.key('a', key('ArrowRight', { shiftKey: true })), false);
    assert.equal(editor.key('a', key('ArrowRight', { ctrlKey: true })), false);
    assert.equal(editor.key('a', key('ArrowRight', { metaKey: true })), false);
    assert.equal(editor.key('a', key('ArrowUp')), false);
    assert.equal(calls.length, 0);
  });
  it('never moves a pinned column, and moves others around it', () => {
    const { editor, calls } = setup(pinB);
    assert.equal(editor.key('b', key('ArrowRight')), true);
    assert.equal(calls.length, 0);
    editor.key('a', key('ArrowRight'));
    assert.deepEqual(calls[0][0], ['c', 'b', 'a', 'd']);
  });
  it('resets with [] and { reset: true }', () => {
    const { editor, calls } = setup(abc, ['c', 'a', 'b']);
    editor.reset();
    assert.deepEqual(calls, [[[], { reset: true }]]);
  });
});

describe('drag helpers', () => {
  it('starts a drag only after a few pixels of movement, so a click still sorts', () => {
    assert.equal(context.dragStarted(0, 0), false);
    assert.equal(context.dragStarted(2, 2), false);
    assert.equal(context.dragStarted(4, 0), true);
    assert.equal(context.dragStarted(-3, 3), true);
  });
  it('puts the drop indicator on the edge the column will arrive at', () => {
    assert.equal(context.dropSide(['a', 'b', 'c'], 'a', 'c'), 'after');
    assert.equal(context.dropSide(['a', 'b', 'c'], 'c', 'a'), 'before');
  });
});

describe('data form', () => {
  const heads = (tree) => {
    const out = [];
    (function walk(n) { if (!n || typeof n !== 'object') return; if (n.type === registry.TableHead) out.push(n); (n.children || []).forEach(walk); })(tree);
    return out;
  };
  const cells = (tree) => {
    const out = [];
    (function walk(n) { if (!n || typeof n !== 'object') return; if (n.type === registry.TableCell) out.push(n); (n.children || []).forEach(walk); })(tree);
    return out;
  };
  const rows = [{ id: 1, a: 'a1', b: 'b1', c: 'c1' }];

  it('renders b, a, c in the header and the cells for columnOrder [b, a]', () => {
    const cols = context.orderedColumns(abc, ['b', 'a']);
    const tree = context.dataTable({ columns: abc, rows }, cols, { reorder: true });
    assert.deepEqual(heads(tree).map((x) => x.props.key), ['b', 'a', 'c']);
    assert.deepEqual(cells(tree).map((x) => x.children[0]), ['b1', 'a1', 'c1']);
  });
  it('marks heads with their key and pinned state only when reordering is on', () => {
    const on = heads(context.dataTable({ columns: pinB, rows: [] }, pinB, { reorder: true }));
    assert.deepEqual(on.map((x) => x.props.columnKey), ['a', 'b', 'c', 'd']);
    assert.deepEqual(on.map((x) => x.props.pinned), [false, true, false, false]);
    const off = heads(registry.Table({ columns: pinB, rows: [] }));
    for (const x of off) { assert.equal('columnKey' in x.props, false); assert.equal('pinned' in x.props, false); }
  });
  it('wraps the table in the order owner when any order prop is given, and only then', () => {
    for (const p of [{ columnOrder: [] }, { defaultColumnOrder: ['b'] }, { onColumnOrderChange() {} }]) {
      assert.equal(registry.Table(Object.assign({ columns: abc, rows }, p)).type, context.TableOrder);
    }
    assert.equal(registry.Table({ columns: abc, rows }).type, registry.TableRoot);
  });
});

describe('reorderable head', () => {
  const orderCtx = (o) => Object.assign({ reorder: true, loading: false, drag: null, pinned: () => false, startDrag() {}, keyDown() {} }, o);
  function head(props, o) {
    for (const k of [...values.keys()]) values.delete(k);
    values.set(context.orderContext(), orderCtx(o));
    const th = registry.TableHead(Object.assign({ columnKey: 'a', children: 'A' }, props));
    values.clear();
    return th;
  }
  const ev = (extra) => Object.assign({ button: 0, clientX: 5, clientY: 5, pointerId: 1, target: { closest: () => null }, currentTarget: {}, preventDefault() {} }, extra);

  it('starts a drag on pointer down, but not from the resize handle or with another button', () => {
    const started = [];
    const th = head({}, { startDrag: (k) => started.push(k) });
    th.props.onPointerDown(ev());
    th.props.onPointerDown(ev({ target: { closest: (s) => (s === '.hy-table__resize' ? {} : null) } }));
    th.props.onPointerDown(ev({ button: 2 }));
    assert.deepEqual(started, ['a']);
  });
  it('does not preventDefault on pointer down, so a click still reaches the sort button', () => {
    let prevented = 0;
    const th = head({ onSort() {} }, { startDrag() {} });
    th.props.onPointerDown(ev({ preventDefault: () => { prevented++; } }));
    assert.equal(prevented, 0);
  });
  it('sends Alt+arrows to the table, and prevents the default when handled; not from the resize handle', () => {
    const got = []; let prevented = 0;
    const th = head({}, { keyDown: (k, e) => { got.push(k); return true; } });
    th.props.onKeyDown({ key: 'ArrowRight', altKey: true, target: { closest: () => null }, preventDefault: () => { prevented++; } });
    th.props.onKeyDown({ key: 'ArrowRight', altKey: true, target: { closest: () => ({}) }, preventDefault: () => { prevented++; } });
    assert.deepEqual(got, ['a']);
    assert.equal(prevented, 1);
  });
  it('is focusable itself unless it holds a sort button, and says which keys move it', () => {
    assert.equal(head({}).props.tabIndex, 0);
    assert.equal(head({ onSort() {} }).props.tabIndex, undefined);
    assert.equal(head({}).props['aria-keyshortcuts'], 'Alt+ArrowLeft Alt+ArrowRight');
    assert.equal(head({}).props['data-column-key'], 'a');
  });
  it('a pinned head cannot be picked up or moved, and takes no tab stop', () => {
    const th = head({ pinned: true }, { pinned: () => true });
    assert.equal(th.props.onPointerDown, undefined);
    assert.equal(th.props.tabIndex, undefined);
    assert.equal(th.props['aria-keyshortcuts'], undefined);
    assert.equal(th.props['data-column-key'], 'a');
  });
  it('swallows Alt+Left and Alt+Right on a pinned head, and a loading one, without moving anything', () => {
    for (const [props, o] of [[{ pinned: true }, {}], [{}, { loading: true }]]) {
      const moved = [];
      const th = head(props, Object.assign({ keyDown: (k) => { moved.push(k); return true; } }, o));
      for (const key of ['ArrowLeft', 'ArrowRight']) {
        let prevented = 0;
        th.props.onKeyDown({ key, altKey: true, target: { closest: () => null }, preventDefault: () => { prevented++; } });
        assert.equal(prevented, 1, key);
      }
      for (const extra of [{ key: 'ArrowLeft' }, { key: 'ArrowUp', altKey: true }, { key: 'ArrowLeft', altKey: true, shiftKey: true }]) {
        let prevented = 0;
        th.props.onKeyDown(Object.assign({ target: { closest: () => null }, preventDefault: () => { prevented++; } }, extra));
        assert.equal(prevented, 0);
      }
      assert.deepEqual(moved, []);
    }
  });
  it('has no key handler without reordering', () => {
    values.clear();
    assert.equal(registry.TableHead({ columnKey: 'a', pinned: true, children: 'A' }).props.onKeyDown, undefined);
  });
  it('is inert while loading, and shows the drag and the drop edge', () => {
    assert.equal(head({}, { loading: true }).props.onPointerDown, undefined);
    assert.match(head({}, { drag: { key: 'a', target: null, side: null } }).props.className, /is-dragging/);
    assert.match(head({}, { drag: { key: 'c', target: 'a', side: 'before' } }).props.className, /is-drop-before/);
    assert.match(head({}, { drag: { key: 'c', target: 'a', side: 'after' } }).props.className, /is-drop-after/);
  });
  it('renders exactly as before without the order context', () => {
    values.clear();
    const th = registry.TableHead({ children: 'A' });
    assert.deepEqual(Object.keys(th.props).sort(), ['className', 'scope']);
  });
});

describe('a pointer drag', () => {
  // TableOrder in its own context, with a stub DOM: the drag listeners go on a fake document.
  function rig() {
    const listeners = {};
    const style = { userSelect: 'text', webkitUserSelect: 'text' };
    let ranges = 0;
    const doc = {
      documentElement: { style },
      addEventListener: (t, f) => { (listeners[t] = listeners[t] || []).push(f); },
      removeEventListener: (t, f) => { listeners[t] = (listeners[t] || []).filter((x) => x !== f); },
      elementFromPoint: () => null,
    };
    const attrs = new Set();
    const th = {
      closest: () => ({}), setAttribute: (n) => attrs.add(n), removeAttribute: (n) => attrs.delete(n),
    };
    const ctx2 = vm.createContext({
      HY: {}, document: doc, window: { getSelection: () => ({ removeAllRanges: () => { ranges++; } }) }, setTimeout,
      React: { createContext: () => ({ Provider: 'Provider' }), useContext: () => null, Fragment: 'Fragment' },
      useControllable: (v, d) => [v === undefined ? d : v, () => {}],
      useState: (v) => [v, () => {}], useRef: (v) => ({ current: v }), useMemo: (f) => f(), useLayoutEffect() {}, useId: () => 'i',
      h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
      cx: (...a) => a.filter(Boolean).join(' '), omit: (o) => o, define() {},
    });
    vm.runInContext(readFileSync(file, 'utf8'), ctx2, { filename: file });
    const el = ctx2.TableOrder({ columns: abc, rows: [] });
    const ctl = el.props.value;
    const fire = (t, e) => (listeners[t] || []).slice().forEach((f) => f(e));
    return { ctl, th, attrs, style, fire, ranges: () => ranges };
  }

  it('makes the dragged head inert and turns text selection off until it ends', () => {
    const r = rig();
    r.ctl.startDrag('a', { clientX: 0, clientY: 0, currentTarget: r.th });
    assert.equal(r.attrs.has('inert'), false, 'a press that has not moved yet is still a click');
    r.fire('pointermove', { clientX: 1, clientY: 0 });
    assert.equal(r.attrs.has('inert'), false, 'still under the slop');
    r.fire('pointermove', { clientX: 20, clientY: 0 });
    assert.equal(r.attrs.has('inert'), true);
    assert.equal(r.style.userSelect, 'none');
    assert.equal(r.style.webkitUserSelect, 'none');
    assert.equal(r.ranges(), 1);
    r.fire('pointerup', { clientX: 20, clientY: 0 });
    assert.equal(r.attrs.has('inert'), false);
    assert.equal(r.style.userSelect, 'text');
    assert.equal(r.style.webkitUserSelect, 'text');
  });
  it('lets go on Escape and on cancel too', () => {
    for (const end of [(r) => r.fire('keydown', { key: 'Escape', stopPropagation() {} }), (r) => r.fire('pointercancel', {})]) {
      const r = rig();
      r.ctl.startDrag('a', { clientX: 0, clientY: 0, currentTarget: r.th });
      r.fire('pointermove', { clientX: 20, clientY: 0 });
      end(r);
      assert.equal(r.attrs.has('inert'), false);
      assert.equal(r.style.userSelect, 'text');
    }
  });
});

describe('Table.ColumnsMenu', () => {
  const find = (arr, label) => arr.filter((i) => i.label === label)[0];
  function menu(columns, columnOrder) {
    const calls = [];
    const tree = registry.TableColumnsMenu({ columns, columnOrder, onColumnOrderChange: (o, c) => calls.push(plain([o, c])) });
    const m = [tree].concat(tree.children).filter((n) => n && n.type === 'Menu')[0];
    return { items: m.props.items, props: m.props, calls, tree };
  }
  it('is a Menu labelled Columns by default, or by label, and is also Table.ColumnsMenu', () => {
    assert.equal(menu(abc, []).props.label, 'Columns');
    const t = registry.TableColumnsMenu({ columns: abc, columnOrder: [], label: 'Fields' });
    assert.equal([t].concat(t.children).filter((n) => n && n.type === 'Menu')[0].props.label, 'Fields');
    assert.equal(registry.Table.ColumnsMenu, registry.TableColumnsMenu);
  });
  it('lists the columns in their current order, each with Move Left and Move Right', () => {
    const labels = menu(abc, ['c', 'a']).items.filter((i) => i.label).map((i) => i.label);
    assert.deepEqual(plain(labels), ['Move C Left', 'Move C Right', 'Move A Left', 'Move A Right', 'Move B Left', 'Move B Right', 'Reset Order']);
  });
  it('disables the moves that are impossible: at the ends, and for pinned columns', () => {
    const { items } = menu(pinB, []);
    assert.equal(find(items, 'Move A Left').disabled, true);
    assert.equal(find(items, 'Move A Right').disabled, false);
    assert.equal(find(items, 'Move D Right').disabled, true);
    assert.equal(find(items, 'Move D Left').disabled, false);
    assert.equal(find(items, 'Move B Left').disabled, true);
    assert.equal(find(items, 'Move B Right').disabled, true);
  });
  it('produces the same changes as the keyboard: a move, and Reset Order', () => {
    const { items, calls } = menu(abc, []);
    find(items, 'Move A Right').onSelect();
    find(items, 'Reset Order').onSelect();
    assert.deepEqual(calls, [[['b', 'a', 'c'], { key: 'a', from: 0, to: 1 }], [[], { reset: true }]]);
  });
});

describe('orderMessage', () => {
  it('announces the new position out of the column count, by header text', () => {
    const r = moveColumn(abc, [], 'a', 1);
    assert.equal(orderMessage(abc, r.order, r.change), 'A moved to position 2 of 3');
  });
  it('falls back to the key when the header is not text, and announces a reset', () => {
    const cols = [{ key: 'status', header: { type: 'b' } }, { key: 'x', header: 'X' }];
    assert.equal(orderMessage(cols, ['x', 'status'], { key: 'status', from: 0, to: 1 }), 'status moved to position 2 of 2');
    assert.equal(orderMessage(cols, [], { reset: true }), 'Column order reset');
  });
});
