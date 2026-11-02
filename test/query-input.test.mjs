// Tests for QueryInput's clearable (hyprsh/design#82), shortcut and QueryHelpButton / QueryBar's help placement (hyprsh/design#64).
// The component files are plain script that runs in the bundle's scope, so they run here in a vm context with stub
// globals: `h` builds plain nodes, the hooks are stubs (effects are recorded and run by hand against a fake window),
// and each component is called as a function so the tests read the tree it returns.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const dir = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src');
const registry = {};
const listeners = new Set();
let effects = [];
let setterCalls = [];
const fakeWindow = {
  addEventListener: (type, fn) => { if (type === 'keydown') listeners.add(fn); },
  removeEventListener: (type, fn) => { if (type === 'keydown') listeners.delete(fn); },
};
const context = vm.createContext({
  window: fakeWindow,
  HY: new Proxy({}, { get: (t, k) => (k in t ? t[k] : String(k)) }),
  React: {
    Fragment: 'Fragment',
    Children: { toArray: (c) => [c].flat(Infinity).filter((x) => x != null && x !== false) },
    createContext: () => ({ Provider: 'Provider' }),
    useContext: () => null,
  },
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity) }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  Glyph: 'Glyph',
  useId: () => ':r0:',
  useState: (v) => [v, (x) => setterCalls.push({ init: v, value: x })],
  useRef: (v) => ({ current: v === undefined ? null : v }),
  useMemo: (fn) => fn(),
  useLayoutEffect: () => {},
  useEffect: (fn, deps) => { effects.push({ fn, deps }); },
  useControllable: (value, def, onChange) => [value === undefined ? def : value, onChange || (() => {})],
  useFloating: () => null,
  floatingStyle: () => ({}),
  portal: (n) => n,
  parseQuery: () => ({ problems: [] }),
  suggestQuery: () => [],
  define: (name, fn) => { registry[name] = fn; },
});
for (const f of ['QueryHelpButton', 'QueryInput', 'QueryBar']) {
  vm.runInContext(readFileSync(join(dir, f + '.js'), 'utf8'), context, { filename: f + '.js' });
}
const { QueryHelpButton, QueryInput, QueryBar } = registry;

const qualifiers = [
  { name: 'is', help: 'Open or closed', values: ['open', 'closed'] },
  { name: 'label', help: 'Has this label', none: true },
];

/* Every node under `node`, in document order, looking in children and in props that hold a node (suffix, trigger). */
function walk(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  out.push(node);
  for (const v of Object.values(node.props || {})) if (v && typeof v === 'object' && 'type' in v) walk(v, out);
  for (const c of node.children || []) walk(c, out);
  return out;
}
const all = (tree, type) => walk(tree).filter((n) => n.type === type);

/* Renders QueryInput: returns its tree, with the effects it asked for and a fake <input> wired to its ref. */
function render(props) {
  effects = [];
  setterCalls = [];
  listeners.clear();
  const tree = QueryInput({ 'aria-label': 'Search', qualifiers, ...props });
  const input = all(tree, 'Input')[0];
  const field = { focused: 0, focus() { this.focused++; } };
  input.props.ref.current = field;
  const rendered = { tree, input, field, effects: effects.slice() };
  rendered.mount = () => rendered.effects.map((e) => e.fn());
  return rendered;
}
const press = (key, extra = {}) => {
  const e = { key, metaKey: false, ctrlKey: false, altKey: false, isComposing: false, target: { tagName: 'BODY' }, defaultPrevented: false,
    preventDefault() { this.defaultPrevented = true; }, ...extra };
  for (const fn of [...listeners]) fn(e);
  return e;
};
const keycaps = (tree) => all(tree, 'KeyboardInput');
const unmount = (cleanups) => cleanups.forEach((c) => typeof c === 'function' && c());

describe('QueryHelpButton', () => {
  const tree = QueryHelpButton({ qualifiers, size: 'small' });
  const text = (t) => walk(t).flatMap((n) => n.children).filter((c) => typeof c === 'string').join('');
  it('is a popover named Query Help whose trigger is an icon button of the same size', () => {
    assert.equal(tree.type, 'Popover');
    assert.equal(tree.props.label, 'Query Help');
    const button = all(tree, 'Button')[0];
    assert.equal(button.props['aria-label'], 'Query Help');
    assert.equal(button.props.size, 'small');
  });
  it('lists every qualifier with its help line', () => {
    assert.deepEqual(all(tree, 'dt').map((n) => n.children[0]), ['is:', 'label:']);
    assert.deepEqual(all(tree, 'dd').map((n) => n.children[0]), ['Open or closed', 'Has this label']);
  });
  it('mentions no: only when a qualifier allows it', () => {
    assert.match(text(tree), /matches what has no value/);
    assert.doesNotMatch(text(QueryHelpButton({ qualifiers: [qualifiers[0]] })), /matches what has no value/);
  });
});

describe('QueryInput help', () => {
  it('renders the shared QueryHelpButton beside the field by default', () => {
    const { tree } = render({ size: 'large' });
    const [b] = all(tree, 'QueryHelpButton');
    assert.equal(b.props.qualifiers, qualifiers);
    assert.equal(b.props.size, 'large');
  });
  it('hides it with help={false} and without qualifiers', () => {
    assert.equal(all(render({ help: false }).tree, 'QueryHelpButton').length, 0);
    assert.equal(all(render({ qualifiers: [] }).tree, 'QueryHelpButton').length, 0);
  });
});

describe('QueryBar help placement', () => {
  const menus = [{ type: 'QueryBarMenu', props: { qualifier: 'is' }, children: [] }, { type: 'QueryBarMenu', props: { qualifier: 'label' }, children: [] }];
  const bar = (props, kids = menus) => QueryBar({ qualifiers, children: kids, ...props });
  const fieldHelp = (tree) => all(tree, 'QueryInput')[0].props.help;
  const group = (tree) => walk(tree).find((n) => n.props && n.props.role === 'group');
  const order = (tree) => walk(group(tree)).map((n) => n.type).filter((t) => t === 'QueryBarMenu' || t === 'QueryHelpButton');

  it('leaves the button beside the field by default, as before', () => {
    const tree = bar({});
    assert.notEqual(fieldHelp(tree), false);
    assert.equal(all(tree, 'QueryHelpButton').length, 0);
  });
  it('hides it with help={false}', () => {
    const tree = bar({ help: false });
    assert.equal(fieldHelp(tree), false);
    assert.equal(all(tree, 'QueryHelpButton').length, 0);
  });
  it('puts it last in the menu row with help="menus"', () => {
    const tree = bar({ help: 'menus' });
    assert.equal(fieldHelp(tree), false);
    assert.equal(all(tree, 'QueryHelpButton').length, 1);
    assert.deepEqual(order(tree), ['QueryBarMenu', 'QueryBarMenu', 'QueryHelpButton']);
  });
  it('does the same in the sideways-scrolling row', () => {
    const tree = bar({ help: 'menus', wrap: false });
    assert.equal(all(tree, 'Scroller').length, 1);
    assert.deepEqual(order(tree), ['QueryBarMenu', 'QueryBarMenu', 'QueryHelpButton']);
  });
  it('keeps it beside the field with help="menus" and no menus', () => {
    const tree = bar({ help: 'menus' }, []);
    assert.notEqual(fieldHelp(tree), false);
    assert.equal(all(tree, 'QueryHelpButton').length, 0);
  });
  it('draws no button in the row without qualifiers', () => {
    assert.equal(all(bar({ help: 'menus', qualifiers: [] }), 'QueryHelpButton').length, 0);
  });
  it('passes shortcut through to the field', () => {
    assert.equal(all(bar({ shortcut: '/' }), 'QueryInput')[0].props.shortcut, '/');
  });
});

describe('QueryInput shortcut hint', () => {
  it('shows a key cap reading the key while the field is empty', () => {
    const { tree } = render({ value: '', shortcut: '/' });
    const [cap] = keycaps(tree);
    assert.deepEqual(cap.children, ['/']);
    assert.equal(String(cap.props['aria-hidden']), 'true');
  });
  it('hides it once there is text, and without a shortcut', () => {
    assert.equal(keycaps(render({ value: 'is:open', shortcut: '/' }).tree).length, 0);
    assert.equal(keycaps(render({ value: '' }).tree).length, 0);
  });
  it('sets aria-keyshortcuts, with or without text, and lets the app override it', () => {
    assert.equal(render({ value: '', shortcut: '/' }).input.props['aria-keyshortcuts'], '/');
    assert.equal(render({ value: 'x', shortcut: '/' }).input.props['aria-keyshortcuts'], '/');
    assert.equal(render({ shortcut: '/', 'aria-keyshortcuts': 'Shift+S' }).input.props['aria-keyshortcuts'], 'Shift+S');
    assert.equal(render({}).input.props['aria-keyshortcuts'], undefined);
  });
  it('adds nothing to the accessible name', () => {
    const { input } = render({ value: '', shortcut: '/' });
    assert.equal(input.props['aria-label'], 'Search');
    assert.equal(input.props['aria-labelledby'], undefined);
  });
});

describe('QueryInput shortcut key', () => {
  it('focuses the field and keeps the character from being typed', () => {
    const r = render({ shortcut: '/' });
    r.mount();
    const e = press('/');
    assert.equal(r.field.focused, 1);
    assert.equal(e.defaultPrevented, true);
  });
  it('matches on key, so a key that needs Shift still works', () => {
    const r = render({ shortcut: '?' });
    r.mount();
    press('?', { shiftKey: true });
    assert.equal(r.field.focused, 1);
  });
  it('ignores other keys', () => {
    const r = render({ shortcut: '/' });
    r.mount();
    const e = press('a');
    assert.equal(r.field.focused, 0);
    assert.equal(e.defaultPrevented, false);
  });
  it('ignores Ctrl, Meta and Alt', () => {
    const r = render({ shortcut: '/' });
    r.mount();
    for (const m of ['ctrlKey', 'metaKey', 'altKey']) {
      const e = press('/', { [m]: true });
      assert.equal(e.defaultPrevented, false, m);
    }
    assert.equal(r.field.focused, 0);
  });
  it('ignores an IME composition', () => {
    const r = render({ shortcut: '/' });
    r.mount();
    press('/', { isComposing: true });
    press('/', { keyCode: 229 });
    assert.equal(r.field.focused, 0);
  });
  it('types the character when focus is already in an editable element, this field included', () => {
    const r = render({ shortcut: '/' });
    r.mount();
    for (const target of [{ tagName: 'INPUT' }, { tagName: 'TEXTAREA' }, { tagName: 'SELECT' }, { tagName: 'DIV', isContentEditable: true }]) {
      const e = press('/', { target });
      assert.equal(e.defaultPrevented, false, target.tagName);
    }
    assert.equal(r.field.focused, 0);
  });
  it('still works from a button', () => {
    const r = render({ shortcut: '/' });
    r.mount();
    press('/', { target: { tagName: 'BUTTON' } });
    assert.equal(r.field.focused, 1);
  });
  it('does not take focus when the field is disabled', () => {
    const r = render({ shortcut: '/', disabled: true });
    r.mount();
    const e = press('/');
    assert.equal(r.field.focused, 0);
    assert.equal(e.defaultPrevented, false);
  });
  it('leaves no listener on window after unmount', () => {
    const r = render({ shortcut: '/' });
    const cleanups = r.mount();
    assert.equal(listeners.size, 1);
    unmount(cleanups);
    assert.equal(listeners.size, 0);
    const e = press('/');
    assert.equal(r.field.focused, 0);
    assert.equal(e.defaultPrevented, false);
  });
  it('adds no listener without a shortcut', () => {
    render({}).mount();
    assert.equal(listeners.size, 0);
  });
  it('re-binds when the shortcut changes: the effect depends on it and its cleanup removes the old listener', () => {
    const r = render({ shortcut: '/' });
    assert.ok(r.effects.some((e) => e.deps && e.deps.includes('/')));
    unmount(r.mount());
    const r2 = render({ shortcut: 's' });
    r2.mount();
    press('/');
    assert.equal(r2.field.focused, 0);
    press('s');
    assert.equal(r2.field.focused, 1);
  });
});

describe('QueryInput clearable', () => {
  const clearBtn = (tree) => all(tree, 'button').find((n) => n.props.className === 'hy-query__clear');
  const suffixOf = (r) => r.input.props.suffix;
  it('draws an × button named Clear at the end of a field with text, in the suffix slot', () => {
    const r = render({ value: 'is:open', clearable: true });
    const btn = clearBtn(r.tree);
    assert.equal(btn.props.type, 'button');
    assert.equal(btn.props['aria-label'], 'Clear');
    assert.equal(suffixOf(r), btn);
    assert.equal(all(btn, 'Glyph').length, 1);
    assert.equal(all(btn, 'Glyph')[0].props.name, 'x');
  });
  it('is named by clearLabel', () => {
    assert.equal(clearBtn(render({ value: 'x', clearable: true, clearLabel: 'Clear Search' }).tree).props['aria-label'], 'Clear Search');
  });
  it('draws nothing while the field is empty, or without clearable', () => {
    assert.equal(clearBtn(render({ value: '', clearable: true }).tree), undefined);
    assert.equal(clearBtn(render({ value: 'x' }).tree), undefined);
    assert.equal(suffixOf(render({ value: 'x' })), undefined);
  });
  it('is not drawn on a disabled or read-only field', () => {
    assert.equal(clearBtn(render({ value: 'x', clearable: true, disabled: true }).tree), undefined);
    assert.equal(clearBtn(render({ value: 'x', clearable: true, readOnly: true }).tree), undefined);
  });
  it('does not pass clearable or clearLabel on to the input', () => {
    const { input } = render({ value: 'x', clearable: true, clearLabel: 'Wipe' });
    assert.equal('clearable' in input.props, false);
    assert.equal('clearLabel' in input.props, false);
  });
  it('swaps with the shortcut key cap: the cap while empty, the button once there is text, aria-keyshortcuts throughout', () => {
    const empty = render({ value: '', clearable: true, shortcut: '/' });
    assert.equal(keycaps(empty.tree).length, 1);
    assert.equal(clearBtn(empty.tree), undefined);
    assert.equal(empty.input.props['aria-keyshortcuts'], '/');
    const full = render({ value: 'x', clearable: true, shortcut: '/' });
    assert.equal(keycaps(full.tree).length, 0);
    assert.ok(clearBtn(full.tree));
    assert.equal(full.input.props['aria-keyshortcuts'], '/');
  });
  it('shows no button, with the key cap gone, when there is text and no clearable', () => {
    const r = render({ value: 'x', shortcut: '/' });
    assert.equal(keycaps(r.tree).length, 0);
    assert.equal(clearBtn(r.tree), undefined);
  });
  it('still focuses the field from the shortcut key', () => {
    const r = render({ value: 'x', clearable: true, shortcut: '/' });
    r.mount();
    press('/');
    assert.equal(r.field.focused, 1);
  });
  it('clicking calls onChange with an empty string, closes the list and keeps focus in the field', () => {
    const changes = [];
    const r = render({ value: 'is:', clearable: true, onChange: (v) => changes.push(v) });
    clearBtn(r.tree).props.onClick();
    assert.deepEqual(changes, ['']);
    assert.ok(setterCalls.some((c) => c.init === false && c.value === true), 'the list is dismissed');
    assert.equal(r.field.focused, 1);
  });
  it('does not reopen the list when its focus() lands on a field that was not focused', () => {
    const r = render({ value: 'is:', clearable: true, onChange() {} });
    r.field.focus = function () { this.focused++; r.input.props.onFocus({ currentTarget: { selectionStart: 0 } }); };
    clearBtn(r.tree).props.onClick();
    assert.equal(r.field.focused, 1);
    assert.equal(setterCalls.some((c) => c.init === false && c.value === false), false, 'focus did not undo the dismissal');
    r.input.props.onFocus({ currentTarget: { selectionStart: 0 } });
    assert.ok(setterCalls.some((c) => c.init === false && c.value === false), 'a later focus still opens it');
  });
  it('keeps focus on the field when the button is pressed', () => {
    const e = { defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    clearBtn(render({ value: 'x', clearable: true }).tree).props.onMouseDown(e);
    assert.equal(e.defaultPrevented, true);
  });
});
