// Tests that DotsMenu forwards tabIndex and onFocus to its trigger button (hyprsh/design#34).
// DotsMenu.js is plain script that runs in the bundle's scope, so it runs here in a vm context with a stub `h`.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const file = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src/DotsMenu.js');
const registry = {};
const context = vm.createContext({
  HY: { MenuContainer: 'MenuContainer', MenuButton: 'MenuButton', Menu: 'Menu' },
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
  cx: (...a) => a.filter(Boolean).join(' '),
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(file, 'utf8'), context, { filename: file });
const button = (props) => registry.DotsMenu(props).children.find((c) => c.type === 'MenuButton');

describe('DotsMenu trigger', () => {
  it('forwards tabIndex and onFocus to the button', () => {
    const onFocus = () => {};
    const b = button({ tabIndex: -1, onFocus });
    assert.equal(b.props.tabIndex, -1);
    assert.equal(b.props.onFocus, onFocus);
  });
  it('leaves both unset by default', () => {
    const b = button({});
    assert.equal(b.props.tabIndex, undefined);
    assert.equal(b.props.onFocus, undefined);
  });
});
