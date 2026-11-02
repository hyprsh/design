// Tests for ActionBar's layout, focus and live-region behaviour (hyprsh/design#87), driven in headless Chrome: sticky
// positioning and focus need real layout and the built bundle. The markup and CSS rules are in action-bar.test.mjs.
// Needs network access for React (a CDN) and Chrome (see scripts/chrome.mjs); without Chrome the suite is skipped, or
// fails when CI is set.
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { build } from '../scripts/build.mjs';
import { handler } from '../scripts/dev.mjs';
import { openChrome, CHROME } from '../scripts/chrome.mjs';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const PAGE = `<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/project/components/bundle.css">
<script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.development.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="/project/components/bundle.js"></script></head><body style="margin:0">
<div id="root"></div><script>
var H = window.Hyprsh, h = React.createElement, F = React.Fragment;
var root = ReactDOM.createRoot(document.getElementById('root'));
function show(el) { root.render(el); }
var rows = Array.from({ length: 20 }, function (_, i) { return 'Row ' + (i + 1); });
/* A scroll container of rows with the bar as its last child. */
function Screen(props) {
  return h('div', { id: 'scroller', style: { height: props.height || 200, overflowY: 'auto', paddingBottom: props.tabbar ? 'var(--tab-bar-height)' : 0 } },
    rows.map(function (r) { return h('button', { key: r, className: 'row', style: { display: 'block', width: '100%', height: 40, boxSizing: 'border-box' }, id: 'row-' + r.slice(4) }, r); }),
    h(H.ActionBar, Object.assign({ open: true, label: '3 unsaved changes', actions: h(H.Button, { id: 'save', size: 'small' }, 'Save') }, props.bar)));
}
</script></body></html>`;

let server, chrome, port;
const canRun = existsSync(CHROME);
const skipNoChrome = !canRun && !process.env.CI && 'Chrome not found';
describe('Chrome', () => {
  it('is installed when CI is set', { skip: !process.env.CI && 'only enforced in CI' }, () => {
    assert.ok(canRun, 'Chrome not found at ' + CHROME + ': the Chrome-driven tests cannot run');
  });
});
before(async () => {
  if (!canRun) return;
  build();
  server = createServer((req, res) => {
    if (req.url.startsWith('/__t')) { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(PAGE); }
    return handler(req, res);
  });
  await new Promise((res) => server.listen(0, '127.0.0.1', res));
  port = server.address().port;
  chrome = await openChrome();
  await chrome.send('Page.enable');
  /* A headless page isn't focused, so it would not fire focus events. */
  await chrome.send('Emulation.setFocusEmulationEnabled', { enabled: true });
});
after(async () => {
  if (chrome) await chrome.close();
  if (server) server.close();
});

const ev = (js) => chrome.evaluate(js);
let loaded = false;
async function fresh() {
  if (!loaded) {
    await chrome.emulate({ width: 600, height: 700, scale: 1 });
    await chrome.goto(`http://127.0.0.1:${port}/__t`);
    loaded = true;
  }
  await ev('show(null)');
  await sleep(50);
}
async function until(js, what) {
  for (let i = 0; i < 60; i++) { if (await ev('!!(' + js + ')')) return; await sleep(50); }
  assert.fail('timed out waiting for ' + what);
}
const rectOf = (sel) => ev(`(function () { var r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { y: r.y, b: r.bottom, h: r.height, x: r.x, r: r.right }; })()`);
const active = () => ev(`document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : null`);
const spoken = () => ev(`document.querySelector('.hy-action-bar .hy-sr').textContent`);

describe('ActionBar', { concurrency: false, skip: skipNoChrome }, () => {
  before(fresh);

  it('is sticky at the foot of its scroll container while there is more above, and in the flow at the end', async () => {
    await fresh();
    await ev(`show(h(Screen))`);
    await until(`document.querySelector('.hy-action-bar')`, 'the bar');
    const box = await rectOf('#scroller'), top = await rectOf('.hy-action-bar');
    assert.ok(top.b <= box.b + 0.5 && top.b >= box.b - 16, `bar bottom ${top.b} sits at the scroller's foot ${box.b}`);
    await ev(`document.getElementById('scroller').scrollTop = 1e6`);
    await sleep(50);
    const end = await rectOf('.hy-action-bar'), last = await rectOf('#row-20');
    assert.ok(end.y >= last.b - 0.5, `the bar (${end.y}) does not cover the last row (ends ${last.b})`);
    assert.equal(await ev(`getComputedStyle(document.querySelector('.hy-action-bar')).position`), 'sticky');
  });

  it('renders nothing while closed', async () => {
    await fresh();
    await ev(`show(h(Screen, { bar: { open: false } }))`);
    await until(`document.querySelector('#scroller')`, 'the screen');
    assert.equal(await ev(`document.querySelectorAll('.hy-action-bar').length`), 0);
  });

  it('sits above a mounted TabBar', async () => {
    await fresh();
    await ev(`show(h(F, null, h(Screen, { height: '100vh', tabbar: true }),
      h(H.TabBar, { label: 'Screens', hideFrom: false, defaultValue: 'a' }, h(H.TabBar.Item, { value: 'a', label: 'One', icon: h('i') }), h(H.TabBar.Item, { value: 'b', label: 'Two', icon: h('i') }))))`);
    await until(`document.querySelector('.hy-action-bar') && document.querySelector('.hy-tabbar__capsule')`, 'the bar and the tab bar');
    const bar = await rectOf('.hy-action-bar'), cap = await rectOf('.hy-tabbar__capsule');
    assert.ok(bar.b <= cap.y + 0.5, `the bar (${bar.b}) ends above the capsule (${cap.y})`);
  });

  it('raises the bar by the safe area when there is no TabBar', async () => {
    await fresh();
    await ev(`show(h(Screen))`);
    await until(`document.querySelector('.hy-action-bar')`, 'the bar');
    assert.match(await ev(`getComputedStyle(document.querySelector('.hy-action-bar')).bottom`), /^\d+(\.\d+)?px$/);
  });

  describe('surface', () => {
    const alpha = (c) => { const m = c.match(/rgba?\(([^)]+)\)|color\(([^)]+)\)/); const p = (m[1] || m[2]).split(/[ ,/]+/).filter(Boolean); const i = m[2] ? 4 : 3; return p.length > i ? Number(p[i]) : 1; };
    it('is translucent and blurred by default, solid with opaque', async () => {
      await fresh();
      await ev(`show(h(Screen))`);
      await until(`document.querySelector('.hy-action-bar')`, 'the bar');
      const s = '.hy-action-bar__surface';
      assert.ok(alpha(await ev(`getComputedStyle(document.querySelector(${JSON.stringify(s)})).backgroundColor`)) < 1);
      assert.match(await ev(`getComputedStyle(document.querySelector(${JSON.stringify(s)})).backdropFilter`), /blur/);
      await ev(`show(h(Screen, { bar: { opaque: true } }))`);
      await sleep(80);
      assert.equal(alpha(await ev(`getComputedStyle(document.querySelector(${JSON.stringify(s)})).backgroundColor`)), 1);
      assert.equal(await ev(`getComputedStyle(document.querySelector(${JSON.stringify(s)})).backdropFilter`), 'none');
    });
    it('is solid under reduced transparency', async () => {
      await fresh();
      await chrome.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] });
      await ev(`show(h(Screen))`);
      await until(`document.querySelector('.hy-action-bar')`, 'the bar');
      assert.equal(alpha(await ev(`getComputedStyle(document.querySelector('.hy-action-bar__surface')).backgroundColor`)), 1);
      await chrome.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'no-preference' }] });
    });
  });

  describe('focus and announcements', () => {
    it('never takes focus when it appears', async () => {
      await fresh();
      await ev(`show(h(Screen, { bar: { open: false } }))`);
      await until(`document.querySelector('#row-3')`, 'the rows');
      await ev(`document.getElementById('row-3').focus()`);
      await ev(`show(h(Screen, { bar: { open: true } }))`);
      await until(`document.querySelector('.hy-action-bar')`, 'the bar');
      await sleep(250);
      assert.equal(await active(), 'row-3');
    });

    it('announces the label politely once it has appeared, and again when the text changes', async () => {
      await fresh();
      await ev(`show(h(Screen, { bar: { selection: { count: 3, total: 8, onClear: function () {} }, label: undefined } }))`);
      await until(`document.querySelector('.hy-action-bar')`, 'the bar');
      assert.equal(await ev(`document.querySelector('.hy-action-bar .hy-sr').getAttribute('aria-live')`), 'polite');
      await until(`document.querySelector('.hy-action-bar .hy-sr').textContent === '3 selected'`, 'the first announcement');
      await ev(`show(h(Screen, { bar: { selection: { count: 4, total: 8, onClear: function () {} }, label: undefined } }))`);
      await until(`document.querySelector('.hy-action-bar .hy-sr').textContent === '4 selected'`, 'the changed announcement');
    });

    it('announces an error when it appears, with an icon, while the bar stays open', async () => {
      await fresh();
      await ev(`show(h(Screen))`);
      await until(`document.querySelector('.hy-action-bar .hy-sr').textContent === '3 unsaved changes'`, 'the label');
      await ev(`show(h(Screen, { bar: { error: 'Couldn’t save the changes.' } }))`);
      await until(`/Error: Couldn’t save the changes\\./.test(document.querySelector('.hy-action-bar .hy-sr').textContent)`, 'the error announcement');
      assert.equal(await ev(`document.querySelectorAll('.hy-action-bar__error svg').length`), 1);
      assert.match(await spoken(), /^3 unsaved changes/);
    });

    it('returns focus to the element that had it before the bar when the bar closes with focus inside', async () => {
      await fresh();
      await ev(`show(h(Screen))`);
      await until(`document.querySelector('.hy-action-bar')`, 'the bar');
      await ev(`document.getElementById('row-5').focus()`);
      await ev(`document.getElementById('save').focus()`);
      assert.equal(await active(), 'save');
      await ev(`show(h(Screen, { bar: { open: false } }))`);
      await until(`!document.querySelector('.hy-action-bar')`, 'the bar to close');
      await sleep(50);
      assert.equal(await active(), 'row-5');
    });

    it('goes to the scroll container when that element is gone', async () => {
      await fresh();
      await ev(`show(h(Screen))`);
      await until(`document.querySelector('.hy-action-bar')`, 'the bar');
      await ev(`document.getElementById('row-5').focus()`);
      await ev(`document.getElementById('save').focus()`);
      /* Row 5 goes away while focus is in the bar, then the bar closes. */
      await ev(`document.getElementById('row-5').remove()`);
      await ev(`show(h(Screen, { bar: { open: false } }))`);
      await until(`!document.querySelector('.hy-action-bar')`, 'the bar to close');
      await sleep(50);
      assert.equal(await active(), 'scroller');
    });

    it('leaves focus alone when the bar closes with focus elsewhere', async () => {
      await fresh();
      await ev(`show(h(Screen))`);
      await until(`document.querySelector('.hy-action-bar')`, 'the bar');
      await ev(`document.getElementById('row-7').focus()`);
      await ev(`show(h(Screen, { bar: { open: false } }))`);
      await until(`!document.querySelector('.hy-action-bar')`, 'the bar to close');
      await sleep(50);
      assert.equal(await active(), 'row-7');
    });
  });
});
