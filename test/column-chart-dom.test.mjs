// Tests for ColumnChart's DOM behaviour (hyprsh/design#74), driven through real input in headless Chrome: focus, roving
// keys, the tooltip, the legend rules, the view toggle and label thinning need React and the built bundle. The pure parts
// are in column-chart.test.mjs. Needs network access for React (a CDN) and Chrome (see scripts/chrome.mjs); without
// Chrome the suite is skipped, or fails when CI is set.
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
<div id="root" style="padding:24px"></div><script>
var H = window.Hyprsh, h = React.createElement, log = [];
var root = ReactDOM.createRoot(document.getElementById('root'));
function show(el) { root.render(el); }
var SERIES = [{ key: 'ready', label: 'ready', tone: 'success' }, { key: 'canceled', label: 'canceled', tone: 'neutral' }, { key: 'error', label: 'error', tone: 'error' }];
var DATA = [
  { label: 'Oct 26', values: { ready: 4 } },
  { label: 'Oct 27', values: { ready: 6, canceled: 1 } },
  { label: 'Oct 28', values: { ready: 25, canceled: 1 } },
  { label: 'Oct 29', values: { ready: 33, canceled: 3, error: 1 } }];
function chart(props) { return h(H.ColumnChart, Object.assign({ series: SERIES, data: DATA, 'aria-label': 'Deployments' }, props)); }
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
});
after(async () => {
  if (chrome) await chrome.close();
  if (server) server.close();
});

const ev = (js) => chrome.evaluate(js);
let loaded = '';
async function fresh(width, touch) {
  const key = `${width}/${!!touch}`;
  if (loaded === key) { await ev('show(null)'); await sleep(50); return; }
  await chrome.emulate({ width, height: 700, scale: 1, touch: !!touch });
  await chrome.goto(`http://127.0.0.1:${port}/__t`);
  loaded = key;
}
async function until(js, what) {
  for (let i = 0; i < 40; i++) { if (await ev('!!(' + js + ')')) return; await sleep(50); }
  assert.fail('timed out waiting for ' + what);
}
const q = (sel) => JSON.stringify(sel);
const count = (sel) => ev(`document.querySelectorAll(${q(sel)}).length`);
const rectOf = (sel, nth = 0) => ev(`(function () { var r = document.querySelectorAll(${q(sel)})[${nth}].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; })()`);
const KEYS = { ArrowRight: 39, ArrowLeft: 37, Home: 36, End: 35, Tab: 9, Enter: 13 };
async function press(key) {
  const p = { key, code: key, windowsVirtualKeyCode: KEYS[key] };
  await chrome.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...p });
  await chrome.send('Input.dispatchKeyEvent', { type: 'keyUp', ...p });
}
async function click(sel) {
  const r = await rectOf(sel), x = r.x + r.w / 2, y = r.y + r.h / 2;
  await chrome.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await chrome.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await chrome.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}
const SLOT = '.hy-column-chart__slot';
const focusedIndex = () => ev(`document.activeElement.getAttribute('data-index')`);
const tipText = () => ev(`(document.querySelector('.hy-column-chart__tip') || {}).textContent`);
async function mount(js) { await ev('show(null)'); await sleep(30); await ev(`show(${js})`); await until(`document.querySelector('.hy-column-chart')`, 'the chart'); }

describe('ColumnChart', { concurrency: false }, () => {
  describe('on desktop', { skip: skipNoChrome }, () => {
    before(() => fresh(900));

    it('shows the legend for two or more series, not for one, and not with legend={false}', async () => {
      await mount('chart()');
      assert.equal(await count('.hy-column-chart__legend-item'), 3);
      assert.deepEqual(await ev(`Array.from(document.querySelectorAll('.hy-column-chart__legend-item')).map(function (e) { return e.textContent; })`), ['ready', 'canceled', 'error']);
      await mount('chart({ legend: false })');
      assert.equal(await count('.hy-column-chart__legend'), 0);
      await mount(`chart({ series: [SERIES[0]] })`);
      assert.equal(await count('.hy-column-chart__legend'), 0);
    });

    it('draws segments proportionally with gaps, a top-only radius and nothing for zero values', async () => {
      await mount('chart({ height: 200 })');
      // Oct 29 is the tallest column (37 on a 0-40 scale): 33 + 3 + 1, drawn as three segments.
      assert.equal(await count(`${SLOT}:nth-child(4) .hy-column-chart__seg`), 3);
      assert.equal(await count(`${SLOT}:nth-child(1) .hy-column-chart__seg`), 1, 'Oct 26 has only a ready segment');
      const ready = await rectOf(`${SLOT}:nth-child(4) .hy-column-chart__seg--success`);
      assert.ok(Math.abs(ready.h - 33 / 40 * 200) < 1.5, `ready is ${ready.h}px`);
      assert.equal(await ev(`getComputedStyle(document.querySelector(${q(SLOT + ':nth-child(4) .hy-column-chart__seg--success')})).borderTopLeftRadius`), '0px');
      assert.equal(await ev(`getComputedStyle(document.querySelector(${q(SLOT + ':nth-child(4) .hy-column-chart__seg--error')})).borderTopLeftRadius`), '4px');
      assert.equal(await ev(`getComputedStyle(document.querySelector(${q(SLOT + ':nth-child(4) .hy-column-chart__seg--error')})).borderBottomLeftRadius`), '0px');
      const col = await rectOf(`${SLOT}:nth-child(4) .hy-column-chart__col`);
      assert.equal(col.w, 24);
      const ticks = await ev(`Array.from(document.querySelectorAll('.hy-column-chart__tick')).map(function (e) { return e.textContent; })`);
      assert.deepEqual(ticks, ['0', '10', '20', '30', '40']);
    });

    it('colours toned series with the tone tokens and an untoned single series with chart-series', async () => {
      await mount('chart()');
      const bg = (sel) => ev(`getComputedStyle(document.querySelector(${q(sel)})).backgroundColor`);
      const swatch = await bg('.hy-column-chart__legend-item .hy-column-chart__swatch--success');
      const probe = (v) => ev(`(function () { var e = document.createElement('i'); e.style.background = 'var(${v})'; document.body.appendChild(e); var c = getComputedStyle(e).backgroundColor; e.remove(); return c; })()`);
      assert.equal(swatch, await probe('--green-700'));
      assert.equal(await bg('.hy-column-chart__legend-item .hy-column-chart__swatch--error'), await probe('--red-800'));
      await mount(`chart({ series: [{ key: 'ready', label: 'ready' }] })`);
      assert.equal(await bg('.hy-column-chart__seg'), await probe('--chart-series'));
    });

    it('is one Tab stop, named for the chart, with each column named by its values', async () => {
      await mount('chart()');
      assert.equal(await count(`${SLOT}[tabindex="0"]`), 1);
      assert.equal(await count(`${SLOT}[tabindex="-1"]`), 3);
      assert.equal(await ev(`document.querySelector('.hy-column-chart__plot').getAttribute('aria-label')`), 'Deployments');
      assert.equal(await ev(`document.querySelector('.hy-column-chart__plot').getAttribute('role')`), 'group');
      assert.deepEqual(await ev(`Array.from(document.querySelectorAll(${q(SLOT)})).map(function (e) { return e.getAttribute('aria-label'); })`), [
        'Oct 26: 4 ready, 0 canceled, 0 error', 'Oct 27: 6 ready, 1 canceled, 0 error', 'Oct 28: 25 ready, 1 canceled, 0 error', 'Oct 29: 33 ready, 3 canceled, 1 error']);
      assert.equal(await ev(`document.querySelector('.hy-column-chart__col').getAttribute('aria-hidden')`), 'true');
    });

    it('moves between columns with the arrow keys, Home and End, and shows the tooltip on the focused one', async () => {
      await mount('chart()');
      await ev(`document.querySelector(${q(SLOT + '[tabindex="0"]')}).focus()`);
      assert.equal(await focusedIndex(), '0');
      await press('ArrowRight'); assert.equal(await focusedIndex(), '1');
      await press('ArrowRight'); assert.equal(await focusedIndex(), '2');
      await until(`document.querySelector('.hy-column-chart__tip')`, 'the tooltip');
      assert.equal(await count(`${SLOT}.is-active`), 1);
      await press('End'); assert.equal(await focusedIndex(), '3');
      await press('ArrowRight'); assert.equal(await focusedIndex(), '3', 'stops at the end');
      await press('Home'); assert.equal(await focusedIndex(), '0');
      await press('ArrowLeft'); assert.equal(await focusedIndex(), '0', 'stops at the start');
      assert.equal(await count(`${SLOT}[tabindex="0"]`), 1);
      await press('End');
      assert.equal(await ev(`document.querySelector(${q(SLOT + '[tabindex="0"]')}).getAttribute('data-index')`), '3', 'the Tab stop follows focus');
    });

    it('lists the series top-down with a Total in a tooltip kept inside the chart', async () => {
      await mount('chart()');
      await ev(`document.querySelector(${q(SLOT + '[data-index="3"]')}).focus()`);
      await until(`document.querySelector('.hy-column-chart__tip') && document.querySelector('.hy-column-chart__tip').style.visibility === 'visible'`, 'the tooltip');
      assert.deepEqual(await ev(`Array.from(document.querySelectorAll('.hy-column-chart__tip > *')).map(function (e) { return e.textContent; })`), ['Oct 29', 'error1', 'canceled3', 'ready33', 'Total37']);
      const tip = await rectOf('.hy-column-chart__tip'), root = await rectOf('.hy-column-chart');
      assert.ok(tip.x >= root.x - 0.5 && tip.r <= root.r + 0.5 && tip.y >= root.y - 0.5, `tooltip ${JSON.stringify(tip)} outside chart ${JSON.stringify(root)}`);
      const col = await rectOf(`${SLOT}[data-index="3"] .hy-column-chart__col`);
      assert.ok(tip.b <= col.y + col.h, 'above the column base');
    });

    it('opens the tooltip on hover and closes it when the pointer leaves', async () => {
      await mount('chart()');
      const r = await rectOf(`${SLOT}[data-index="1"]`);
      await chrome.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.x + r.w / 2, y: r.y + r.h / 2 });
      await until(`document.querySelector('.hy-column-chart__tip')`, 'the tooltip');
      assert.match(await tipText(), /^Oct 27/);
      await chrome.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 });
      await until(`!document.querySelector('.hy-column-chart__tip')`, 'the tooltip to close');
    });

    it('swaps the plot for a table with the toggle, and back', async () => {
      await mount('chart()');
      assert.equal(await ev(`document.querySelector('.hy-column-chart__toggle').textContent`), 'View as Table');
      assert.equal(await count('.hy-column-chart__plot'), 1);
      await click('.hy-column-chart__toggle');
      await until(`document.querySelector('.hy-column-chart__toggle').textContent === 'View as Chart'`, 'the table view');
      assert.equal(await count('.hy-column-chart__plot'), 0);
      assert.deepEqual(await ev(`Array.from(document.querySelectorAll('.hy-column-chart__table thead th')).map(function (e) { return e.textContent; })`), ['Label', 'ready', 'canceled', 'error', 'Total']);
      assert.deepEqual(await ev(`Array.from(document.querySelectorAll('.hy-column-chart__table tbody tr:last-child > *')).map(function (e) { return e.textContent; })`), ['Oct 29', '33', '3', '1', '37']);
      assert.ok((await rectOf('.hy-column-chart__table')).w > 100, 'the table is visible');
      await click('.hy-column-chart__toggle');
      await until(`document.querySelector('.hy-column-chart__plot')`, 'the chart view');
    });

    it('keeps a visually hidden table with every value in chart view', async () => {
      await mount('chart()');
      const t = await rectOf('.hy-sr');
      assert.ok(t.w <= 1 && t.h <= 1, 'one pixel at most');
      assert.equal(await count('.hy-column-chart__table tbody tr'), 4);
      assert.equal(await count('.hy-column-chart__table tbody td'), 16);
      assert.equal(await ev(`document.querySelector('.hy-column-chart__table').getAttribute('aria-label')`), 'Deployments');
    });

    it('follows a controlled view and reports the toggle through onViewChange', async () => {
      await mount(`chart({ view: 'chart', onViewChange: function (v) { log.push(v); } })`);
      await click('.hy-column-chart__toggle');
      await sleep(100);
      assert.deepEqual(await ev('log'), ['table']);
      assert.equal(await count('.hy-column-chart__plot'), 1, 'stays on the chart until the prop changes');
      await mount(`chart({ view: 'table' })`);
      assert.equal(await count('.hy-column-chart__plot'), 0);
      await mount(`chart({ defaultView: 'table' })`);
      assert.equal(await ev(`document.querySelector('.hy-column-chart__toggle').textContent`), 'View as Chart');
    });

    it('keeps exactly one Tab stop when data shrinks below the roving index', async () => {
      await mount('chart()');
      await ev(`document.querySelector(${q(SLOT + '[tabindex="0"]')}).focus()`);
      await press('End');
      assert.equal(await focusedIndex(), '3');
      await ev(`document.activeElement.blur()`);
      await ev(`show(chart({ data: DATA.slice(0, 2) }))`);
      await until(`document.querySelectorAll(${q(SLOT)}).length === 2`, 'two columns');
      assert.equal(await count(`${SLOT}[tabindex="0"]`), 1);
      assert.equal(await ev(`document.querySelector(${q(SLOT + '[tabindex="0"]')}).getAttribute('data-index')`), '1');
    });

    it('moves the tooltip with the active column when data changes', async () => {
      await mount('chart()');
      await ev(`document.querySelector(${q(SLOT + '[tabindex="0"]')}).focus()`);
      await press('End');
      await until(`document.querySelector('.hy-column-chart__tip')`, 'the tooltip');
      await sleep(50);
      const before = await rectOf('.hy-column-chart__tip');
      await ev(`show(chart({ data: DATA.slice(0, 3).concat([{ label: 'Oct 29', values: { ready: 2 } }]) }))`);
      await sleep(150);
      const after = await rectOf('.hy-column-chart__tip');
      const col = await rectOf(`${SLOT}:nth-child(4) .hy-column-chart__seg`);
      assert.ok(after.y > before.y + 20, 'the tooltip dropped with the column');
      assert.ok(Math.abs(col.y - 8 - after.b) < 1.5, `tooltip sits 8px above the column (${col.y - after.b})`);
    });

    it('draws the gaps between stacked segments as real gaps: no border, and the slot tint shows through', async () => {
      await mount('chart({ height: 200 })');
      const lower = await rectOf(`${SLOT}:nth-child(4) .hy-column-chart__seg--success`);
      const mid = await rectOf(`${SLOT}:nth-child(4) .hy-column-chart__seg--neutral`);
      assert.equal(Math.round(lower.y - mid.b), 2, 'a 2px gap');
      assert.equal(await ev(`getComputedStyle(document.querySelector(${q(SLOT + ':nth-child(4) .hy-column-chart__seg--neutral')})).borderBottomWidth`), '0px');
      await ev(`document.querySelector(${q(SLOT + '[data-index="3"]')}).focus()`);
      await sleep(250);
      const px = await ev(`(function () { var m = document.querySelector(${q(SLOT + ':nth-child(4) .hy-column-chart__seg--neutral')}).getBoundingClientRect(); var el = document.elementFromPoint(m.left + 4, m.bottom + 1); return el.className; })()`);
      assert.match(px, /hy-column-chart__(slot|col)/, 'nothing is drawn in the gap');
    });

    it('hides the table with core\'s .hy-sr, and says nothing of the old modifier', async () => {
      await mount('chart()');
      assert.equal(await count('.hy-sr .hy-column-chart__table'), 1);
      assert.equal(await count('.hy-column-chart__tablewrap'), 0);
      await click('.hy-column-chart__toggle');
      await until(`!document.querySelector('.hy-column-chart__plot')`, 'table view');
      assert.equal(await count('.hy-column-chart__tablewrap .hy-column-chart__table'), 1);
    });

    it('warns once per instance without an accessible name, and not when named', async () => {
      await ev(`window.__warns = []; console.warn = function (m) { window.__warns.push(String(m)); }`);
      await mount(`chart({ 'aria-label': undefined })`);
      await ev(`show(chart({ 'aria-label': undefined, height: 150 }))`);
      await sleep(50);
      const w = await ev('window.__warns');
      assert.equal(w.length, 1);
      assert.match(w[0], /ColumnChart/);
      await ev(`window.__warns.length = 0`);
      await mount(`chart()`);
      await mount(`chart({ 'aria-label': undefined, 'aria-labelledby': 'x' })`);
      assert.equal((await ev('window.__warns')).length, 0);
    });

    it('does not expose the helpers on the public component', async () => {
      assert.equal(await ev(`Object.keys(H.ColumnChart).filter(function (k) { return k !== 'displayName'; }).length`), 0);
    });

    it('shows the empty content when there is no data', async () => {
      await ev('log.length = 0');
      await mount(`chart({ data: [], empty: h('b', { id: 'none' }, 'Nothing') })`);
      assert.equal(await count('#none'), 1);
      assert.equal(await count('.hy-column-chart__plot'), 0);
    });

    it('thins the x labels instead of letting them overlap on a narrow chart', async () => {
      const many = `Array.from({ length: 30 }, function (_, i) { return { label: 'Oct ' + (i + 1), values: { ready: i + 1 } }; })`;
      await mount(`chart({ data: ${many} })`);
      const labels = await ev(`Array.from(document.querySelectorAll('.hy-column-chart__xlabel')).map(function (e) { var r = e.getBoundingClientRect(); return [r.left, r.right]; })`);
      assert.ok(labels.length >= 2 && labels.length < 30, `${labels.length} labels`);
      for (let i = 1; i < labels.length; i++) assert.ok(labels[i][0] >= labels[i - 1][1], `label ${i} overlaps`);
      await mount(`chart({ data: ${many}.slice(0, 5) })`);
      assert.equal(await count('.hy-column-chart__xlabel'), 5);
    });
  });

  describe('under touch sizing', { skip: skipNoChrome }, () => {
    before(() => fresh(375, true));

    it('opens a column’s tooltip on a tap and keeps it inside the chart', async () => {
      await mount('chart()');
      const r = await rectOf(`${SLOT}[data-index="3"]`), x = r.x + r.w / 2, y = r.y + r.h / 2;
      await chrome.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      await chrome.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await until(`document.querySelector('.hy-column-chart__tip')`, 'the tooltip');
      const tip = await rectOf('.hy-column-chart__tip'), root = await rectOf('.hy-column-chart');
      assert.ok(tip.x >= root.x - 0.5 && tip.r <= root.r + 0.5, 'inside the chart horizontally');
      assert.match(await tipText(), /^Oct 29/);
    });
  });
});
