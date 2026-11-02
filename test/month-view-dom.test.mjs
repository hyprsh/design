// Tests for MonthView's DOM behaviour (hyprsh/design#90), driven through real input in headless Chrome: the grid, the entries,
// the roving keys and the narrow form need React and the built bundle. The pure parts are in month-view.test.mjs. Needs
// network access for React (a CDN) and Chrome (see scripts/chrome.mjs); without Chrome the suite is skipped, or fails when
// CI is set.
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
function on(d, hr) { return new Date(2025, 10, d, hr || 9); }
var ENTRIES = [
  { key: 'a', date: on(4), label: 'Deploy web', tone: 'success', href: '#web' },
  { key: 'b', date: on(4, 11), label: 'Release v2.4', tone: 'info', onOpen: function () { log.push('open b'); } },
  { key: 'c', date: on(4, 15), label: 'Maintenance window', tone: 'warning' },
  { key: 'd', date: on(4, 17), label: 'Cache purge', tone: 'neutral' },
  { key: 'e', date: on(4, 18), label: 'Deploy api', tone: 'error' },
  { key: 'f', date: on(12), label: 'Deploy docs', tone: 'success', href: '#docs' }];
function mv(props) {
  return h(H.MonthView, Object.assign({ entries: ENTRIES, defaultMonth: new Date(2025, 10, 1), locale: 'en-GB', label: 'Deployments',
    onDayOpen: function (d) { log.push('day ' + d.getDate()); } }, props));
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
  await chrome.emulate({ width, height: 900, scale: 1, touch: !!touch });
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
const VK = { PageUp: 33, PageDown: 34, ArrowDown: 40, ArrowUp: 38, ArrowLeft: 37, ArrowRight: 39, Home: 36, End: 35, Enter: 13, Tab: 9 };
async function key(k) {
  const p = { key: k, code: k, windowsVirtualKeyCode: VK[k] };
  await chrome.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...p });
  await chrome.send('Input.dispatchKeyEvent', { type: 'keyUp', ...p });
}
async function click(sel) {
  const r = await rectOf(sel), x = r.x + r.w / 2, y = r.y + r.h / 2;
  await chrome.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await chrome.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await chrome.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}
async function tap(sel) {
  const r = await rectOf(sel), x = r.x + r.w / 2, y = r.y + r.h / 2;
  await chrome.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  await chrome.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
const DAY = (n) => `[data-day="2025-11-${String(n).padStart(2, '0')}"]`;
const active = () => ev(`document.activeElement.getAttribute('data-day') || document.activeElement.textContent`);
const titleText = () => ev(`document.querySelector('.hy-month-view__title').textContent`);
const logged = () => ev('log.splice(0)');
const focusDay = (n) => ev(`document.querySelector(${q(DAY(n))}).focus()`);
async function mount(js) { await ev('show(null)'); await sleep(30); await ev(`log.length = 0; show(${js})`); await until(`document.querySelector('.hy-month-view')`, 'the month view'); }

describe('MonthView', { concurrency: false }, () => {
  describe('on desktop', { skip: skipNoChrome }, () => {
    before(() => fresh(900));

    it('draws November 2025 with leading and trailing days, headed by the month and Previous, Next and Today', async () => {
      await mount('mv()');
      assert.equal(await titleText(), 'November 2025');
      assert.equal(await ev(`document.querySelector('[role=grid]').getAttribute('aria-label')`), 'Deployments, November 2025');
      assert.equal(await count('[role=gridcell]'), 42);
      assert.equal(await count('[role=gridcell].is-outside'), 12);
      assert.equal(await ev(`document.querySelector('[role=gridcell]').getAttribute('data-day')`), '2025-10-26');
      assert.deepEqual(await ev(`Array.from(document.querySelectorAll('[role=columnheader] .hy-sr')).map(function (e) { return e.textContent; })`),
        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
      assert.deepEqual(await ev(`Array.from(document.querySelectorAll('.hy-month-view__nav button')).map(function (e) { return e.getAttribute('aria-label') || e.textContent; })`),
        ['Previous Month', 'Next Month', 'Today']);
    });

    it('follows firstDayOfWeek and locale', async () => {
      await mount(`mv({ firstDayOfWeek: 1, locale: 'de-DE' })`);
      assert.equal(await ev(`document.querySelector('[role=gridcell]').getAttribute('data-day')`), '2025-10-27');
      assert.equal(await ev(`document.querySelector('[role=columnheader] .hy-sr').textContent`), 'Montag');
    });

    it('names each day by its full date and entry count, and marks today without colour', async () => {
      await mount('mv()');
      assert.equal(await ev(`document.querySelector(${q(DAY(4))}).getAttribute('aria-label')`), 'Tuesday 4 November, 5 entries');
      assert.equal(await ev(`document.querySelector(${q(DAY(12))}).getAttribute('aria-label')`), 'Wednesday 12 November, 1 entry');
      await mount('mv({ defaultMonth: new Date() })');
      assert.equal(await count('[role=gridcell][aria-current=date]'), 1);
      assert.match(await ev(`document.querySelector('[aria-current=date]').getAttribute('aria-label')`), /, today$/);
      assert.equal(await ev(`getComputedStyle(document.querySelector('.is-today .hy-month-view__num')).fontWeight`), '700');
    });

    it('shows maxPerDay entries then +N more, and activating a day or +N more calls onDayOpen', async () => {
      await mount('mv()');
      assert.equal(await count(`${DAY(4)} .hy-month-view__entry`), 3);
      assert.equal(await ev(`document.querySelector(${q(DAY(4) + ' .hy-month-view__more')}).textContent`), '+2 more');
      assert.deepEqual(await ev(`Array.from(document.querySelectorAll(${q(DAY(4) + ' .hy-month-view__entry')})).map(function (e) { return e.textContent; })`), ['Deploy web', 'Release v2.4', 'Maintenance window']);
      assert.equal(await count(`${DAY(12)} .hy-month-view__more`), 0);
      await click(`${DAY(4)} .hy-month-view__more`);
      assert.deepEqual(await logged(), ['day 4']);
      await click(`${DAY(12)} .hy-month-view__num`);
      assert.deepEqual(await logged(), ['day 12']);
      await mount('mv({ maxPerDay: 1 })');
      assert.equal(await count(`${DAY(4)} .hy-month-view__entry`), 1);
      assert.equal(await ev(`document.querySelector(${q(DAY(4) + ' .hy-month-view__more')}).textContent`), '+4 more');
    });

    it('renders entries as links, buttons or text, and a click on an entry does not open the day', async () => {
      await mount('mv()');
      assert.equal(await ev(`document.querySelector(${q(DAY(4) + ' .hy-month-view__entry')}).tagName`), 'A');
      assert.equal(await ev(`document.querySelector(${q(DAY(4) + ' .hy-month-view__entry')}).getAttribute('href')`), '#web');
      assert.equal(await ev(`document.querySelectorAll(${q(DAY(4) + ' .hy-month-view__entry')})[1].tagName`), 'BUTTON');
      assert.equal(await ev(`document.querySelectorAll(${q(DAY(4) + ' .hy-month-view__entry')})[2].tagName`), 'SPAN');
      await click(`${DAY(4)} li:nth-child(2) .hy-month-view__entry`);
      assert.deepEqual(await logged(), ['open b']);
    });

    it('is one Tab stop on a day cell, with arrows, Page Up/Down, Home/End and Enter', async () => {
      await mount('mv()');
      assert.equal(await count('[role=gridcell][tabindex="0"]'), 1);
      assert.equal(await count('[role=gridcell][tabindex="-1"]'), 41);
      await focusDay(12);
      await key('ArrowRight'); assert.equal(await active(), '2025-11-13');
      await key('ArrowDown'); assert.equal(await active(), '2025-11-20');
      await key('ArrowLeft'); await key('ArrowUp'); assert.equal(await active(), '2025-11-12');
      await key('Home'); assert.equal(await active(), '2025-11-09');
      await key('End'); assert.equal(await active(), '2025-11-15');
      assert.equal(await ev(`document.querySelector('[role=gridcell][tabindex="0"]').getAttribute('data-day')`), '2025-11-15');
      await key('PageDown');
      await until(`document.querySelector('.hy-month-view__title').textContent === 'December 2025'`, 'December');
      await until(`document.activeElement.getAttribute('data-day') === '2025-12-15'`, 'focus on 15 December');
      await key('PageUp'); await key('PageUp');
      await until(`document.querySelector('.hy-month-view__title').textContent === 'October 2025'`, 'October');
      await until(`document.activeElement.getAttribute('data-day') === '2025-10-15'`, 'focus on 15 October');
      await key('PageDown');
      await until(`document.activeElement.getAttribute('data-day') === '2025-11-15'`, 'back in November');
      await key('Enter');
      assert.deepEqual(await logged(), ['day 15']);
    });

    it('stays in the month on a drawn neighbouring day and changes month when the arrows leave the grid', async () => {
      await mount('mv()');
      await focusDay(1);
      await key('ArrowLeft');
      assert.equal(await active(), '2025-10-31');
      assert.equal(await titleText(), 'November 2025');
      await ev(`document.querySelector('[data-day="2025-12-06"]').focus()`);
      await key('ArrowRight');
      await until(`document.querySelector('.hy-month-view__title').textContent === 'December 2025'`, 'December');
      await until(`document.activeElement.getAttribute('data-day') === '2025-12-07'`, 'focus on 7 December');
    });

    it('Tab from the focused day walks its entries and +N more, and the next Tab leaves the grid', async () => {
      await mount(`h('div', null, mv(), h('button', { id: 'after' }, 'After'))`);
      await focusDay(4);
      const seq = [];
      for (let i = 0; i < 4; i++) { await key('Tab'); seq.push(await active()); }
      // Text entries are not focusable: the stops are the link, the button and "+N more", then the next control.
      assert.deepEqual(seq, ['Deploy web', 'Release v2.4', '+2 more', 'After']);
      assert.equal(await count('[role=grid] a[tabindex="-1"], [role=grid] button[tabindex="-1"]') > 0, true, 'other days keep their entries out of the Tab order');
    });

    it('drives month through onMonthChange when controlled, and uncontrolled otherwise', async () => {
      await mount(`mv({ month: new Date(2025, 10, 20), defaultMonth: undefined, onMonthChange: function (m) { log.push('month ' + m.getMonth() + '/' + m.getDate()); } })`);
      await click('[aria-label="Next Month"]');
      assert.deepEqual(await logged(), ['month 11/1']);
      assert.equal(await titleText(), 'November 2025', 'a controlled month waits for the app');
      await mount('mv()');
      await click('[aria-label="Next Month"]');
      await until(`document.querySelector('.hy-month-view__title').textContent === 'December 2025'`, 'December');
      await click('[aria-label="Previous Month"]'); await click('[aria-label="Previous Month"]');
      assert.equal(await titleText(), 'October 2025');
      await click('.hy-month-view__nav button:last-child');
      assert.notEqual(await titleText(), 'October 2025');
    });
  });

  describe('narrow', { skip: skipNoChrome }, () => {
    before(() => fresh(375, true));
    const narrowMv = (props) => `h('div', { style: { width: 340 } }, mv(${props || ''}))`;

    it('switches to dots in a container under sm, whatever the viewport', async () => {
      await mount(narrowMv());
      await until(`document.querySelector('.hy-month-view.is-narrow')`, 'the narrow form');
      assert.equal(await count(`${DAY(4)} .hy-month-view__dots .hy-month-view__mark`), 3, 'up to three dots');
      assert.equal(await count(`${DAY(12)} .hy-month-view__dots .hy-month-view__mark`), 1);
      assert.equal(await ev(`getComputedStyle(document.querySelector(${q(DAY(4) + ' .hy-month-view__entries')})).display`), 'none');
      assert.ok((await rectOf(DAY(4))).h >= 44, 'a day is a touch target');
      await mount(`h('div', { style: { width: 700 } }, mv())`);
      await sleep(100);
      assert.equal(await count('.hy-month-view.is-narrow'), 0);
      assert.equal(await ev(`getComputedStyle(document.querySelector(${q(DAY(4) + ' .hy-month-view__dots')})).display`), 'none');
    });

    it('selects a day on tap or Enter instead of opening it, and lists its entries with links and buttons', async () => {
      await mount(narrowMv());
      await until(`document.querySelector('.hy-month-view.is-narrow')`, 'the narrow form');
      await tap(DAY(4));
      await until(`document.querySelector('.hy-month-view__list-entries')`, 'the list');
      assert.deepEqual(await logged(), []);
      assert.equal(await count('.hy-month-view__list-entries li'), 5, 'every entry, not only maxPerDay');
      assert.equal(await ev(`document.querySelector('.hy-month-view__list-entries a').getAttribute('href')`), '#web');
      assert.equal(await count('.hy-month-view__list-entries button'), 1);
      assert.equal(await ev(`document.querySelector(${q(DAY(4))}).getAttribute('aria-selected')`), 'true');
      await focusDay(12);
      await key('Enter');
      await until(`document.querySelector('.hy-month-view__list-entries li').textContent === 'Deploy docs'`, 'the new day');
      assert.deepEqual(await logged(), []);
    });

    it('selects through selectedDate and onSelectedDateChange when controlled', async () => {
      await mount(narrowMv(`{ selectedDate: new Date(2025, 10, 12), onSelectedDateChange: function (d) { log.push('sel ' + d.getDate()); } }`));
      await until(`document.querySelector('.hy-month-view__list-entries')`, 'the list');
      assert.equal(await ev(`document.querySelector('.hy-month-view__list-entries li').textContent`), 'Deploy docs');
      await tap(DAY(4));
      assert.deepEqual(await logged(), ['sel 4']);
      assert.equal(await ev(`document.querySelector('.hy-month-view__list-entries li').textContent`), 'Deploy docs', 'the app owns the selection');
    });

    it('fits the phone width with no horizontal overflow', async () => {
      await mount(`h('div', { style: { width: '100%' } }, mv())`);
      await until(`document.querySelector('.hy-month-view.is-narrow')`, 'the narrow form');
      assert.ok(await ev(`document.documentElement.scrollWidth <= window.innerWidth`));
    });
  });
});
