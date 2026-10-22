// Headless Chrome over the DevTools protocol, for the scripts that drive a page (mobile.mjs, touch.mjs).
// Usage: const { send, goto, evaluate, close } = await openChrome(); await send('Page.enable'); await goto(url); …; await close();
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export async function openChrome() {
  const profile = mkdtempSync(join(tmpdir(), 'hy-chrome-'));
  const chrome = spawn(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'], { stdio: 'ignore' });
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
  return {
    send,
    // Navigates and waits for load (8s at most), then a little longer so React has rendered.
    async goto(url) {
      const done = loaded();
      await send('Page.navigate', { url });
      await Promise.race([done, sleep(8000)]);
      await sleep(600);
    },
    async evaluate(expression) {
      const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    async close() {
      ws.close();
      chrome.kill();
      await sleep(300);
      rmSync(profile, { recursive: true, force: true });
    },
  };
}
