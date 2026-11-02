// Tests for TitleBar: the header of a phone-width screen (hyprsh/design#85).
// TitleBar.js is plain script that runs in the bundle's scope, so it runs here in a vm context with stubs.
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
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
  cx: (...a) => a.filter(Boolean).join(' '),
  Glyph: 'Glyph',
  HY: { Button: 'Button' },
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(join(src, 'TitleBar.js'), 'utf8'), context, { filename: 'TitleBar.js' });
const render = (props) => registry.TitleBar({ title: 'Projects', ...props });

/* Every node in the rendered tree, depth first. */
const all = (n) => (n && typeof n === 'object' ? [n, ...(n.children || []).flatMap(all)] : []);
const byClass = (tree, cls) => all(tree).filter((n) => (n.props.className || '').split(' ').includes(cls));
const text = (n) => (n && typeof n === 'object' ? (n.children || []).map(text).join('') : String(n ?? ''));

describe('TitleBar structure', () => {
  it('is a header whose class names the component', () => {
    const bar = render({});
    assert.equal(bar.type, 'header');
    assert.ok(bar.props.className.split(' ').includes('hy-titlebar'));
  });
  it('draws the title as an h1 by default and honours headingLevel', () => {
    assert.equal(byClass(render({}), 'hy-titlebar__title')[0].type, 'h1');
    for (const level of [1, 2, 3]) assert.equal(byClass(render({ headingLevel: level }), 'hy-titlebar__title')[0].type, 'h' + level);
  });
  it('puts the title in the heading', () => {
    assert.equal(text(byClass(render({ title: 'Domains' }), 'hy-titlebar__title')[0]), 'Domains');
  });
  it('keeps the three slots when only one has content, so the title stays centred', () => {
    const bar = render({});
    assert.equal(byClass(bar, 'hy-titlebar__leading').length, 1);
    assert.equal(byClass(bar, 'hy-titlebar__trailing').length, 1);
    assert.equal(byClass(bar, 'hy-titlebar__title').length, 1);
  });
  it('mirrors each side in the other as a hidden spacer, so both slots are as wide as the wider side', () => {
    const action = { type: 'Button', props: { 'aria-label': 'Share' }, children: [] };
    const bar = render({ back: {}, actions: action });
    const mirrors = byClass(bar, 'hy-titlebar__mirror');
    assert.equal(mirrors.length, 2);
    for (const m of mirrors) assert.equal(m.props['aria-hidden'], 'true');
    assert.ok(mirrors.some((m) => m.props.className.split(' ').includes('hy-titlebar__actions')), 'the mirrored actions are sized like the real ones');
    assert.ok(all(byClass(bar, 'hy-titlebar__leading')[0]).includes(action), 'the actions are mirrored in the leading slot');
    assert.ok(all(byClass(bar, 'hy-titlebar__trailing')[0]).some((n) => n.props.className === 'hy-titlebar__back'), 'the back button is mirrored in the trailing slot');
  });
  it('renders the actions in the trailing slot', () => {
    const action = { type: 'Button', props: { 'aria-label': 'Share' }, children: [] };
    const trailing = byClass(render({ actions: action }), 'hy-titlebar__trailing')[0];
    assert.ok(all(trailing).includes(action));
  });
  it('merges className and style onto the header', () => {
    const bar = render({ className: 'mine', style: { top: 4 } });
    assert.ok(bar.props.className.split(' ').includes('mine'));
    assert.deepEqual(bar.props.style, { top: 4 });
  });
});

describe('TitleBar back button', () => {
  const back = (props) => byClass(render({ back: props }), 'hy-titlebar__back')[0];
  it('has no back button without back', () => assert.equal(byClass(render({}), 'hy-titlebar__back').length, 0));
  it('is an icon-only Button named Back by default, with a chevron', () => {
    const b = back({});
    assert.equal(b.type, 'Button');
    assert.equal(b.props.svgOnly, true);
    assert.equal(b.props['aria-label'], 'Back');
    assert.ok(all(b).some((n) => n.type === 'Glyph' && n.props.name === 'chevron'));
  });
  it('takes its accessible name from back.label', () => assert.equal(back({ label: 'Projects' }).props['aria-label'], 'Projects'));
  it('passes onClick through', () => {
    const onClick = () => {};
    assert.equal(back({ onClick }).props.onClick, onClick);
  });
  it('is a link with href', () => assert.equal(back({ href: '/projects' }).props.href, '/projects'));
  it('has no href without one', () => assert.equal(back({}).props.href, undefined));
});

describe('TitleBar hideFrom', () => {
  it('hides from sm up by default', () => assert.ok(render({}).props.className.includes('hy-titlebar--hide-sm')));
  it('shows at every width with hideFrom={false}', () => assert.ok(!render({ hideFrom: false }).props.className.includes('hy-titlebar--hide-sm')));
});

describe('TitleBar opaque prop', () => {
  it('has no opaque class by default', () => {
    assert.ok(!render({}).props.className.includes('hy-titlebar--opaque'));
    assert.ok(!render({ opaque: false }).props.className.includes('hy-titlebar--opaque'));
  });
  it('adds hy-titlebar--opaque and does not leak the prop as an attribute', () => {
    const bar = render({ opaque: true });
    assert.ok(bar.props.className.split(' ').includes('hy-titlebar--opaque'));
    assert.equal(bar.props.opaque, undefined);
    assert.equal(render({}).props.opaque, undefined);
  });
});

const css = readFileSync(join(src, 'TitleBar.css'), 'utf8');
/* The declaration block of the first rule whose selector matches `sel`, found inside `scope` (the whole file by default). */
const rule = (sel, scope = css) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = scope.match(new RegExp('(?:^|[}\\s])' + esc + '\\s*\\{([^}]*)\\}'));
  return m ? m[1] : '';
};
/* The body of a block at-rule such as @media or @supports, matched by its prelude. */
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

describe('TitleBar CSS', () => {
  it('opens with its banner comment and uses no hex colours', () => {
    assert.ok(css.startsWith('/* ---------- TitleBar ---------- */'));
    assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
  });

  describe('position', () => {
    const bar = rule('.hy-titlebar');
    it('is sticky at the top of its scroll container', () => {
      assert.match(bar, /position:\s*sticky/);
      assert.match(bar, /top:\s*0/);
    });
    it('pads for the top safe area', () => assert.match(bar, /padding-top:\s*env\(safe-area-inset-top,\s*0px\)/));
    it('draws a hairline divider at the bottom edge', () => assert.match(bar, /border-bottom:\s*1px solid var\(--gray-alpha-400\)/));
    it('is hidden from sm up by default', () => {
      const hide = atRule('@media (min-width: 640px)');
      assert.match(rule('.hy-titlebar--hide-sm', hide), /display:\s*none/);
    });
  });

  describe('layout', () => {
    it('centres the title between two equal side columns', () => {
      assert.match(rule('.hy-titlebar__bar'), /grid-template-columns:\s*max-content\s+minmax\(0,\s*1fr\)\s+max-content/);
    });
    it('truncates the title with an ellipsis', () => {
      const title = rule('.hy-titlebar__title');
      assert.match(title, /overflow:\s*hidden/);
      assert.match(title, /text-overflow:\s*ellipsis/);
      assert.match(title, /white-space:\s*nowrap/);
      assert.match(title, /text-align:\s*center/);
    });
    it('hides the mirrors but keeps their width', () => {
      assert.match(rule('.hy-titlebar__mirror'), /visibility:\s*hidden/);
    });
    it('aligns the slots to their outer edges', () => {
      assert.match(rule('.hy-titlebar__leading'), /justify-self:\s*start/);
      assert.match(rule('.hy-titlebar__trailing'), /justify-self:\s*end/);
    });
  });

  describe('touch target', () => {
    it('sizes the back button and icon actions at --touch-target in both directions, at every width', () => {
      const decls = rule('.hy-titlebar .hy-titlebar__back, .hy-titlebar__actions .hy-btn--icon');
      assert.match(decls, /min-width:\s*var\(--touch-target\)/);
      assert.match(decls, /min-height:\s*var\(--touch-target\)/);
    });
    it('grows any other action to the touch target', () => {
      assert.match(rule('.hy-titlebar__actions .hy-btn'), /min-height:\s*var\(--touch-target\)/);
    });
  });

  describe('translucent surface', () => {
    const bar = rule('.hy-titlebar');
    it('defines the surface variable as a color-mix of background-100', () => {
      assert.match(bar, /--hy-titlebar-surface:\s*color-mix\(in srgb,\s*var\(--background-100\)\s*\d+%,\s*transparent\)/);
    });
    it('defines the filter variable as blur and saturate', () => {
      assert.match(bar, /--hy-titlebar-filter:\s*blur\([^)]+\)\s*saturate\([^)]+\)/);
    });
    it('fills the bar with the surface and applies the filter in both backdrop-filter forms', () => {
      assert.match(bar, /background-color:\s*var\(--hy-titlebar-surface\)/);
      assert.match(bar, /-webkit-backdrop-filter:\s*var\(--hy-titlebar-filter\)/);
      assert.match(bar, /(?<!-)backdrop-filter:\s*var\(--hy-titlebar-filter\)/);
    });
    const fallbacks = [
      { name: '.hy-titlebar--opaque', scope: css, selector: '.hy-titlebar--opaque' },
      { name: 'prefers-reduced-transparency: reduce', scope: atRule('@media (prefers-reduced-transparency: reduce)'), selector: '.hy-titlebar' },
      { name: '@supports not backdrop-filter', scope: atRule('@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))'), selector: '.hy-titlebar' },
    ];
    for (const { name, scope, selector } of fallbacks) {
      it(`restores the solid surface and no filter: ${name}`, () => {
        assert.ok(scope, 'the rule exists');
        const resets = rule(selector, scope);
        assert.match(resets, /--hy-titlebar-surface:\s*var\(--background-100\)/);
        assert.match(resets, /--hy-titlebar-filter:\s*none/);
      });
    }
    it('does not gate the translucent look on prefers-reduced-transparency: no-preference', () => {
      assert.doesNotMatch(css, /prefers-reduced-transparency:\s*no-preference/);
    });
  });
});
