// Checks that every component card fits the height declared on line 1 of its preview.html, at the 960px width shot.mjs uses.
// Content taller than the declared height is clipped: that fails. A declared height more than 120px + 25% above the content leaves
// a big empty band: that only warns. Cover is fixed at 288. Serves the cards itself, no `node scripts/dev.mjs` needed.
// Usage: node scripts/cards.mjs [Name …]   (none = all). Exits 1 if any card is clipped or fails to mount.
import { createServer } from 'node:http';
import { build } from './build.mjs';
import { handler } from './dev.mjs';
import { openChrome } from './chrome.mjs';

const r = build();
const all = ['Cover', ...r.order];
const only = process.argv.slice(2);
const unknown = only.filter((n) => !all.includes(n));
if (unknown.length) { console.error(`✗ no such card: ${unknown.join(', ')}`); process.exit(1); }
const names = only.length ? only : all;

const server = createServer(handler);
await new Promise((res) => server.listen(0, '127.0.0.1', res));
const base = `http://127.0.0.1:${server.address().port}`;
const { send, goto, evaluate, close } = await openChrome();
let failed = 0, warned = 0;
try {
  await send('Page.enable');
  // Lowest edge of the page: the document's scrollHeight, and the bottom of every element, which catches open overlays (Menu, Modal,
  // Popover) that sit out of flow. Content inside a scroll container doesn't count: the container clips it.
  const measure = `({ h: Math.ceil(Math.max(document.documentElement.scrollHeight, ...[...document.body.querySelectorAll('*')].filter((e) => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).overflowY !== 'visible') return false; return true; }).map((e) => e.getBoundingClientRect().bottom + scrollY))), error: document.documentElement.getAttribute('data-card-error'), root: !!document.getElementById('root')?.children.length })`;
  const viewport = (height) => send('Emulation.setDeviceMetricsOverride', { width: 960, height, deviceScaleFactor: 1, mobile: false });
  for (const n of names) {
    const declared = n === 'Cover' ? 288 : r.meta[n]?.height;
    for (const theme of ['light', 'dark']) {
      const url = `${base}/card/${n}?theme=${theme}`;
      // First in a viewport as short as can be, so scrollHeight is the content's own height and not the window's.
      await viewport(50);
      await goto(url);
      const flow = await evaluate(measure);
      // Then in the declared height, as the artifact frames it: fixed overlays position themselves against the frame, not a 50px window.
      await viewport(declared);
      await goto(url);
      const framed = await evaluate(measure);
      const h = Math.max(flow.h, framed.h);
      const label = `${n}${theme === 'dark' ? ' (dark)' : ''}`;
      if (framed.error || (n !== 'Cover' && !framed.root)) { failed++; console.log(`✗ ${label}: ${framed.error ? 'error: ' + framed.error : 'root is empty'}`); }
      else if (h > declared) { failed++; console.log(`✗ ${label}: content ${h}px > height ${declared}`); }
      else if (declared > h + 120 + h * 0.25) { warned++; console.log(`! ${label}: height ${declared} leaves an empty band, content is ${h}px`); }
    }
  }
} finally {
  await close();
  server.close();
}
console.log(failed ? `✗ ${failed} failed${warned ? `, ${warned} warnings` : ''}` : `✓ ${names.length} cards fit their height${warned ? ` (${warned} warnings)` : ''}`);
process.exit(failed ? 1 : 0);
