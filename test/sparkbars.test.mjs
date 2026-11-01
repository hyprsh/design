// Tests for Sparkbars (hyprsh/design#73). Pure logic (scaling, minimum height, summary, names) runs Sparkbars.js in a vm
// context with stub hooks and inspects the vnode tree. Colours, hover, keyboard focus and the tooltip need real layout,
// so those run in headless Chrome (see scripts/chrome.mjs); without Chrome that suite is skipped, or fails when CI is set.
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import vm from 'node:vm';
import { build } from '../scripts/build.mjs';
import { handler } from '../scripts/dev.mjs';
import { openChrome, CHROME } from '../scripts/chrome.mjs';

const src = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src');
const registry = {};
const states = [];
const slot = { i: 0 };
const render = (props) => { slot.i = 0; return registry.Sparkbars(props); };
const context = vm.createContext({
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity) }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  useId: () => 'id',
  useMemo: (fn) => fn(),
  useEffect: () => {}, useLayoutEffect: () => {},
  useRef: (init) => ({ current: init }),
  useState: (init) => { const i = slot.i++; if (!(i in states)) states[i] = init; return [states[i], (v) => { states[i] = v; }]; },
  useFloating: () => null,
  floatingStyle: () => ({}),
  portal: (n) => n,
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(join(src, 'Sparkbars.js'), 'utf8'), context, { filename: 'Sparkbars.js' });

const find = (node, pred, out = []) => {
  if (!node || typeof node !== 'object') return out;
  if (pred(node)) out.push(node);
  for (const c of node.children || []) find(c, pred, out);
  return out;
};
const bars = (tree) => find(tree, (n) => String(n.props.className || '').split(' ').includes('hy-sparkbars__bar'));
const px = (n) => parseFloat(n.props.style.height);
const runs = (values, tone = 'success') => values.map((value, i) => ({ value, tone, label: 'Run ' + (i + 1) }));

describe('Sparkbars logic', () => {
  it('draws one bar per run, in order', () => {
    const tree = render({ runs: runs(Array.from({ length: 30 }, (_, i) => i + 1)), 'aria-label': 'Builds' });
    const b = bars(tree);
    assert.equal(b.length, 30);
    assert.deepEqual(b.map((n) => n.props['aria-label']).slice(0, 3), ['Run 1', 'Run 2', 'Run 3']);
  });

  it('scales height to the largest value by default, in a 24px box', () => {
    const b = bars(render({ runs: runs([5, 10, 20]), 'aria-label': 'x' }));
    assert.deepEqual(b.map(px), [6, 12, 24]);
  });

  it('scales to max and honours height', () => {
    const b = bars(render({ runs: runs([10, 50]), max: 100, height: 40, 'aria-label': 'x' }));
    assert.deepEqual(b.map(px), [4, 20]);
  });

  it('never draws under 4px, so zero and tiny runs show', () => {
    const b = bars(render({ runs: runs([0, 1, 100]), 'aria-label': 'x' }));
    assert.deepEqual(b.map(px), [4, 4, 24]);
    assert.deepEqual(bars(render({ runs: runs([0, 0]), 'aria-label': 'x' })).map(px), [4, 4]);
  });

  it('caps a value above max at the box height', () => {
    assert.deepEqual(bars(render({ runs: runs([500]), max: 100, 'aria-label': 'x' })).map(px), [24]);
  });

  it('puts each run\'s tone on its bar', () => {
    const tones = ['success', 'info', 'warning', 'error', 'neutral'];
    const b = bars(render({ runs: tones.map((tone) => ({ value: 1, tone, label: tone })), 'aria-label': 'x' }));
    tones.forEach((t, i) => assert.ok(b[i].props.className.split(' ').includes('hy-sparkbars__bar--' + t), t));
  });

  it('names the row with the app label then a per-tone summary', () => {
    const r = [...runs(Array(27).fill(1)), ...runs([1, 1], 'warning'), ...runs([1], 'error')];
    const row = find(render({ runs: r, 'aria-label': 'Rebuild search index' }), (n) => n.props.tabIndex === 0)[0];
    assert.equal(row.props['aria-label'], 'Rebuild search index: 27 success, 2 warning, 1 error');
  });

  it('does not mark runs as selected: selection is out of scope', () => {
    const b = bars(render({ runs: runs([1, 2, 3]), 'aria-label': 'x' }));
    b.forEach((n) => assert.equal('aria-selected' in n.props, false));
  });

  it('is a single tab stop, and the runs are not', () => {
    const tree = render({ runs: runs([1, 2, 3]), 'aria-label': 'x' });
    assert.equal(find(tree, (n) => n.props.tabIndex !== undefined).length, 1);
  });
});

// ---------- Chrome ----------
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const PAGE = `<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/project/components/bundle.css">
<script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.development.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="/project/components/bundle.js"></script></head><body style="margin:0">
<div id="root"></div><script>
var H = window.Hyprsh, h = React.createElement;
var TONES = ['success', 'info', 'warning', 'error', 'neutral'];
var RUNS = []; for (var i = 0; i < 30; i++) RUNS.push({ value: i % 7 === 0 ? 0 : i, tone: TONES[i % 5], label: 'Run ' + (i + 1) + ' of 30' });
ReactDOM.createRoot(document.getElementById('root')).render(h('div', { style: { padding: 40 } },
  h('button', { id: 'before' }, 'Before'),
  h('div', { style: { margin: '40px 0' } }, h(H.Sparkbars, { runs: RUNS, 'aria-label': 'Nightly build' })),
  h('button', { id: 'after' }, 'After'),
  h('div', { style: { width: 200 } }, h(H.Progress, { segments: TONES.map(function (t) { return { value: 1, tone: t }; }), 'aria-label': 'p' }))));
</script></body></html>`;

let server, chrome, port;
const canRun = existsSync(CHROME);
const skipNoChrome = !canRun && !process.env.CI && 'Chrome not found';
const ev = (js) => chrome.evaluate(js);
const moveTo = (x, y) => chrome.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
const KEYS = { ArrowRight: 39, ArrowLeft: 37, Home: 36, End: 35, Tab: 9 };
async function press(key, shift) {
  const p = { key, code: key, windowsVirtualKeyCode: KEYS[key], modifiers: shift ? 8 : 0 };
  await chrome.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...p });
  await chrome.send('Input.dispatchKeyEvent', { type: 'keyUp', ...p });
  await sleep(60);
}
const ROW = '.hy-sparkbars';
const tip = () => ev(`(document.querySelector('[role="tooltip"]') || {}).textContent || null`);
const opacities = () => ev(`Array.from(document.querySelectorAll('.hy-sparkbars__bar')).map(function (b) { return getComputedStyle(b).opacity; })`);
const barRect = (i) => ev(`(function () { var r = document.querySelectorAll('.hy-sparkbars__bar')[${i}].getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, r: r.right, b: r.bottom }; })()`);
const until = async (js, what) => { for (let i = 0; i < 40; i++) { if (await ev('!!(' + js + ')')) return; await sleep(50); } assert.fail('timed out: ' + what); };

describe('Sparkbars in Chrome', { skip: skipNoChrome, concurrency: false }, () => {
  before(async () => {
    build();
    server = createServer((req, res) => {
      if (req.url.startsWith('/__t')) { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(PAGE); }
      return handler(req, res);
    });
    await new Promise((res) => server.listen(0, '127.0.0.1', res));
    port = server.address().port;
    chrome = await openChrome();
    await chrome.send('Page.enable');
    await chrome.emulate({ width: 800, height: 400, scale: 1 });
    await chrome.goto(`http://127.0.0.1:${port}/__t`);
    await until(`document.querySelectorAll('.hy-sparkbars__bar').length === 30`, 'bars');
  });
  after(async () => { if (chrome) await chrome.close(); if (server) server.close(); });

  it('lays 30 bars out 6px wide with 2px gaps, bottom-aligned, rounded at the top only', async () => {
    const r0 = await barRect(0), r1 = await barRect(1), r29 = await barRect(29);
    assert.equal(r0.w, 6);
    assert.equal(r1.x - r0.r, 2);
    assert.ok(r29.x > r0.x);
    assert.equal(r0.b, r29.b);
    const radius = await ev(`(function () { var s = getComputedStyle(document.querySelector('.hy-sparkbars__bar')); return [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomLeftRadius, s.borderBottomRightRadius].join(' '); })()`);
    assert.equal(radius, '2px 2px 0px 0px');
  });

  it('colours each tone exactly as Progress segments do', async () => {
    const got = await ev(`TONES.map(function (t) { return [getComputedStyle(document.querySelector('.hy-sparkbars__bar--' + t)).backgroundColor, getComputedStyle(document.querySelector('.hy-progress__segment--' + t)).backgroundColor]; })`);
    assert.equal(got.length, 5);
    got.forEach(([bar, seg]) => assert.equal(bar, seg));
  });

  it('hover keeps one bar solid, dims the rest to 55%, and shows its label 8px above the bar', async () => {
    const r = await barRect(10);
    await moveTo(r.x + 3, r.y + r.h / 2);
    await until(`document.querySelector('[role="tooltip"]')`, 'tooltip');
    assert.equal(await tip(), 'Run 11 of 30');
    await sleep(250);
    (await opacities()).forEach((v, i) => assert.equal(v, i === 10 ? '1' : '0.55', 'bar ' + i));
    const t = await ev(`document.querySelector('[role="tooltip"]').getBoundingClientRect().bottom`);
    assert.equal(Math.round(r.y - t), 8);
    await moveTo(5, 5);
    await until(`!document.querySelector('[role="tooltip"]')`, 'tooltip to close');
    await sleep(250);
    (await opacities()).forEach((v) => assert.equal(v, '1'));
  });

  it('is one Tab stop; arrows, Home and End move the emphasis and tooltip', async () => {
    await ev(`document.getElementById('before').focus()`);
    await press('Tab');
    assert.equal(await ev(`document.activeElement.matches(${JSON.stringify(ROW)})`), true);
    await until(`document.querySelector('[role="tooltip"]')`, 'tooltip on focus');
    assert.equal(await tip(), 'Run 1 of 30');
    await press('ArrowRight'); await press('ArrowRight');
    assert.equal(await tip(), 'Run 3 of 30');
    await press('End');
    assert.equal(await tip(), 'Run 30 of 30');
    await press('ArrowRight');
    assert.equal(await tip(), 'Run 30 of 30');
    await press('Home');
    assert.equal(await tip(), 'Run 1 of 30');
    await press('ArrowLeft');
    assert.equal(await tip(), 'Run 1 of 30');
    await sleep(250);
    (await opacities()).forEach((v, i) => assert.equal(v, i === 0 ? '1' : '0.55'));
    await press('Tab');
    assert.equal(await ev(`document.activeElement.id`), 'after');
    assert.equal(await tip(), null);
    await press('Tab', true);
    assert.equal(await ev(`document.activeElement.matches(${JSON.stringify(ROW)})`), true);
    await press('Tab', true);
    assert.equal(await ev(`document.activeElement.id`), 'before');
  });

  it('shows a 2px focus ring around the whole row', async () => {
    await ev(`document.getElementById('before').focus()`);
    await press('Tab');
    const ring = await ev(`(function () { var row = document.activeElement, s = getComputedStyle(row), r = row.getBoundingClientRect(), b = document.querySelector('.hy-sparkbars__bar').getBoundingClientRect(), l = document.querySelectorAll('.hy-sparkbars__bar')[29].getBoundingClientRect(); return { w: s.outlineWidth, style: s.outlineStyle, wraps: r.left <= b.left && r.right >= l.right && r.top <= b.top }; })()`);
    assert.equal(ring.w, '2px'); assert.equal(ring.style, 'solid'); assert.equal(ring.wraps, true);
  });

  it('exposes the summary as the row name and each run\'s label as its name', async () => {
    const n = await ev(`(function () { var row = document.querySelector('.hy-sparkbars'); return { name: row.getAttribute('aria-label'), first: row.querySelector('.hy-sparkbars__bar').getAttribute('aria-label') }; })()`);
    assert.match(n.name, /^Nightly build: \d+ success, /);
    assert.equal(n.first, 'Run 1 of 30');
  });

  it('points aria-activedescendant at the active run, and nothing is aria-selected', async () => {
    await ev(`document.getElementById('before').focus()`);
    await press('Tab');
    await press('ArrowRight');
    const a = await ev(`(function () { var row = document.querySelector('.hy-sparkbars'); var id = row.getAttribute('aria-activedescendant'); return { id: !!id, label: id && document.getElementById(id).getAttribute('aria-label'), selected: document.querySelectorAll('[aria-selected]').length }; })()`);
    assert.equal(a.id, true);
    assert.equal(a.label, 'Run 2 of 30');
    assert.equal(a.selected, 0);
    await ev(`document.getElementById('after').focus()`);
  });

  it('grows the hit area to the touch target under touch sizing and keeps the drawn size', async () => {
    const hit = (dy) => ev(`(function () { var row = document.querySelector('.hy-sparkbars'), r = row.getBoundingClientRect(); var el = document.elementFromPoint(r.left + 20, ${dy < 0 ? 'r.top' : 'r.bottom'} + (${dy})); return { row: el === row, h: r.height }; })()`);
    assert.equal((await hit(-8)).row, false, 'desktop: no extra hit area');
    await chrome.emulate({ width: 600, height: 400, scale: 1 });
    await sleep(100);
    const up = await hit(-8), down = await hit(8), far = await hit(-14);
    assert.equal(up.h, 24, 'drawn size is unchanged');
    assert.equal(up.row, true); assert.equal(down.row, true);
    assert.equal(far.row, false, 'the hit area stops at the touch target');
    // Picking still comes from the pointer's x.
    const r = await barRect(10);
    await moveTo(r.x + 3, r.y - 6);
    await until(`document.querySelector('[role="tooltip"]')`, 'tooltip');
    assert.equal(await tip(), 'Run 11 of 30');
    await moveTo(5, 5);
    await chrome.emulate({ width: 800, height: 400, scale: 1 });
  });

  it('transitions opacity only, over 150ms, and not at all under reduced motion', async () => {
    assert.equal(await ev(`(function () { var s = getComputedStyle(document.querySelector('.hy-sparkbars__bar')); return s.transitionProperty + ' ' + s.transitionDuration; })()`), 'opacity 0.15s');
    await chrome.emulate({ width: 800, height: 400, scale: 1, reducedMotion: true });
    assert.equal(await ev(`getComputedStyle(document.querySelector('.hy-sparkbars__bar')).transitionDuration`), '0s');
  });
});
