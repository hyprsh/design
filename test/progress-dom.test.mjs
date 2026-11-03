// Tests for Progress segments' DOM behaviour (hyprsh/design#95), driven through real input in headless Chrome: the scale
// colours in both themes, the single roving Tab stop, ←/→ and Home/End, the tooltip on hover and focus, and the order
// against stops. The tree-level parts are in progress-segments.test.mjs. Needs network access for React (a CDN) and
// Chrome (see scripts/chrome.mjs); without Chrome the suite is skipped, or fails when CI is set.
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
<div id="root" style="padding:80px 24px 24px;width:400px"></div><script>
var H = window.Hyprsh, h = React.createElement;
var root = ReactDOM.createRoot(document.getElementById('root'));
function show(el) { root.render(el); }
var SEGS = [
  { value: 412, scale: 'seq-1', tooltip: 'Remux: 412 Titles, 38 %' },
  { value: 100 },
  { value: 356, scale: 'seq-3', tooltip: 'Web-DL: 356 Titles, 33 %' },
  { value: 316, scale: 'seq-5', ariaLabel: 'Encode' }];
function bar(props) { return h('div', null, h('button', { id: 'before' }, 'Before'), h(H.Progress, Object.assign({ label: 'Library by Format', max: 1184, segments: SEGS }, props)), h('button', { id: 'after' }, 'After')); }
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
  await chrome.emulate({ width: 600, height: 500, scale: 1, touch: false });
  await chrome.goto(`http://127.0.0.1:${port}/__t`);
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
const q = (sel) => JSON.stringify(sel);
const count = (sel) => ev(`document.querySelectorAll(${q(sel)}).length`);
const rectOf = (sel, nth = 0) => ev(`(function () { var r = document.querySelectorAll(${q(sel)})[${nth}].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; })()`);
const KEYS = { ArrowRight: 39, ArrowLeft: 37, Home: 36, End: 35, Tab: 9 };
async function press(key, modifiers = 0) {
  const p = { key, code: key, windowsVirtualKeyCode: KEYS[key], modifiers };
  await chrome.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...p });
  await chrome.send('Input.dispatchKeyEvent', { type: 'keyUp', ...p });
}
const tab = () => press('Tab');
const shiftTab = () => press('Tab', 8);
async function hover(sel, nth = 0) {
  const r = await rectOf(sel, nth);
  await chrome.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.x + r.w / 2, y: r.y + r.h / 2 });
}
const SEG = '.hy-progress__segment';
const active = () => ev(`document.activeElement.getAttribute('aria-label') || document.activeElement.id`);
const tipText = () => ev(`(document.querySelector('.hy-tooltip__box') || {}).textContent || null`);
async function mount(js) { await ev('show(null)'); await sleep(30); await ev(`show(${js})`); await until(`document.querySelector('.hy-progress')`, 'the bar'); await ev(`document.getElementById('before').focus()`); }

describe('Progress segments', { concurrency: false, skip: skipNoChrome }, () => {
  it('draws scale steps with the chart tokens, in light and dark', async () => {
    const scales = ['seq-1', 'seq-2', 'seq-3', 'seq-4', 'seq-5', 'series'];
    await mount(`bar({ segments: ${JSON.stringify(scales.map((scale) => ({ value: 10, scale })))}, max: 60 })`);
    const probe = (v) => ev(`(function () { var e = document.createElement('i'); e.style.background = 'var(${v})'; document.body.appendChild(e); var c = getComputedStyle(e).backgroundColor; e.remove(); return c; })()`);
    const bgs = () => ev(`Array.from(document.querySelectorAll(${q(SEG)})).map(function (e) { return getComputedStyle(e).backgroundColor; })`);
    for (const theme of ['light', 'dark']) {
      await ev(`document.documentElement.setAttribute('data-theme', ${q(theme)})`);
      const got = await bgs();
      for (let i = 0; i < scales.length; i++) assert.equal(got[i], await probe(scales.length - 1 === i ? '--chart-series' : '--chart-' + scales[i]), `${scales[i]} in ${theme}`);
    }
    await ev(`document.documentElement.setAttribute('data-theme', 'light')`);
  });

  it('is one Tab stop: Tab enters at the first segment and leaves for the next control; the others are tabindex -1', async () => {
    await mount('bar()');
    assert.equal(await count(`${SEG}[tabindex="0"]`), 1);
    assert.equal(await count(`${SEG}[tabindex="-1"]`), 2);
    await tab();
    assert.equal(await active(), 'Remux: 412 Titles, 38 %');
    await tab();
    assert.equal(await active(), 'after');
    await shiftTab();
    assert.equal(await active(), 'Remux: 412 Titles, 38 %', 'Shift+Tab returns to the stop');
  });

  it('moves with ←/→ and Home/End, skipping the segment with no name, and stays at the ends', async () => {
    await mount('bar()');
    await tab();
    await press('ArrowRight');
    assert.equal(await active(), 'Web-DL: 356 Titles, 33 %');
    await press('ArrowRight');
    assert.equal(await active(), 'Encode');
    await press('ArrowRight');
    assert.equal(await active(), 'Encode');
    await press('ArrowLeft');
    assert.equal(await active(), 'Web-DL: 356 Titles, 33 %');
    await press('Home');
    assert.equal(await active(), 'Remux: 412 Titles, 38 %');
    await press('End');
    assert.equal(await active(), 'Encode');
    // The roving stop follows the last focused segment.
    await shiftTab();
    assert.equal(await active(), 'before');
    await tab();
    assert.equal(await active(), 'Encode');
  });

  it('shows the tooltip above the bar on hover and on focus, and not on a segment without one', async () => {
    await mount('bar()');
    await hover(SEG, 0);
    await until(`document.querySelector('.hy-tooltip__box')`, 'the tooltip on hover');
    assert.equal(await tipText(), 'Remux: 412 Titles, 38 %');
    const tip = await rectOf('.hy-tooltip__box'), bar = await rectOf('.hy-progress__bar');
    assert.ok(tip.y + tip.h <= bar.y, 'the tooltip sits above the bar');
    await chrome.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 590, y: 400 });
    await until(`!document.querySelector('.hy-tooltip__box')`, 'the tooltip to close');
    await ev(`document.getElementById('before').focus()`);
    await tab(); await press('ArrowRight');
    await until(`document.querySelector('.hy-tooltip__box')`, 'the tooltip on focus');
    assert.equal(await tipText(), 'Web-DL: 356 Titles, 33 %');
    await press('ArrowRight');
    await until(`!document.querySelector('.hy-tooltip__box')`, 'no tooltip on a segment with only an ariaLabel');
  });

  it('exposes a named group, with no focusable element inside a role="img" and the other segments hidden', async () => {
    await mount('bar()');
    assert.equal(await ev(`document.querySelector('.hy-progress__track').getAttribute('role')`), 'group');
    assert.equal(await ev(`document.querySelector('.hy-progress__track').getAttribute('aria-labelledby') === document.querySelector('.hy-progress__label').id`), true);
    assert.equal(await ev(`Array.from(document.querySelectorAll('[role=img]')).filter(function (e) { return e.querySelector('[tabindex]'); }).length`), 0);
    assert.equal(await count(`${SEG}[aria-hidden="true"]`), 1);
    assert.deepEqual(await ev(`Array.from(document.querySelectorAll(${q(SEG + '[role=img]')})).map(function (e) { return e.getAttribute('aria-label'); })`), ['Remux: 412 Titles, 38 %', 'Web-DL: 356 Titles, 33 %', 'Encode']);
  });

  it('puts the segments before the stops in tab order, then each stop as before', async () => {
    await mount(`bar({ stops: [{ value: 300, tooltip: 'First stop' }, { value: 900, tooltip: 'Second stop' }] })`);
    await tab();
    assert.equal(await active(), 'Remux: 412 Titles, 38 %');
    await tab();
    assert.equal(await active(), 'First stop');
    await tab();
    assert.equal(await active(), 'Second stop');
    await tab();
    assert.equal(await active(), 'after');
  });

  it('a bar with no focusable segments is still one image with nothing to Tab to but its stops', async () => {
    await mount(`bar({ segments: [{ value: 600, tone: 'success' }, { value: 400, scale: 'seq-2' }], stops: [{ value: 500, tooltip: 'Stop' }] })`);
    assert.equal(await ev(`document.querySelector('.hy-progress__track').getAttribute('role')`), 'img');
    assert.equal(await count(`${SEG}[tabindex]`), 0);
    await tab();
    assert.equal(await active(), 'Stop');
  });
});
