// Tests for Entity's `current` state (hyprsh/design#36): the keyboard cursor row, drawn like `TableRow current`.
// Entity.js is plain script that runs in the bundle's scope, so it runs here in a vm context with stub hooks.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const src = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src');
const registry = {};
let inList = false;
const context = vm.createContext({
  React: { createContext: () => ({ Provider: 'Provider' }), useContext: () => inList },
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  useRef: () => ({ current: null }),
  useId: () => 'id',
  useState: () => [false, () => {}],
  useLayoutEffect: () => {},
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(join(src, 'Entity.js'), 'utf8'), context, { filename: 'Entity.js' });
const row = (props, list = false) => { inList = list; return registry.Entity(props); };

describe('Entity current', () => {
  for (const [name, props, list, tag] of [['as="li"', { as: 'li' }, false, 'li'], ['as="div"', { as: 'div' }, false, 'div'], ['as="button"', { as: 'button' }, false, 'div'], ['inside Entity.List', {}, true, 'li']]) {
    it(`marks the row with aria-current and is-current: ${name}`, () => {
      const r = row({ ...props, current: true }, list);
      assert.equal(r.type, tag);
      assert.equal(r.props['aria-current'], 'true');
      assert.ok(r.props.className.split(' ').includes('is-current'));
    });
  }
  it('does not leak a current attribute onto the element', () => {
    assert.equal('current' in row({ current: true }).props, false);
  });
  it('changes nothing without current, or with current={false}', () => {
    for (const r of [row({}), row({ current: false })]) {
      assert.equal(r.props['aria-current'], undefined);
      assert.equal(r.props.className.includes('is-current'), false);
    }
  });
  it('lets an explicit aria-current win', () => {
    assert.equal(row({ current: true, 'aria-current': 'location' }).props['aria-current'], 'location');
  });
});

describe('Entity.css current', () => {
  const css = readFileSync(join(src, 'Entity.css'), 'utf8');
  it('uses the Table tint and 2px start marker, with no hard-coded colours', () => {
    assert.match(css, /\.hy-entity\.is-current[^{]*\{[^}]*background-color: var\(--gray-alpha-100\)/);
    assert.match(css, /\.hy-entity\.is-current[^{]*\{[^}]*inset 2px 0 0 var\(--gray-1000\)/);
  });
  it('keeps the list divider under the marker', () => {
    assert.match(css, /\.hy-entity-list > \.hy-entity \+ \.hy-entity\.is-current[^{]*\{[^}]*inset 0 1px 0 var\(--gray-alpha-400\)/);
  });
});
