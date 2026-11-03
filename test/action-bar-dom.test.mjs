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
  return h('div', { id: 'scroller', style: { height: props.height || 200, width: props.width, overflowY: 'auto', paddingBottom: props.tabbar ? 'var(--tab-bar-height)' : 0 } },
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
const spoken = () => ev(`document.querySelector('#scroller .hy-sr').textContent`);

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

  it('clears the last row at the end of the scroll when the offset is large (a notched phone)', async () => {
    await fresh();
    /* The offset is max(--tab-bar-height, safe area) + gap; a 34px --tab-bar-height stands in for a 34px safe area. */
    await ev(`document.documentElement.style.setProperty('--tab-bar-height', '34px')`);
    try {
      await ev(`show(h(Screen))`);
      await until(`document.querySelector('.hy-action-bar')`, 'the bar');
      await ev(`document.getElementById('scroller').scrollTop = 1e6`);
      await sleep(50);
      const bar = await rectOf('.hy-action-bar'), last = await rectOf('#row-20'), box = await rectOf('#scroller');
      assert.ok(bar.y >= last.b - 0.5, `the bar (${bar.y}) does not cover the last row (ends ${last.b})`);
      assert.ok(Math.abs(bar.b - (box.b - 42)) < 1, `the bar ends 34px + 8px above the foot (${bar.b} vs ${box.b})`);
    } finally { await ev(`document.documentElement.style.removeProperty('--tab-bar-height')`); }
  });

  it('renders no bar while closed but keeps the live region mounted and empty', async () => {
    await fresh();
    await ev(`show(h(Screen, { bar: { open: false } }))`);
    await until(`document.querySelector('#scroller')`, 'the screen');
    assert.equal(await ev(`document.querySelectorAll('.hy-action-bar').length`), 0);
    assert.equal(await ev(`document.querySelector('#scroller .hy-sr[role="status"]').textContent`), '');
    await ev(`window.__region = document.querySelector('#scroller .hy-sr[role="status"]'); 0`);
    await ev(`show(h(Screen))`);
    await until(`document.querySelector('.hy-action-bar')`, 'the bar');
    assert.equal(await ev(`document.querySelector('#scroller .hy-sr[role="status"]') === window.__region`), true, 'the same node, so only its text changes');
    await until(`window.__region.textContent === '3 unsaved changes'`, 'the announcement');
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
    await ev(`document.getElementById('scroller').scrollTop = 1e6`);
    await sleep(50);
    const end = await rectOf('.hy-action-bar'), last = await rectOf('#row-20'), cap2 = await rectOf('.hy-tabbar__capsule');
    assert.ok(end.y >= last.b - 0.5, 'the bar does not cover the last row at the end of the scroll');
    assert.ok(end.b <= cap2.y + 0.5, 'and still ends above the capsule');
  });

  it('raises the bar by the safe area when there is no TabBar', async () => {
    await fresh();
    await ev(`show(h(Screen))`);
    await until(`document.querySelector('.hy-action-bar')`, 'the bar');
    assert.match(await ev(`getComputedStyle(document.querySelector('.hy-action-bar')).bottom`), /^\d+(\.\d+)?px$/);
  });

  describe('surface', () => {
    const alpha = (c) => { const m = c.match(/rgba?\(([^)]+)\)|color\(([^)]+)\)/); const p = (m[1] || m[2]).split(/[ ,/]+/).filter(Boolean); const i = m[2] ? 4 : 3; return p.length > i ? Number(p[i]) : 1; };
    const s = '.hy-action-bar__surface';
    /* A token's resolved colour, read off a probe element. */
    const token = (name) => ev(`(function () { var d = document.createElement('div'); d.style.color = 'var(${name})'; document.body.appendChild(d); var c = getComputedStyle(d).color; d.remove(); return c; })()`);
    const style = (sel, prop) => ev(`getComputedStyle(document.querySelector(${JSON.stringify(sel)}))[${JSON.stringify(prop)}]`);
    it('is a solid inverted capsule with no blur, and opaque changes nothing', async () => {
      await fresh();
      await ev(`show(h(Screen))`);
      await until(`document.querySelector('.hy-action-bar')`, 'the bar');
      const bg = await style(s, 'backgroundColor');
      assert.equal(alpha(bg), 1);
      assert.equal(bg, await token('--gray-1000'));
      assert.equal(await style(s, 'color'), await token('--background-100'));
      assert.equal(await style(s, 'backdropFilter'), 'none');
      await ev(`show(h(Screen, { bar: { opaque: true } }))`);
      await sleep(80);
      assert.equal(await style(s, 'backgroundColor'), bg);
      assert.equal(await ev(`document.querySelector('.hy-action-bar').className`), 'hy-action-bar');
    });
    it('flips with the theme', async () => {
      await fresh();
      await ev(`document.documentElement.setAttribute('data-theme', 'dark')`);
      try {
        await ev(`show(h(Screen))`);
        await until(`document.querySelector('.hy-action-bar')`, 'the bar');
        assert.equal(await style(s, 'backgroundColor'), await token('--gray-1000'));
        assert.equal(await style(s, 'color'), await token('--background-100'));
      } finally { await ev(`document.documentElement.setAttribute('data-theme', 'light')`); }
    });
    it('hugs its content, centred in the container', async () => {
      await fresh();
      await ev(`show(h(Screen))`);
      await until(`document.querySelector('.hy-action-bar')`, 'the bar');
      const box = await rectOf('#scroller'), cap = await rectOf(s);
      assert.ok(cap.r - cap.x < (box.r - box.x) / 2, `the capsule (${cap.r - cap.x}px) hugs its content in ${box.r - box.x}px`);
      const inner = await ev(`document.getElementById('scroller').clientWidth`);
      assert.ok(Math.abs((cap.x - box.x) - (box.x + inner - cap.r)) < 1.5, 'centred');
    });
    it('never grows wider than the container less the gap', async () => {
      await fresh();
      await ev(`show(h(Screen, { width: 520, bar: { label: 'A very long label that keeps going and going so it would be far wider than the container', actions: h(F, null, h(H.Button, { size: 'small' }, 'Discard Every Change'), h(H.Button, { id: 'save', size: 'small', variant: 'primary' }, 'Save')) } }))`);
      await until(`document.querySelector('.hy-action-bar')`, 'the bar');
      const box = await rectOf('#scroller'), cap = await rectOf(s);
      const inner = await ev(`document.getElementById('scroller').clientWidth`);
      assert.ok(cap.x >= box.x + 8 - 0.5 && cap.r <= box.x + inner - 8 + 0.5, `the capsule ${cap.x}–${cap.r} stays 8px inside ${box.x}–${box.x + inner}`);
    });

    describe('narrow', () => {
      const selection = `{ count: 2, total: 6, onSelectAll: function () { window.__picked = 'all'; }, onClear: function () {} }`;
      const secondary = `[{ label: 'Unmonitor', onSelect: function () { window.__picked = 'unmonitor'; } }]`;
      it('folds Select All and the secondary actions into a More menu when the container is under 480px', async () => {
        await fresh();
        await ev(`show(h(Screen, { width: 400, bar: { label: undefined, selection: ${selection}, secondaryActions: ${secondary} } }))`);
        await until(`document.querySelector('.hy-action-bar--narrow')`, 'the narrow bar');
        const box = await rectOf('#scroller'), cap = await rectOf(s);
        const inner = await ev(`document.getElementById('scroller').clientWidth`);
        assert.ok(Math.abs(cap.r - cap.x - (inner - 16)) < 1, `the capsule spans the width less the gap (${cap.r - cap.x} vs ${inner - 16})`);
        assert.equal(await ev(`[].some.call(document.querySelectorAll('.hy-action-bar button'), function (b) { return /Select All|Unmonitor/.test(b.textContent); })`), false);
        assert.equal(await ev(`document.querySelector('.hy-action-bar__row').getBoundingClientRect().height`), 44, 'one line');
        assert.ok(await ev(`!!document.querySelector('.hy-action-bar__count [aria-label="Clear Selection"]')`));
        assert.ok(await ev(`!!document.getElementById('save')`), 'the action stays visible');
        await ev(`document.querySelector('.hy-action-bar [aria-label="More Actions"]').click()`);
        await until(`document.querySelectorAll('[role="menu"] [role="menuitem"]').length === 2`, 'the menu items');
        assert.deepEqual(await ev(`[].map.call(document.querySelectorAll('[role="menu"] [role="menuitem"]'), function (m) { return m.textContent; })`), ['Select All 6', 'Unmonitor']);
        await ev(`document.querySelector('[role="menu"] [role="menuitem"]').click()`);
        await until(`window.__picked === 'all'`, 'Select All from the menu');
      });
      const discardSave = `h(F, null, h(H.Button, { size: 'small', variant: 'tertiary' }, 'Discard'), h(H.Button, { id: 'save', size: 'small', variant: 'primary' }, 'Save'))`;
      /* Whether an element shows all its text: nothing clipped, no ellipsis. */
      const whole = (sel) => ev(`(function () { var e = document.querySelector(${JSON.stringify(sel)}), cs = getComputedStyle(e); return e.scrollWidth <= e.clientWidth + 0.5 && e.scrollHeight <= e.clientHeight + 0.5 && cs.textOverflow !== 'ellipsis'; })()`);
      it('keeps the label whole and gives it its own line when it doesn’t fit beside Discard and Save (340px)', async () => {
        await fresh();
        const label = '12 unsaved changes in 3 files';
        await ev(`show(h(Screen, { width: 340, bar: { tone: 'warning', label: ${JSON.stringify(label)}, actions: ${discardSave} } }))`);
        await until(`document.querySelector('.hy-action-bar--stacked')`, 'the stacked bar');
        assert.equal(await ev(`document.querySelector('.hy-action-bar__label-text').textContent`), label);
        assert.ok(await whole('.hy-action-bar__label-text'), 'the label is not cut short');
        assert.ok(await whole('.hy-action-bar__label'));
        const lead = await rectOf('.hy-action-bar__label'), controls = await rectOf('.hy-action-bar__controls'), save = await rectOf('#save'), row = await rectOf('.hy-action-bar__row');
        assert.ok(controls.y >= lead.b - 0.5, `the controls (${controls.y}) sit below the label (${lead.b})`);
        assert.ok(Math.abs(save.r - (row.r - 6)) < 1, 'right-aligned on the second line');
        assert.equal(await ev(`getComputedStyle(document.querySelector('.hy-action-bar__sep')).visibility`), 'hidden', 'no separator at the start of the line');
        assert.ok(row.h > 60, `the capsule grows (${row.h}px)`);
      });
      it('keeps one line in the narrow form while the label and the controls fit', async () => {
        await fresh();
        await ev(`show(h(Screen, { width: 340, bar: { tone: 'warning', label: '2 changes', actions: ${discardSave} } }))`);
        await until(`document.querySelector('.hy-action-bar--narrow')`, 'the narrow bar');
        await sleep(50);
        assert.equal(await ev(`!!document.querySelector('.hy-action-bar--stacked')`), false);
        assert.ok(Math.abs((await rectOf('.hy-action-bar__row')).h - 44) < 0.5, 'one line');
        assert.equal(await ev(`getComputedStyle(document.querySelector('.hy-action-bar__sep')).visibility`), 'visible');
        assert.ok(await whole('.hy-action-bar__label-text'));
      });
      it('unstacks when the container grows and the label fits again', async () => {
        await fresh();
        await ev(`show(h(Screen, { width: 340, bar: { tone: 'warning', label: '12 unsaved changes in 3 files', actions: ${discardSave} } }))`);
        await until(`document.querySelector('.hy-action-bar--stacked')`, 'the stacked bar');
        await ev(`document.getElementById('scroller').style.width = '470px'`);
        await until(`!document.querySelector('.hy-action-bar--stacked')`, 'one line again');
        assert.ok(Math.abs((await rectOf('.hy-action-bar__row')).h - 44) < 0.5);
      });
      it('shows a long error in full, wrapped, in the narrow form', async () => {
        await fresh();
        const message = 'Couldn’t save. Check your connection and try again, or copy your changes somewhere safe before you leave.';
        await ev(`show(h(Screen, { width: 340, bar: { tone: 'warning', label: '2 changes', error: ${JSON.stringify(message)}, actions: ${discardSave} } }))`);
        await until(`document.querySelector('.hy-action-bar--narrow .hy-action-bar__error')`, 'the error');
        assert.equal(await ev(`document.querySelector('.hy-action-bar__error').textContent`), message);
        assert.ok(await whole('.hy-action-bar__error'), 'the error is not cut short');
        assert.ok((await rectOf('.hy-action-bar__error')).h > 30, 'it wraps');
        assert.equal(await ev(`document.querySelector('.hy-action-bar__error').hasAttribute('title')`), false);
        const err = await rectOf('.hy-action-bar__error'), cap = await rectOf(s);
        assert.ok(err.x >= cap.x - 0.5 && err.r <= cap.r + 0.5, 'inside the capsule');
      });
      it('measures the container, not the viewport, and goes wide again when it grows', async () => {
        await fresh();
        await ev(`show(h(Screen, { width: 400, bar: { label: undefined, selection: ${selection}, secondaryActions: ${secondary} } }))`);
        await until(`document.querySelector('.hy-action-bar--narrow')`, 'the narrow bar');
        await ev(`document.getElementById('scroller').style.width = '560px'`);
        await until(`!document.querySelector('.hy-action-bar--narrow')`, 'the wide bar');
        assert.equal(await ev(`[].filter.call(document.querySelectorAll('.hy-action-bar button'), function (b) { return /^(Select All 6|Unmonitor)$/.test(b.textContent); }).length`), 2);
        assert.equal(await ev(`document.querySelectorAll('.hy-action-bar [aria-label="More Actions"]').length`), 0);
      });
    });

    describe('Buttons on the inverted surface', () => {
      const buttons = `h(F, null, h(H.Button, { id: 'sec', size: 'small', variant: 'secondary' }, 'Monitor'), h(H.Button, { id: 'ter', size: 'small', variant: 'tertiary' }, 'Discard'), h(H.Button, { id: 'save', size: 'small', variant: 'primary' }, 'Save'), h(H.Button, { id: 'off', size: 'small', variant: 'tertiary', disabled: true }, 'Off'), h(H.Button, { id: 'busy', size: 'small', variant: 'primary', loading: true }, 'Saving'), h(H.Button, { id: 'mid', variant: 'secondary' }, 'Medium'))`;
      for (const theme of ['light', 'dark']) {
        it(`restyles secondary, tertiary, primary, disabled and loading Buttons (${theme})`, async () => {
          await fresh();
          await ev(`document.documentElement.setAttribute('data-theme', ${JSON.stringify(theme)})`);
          try {
            await ev(`show(h(Screen, { bar: { actions: ${buttons} } }))`);
            await until(`document.getElementById('busy')`, 'the buttons');
            const fg = await token('--background-100'), bg = await token('--gray-1000');
            for (const id of ['#sec', '#ter']) {
              assert.equal(alpha(await style(id, 'backgroundColor')), 0, `${id} is transparent`);
              assert.equal(await style(id, 'color'), fg, `${id} has the inverted text`);
              assert.equal(await style(id, 'boxShadow'), 'none');
            }
            assert.equal(await style('#save', 'backgroundColor'), fg, 'primary takes the page colour as its fill');
            assert.equal(await style('#save', 'color'), bg);
            assert.equal(await style('#busy', 'backgroundColor'), fg, 'a busy primary keeps its fill');
            assert.equal(await style('#busy', 'color'), bg);
            const off = await style('#off', 'color');
            assert.notEqual(off, fg, 'disabled is dimmed');
            assert.ok(alpha(off) >= 0.35, `disabled text stays legible (${off})`);
            assert.equal(alpha(await style('#off', 'backgroundColor')), 0);
            for (const id of ['#sec', '#save', '#mid']) assert.equal(Math.round((await rectOf(id)).h), 32, `${id} is 32px`);
          } finally { await ev(`document.documentElement.setAttribute('data-theme', 'light')`); }
        });
      }
      it('changes the hover wash of a tertiary Button to the inverted one', async () => {
        await fresh();
        await ev(`show(h(Screen, { bar: { actions: ${buttons} } }))`);
        await until(`document.getElementById('ter')`, 'the buttons');
        const r = await rectOf('#ter');
        await chrome.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.x + 5, y: r.y + 5 });
        await sleep(250);
        const hover = await style('#ter', 'backgroundColor');
        assert.ok(alpha(hover) > 0 && alpha(hover) < 0.5, `a faint wash (${hover})`);
        assert.match(hover, /255|0\.0|color\(srgb 1 1 1/, 'mixed from the inverted text colour');
        await chrome.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 });
      });
      it('keeps 32px buttons under touch sizing and grows their hit area to the touch target', async () => {
        await fresh();
        await chrome.emulate({ width: 600, height: 700, touch: true, mobile: false });
        try {
          await ev(`show(h(Screen, { bar: { actions: h(F, null, h(H.Button, { size: 'small', variant: 'tertiary' }, 'Discard'), h(H.Button, { id: 'save', size: 'small', variant: 'primary' }, 'Save')), onClose: function () {} } }))`);
          await until(`document.getElementById('save')`, 'the buttons');
          assert.equal(Math.round((await rectOf('#save')).h), 32);
          const hit = await ev(`(function () { var a = getComputedStyle(document.getElementById('save'), '::after'); return { content: a.content, top: a.top, bottom: a.bottom }; })()`);
          assert.notEqual(hit.content, 'none');
          assert.equal(hit.top, '-6px');
          assert.equal(hit.bottom, '-6px');
          assert.equal((await rectOf('.hy-action-bar__close')).r - (await rectOf('.hy-action-bar__close')).x, 44, 'the icon-only close button is the touch target wide');
          assert.equal((await rectOf('.hy-action-bar__row')).h, 44, 'the capsule holds the hit areas');
        } finally { await chrome.emulate({ touch: false, mobile: false }); }
      });
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
      assert.equal(await ev(`document.querySelector('#scroller .hy-sr').getAttribute('aria-live')`), 'polite');
      await until(`document.querySelector('#scroller .hy-sr').textContent === '3 selected'`, 'the first announcement');
      await ev(`show(h(Screen, { bar: { selection: { count: 4, total: 8, onClear: function () {} }, label: undefined } }))`);
      await until(`document.querySelector('#scroller .hy-sr').textContent === '4 selected'`, 'the changed announcement');
    });

    it('announces an error when it appears, shown as one line above the row, while the bar stays open', async () => {
      await fresh();
      await ev(`show(h(Screen, { bar: { tone: 'warning' } }))`);
      await until(`document.querySelector('#scroller .hy-sr').textContent === '3 unsaved changes'`, 'the label');
      await ev(`show(h(Screen, { bar: { tone: 'warning', error: 'Couldn’t save the changes. Check your connection and try again, then save once more.' } }))`);
      await until(`/Error: Couldn’t save the changes\\. Check/.test(document.querySelector('#scroller .hy-sr').textContent)`, 'the error announcement');
      assert.match(await spoken(), /^3 unsaved changes/);
      const err = await rectOf('.hy-action-bar__error'), row = await rectOf('.hy-action-bar__row');
      assert.ok(err.b <= row.y + 0.5, 'the error line sits above the row');
      assert.ok(Math.abs((err.r - err.x) - (row.r - row.x)) < 1, 'it wraps at the row’s width rather than widening the capsule');
      assert.ok(await ev(`(function () { var e = document.querySelector('.hy-action-bar__error'); return e.scrollWidth <= e.clientWidth && e.scrollHeight <= e.clientHeight; })()`), 'the full text shows');
      assert.ok(await ev(`!!document.querySelector('.hy-action-bar__dot--error')`), 'the dot shows the error tone');
    });

    it('returns focus when the count chip’s clear button closes the bar', async () => {
      await fresh();
      await ev(`window.__clear = function () { show(h(Screen, { bar: { open: false } })); }; 0`);
      await ev(`show(h(Screen, { bar: { label: undefined, selection: { count: 1, total: 20, onClear: function () { window.__clear(); } } } }))`);
      await until(`document.querySelector('[aria-label="Clear Selection"]')`, 'the chip');
      await ev(`document.getElementById('row-4').focus()`);
      await ev(`document.querySelector('[aria-label="Clear Selection"]').focus()`);
      await ev(`document.querySelector('[aria-label="Clear Selection"]').click()`);
      await until(`!document.querySelector('.hy-action-bar')`, 'the bar to close');
      await sleep(50);
      assert.equal(await active(), 'row-4');
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
