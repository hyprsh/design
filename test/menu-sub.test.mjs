// Tests for Menu's nested submenus (hyprsh/design#63), driven through real input in headless Chrome: React and the built
// bundle are needed for focus, placement and pointer paths. Needs network access for React (a CDN) and Chrome
// (see scripts/chrome.mjs); without Chrome the suite is skipped.
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
var H = window.Hyprsh, h = React.createElement, log = [];
var root = ReactDOM.createRoot(document.getElementById('root'));
function show(el) { root.render(el); }
</script></body></html>`;

// The same menu in every container: Open In ›, with Browser › and a plain Reveal item, a sibling submenu Share ›.
const ITEMS = `
  h(H.MenuItem, { onSelect: function () { log.push('rename'); } }, 'Rename'),
  h(H.MenuSub, null,
    h(H.MenuSubTrigger, { prefix: h(H.Icon, { name: 'external-link' }) }, 'Open In'),
    h(H.Menu, null,
      h(H.MenuItem, { onSelect: function () { log.push('editor'); } }, 'Editor'),
      h(H.MenuSection, { title: 'Browser' }, h(H.MenuItem, { checked: true }, 'Preview')),
      h(H.MenuDivider),
      h(H.MenuSub, null,
        h(H.MenuSubTrigger, null, 'Terminal'),
        h(H.Menu, null, h(H.MenuItem, { onSelect: function () { log.push('deep'); } }, 'Shell'), h(H.MenuItem, null, 'Logs'))),
      h(H.MenuLink, { href: '#docs' }, 'Docs'))),
  h(H.MenuSub, null,
    h(H.MenuSubTrigger, { disabled: true }, 'Archive'),
    h(H.Menu, null, h(H.MenuItem, null, 'Zip'))),
  h(H.MenuSub, null,
    h(H.MenuSubTrigger, null, 'Share'),
    h(H.Menu, null, h(H.MenuItem, { onSelect: function () { log.push('copy'); } }, 'Copy Link'))),
  h(H.MenuItem, null, 'Reveal')`;
const MENU = (style) => `show(h('div', { id: 'wrap', style: ${style || '{ padding: 40 }'} },
  h(H.MenuContainer, null, h(H.MenuButton, null, 'Actions'), h(H.Menu, null, ${ITEMS}))))`;

let server, chrome, port;
const canRun = existsSync(CHROME);
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
  await chrome.send("Page.enable");
});
after(async () => {
  if (chrome) await chrome.close();
  if (server) server.close();
});

const ev = (js) => chrome.evaluate(js);
// A clean page at this width. Navigating is slow (React comes from a CDN), so the page is only loaded when the width or
// touch emulation changes; otherwise the menu is unmounted and the log cleared.
let loaded = '';
async function fresh(width, touch) {
  const key = `${width}/${!!touch}`;
  if (loaded === key) { await ev('show(null); log.length = 0'); await sleep(50); return; }
  await chrome.emulate({ width, height: 700, scale: 1, touch: !!touch });
  await chrome.goto(`http://127.0.0.1:${port}/__t`);
  loaded = key;
}
async function until(js, what) {
  for (let i = 0; i < 40; i++) { if (await ev("!!(" + js + ")")) return; await sleep(50); }
  assert.fail('timed out waiting for ' + what);
}
const rectOf = async (sel, nth = 0) => (await until(`document.querySelectorAll(${JSON.stringify(sel)}).length > ${nth}`, sel), ev(`(function () { var r = document.querySelectorAll(${JSON.stringify(sel)})[${nth}].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; })()`));
const textOf = (sel) => ev(`(document.querySelector(${JSON.stringify(sel)}) || {}).textContent`);
const active = () => ev(`(document.activeElement.textContent || '').trim() || document.activeElement.id`);
const triggerSel = (label) => `[aria-haspopup="menu"][data-label="${label}"]`;
const moveTo = (x, y) => chrome.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
async function hover(sel) { const r = await rectOf(sel); await moveTo(r.x + r.w / 2, r.y + r.h / 2); }
async function click(sel) {
  const r = await rectOf(sel), x = r.x + r.w / 2, y = r.y + r.h / 2;
  if (loaded.endsWith('true')) {  // phone emulation turns mouse input into touches and then waits forever: tap instead
    await chrome.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await chrome.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    return;
  }
  await moveTo(x, y);
  await chrome.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await chrome.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}
const KEYS = { ArrowRight: 39, ArrowLeft: 37, ArrowDown: 40, ArrowUp: 38, Enter: 13, Escape: 27, Tab: 9, ' ': 32 };
async function press(key) {
  const p = { key, code: key === ' ' ? 'Space' : key, windowsVirtualKeyCode: KEYS[key] || key.toUpperCase().charCodeAt(0) };
  await chrome.send('Input.dispatchKeyEvent', { type: key.length === 1 || key === 'Enter' ? 'keyDown' : 'rawKeyDown', ...p, text: key === 'Enter' ? '\r' : key.length === 1 ? key : undefined });
  await chrome.send('Input.dispatchKeyEvent', { type: 'keyUp', ...p });
}
// Triggers are found by their label text; tag the rows so selectors stay short.
const tag = () => ev(`document.querySelectorAll('[role^="menuitem"]').forEach(function (el) { el.setAttribute('data-label', el.textContent.trim()); })`);
const menus = () => ev(`document.querySelectorAll('[role="menu"]').length`);
const itemSel = (label) => `[role^="menuitem"][data-label="${label}"]`;

describe('Menu.Sub', { concurrency: false }, () => {
describe('on desktop', { skip: !canRun && 'Chrome not found' }, () => {
  before(() => fresh(1000));

  it('opens beside the parent on hover, its first item level with the trigger', async () => {
    await ev(MENU());
    await click('#wrap button');
    await until(`document.querySelector('[role="menu"]')`, 'the menu');
    await tag();
    await hover(triggerSel('Open In'));
    await until(`document.querySelectorAll('[role="menu"]').length === 2`, 'the submenu');
    await tag();
    const parent = await rectOf('[role="menu"]', 0), sub = await rectOf('[role="menu"]', 1), trig = await rectOf(triggerSel('Open In'));
    assert.ok(sub.x >= parent.r - 1, `submenu starts at ${sub.x}, parent ends at ${parent.r}`);
    const first = await rectOf(itemSel('Editor'));
    assert.ok(Math.abs(first.y - trig.y) <= 2, `first item at ${first.y}, trigger at ${trig.y}`);
  });

  it('gives the trigger menu semantics and labels the submenu by it', async () => {
    assert.equal(await ev(`document.querySelector(${JSON.stringify(triggerSel('Open In'))}).getAttribute('aria-haspopup')`), 'menu');
    assert.equal(await ev(`document.querySelector(${JSON.stringify(triggerSel('Open In'))}).getAttribute('aria-expanded')`), 'true');
    assert.equal(await ev(`document.querySelector(${JSON.stringify(triggerSel('Share'))}).getAttribute('aria-expanded')`), 'false');
    assert.equal(await ev(`(function () { var m = document.querySelectorAll('[role="menu"]')[1]; return document.getElementById(m.getAttribute('aria-labelledby')).textContent.trim(); })()`), 'Open In');
  });

  it('keeps the submenu open while the pointer crosses sibling items toward it', async () => {
    const trig = await rectOf(triggerSel('Open In')), sub = await rectOf('[role="menu"]', 1);
    // Start inside the trigger, then head diagonally down-right across Archive and Share into the submenu in small steps.
    const x0 = trig.x + trig.w - 20, y0 = trig.y + trig.h / 2;
    const x1 = sub.x + 20, y1 = sub.y + 90;
    await moveTo(x0, y0);
    for (let i = 1; i <= 8; i++) { await moveTo(x0 + ((x1 - x0) * i) / 8, y0 + ((y1 - y0) * i) / 8); await sleep(15); }
    await sleep(400);
    assert.equal(await menus(), 2, 'submenu closed on the way');
    assert.equal(await ev(`document.querySelector(${JSON.stringify(triggerSel('Share'))}).getAttribute('aria-expanded')`), 'false');
    assert.equal(await ev(`document.querySelector(${JSON.stringify(triggerSel('Open In'))}).getAttribute('aria-expanded')`), 'true');
  });

  it('switches to a sibling submenu when the pointer rests on its trigger', async () => {
    await hover(triggerSel('Share'));
    await until(`document.querySelector('[aria-haspopup][data-label="Share"]').getAttribute('aria-expanded') === 'true'`, 'Share to open');
    await until(`document.querySelector('[aria-haspopup][data-label="Open In"]').getAttribute('aria-expanded') === 'false'`, 'Open In to close');
    assert.equal(await menus(), 2, 'only one submenu per level');
  });

  it('closes the submenu when the pointer rests on a plain item', async () => {
    await hover(itemSel('Rename'));
    await until(`document.querySelectorAll('[role="menu"]').length === 1`, 'the submenu to close');
  });

  it('does not open a disabled trigger', async () => {
    await hover(triggerSel('Archive'));
    await sleep(500);
    assert.equal(await menus(), 1);
    assert.equal(await ev(`document.querySelector(${JSON.stringify(triggerSel('Archive'))}).getAttribute('aria-disabled')`), 'true');
  });

  it('opens on click', async () => {
    await click(triggerSel('Share'));
    await until(`document.querySelectorAll('[role="menu"]').length === 2`, 'the submenu');
  });

  it('opens with ArrowRight, Enter and Space, focusing the first item', async () => {
    for (const key of ['ArrowRight', 'Enter', ' ']) {
      await fresh(1000);
      await ev(MENU());
      await click('#wrap button');
      await until(`document.querySelector('[role="menu"]')`, 'the menu');
      await tag();
      await press('ArrowDown'); await press('ArrowDown');
      assert.equal(await active(), 'Open In');
      await press(key);
      await until(`document.querySelectorAll('[role="menu"]').length === 2`, `the submenu on "${key}"`);
      await tag();
      assert.equal(await active(), 'Editor', `focus after "${key}"`);
    }
  });

  it('keeps arrows, Home, End and typeahead inside the submenu', async () => {
    await press('ArrowDown');
    assert.equal(await active(), 'Preview');
    await press('End');
    assert.equal(await active(), 'Docs');
    await press('Home');
    assert.equal(await active(), 'Editor');
    await press('t');
    assert.equal(await active(), 'Terminal');
    assert.equal(await menus(), 2);
  });

  it('closes only the submenu on ArrowLeft and Escape, returning focus to the trigger', async () => {
    for (const key of ['ArrowLeft', 'Escape']) {
      await press('Home');
      await press(key);
      await until(`document.querySelectorAll('[role="menu"]').length === 1`, `the submenu to close on ${key}`);
      assert.equal(await active(), 'Open In', `focus after ${key}`);
      assert.equal(await ev(`document.querySelector('[data-label="Open In"]').getAttribute('aria-expanded')`), 'false');
      await press('ArrowRight');
      await until(`document.querySelectorAll('[role="menu"]').length === 2`, 'the submenu again');
      await tag();
    }
  });

  it('nests two levels, and Escape closes one level at a time', async () => {
    await press('t');
    await press('ArrowRight');
    await until(`document.querySelectorAll('[role="menu"]').length === 3`, 'the second level');
    await tag();
    assert.equal(await active(), 'Shell');
    await press('Escape');
    await until(`document.querySelectorAll('[role="menu"]').length === 2`, 'back to one submenu');
    assert.equal(await active(), 'Terminal');
  });

  it('selecting an item calls onSelect, closes every menu and focuses the top trigger', async () => {
    await press('ArrowRight');
    await until(`document.querySelectorAll('[role="menu"]').length === 3`, 'the second level');
    await press('Enter');
    await until(`document.querySelectorAll('[role="menu"]').length === 0`, 'every menu to close');
    assert.deepEqual(await ev(`log.slice()`), ['deep']);
    assert.equal(await active(), 'Actions');
  });

  it('keeps a click inside the submenu from dismissing the menu, and an outside click closes all', async () => {
    await fresh(1000);
    await ev(MENU());
    await click('#wrap button');
    await until(`document.querySelector('[role="menu"]')`, 'the menu');
    await tag();
    await click(triggerSel('Open In'));
    await until(`document.querySelectorAll('[role="menu"]').length === 2`, 'the submenu');
    await tag();
    await click(itemSel('Preview'));       // a checked item stays open
    await sleep(100);
    assert.equal(await menus(), 2);
    await moveTo(900, 600);
    await chrome.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 900, y: 600, button: 'left', clickCount: 1 });
    await chrome.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 900, y: 600, button: 'left', clickCount: 1 });
    await until(`document.querySelectorAll('[role="menu"]').length === 0`, 'every menu to close');
  });

  it('Tab closes everything', async () => {
    await fresh(1000);
    await ev(MENU());
    await click('#wrap button');
    await until(`document.querySelector('[role="menu"]')`, 'the menu');
    await tag();
    await press('ArrowDown'); await press('ArrowDown'); await press('ArrowRight');
    await until(`document.querySelectorAll('[role="menu"]').length === 2`, 'the submenu');
    await press('Tab');
    await until(`document.querySelectorAll('[role="menu"]').length === 0`, 'every menu to close');
  });

  it('flips to the left near the right edge of the window', async () => {
    await fresh(1000);
    await ev(MENU('{ padding: 40, display: "flex", justifyContent: "flex-end" }'));
    await click('#wrap button');
    await until(`document.querySelector('[role="menu"]')`, 'the menu');
    await tag();
    await hover(triggerSel('Open In'));
    await until(`document.querySelectorAll('[role="menu"]').length === 2`, 'the submenu');
    const parent = await rectOf('[role="menu"]', 0), sub = await rectOf('[role="menu"]', 1);
    assert.ok(sub.r <= parent.x + 1, `submenu ends at ${sub.r}, parent starts at ${parent.x}`);
    assert.ok(sub.x >= 8, 'stays inside the screen');
  });
});

describe('in ContextMenu and DotsMenu', { skip: !canRun && 'Chrome not found' }, () => {
  before(() => fresh(1000));

  it('works in DotsMenu', async () => {
    await ev(`show(h('div', { style: { padding: 40 } }, h(H.DotsMenu, { 'aria-label': 'More' }, ${ITEMS})))`);
    await click('[aria-label="More"]');
    await until(`document.querySelector('[role="menu"]')`, 'the menu');
    await tag();
    await hover(triggerSel('Open In'));
    await until(`document.querySelectorAll('[role="menu"]').length === 2`, 'the submenu');
    assert.equal(await ev(`document.querySelectorAll('[role="menu"]')[1].getAttribute('aria-labelledby') === document.querySelector('[data-label="Open In"]').id`), true);
  });

  it('works in ContextMenu, returning focus to the trigger area', async () => {
    await ev(`show(h(H.ContextMenu, null, h(H.ContextMenuTrigger, { id: 'area', style: { height: 200, margin: 40 } }, 'Right-click'), h(H.ContextMenuContent, null, ${ITEMS})))`);
    await chrome.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 120, y: 120, button: 'right', buttons: 2, clickCount: 1 });
    await chrome.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 120, y: 120, button: 'right', clickCount: 1 });
    await until(`document.querySelector('[role="menu"]')`, 'the menu');
    await tag();
    await hover(triggerSel('Open In'));
    await until(`document.querySelectorAll('[role="menu"]').length === 2`, 'the submenu');
    await tag();
    await click(itemSel('Editor'));
    await until(`document.querySelectorAll('[role="menu"]').length === 0`, 'every menu to close');
    assert.deepEqual(await ev(`log.slice()`), ['editor']);
  });
});

describe('under touch sizing', { skip: !canRun && 'Chrome not found' }, () => {
  before(() => fresh(375, true));

  it('drills in place with a Back row and nothing beside the list', async () => {
    await ev(MENU());
    await click('#wrap button');
    await until(`document.querySelector('[role="menu"]')`, 'the menu');
    await tag();
    await click(triggerSel('Open In'));
    await until(`[...document.querySelectorAll('[role^="menuitem"]')].some(function (el) { return el.textContent.trim() === 'Editor' && el.offsetParent; })`, 'the submenu items');
    await tag();
    const visible = await ev(`[...document.querySelectorAll('[role^="menuitem"]')].filter(function (el) { return el.offsetParent; }).map(function (el) { return el.textContent.trim(); })`);
    assert.deepEqual(visible, ['Open In', 'Editor', 'Preview', 'Terminal', 'Docs'], 'a Back row headed by the label, then the submenu items');
    assert.equal(await ev(`document.querySelector('.hy-menu__back') && document.querySelector('.hy-menu__back').getAttribute('role')`), 'menuitem');
  });

  it('keeps the touch-target height on the Back row and the rows', async () => {
    await sleep(400);  // the list's pop-in animation scales it for 150ms
    const rows = await ev(`[...document.querySelectorAll('[role^="menuitem"]')].filter(function (el) { return el.offsetParent; }).map(function (el) { return el.getBoundingClientRect().height; })`);
    for (const hgt of rows) assert.ok(hgt >= 44, `row is ${hgt}px`);
  });

  it('returns with Back, ArrowLeft and Escape, focusing the trigger, and the parent stays open', async () => {
    for (const how of ['back', 'ArrowLeft', 'Escape']) {
      if (how === 'back') await click('.hy-menu__back'); else { await press('Home'); await press(how); }
      await until(`[...document.querySelectorAll('[role^="menuitem"]')].some(function (el) { return el.textContent.trim() === 'Rename' && el.offsetParent; })`, `the parent list after ${how}`);
      await tag();
      assert.equal(await active(), 'Open In', `focus after ${how}`);
      assert.equal(await ev(`document.querySelector('[data-label="Open In"]').getAttribute('aria-expanded')`), 'false');
      if (how !== 'Escape') { await click(triggerSel('Open In')); await until(`!!document.querySelector('.hy-menu__back')`, 'the drilled list'); await tag(); }
    }
  });

  it('closes everything when an item in the drilled list is chosen', async () => {
    await click(triggerSel('Open In'));
    await until(`!!document.querySelector('.hy-menu__back')`, 'the drilled list');
    await tag();
    await click(itemSel('Editor'));
    await until(`document.querySelectorAll('[role="menu"]').length === 0`, 'every menu to close');
    assert.equal((await ev(`log.slice()`)).pop(), 'editor');
  });
});

describe('without submenus', { skip: !canRun && 'Chrome not found' }, () => {
  before(() => fresh(1000));
  it('render no chevron or haspopup rows and still select and close', async () => {
    await ev(`show(h('div', { id: 'wrap', style: { padding: 40 } }, h(H.MenuContainer, null, h(H.MenuButton, null, 'Actions'),
      h(H.Menu, null, h(H.MenuItem, { onSelect: function () { log.push('a'); } }, 'Alpha'), h(H.MenuItem, null, 'Beta')))))`);
    await click('#wrap button');
    await until(`document.querySelector('[role="menu"]')`, 'the menu');
    assert.equal(await ev(`document.querySelectorAll('[aria-haspopup="menu"]').length`), 1, 'only the button');
    await press('ArrowDown'); await press('Enter');
    await until(`document.querySelectorAll('[role="menu"]').length === 0`, 'the menu to close');
    assert.deepEqual(await ev(`log.slice()`), ['a']);
  });
});
});
