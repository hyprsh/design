// Tests for Pane and SplitView's markup and CSS (hyprsh/design#84). Their .js files are plain script that runs in the
// bundle's scope, so they run here in a vm context with stubs. Layout, scrolling and the phone behaviour are in
// split-view-dom.test.mjs.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const src = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src');
const registry = {};
const context = vm.createContext({
  React: { Children: { toArray: (c) => [].concat(c == null ? [] : c).flat().filter((x) => x != null && x !== false) } },
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter((c) => c != null && c !== false) }),
  cx: (...a) => a.filter(Boolean).join(' '),
  define: (name, fn) => { registry[name] = fn; },
});
for (const f of ['Pane', 'SplitView']) vm.runInContext(readFileSync(join(src, f + '.js'), 'utf8'), context, { filename: f + '.js' });

const walk = (node, out = []) => {
  if (!node || typeof node !== 'object') return out;
  out.push(node);
  (node.children || []).forEach((c) => walk(c, out));
  return out;
};
const classes = (node) => String((node.props && node.props.className) || '').split(' ');
const byClass = (tree, cls) => walk(tree).filter((n) => classes(n).includes(cls));
const text = (node) => (typeof node === 'string' ? node : node && node.children ? node.children.map(text).join('') : '');

describe('Pane markup', () => {
  it('is a header, a body and a footer, in that order, with the extras only when given', () => {
    const tree = registry.Pane({ header: 'H', footer: 'F', children: 'B' });
    assert.ok(classes(tree).includes('hy-pane'));
    assert.deepEqual(tree.children.map((c) => classes(c)[0]), ['hy-pane__header', 'hy-pane__body', 'hy-pane__footer']);
    assert.deepEqual(tree.children.map(text), ['H', 'B', 'F']);
    const bare = registry.Pane({ children: 'B' });
    assert.deepEqual(bare.children.map((c) => classes(c)[0]), ['hy-pane__body']);
  });
  it('makes the body a focusable region, named by label', () => {
    const body = byClass(registry.Pane({ label: 'Deployments', children: 'B' }), 'hy-pane__body')[0];
    assert.equal(body.props.tabIndex, 0);
    assert.equal(body.props.role, 'region');
    assert.equal(body.props['aria-label'], 'Deployments');
  });
  it('is focusable but not a landmark without a label', () => {
    const body = byClass(registry.Pane({ children: 'B' }), 'hy-pane__body')[0];
    assert.equal(body.props.tabIndex, 0);
    assert.equal(body.props.role, undefined);
    assert.equal(body.props['aria-label'], undefined);
  });
  it('passes className and style to the root', () => {
    const tree = registry.Pane({ className: 'mine', style: { color: 'red' }, children: 'B' });
    assert.ok(classes(tree).includes('mine'));
    assert.deepEqual(tree.props.style, { color: 'red' });
  });
});

describe('SplitView markup', () => {
  const two = ['LIST', 'DETAIL'];
  it('wraps the two children as the list and the detail', () => {
    const tree = registry.SplitView({ children: two });
    assert.ok(classes(tree).includes('hy-split-view'));
    assert.equal(text(byClass(tree, 'hy-split-view__list')[0]), 'LIST');
    assert.equal(text(byClass(tree, 'hy-split-view__detail')[0]), 'DETAIL');
  });
  it('shows the list by default and the detail with show="detail"', () => {
    assert.ok(classes(registry.SplitView({ children: two })).includes('hy-split-view--show-list'));
    assert.ok(classes(registry.SplitView({ children: two, show: 'detail' })).includes('hy-split-view--show-detail'));
    assert.ok(classes(registry.SplitView({ children: two, show: 'nonsense' })).includes('hy-split-view--show-list'));
  });
  it('sets the list width as a variable: 320px by default, a number as px, a string as given', () => {
    const w = (p) => registry.SplitView({ children: two, ...p }).props.style['--hy-split-list-width'];
    assert.equal(w({}), '320px');
    assert.equal(w({ listWidth: 280 }), '280px');
    assert.equal(w({ listWidth: '30%' }), '30%');
  });
  it('merges style and className', () => {
    const tree = registry.SplitView({ children: two, className: 'mine', style: { height: '100dvh' } });
    assert.ok(classes(tree).includes('mine'));
    assert.equal(tree.props.style.height, '100dvh');
    assert.equal(tree.props.style['--hy-split-list-width'], '320px');
  });
});

const read = (n) => readFileSync(join(src, n + '.css'), 'utf8');
/* The declarations of every rule whose selector list includes `sel`, joined. */
const rule = (css, sel) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\>]/g, '\\$&');
  const re = new RegExp('(?:^|[}\\s,])' + esc + '\\s*[,{]', 'g');
  const out = [];
  for (let m; (m = re.exec(css));) {
    const open = css.indexOf('{', m.index + m[0].length - 1);
    const close = css.indexOf('}', open);
    if (open >= 0 && close > open && !css.slice(m.index + m[0].length - 1, open).includes('}')) out.push(css.slice(open + 1, close));
  }
  return out.join(' ');
};
const atRule = (css, prelude) => {
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

describe('Pane CSS', () => {
  const css = read('Pane');
  it('opens with the component banner and uses no hex colours', () => {
    assert.match(css, /^\/\* ---------- Pane ---------- \*\//);
    assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
  });
  it('fills its container as a column, with a body that scrolls on its own', () => {
    const pane = rule(css, '.hy-pane');
    assert.match(pane, /display:\s*flex/);
    assert.match(pane, /flex-direction:\s*column/);
    assert.match(pane, /height:\s*100%/);
    assert.match(pane, /background(-color)?:\s*var\(--hy-pane-background,\s*var\(--background-100\)\)/);
    const body = rule(css, '.hy-pane__body');
    assert.match(body, /flex:\s*1 1 0/);
    assert.match(body, /min-height:\s*0/);
    assert.match(body, /overflow-y:\s*auto/);
  });
  it('divides the header and footer from the body with hairlines and never shrinks them', () => {
    assert.match(rule(css, '.hy-pane__header'), /border-bottom:\s*1px solid var\(--gray-alpha-400\)/);
    assert.match(rule(css, '.hy-pane__footer'), /border-top:\s*1px solid var\(--gray-alpha-400\)/);
    assert.match(rule(css, '.hy-pane__header'), /flex:\s*none/);
    assert.match(rule(css, '.hy-pane__footer'), /flex:\s*none/);
  });
  it('shows a focus ring on the body', () => {
    assert.match(rule(css, '.hy-pane__body:focus-visible'), /outline:\s*2px solid var\(--focus-color\)/);
  });
});

describe('SplitView CSS', () => {
  const css = read('SplitView');
  it('opens with the component banner and uses no hex colours', () => {
    assert.match(css, /^\/\* ---------- SplitView ---------- \*\//);
    assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
  });
  it('fills its container, with the list at --hy-split-list-width beside the detail', () => {
    const root = rule(css, '.hy-split-view');
    assert.match(root, /display:\s*grid/);
    assert.match(root, /height:\s*100%/);
    assert.match(root, /grid-template-columns:\s*var\(--hy-split-list-width,\s*320px\)\s+minmax\(0,\s*1fr\)/);
  });
  it('divides the detail from the list', () => {
    assert.match(rule(css, '.hy-split-view__detail'), /border-left:\s*1px solid var\(--gray-alpha-400\)/);
  });
  describe('below sm', () => {
    const phone = atRule(css, '@media (max-width: 639px)');
    it('stacks the panes in one cell and hides the other with visibility, so it keeps its scroll position', () => {
      assert.ok(phone, 'a max-width: 639px block');
      assert.match(rule(phone, '.hy-split-view'), /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
      assert.match(rule(phone, '.hy-split-view--show-list > .hy-split-view__detail'), /visibility:\s*hidden/);
      assert.match(rule(phone, '.hy-split-view--show-detail > .hy-split-view__list'), /visibility:\s*hidden/);
      assert.doesNotMatch(phone, /display:\s*none/);
    });
    it('drops the divider', () => {
      assert.match(rule(phone, '.hy-split-view__detail'), /border-left:\s*0/);
    });
  });
  it('has no transitions or animations', () => assert.doesNotMatch(css, /transition|animation/));
});
