// Tests for the expandable Entity (hyprsh/design#91): `detail` turns the row into one disclosure button with a detail region
// under it. Entity.js is plain script that runs in the bundle's scope, so it runs here in a vm context with stub hooks.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const src = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src');
const registry = {};
let inList = false;
let nextCtx = 0;
let hooks = 0;
let controlled; // what the stub useControllable sees as the stored state
const calls = [];
const context = vm.createContext({
  React: { createContext: () => ({ Provider: 'Provider', n: nextCtx++ }), useContext: (c) => { hooks++; return c.n === 0 ? inList : null; } },
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  useRef: () => ({ current: null }),
  useId: () => 'id',
  useState: () => [false, () => {}],
  useLayoutEffect: () => {},
  useControllable: (value, def, onChange) => {
    const cur = value !== undefined ? value : controlled !== undefined ? controlled : def;
    return [cur, (next) => { calls.push(next); if (onChange) onChange(next); }];
  },
  Glyph: 'Glyph',
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(join(src, 'Entity.js'), 'utf8'), context, { filename: 'Entity.js' });
// Entity hands an expandable row to its own component, which holds the hooks.
const render = (props, list = false) => {
  inList = list;
  let r = registry.Entity(props);
  if (typeof r.type === 'function') r = r.type(r.props);
  return r;
};
const find = (node, pred, out = []) => {
  if (!node || typeof node !== 'object') return out;
  if (pred(node)) out.push(node);
  for (const c of node.children || []) find(c, pred, out);
  return out;
};
const cls = (n, c) => (n.props.className || '').split(' ').includes(c);
const toggle = (r) => find(r, (n) => n.type === 'button')[0];
const detailOf = (r) => find(r, (n) => cls(n, 'hy-entity__detail'))[0];

describe('Entity detail', () => {
  it('renders one button with aria-expanded and aria-controls pointing at the detail region', () => {
    controlled = undefined;
    const r = render({ detail: 'More', left: 'L', right: 'R' });
    const b = toggle(r);
    assert.equal(find(r, (n) => n.type === 'button').length, 1);
    assert.equal(b.props['aria-expanded'], false);
    const d = detailOf(r);
    assert.equal(b.props['aria-controls'], d.props.id);
    assert.equal(d.props.role, undefined);
    assert.equal(d.props['aria-labelledby'], undefined);
  });
  it('uses a stretched cover button over a row of divs, so no block sits inside the button', () => {
    const r = render({ detail: 'More', left: 'L', right: 'R', children: 'C' });
    const b = toggle(r);
    assert.ok(cls(b, 'hy-entity__cover'));
    assert.deepEqual(b.children, []);
    assert.equal(b.props.type, 'button');
    const row = find(r, (n) => cls(n, 'hy-entity'))[0];
    assert.ok(row.children.includes(b));
    assert.equal(find(row, (n) => cls(n, 'hy-entity__left')).length, 1);
    assert.equal(find(row, (n) => cls(n, 'hy-entity__right')).length, 1);
  });
  it('is a dispatcher with no hooks of its own, so detail can come and go on a mounted row', () => {
    hooks = 0;
    const a = registry.Entity({ detail: 'x' });
    const b = registry.Entity({});
    assert.equal(hooks, 0);
    assert.notEqual(a.type, b.type);
    assert.equal(typeof a.type, 'function');
    assert.equal(typeof b.type, 'function');
  });
  it('names the button by the left and content, not the right', () => {
    const r = render({ detail: 'More', left: 'L', right: 'R' });
    const b = toggle(r);
    const labelled = find(r, (n) => n.props.id === b.props['aria-labelledby'])[0];
    assert.ok(cls(labelled, 'hy-entity__left'));
    const right = find(r, (n) => cls(n, 'hy-entity__right'))[0];
    assert.ok(right);
    assert.notEqual(right.props.id, b.props['aria-labelledby']);
  });
  it('keeps the detail outside the row and its button', () => {
    const r = render({ detail: 'More', left: 'L', right: 'R', children: 'C' });
    const row = find(r, (n) => cls(n, 'hy-entity'))[0];
    assert.equal(find(row, (n) => cls(n, 'hy-entity__detail')).length, 0);
    assert.equal(find(detailOf(r), (n) => n.type === 'button').length, 0);
  });
  it('hides a collapsed detail (out of sight and the Tab order) and shows an open one', () => {
    controlled = undefined;
    assert.equal(detailOf(render({ detail: 'x' })).props.hidden, true);
    assert.equal(detailOf(render({ detail: 'x', defaultExpanded: true })).props.hidden, false);
    assert.equal(toggle(render({ detail: 'x', defaultExpanded: true })).props['aria-expanded'], true);
  });
  it('toggles on click and reports it with onExpandedChange', () => {
    controlled = undefined;
    calls.length = 0;
    const seen = [];
    toggle(render({ detail: 'x', onExpandedChange: (v) => seen.push(v) })).props.onClick({});
    assert.deepEqual(seen, [true]);
    toggle(render({ detail: 'x', expanded: true, onExpandedChange: (v) => seen.push(v) })).props.onClick({});
    assert.deepEqual(seen, [true, false]);
  });
  it('follows `expanded` when controlled', () => {
    const r = render({ detail: 'x', expanded: true, defaultExpanded: false });
    assert.equal(toggle(r).props['aria-expanded'], true);
    assert.equal(detailOf(r).props.hidden, false);
  });
  it('disables the button with `disabled`', () => {
    assert.equal(toggle(render({ detail: 'x', disabled: true })).props.disabled, true);
  });
  it('uses native button activation, so Enter and Space need no handler of their own', () => {
    const b = toggle(render({ detail: 'x' }));
    assert.equal(b.props.type, 'button');
    assert.equal(b.props.onKeyDown, undefined);
  });
  it('does not leak its own props onto the element', () => {
    const r = render({ detail: 'x', expanded: true, defaultExpanded: true, onExpandedChange() {} });
    for (const k of ['detail', 'expanded', 'defaultExpanded', 'onExpandedChange']) assert.equal(k in r.props, false);
  });
});

describe('Entity detail in a list', () => {
  it('is an <li> inside Entity.List, a <div> outside it, and honours as', () => {
    assert.equal(render({ detail: 'x' }, true).type, 'li');
    assert.equal(render({ detail: 'x' }, false).type, 'div');
    assert.equal(render({ detail: 'x', as: 'li' }, false).type, 'li');
  });
  it('keeps the detail in the same item as the row', () => {
    const r = render({ detail: 'x' }, true);
    assert.ok(find(r, (n) => cls(n, 'hy-entity__detail')).length === 1);
    assert.ok(find(r, (n) => cls(n, 'hy-entity')).length === 1);
  });
  it('puts current on the item and the row, never on the detail', () => {
    const r = render({ detail: 'x', current: true }, true);
    assert.equal(r.props['aria-current'], 'true');
    assert.equal('current' in r.props, false);
    assert.ok(cls(find(r, (n) => cls(n, 'hy-entity'))[0], 'is-current'));
    assert.equal(cls(r, 'is-current'), false);
    assert.equal(cls(detailOf(r), 'is-current'), false);
  });
});

describe('Entity without detail', () => {
  it('is unchanged, as="button" included', () => {
    for (const props of [{}, { as: 'button' }, { detail: undefined }, { detail: null }, { detail: false }]) {
      const r = render({ ...props, left: 'L' });
      assert.equal(r.props.className.split(' ')[0], 'hy-entity');
      assert.equal(find(r, (n) => cls(n, 'hy-entity__detail')).length, 0);
    }
    assert.ok(cls(find(render({ as: 'button' }), (n) => n.type === 'button')[0], 'hy-entity__cover'));
  });
});

describe('Entity.css detail', () => {
  const css = readFileSync(join(src, 'Entity.css'), 'utf8');
  it('animates only transform and opacity, and never `transition: all`', () => {
    const block = css.match(/\.hy-entity__detail[^{]*\{[^}]*\}/g).join('\n');
    assert.match(block, /transition:[^;]*opacity/);
    assert.match(block, /transform/);
    assert.doesNotMatch(css, /transition:\s*all/);
    assert.doesNotMatch(block, /(^|[\s;{])(height|max-height|grid-template-rows)\s*:/);
  });
  it('removes the animation under prefers-reduced-motion', () => {
    const m = css.match(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\n\}/);
    assert.ok(m);
    assert.match(m[0], /\.hy-entity__detail/);
    assert.match(m[0], /transition: none/);
  });
  it('gives the button a focus ring', () => {
    assert.match(css, /\.hy-entity__cover:focus-visible/);
  });
});
