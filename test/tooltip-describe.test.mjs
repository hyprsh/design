// Tests for Tooltip's `describe` prop: with describe={false} the trigger never gets aria-describedby, for triggers
// whose accessible name already says what the tooltip says. Tooltip.js runs in a vm context with stubs.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const src = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src');
const registry = {};
const context = vm.createContext({
  React: {
    isValidElement: (e) => !!e && typeof e === 'object',
    cloneElement: (e, p) => ({ ...e, props: { ...e.props, ...p } }),
    Children: { count: () => 1 },
  },
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity) }),
  cx: (...a) => a.filter(Boolean).join(' '),
  useState: (v) => [v, () => {}],
  useId: () => 'tip',
  useRef: () => ({ current: null }),
  useEffect: () => {},
  useFloating: () => null,
  useDismiss: () => {},
  floatingStyle: () => ({}),
  portal: (n) => n,
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(join(src, 'Tooltip.js'), 'utf8'), context, { filename: 'Tooltip.js' });
const trigger = (props) => registry.Tooltip({ text: 'Inbox', ...props, children: { type: 'button', props: {}, children: [] } }).children[0];

describe('Tooltip describe prop', () => {
  it('describes the trigger while open by default', () => {
    assert.equal(trigger({ defaultOpen: true }).props['aria-describedby'], 'tip');
    assert.equal(trigger({}).props['aria-describedby'], undefined);
  });
  it('never describes the trigger with describe={false}', () => {
    assert.equal(trigger({ defaultOpen: true, describe: false }).props['aria-describedby'], undefined);
  });
  it('documents the prop', () => {
    assert.match(readFileSync(join(src, 'Tooltip.d.ts'), 'utf8'), /describe\?: boolean/);
  });
});
