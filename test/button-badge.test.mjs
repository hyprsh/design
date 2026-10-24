// Tests for Button's badge, badgeTone and badgeLabel (hyprsh/design#35), which mean what they do on TabBar.Item.
// Button.js is plain script that runs in the bundle's scope, so it runs here in a vm context with a stub `h`.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const src = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src');
const registry = {};
const context = vm.createContext({
  HY: { Spinner: 'Spinner' },
  React: { forwardRef: (fn) => fn },
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(join(src, 'Button.js'), 'utf8'), context, { filename: 'Button.js' });
const render = (props, B = registry.Button) => B(props, null);
const find = (node, cls) => (node.props && String(node.props.className || '').split(' ').includes(cls) ? node : node.children.map((c) => c && c.props ? find(c, cls) : null).find(Boolean));
const text = (node) => node.children.map((c) => (typeof c === 'object' && c ? text(c) : String(c))).join('');

describe('Button badge', () => {
  it('draws nothing without badge, and leaves the markup alone', () => {
    const b = render({ children: 'Inbox', badgeTone: 'error', badgeLabel: 'x' });
    assert.equal(find(b, 'hy-btn__badge'), undefined);
    assert.equal(b.props['aria-label'], undefined);
    assert.equal(b.props.badge, undefined);
    assert.equal(b.props.badgeTone, undefined);
  });
  it('badge={true} is a dot, a number is a count, 99+ above 99, and 0 draws nothing', () => {
    assert.ok(find(render({ badge: true, children: 'A' }), 'hy-btn__badge--dot'));
    assert.equal(text(find(render({ badge: 4, children: 'A' }), 'hy-btn__badge--count')), '4');
    assert.equal(text(find(render({ badge: 120, children: 'A' }), 'hy-btn__badge--count')), '99+');
    assert.equal(find(render({ badge: 0, children: 'A' }), 'hy-btn__badge'), undefined);
  });
  it('renders a node badge as given, ignoring the tone', () => {
    const b = find(render({ badge: 'New', badgeTone: 'error', children: 'A' }), 'hy-btn__badge');
    assert.equal(text(b), 'New');
    assert.equal(b.props.className.includes('error'), false);
  });
  it('tones a dot or count error or warning, accent by default', () => {
    assert.ok(find(render({ badge: 2, badgeTone: 'error', children: 'A' }), 'hy-btn__badge--error'));
    assert.ok(find(render({ badge: true, badgeTone: 'warning', children: 'A' }), 'hy-btn__badge--warning'));
    assert.equal(find(render({ badge: 2, children: 'A' }), 'hy-btn__badge--error'), undefined);
  });
  it('joins badgeLabel to an aria-label', () => {
    const b = render({ svgOnly: true, 'aria-label': 'Inbox', badge: 3, badgeLabel: '3 need attention' });
    assert.equal(b.props['aria-label'], 'Inbox, 3 need attention');
  });
  it('defaults the label from a count', () => {
    assert.equal(render({ svgOnly: true, 'aria-label': 'Inbox', badge: 3 }).props['aria-label'], 'Inbox, 3');
  });
  it('adds the label as visually hidden text when the name comes from the content', () => {
    const b = render({ children: 'Inbox', badge: 3, badgeLabel: '3 need attention' });
    assert.equal(text(find(b, 'hy-sr')), ', 3 need attention');
    assert.equal(find(b, 'hy-btn__badge').props['aria-hidden'], 'true');
  });
  it('has no label for a bare dot', () => {
    const b = render({ svgOnly: true, 'aria-label': 'Inbox', badge: true });
    assert.equal(b.props['aria-label'], 'Inbox');
  });
  it('works the same on ButtonLink', () => {
    const b = render({ href: '/inbox', children: 'Inbox', badge: 2 }, registry.ButtonLink);
    assert.equal(b.type, 'a');
    assert.ok(find(b, 'hy-btn__badge--count'));
  });
});
