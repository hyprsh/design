// Tests for ActionBar's markup and CSS (hyprsh/design#87). ActionBar.js is plain script that runs in the bundle's scope,
// so it runs here in a vm context with stubs. Focus, sticky layout, narrow measuring, the restyled Buttons and
// live-region behaviour are in action-bar-dom.test.mjs.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const src = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src');
const registry = {};
/* `narrow` stands in for the measured width: the bar's only boolean state is its narrow form. */
let narrow = false;
const context = vm.createContext({
  React: { Fragment: 'Fragment' },
  HY: { Button: 'Button', MenuContainer: 'MenuContainer', MenuButton: 'MenuButton', Menu: 'Menu', MenuItem: 'MenuItem', Icon: 'Icon' },
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter((c) => c != null && c !== false) }),
  Glyph: 'Glyph',
  cx: (...a) => a.filter(Boolean).join(' '),
  useState: (v) => [v === false ? narrow : v, () => {}],
  useEffect: () => {},
  useLayoutEffect: () => {},
  useRef: (v) => ({ current: v === undefined ? null : v }),
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(join(src, 'ActionBar.js'), 'utf8'), context, { filename: 'ActionBar.js' });
const render = (props) => registry.ActionBar({ open: true, ...props });
const renderNarrow = (props) => { narrow = true; try { return render(props); } finally { narrow = false; } };

/* Every element in the rendered tree, depth first. */
const walk = (node, out = []) => {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) { node.forEach((c) => walk(c, out)); return out; }
  out.push(node);
  (node.children || []).forEach((c) => walk(c, out));
  return out;
};
const text = (node) => (typeof node === 'string' || typeof node === 'number' ? String(node)
  : Array.isArray(node) ? node.map(text).join('') : node && node.children ? node.children.map(text).join('') : '');
const classes = (node) => String((node.props && node.props.className) || '').split(' ');
const byClass = (tree, cls) => walk(tree).filter((n) => classes(n).includes(cls));
const buttons = (tree) => walk(tree).filter((n) => n.type === 'Button');
const byLabel = (tree, label) => buttons(tree).find((b) => b.props['aria-label'] === label);
const names = (tree) => buttons(tree).map((b) => b.props['aria-label'] || text(b));
const barOf = (tree) => byClass(tree, 'hy-action-bar')[0];
const rowOf = (tree) => byClass(tree, 'hy-action-bar__row')[0];
/* The row's parts as short names, in order, with the controls group flattened. */
const rowParts = (tree) => rowOf(tree).children.flatMap((c) => (classes(c).includes('hy-action-bar__controls') ? c.children : [c])).map((c) => {
  const cl = classes(c);
  if (cl.includes('hy-action-bar__count')) return 'count';
  if (cl.includes('hy-action-bar__label')) return 'label';
  if (cl.includes('hy-action-bar__sep')) return 'sep';
  if (cl.includes('hy-action-bar__actions')) return 'actions';
  if (cl.includes('hy-action-bar__close')) return 'close';
  if (c.type === 'MenuContainer') return 'more';
  return text(c);
});
const menus = (tree) => walk(tree).filter((n) => n.type === 'MenuContainer');

describe('ActionBar markup', () => {
  it('renders no bar while closed, only the empty live region, so opening just changes its text', () => {
    for (const props of [{ open: false, label: 'x' }, { label: 'x' }]) {
      const tree = registry.ActionBar(props);
      assert.equal(barOf(tree), undefined);
      const regions = byClass(tree, 'hy-sr');
      assert.equal(regions.length, 1);
      assert.equal(regions[0].props.role, 'status');
      assert.equal(regions[0].props['aria-live'], 'polite');
      assert.equal(text(regions[0]), '');
    }
  });
  it('keeps the live region at the same position in the tree whether open or closed', () => {
    const last = (tree) => tree.children.at(-1);
    assert.ok(classes(last(registry.ActionBar({ open: false }))).includes('hy-sr'));
    assert.ok(classes(last(render({ label: 'x' }))).includes('hy-sr'));
    assert.equal(last(registry.ActionBar({ open: false })).props.key, last(render({ label: 'x' })).props.key);
  });
  it('shows the label, a separator and the actions slot while open', () => {
    const tree = render({ label: '3 unsaved changes', actions: 'ACTIONS', className: 'mine' });
    assert.ok(classes(barOf(tree)).includes('mine'));
    assert.equal(text(byClass(tree, 'hy-action-bar__label')[0]), '3 unsaved changes');
    assert.equal(text(byClass(tree, 'hy-action-bar__actions')[0]), 'ACTIONS');
    assert.deepEqual(rowParts(tree), ['label', 'sep', 'actions']);
    assert.equal(byClass(tree, 'hy-action-bar__sep')[0].props['aria-hidden'], 'true');
  });
  it('has no separator when there is nothing on one side of it', () => {
    assert.deepEqual(rowParts(render({ label: 'x' })), ['label']);
    assert.deepEqual(rowParts(render({ actions: 'ACTIONS' })), ['actions']);
  });
  it('has no close button without onClose, and puts one named Close or closeLabel at the end with it', () => {
    assert.equal(buttons(render({ label: 'x' })).length, 0);
    const tree = render({ label: 'x', actions: 'A', onClose: () => {} });
    assert.equal(byLabel(tree, 'Close').props.variant, 'tertiary');
    assert.equal(rowParts(tree).at(-1), 'close');
    assert.ok(byLabel(render({ label: 'x', onClose: () => {}, closeLabel: 'Dismiss' }), 'Dismiss'));
  });
  it('calls onClose from the close button', () => {
    let n = 0;
    byLabel(render({ onClose: () => { n++; } }), 'Close').props.onClick();
    assert.equal(n, 1);
  });

  describe('tone', () => {
    for (const tone of ['success', 'info', 'warning', 'error', 'neutral']) {
      it(`draws a ${tone} dot before the label`, () => {
        const label = byClass(render({ label: 'x', tone }), 'hy-action-bar__label')[0];
        const dot = label.children[0];
        assert.ok(classes(dot).includes('hy-action-bar__dot'));
        assert.ok(classes(dot).includes('hy-action-bar__dot--' + tone));
        assert.equal(dot.props['aria-hidden'], 'true');
      });
    }
    it('has no dot without a tone, or with an unknown one', () => {
      assert.equal(byClass(render({ label: 'x' }), 'hy-action-bar__dot').length, 0);
      assert.equal(byClass(render({ label: 'x', tone: 'loud' }), 'hy-action-bar__dot').length, 0);
    });
    it('shows the error tone while there is an error, whatever the tone', () => {
      for (const tone of [undefined, 'warning']) {
        const dot = byClass(render({ label: 'x', tone, error: 'Oops.' }), 'hy-action-bar__dot')[0];
        assert.ok(classes(dot).includes('hy-action-bar__dot--error'));
      }
    });
  });

  describe('selection', () => {
    const calls = [];
    const selection = { count: 3, total: 8, onSelectAll: () => calls.push('all'), onClear: () => calls.push('clear') };
    it('renders the count chip with its clear button, Select All, a separator, then the actions', () => {
      const tree = render({ selection, label: 'ignored', actions: 'ACTIONS' });
      const chip = byClass(tree, 'hy-action-bar__count')[0];
      assert.equal(text(byClass(chip, 'hy-action-bar__count-text')[0]), '3 selected');
      assert.equal(byClass(tree, 'hy-action-bar__label').length, 0, 'the chip replaces the label');
      const clear = byLabel(chip, 'Clear Selection');
      assert.ok(clear, 'the × is inside the chip');
      assert.equal(clear.props.size, 'tiny');
      assert.deepEqual(rowParts(tree), ['count', 'Select All 8', 'sep', 'actions']);
      assert.ok(!names(tree).includes('Clear'), 'no separate Clear button');
      buttons(tree).find((b) => text(b) === 'Select All 8').props.onClick();
      clear.props.onClick();
      assert.deepEqual(calls, ['all', 'clear']);
    });
    it('draws Select All as a quiet button', () => {
      const all = buttons(render({ selection })).find((b) => text(b) === 'Select All 8');
      assert.ok(classes(all).includes('hy-action-bar__quiet'));
      assert.equal(all.props.variant, 'tertiary');
    });
    it('hides Select All when every row is selected', () => {
      assert.deepEqual(names(render({ selection: { ...selection, count: 8 } })), ['Clear Selection']);
    });
    it('hides Select All without onSelectAll', () => {
      assert.deepEqual(names(render({ selection: { count: 1, total: 8, onClear() {} } })), ['Clear Selection']);
    });
  });

  describe('secondaryActions', () => {
    it('shows quiet text buttons after the separator and before the actions', () => {
      const calls = [];
      const tree = render({ label: 'x', actions: 'ACTIONS',
        secondaryActions: [{ label: 'Unmonitor', onSelect: () => calls.push('u') }, { label: 'Export', onSelect() {}, disabled: true }] });
      assert.deepEqual(rowParts(tree), ['label', 'sep', 'Unmonitor', 'Export', 'actions']);
      const [u, e] = buttons(tree);
      assert.ok(classes(u).includes('hy-action-bar__quiet'));
      assert.equal(e.props.disabled, true);
      u.props.onClick();
      assert.deepEqual(calls, ['u']);
      assert.equal(menus(tree).length, 0, 'no More menu while wide');
    });
  });

  describe('narrow', () => {
    const selection = { count: 3, total: 8, onSelectAll() {}, onClear() {} };
    it('marks the bar narrow and folds Select All and the secondary actions into a More menu', () => {
      const calls = [];
      const tree = renderNarrow({ selection: { ...selection, onSelectAll: () => calls.push('all') }, actions: 'ACTIONS',
        secondaryActions: [{ label: 'Unmonitor', onSelect: () => calls.push('u') }, { label: 'Export', onSelect() {}, disabled: true }] });
      assert.ok(classes(barOf(tree)).includes('hy-action-bar--narrow'));
      assert.deepEqual(rowParts(tree), ['count', 'sep', 'more', 'actions']);
      const trigger = walk(tree).find((n) => n.type === 'MenuButton');
      assert.equal(trigger.props['aria-label'], 'More Actions');
      const items = walk(tree).filter((n) => n.type === 'MenuItem');
      assert.deepEqual(items.map(text), ['Select All 8', 'Unmonitor', 'Export']);
      assert.equal(items[2].props.disabled, true);
      items[0].props.onSelect(); items[1].props.onSelect();
      assert.deepEqual(calls, ['all', 'u']);
      assert.ok(!buttons(tree).some((b) => text(b) === 'Select All 8'), 'no Select All button beside the menu');
    });
    it('keeps the count chip with its clear button visible', () => {
      assert.ok(byLabel(byClass(renderNarrow({ selection }), 'hy-action-bar__count')[0], 'Clear Selection'));
    });
    it('has no More menu when there is nothing to fold', () => {
      assert.equal(menus(renderNarrow({ selection: { ...selection, count: 8 }, actions: 'A' })).length, 0);
      assert.equal(menus(renderNarrow({ label: 'x', actions: 'A' })).length, 0);
    });
    it('is not narrow by default', () => assert.ok(!classes(barOf(render({ label: 'x' }))).includes('hy-action-bar--narrow')));
    it('groups the separator, the controls and the close button after the lead, so they wrap together', () => {
      const tree = renderNarrow({ label: 'x', actions: 'A', onClose() {} });
      const row = rowOf(tree);
      assert.deepEqual(row.children.map((c) => classes(c)[0]), ['hy-action-bar__label', 'hy-action-bar__controls']);
      const group = byClass(tree, 'hy-action-bar__controls')[0];
      assert.deepEqual(group.children.map((c) => classes(c)[0]), ['hy-action-bar__sep', 'hy-action-bar__actions', 'hy-action-bar__close']);
    });
  });

  describe('error', () => {
    const message = 'Couldn’t save. Check your connection and try again.';
    it('shows the error as a line above the row and keeps the bar open', () => {
      const tree = render({ label: '3 unsaved changes', error: message });
      const surface = byClass(tree, 'hy-action-bar__surface')[0];
      const err = byClass(tree, 'hy-action-bar__error')[0];
      assert.equal(surface.children[0], err, 'the error comes before the row');
      assert.equal(text(err), message);
      assert.equal(err.props.title, undefined, 'no title fallback: the text is never cut short');
      assert.ok(byClass(tree, 'hy-action-bar__label')[0]);
    });
    it('bolds the first sentence of a string error', () => {
      const b = walk(render({ label: 'x', error: message })).find((n) => n.type === 'b');
      assert.equal(text(b), 'Couldn’t save.');
      assert.equal(walk(render({ label: 'x', error: 'One sentence only' })).filter((n) => n.type === 'b').length, 0);
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
    it('is accepted and does nothing: no class, and the prop does not leak', () => {
      const plain = barOf(render({ label: 'x' })), opaque = barOf(render({ label: 'x', opaque: true }));
      assert.deepEqual(classes(opaque), classes(plain));
      assert.equal(opaque.props.opaque, undefined);
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
    assert.match(bar, /--hy-action-bar-offset:[^;]*var\(--tab-bar-height/);
    assert.match(bar, /--hy-action-bar-offset:[^;]*env\(safe-area-inset-bottom/);
    assert.match(bar, /(?:^|[;\s])bottom:\s*var\(--hy-action-bar-offset\)/);
  });
  it('keeps clear room below itself equal to its sticky offset, so the last row clears it at the end of the scroll', () => {
    const bar = rule('.hy-action-bar');
    const offset = (prop) => bar.match(new RegExp('(?:^|[;\\s])' + prop + ':\\s*([^;]+);'))[1].trim();
    assert.equal(offset('bottom'), 'var(--hy-action-bar-offset)');
    assert.match(bar, /margin:[^;]*var\(--hy-action-bar-offset\);/);
  });
  it('centres a capsule that hugs its content and never outgrows the container', () => {
    assert.match(rule('.hy-action-bar'), /justify-content:\s*center/);
    const s = rule('.hy-action-bar__surface');
    assert.match(s, /max-width:\s*100%/);
    assert.match(s, /border-radius:\s*var\(--radius-2xl\)/);
    assert.match(rule('.hy-action-bar--narrow .hy-action-bar__surface'), /width:\s*100%/);
  });
  it('is a solid inverted surface, with no blur', () => {
    const s = rule('.hy-action-bar__surface');
    assert.match(s, /--hy-ab-bg:\s*var\(--gray-1000\)/);
    assert.match(s, /--hy-ab-fg:\s*var\(--background-100\)/);
    assert.match(s, /background-color:\s*var\(--hy-ab-bg\)/);
    assert.match(s, /(?:^|[;\s])color:\s*var\(--hy-ab-fg\)/);
    assert.match(s, /box-shadow:\s*var\(--shadow-menu\)/);
    assert.doesNotMatch(css, /backdrop-filter/);
  });
  it('never cuts the label or the error short', () => {
    assert.doesNotMatch(css, /text-overflow:\s*ellipsis/);
    assert.doesNotMatch(rule('.hy-action-bar__error'), /white-space:\s*nowrap/);
    assert.match(rule('.hy-action-bar--narrow .hy-action-bar__controls'), /margin-left:\s*auto/);
    assert.match(rule('.hy-action-bar--stacked .hy-action-bar__sep'), /visibility:\s*hidden/);
  });
  it('draws the count chip with a dashed hairline in the inverted line colour', () => {
    assert.match(rule('.hy-action-bar__count'), /border:\s*1px dashed var\(--hy-ab-line\)/);
  });
  it('colours the dots with the StatusDot tones', () => {
    assert.match(rule('.hy-action-bar__dot--success'), /var\(--green-700\)/);
    assert.match(rule('.hy-action-bar__dot--info'), /var\(--blue-700\)/);
    assert.match(rule('.hy-action-bar__dot--warning'), /var\(--amber-700\)/);
    assert.match(rule('.hy-action-bar__dot--error'), /var\(--red-800\)/);
    assert.match(rule('.hy-action-bar__dot--neutral'), /var\(--gray-700\)/);
  });
  it('keeps 32px buttons and grows their hit area to the touch target under touch sizing', () => {
    const touch = atRule('@media (pointer: coarse), (max-width: 639px)');
    assert.ok(touch, 'a touch sizing block');
    assert.match(touch, /height:\s*32px/);
    assert.match(touch, /::after\s*\{[^}]*inset:\s*min\(0px,\s*calc\(\(100% - var\(--touch-target\)\) \/ 2\)\)/);
    assert.match(touch, /width:\s*var\(--touch-target\)/);
  });
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
