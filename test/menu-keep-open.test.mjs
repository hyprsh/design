// Tests for MenuItem's keepOpen: choosing the item runs its handlers but leaves the menu open, in the compound and the
// one-piece `items` form. Menu.js runs in a vm context with a stub for the menu context, like table-reorder.test.mjs.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const file = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src/Menu.js');
const registry = {};
let closes = [];
const stubCtx = { close: (focus) => closes.push(focus) };
const ctxs = [];
const context = vm.createContext({
  HY: {},
  React: {
    createContext: () => { const c = { Provider: 'Provider' }; ctxs.push(c); return c; },
    useContext: (c) => (c === ctxs[0] ? stubCtx : null),
    forwardRef: (fn) => fn,
    Fragment: 'Fragment',
  },
  useId: () => 'id-1',
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(file, 'utf8'), context, { filename: file });

const click = (li) => li.props.onClick({ preventDefault() {} });

describe('MenuItem keepOpen', () => {
  it('closes the menu after a plain item', () => {
    closes = [];
    click(registry.MenuItem({ onSelect() {} }, null));
    assert.deepEqual(closes, [true]);
  });
  it('runs onClick and onSelect but leaves the menu open with keepOpen', () => {
    closes = [];
    const ran = [];
    click(registry.MenuItem({ keepOpen: true, onClick: () => ran.push('click'), onSelect: () => ran.push('select') }));
    assert.deepEqual(ran, ['click', 'select']);
    assert.deepEqual(closes, []);
  });
  it('is passed through by the items form', () => {
    const list = context.LegacyList({ label: 'X', items: [{ label: 'A', keepOpen: true }, { label: 'B' }] });
    const items = list.children.filter((n) => n.type === registry.MenuItem);
    assert.deepEqual(items.map((i) => i.props.keepOpen), [true, undefined]);
  });
});
