// Tests for Pill as a Popover trigger, with a state dot and a trailing figure (hyprsh/design#83).
// The first half runs Pill.js in a vm context with stub globals and reads the tree it returns. The second half mounts it
// with the built bundle and React 18 in headless Chrome: Popover clones its trigger with a `ref`, which only reaches the
// button if Pill forwards it. Needs network access for React (a CDN) and Chrome (see scripts/chrome.mjs); without Chrome
// that half is skipped, or fails when CI is set.
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { build } from '../scripts/build.mjs';
import { handler } from '../scripts/dev.mjs';
import { openChrome, CHROME } from '../scripts/chrome.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const registry = {};
const FORWARD_REF = Symbol('forwardRef');
const context = vm.createContext({
  HY: new Proxy({}, { get: (t, k) => (k in t ? t[k] : String(k)) }),
  React: { forwardRef: (render) => Object.assign((props, ref) => render(props, ref), { [FORWARD_REF]: true }) },
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity).filter((c) => c != null && c !== false) }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  Glyph: 'Glyph',
  useControllable: (value, def, onChange) => [value === undefined ? def : value, onChange || (() => {})],
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(join(root, 'project/components/src/Pill.js'), 'utf8'), context, { filename: 'Pill.js' });
const Pill = registry.Pill;
const css = readFileSync(join(root, 'project/components/src/Pill.css'), 'utf8');
const render = (props, ref = null) => Pill(props, ref);
function walk(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  out.push(node);
  for (const c of node.children || []) walk(c, out);
  return out;
}
const byClass = (tree, cls) => walk(tree).find((n) => n.props && String(n.props.className || '').split(' ').includes(cls));
const text = (n) => (typeof n === 'string' ? n : n.children.map(text).join(''));

describe('Pill ref', () => {
  it('is a forwardRef component, so Popover can clone its trigger with a ref', () => {
    assert.equal(Pill[FORWARD_REF], true);
  });
  it('puts the ref on the button, the link and the span it renders', () => {
    const ref = { current: null };
    assert.equal(render({ onClick() {}, children: 'A' }, ref).props.ref, ref);
    assert.equal(render({ href: '#', children: 'A' }, ref).props.ref, ref);
    assert.equal(render({ children: 'A' }, ref).props.ref, ref);
    assert.equal(render({ pressed: true, children: 'A' }, ref).props.ref, ref);
  });
  it('renders the same markup as before apart from the ref', () => {
    const link = render({ href: '#x', size: 'sm', children: 'Log' }, { current: null });
    const { ref, ...rest } = link.props;
    assert.deepEqual(rest, { href: '#x', className: 'hy-pill hy-pill--small' });
    assert.deepEqual(link.children.map((c) => c.props.className), ['hy-pill__label']);
    const button = render({ onClick() {}, children: 'Go' });
    assert.equal(button.type, 'button');
    assert.equal(button.props.type, 'button');
    assert.equal(render({ href: '#', icon: 'I', children: 'A' }).children[0].props.className, 'hy-pill__icon');
    assert.equal(render({ pressed: true, children: 'A' }).children[0].props.className, 'hy-pill__icon');
  });
  it('passes aria-expanded through to the element', () => {
    assert.equal(render({ onClick() {}, 'aria-expanded': true, children: 'A' }).props['aria-expanded'], true);
  });
});

describe('Pill status', () => {
  it('draws a leading StatusDot with no label, in a slot that scales with the pill size', () => {
    for (const size of ['sm', 'md', 'lg']) {
      const p = render({ status: 'building', size, children: 'STD' });
      const slot = byClass(p, 'hy-pill__status');
      assert.equal(p.children[0], slot);
      assert.equal(slot.children[0].type, 'StatusDot');
      assert.equal(slot.children[0].props.state, 'building');
      assert.equal(slot.children[0].props.label, false);
    }
    for (const cls of ['hy-pill--small', 'hy-pill--large']) assert.match(css, new RegExp(cls + ' \\.hy-pill__status'));
  });
  it('puts statusLabel into the accessible name between the label and the trailing figure, and hides the dot', () => {
    const p = render({ status: 'building', statusLabel: 'Downloading', trailing: '54/56', children: 'STD' });
    assert.equal(String(walk(p).find((n) => n.type === 'StatusDot').props['aria-hidden']), 'true');
    const named = p.children.filter((c) => !c.props.className.includes('hy-pill__status'));
    assert.deepEqual(named.map((c) => c.props.className), ['hy-pill__label', 'hy-sr', 'hy-pill__trailing']);
    assert.equal(named.map(text).join(' ').replace(/ ,/g, ','), 'STD, Downloading 54/56');
  });
  it('always hides the dot from assistive tech, with or without statusLabel', () => {
    for (const props of [{ status: 'error' }, { status: 'error', statusLabel: 'Failed' }]) {
      const p = render({ ...props, children: 'STD' });
      const dot = walk(p).find((n) => n.type === 'StatusDot');
      assert.equal(String(dot.props['aria-hidden']), 'true');
      assert.equal(dot.props.title, null);
    }
    assert.equal(byClass(render({ status: 'error', children: 'STD' }), 'hy-sr'), undefined);
  });
  it('passes statusVariant to the StatusDot, filled unless set', () => {
    const dot = (props) => walk(render({ status: 'neutral', children: 'A', ...props })).find((n) => n.type === 'StatusDot');
    assert.equal(dot({}).props.variant, undefined);
    assert.equal(dot({ statusVariant: 'outline' }).props.variant, 'outline');
    assert.equal(dot({ statusVariant: 'dashed' }).props.variant, 'dashed');
    assert.equal(dot({ statusVariant: 'outline' }).props.state, 'neutral');
    assert.equal(walk(render({ statusVariant: 'outline', children: 'A' })).find((n) => n.type === 'StatusDot'), undefined);
  });
  it('wins over icon, and draws no slot without status', () => {
    const p = render({ status: 'ready', icon: 'ICON', children: 'A' });
    assert.equal(byClass(p, 'hy-pill__icon'), undefined);
    assert.equal(walk(p).some((n) => n.children && n.children.includes('ICON')), false);
    assert.equal(byClass(render({ icon: 'ICON', children: 'A' }), 'hy-pill__icon').children[0], 'ICON');
    assert.equal(byClass(render({ children: 'A' }), 'hy-pill__status'), undefined);
  });
  it('does not pass status, statusLabel or trailing on to the element', () => {
    const { props } = render({ status: 'ready', statusLabel: 'Ready', trailing: '1', children: 'A' });
    for (const k of ['status', 'statusLabel', 'trailing']) assert.equal(k in props, false, k);
  });
});

describe('Pill trailing', () => {
  it('draws after the label, as text', () => {
    const p = render({ trailing: '40%', children: 'Disk' });
    assert.deepEqual(p.children.map((c) => c.props.className), ['hy-pill__label', 'hy-pill__trailing']);
    assert.equal(text(p.children[1]), '40%');
  });
  it('draws nothing without it', () => {
    assert.equal(byClass(render({ children: 'Disk' }), 'hy-pill__trailing'), undefined);
  });
  it('is styled in tabular numbers and a quieter colour', () => {
    const rule = css.match(/\.hy-pill__trailing\s*\{[^}]*\}/)[0];
    assert.match(rule, /font-variant-numeric:\s*tabular-nums/);
    assert.match(rule, /color:\s*var\(--gray-900\)/);
  });
});

describe('Pill expanded', () => {
  it('is drawn in the pressed style, and draws no check', () => {
    assert.match(css, /\.hy-pill\[aria-expanded="true"\][^{]*\{[^}]*box-shadow:\s*inset 0 0 0 1px var\(--gray-1000\)/);
    const p = render({ onClick() {}, 'aria-expanded': true, children: 'A' });
    assert.equal(byClass(p, 'hy-pill__icon'), undefined);
    assert.equal(walk(p).some((n) => n.type === 'Glyph'), false);
  });
});

const canRun = existsSync(CHROME);
const skipNoChrome = !canRun && !process.env.CI && 'Chrome not found';
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const PAGE = `<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/project/components/bundle.css">
<script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.development.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="/project/components/bundle.js"></script></head><body style="margin:0">
<div id="root"></div><script>
var H = window.Hyprsh, h = React.createElement;
ReactDOM.createRoot(document.getElementById('root')).render(h('div', { style: { padding: 40 } },
  h(H.Popover, { label: 'Downloads', trigger: h(H.Pill, { id: 'pill', status: 'building', statusLabel: 'Downloading', trailing: '54/56' }, 'STD') },
    h(H.Button, { id: 'inside' }, 'Pause'))));
</script></body></html>`;

describe('Pill as a Popover trigger, React 18', { skip: skipNoChrome }, () => {
  let server, chrome;
  before(async () => {
    build();
    server = createServer((req, res) => {
      if (req.url.startsWith('/__t')) { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(PAGE); }
      return handler(req, res);
    });
    await new Promise((res) => server.listen(0, '127.0.0.1', res));
    chrome = await openChrome();
    await chrome.send('Page.enable');
    await chrome.goto(`http://127.0.0.1:${server.address().port}/__t`);
  });
  after(async () => {
    if (chrome) await chrome.close();
    if (server) server.close();
  });
  const ev = (js) => chrome.evaluate(js);
  async function until(js, what) {
    for (let i = 0; i < 40; i++) { if (await ev('!!(' + js + ')')) return; await sleep(50); }
    assert.fail('timed out waiting for ' + what);
  }
  it('opens the popover, carries aria-expanded, and takes focus back when it closes', async () => {
    await until('document.getElementById("pill")', 'the pill');
    assert.equal(await ev('document.getElementById("pill").getAttribute("aria-expanded")'), 'false');
    await ev('document.getElementById("pill").click()');
    await until('document.querySelector("[role=dialog]")', 'the popover');
    assert.equal(await ev('document.getElementById("pill").getAttribute("aria-expanded")'), 'true');
    await until('document.activeElement.id === "inside"', 'focus inside the popover');
    await chrome.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await chrome.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await until('!document.querySelector("[role=dialog]")', 'the popover to close');
    assert.equal(await ev('document.activeElement.id'), 'pill');
  });
});
