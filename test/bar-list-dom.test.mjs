// Tests for BarList's columns and row opening (hyprsh/design#81), driven through real input in headless Chrome: the
// table roles, the width-driven hiding of columns and keyboard activation need React, layout and the built bundle. The
// vnode-level parts are in bar-list.test.mjs. Needs network access for React (a CDN) and Chrome (see scripts/chrome.mjs);
// without Chrome the suite is skipped, or fails when CI is set.
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
<div id="host" style="padding:24px"><div id="root" style="width:900px"></div></div><script>
var H = window.Hyprsh, h = React.createElement, log = [];
var root = ReactDOM.createRoot(document.getElementById('root'));
function show(el) { root.render(el); }
function width(px) { document.getElementById('root').style.width = px + 'px'; }
var COLUMNS = [{ key: 'p50', label: 'P50', priority: 2 }, { key: 'p99', label: 'P99', priority: 1 }, { key: 'errors', label: 'Errors' }];
var ITEMS = [
  { label: 'api-gateway', value: 318, columns: { p50: '12 ms', p99: '240 ms', errors: '3' } },
  { label: 'edge-cache', value: 204, columns: { p50: '9 ms', p99: '80 ms' } },
  { label: 'build-runner', value: 1, columns: { p50: '4 s', p99: '9 s', errors: '0' } }];
var KESTREL = [{ key: 'hit', label: 'Hit', hideable: false }, { key: 'ans', label: 'Answer', priority: 2 }, { key: 'fail', label: 'Failed', priority: 1 }];
var KITEMS = [
  { label: 'indexer-alpha', value: 318, columns: { hit: '94%', ans: '310 ms', fail: '12' } },
  { label: 'indexer-beta-with-a-long-name', value: 204, columns: { hit: '81%', ans: '95 ms' } },
  { label: 'indexer-gamma', value: 12, columns: { hit: '60%' } }];
function list(props) { return h(H.BarList, Object.assign({ items: ITEMS, 'aria-label': 'Services' }, props)); }
</script></body></html>`;

let server, chrome, port;
const canRun = existsSync(CHROME);
const skipNoChrome = !canRun && !process.env.CI && 'Chrome not found';
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
async function until(js, what) {
  for (let i = 0; i < 40; i++) { if (await ev('!!(' + js + ')')) return; await sleep(50); }
  assert.fail('timed out waiting for ' + what);
}
const q = (sel) => JSON.stringify(sel);
const count = (sel) => ev(`document.querySelectorAll(${q(sel)}).length`);
const KEYS = { Tab: 9, Enter: 13, ' ': 32 };
async function press(key) {
  const p = { key, code: key, windowsVirtualKeyCode: KEYS[key] };
  const text = key === 'Enter' ? '\r' : key === ' ' ? ' ' : undefined;
  await chrome.send('Input.dispatchKeyEvent', { type: text ? 'keyDown' : 'rawKeyDown', ...p, ...(text ? { text } : {}) });
  await chrome.send('Input.dispatchKeyEvent', { type: 'keyUp', ...p });
}
async function click(sel, nth = 0) {
  const r = await ev(`(function () { var r = document.querySelectorAll(${q(sel)})[${nth}].getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
  await chrome.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...r });
  await chrome.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...r, button: 'left', clickCount: 1 });
  await chrome.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...r, button: 'left', clickCount: 1 });
}
async function mount(js, px = 900) {
  await ev('show(null)'); await sleep(30);
  await ev(`width(${px}); show(${js})`);
  await until(`document.querySelector('.hy-bar-list')`, 'the list');
  await sleep(60);
}
const texts = (sel) => ev(`Array.from(document.querySelectorAll(${q(sel)})).map(function (e) { return e.textContent; })`);
const visible = (sel) => ev(`Array.from(document.querySelectorAll(${q(sel)})).filter(function (e) { var r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2; }).map(function (e) { return e.textContent; })`);

describe('BarList in the browser', { concurrency: false, skip: skipNoChrome }, () => {
  before(async () => {
    await chrome.emulate({ width: 1100, height: 700, scale: 1 });
    await chrome.goto(`http://127.0.0.1:${port}/__t`);
  });

  it('exposes column headers and a row of cells per item to assistive technology', async () => {
    await mount(`list({ columns: COLUMNS, labelHeader: 'Service', valueHeader: 'Requests' })`);
    assert.equal(await ev(`document.querySelector('.hy-bar-list').tagName`), 'TABLE');
    assert.deepEqual(await texts('thead th[scope="col"]'), ['Service', 'Requests', 'P50', 'P99', 'Errors']);
    assert.equal(await count('tbody tr'), 3);
    assert.equal(await count('tbody th[scope="row"], tbody td'), 15);
    assert.deepEqual(await texts('tbody tr:nth-child(2) > *'), ['edge-cache', '204', '9 ms', '80 ms', '']);
    assert.equal(await ev(`getComputedStyle(document.querySelector('tbody td')).display`), 'table-cell');
  });

  it('shows a header row and lines the figures up under their headers', async () => {
    await mount(`list({ columns: COLUMNS })`);
    const rights = await ev(`(function () {
      var cols = [2, 3, 4], out = [];
      cols.forEach(function (c) {
        var xs = Array.from(document.querySelectorAll('.hy-bar-list tr')).map(function (r) { return Math.round(r.children[c].getBoundingClientRect().right); });
        out.push(xs.every(function (x) { return x === xs[0]; }));
      });
      return out;
    })()`);
    assert.deepEqual(rights, [true, true, true]);
    assert.equal(await ev(`getComputedStyle(document.querySelector('.hy-bar-list tbody td:nth-child(3)')).textAlign`), 'right');
    assert.equal(await ev(`getComputedStyle(document.querySelector('.hy-bar-list tbody td:nth-child(3)')).fontVariantNumeric`), 'tabular-nums');
  });

  it('hides extra columns from measured widths, in priority order, keeps their cells for assistive technology, and never hides the label, bar and value', async () => {
    const shown = () => visible('thead th');
    await mount(`list({ columns: COLUMNS })`, 900);
    assert.deepEqual(await shown(), ['Label', 'Value', 'P50', 'P99', 'Errors']);
    await mount(`list({ columns: COLUMNS })`, 440);
    assert.deepEqual(await shown(), ['Label', 'Value', 'P50', 'P99', 'Errors'], 'short figures fit at 440px, where the old 620px budget hid two');
    await ev('width(380)'); await until(`document.querySelectorAll('.hy-bar-list__cell.is-hidden').length > 3`, 'Errors to hide');
    assert.deepEqual(await shown(), ['Label', 'Value', 'P50', 'P99'], 'Errors has no priority: it hides first');
    await ev('width(320)'); await until(`document.querySelectorAll('.hy-bar-list__cell.is-hidden').length > 6`, 'P50 to hide');
    assert.deepEqual(await shown(), ['Label', 'Value', 'P99'], 'then the largest priority number');
    await ev('width(240)'); await sleep(150);
    assert.deepEqual(await shown(), ['Label', 'Value']);
    assert.deepEqual(await visible('tbody tr:nth-child(1) > *'), ['api-gatewayP50 12 ms · P99 240 ms · Errors 3', '318']);
    assert.ok((await ev(`document.querySelector('.hy-bar-list__fill').getBoundingClientRect().width`)) > 20, 'the bar stays');
    assert.deepEqual(await texts('tbody tr:nth-child(1) > *'), ['api-gatewayP50 12 ms · P99 240 ms · Errors 3', '318', '12 ms', '240 ms', '3'], 'hidden figures are still in the tree');
    assert.equal(await ev(`document.documentElement.scrollWidth <= document.documentElement.clientWidth`), true);
    // The list's own width decides, not the viewport.
    await ev('width(900)'); await sleep(150);
    assert.deepEqual(await shown(), ['Label', 'Value', 'P50', 'P99', 'Errors']);
  });

  it('keeps three short numeric columns beside the bar in a 480px list', async () => {
    await mount(`list({ columns: KESTREL, items: KITEMS })`, 480);
    assert.deepEqual(await visible('thead th'), ['Label', 'Value', 'Hit', 'Answer', 'Failed']);
    assert.equal(await count('.hy-bar-list__sub'), 0);
    assert.ok((await ev(`document.querySelector('.hy-bar-list__bar').getBoundingClientRect().width`)) >= 48);
  });

  it('keeps a hideable: false column at 360px and narrower, hides the others by priority and shows their figures on a second line', async () => {
    await mount(`list({ columns: KESTREL, items: KITEMS })`, 360);
    assert.ok((await visible('thead th')).includes('Hit'), 'Hit at 360px');
    await ev('width(250)');
    await until(`document.querySelectorAll('.hy-bar-list__cell.is-hidden').length > 0`, 'columns to hide');
    assert.deepEqual(await visible('thead th'), ['Label', 'Value', 'Hit']);
    assert.deepEqual(await texts('.hy-bar-list__sub'), ['Answer 310 ms · Failed 12', 'Answer 95 ms'], 'no line for the row without a hidden figure');
    assert.deepEqual(await ev(`Array.from(document.querySelectorAll('.hy-bar-list__sub')).map(function (e) { return e.getAttribute('aria-hidden'); })`), ['true', 'true']);
    assert.deepEqual(await texts('tbody tr:nth-child(1) > *'), ['indexer-alpha' + 'Answer 310 ms · Failed 12', '318', '94%', '310 ms', '12'], 'the cells stay in the table, once each');
    assert.equal(await ev(`getComputedStyle(document.querySelector('.hy-bar-list__subfig')).fontVariantNumeric`), 'tabular-nums');
    assert.equal(await ev(`parseFloat(getComputedStyle(document.querySelector('.hy-bar-list__sub')).fontSize) < parseFloat(getComputedStyle(document.querySelector('.hy-bar-list__label')).fontSize)`), true);
    const hs = await ev(`Array.from(document.querySelectorAll('tbody tr')).map(function (r) { return Math.round(r.getBoundingClientRect().height); })`);
    assert.ok(hs[0] > 36 && hs[1] > 36 && hs[2] === 36, 'rows with a second line grow: ' + hs);
    const rights = await ev(`Array.from(document.querySelectorAll('.hy-bar-list tr')).map(function (r) { return Math.round(r.children[2].getBoundingClientRect().right); })`);
    assert.ok(rights.every((x) => x === rights[0]), 'Hit lines up under its header');
    assert.equal(await ev(`document.documentElement.scrollWidth <= document.documentElement.clientWidth`), true);
  });

  it('narrows the bar to 24px, then truncates the label, warns once and never scrolls sideways when kept columns do not fit', async () => {
    const kept = `[{ key: 'hit', label: 'Hit Rate Over A Week', hideable: false }, { key: 'ans', label: 'Answer Time In Milliseconds', hideable: false }]`;
    await ev(`console.warn = function (m) { log.push(String(m)); }; log.length = 0`);
    await mount(`list({ columns: ${kept}, items: KITEMS.map(function (it) { return Object.assign({}, it, { columns: { hit: '94.2%', ans: '310 ms' } }); }) })`, 300);
    await sleep(150);
    assert.equal(await ev(`document.querySelectorAll('.hy-bar-list__cell.is-hidden').length`), 0, 'neither hides');
    assert.ok((await ev(`document.querySelector('.hy-bar-list__bar').getBoundingClientRect().width`)) >= 23.5, 'the floor');
    assert.ok((await ev(`document.querySelector('.hy-bar-list__bar').getBoundingClientRect().width`)) < 30, 'the bar narrowed');
    assert.equal(await ev(`document.querySelector('.hy-bar-list').scrollWidth <= document.querySelector('.hy-bar-list').clientWidth + 1`), true);
    assert.equal(await ev(`document.documentElement.scrollWidth <= document.documentElement.clientWidth`), true);
    await ev('width(290)'); await sleep(150);
    assert.equal((await ev('log')).filter((m) => /hideable/.test(m)).length, 1, 'warned once');
  });

  it('sizes extra columns to their content instead of clipping wide figures', async () => {
    await mount(`list({ columns: [{ key: 'p50', label: 'P50' }], items: [{ label: 'a', value: 5, columns: { p50: '1,234,567,890 requests' } }, { label: 'b', value: 1, columns: { p50: '4' } }] })`);
    assert.equal(await ev(`(function () { var c = document.querySelector('tbody td:nth-child(3)'); return c.scrollWidth <= c.clientWidth; })()`), true);
    assert.ok((await ev(`document.querySelector('tbody td:nth-child(3)').getBoundingClientRect().width`)) > 120, 'wider than a fixed 88px');
  });

  it('opens a row with a click, Enter and Space, passes the item, and gives each row one Tab stop', async () => {
    await ev('log.length = 0');
    await mount(`list({ onOpen: function (it) { log.push(it.label); } })`);
    assert.equal(await count('button.hy-bar-list__row'), 3);
    await click('button.hy-bar-list__row', 1);
    await until('log.length === 1', 'the click to open');
    await ev(`document.querySelector('button.hy-bar-list__row').focus()`);
    await press('Enter');
    await press(' ');
    await until('log.length === 3', 'Enter and Space to open');
    assert.deepEqual(await ev('log'), ['edge-cache', 'api-gateway', 'api-gateway']);
    await press('Tab');
    assert.equal(await ev(`document.activeElement.textContent`), 'edge-cache, 204');
    await ev(`document.querySelector('button.hy-bar-list__row').focus()`);
    await press('Tab'); // key press so :focus-visible matches
    await ev(`document.querySelector('button.hy-bar-list__row').focus()`);
    assert.equal(await ev(`getComputedStyle(document.activeElement).outlineWidth`), '2px');
  });

  it('opens a row of a table from anywhere on it, with a focus ring, and a link row calls onOpen too', async () => {
    await ev('log.length = 0');
    await mount(`list({ columns: COLUMNS, onOpen: function (it, e) { log.push(it.label); if (it.href) e.preventDefault(); },
      items: ITEMS.map(function (it, i) { return i === 2 ? Object.assign({ href: '#x' }, it) : it; }) })`);
    assert.equal(await count('tbody button'), 2);
    assert.equal(await count('tbody a'), 1);
    assert.deepEqual(await texts('tbody button'), ['api-gateway', 'edge-cache']);
    await click('.hy-bar-list__bar', 1); // the bar, not the label
    await until('log.length === 1', 'the row to open');
    await click('tbody tr:nth-child(3) > :nth-child(5)', 0);
    await until('log.length === 2', 'the link row to open');
    assert.deepEqual(await ev('log'), ['edge-cache', 'build-runner']);
    assert.equal(await ev('location.hash'), '', 'preventDefault stopped the link');
    await ev(`document.querySelector('tbody button').focus()`);
    await press('Tab'); await ev(`document.querySelector('tbody button').focus()`);
    assert.match(await ev(`getComputedStyle(document.querySelector('tbody td')).boxShadow`), /2px/);
  });

  it('keeps each row’s target inside its row, so a click outside the list or on another row opens nothing else', async () => {
    await ev('log.length = 0');
    await mount(`list({ columns: COLUMNS, onOpen: function (it) { log.push(it.label); } })`);
    // As in an engine where a table row is not a containing block for what is positioned inside it.
    await ev(`document.querySelectorAll('tr.hy-bar-list__tr').forEach(function (tr) { tr.style.position = 'static'; })`);
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
      await chrome.send('Input.dispatchMouseEvent', { type, x: 10, y: 10, button: 'left', clickCount: 1 }); // the padding outside the list
    }
    await click('.hy-bar-list__bar', 0);
    await until('log.length === 1', 'the first row to open');
    assert.deepEqual(await ev('log'), ['api-gateway']);
    assert.equal(await ev(`[...document.querySelectorAll('tbody *')].filter(function (el) { return getComputedStyle(el).position === 'absolute' || getComputedStyle(el, '::after').position === 'absolute'; }).length`), 0);
  });

  it('keeps today’s markup for a list without the new props', async () => {
    await mount(`list()`);
    assert.equal(await ev(`document.querySelector('.hy-bar-list').tagName`), 'UL');
    assert.equal(await count('.hy-bar-list tr, .hy-bar-list td, .hy-bar-list button, .hy-bar-list a'), 0);
    assert.equal(await count('li.hy-bar-list__item > div.hy-bar-list__row'), 3);
  });
});
