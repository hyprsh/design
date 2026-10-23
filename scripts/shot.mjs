// Renders cards in headless Chrome: checks each one mounts without errors and saves a screenshot.
// Needs `node scripts/dev.mjs` running. Usage: node scripts/shot.mjs Button Toggle …  (no names = all)
// Screenshots land in .cache/shots/<Name>-<theme>.png. Exits 1 if the dev server doesn't answer, or if any card fails or writes no screenshot.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';
import { CHROME, CHROME_FLAGS } from './chrome.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.cache/shots');
const BASE = process.env.HY_DEV || 'http://127.0.0.1:4400';
mkdirSync(OUT, { recursive: true });

// Without the dev server Chrome would screenshot its own error page, which has no card error and no empty root.
try { await fetch(BASE); } catch { console.error(`✗ no dev server at ${BASE}: start it with \`node scripts/dev.mjs\` (or set HY_DEV)`); process.exit(1); }

const r = build();
const names = process.argv.slice(2).length ? process.argv.slice(2) : ['Cover', ...r.order];
const profile = mkdtempSync(join(tmpdir(), 'hy-chrome-'));
const flags = [...CHROME_FLAGS, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`, '--virtual-time-budget=5000'];
let failed = 0;
for (const n of names) {
  const height = n === 'Cover' ? 288 : (r.meta[n]?.height || 200);
  for (const theme of ['light', 'dark']) {
    const url = `${BASE}/card/${n}?theme=${theme}`;
    const png = join(OUT, `${n}-${theme}.png`);
    let problem = '';
    try {
      rmSync(png, { force: true });
      const dom = execFileSync(CHROME, [...flags, '--dump-dom', url], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 60000 });
      const err = /data-card-error="([^"]*)"/.exec(dom);
      if (err) problem = 'error: ' + err[1];
      else if (n !== 'Cover' && !/<div id="root"/.test(dom)) problem = 'not a card page (is the name right?)';
      else if (n !== 'Cover' && /<div id="root"[^>]*><\/div>/.test(dom)) problem = 'root is empty';
      execFileSync(CHROME, [...flags, `--window-size=960,${height}`, `--screenshot=${png}`, url], { stdio: 'ignore', timeout: 60000 });
      if (!problem && !existsSync(png)) problem = 'no screenshot written';
    } catch (e) { problem = 'failed: ' + e.message.split('\n')[0]; }
    if (problem) failed++;
    console.log(`${problem ? '✗' : '✓'} ${n} ${theme}${problem ? ' — ' + problem : ''}  .cache/shots/${n}-${theme}.png`);
  }
}
rmSync(profile, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
