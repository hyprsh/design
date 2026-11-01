// Tests for toast.update(id, changes) and the progress bar (hyprsh/design#67). Toast.js and Progress.js run in a vm
// context like toast.test.mjs, on a tiny hook runtime with a fake clock, so timers, in-place updates and what the
// live region would announce are observed through the rendered tree, not through internals.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const SRC = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src');

// A minimal React: function components with hooks, rendered to a tree of { type, props, children } with string leaves.
function runtime(root) {
  const instances = new Map();
  const clock = { now: 0, timers: [], seq: 0 };
  let current = null, dirty = false, pending = [], tree = null;
  const Fragment = Symbol('Fragment');
  const el = (type, props, ...kids) => {
    const children = kids.flat(Infinity);
    // like React, children are also on props: the node's own text is read from there
    return { $$el: true, type, props: Object.assign({}, props, children.length ? { children: children.length === 1 ? children[0] : children } : {}), key: props && props.key, children };
  };
  const slot = () => current.hooks[current.i++] || (current.hooks[current.i - 1] = {});
  const sameDeps = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const effect = (fn, deps) => {
    const s = slot();
    (current.slots = current.slots || new Set()).add(s);
    if (!sameDeps(s.deps, deps)) pending.push(() => { if (s.cleanup) s.cleanup(); s.cleanup = fn(); s.deps = deps; });
  };
  const hooks = {
    useState(init) {
      const s = slot();
      if (!('v' in s)) {
        s.v = typeof init === 'function' ? init() : init;
        s.set = (n) => { const v = typeof n === 'function' ? n(s.v) : n; if (!Object.is(v, s.v)) { s.v = v; dirty = true; } };
      }
      return [s.v, s.set];
    },
    useRef(init) { const s = slot(); if (!s.ref) s.ref = { current: init }; return s.ref; },
    useEffect: effect,
    useLayoutEffect: effect,
    useMemo(fn) { const s = slot(); if (!('v' in s)) s.v = fn(); return s.v; },
    useId() { const s = slot(); if (!s.id) s.id = 'id-' + (++clock.seq); return s.id; },
  };
  function expand(node, path, seen) {
    if (node == null || typeof node === 'boolean') return [];
    if (typeof node === 'string' || typeof node === 'number') return [String(node)];
    if (Array.isArray(node)) return node.flatMap((c, i) => expand(c, path + '[' + i + ']', seen));
    if (typeof node.type === 'function') {
      const p = path + '/' + (node.key !== undefined ? node.key : '') + node.type.name;
      let inst = instances.get(p);
      if (!inst) instances.set(p, inst = { hooks: [] });
      seen.add(p);
      const prev = current; current = inst; inst.i = 0;
      const out = node.type(Object.assign({}, node.props, { children: node.children }));
      current = prev;
      return expand(out, p, seen);
    }
    if (node.type === Fragment) return node.children.flatMap((c, i) => expand(c, path + '.' + i, seen));
    const p = path + '/' + (node.key !== undefined ? node.key : '') + String(node.type);
    return [{ type: node.type, props: node.props, children: node.children.flatMap((c, i) => expand(c, p + '.' + i, seen)) }];
  }
  function flush() {
    for (let n = 0; n < 50; n++) {
      dirty = false;
      const seen = new Set();
      [tree] = expand(root(), '', seen);
      for (const [p, inst] of instances) {
        if (seen.has(p)) continue;
        (inst.slots || []).forEach((s) => s.cleanup && s.cleanup());
        instances.delete(p);
      }
      const run = pending; pending = [];
      run.forEach((f) => f());
      if (!dirty && !pending.length) return;
    }
    throw new Error('render loop');
  }
  const timers = {
    setTimeout: (fn, ms) => { clock.timers.push({ id: ++clock.seq, at: clock.now + ms, fn }); return clock.seq; },
    clearTimeout: (id) => { clock.timers = clock.timers.filter((t) => t.id !== id); },
  };
  const advance = (ms) => {
    flush();
    const end = clock.now + ms;
    for (;;) {
      const next = clock.timers.filter((t) => t.at <= end).sort((a, b) => a.at - b.at)[0];
      if (!next) break;
      clock.timers = clock.timers.filter((t) => t !== next);
      clock.now = next.at; next.fn(); flush();
    }
    clock.now = end; flush();
  };
  return { el, hooks, Fragment, clock, timers, flush, advance, tree: () => tree };
}

const all = (n, pred, out = []) => {
  if (typeof n === 'string') return out;
  if (pred(n)) out.push(n);
  n.children.forEach((c) => all(c, pred, out));
  return out;
};
const textOf = (n) => (typeof n === 'string' ? n : n.children.map(textOf).join(''));

// `hostProps` is what the <Toast /> host is rendered with: nothing for the useToasts() queue, `toasts` for the controlled form.
function setup(hostProps = {}) {
  const HY = {};
  const rt = runtime(() => rt.el(HY.Toast, { inline: true, ...hostProps }));
  const { el: h } = rt;
  const context = vm.createContext({
    React: { isValidElement: (e) => !!(e && e.$$el), Fragment: rt.Fragment },
    ReactDOM: {}, HY, h,
    ...rt.hooks, ...rt.timers,
    Date: { now: () => rt.clock.now },
    cx: (...a) => a.filter(Boolean).join(' '),
    portal: (n) => n,
    Glyph: (p) => h('svg', { 'data-glyph': p.name }),
    define: (name, c) => { HY[name] = c; },
  });
  HY.Button = function Button(p) { return h('button', { type: 'button', 'data-label': [].concat(p.children).join('') }, p.children); };
  for (const f of ['Progress.js', 'Toast.js']) vm.runInContext(readFileSync(join(SRC, f), 'utf8'), context, { filename: f });
  rt.flush();
  rt.advance(30);
  const view = {
    ...rt, HY, api: HY.useToasts(),
    items: () => all(rt.tree(), (n) => n.type === 'li'),
    live: () => all(rt.tree(), (n) => n.props['aria-live'] === 'polite')[0],
    bars: () => all(rt.tree(), (n) => n.props.role === 'progressbar'),
    titles: () => view.items().map((li) => textOf(all(li, (n) => n.props.className === 'hy-toast__text')[0])),
    buttons: (li) => all(li, (n) => n.type === 'button'),
  };
  return view;
}

describe('update() on a shown toast', () => {
  it('returns false and changes nothing for an unknown or dismissed id', () => {
    const t = setup();
    t.api.message({ id: 'a', text: 'One', preserve: true });
    t.advance(0);
    assert.equal(t.api.update('nope', { text: 'X' }), false);
    assert.deepEqual(t.titles(), ['One']);
    t.api.dismiss('a'); t.advance(0);
    assert.equal(t.api.update('a', { text: 'X' }), false);
    assert.deepEqual(t.titles(), []);
  });

  it('returns true and changes the text in place, keeping the stack order', () => {
    const t = setup();
    for (const id of ['a', 'b', 'c']) t.api.message({ id, text: 'Toast ' + id, preserve: true });
    t.advance(30);
    assert.equal(t.api.update('b', { text: 'Searching 3 of 10…' }), true);
    t.advance(0);
    assert.deepEqual(t.titles(), ['Toast a', 'Searching 3 of 10…', 'Toast c']);
  });

  it('does not play the entrance again', () => {
    // A toast that has not entered yet is drawn transparent and shifted down. A toast that has entered must stay put
    // through an update, so the component must be the same instance with its entered state intact.
    const t = setup({ inline: false });
    t.api.message({ id: 'a', text: 'One', preserve: true });
    t.advance(30);
    const drawn = () => t.items()[0].props.style.opacity;
    assert.equal(drawn(), 1);
    t.api.update('a', { text: 'Two' });
    t.advance(0);
    assert.equal(t.titles()[0], 'Two');
    assert.equal(drawn(), 1);
  });

  it('adds a type and reads its word, and removes it with null', () => {
    const t = setup();
    t.api.message({ id: 'a', text: 'Search Done', preserve: true });
    t.advance(0);
    t.api.update('a', { type: 'success' });
    t.advance(0);
    assert.equal(t.titles()[0], 'Success: Search Done');
    assert.match(t.items()[0].props.className, /hy-toast--success/);
    t.api.update('a', { type: null });
    t.advance(0);
    assert.equal(t.titles()[0], 'Search Done');
  });

  it('removes the action button with action: null', () => {
    const t = setup();
    t.api.message({ id: 'a', text: 'Failed', action: 'Retry', preserve: true });
    t.advance(0);
    assert.equal(t.buttons(t.items()[0]).some((b) => b.props['data-label'] === 'Retry'), true);
    t.api.update('a', { action: null });
    t.advance(0);
    assert.equal(t.buttons(t.items()[0]).some((b) => b.props['data-label'] === 'Retry'), false);
  });

  it('adds and removes the Dismiss button with preserve', () => {
    const t = setup();
    t.api.message({ id: 'a', text: 'One' });
    t.advance(0);
    const dismiss = () => t.buttons(t.items()[0]).some((b) => b.props['aria-label'] === 'Dismiss');
    assert.equal(dismiss(), false);
    t.api.update('a', { preserve: true });
    t.advance(0);
    assert.equal(dismiss(), true);
    t.api.update('a', { preserve: false });
    t.advance(0);
    assert.equal(dismiss(), false);
  });
});

describe('update() and the dismiss timer', () => {
  it('restarts a preserved toast at the default duration when preserve is false, counted from the update', () => {
    const t = setup();
    t.api.message({ id: 's', text: 'Searching…', preserve: true });
    t.advance(60000);
    assert.equal(t.titles().length, 1);
    t.api.update('s', { preserve: false, text: 'Search Done', type: 'success' });
    t.advance(5999);
    assert.equal(t.titles().length, 1);
    t.advance(2);
    assert.equal(t.titles().length, 0);
  });

  it('does not extend the timer when the update has no duration or preserve', () => {
    const t = setup();
    t.api.message({ id: 'a', text: 'One', duration: 1000 });
    t.advance(600);
    t.api.update('a', { text: 'Two', type: 'warning' });
    t.advance(401);
    assert.equal(t.titles().length, 0);
  });

  it('restarts with a new duration', () => {
    const t = setup();
    t.api.message({ id: 'a', text: 'One', duration: 1000 });
    t.advance(600);
    t.api.update('a', { duration: 5000 });
    t.advance(4999);
    assert.equal(t.titles().length, 1);
    t.advance(2);
    assert.equal(t.titles().length, 0);
  });

  it('keeps a preserved toast preserved', () => {
    const t = setup();
    t.api.message({ id: 'a', text: 'One', preserve: true });
    t.api.update('a', { preserve: true, text: 'Two' });
    t.advance(60000);
    assert.equal(t.titles().length, 1);
  });
});

describe('progress', () => {
  it('draws a bar at 30% for 3 of 10, named by the toast text', () => {
    const t = setup();
    t.api.message({ id: 'a', text: 'Searching 3 of 10…', preserve: true, progress: { value: 3, max: 10 } });
    t.advance(0);
    const [bar] = t.bars();
    assert.equal(bar.props['aria-valuenow'], 3);
    assert.equal(bar.props['aria-valuemax'], 10);
    assert.equal(bar.props['aria-label'], 'Searching 3 of 10…');
    assert.equal(all(bar, (n) => n.props.className === 'hy-progress__fill')[0].props.style.transform, 'translateX(-70%)');
  });

  it('sits inside the toast, and its value is not text', () => {
    const t = setup();
    t.api.message({ id: 'a', text: 'Searching…', preserve: true, progress: { value: 1 } });
    t.advance(0);
    const li = t.items()[0];
    assert.equal(all(li, (n) => n.props.role === 'progressbar').length, 1);
    assert.equal(textOf(li), 'Searching…');
  });

  it('names the bar after the toast text when the text is an element', () => {
    const t = setup();
    t.api.message({ id: 'a', text: t.el('span', null, 'Indexing ', t.el('b', null, 'main')), preserve: true, progress: { value: 1 } });
    t.advance(0);
    assert.equal(t.bars()[0].props['aria-label'], 'Indexing main');
  });

  it('is added, changed and removed by update', () => {
    const t = setup();
    t.api.message({ id: 'a', text: 'Searching…', preserve: true });
    t.advance(0);
    assert.equal(t.bars().length, 0);
    t.api.update('a', { progress: { value: 2, max: 4 } });
    t.advance(0);
    assert.equal(t.bars()[0].props['aria-valuenow'], 2);
    t.api.update('a', { progress: { value: 3, max: 4 } });
    t.advance(0);
    assert.equal(t.bars()[0].props['aria-valuenow'], 3);
    t.api.update('a', { progress: null });
    t.advance(0);
    assert.equal(t.bars().length, 0);
  });

  it('draws from ToastData in the controlled form', () => {
    const t = setup({ toasts: [{ id: 1, text: 'Uploading', preserve: true, progress: { value: 5, max: 20 } }] });
    assert.equal(t.bars()[0].props['aria-valuenow'], 5);
    assert.equal(t.bars()[0].props['aria-valuemax'], 20);
    assert.equal(t.bars()[0].props['aria-label'], 'Uploading');
  });

  it('is absent from toasts that do not ask for it', () => {
    const t = setup();
    t.api.success({ id: 'a', text: 'Domain added', preserve: true });
    t.advance(0);
    assert.equal(t.bars().length, 0);
    assert.equal(all(t.items()[0], (n) => String(n.props.className).includes('progress')).length, 0);
  });
});

describe('what the live region announces', () => {
  // The region is polite with aria-relevant "additions text": only added nodes and changed text are read out.
  const announced = (t, fn) => { const before = textOf(t.live()); fn(); t.advance(0); return textOf(t.live()) !== before; };
  const start = () => {
    const t = setup();
    t.api.message({ id: 'a', text: 'Searching…', preserve: true, progress: { value: 0, max: 20 } });
    t.advance(0);
    return t;
  };

  it('stays silent through 20 progress-only updates', () => {
    const t = start();
    let changes = 0;
    for (let v = 1; v <= 20; v++) if (announced(t, () => t.api.update('a', { progress: { value: v, max: 20 } }))) changes++;
    assert.equal(changes, 0);
    assert.equal(t.bars()[0].props['aria-valuenow'], 20);
  });

  it('announces a text change once, and not the progress ticks after it', () => {
    const t = start();
    let changes = 0;
    if (announced(t, () => t.api.update('a', { text: 'Searching 3 of 10…', progress: { value: 3, max: 10 } }))) changes++;
    for (let v = 4; v <= 10; v++) if (announced(t, () => t.api.update('a', { progress: { value: v, max: 10 } }))) changes++;
    assert.equal(changes, 1);
  });

  it('announces a type change with its word', () => {
    const t = start();
    assert.equal(announced(t, () => t.api.update('a', { type: 'error' })), true);
    assert.match(textOf(t.live()), /Error: Searching…/);
  });

  it('is still a polite region for additions and text', () => {
    const t = start();
    assert.equal(t.live().props['aria-relevant'], 'additions text');
  });
});
