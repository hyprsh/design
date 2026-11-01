// Tests for NavList / NavItem (hyprsh/design#65). NavList.js is plain script that runs in the bundle's scope,
// so it runs here in a vm context with stub hooks; the vnode tree it returns is inspected directly.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const src = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src');
const registry = {};
const warnings = [];
const slots = [];
const slot = { i: 0 };
const mount = () => { slots.length = 0; };
const render = (props) => { slot.i = 0; return registry.NavList(props); };
const context = vm.createContext({
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity) }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  useId: () => 'id',
  // refs persist per "instance": mount() starts a new one, a render pass restarts the slot index
  useRef: (init) => (slots[slot.i] || (slots[slot.i] = { current: init }), slots[slot.i++]),
  console: { warn: (m) => warnings.push(m) },
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(join(src, 'NavList.js'), 'utf8'), context, { filename: 'NavList.js' });

const item = (props, ...children) => registry.NavItem({ ...props, children: children.length ? children : 'Downloads' });
const find = (node, pred) => {
  if (!node || typeof node !== 'object') return null;
  if (pred(node)) return node;
  for (const c of node.children || []) { const f = find(c, pred); if (f) return f; }
  return null;
};
const control = (li) => find(li, (n) => n.type === 'a' || n.type === 'button');
// Accessible name: text of the subtree, skipping aria-hidden nodes.
const name = (node) => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node !== 'object') return String(node);
  if (node.props['aria-hidden'] === 'true' || node.props['aria-hidden'] === true) return '';
  return node.children.map(name).join('');
};

describe('NavItem element', () => {
  it('renders a link with href, passing anchor attributes through', () => {
    const c = control(item({ href: '/x', target: '_blank' }));
    assert.equal(c.type, 'a');
    assert.equal(c.props.href, '/x');
    assert.equal(c.props.target, '_blank');
  });
  it('renders a type=button button with onClick and no href', () => {
    const onClick = () => {};
    const c = control(item({ onClick }));
    assert.equal(c.type, 'button');
    assert.equal(c.props.type, 'button');
    assert.equal(c.props.onClick, onClick);
    assert.equal('href' in c.props, false);
  });
  it('sits in a list item', () => {
    assert.equal(item({ href: '/x' }).type, 'li');
  });
  it('disabled button gets aria-disabled and does not fire onClick', () => {
    let n = 0;
    const c = control(item({ disabled: true, onClick: () => n++ }));
    assert.equal(c.props['aria-disabled'], 'true');
    c.props.onClick({ preventDefault() {} });
    assert.equal(n, 0);
  });
  it('hides the icon from assistive tech', () => {
    const c = control(item({ href: '/x', icon: 'ICON' }));
    const icon = find(c, (n) => n.children.includes('ICON'));
    assert.equal(icon.props['aria-hidden'], 'true');
    assert.equal(name(c), 'Downloads');
  });
});

describe('NavItem accessible name', () => {
  it('is just the label without a trailing node', () => {
    assert.equal(name(control(item({ href: '/x' }))), 'Downloads');
  });
  it('joins a numeric trailing count after a separator', () => {
    assert.equal(name(control(item({ href: '/x', trailing: 3 }))), 'Downloads, 3');
  });
  it('shows a number as a count, visible', () => {
    const c = control(item({ href: '/x', trailing: 3 }));
    const t = find(c, (n) => /hy-nav-item__trailing/.test(n.props.className || ''));
    assert.ok(t.props.className.includes('hy-nav-item__count'));
  });
  it('uses trailingLabel for a non-number node', () => {
    const dot = { type: 'StatusDot', props: {}, children: [] };
    const c = control(item({ href: '/x', trailing: dot, trailingLabel: 'Failing' }, 'Health'));
    assert.equal(name(c), 'Health, Failing');
  });
  it('leaves a non-number trailing node out of the name without trailingLabel', () => {
    const dot = { type: 'StatusDot', props: {}, children: [] };
    assert.equal(name(control(item({ href: '/x', trailing: dot }, 'Health'))), 'Health');
  });
});

describe('NavItem current', () => {
  it('sets aria-current="page" and is-current', () => {
    const c = control(item({ href: '/x', current: true }));
    assert.equal(c.props['aria-current'], 'page');
    assert.ok(c.props.className.split(' ').includes('is-current'));
  });
  it('uses the given token', () => {
    for (const t of ['step', 'location', 'true', 'page']) {
      assert.equal(control(item({ href: '/x', current: t })).props['aria-current'], t);
    }
  });
  it('marks nothing without current or with current={false}', () => {
    for (const p of [{}, { current: false }]) {
      const c = control(item({ href: '/x', ...p }));
      assert.equal(c.props['aria-current'], undefined);
      assert.equal(c.props.className.includes('is-current'), false);
    }
  });
  it('does not leak a current attribute onto the element', () => {
    assert.equal('current' in control(item({ href: '/x', current: true })).props, false);
  });
});

describe('NavList', () => {
  it('renders a nav with a list, passing the accessible name', () => {
    const n = registry.NavList({ 'aria-label': 'Views', children: [] });
    assert.equal(n.type, 'nav');
    assert.equal(n.props['aria-label'], 'Views');
    assert.ok(find(n, (x) => x.type === 'ul'));
  });
  it('warns in development without an accessible name, not with one', () => {
    warnings.length = 0;
    mount();
    render({ children: [] });
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /NavList/);
    mount();
    render({ 'aria-label': 'Views', children: [] });
    mount();
    render({ 'aria-labelledby': 'x', children: [] });
    assert.equal(warnings.length, 1);
  });
  it('warns once per instance, not on every render', () => {
    warnings.length = 0;
    mount();
    for (let i = 0; i < 5; i++) render({ children: [] });
    assert.equal(warnings.length, 1);
    mount();
    render({ children: [] });
    assert.equal(warnings.length, 2);
  });
  it('hides the spoken parts with core .hy-sr', () => {
    const c = control(item({ href: '/x', trailing: 3 }));
    assert.ok(find(c, (n) => n.props.className === 'hy-sr'));
    assert.equal(find(c, (n) => n.props.className === 'hy-nav-item__sr'), null);
  });
  it('group heading labels its list', () => {
    const g = registry.NavGroup({ title: 'Account', children: [] });
    const ul = find(g, (n) => n.type === 'ul');
    const heading = find(g, (n) => n.props.id === ul.props['aria-labelledby']);
    assert.ok(heading);
    assert.equal(name(heading), 'Account');
  });
  it('exposes the compound parts and aliases', () => {
    assert.equal(registry.NavList.Group, registry.NavGroup);
    assert.equal(registry.NavList.Item, registry.NavItem);
  });
});

describe('NavList.css', () => {
  const file = join(src, 'NavList.css');
  const css = existsSync(file) ? readFileSync(file, 'utf8') : '';
  it('rows are 34px, and the touch target under touch sizing', () => {
    assert.match(css, /\.hy-nav-item\s*\{[^}]*height: 34px/);
    assert.match(css, /@media \(pointer: coarse\), \(max-width: 639px\)[^{]*\{[^}]*\.hy-nav-item[^}]*height: var\(--touch-target\)/);
  });
  it('current matches the secondary Button background and border', () => {
    assert.match(css, /\.hy-nav-item\.is-current\s*\{[^}]*background: var\(--background-100\)[^}]*box-shadow: 0 0 0 1px var\(--gray-alpha-400\)/);
  });
  it('truncates the label and keeps the trailing node in place', () => {
    assert.match(css, /\.hy-nav-item__label\s*\{[^}]*text-overflow: ellipsis/);
    assert.match(css, /\.hy-nav-item__trailing\s*\{(?=[^}]*margin-left: auto)[^}]*flex: none/);
  });
  it('has no hard-coded colours or transition: all', () => {
    assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|transition: all/i);
  });
});
