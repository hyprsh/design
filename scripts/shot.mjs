// Renders cards in headless Chrome: checks each one mounts without errors and saves a screenshot.
// Needs `node scripts/dev.mjs` running. Usage: node scripts/shot.mjs Button Toggle …  (no names = all)
// Screenshots land in .cache/shots/<Name>-<theme>.png
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.cache/shots');
const BASE = process.env.HY_DEV || 'http://127.0.0.1:4400';
mkdirSync(OUT, { recursive: true });

const r = build();
const names = process.argv.slice(2).length ? process.argv.slice(2) : ['Cover', ...r.order];
const profile = mkdtempSync(join(tmpdir(), 'hy-chrome-'));
const flags = ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', `--user-data-dir=${profile}`, '--virtual-time-budget=5000'];
let failed = 0;
for (const n of names) {
  const height = n === 'Cover' ? 288 : (r.meta[n]?.height || 200);
  for (const theme of ['light', 'dark']) {
    const url = `${BASE}/card/${n}?theme=${theme}`;
    let problem = '';
    try {
      const dom = execFileSync(CHROME, [...flags, '--dump-dom', url], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 60000 });
      const err = /data-card-error="([^"]*)"/.exec(dom);
      if (err) problem = 'error: ' + err[1];
      else if (n !== 'Cover' && /<div id="root"[^>]*><\/div>/.test(dom)) problem = 'root is empty';
      execFileSync(CHROME, [...flags, `--window-size=960,${height}`, `--screenshot=${join(OUT, `${n}-${theme}.png`)}`, url], { stdio: 'ignore', timeout: 60000 });
    } catch (e) { problem = 'chrome failed: ' + e.message.split('\n')[0]; }
    if (problem) failed++;
    console.log(`${problem ? '✗' : '✓'} ${n} ${theme}${problem ? ' — ' + problem : ''}  .cache/shots/${n}-${theme}.png`);
  }
}
rmSync(profile, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
