// Checks the built docs site in headless Chrome: every component page with examples renders them all without an error,
// and the card of every component without examples mounts. Run `node scripts/site.mjs` first.
// Usage: node scripts/examples.mjs [name …]   (kebab-case page names; none = all). Exits 1 on any failure.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { OUT, serve } from './site.mjs';
import { openChrome } from './chrome.mjs';

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
if (!existsSync(join(OUT, 'components'))) { console.error('No site in .cache/site: run node scripts/site.mjs first.'); process.exit(1); }

const only = process.argv.slice(2);
const pages = readdirSync(join(OUT, 'components'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && (!only.length || only.includes(d.name)))
  .map((d) => {
    const html = readFileSync(join(OUT, 'components', d.name, 'index.html'), 'utf8');
    return { kebab: d.name, examples: (html.match(/data-example /g) || []).length, card: /cards\/(\w+)\.html/.exec(html)?.[1] };
  });

const server = await serve(OUT, 0);
const base = `http://127.0.0.1:${server.address().port}/`;
const { send, goto, evaluate, close } = await openChrome();
await send('Page.enable');
let failed = 0, checked = 0;
const fail = (what, problems) => { failed++; console.log(`✗ ${what}\n${problems.map((p) => '    ' + p).join('\n')}`); };

try {
  for (const p of pages.filter((x) => x.examples)) {
    await goto(`${base}components/${p.kebab}/`);
    for (let i = 0; i < 100 && !(await evaluate('window.__examplesDone === true')); i++) await sleep(200);
    const r = await evaluate(`({
      done: window.__examplesDone === true,
      errors: (window.__exampleErrors || []).map((e) => e.title + ': ' + e.message),
      page: window.__pageErrors || [],
      empty: [...document.querySelectorAll('[data-example]')].filter((b) => !b.children.length).map((b) => b.dataset.title + ': rendered nothing'),
    })`);
    const problems = [...(r.done ? [] : ['the examples never finished']), ...r.errors, ...r.page.map((m) => 'page error: ' + m), ...r.empty];
    checked += p.examples;
    if (problems.length) fail(`${p.kebab}: ${p.examples} examples`, problems);
    else console.log(`✓ ${p.kebab}: ${p.examples} examples`);
  }
  const cards = pages.filter((x) => !x.examples && x.card);
  for (const p of cards) {
    await goto(`${base}cards/${p.card}.html?theme=light`);
    const r = await evaluate(`({ error: document.documentElement.getAttribute('data-card-error'), empty: !document.getElementById('root')?.children.length })`);
    const problems = [...(r.error ? ['error: ' + r.error] : []), ...(r.empty ? ['root is empty'] : [])];
    if (problems.length) fail(`${p.card} card`, problems);
  }
  console.log(`${cards.length} cards checked for the components without examples`);
} finally {
  await close();
  server.close();
}
console.log(failed ? `✗ ${failed} failed` : `✓ ${checked} examples on ${pages.filter((x) => x.examples).length} pages and the cards all render`);
process.exit(failed ? 1 : 0);
