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
// n days labelled D1 to Dn, with ready and (for two series) error values; a chart of them in a box w px wide, after a
// button outside it.
var TWO = [SERIES[0], SERIES[2]];
function days(n) { return Array.from({ length: n }, function (_, i) { return { label: 'D' + (i + 1), values: { ready: 5 + i % 7, error: 1 + i % 3 } }; }); }
function boxed(w, props) {
  return h('div', null, h('button', { id: 'outside', type: 'button' }, 'Outside'),
    h('div', { id: 'box', style: { width: w + 'px' } }, chart(Object.assign({ series: TWO }, props))));
}
function onOpenLog(d, k) { log.push(k ? d.label + '/' + k : d.label); }
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
const KEYS = { ArrowRight: 39, ArrowLeft: 37, ArrowUp: 38, ArrowDown: 40, Home: 36, End: 35, Tab: 9, Enter: 13, ' ': 32 };
async function press(key) {
  const p = { key, code: key, windowsVirtualKeyCode: KEYS[key] };
  const text = key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined;
  await chrome.send('Input.dispatchKeyEvent', { type: text ? 'keyDown' : 'rawKeyDown', ...p, ...(text ? { text } : {}) });
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

// Pick, then open (#99): pick column i of n on the plot with a mouse click or a tap.
async function plotPoint(i, n) {
  const p = await rectOf('.hy-column-chart__plot');
  return { x: p.x + (i + 0.5) * p.w / n, y: p.y + p.h / 2 };
}
async function tap(x, y) {
  await chrome.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await chrome.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
async function pressAt(x, y) {
  await chrome.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await chrome.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await chrome.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}
async function pickCol(i, n, touch) {
  const { x, y } = await plotPoint(i, n);
  if (touch) await tap(x, y); else await pressAt(x, y);
}
const PINNED = '.hy-column-chart__tip.is-pinned';
const pinnedTitle = () => ev(`(document.querySelector(${q(PINNED + ' .hy-column-chart__tip-title')}) || {}).textContent`);
const untilPinned = (label) => until(`(document.querySelector(${q(PINNED + ' .hy-column-chart__tip-title')}) || {}).textContent === ${q(label)}`, 'the pinned tooltip of ' + label);
const noHScroll = () => ev(`(function () { var s = document.querySelector('.hy-column-chart__scroll'), b = document.getElementById('box') || document.querySelector('.hy-column-chart'); return s.scrollWidth <= s.clientWidth + 0.5 && b.scrollWidth <= b.clientWidth + 0.5; })()`);
// Every x label's box against the plot's, and whether the last column has one.
const xLabels = () => ev(`(function () {
  var p = document.querySelector('.hy-column-chart__plot').getBoundingClientRect();
  return { left: p.left, right: p.right, last: !!document.querySelector('.hy-column-chart__xslot:last-child .hy-column-chart__xlabel'),
    labels: Array.from(document.querySelectorAll('.hy-column-chart__xlabel')).map(function (e) { var r = e.getBoundingClientRect(); return [r.left, r.right, e.textContent]; }) };
})()`);
async function assertLabels(what) {
  const x = await xLabels();
  assert.ok(x.last, `${what}: the last column has a label`);
  for (const [l, r, t] of x.labels) assert.ok(l >= x.left - 0.5 && r <= x.right + 0.5, `${what}: label ${t} [${l}, ${r}] is outside the plot [${x.left}, ${x.right}]`);
  for (let i = 1; i < x.labels.length; i++) assert.ok(x.labels[i][0] >= x.labels[i - 1][1], `${what}: label ${x.labels[i][2]} overlaps`);
}

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

    describe('opening a column or a mark', () => {
      // Oct 29 has three marks (33 ready, 3 canceled, 1 error) on a 0-40 scale at height 200: 165px, 15px and 5px.
      const OPEN = `chart({ onOpen: function (d, k) { log.push(k ? d.label + '/' + k : d.label); } })`;
      const COL = (i) => `.hy-column-chart__open[data-index="${i}"]`;
      const MARK = (i, k) => `.hy-column-chart__mark[data-col="${i}"][data-mark="${k}"]`;
      const clickAt = async (x, y) => {
        await chrome.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
        await chrome.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
        await chrome.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
      };
      const attr = (sel, a) => ev(`document.querySelector(${q(sel)}).getAttribute(${q(a)})`);
      const activeAttr = (a) => ev(`document.activeElement.getAttribute(${q(a)})`);

      it('renders a chart with neither prop exactly as before: images, no links or buttons, no open classes', async () => {
        await mount('chart()');
        assert.equal(await count(`${SLOT}[role="img"]`), 4);
        assert.equal(await count('.hy-column-chart__plot a, .hy-column-chart__plot button, .hy-column-chart__table a, .hy-column-chart__table button'), 0);
        assert.equal(await count('[class*="hy-column-chart__open"], [class*="--open"], .hy-column-chart__mark, .hy-column-chart__marks'), 0);
        assert.equal(await ev(`document.querySelector(${q(SLOT)}).className`), 'hy-column-chart__slot');
        assert.equal(await ev(`document.querySelector(${q(SLOT)}).children.length`), 1);
        await mount(`chart({ onOpen: undefined, href: undefined })`);
        assert.equal(await count(`${SLOT}[role="img"]`), 4);
      });

      it('makes each column a button named "Open ..." with onOpen, with a button per non-zero mark', async () => {
        await mount(OPEN);
        assert.equal(await count('button.hy-column-chart__open'), 4);
        assert.equal(await count(`${SLOT}[role="img"]`), 0);
        assert.deepEqual(await ev(`Array.from(document.querySelectorAll('button.hy-column-chart__open')).map(function (e) { return e.getAttribute('aria-label'); })`), [
          'Open Oct 26: 4 ready, 0 canceled, 0 error', 'Open Oct 27: 6 ready, 1 canceled, 0 error', 'Open Oct 28: 25 ready, 1 canceled, 0 error', 'Open Oct 29: 33 ready, 3 canceled, 1 error']);
        assert.deepEqual(await ev(`Array.from(document.querySelectorAll('.hy-column-chart__slot:nth-child(3) .hy-column-chart__mark')).map(function (e) { return e.getAttribute('aria-label'); })`), ['Open Oct 28 ready: 25', 'Open Oct 28 canceled: 1']);
        assert.equal(await count('.hy-column-chart__slot:nth-child(1) .hy-column-chart__mark'), 1, 'a zero value has no mark');
        assert.equal(await count('.hy-column-chart__open[tabindex="0"]'), 1);
        assert.equal(await count('.hy-column-chart__mark[tabindex="-1"]'), await count('.hy-column-chart__mark'), 'marks are never a Tab stop');
      });

      it('opens a column by click, and a mark of 8px or more by click', async () => {
        await ev('log.length = 0');
        await mount(OPEN);
        const col = await rectOf(COL(3));
        await clickAt(col.x + 2, col.y + 20); // above the stack: the column
        await until('log.length === 1', 'the column to open');
        const ready = await rectOf(MARK(3, 'ready'));
        await clickAt(ready.x + ready.w / 2, ready.y + ready.h / 2);
        await until('log.length === 2', 'the mark to open');
        assert.deepEqual(await ev('log'), ['Oct 29', 'Oct 29/ready']);
      });

      it('sends a click on a mark under 8px to the column', async () => {
        await ev('log.length = 0');
        await mount(OPEN);
        const err = await rectOf(MARK(3, 'error'));
        assert.ok(err.h < 8, `error mark is ${err.h}px`);
        assert.equal(await ev(`getComputedStyle(document.querySelector(${q(MARK(3, 'error'))})).pointerEvents`), 'none');
        await clickAt(err.x + err.w / 2, err.y + err.h / 2);
        await until('log.length === 1', 'the column to open');
        assert.deepEqual(await ev('log'), ['Oct 29']);
      });

      it('shows the tooltip on hover over a mark', async () => {
        await mount(OPEN);
        const m = await rectOf(MARK(3, 'ready'));
        await chrome.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: m.x + m.w / 2, y: m.y + m.h / 2 });
        await until(`document.querySelector('.hy-column-chart__tip')`, 'the tooltip');
        assert.match(await tipText(), /^Oct 29/);
      });

      it('renders links for columns and marks with an href, and no target where it returns undefined', async () => {
        await mount(`chart({ href: function (d, k) { return d.label === 'Oct 26' ? undefined : '/d/' + d.label.replace(' ', '-') + (k ? '/' + k : ''); } })`);
        assert.equal(await count(`${SLOT}[role="img"]`), 1, 'Oct 26 is not a target');
        assert.equal(await count('a.hy-column-chart__open'), 3);
        assert.equal(await count('button.hy-column-chart__open'), 0);
        assert.equal(await attr(COL(2), 'href'), '/d/Oct-28');
        assert.equal(await attr(MARK(3, 'canceled'), 'href'), '/d/Oct-29/canceled');
        assert.equal(await count(`${SLOT}[role="img"][aria-label^="Oct 26"]`), 1);
      });

      it('makes a link that has onOpen call it with the event, so an app can preventDefault', async () => {
        await ev('log.length = 0');
        await mount(`chart({ href: function (d) { return '#' + d.label.replace(' ', '-'); }, onOpen: function (d, k, e) { e.preventDefault(); log.push(d.label + '|' + k + '|' + typeof e.preventDefault); } })`);
        const col = await rectOf(COL(1));
        await clickAt(col.x + 2, col.y + 10);
        await until('log.length === 1', 'the link to call onOpen');
        assert.deepEqual(await ev('log'), ['Oct 27|undefined|function']);
        assert.equal(await ev('location.hash'), '', 'preventDefault stopped the navigation');
      });

      it('keeps marks openable in a column that is no target, reachable by keys and pointer', async () => {
        await mount(`chart({ href: function (d, k) { return k === 'canceled' ? '#' + d.label.replace(' ', '-') + '-' + k : undefined; } })`);
        assert.equal(await count('a.hy-column-chart__open'), 0);
        assert.equal(await count(`.hy-column-chart__open.is-static[role="img"]`), 3, 'columns with marks stay named images');
        assert.equal(await count(`${SLOT}[role="img"]`), 1, 'Oct 26 has no mark to open, so it is a plain column');
        assert.equal(await count('a.hy-column-chart__mark'), 3, 'Oct 27, 28 and 29 have a canceled mark');
        assert.equal(await ev(`document.querySelector(${q(COL(2))}).getAttribute('aria-label')`), 'Oct 28: 25 ready, 1 canceled, 0 error');
        assert.equal(await count('[data-index][tabindex="0"]'), 1);
        await ev(`document.querySelector(${q(COL(2))}).focus()`);
        await press('ArrowUp');
        assert.equal(await activeAttr('data-mark'), 'canceled', 'Up skips the ready mark, which has no target');
        await press('ArrowDown');
        assert.equal(await activeAttr('data-index'), '2');
        await press('ArrowRight');
        assert.equal(await focusedIndex(), '3');
        assert.equal(await count('.hy-column-chart__slot:nth-child(1) .hy-column-chart__mark'), 0);
        await ev(`document.querySelector(${q(SLOT + '[data-index="0"]')}).focus()`);
        await press('ArrowUp');
        assert.equal(await focusedIndex(), '0', 'a column without marks ignores Up');
      });

      it('mixes buttons and links when onOpen is set and href gives a URL for some', async () => {
        await mount(`chart({ onOpen: function () {}, href: function (d) { return d.label === 'Oct 27' ? '/x' : undefined; } })`);
        assert.equal(await count('a.hy-column-chart__open'), 1);
        assert.equal(await count('button.hy-column-chart__open'), 3);
      });

      it('has no marks for a single series: only the column is a target', async () => {
        await mount(`chart({ series: [SERIES[0]], onOpen: function () {} })`);
        assert.equal(await count('button.hy-column-chart__open'), 4);
        assert.equal(await count('.hy-column-chart__mark'), 0);
      });

      it('keeps one Tab stop, goes up into the marks and down out of them, and opens with Enter and Space', async () => {
        await ev('log.length = 0');
        await mount(OPEN);
        await ev(`document.querySelector(${q(COL(0))}).focus()`);
        await press('ArrowRight'); await press('ArrowRight');
        assert.equal(await focusedIndex(), '2');
        assert.equal(await count('.hy-column-chart__open[tabindex="0"]'), 1);
        await until(`document.querySelector('.hy-column-chart__tip')`, 'the tooltip');
        await press('ArrowUp');
        assert.equal(await activeAttr('data-mark'), 'ready', 'the bottom mark first');
        assert.equal(await count('.hy-column-chart__tip'), 1, 'the tooltip follows focus into the mark');
        await press('ArrowUp');
        assert.equal(await activeAttr('data-mark'), 'canceled');
        await press('ArrowUp');
        assert.equal(await activeAttr('data-mark'), 'canceled', 'stops at the top mark');
        await press('Enter');
        await until('log.length === 1', 'the mark to open');
        assert.deepEqual(await ev('log'), ['Oct 28/canceled']);
        await press('ArrowDown');
        assert.equal(await activeAttr('data-mark'), 'ready');
        await press('ArrowDown');
        assert.equal(await activeAttr('data-index'), '2', 'back on the column');
        await press('ArrowDown');
        assert.equal(await activeAttr('data-index'), '2');
        await press('ArrowUp'); await press('ArrowRight');
        assert.equal(await activeAttr('data-index'), '3', 'Right from a mark moves to the next column');
        await press('ArrowUp'); await press('ArrowLeft');
        assert.equal(await activeAttr('data-index'), '2');
        await press('Enter'); await press(' ');
        await until('log.length === 3', 'Enter and Space to open the column');
        assert.deepEqual(await ev('log'), ['Oct 28/canceled', 'Oct 28', 'Oct 28']);
      });

      it('gives every target a 2px focus ring and columns at least 24px of width', async () => {
        await mount(OPEN);
        await ev(`document.querySelector(${q(COL(1))}).focus()`);
        await press('ArrowRight'); await press('ArrowLeft'); // a key press makes :focus-visible match
        assert.equal(await ev('getComputedStyle(document.activeElement).outlineWidth'), '2px');
        await press('ArrowUp');
        assert.equal(await ev('getComputedStyle(document.activeElement).outlineWidth'), '2px');
        assert.ok((await rectOf(COL(0))).w >= 24);
        // Narrower than 24px a slot, the columns stop being direct targets: the chart picks, then opens (#99).
        const many = `Array.from({ length: 60 }, function (_, i) { return { label: 'D' + i, values: { ready: i + 1, canceled: 1 } }; })`;
        await mount(`chart({ data: ${many}, onOpen: function () {} })`);
        assert.ok((await rectOf(COL(0))).w < 24, 'many columns fit the width');
        assert.equal(await count('.hy-column-chart__body.is-pick'), 1, 'and the plot is the target');
      });

      it('opens the same targets from the table view, with the same names, and only in table view', async () => {
        await ev('log.length = 0');
        await mount(OPEN);
        assert.equal(await count('.hy-column-chart__table a, .hy-column-chart__table button'), 0, 'the hidden table adds no Tab stops');
        await click('.hy-column-chart__toggle');
        await until(`document.querySelector('.hy-column-chart__tablewrap')`, 'the table view');
        assert.deepEqual(await ev(`Array.from(document.querySelectorAll('.hy-column-chart__table tbody th button')).map(function (e) { return e.getAttribute('aria-label'); })`), [
          'Open Oct 26: 4 ready, 0 canceled, 0 error', 'Open Oct 27: 6 ready, 1 canceled, 0 error', 'Open Oct 28: 25 ready, 1 canceled, 0 error', 'Open Oct 29: 33 ready, 3 canceled, 1 error']);
        assert.deepEqual(await ev(`Array.from(document.querySelectorAll('.hy-column-chart__table tbody tr:last-child td button')).map(function (e) { return e.getAttribute('aria-label') + '=' + e.textContent; })`), [
          'Open Oct 29 ready: 33=33', 'Open Oct 29 canceled: 3=3', 'Open Oct 29 error: 1=1']);
        assert.equal(await count('.hy-column-chart__table tbody tr:first-child td button'), 1, 'zero figures are plain text');
        await click('.hy-column-chart__table tbody tr:last-child td:nth-child(3) button');
        await click('.hy-column-chart__table tbody tr:first-child th button');
        await until('log.length === 2', 'the table targets to open');
        assert.deepEqual(await ev('log'), ['Oct 29/canceled', 'Oct 26']);
        await mount(`chart({ defaultView: 'table', href: function (d, k) { return '/' + d.label + (k || ''); } })`);
        assert.equal(await count('.hy-column-chart__table tbody th a'), 4);
        assert.equal(await count('.hy-column-chart__table tbody td a'), 8);
      });
    });
    describe('pick, then open', () => {
      const OPEN30 = `boxed(360, { data: days(30), onOpen: onOpenLog })`;
      const COL = (i) => `.hy-column-chart__open[data-index="${i}"]`;

      it('fits 30 openable columns in 360px with no horizontal scroll, and makes the plot the target', async () => {
        await mount(OPEN30);
        assert.equal(await count('.hy-column-chart__body.is-pick'), 1);
        assert.equal(await count('.hy-column-chart__body.is-scroll'), 0);
        assert.ok(await noHScroll(), 'no horizontal scroll');
        assert.equal(await ev(`getComputedStyle(document.querySelector('.hy-column-chart__open')).pointerEvents`), 'none');
        assert.equal(await ev(`getComputedStyle(document.querySelector('.hy-column-chart__mark')).pointerEvents`), 'none');
        assert.equal(await count('.hy-column-chart__open[tabindex="0"]'), 1, 'still one Tab stop');
        assert.match(await ev(`document.querySelector('.hy-column-chart__open').getAttribute('aria-label')`), /^Open D1: \d+ ready, \d+ error$/, 'each column still names its values');
      });

      it('pins the tooltip of the picked column, moves it to another, and opens it from Open, at least the touch target', async () => {
        await ev('log.length = 0');
        await mount(OPEN30);
        await pickCol(4, 30);
        await untilPinned('D5');
        assert.equal(await count(`${SLOT}.is-active`), 1);
        await pickCol(20, 30);
        await untilPinned('D21');
        const open = await rectOf('.hy-column-chart__tip-open');
        const target = await ev(`parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--touch-target'))`);
        assert.ok(target >= 44, 'the token reads');
        assert.ok(open.h >= target && open.w >= target, `Open is ${open.w}x${open.h}`);
        assert.equal(await ev(`document.querySelector('.hy-column-chart__tip-open').tagName`), 'BUTTON');
        await click('.hy-column-chart__tip-open');
        await until('log.length === 1', 'Open to open the column');
        assert.deepEqual(await ev('log'), ['D21']);
        assert.equal(await count(PINNED), 0, 'opening closes the pinned tooltip');
      });

      it('opens each series\' mark from its tooltip row with its seriesKey', async () => {
        await ev('log.length = 0');
        await mount(OPEN30);
        await pickCol(28, 30);
        await untilPinned('D29');
        assert.deepEqual(await ev(`Array.from(document.querySelectorAll('.hy-column-chart__tip-action')).map(function (e) { return e.tagName + ' ' + e.getAttribute('data-mark') + ' ' + e.getAttribute('aria-label'); })`),
          ['BUTTON error Open D29 error: 2', 'BUTTON ready Open D29 ready: 5']);
        await click('.hy-column-chart__tip-action[data-mark="error"]');
        await until('log.length === 1', 'the error row to open');
        await pickCol(28, 30);
        await untilPinned('D29');
        await click('.hy-column-chart__tip-action[data-mark="ready"]');
        await until('log.length === 2', 'the ready row to open');
        assert.deepEqual(await ev('log'), ['D29/error', 'D29/ready']);
      });

      it('makes the rows and Open links with href only, and a link still calls onOpen with the event', async () => {
        await mount(`boxed(360, { data: days(30), href: function (d, k) { return '/d/' + d.label + (k ? '/' + k : ''); } })`);
        await pickCol(9, 30);
        await untilPinned('D10');
        assert.equal(await ev(`document.querySelector('.hy-column-chart__tip-open').getAttribute('href')`), '/d/D10');
        assert.deepEqual(await ev(`Array.from(document.querySelectorAll('.hy-column-chart__tip-action')).map(function (e) { return e.tagName + ' ' + e.getAttribute('href'); })`), ['A /d/D10/error', 'A /d/D10/ready']);
        await ev('log.length = 0');
        await mount(`boxed(360, { data: days(30), href: function (d) { return '#' + d.label; }, onOpen: function (d, k, e) { e.preventDefault(); log.push(d.label + '|' + k + '|' + typeof e.preventDefault); } })`);
        await pickCol(2, 30);
        await untilPinned('D3');
        assert.equal(await count('a.hy-column-chart__tip-open'), 1);
        await click('.hy-column-chart__tip-open');
        await until('log.length === 1', 'the link to call onOpen');
        assert.deepEqual(await ev('log'), ['D3|undefined|function']);
        assert.equal(await ev('location.hash'), '', 'preventDefault stopped the navigation');
      });

      it('keeps the keyboard: one Tab stop, the arrows, Home and End with the tooltip following, and Enter opens', async () => {
        await ev('log.length = 0');
        await mount(OPEN30);
        await chrome.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2 }); // hover would outrank focus
        await ev(`document.querySelector('.hy-column-chart__open[tabindex="0"]').focus()`);
        await press('End');
        assert.equal(await focusedIndex(), '29');
        await until(`(document.querySelector('.hy-column-chart__tip-title') || {}).textContent === 'D30'`, 'the tooltip to follow');
        await press('Home'); await press('ArrowRight');
        assert.equal(await focusedIndex(), '1');
        assert.equal(await count('.hy-column-chart__open[tabindex="0"]'), 1);
        await press('Enter');
        await until('log.length === 1', 'Enter to open');
        await press('ArrowUp');
        assert.equal(await ev(`document.activeElement.getAttribute('data-mark')`), 'ready', 'Up still reaches the marks');
        assert.deepEqual(await ev('log'), ['D2']);
      });

      it('moves a pinned tooltip with keyboard focus', async () => {
        await mount(OPEN30);
        await pickCol(10, 30);
        await untilPinned('D11');
        assert.equal(await focusedIndex(), '10', 'focus is on the picked column');
        await press('ArrowRight');
        await untilPinned('D12');
      });

      it('closes the pinned tooltip on Escape, a press outside and focus leaving the chart', async () => {
        await mount(OPEN30);
        await pickCol(5, 30);
        await untilPinned('D6');
        await press('Escape');
        await until(`!document.querySelector(${q(PINNED)})`, 'Escape to close it');
        await pickCol(5, 30);
        await untilPinned('D6');
        await pressAt(600, 650);
        await until(`!document.querySelector(${q(PINNED)})`, 'a press outside to close it');
        await pickCol(5, 30);
        await untilPinned('D6');
        await ev(`document.getElementById('outside').focus()`);
        await until(`!document.querySelector(${q(PINNED)})`, 'focus leaving to close it');
      });

      it('keeps direct column and mark targets when slots are at least 24px: 8 columns in 360px', async () => {
        await ev('log.length = 0');
        await mount(`boxed(360, { data: days(8), onOpen: onOpenLog })`);
        assert.equal(await count('.hy-column-chart__body.is-pick'), 0);
        assert.ok((await rectOf(COL(0))).w >= 24);
        const c = await rectOf(COL(3));
        await pressAt(c.x + c.w / 2, c.y + 4);
        await until('log.length === 1', 'the column to open directly');
        const m = await rectOf('.hy-column-chart__mark[data-col="3"][data-mark="ready"]');
        await pressAt(m.x + m.w / 2, m.y + m.h / 2);
        await until('log.length === 2', 'the mark to open directly');
        assert.deepEqual(await ev('log'), ['D4', 'D4/ready']);
        assert.equal(await count(PINNED), 0);
      });

      it('scrolls 90 openable columns in 320px, opens at the last column and keeps the y axis in view', async () => {
        await mount(`boxed(320, { data: days(90), onOpen: onOpenLog })`);
        await until(`document.querySelector('.hy-column-chart__body.is-scroll')`, 'the scrolling plot');
        const at = () => ev(`(function () { var s = document.querySelector('.hy-column-chart__scroll'); return { left: s.scrollLeft, max: s.scrollWidth - s.clientWidth }; })()`);
        let s = await at();
        assert.ok(s.max > 0, 'it scrolls');
        assert.ok(Math.abs(s.left - s.max) <= 1, `opens at the end (${s.left} of ${s.max})`);
        assert.equal(await ev(`document.querySelector('.hy-column-chart__scroll').contains(document.querySelector('.hy-column-chart__yaxis'))`), false);
        const y = await rectOf('.hy-column-chart__yaxis'), box = await rectOf('#box'), sc = await rectOf('.hy-column-chart__scroll');
        assert.ok(y.x >= box.x - 0.5 && y.r <= sc.x + 0.5, 'the y axis sits beside the scroll area');
        assert.ok((await rectOf(`${SLOT}:last-child`)).r <= sc.r + 1, 'the last column is in view');
        assert.ok(await ev(`document.getElementById('box').scrollWidth <= document.getElementById('box').clientWidth`), 'only the plot scrolls');
        // At the end, new data keeps it at the end.
        await ev(`show(boxed(320, { data: days(95), onOpen: onOpenLog }))`);
        await sleep(100);
        s = await at();
        assert.ok(Math.abs(s.left - s.max) <= 1, `stays at the end (${s.left} of ${s.max})`);
        // Scrolled away, new data keeps the position.
        await ev(`document.querySelector('.hy-column-chart__scroll').scrollLeft = 10`);
        await sleep(100);
        await ev(`show(boxed(320, { data: days(100), onOpen: onOpenLog }))`);
        await sleep(100);
        assert.equal((await at()).left, 10);
        assert.equal((await rectOf('.hy-column-chart__yaxis')).x, y.x, 'the y axis did not move');
      });

      it('picks in a scrolling plot too', async () => {
        await mount(`boxed(320, { data: days(90), onOpen: onOpenLog })`);
        await until(`document.querySelector('.hy-column-chart__body.is-scroll')`, 'the scrolling plot');
        const sc = await rectOf('.hy-column-chart__scroll');
        await pressAt(sc.r - 2, sc.y + 100);
        await untilPinned('D90');
      });

      it('leaves a chart that opens nothing unchanged: no pick mode and no minimum width, even with 90 columns', async () => {
        await mount(`boxed(320, { data: days(90) })`);
        assert.equal(await count('.hy-column-chart__body.is-pick, .hy-column-chart__body.is-scroll'), 0);
        assert.ok(await noHScroll(), 'no horizontal scroll');
        await pickCol(5, 90);
        await sleep(100);
        assert.equal(await count(PINNED), 0, 'nothing pins');
      });

      it('labels the last column and keeps every x label inside the plot', async () => {
        const many = `Array.from({ length: 30 }, function (_, i) { return { label: 'Oct ' + (i + 1), values: { ready: i + 1 } }; })`;
        for (const [what, js] of [
          ['4 columns', 'chart()'],
          ['30 plain columns', `chart({ data: ${many} })`],
          ['31 plain columns in 360px', `boxed(360, { data: days(31) })`],
          ['8 openable columns in 360px', `boxed(360, { data: days(8), onOpen: onOpenLog })`],
          ['30 openable columns in 360px', OPEN30],
          ['90 openable columns in 320px', `boxed(320, { data: days(90), onOpen: onOpenLog })`],
          ['one column', `chart({ data: DATA.slice(0, 1) })`],
        ]) {
          await mount(js);
          await sleep(50);
          await assertLabels(what);
        }
      });
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
  describe('pick, then open under touch sizing', { skip: skipNoChrome }, () => {
    before(() => fresh(420, true));
    const OPEN30 = `boxed(360, { data: days(30), onOpen: onOpenLog })`;

    it('fits 30 columns in 360px and picks one with a tap, with Open and the rows at least the touch target', async () => {
      await ev('log.length = 0');
      await mount(OPEN30);
      assert.equal(await count('.hy-column-chart__body.is-pick'), 1);
      assert.ok(await noHScroll(), 'no horizontal scroll');
      await pickCol(12, 30, true);
      await untilPinned('D13');
      await sleep(150);
      assert.deepEqual(await ev('log'), [], 'the tap only picks, even with the tooltip under the finger');
      assert.equal(await count(PINNED), 1);
      const open = await rectOf('.hy-column-chart__tip-open');
      assert.ok(open.h >= 44 && open.w >= 44, `Open is ${open.w}x${open.h}`);
      for (let i = 0; i < 2; i++) assert.ok((await rectOf('.hy-column-chart__tip-action', i)).h >= 44, 'each row is at least the touch target');
      await tap(open.x + open.w / 2, open.y + open.h / 2);
      await until('log.length === 1', 'Open to open the column');
      assert.deepEqual(await ev('log'), ['D13']);
    });

    it('moves the pick with a press and drag across the plot', async () => {
      await mount(OPEN30);
      const a = await plotPoint(2, 30), b = await plotPoint(20, 30);
      await chrome.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y }] });
      for (let k = 1; k <= 6; k++) {
        await chrome.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + (b.x - a.x) * k / 6, y: a.y }] });
        await sleep(16);
      }
      await chrome.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await untilPinned('D21');
      assert.ok(await noHScroll(), 'the drag did not scroll');
    });

    it('closes the pinned tooltip on a tap outside the chart', async () => {
      await mount(OPEN30);
      await pickCol(3, 30, true);
      await untilPinned('D4');
      await tap(410, 690);
      await until(`!document.querySelector(${q(PINNED)})`, 'a tap outside to close it');
    });

    it('needs 44px slots for direct targets: 6 columns in 360px open directly, 8 pick', async () => {
      await mount(`boxed(360, { data: days(6), onOpen: onOpenLog })`);
      assert.equal(await count('.hy-column-chart__body.is-pick'), 0);
      assert.ok((await rectOf('.hy-column-chart__open')).w >= 44);
      await mount(`boxed(360, { data: days(8), onOpen: onOpenLog })`);
      assert.equal(await count('.hy-column-chart__body.is-pick'), 1, '40px slots are below the touch target');
    });
  });
});
