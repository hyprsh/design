// Headless Chrome over the DevTools protocol, for the scripts that drive a page (mobile.mjs, touch.mjs).
// Usage: const { send, goto, evaluate, close } = await openChrome(); await send('Page.enable'); await goto(url); …; await close();
// CHROME_PATH overrides where Chrome is: the macOS app by default, /usr/bin/google-chrome on Linux.
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, existsSync, realpathSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

export const CHROME = process.env.CHROME_PATH || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome');
// CI runners can't give Chrome's sandbox the namespaces it wants.
export const CHROME_FLAGS = process.env.CI && process.platform === 'linux' ? ['--no-sandbox'] : [];
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// Cleanup. Every Chrome (and profile) a script opens is registered, and killed and removed when the Node process exits:
// normally, on an uncaught error, or on SIGINT, SIGTERM and SIGHUP (re-raised afterwards, so the exit status is the usual one).
const live = new Set();
let doing = '';  // what the script is up to, named in the deadline message
export const setDoing = (what) => { doing = what; };
export function register(proc, profile) {
  const entry = { proc, profile };
  live.add(entry);
  return () => live.delete(entry);
}
function cleanup() {
  for (const { proc, profile } of live) {
    try { if (proc && proc.exitCode === null) proc.kill('SIGKILL'); } catch {}
    try { if (profile) rmSync(profile, { recursive: true, force: true, maxRetries: 3 }); } catch {}
  }
  live.clear();
}
process.on('exit', cleanup);
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(sig, () => {
    cleanup();
    process.removeAllListeners(sig);
    process.kill(process.pid, sig);
  });
}

// Overall deadline: HY_DEADLINE seconds (default 300, 0 = none). Prints which script hit it, closes Chrome (via the exit handler) and exits 1.
const DEADLINE = Number(process.env.HY_DEADLINE ?? 300);
if (DEADLINE > 0 && process.argv[2] !== '--clean') {
  setTimeout(() => {
    console.error(`✗ ${basename(process.argv[1] || 'script')} hit the ${DEADLINE}s deadline (HY_DEADLINE)${doing ? ' while ' + doing : ''}`);
    process.exit(1);
  }, DEADLINE * 1000).unref();
}

export async function openChrome() {
  const profile = mkdtempSync(join(tmpdir(), 'hy-chrome-'));
  doing = 'starting Chrome';
  const chrome = spawn(CHROME, [...CHROME_FLAGS, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${profile}`, '--remote-debugging-port=0', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const unregister = register(chrome, profile);
  // Keep the end of Chrome's stderr, so a failed start says why.
  let stderr = '';
  chrome.stderr.on('data', (d) => { stderr = (stderr + d).slice(-2000); });
  let port;
  // A cold CI runner can take well over 10s to start Chrome, so wait up to 30s.
  for (let i = 0; i < 300 && !port && chrome.exitCode === null; i++) {
    await sleep(100);
    const f = join(profile, 'DevToolsActivePort');
    if (existsSync(f)) port = readFileSync(f, 'utf8').split('\n')[0];
  }
  if (!port) {
    chrome.kill();
    unregister();
    rmSync(profile, { recursive: true, force: true });
    const why = chrome.exitCode !== null ? `Chrome exited with code ${chrome.exitCode}` : 'Chrome did not open a debugging port within 30s';
    throw new Error(`${why} (${CHROME})${stderr.trim() ? '\n' + stderr.trim() : ''}`);
  }
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
      doing = `loading ${url}`;
      await Promise.race([done, sleep(8000)]);
      await sleep(600);
    },
    async evaluate(expression) {
      doing = 'evaluating in the page';
      const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    async close() {
      unregister();
      ws.close();
      chrome.kill();
      await sleep(300);
      rmSync(profile, { recursive: true, force: true });
    },
  };
}

// `node scripts/chrome.mjs --clean`: kills Chrome processes left behind by a killed script. Only the main process of a Chrome whose
// --user-data-dir is a hy-chrome-* directory directly in the OS temp dir matches; any other Chrome is left alone.
export function clean() {
  const tmp = realpathSync(tmpdir());
  const real = (p) => { try { return realpathSync(p); } catch { return p; } };
  const found = [];
  for (const line of execFileSync('ps', ['-axo', 'pid=,command='], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n')) {
    const m = /^\s*(\d+)\s+(.*)$/.exec(line);
    if (!m || /\s--type=/.test(m[2])) continue;  // helpers exit with their main process
    const d = /(?:^|\s)--user-data-dir=(\S+)/.exec(m[2]);
    if (!d || !basename(d[1]).startsWith('hy-chrome-') || real(dirname(d[1])) !== tmp) continue;
    found.push({ pid: Number(m[1]), profile: d[1] });
  }
  for (const { pid, profile } of found) {
    try { process.kill(pid, 'SIGKILL'); } catch {}
    rmSync(profile, { recursive: true, force: true, maxRetries: 3 });
    console.log(`killed Chrome ${pid}, removed ${profile}`);
  }
  if (!found.length) console.log('no orphaned hy-chrome Chrome processes');
  return found.length;
}
if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv[2] === '--clean') clean();
