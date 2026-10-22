// Touch sizing check: mounts the controls that touch sizing covers in headless Chrome and measures their drawn size
// and hit area at a desktop width, at phone width with a mouse, and with a coarse pointer at desktop width.
// Needs `node scripts/dev.mjs` running. Usage: node scripts/touch.mjs
import { openChrome } from './chrome.mjs';

const BASE = process.env.HY_DEV || 'http://127.0.0.1:4400';
const TOUCH = 44;  // --touch-target

// Each case: what to mount (an expression over H and h) and the element to measure. `portal` cases render through a
// portal, so their element is looked up in the whole document.
const CASES = {
  button: ["h(H.Button, null, 'Deploy')", '.hy-btn'],
  buttonSmall: ["h(H.Button, { size: 'small' }, 'Deploy')", '.hy-btn'],
  buttonIcon: ["h(H.Button, { svgOnly: true, 'aria-label': 'Settings' }, h(H.Icon, { name: 'settings' }))", '.hy-btn'],
  buttonLarge: ["h(H.Button, { size: 'large' }, 'Deploy')", '.hy-btn'],
  buttonTiny: ["h(H.Button, { size: 'tiny', svgOnly: true, 'aria-label': 'Close' }, h(H.Icon, { name: 'x' }))", '.hy-btn'],
  input: ["h(H.Input, { 'aria-label': 'Project Name' })", '.hy-input'],
  select: ["h(H.Select, { 'aria-label': 'Region', options: ['iad1', 'sfo1'] })", '.hy-select'],
  menuItem: ["h(H.MenuContainer, { defaultOpen: true }, h(H.MenuButton, null, 'Actions'), h(H.Menu, null, h(H.MenuItem, { onClick: function () {} }, 'Redeploy')))", '.hy-menu__item', 'portal'],
  checkbox: ["h(H.Checkbox, { defaultChecked: true }, 'Preview')", '.hy-check'],
  switch: ["h(H.Switch, { name: 'p-m' }, h(H.SwitchControl, { label: 'Source', value: 's', defaultChecked: true }), h(H.SwitchControl, { label: 'Output', value: 'o' }))", '.hy-switch'],
  switchSmall: ["h(H.Switch, { name: 'p-s', size: 'small' }, h(H.SwitchControl, { label: 'Source', value: 's', defaultChecked: true }), h(H.SwitchControl, { label: 'Output', value: 'o' }))", '.hy-switch'],
  switchLarge: ["h(H.Switch, { name: 'p-l', size: 'large' }, h(H.SwitchControl, { label: 'Source', value: 's', defaultChecked: true }), h(H.SwitchControl, { label: 'Output', value: 'o' }))", '.hy-switch'],
  tabsSecondary: ["h(H.Tabs, { 'aria-label': 'Range', variant: 'secondary', tabs: [{ title: 'Day', value: 'd' }, { title: 'Week', value: 'w' }] })", '.hy-tabs__tab'],
  pillSmall: ["h(H.Pill, { href: '#a', size: 'sm' }, 'Changelog')", '.hy-pill'],
  pill: ["h(H.Pill, { href: '#a' }, 'Changelog')", '.hy-pill'],
  progressStop: ["h(H.Progress, { value: 40, 'aria-label': 'Upload', stops: [{ value: 50, tooltip: 'Half' }] })", '.hy-progress__trigger'],
  cmdEsc: ["h(H.CommandMenu, { open: true, inline: true, setOpen: function () {} }, h(H.CommandMenuInput, { placeholder: 'Search…' }))", '.hy-cmd__esc'],
};

// Drawn sizes outside touch sizing (h, w) and under it; `hit` is the least hit area under touch sizing.
const DESKTOP = {
  button: { h: 36 }, buttonSmall: { h: 32 }, buttonIcon: { h: 36, w: 36 }, buttonLarge: { h: 40 }, buttonTiny: { h: 24, w: 24 },
  input: { h: 36 }, select: { h: 36 }, menuItem: { h: 36 }, checkbox: { h: 24 },
  switch: { h: 36 }, switchSmall: { h: 32 }, switchLarge: { h: 40 }, tabsSecondary: { h: 32 },
  pillSmall: { h: 20 }, pill: { h: 24 }, progressStop: { h: 14, w: 14 }, cmdEsc: { h: 20 },
};
const TOUCH_SIZING = {
  button: { h: TOUCH }, buttonSmall: { h: TOUCH }, buttonIcon: { h: TOUCH, w: TOUCH }, buttonLarge: { h: 48 },
  buttonTiny: { h: 24, w: 24, hit: [TOUCH, TOUCH] },
  input: { h: TOUCH }, select: { h: TOUCH }, menuItem: { h: TOUCH }, checkbox: { h: TOUCH },
  switch: { h: TOUCH }, switchSmall: { h: TOUCH }, switchLarge: { h: TOUCH }, tabsSecondary: { h: TOUCH },
  pillSmall: { h: 20, hit: [0, TOUCH] }, pill: { h: 24, hit: [0, TOUCH] },
  progressStop: { h: 14, w: 14, hit: [TOUCH, TOUCH] }, cmdEsc: { h: 20, hit: [0, TOUCH] },
};

const MODES = [
  { name: 'desktop 1280px, mouse', width: 1280, touch: false, expect: DESKTOP },
  { name: 'phone width 375px, mouse', width: 375, touch: false, expect: TOUCH_SIZING },
  { name: 'desktop 1280px, coarse pointer', width: 1280, touch: true, expect: TOUCH_SIZING },
];

// Mounts each case on its own (open overlays would cover the others) and returns its drawn size and hit area. The hit
// area is found by hit-testing lines through the element's centre, so it counts ::after overlays the way a tap would.
const PROBE = `(async () => {
  const H = window.Hyprsh, h = React.createElement, cases = ${JSON.stringify(CASES)};
  document.getElementById('root').style.display = 'none';
  const host = document.createElement('div');
  host.style.padding = '48px';
  document.body.appendChild(host);
  const root = ReactDOM.createRoot(host);
  const hits = (el, pick, from, to) => { let n = 0; for (let i = from; i <= to; i++) { const t = pick(i); if (t && (t === el || el.contains(t))) n++; } return n; };
  const out = { coarse: matchMedia('(pointer: coarse)').matches };
  for (const [k, [mount, sel, scope]] of Object.entries(cases)) {
    root.render(eval(mount));
    await new Promise((r) => setTimeout(r, 300));
    const el = (scope === 'portal' ? document : host).querySelector(sel);
    if (!el) { out[k] = null; continue; }
    const b = el.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
    out[k] = { h: Math.round(b.height), w: Math.round(b.width),
      hitH: hits(el, (y) => document.elementFromPoint(cx, y), Math.floor(cy - 40), Math.ceil(cy + 40)),
      hitW: hits(el, (x) => document.elementFromPoint(x, cy), Math.floor(cx - 40), Math.ceil(cx + 40)) };
    root.render(null);
    await new Promise((r) => setTimeout(r, 50));
  }
  return out;
})()`;

const { send, goto, evaluate, close } = await openChrome();
await send('Page.enable');
let failed = 0;
for (const m of MODES) {
  await send('Emulation.setDeviceMetricsOverride', { width: m.width, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setTouchEmulationEnabled', m.touch ? { enabled: true, maxTouchPoints: 5 } : { enabled: false });
  await goto(`${BASE}/card/Button`);
  const got = await evaluate(PROBE);
  const bad = [];
  if (got.coarse !== m.touch) bad.push(`pointer: coarse is ${got.coarse}, expected ${m.touch}`);
  for (const [k, e] of Object.entries(m.expect)) {
    const g = got[k];
    if (!g) { bad.push(`${k}: not found`); continue; }
    if (g.h !== e.h) bad.push(`${k}: height ${g.h}, expected ${e.h}`);
    if (e.w && g.w !== e.w) bad.push(`${k}: width ${g.w}, expected ${e.w}`);
    if (e.hit && (g.hitW < e.hit[0] || g.hitH < e.hit[1])) bad.push(`${k}: hit area ${g.hitW}×${g.hitH}, expected at least ${e.hit[0] || '…'}×${e.hit[1]}`);
  }
  failed += bad.length;
  console.log(`${bad.length ? '✗' : '✓'} ${m.name}${bad.map((b) => '\n    ' + b).join('')}`);
}
await close();
process.exit(failed ? 1 : 0);
