// Tests for Rail / Rail.Item / Rail.Spacer (hyprsh/design#86). Rail.js and TabBar.js are plain scripts that run in the
// bundle's scope, so each runs here in its own vm context with stubs; the vnode trees they return are inspected directly.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const src = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src');

/* Loads one component file into a fresh context. The latest Provider value is kept, so a test can render the items
   under the context their parent just made. `fake.nav` is what the nav's ref points at. */
const load = (file) => {
  const registry = {};
  const state = { ctx: null, nav: null, activeElement: null, selected: [] };
  const context = vm.createContext({
    React: {
      createContext: () => ({ Provider: 'Provider' }),
      useContext: () => state.ctx,
      Children: { toArray: (c) => [].concat(c == null ? [] : c).flat(Infinity) },
      isValidElement: (e) => !!e && typeof e === 'object',
      cloneElement: (e, p) => ({ ...e, props: { ...e.props, ...p } }),
    },
    h: (type, props, ...children) => {
      if (type === 'Provider') state.ctx = props.value;
      return { type, props: props || {}, children: children.flat(Infinity) };
    },
    cx: (...a) => a.filter(Boolean).join(' '),
    omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
    useControllable: (v, d, on) => [v !== undefined ? v : d, (n) => { state.selected.push(n); if (on) on(n); }],
    useState: (v) => [v, () => {}],
    useEffect: () => {},
    useRef: () => ({ get current() { return state.nav; }, set current(_) {} }),
    HY: { Tooltip: 'Tooltip' },
    document: { get activeElement() { return state.activeElement; } },
    define: (name, fn) => { registry[name] = fn; },
  });
  vm.runInContext(readFileSync(join(src, file), 'utf8'), context, { filename: file });
  return { registry, state };
};
const rail = load('Rail.js');
const tabbar = load('TabBar.js');
const { registry } = rail;

const find = (node, pred) => {
  if (!node || typeof node !== 'object') return null;
  if (pred(node)) return node;
  for (const c of node.children || []) { const f = find(c, pred); if (f) return f; }
  return null;
};
const findAll = (node, pred, out = []) => {
  if (!node || typeof node !== 'object') return out;
  if (pred(node)) out.push(node);
  for (const c of node.children || []) findAll(c, pred, out);
  return out;
};
const cls = (n, c) => (n.props.className || '').split(' ').includes(c);
const control = (n) => find(n, (x) => x.type === 'a' || x.type === 'button');
const text = (node) => {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node !== 'object') return String(node);
  if (node.props['aria-hidden'] === 'true') return '';
  return node.children.map(text).join('');
};
const item = (props) => registry.RailItem({ label: 'Projects', icon: 'icon', ...props });
const renderRail = (props, children) => {
  const kids = children || [
    { type: registry.RailItem, props: { value: 'projects', label: 'Projects', icon: 'p' }, children: [] },
    { type: registry.RailItem, props: { value: 'domains', label: 'Domains', icon: 'd' }, children: [] },
    { type: registry.RailSpacer, props: {}, children: [] },
    { type: registry.RailItem, props: { value: 'settings', label: 'Settings', icon: 's' }, children: [] },
  ];
  return registry.Rail({ label: 'Main', children: kids, ...props });
};
const css = readFileSync(join(src, 'Rail.css'), 'utf8');

describe('Rail registration and API', () => {
  it('exports the same parts as TabBar plus a spacer', () => {
    assert.equal(registry.Rail.Item, registry.RailItem);
    assert.equal(registry.Rail.Spacer, registry.RailSpacer);
    assert.equal(typeof registry.RailItem, 'function');
    assert.equal(typeof registry.RailSpacer, 'function');
  });
  it('renders a nav named by label', () => {
    const n = renderRail({});
    assert.equal(n.type, 'nav');
    assert.equal(n.props['aria-label'], 'Main');
    assert.ok(cls(n, 'hy-rail'));
  });
  it('keeps every child in order, with the spacer between the groups', () => {
    const n = renderRail({});
    const kids = find(n, (x) => x.type === 'Provider').children;
    assert.deepEqual(kids.map((k) => k.type), [registry.RailItem, registry.RailItem, registry.RailSpacer, registry.RailItem]);
  });
  it('renders the spacer as a growing, hidden-from-AT block', () => {
    const s = registry.RailSpacer({});
    assert.ok(cls(s, 'hy-rail__spacer'));
    assert.equal(s.props['aria-hidden'], 'true');
    assert.match(css, /\.hy-rail__spacer\s*\{[^}]*flex:\s*1/);
  });
  it('accepts children that are not items', () => {
    const other = { type: 'ThemeSwitcher', props: {}, children: [] };
    const n = renderRail({}, [other]);
    assert.equal(find(n, (x) => x.type === 'Provider').children[0], other);
  });
  it('passes className and style to the nav', () => {
    const n = renderRail({ className: 'mine', style: { top: 0 } });
    assert.ok(cls(n, 'mine'));
    assert.deepEqual(n.props.style, { top: 0 });
  });
});

describe('Rail selection', () => {
  it('selects by value and marks it aria-current', () => {
    renderRail({ value: 'domains' });
    assert.equal(control(item({ value: 'domains' })).props['aria-current'], 'page');
    assert.equal(control(item({ value: 'projects' })).props['aria-current'], undefined);
  });
  it('selects by defaultValue', () => {
    renderRail({ defaultValue: 'projects' });
    assert.equal(control(item({ value: 'projects' })).props['aria-current'], 'page');
  });
  it('lets current take the selection from value', () => {
    const kids = [
      { type: registry.RailItem, props: { value: 'projects', label: 'Projects', icon: 'p' }, children: [] },
      { type: registry.RailItem, props: { label: 'More', icon: 'm', current: true }, children: [] },
    ];
    renderRail({ value: 'projects' }, kids);
    assert.equal(control(item({ value: 'projects' })).props['aria-current'], undefined);
    assert.equal(control(item({ label: 'More', current: true })).props['aria-current'], 'page');
    assert.equal(control(item({ label: 'More', current: false })).props['aria-current'], undefined);
  });
  it('lets current on any child, such as the app\'s own wrapper, take the selection like TabBar', () => {
    const wrapped = { type: () => null, props: { label: 'More', icon: 'm', current: true }, children: [] };
    renderRail({ value: 'projects' }, [wrapped, { type: registry.RailItem, props: { value: 'projects', label: 'Projects', icon: 'p' }, children: [] }]);
    assert.equal(control(item({ value: 'projects' })).props['aria-current'], undefined);
  });
  it('calls onChange and onValueChange when an item with a value is pressed, and the item onClick', () => {
    const calls = [];
    renderRail({ onChange: (v) => calls.push('change:' + v), onValueChange: (v) => calls.push('value:' + v) });
    let clicked = 0;
    control(item({ value: 'domains', onClick: () => clicked++ })).props.onClick({});
    assert.deepEqual(calls, ['change:domains', 'value:domains']);
    assert.equal(clicked, 1);
  });
  it('treats an item without a value as an action', () => {
    renderRail({});
    rail.state.selected.length = 0;
    let clicked = 0;
    control(item({ label: 'More', haspopup: true, onClick: () => clicked++ })).props.onClick({});
    assert.equal(clicked, 1);
    assert.deepEqual(rail.state.selected, []);
  });
});

describe('Rail.Item', () => {
  it('is an icon-only button named by its label, shown in a right-hand Tooltip', () => {
    renderRail({});
    const root = item({ value: 'projects' });
    assert.equal(root.type, 'Tooltip');
    assert.equal(root.props.text, 'Projects');
    assert.equal(root.props.position, 'right');
    assert.equal(root.props.describe, false);
    const b = control(root);
    assert.equal(b.type, 'button');
    assert.equal(b.props.type, 'button');
    assert.equal(b.props['aria-label'], 'Projects');
    assert.ok(cls(b, 'hy-rail__item'));
    assert.equal(text(b), '');
  });
  it('renders a link when it has an href', () => {
    renderRail({});
    const a = control(item({ href: '/projects' }));
    assert.equal(a.type, 'a');
    assert.equal(a.props.href, '/projects');
    assert.equal(a.props.type, undefined);
  });
  it('marks an item that opens a dialog with aria-haspopup', () => {
    renderRail({});
    assert.equal(control(item({ haspopup: true })).props['aria-haspopup'], 'dialog');
    assert.equal(control(item({})).props['aria-haspopup'], undefined);
  });
  it('adds the badge label to the accessible name', () => {
    renderRail({});
    assert.equal(control(item({ badge: 3, badgeLabel: '3 need attention' })).props['aria-label'], 'Projects, 3 need attention');
  });
  it('draws badges as a dot, a count, 99+ or a node, hidden from assistive tech with the icon', () => {
    renderRail({});
    const badge = (b, tone) => find(item({ badge: b, badgeTone: tone }), (x) => cls(x, 'hy-rail__badge'));
    assert.ok(cls(badge(true), 'hy-rail__badge--dot'));
    assert.deepEqual(badge(3).children, ['3']);
    assert.ok(cls(badge(3), 'hy-rail__badge--count'));
    assert.deepEqual(badge(120).children, ['99+']);
    assert.equal(badge(0), null);
    assert.equal(badge(false), null);
    assert.ok(cls(badge(2, 'error'), 'hy-rail__badge--error'));
    assert.ok(cls(badge(true, 'warning'), 'hy-rail__badge--warning'));
    assert.ok(!cls(badge(true, 'accent'), 'hy-rail__badge--accent'));
    const icon = find(item({ badge: 3 }), (x) => cls(x, 'hy-rail__icon'));
    assert.equal(icon.props['aria-hidden'], 'true');
  });
  it('is at least the touch target in both directions', () => {
    assert.match(css, /\.hy-rail__item\s*\{[^}]*min-width:\s*var\(--touch-target\)/);
    assert.match(css, /\.hy-rail__item\s*\{[^}]*min-height:\s*var\(--touch-target\)/);
  });
});

describe('Rail keyboard', () => {
  const els = ['a', 'b', 'c'].map((id) => ({ id, focused: false, focus() { this.focused = true; } }));
  const press = (key, from) => {
    els.forEach((e) => { e.focused = false; });
    rail.state.nav = { querySelectorAll: () => els };
    rail.state.activeElement = from;
    let prevented = false;
    renderRail({}).props.onKeyDown({ key, preventDefault: () => { prevented = true; } });
    return { focus: els.find((e) => e.focused), prevented };
  };
  it('moves down and up between items, wrapping', () => {
    assert.equal(press('ArrowDown', els[0]).focus, els[1]);
    assert.equal(press('ArrowDown', els[2]).focus, els[0]);
    assert.equal(press('ArrowUp', els[0]).focus, els[2]);
    assert.equal(press('ArrowUp', els[2]).focus, els[1]);
  });
  it('jumps with Home and End', () => {
    assert.equal(press('Home', els[2]).focus, els[0]);
    assert.equal(press('End', els[0]).focus, els[2]);
  });
  it('ignores other keys and focus outside the items', () => {
    assert.deepEqual(press('ArrowRight', els[0]), { focus: undefined, prevented: false });
    assert.deepEqual(press('ArrowDown', { id: 'theme' }), { focus: undefined, prevented: false });
  });
  it('queries only the rail items, so other children stay out of the arrow loop', () => {
    let sel = '';
    rail.state.nav = { querySelectorAll: (s) => { sel = s; return els; } };
    rail.state.activeElement = els[0];
    renderRail({}).props.onKeyDown({ key: 'ArrowDown', preventDefault() {} });
    assert.equal(sel, '.hy-rail__item');
  });
});

describe('Rail visibility and surface', () => {
  it('is hidden below sm by default', () => {
    assert.ok(cls(renderRail({}), 'hy-rail--show-sm'));
    assert.match(css, /\.hy-rail--show-sm\s*\{[^}]*display:\s*none/);
    assert.match(css, /@media \(min-width: 640px\)\s*\{[^@]*\.hy-rail--show-sm\s*\{[^}]*display:\s*flex/);
  });
  it('shows at every width with showFrom={false}', () => {
    assert.ok(!cls(renderRail({ showFrom: false }), 'hy-rail--show-sm'));
    assert.match(css, /\.hy-rail\s*\{[^}]*display:\s*flex/);
  });
  it('sits in the flow, sticky and full height, on background-200 with a trailing divider', () => {
    const block = css.match(/\.hy-rail\s*\{([^}]*)\}/)[1];
    assert.match(block, /position:\s*sticky/);
    assert.match(block, /height:\s*100(?:d)?vh/);
    assert.match(block, /background:\s*var\(--background-200\)/);
    assert.match(block, /border-inline-end:\s*1px solid var\(--gray-alpha-400\)/);
  });
  it('uses tokens only', () => {
    assert.ok(!/#[0-9a-f]{3,8}\b/i.test(css));
    assert.ok(!/transition:\s*all/.test(css));
  });
});

describe('the same items in TabBar and Rail', () => {
  const items = [
    { value: 'overview', label: 'Overview', icon: 'i', badge: 3, badgeLabel: '3 need attention' },
    { value: 'library', label: 'Library', icon: 'l', badge: true, badgeTone: 'warning', badgeLabel: 'Needs review' },
    { value: 'activity', label: 'Activity', icon: 'a', badge: 120, badgeLabel: 'More than 99 events', href: '/activity' },
    { label: 'More', icon: 'm', haspopup: true, onClick() {} },
  ];
  const summary = (loaded, name, prefix, props) => {
    const el = control(loaded.registry[name](props));
    const badge = find(el, (x) => cls(x, prefix + '__badge'));
    return {
      tag: el.type,
      href: el.props.href,
      current: el.props['aria-current'],
      popup: el.props['aria-haspopup'],
      name: el.props['aria-label'] || text(el),
      badge: badge && { text: text(badge), kind: badge.props.className.replace(new RegExp(prefix + '__badge', 'g'), 'b') },
    };
  };
  it('gives each item the same element, current state, popup, accessible name and badge', () => {
    tabbar.registry.TabBar({ label: 'Screens', value: 'library', children: items.map((p) => ({ type: tabbar.registry.TabBarItem, props: p, children: [] })) });
    renderRail({ value: 'library' }, items.map((p) => ({ type: registry.RailItem, props: p, children: [] })));
    for (const p of items) {
      const t = summary(tabbar, 'TabBarItem', 'hy-tabbar', p);
      const r = summary(rail, 'RailItem', 'hy-rail', p);
      assert.deepEqual(r, t, p.label);
    }
  });
});
