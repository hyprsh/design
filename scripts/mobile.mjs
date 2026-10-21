// Phone check: renders cards at 375px in headless Chrome with touch emulation, reports anything wider
// than the screen, and saves full-height screenshots to .cache/mobile/<Name>.png.
// Needs `node scripts/dev.mjs` running. Usage: node scripts/mobile.mjs [Name …] [--dark]  (no names = all)
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.cache/mobile');
const BASE = process.env.HY_DEV || 'http://127.0.0.1:4400';
const WIDTH = 375;
mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const theme = args.includes('--dark') ? 'dark' : 'light';
const r = build({ write: false });
const names = args.filter((a) => !a.startsWith('--')).length ? args.filter((a) => !a.startsWith('--')) : r.order;

const profile = mkdtempSync(join(tmpdir(), 'hy-mobile-'));
const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
  `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
let port;
for (let i = 0; i < 100 && !port; i++) {
  await sleep(100);
  const f = join(profile, 'DevToolsActivePort');
  if (existsSync(f)) port = readFileSync(f, 'utf8').split('\n')[0];
}
if (!port) { chrome.kill(); throw new Error('Chrome did not open a debugging port'); }
const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((res) => ws.addEventListener('open', res, { once: true }));
let seq = 0;
const pending = new Map();
const waiters = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
  else if (m.method) for (const w of waiters.splice(0)) w(m);
});
const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
const loaded = () => new Promise((res) => { const w = (m) => (m.method === 'Page.loadEventFired' ? res() : waiters.push(w)); waiters.push(w); });

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 812, deviceScaleFactor: 2, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Emulation.setEmitTouchEventsForMouse', { enabled: true, configuration: 'mobile' });

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
  const done = loaded();
  await send('Page.navigate', { url: `${BASE}/card/${n}?theme=${theme}` });
  await Promise.race([done, sleep(8000)]);
  await sleep(600);
  const res = JSON.parse((await send('Runtime.evaluate', { expression: PROBE, returnByValue: true })).result.value);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: WIDTH, height: Math.min(res.height, 2400), scale: 1 } });
  writeFileSync(join(OUT, `${n}.png`), Buffer.from(shot.data, 'base64'));
  report[n] = res;
  const bad = res.error || res.page > WIDTH + 1 || res.over.length;
  console.log(`${bad ? '✗' : '✓'} ${n}${res.error ? ' error: ' + res.error : ''}${res.page > WIDTH + 1 ? ` page ${res.page}px` : ''}${res.over.length ? ' over: ' + res.over.join(', ') : ''}${res.small.length ? '  small targets: ' + res.small.join(', ') : ''}`);
}
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 1));
ws.close();
chrome.kill();
await sleep(300);
rmSync(profile, { recursive: true, force: true });
