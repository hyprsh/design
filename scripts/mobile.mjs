// Phone check: renders cards at 375px in headless Chrome with touch emulation, reports anything wider
// than the screen, and saves full-height screenshots to .cache/mobile/<Name>.png.
// Needs `node scripts/dev.mjs` running. Usage: node scripts/mobile.mjs [Name …] [--dark]  (no names = all)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';
import { openChrome } from './chrome.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.cache/mobile');
const BASE = process.env.HY_DEV || 'http://127.0.0.1:4400';
const WIDTH = 375;
mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const theme = args.includes('--dark') ? 'dark' : 'light';
const r = build({ write: false });
const names = args.filter((a) => !a.startsWith('--')).length ? args.filter((a) => !a.startsWith('--')) : r.order;

const { send, goto, evaluate, emulate, close } = await openChrome();
await send('Page.enable');
await emulate({ width: WIDTH, height: 812, scale: 2, touch: true });

// Reports the page's own width and the outermost elements that stick out past the screen edge,
// skipping anything inside a container that scrolls or clips horizontally on purpose.
const PROBE = `(() => {
  const W = ${WIDTH}, out = [];
  const clipped = (el) => { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o !== 'visible') return true; } return false; };
  const label = (el) => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : '');
  for (const el of document.querySelectorAll('body *')) {  // body, not #root: popovers render through a portal
    const b = el.getBoundingClientRect();
    if (!b.width || (b.right <= W + 1 && b.left >= -1) || clipped(el)) continue;
    if (out.some((o) => o.el.contains(el))) continue;
    out.push({ el, s: label(el) + ' ' + Math.round(b.left) + '→' + Math.round(b.right) });
  }
  const small = [];
  for (const el of document.querySelectorAll('#root button, #root a[href], #root input:not([type=hidden]), #root select, #root [role=tab], #root [role=switch], #root [role=menuitem], #root summary')) {
    // A control inside a <label> is hit through the label; a link inside a sentence is exempt (WCAG 2.5.8).
    const target = el.matches('input') && el.closest('label') ? el.closest('label') : el;
    if (el.matches('a') && el.parentElement && /\S/.test([...el.parentElement.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(''))) continue;
    const b = target.getBoundingClientRect();
    if (b.width && b.height && (b.height < 24 || b.width < 24)) small.push(label(el) + ' ' + Math.round(b.width) + '×' + Math.round(b.height));
  }
  return JSON.stringify({ page: document.documentElement.scrollWidth, over: out.slice(0, 6).map((o) => o.s), small: [...new Set(small)].slice(0, 6), error: document.querySelector('[data-card-error]')?.getAttribute('data-card-error') || null, height: Math.ceil(document.documentElement.scrollHeight) });
})()`;

const report = {};
for (const n of names) {
  await goto(`${BASE}/card/${n}?theme=${theme}`);
  const res = JSON.parse(await evaluate(PROBE));
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: WIDTH, height: Math.min(res.height, 2400), scale: 1 } });
  writeFileSync(join(OUT, `${n}.png`), Buffer.from(shot.data, 'base64'));
  report[n] = res;
  const bad = res.error || res.page > WIDTH + 1 || res.over.length;
  console.log(`${bad ? '✗' : '✓'} ${n}${res.error ? ' error: ' + res.error : ''}${res.page > WIDTH + 1 ? ` page ${res.page}px` : ''}${res.over.length ? ' over: ' + res.over.join(', ') : ''}${res.small.length ? '  small targets: ' + res.small.join(', ') : ''}`);
}
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 1));
await close();
