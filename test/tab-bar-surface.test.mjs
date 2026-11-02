// Tests for TabBar's translucent surface and its `opaque` prop (hyprsh/design#77).
// TabBar.js is plain script that runs in the bundle's scope, so it runs here in a vm context with stubs.
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
    createContext: () => ({ Provider: 'Provider' }),
    useContext: () => null,
    Children: { toArray: (c) => [].concat(c == null ? [] : c).flat() },
    isValidElement: (e) => !!e && typeof e === 'object',
    cloneElement: (e, p) => ({ ...e, props: { ...e.props, ...p } }),
  },
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
  cx: (...a) => a.filter(Boolean).join(' '),
  useControllable: (v, d) => [v !== undefined ? v : d, () => {}],
  useState: (v) => [v, () => {}],
  useEffect: () => {},
  useRef: () => ({ current: null }),
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(join(src, 'TabBar.js'), 'utf8'), context, { filename: 'TabBar.js' });
const render = (props) => registry.TabBar({ label: 'Screens', ...props });

const css = readFileSync(join(src, 'TabBar.css'), 'utf8');
/* The declaration block of the first rule whose selector list matches `sel`, found inside `scope` (the whole file by default). */
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
const SOLID_SURFACE = /--hy-tabbar-surface:\s*var\(--background-100\)/;
const NO_FILTER = /--hy-tabbar-filter:\s*none/;
const NO_GAP = /--hy-tabbar-gap:\s*0px/;
const SURFACE_AND_FILTER = '.hy-tabbar__capsule, .hy-tabbar__accessory';
const BADGES = '.hy-tabbar__badge--dot, .hy-tabbar__badge--count';

describe('TabBar opaque prop', () => {
  it('has no opaque class by default', () => {
    assert.ok(!render({}).props.className.includes('hy-tabbar--opaque'));
    assert.ok(!render({ opaque: false }).props.className.includes('hy-tabbar--opaque'));
  });
  it('adds hy-tabbar--opaque to the nav and does not leak the prop as an attribute', () => {
    const nav = render({ opaque: true });
    assert.equal(nav.type, 'nav');
    assert.ok(nav.props.className.split(' ').includes('hy-tabbar--opaque'));
    assert.equal(nav.props.opaque, undefined);
    assert.equal(render({}).props.opaque, undefined);
  });
});

describe('TabBar translucent surface (CSS)', () => {
  const bar = rule('.hy-tabbar');
  it('defines the surface variable as a color-mix of background-100 on .hy-tabbar', () => {
    assert.match(bar, /--hy-tabbar-surface:\s*color-mix\(in srgb,\s*var\(--background-100\)\s*\d+%,\s*transparent\)/);
  });
  it('defines the filter variable as blur and saturate', () => {
    assert.match(bar, /--hy-tabbar-filter:\s*blur\([^)]+\)\s*saturate\([^)]+\)/);
  });
  it('fills the capsule and accessory with the surface and applies the filter in both backdrop-filter forms', () => {
    const decls = rule(SURFACE_AND_FILTER);
    assert.match(decls, /background-color:\s*var\(--hy-tabbar-surface\)/);
    assert.match(decls, /-webkit-backdrop-filter:\s*var\(--hy-tabbar-filter\)/);
    assert.match(decls, /(?<!-)backdrop-filter:\s*var\(--hy-tabbar-filter\)/);
    assert.match(decls, /0 0 0 1px var\(--gray-alpha-400\),\s*var\(--shadow-menu\)/);
  });
  it('uses no hex colours', () => assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i));

  /* Each fallback only resets the variables, on the selector it is written against. */
  const fallbacks = [
    { name: '.hy-tabbar--opaque', scope: css, selector: '.hy-tabbar--opaque' },
    { name: 'prefers-reduced-transparency: reduce', scope: atRule('@media (prefers-reduced-transparency: reduce)'), selector: '.hy-tabbar' },
    { name: '@supports not backdrop-filter', scope: atRule('@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))'), selector: '.hy-tabbar' },
  ];
  for (const { name, scope, selector } of fallbacks) {
    it(`restores the solid surface, no filter and no badge gap: ${name}`, () => {
      assert.ok(scope, 'the rule exists');
      const resets = rule(selector, scope);
      assert.match(resets, SOLID_SURFACE);
      assert.match(resets, NO_FILTER);
      assert.match(resets, NO_GAP);
    });
  }
  it('does not gate the translucent look on prefers-reduced-transparency: no-preference', () => {
    assert.doesNotMatch(css, /prefers-reduced-transparency:\s*no-preference/);
  });

  describe('badge separation', () => {
    const gap = (decls) => Number(decls.match(/--hy-tabbar-gap:\s*(\d+)px/)[1]);
    const ringSpread = (gapPx) => {
      const m = rule(BADGES).match(/box-shadow:\s*0 0 0 calc\((\d+)px - var\(--hy-tabbar-gap\)\) var\(--background-100\)/);
      assert.ok(m, 'the ring is background-100 with a spread that depends on the gap');
      return Number(m[1]) - gapPx;
    };
    it('draws no ring on the translucent bar and the solid 2px ring when the gap is reset', () => {
      assert.equal(ringSpread(gap(rule('.hy-tabbar'))), 0);
      assert.equal(ringSpread(gap(rule('.hy-tabbar--opaque'))), 2);
      for (const { scope, selector } of fallbacks) assert.equal(ringSpread(gap(rule(selector, scope))), 2);
    });
    it('never stacks the translucent surface into a ring', () => {
      assert.doesNotMatch(rule(BADGES), /box-shadow:[^;]*--hy-tabbar-surface/);
    });
    for (const kind of ['dot', 'count']) {
      it(`cuts the icon glyph around the ${kind}, scaled by the gap, in both mask forms`, () => {
        const mask = rule(`.hy-tabbar__icon:has(.hy-tabbar__badge--${kind}) > :not(.hy-tabbar__badge)`);
        assert.ok(mask, 'the mask rule exists');
        for (const prop of ['-webkit-mask-image', '(?<!-)mask-image'])
          assert.match(mask, new RegExp(prop + ':\\s*radial-gradient\\(circle at [^,]+,\\s*transparent calc\\(\\d+px \\+ var\\(--hy-tabbar-gap\\)\\),\\s*var\\(--black\\) calc\\(\\d+px \\+ var\\(--hy-tabbar-gap\\)\\)\\)'));
      });
    }
  });

  it('tints the accessory hover through a gray-alpha variable layered over the surface', () => {
    assert.match(rule('.hy-tabbar__accessory:hover'), /^\s*--hy-tabbar-tint:\s*var\(--gray-alpha-100\);\s*$/);
    assert.doesNotMatch(css, /--gray-100\b/);
    const accessory = rule('.hy-tabbar__accessory', css.slice(css.indexOf('\n.hy-tabbar__accessory {')));
    assert.match(accessory, /background-image:\s*linear-gradient\(var\(--hy-tabbar-tint\),\s*var\(--hy-tabbar-tint\)\)/);
    assert.match(accessory, /transition:\s*--hy-tabbar-tint\b/);
    assert.match(css, /@property --hy-tabbar-tint\s*\{[^}]*syntax:\s*"<color>"/);
  });
});
