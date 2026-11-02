// Tests for ActionBar's markup and CSS (hyprsh/design#87). ActionBar.js is plain script that runs in the bundle's scope,
// so it runs here in a vm context with stubs. Focus, sticky layout and live-region behaviour are in action-bar-dom.test.mjs.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const src = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src');
const registry = {};
const context = vm.createContext({
  React: {},
  HY: { Button: 'Button' },
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter((c) => c != null && c !== false) }),
  Glyph: 'Glyph',
  cx: (...a) => a.filter(Boolean).join(' '),
  useState: (v) => [v, () => {}],
  useEffect: () => {},
  useRef: (v) => ({ current: v === undefined ? null : v }),
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(join(src, 'ActionBar.js'), 'utf8'), context, { filename: 'ActionBar.js' });
const render = (props) => registry.ActionBar({ open: true, ...props });

/* Every element in the rendered tree, depth first. */
const walk = (node, out = []) => {
  if (!node || typeof node !== 'object') return out;
  out.push(node);
  (node.children || []).forEach((c) => walk(c, out));
  return out;
};
const text = (node) => (typeof node === 'string' || typeof node === 'number' ? String(node) : node && node.children ? node.children.map(text).join('') : '');
const classes = (node) => String((node.props && node.props.className) || '').split(' ');
const byClass = (tree, cls) => walk(tree).filter((n) => classes(n).includes(cls));
const buttons = (tree) => walk(tree).filter((n) => n.type === 'Button');
const names = (tree) => buttons(tree).map((b) => text(b));

describe('ActionBar markup', () => {
  it('renders nothing while closed', () => {
    assert.equal(registry.ActionBar({ open: false, label: 'x' }), null);
    assert.equal(registry.ActionBar({ label: 'x' }), null);
  });
  it('shows the label and the actions slot while open', () => {
    const tree = render({ label: '3 unsaved changes', actions: 'ACTIONS', className: 'mine' });
    assert.ok(classes(tree).includes('hy-action-bar') && classes(tree).includes('mine'));
    assert.equal(text(byClass(tree, 'hy-action-bar__label')[0]), '3 unsaved changes');
    assert.equal(text(byClass(tree, 'hy-action-bar__actions')[0]), 'ACTIONS');
  });
  it('has no close button without onClose, and names it Close or closeLabel with it', () => {
    assert.equal(buttons(render({ label: 'x' })).length, 0);
    const close = buttons(render({ label: 'x', onClose: () => {} }))[0];
    assert.equal(close.props['aria-label'], 'Close');
    assert.equal(buttons(render({ label: 'x', onClose: () => {}, closeLabel: 'Dismiss' }))[0].props['aria-label'], 'Dismiss');
  });
  it('calls onClose from the close button', () => {
    let n = 0;
    buttons(render({ onClose: () => { n++; } }))[0].props.onClick();
    assert.equal(n, 1);
  });

  describe('selection', () => {
    const calls = [];
    const selection = { count: 3, total: 8, onSelectAll: () => calls.push('all'), onClear: () => calls.push('clear') };
    it('renders the count as the label, Select All, Clear, then the actions', () => {
      const tree = render({ selection, label: 'ignored', actions: 'ACTIONS' });
      assert.equal(text(byClass(tree, 'hy-action-bar__label')[0]), '3 selected');
      assert.deepEqual(names(tree), ['Select All', 'Clear']);
      const actions = byClass(tree, 'hy-action-bar__actions')[0];
      assert.equal(text(actions.children.at(-1)), 'ACTIONS');
      buttons(tree)[0].props.onClick(); buttons(tree)[1].props.onClick();
      assert.deepEqual(calls, ['all', 'clear']);
    });
    it('hides Select All when every row is selected', () => {
      assert.deepEqual(names(render({ selection: { ...selection, count: 8 } })), ['Clear']);
    });
    it('hides Select All without onSelectAll', () => {
      assert.deepEqual(names(render({ selection: { count: 1, total: 8, onClear() {} } })), ['Clear']);
    });
  });

  describe('error', () => {
    it('shows the error with an icon and keeps the bar open', () => {
      const tree = render({ label: '3 unsaved changes', error: 'Couldn’t Save: Check Your Connection' });
      const err = byClass(tree, 'hy-action-bar__error')[0];
      assert.ok(err, 'an error row');
      assert.match(text(err), /Couldn’t Save/);
      assert.ok(walk(err).some((n) => n.type === 'Glyph' && n.props.name === 'error'), 'an error glyph, not colour alone');
      assert.ok(byClass(tree, 'hy-action-bar__label')[0]);
    });
    it('has no error row without an error', () => assert.equal(byClass(render({ label: 'x' }), 'hy-action-bar__error').length, 0));
  });

  describe('live region', () => {
    it('is a polite status region, visually hidden, separate from the visible label', () => {
      const region = byClass(render({ label: 'x' }), 'hy-sr')[0];
      assert.ok(region);
      assert.equal(region.props['aria-live'], 'polite');
      assert.equal(region.props.role, 'status');
    });
  });

  describe('opaque', () => {
    it('has no opaque class by default', () => assert.ok(!classes(render({})).includes('hy-action-bar--opaque')));
    it('adds hy-action-bar--opaque and does not leak the prop', () => {
      const tree = render({ opaque: true });
      assert.ok(classes(tree).includes('hy-action-bar--opaque'));
      assert.equal(tree.props.opaque, undefined);
    });
  });
});

const css = readFileSync(join(src, 'ActionBar.css'), 'utf8');
const rule = (sel, scope = css) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = scope.match(new RegExp('(?:^|[}\\s])' + esc + '\\s*\\{([^}]*)\\}'));
  return m ? m[1] : '';
};
const atRule = (prelude) => {
  const at = css.indexOf(prelude);
  if (at < 0) return '';
  let i = css.indexOf('{', at), depth = 0;
  const start = i + 1;
  for (; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return css.slice(start, i);
  }
  return '';
};

describe('ActionBar CSS', () => {
  it('opens with the component banner', () => assert.match(css, /^\/\* ---------- ActionBar ---------- \*\//));
  it('is sticky at the foot, raised by --tab-bar-height and the safe area', () => {
    const bar = rule('.hy-action-bar');
    assert.match(bar, /position:\s*sticky/);
    assert.match(bar, /bottom:[^;]*var\(--tab-bar-height/);
    assert.match(bar, /bottom:[^;]*env\(safe-area-inset-bottom/);
  });
  it('defines a translucent surface and the blur, and applies both backdrop-filter forms', () => {
    const bar = rule('.hy-action-bar');
    assert.match(bar, /--hy-action-bar-surface:\s*color-mix\(in srgb,\s*var\(--background-100\)\s*\d+%,\s*transparent\)/);
    assert.match(bar, /--hy-action-bar-filter:\s*blur\([^)]+\)\s*saturate\([^)]+\)/);
    const s = rule('.hy-action-bar__surface');
    assert.match(s, /background-color:\s*var\(--hy-action-bar-surface\)/);
    assert.match(s, /-webkit-backdrop-filter:\s*var\(--hy-action-bar-filter\)/);
    assert.match(s, /(?<!-)backdrop-filter:\s*var\(--hy-action-bar-filter\)/);
  });
  const fallbacks = [
    { name: '.hy-action-bar--opaque', scope: css, selector: '.hy-action-bar--opaque' },
    { name: 'prefers-reduced-transparency: reduce', scope: atRule('@media (prefers-reduced-transparency: reduce)'), selector: '.hy-action-bar' },
    { name: '@supports not backdrop-filter', scope: atRule('@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))'), selector: '.hy-action-bar' },
  ];
  for (const { name, scope, selector } of fallbacks) {
    it(`restores the solid surface and no filter: ${name}`, () => {
      assert.ok(scope, 'the rule exists');
      const resets = rule(selector, scope);
      assert.match(resets, /--hy-action-bar-surface:\s*var\(--background-100\)/);
      assert.match(resets, /--hy-action-bar-filter:\s*none/);
    });
  }
  it('does not gate the translucent look on no-preference', () => assert.doesNotMatch(css, /prefers-reduced-transparency:\s*no-preference/));
  it('enters with transform and opacity only, and not under reduced motion', () => {
    const kf = css.match(/@keyframes hy-action-bar-in\s*\{[\s\S]*?\}\s*\}/);
    assert.ok(kf, 'a keyframes block');
    assert.match(kf[0], /opacity/);
    assert.match(kf[0], /transform/);
    assert.doesNotMatch(kf[0].replace(/opacity|transform/g, ''), /(height|width|top|bottom|left|right|margin|padding):/);
    assert.match(rule('.hy-action-bar__surface'), /animation:\s*hy-action-bar-in/);
    assert.match(rule('.hy-action-bar__surface', atRule('@media (prefers-reduced-motion: reduce)')), /animation:\s*none/);
  });
  it('uses no hex colours and no transition: all', () => {
    assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
    assert.doesNotMatch(css, /transition:\s*all/);
  });
});
