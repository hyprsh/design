// Tests for Pane and SplitView's layout, scrolling and phone behaviour (hyprsh/design#84), driven in headless Chrome:
// they need real layout and the built bundle. The markup and CSS rules are in split-view.test.mjs. Needs network access
// for React (a CDN) and Chrome (see scripts/chrome.mjs); without Chrome the suite is skipped, or fails when CI is set.
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
function rowsOf(prefix, n) {
  return Array.from({ length: n }, function (_, i) { return h('button', { key: i, className: prefix + '-row', style: { display: 'block', width: '100%', height: 40, boxSizing: 'border-box' } }, prefix + ' ' + (i + 1)); });
}
/* A container with a height, as the app gives one. */
function Frame(props) { return h('div', { id: 'frame', style: { height: 400 } }, props.children); }
function Split(props) {
  return h(Frame, null, h(H.SplitView, Object.assign({}, props.split),
    h(H.Pane, { header: h('span', { id: 'list-head' }, 'Projects'), footer: h('span', { id: 'list-foot' }, 'Footer'), label: 'Projects' }, rowsOf('list', 30)),
    h(H.Pane, { header: 'Detail', footer: 'Foot', label: 'Detail' }, rowsOf('detail', 30))));
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
let loaded = '';
async function fresh(width) {
  if (loaded !== String(width)) {
    await chrome.emulate({ width, height: 700, scale: 1 });
    await chrome.goto(`http://127.0.0.1:${port}/__t`);
    loaded = String(width);
  }
  await ev('show(null)');
  await sleep(50);
}
async function until(js, what) {
  for (let i = 0; i < 60; i++) { if (await ev('!!(' + js + ')')) return; await sleep(50); }
  assert.fail('timed out waiting for ' + what);
}
const q = (s) => JSON.stringify(s);
const rectOf = (sel, nth = 0) => ev(`(function () { var r = document.querySelectorAll(${q(sel)})[${nth}].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; })()`);
const bodies = '.hy-pane__body';
const scrollOf = (nth) => ev(`document.querySelectorAll(${q(bodies)})[${nth}].scrollTop`);
const setScroll = (nth, v) => ev(`document.querySelectorAll(${q(bodies)})[${nth}].scrollTop = ${v}`);

describe('Pane', { concurrency: false, skip: skipNoChrome }, () => {
  before(() => fresh(900));

  it('fills its container, keeps the header and footer fixed and scrolls only the body', async () => {
    await fresh(900);
    await ev(`show(h(Frame, null, h(H.Pane, { header: 'Header', footer: 'Footer', label: 'Rows' }, rowsOf('r', 40))))`);
    await until(`document.querySelector('.hy-pane')`, 'the pane');
    const frame = await rectOf('#frame'), pane = await rectOf('.hy-pane');
    assert.ok(Math.abs(pane.h - frame.h) < 1, `the pane (${pane.h}px) fills the container (${frame.h}px)`);
    const head = await rectOf('.hy-pane__header'), foot = await rectOf('.hy-pane__footer'), body = await rectOf(bodies);
    await setScroll(0, 300);
    await sleep(50);
    assert.equal(await scrollOf(0), 300);
    const head2 = await rectOf('.hy-pane__header'), foot2 = await rectOf('.hy-pane__footer');
    assert.equal(head2.y, head.y);
    assert.equal(foot2.y, foot.y);
    assert.ok(Math.abs(head.b - body.y) < 1.5 && Math.abs(body.b - foot.y) < 1.5, 'the body sits between the header and the footer');
    assert.equal(await ev(`document.scrollingElement.scrollTop`), 0, 'the page itself does not scroll');
    assert.match(await ev(`getComputedStyle(document.querySelector('.hy-pane__header')).borderBottomWidth`), /^1px$/);
    assert.match(await ev(`getComputedStyle(document.querySelector('.hy-pane__footer')).borderTopWidth`), /^1px$/);
  });

  it('is a focusable region named by label', async () => {
    await fresh(900);
    await ev(`show(h(Frame, null, h(H.Pane, { label: 'Rows' }, rowsOf('r', 40))))`);
    await until(`document.querySelector('.hy-pane')`, 'the pane');
    assert.equal(await ev(`document.querySelector('.hy-pane__body').getAttribute('role')`), 'region');
    assert.equal(await ev(`document.querySelector('.hy-pane__body').getAttribute('aria-label')`), 'Rows');
    await ev(`document.querySelector('.hy-pane__body').focus()`);
    assert.equal(await ev(`document.activeElement.className`), 'hy-pane__body');
  });

  it('is not a Tab stop without a label', async () => {
    await fresh(900);
    await ev(`show(h(Frame, null, h(H.Pane, {}, 'Short')))`);
    await until(`document.querySelector('.hy-pane')`, 'the pane');
    assert.equal(await ev(`document.querySelector('.hy-pane__body').tabIndex`), -1);
  });

  it('keeps an ActionBar at the end of its body at the pane foot, above the footer', async () => {
    await fresh(900);
    await ev(`show(h(Frame, null, h(H.Pane, { header: 'Header', footer: 'Footer', label: 'Rows' },
      rowsOf('r', 40), h(H.ActionBar, { open: true, label: '2 selected', actions: h(H.Button, { size: 'small' }, 'Monitor') }))))`);
    await until(`document.querySelector('.hy-action-bar')`, 'the bar');
    const body = await rectOf(bodies), bar = await rectOf('.hy-action-bar'), foot = await rectOf('.hy-pane__footer');
    assert.ok(bar.b <= body.b + 0.5 && bar.b >= body.b - 16, `the bar (ends ${bar.b}) is at the body's foot (${body.b})`);
    assert.ok(bar.b <= foot.y + 0.5, 'the bar is above the footer');
    await setScroll(0, 1e6);
    await sleep(50);
    const end = await rectOf('.hy-action-bar'), last = await rectOf('.r-row', 39);
    assert.ok(end.y >= last.b - 0.5, 'the bar does not cover the last row once scrolled to the end');
  });
});

describe('SplitView', { concurrency: false, skip: skipNoChrome }, () => {
  describe('from sm up', () => {
    before(() => fresh(900));

    it('shows the list at the default 320px with the detail beside it, divided', async () => {
      await fresh(900);
      await ev(`show(h(Split, {}))`);
      await until(`document.querySelector('.hy-split-view')`, 'the split view');
      const list = await rectOf('.hy-split-view__list'), detail = await rectOf('.hy-split-view__detail'), frame = await rectOf('#frame');
      assert.equal(list.w, 320);
      assert.ok(Math.abs(detail.x - list.r) < 1, 'the detail starts where the list ends');
      assert.ok(Math.abs(detail.r - frame.r) < 1, 'the detail takes the rest');
      assert.ok(Math.abs(detail.h - frame.h) < 1 && Math.abs(list.h - frame.h) < 1, 'both fill the height');
      assert.equal(await ev(`getComputedStyle(document.querySelector('.hy-split-view__detail')).borderLeftWidth`), '1px');
    });

    it('takes listWidth as a number or a string', async () => {
      await fresh(900);
      await ev(`show(h(Split, { split: { listWidth: 240 } }))`);
      await until(`document.querySelector('.hy-split-view')`, 'the split view');
      assert.equal((await rectOf('.hy-split-view__list')).w, 240);
      await ev(`show(h(Split, { split: { listWidth: '30%' } }))`);
      await sleep(80);
      assert.ok(Math.abs((await rectOf('.hy-split-view__list')).w - 270) < 1, '30% of 900px');
    });

    it('shows both panes whatever show is, each scrolling on its own', async () => {
      await fresh(900);
      await ev(`show(h(Split, { split: { show: 'detail' } }))`);
      await until(`document.querySelector('.hy-split-view')`, 'the split view');
      for (const c of ['list', 'detail']) assert.equal(await ev(`getComputedStyle(document.querySelector('.hy-split-view__${c}')).visibility`), 'visible');
      await setScroll(0, 200);
      await sleep(50);
      assert.equal(await scrollOf(0), 200);
      assert.equal(await scrollOf(1), 0, 'the detail did not move');
      await setScroll(1, 120);
      await sleep(50);
      assert.equal(await scrollOf(0), 200, 'the list did not move');
      const headers = await ev(`Array.from(document.querySelectorAll('.hy-pane__header')).map(function (e) { return e.getBoundingClientRect().y; })`);
      assert.equal(headers[0], headers[1], 'the headers stay put');
    });
  });

  describe('below sm', () => {
    before(() => fresh(375));

    it('shows only the pane named by show, and the other is out of the accessibility tree and Tab order', async () => {
      await fresh(375);
      await ev(`show(h(Split, {}))`);
      await until(`document.querySelector('.hy-split-view')`, 'the split view');
      const list = await rectOf('.hy-split-view__list'), frame = await rectOf('#frame');
      assert.ok(Math.abs(list.w - frame.r) < 1, 'the list fills the width');
      assert.equal(await ev(`getComputedStyle(document.querySelector('.hy-split-view__list')).visibility`), 'visible');
      assert.equal(await ev(`getComputedStyle(document.querySelector('.hy-split-view__detail')).visibility`), 'hidden');
      /* A hidden pane can't take focus: the call leaves focus where it was. */
      await ev(`document.querySelector('.hy-pane__body').focus()`);
      await ev(`document.querySelectorAll('.hy-pane__body')[1].focus(); document.querySelector('.detail-row').focus()`);
      assert.equal(await ev(`document.activeElement.closest('.hy-split-view__detail')`), null);

      await ev(`show(h(Split, { split: { show: 'detail' } }))`);
      await sleep(80);
      assert.equal(await ev(`getComputedStyle(document.querySelector('.hy-split-view__list')).visibility`), 'hidden');
      assert.equal(await ev(`getComputedStyle(document.querySelector('.hy-split-view__detail')).visibility`), 'visible');
      const detail = await rectOf('.hy-split-view__detail');
      assert.ok(Math.abs(detail.w - frame.r) < 1 && Math.abs(detail.x) < 1, 'the detail fills the width');
      assert.equal(await ev(`document.querySelectorAll('.hy-split-view__detail')[0].getBoundingClientRect().x`), 0);
      await ev(`document.querySelector('.list-row').focus()`);
      assert.equal(await ev(`document.activeElement.closest('.hy-split-view__list')`), null, 'the hidden list takes no focus');
    });

    it('restores the list scroll position when it comes back', async () => {
      await fresh(375);
      await ev(`show(h(Split, {}))`);
      await until(`document.querySelector('.hy-split-view')`, 'the split view');
      await setScroll(0, 260);
      await sleep(50);
      assert.equal(await scrollOf(0), 260);
      await ev(`show(h(Split, { split: { show: 'detail' } }))`);
      await sleep(80);
      await ev(`show(h(Split, { split: { show: 'list' } }))`);
      await sleep(80);
      assert.equal(await scrollOf(0), 260);
    });

    it('lets the detail scroll on its own', async () => {
      await fresh(375);
      await ev(`show(h(Split, { split: { show: 'detail' } }))`);
      await until(`document.querySelector('.hy-split-view')`, 'the split view');
      await setScroll(1, 150);
      await sleep(50);
      assert.equal(await scrollOf(1), 150);
      assert.equal(await scrollOf(0), 0);
    });
  });
});
