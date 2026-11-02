// Tests for reorderable Entity.List rows (hyprsh/design#92): the index maths behind drag, the handle's menu and Alt+Up/Down,
// the announcement text, the row name read from the DOM, the handle's markup and the list's wrapping of its rows.
// Entity.js runs in a vm context like entity-current.test.mjs, with stub hooks.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const src = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src');
const registry = {};
let inList = false;
let rowCtx = null; // the value the stub useContext gives to the row context
let nextCtx = 0;
let stateOf = (v) => v;
const context = vm.createContext({
  HY: { MenuContainer: 'MenuContainer', MenuButton: 'MenuButton', Menu: 'Menu', MenuItem: 'MenuItem' },
  React: {
    createContext: () => ({ Provider: 'Provider', n: nextCtx++ }),
    useContext: (c) => (c.n === 0 ? inList : rowCtx),
    Children: { toArray: (c) => [].concat(c || []).flat() },
    isValidElement: (x) => !!x && typeof x === 'object' && 'type' in x,
    Fragment: 'Fragment',
  },
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  useRef: () => ({ current: null }),
  useId: () => 'id',
  useState: (v) => [stateOf(v), () => {}],
  useMemo: (f) => f(),
  useLayoutEffect: () => {},
  useControllable: (value, def) => [value !== undefined ? value : def, () => {}],
  Glyph: 'Glyph',
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(join(src, 'Entity.js'), 'utf8'), context, { filename: 'Entity.js' });
const { entityStep, reorderTarget, reorderMessage, entityReorderEditor, entityDomText, entityRowName, dragStarted, dropSide, EntityHandle } = context;

const find = (node, pred, out = []) => {
  if (!node || typeof node !== 'object') return out;
  if (pred(node)) out.push(node);
  for (const c of node.children || []) find(c, pred, out);
  return out;
};
const cls = (n, c) => (n.props.className || '').split(' ').includes(c);
const keyEv = (key, extra) => ({ key, altKey: true, ...extra });

describe('entityStep (Alt+Up / Alt+Down)', () => {
  it('is -1 for Alt+ArrowUp and 1 for Alt+ArrowDown', () => {
    assert.equal(entityStep(keyEv('ArrowUp')), -1);
    assert.equal(entityStep(keyEv('ArrowDown')), 1);
  });
  it('ignores plain arrows, other modifiers and other keys', () => {
    assert.equal(entityStep({ key: 'ArrowUp' }), 0);
    assert.equal(entityStep(keyEv('ArrowDown', { shiftKey: true })), 0);
    assert.equal(entityStep(keyEv('ArrowDown', { ctrlKey: true })), 0);
    assert.equal(entityStep(keyEv('ArrowUp', { metaKey: true })), 0);
    assert.equal(entityStep(keyEv('ArrowLeft')), 0);
    assert.equal(entityStep(keyEv('Enter')), 0);
  });
});

describe('reorderTarget', () => {
  it('gives the index each menu action moves to', () => {
    assert.equal(reorderTarget(1, 4, 'up'), 0);
    assert.equal(reorderTarget(1, 4, 'down'), 2);
    assert.equal(reorderTarget(2, 4, 'top'), 0);
    assert.equal(reorderTarget(1, 4, 'bottom'), 3);
  });
  it('is null where the action does not apply', () => {
    assert.equal(reorderTarget(0, 4, 'up'), null);
    assert.equal(reorderTarget(0, 4, 'top'), null);
    assert.equal(reorderTarget(3, 4, 'down'), null);
    assert.equal(reorderTarget(3, 4, 'bottom'), null);
    assert.equal(reorderTarget(0, 1, 'down'), null);
    assert.equal(reorderTarget(0, 4, 'sideways'), null);
  });
});

describe('reorderMessage', () => {
  it('says the row moved to a 1-based position of the count', () => {
    assert.equal(reorderMessage('4K', 0, 3), '4K moved to position 1 of 3');
    assert.equal(reorderMessage('HD', 2, 3), 'HD moved to position 3 of 3');
  });
  it('falls back to "Row" without a name', () => {
    assert.equal(reorderMessage('', 1, 3), 'Row moved to position 2 of 3');
  });
});

describe('dragStarted and dropSide', () => {
  it('starts a drag after a few pixels, in any direction', () => {
    assert.equal(dragStarted(0, 0), false);
    assert.equal(dragStarted(1, 2), false);
    assert.equal(dragStarted(0, 5), true);
    assert.equal(dragStarted(-4, 0), true);
  });
  it('lands after a row dragged down onto, before a row dragged up onto', () => {
    assert.equal(dropSide(0, 2), 'after');
    assert.equal(dropSide(2, 0), 'before');
  });
});

describe('entityReorderEditor', () => {
  function setup(count) {
    const calls = [];
    const editor = entityReorderEditor({ getCount: () => count, emit: (from, to, name) => calls.push([from, to, name]) });
    return { editor, calls };
  }
  it('emits (from, to, name) for a drop onto another row, and nothing for a drop on itself or outside', () => {
    const { editor, calls } = setup(4);
    assert.equal(editor.drop(0, 2, 'A'), true);
    assert.equal(editor.drop(3, 1, 'D'), true);
    assert.deepEqual(calls, [[0, 2, 'A'], [3, 1, 'D']]);
    assert.equal(editor.drop(1, 1, 'B'), false);
    assert.equal(editor.drop(1, 9, 'B'), false);
    assert.equal(editor.drop(1, -1, 'B'), false);
    assert.equal(calls.length, 2);
  });
  it('runs each menu action with the right indexes', () => {
    const { editor, calls } = setup(4);
    editor.act(2, 'up', 'C');
    editor.act(2, 'down', 'C');
    editor.act(2, 'top', 'C');
    editor.act(2, 'bottom', 'C');
    assert.deepEqual(calls, [[2, 1, 'C'], [2, 3, 'C'], [2, 0, 'C'], [2, 3, 'C']]);
  });
  it('does nothing for an action that does not apply', () => {
    const { editor, calls } = setup(3);
    assert.equal(editor.act(0, 'up', 'A'), false);
    assert.equal(editor.act(2, 'bottom', 'C'), false);
    assert.equal(calls.length, 0);
  });
  it('moves a step with Alt+ArrowUp and Alt+ArrowDown, and reports Alt+arrows handled even at the ends', () => {
    const { editor, calls } = setup(3);
    assert.equal(editor.key(1, keyEv('ArrowUp'), 'B'), true);
    assert.equal(editor.key(1, keyEv('ArrowDown'), 'B'), true);
    assert.deepEqual(calls, [[1, 0, 'B'], [1, 2, 'B']]);
    assert.equal(editor.key(0, keyEv('ArrowUp'), 'A'), true);
    assert.equal(editor.key(2, keyEv('ArrowDown'), 'C'), true);
    assert.equal(calls.length, 2);
  });
  it('leaves plain arrows and Enter to the menu button', () => {
    const { editor, calls } = setup(3);
    for (const e of [{ key: 'ArrowUp' }, { key: 'ArrowDown' }, { key: 'Enter' }, { key: ' ' }]) assert.equal(editor.key(1, e, 'B'), false);
    assert.equal(calls.length, 0);
  });
  it('reads the count when it moves, not when it was made', () => {
    let count = 2;
    const calls = [];
    const editor = entityReorderEditor({ getCount: () => count, emit: (f, t) => calls.push([f, t]) });
    assert.equal(editor.act(1, 'down', 'x'), false);
    count = 3;
    assert.equal(editor.act(1, 'down', 'x'), true);
    assert.deepEqual(calls, [[1, 2]]);
  });
});

describe('entityDomText (the row name)', () => {
  const text = (s) => ({ nodeType: 3, textContent: s });
  const el = (nodeName, children, attrs = {}) => ({ nodeType: 1, nodeName, childNodes: children, getAttribute: (k) => attrs[k] ?? null });
  it('joins the left and content text, with a space between blocks', () => {
    const node = el('DIV', [el('SPAN', [text('PT')]), el('DIV', [el('DIV', [text('4K')]), el('DIV', [text('3840 × 2160')])])]);
    assert.equal(entityDomText(node), 'PT 4K 3840 × 2160');
  });
  it('keeps inline text together, skips aria-hidden parts and collapses white space', () => {
    const node = el('DIV', [el('DIV', [text('ci-'), el('B', [text('deploy')]), text('  \n ')]), el('SVG', [text('icon')], { 'aria-hidden': 'true' })]);
    assert.equal(entityDomText(node), 'ci-deploy');
  });
  it('is empty for no node', () => {
    assert.equal(entityDomText(null), '');
  });
});

describe('entityRowName', () => {
  const text = (s) => ({ nodeType: 3, textContent: s });
  const el = (nodeName, children, attrs = {}) => {
    const n = { nodeType: 1, nodeName, childNodes: children, getAttribute: (k) => attrs[k] ?? null };
    n.querySelector = (sel) => {
      const cls = sel.slice(1);
      const walk = (x) => { for (const c of x.childNodes || []) { if (c.nodeType === 1 && c.cls === cls) return c; const f = walk(c); if (f) return f; } return null; };
      return walk(n);
    };
    return n;
  };
  it('is the Entity.Content title when the row has one', () => {
    const title = Object.assign(el('DIV', [text('4K')]), { cls: 'hy-entity__title' });
    const desc = el('DIV', [text('3840 × 2160')]);
    const left = el('DIV', [el('SPAN', [text('PT')]), el('DIV', [title, desc])]);
    assert.equal(entityRowName(left), '4K');
  });
  it('is the left and content text when there is no title', () => {
    const left = el('DIV', [el('SPAN', [text('PT')]), el('DIV', [text('Platform')])]);
    assert.equal(entityRowName(left), 'PT Platform');
  });
  it('falls back to the whole text when the title is empty', () => {
    const title = Object.assign(el('DIV', []), { cls: 'hy-entity__title' });
    assert.equal(entityRowName(el('DIV', [text('x'), title])), 'x');
  });
});

describe('EntityHandle', () => {
  it('is disabled on a disabled row: no drag, no menu, no Alt+arrow moves', () => {
    const seen = [];
    const rc = { index: 1, count: 3, drag: null, act: () => seen.push('act'), key: () => { seen.push('key'); return true; }, startDrag: () => seen.push('drag') };
    const r = EntityHandle({ labelId: 'l', rc, label: 'x', disabled: true });
    const b = find(r, (n) => n.type === 'MenuButton')[0];
    assert.equal(b.props.disabled, true);
    let prevented = 0;
    b.props.onKeyDown({ key: 'ArrowUp', altKey: true, currentTarget: {}, preventDefault() { prevented++; } });
    b.props.onPointerDown({ button: 0 });
    assert.deepEqual(seen, []);
    assert.equal(prevented, 0);
    assert.equal(find(r, (n) => n.type === 'MenuItem').every((n) => n.props.disabled), true);
  });
  const rc = (over) => Object.assign({ index: 1, count: 3, drag: null, act() {}, key: () => false, startDrag() {} }, over);
  const render = (props) => EntityHandle(Object.assign({ labelId: 'l', rc: rc() }, props));
  const button = (r) => find(r, (n) => n.type === 'MenuButton')[0];
  const items = (r) => find(r, (n) => n.type === 'MenuItem');

  it('is a menu button named "Move {row name}" from reorderLabel', () => {
    const r = render({ label: '4K' });
    assert.equal(r.type, 'MenuContainer');
    assert.equal(button(r).props['aria-label'], 'Move 4K');
    assert.equal(button(r).props.type, 'unstyled');
    assert.ok(cls(button(r), 'hy-entity__handle'));
    assert.equal(find(r, (n) => n.type === 'Menu')[0].props['aria-label'], 'Move 4K');
  });
  it('takes the name from the row text when there is no reorderLabel', () => {
    stateOf = (v) => (v === '' ? 'Platform Team' : v);
    try { assert.equal(button(render({})).props['aria-label'], 'Move Platform Team'); } finally { stateOf = (v) => v; }
  });
  it('offers Move Up, Move Down, Move to Top and Move to Bottom', () => {
    assert.deepEqual(items(render({ label: 'x' })).map((n) => n.children.join('')), ['Move Up', 'Move Down', 'Move to Top', 'Move to Bottom']);
  });
  it('disables the items that do not apply to the position', () => {
    const dis = (index, count) => items(render({ label: 'x', rc: rc({ index, count }) })).map((n) => !!n.props.disabled);
    assert.deepEqual(dis(0, 3), [true, false, true, false]);
    assert.deepEqual(dis(1, 3), [false, false, false, false]);
    assert.deepEqual(dis(2, 3), [false, true, false, true]);
    assert.deepEqual(dis(0, 1), [true, true, true, true]);
  });
  it('runs the action, with the name and the handle, when an item is chosen', () => {
    const seen = [];
    const r = render({ label: '4K', rc: rc({ act: (action, name) => seen.push([action, name]) }) });
    items(r).forEach((n) => n.props.onSelect());
    assert.deepEqual(seen, [['up', '4K'], ['down', '4K'], ['top', '4K'], ['bottom', '4K']]);
  });
  it('swallows a handled Alt+arrow so the browser keeps its own, and leaves other keys to the menu button', () => {
    const r = render({ label: 'x', rc: rc({ key: (e) => e.altKey }) });
    let prevented = 0;
    button(r).props.onKeyDown({ key: 'ArrowUp', altKey: true, currentTarget: {}, preventDefault() { prevented++; } });
    button(r).props.onKeyDown({ key: 'ArrowUp', currentTarget: {}, preventDefault() { prevented++; } });
    assert.equal(prevented, 1);
  });
  it('starts a drag only on the primary button', () => {
    const started = [];
    const r = render({ label: 'x', rc: rc({ startDrag: (e, name) => started.push(name) }) });
    button(r).props.onPointerDown({ button: 2 });
    button(r).props.onPointerDown({ button: 0 });
    assert.deepEqual(started, ['x']);
  });
  it('advertises its shortcuts', () => {
    assert.equal(button(render({ label: 'x' })).props['aria-keyshortcuts'], 'Alt+ArrowUp Alt+ArrowDown');
  });
});

describe('Entity rows in a reorderable list', () => {
  const ctx = (over) => Object.assign({ index: 1, count: 3, drag: null, act() {}, key: () => false, startDrag() {} }, over);
  const row = (props, c) => { inList = true; rowCtx = c === undefined ? ctx() : c; try { let r = registry.Entity(props); if (typeof r.type === 'function') r = r.type(r.props); return r; } finally { rowCtx = null; } };
  const handleOf = (r) => find(r, (n) => n.type === context.EntityHandle)[0];

  it('puts a handle first in the row, before the left slot, and tags the row with its index', () => {
    const r = row({ left: 'L', reorderLabel: '4K' });
    assert.equal(r.type, 'li');
    assert.equal(r.props['data-entity-index'], 1);
    assert.ok(handleOf(r));
    assert.equal(r.children.indexOf(handleOf(r)), 0);
    assert.equal(handleOf(r).props.label, '4K');
    assert.ok(handleOf(r).props.rc);
    assert.equal('reorderLabel' in r.props, false);
  });
  it('points the handle at the element whose text names the row', () => {
    const r = row({ left: 'L' });
    const labelled = find(r, (n) => n.props.id === handleOf(r).props.labelId)[0];
    assert.ok(cls(labelled, 'hy-entity__left'));
  });
  it('puts the handle before the button of an expandable row, outside the button', () => {
    const r = row({ left: 'L', detail: 'x', reorderLabel: 'A' });
    const rowDiv = find(r, (n) => cls(n, 'hy-entity'))[0];
    assert.equal(rowDiv.children[0], handleOf(r));
    assert.equal(find(find(r, (n) => n.type === 'button')[0], (n) => n.type === context.EntityHandle).length, 0);
    assert.equal(r.props['data-entity-index'], 1);
  });
  it('shows the drag: the dragged row moves with a transform only, the target shows the landing edge', () => {
    const drag = { from: 1, target: 2, side: 'after', dy: 17 };
    const dragged = row({}, ctx({ index: 1, drag }));
    assert.ok(cls(dragged, 'is-dragging'));
    assert.deepEqual(Object.keys(dragged.props.style), ['transform']);
    assert.equal(dragged.props.style.transform, 'translateY(17px)');
    const target = row({}, ctx({ index: 2, drag }));
    assert.ok(cls(target, 'is-drop-after'));
    assert.equal(target.props.style, undefined);
    const other = row({}, ctx({ index: 0, drag }));
    assert.equal(cls(other, 'is-dragging') || cls(other, 'is-drop-after') || cls(other, 'is-drop-before'), false);
  });
  it('keeps the row\'s own style under a drag', () => {
    const r = row({ style: { color: 'red' } }, ctx({ drag: { from: 1, target: null, side: null, dy: 3 } }));
    assert.equal(r.props.style.color, 'red');
    assert.equal(r.props.style.transform, 'translateY(3px)');
  });
  it('is unchanged outside a reorderable list', () => {
    const r = row({ left: 'L', reorderLabel: 'x' }, null);
    assert.equal(handleOf(r), undefined);
    assert.equal('data-entity-index' in r.props, false);
    assert.equal('reorderLabel' in r.props, false);
  });
});

describe('Entity.List with onReorder', () => {
  const rows = (n) => Array.from({ length: n }, (_, i) => ({ type: 'Entity', key: 'k' + i, props: { left: 'r' + i }, children: [] }));
  const list = (props) => { const r = registry.EntityList(props); return typeof r.type === 'function' ? r.type(r.props) : r; };

  it('is the plain list without onReorder', () => {
    const r = list({ children: rows(2), 'aria-label': 'A' });
    assert.equal(r.type, 'Provider');
    assert.equal(find(r, (n) => n.props['aria-live']).length, 0);
  });
  it('wraps each row with its index and the row count, and adds a polite live region', () => {
    const r = list({ children: rows(3), onReorder() {} });
    const wrapped = find(r, (n) => n.type === 'Provider' && n.props.value && typeof n.props.value === 'object' && 'index' in n.props.value);
    assert.deepEqual(wrapped.map((n) => [n.props.value.index, n.props.value.count]), [[0, 3], [1, 3], [2, 3]]);
    assert.deepEqual(wrapped.map((n) => n.props.key), ['k0', 'k1', 'k2']);
    const live = find(r, (n) => n.props['aria-live'])[0];
    assert.equal(live.props['aria-live'], 'polite');
    assert.equal(live.props['aria-atomic'], 'true');
    assert.ok(cls(live, 'hy-sr'));
  });
  it('counts the rows inside a Fragment as rows, not the Fragment as one', () => {
    const frag = { type: 'Fragment', key: 'f', props: { children: rows(2) }, children: [] };
    const r = list({ children: [rows(1)[0], frag, { ...rows(1)[0], key: 'z' }], onReorder() {} });
    const wrapped = find(r, (n) => n.type === 'Provider' && n.props.value && typeof n.props.value === 'object' && 'index' in n.props.value);
    assert.deepEqual(wrapped.map((n) => [n.props.value.index, n.props.value.count]), [[0, 4], [1, 4], [2, 4], [3, 4]]);
    assert.equal(new Set(wrapped.map((n) => n.props.key)).size, 4);
  });
  it('counts rows only, not text between them', () => {
    const r = list({ children: ['\n', ...rows(2), null], onReorder() {} });
    const wrapped = find(r, (n) => n.type === 'Provider' && n.props.value && typeof n.props.value === 'object' && 'index' in n.props.value);
    assert.deepEqual(wrapped.map((n) => n.props.value.count), [2, 2]);
  });
  it('keeps the list element, role and className, and passes no onReorder down', () => {
    const r = list({ children: rows(2), onReorder() {}, className: 'x', 'aria-label': 'Priorities' });
    const ul = find(r, (n) => n.type === 'ul')[0];
    assert.equal(ul.props.role, 'list');
    assert.equal(ul.props['aria-label'], 'Priorities');
    assert.ok(cls(ul, 'hy-entity-list') && cls(ul, 'x'));
    assert.equal('onReorder' in ul.props, false);
  });
});

describe('Entity.css reorder', () => {
  const css = readFileSync(join(src, 'Entity.css'), 'utf8');
  it('sizes the handle at 24px, and to the touch target under touch sizing', () => {
    assert.match(css, /\.hy-entity__handle[^{]*\{[^}]*width: 24px[^}]*height: 24px/);
    assert.match(css, /@media \(pointer: coarse\), \(max-width: 639px\)\s*\{[^}]*\.hy-entity__handle[^}]*var\(--touch-target\)/);
  });
  it('gives the handle a focus ring and lets touch drag it', () => {
    assert.match(css, /\.hy-entity__handle:focus-visible[^{]*\{[^}]*outline: 2px solid var\(--focus-color\)/);
    assert.match(css, /\.hy-entity__handle[^{]*\{[^}]*touch-action: none/);
  });
  it('draws the drop edge with an accent line and moves the dragged row by transform only', () => {
    assert.match(css, /\.is-drop-before::after[^{]*\{[^}]*var\(--accent-900\)/);
    assert.match(css, /\.is-drop-after::after/);
    assert.doesNotMatch(css, /\.is-dragging[^{]*\{[^}]*(top|left|margin)\s*:/);
  });
  it('takes the drag animation away under prefers-reduced-motion', () => {
    const blocks = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/g).join('\n');
    assert.match(blocks, /\.is-dragging/);
    assert.match(blocks, /transition: none/);
  });
});
