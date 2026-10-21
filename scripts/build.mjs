// Builds project/components/{bundle.js,bundle.css,index.d.ts} from project/components/src
// and checks every component against the Design System artifact contract.
// Usage: node scripts/build.mjs [--check]   (--check builds in memory and writes nothing)
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMP = join(ROOT, 'project/components');
const SRC = join(COMP, 'src');
const NAMESPACE = 'Hyprsh';
export const GROUPS = ['Actions', 'Forms', 'Navigation', 'Status', 'Feedback', 'Content', 'Data', 'Overlays', 'Layout', 'Media'];

const read = (p) => readFileSync(p, 'utf8');
const indent = (s, pad) => s.split('\n').map((l) => (l ? pad + l : l)).join('\n');

export function build({ write = true } = {}) {
  const errors = [];
  const names = readdirSync(SRC)
    .filter((f) => f.endsWith('.js') && f !== 'core.js' && !f.startsWith('_'))
    .map((f) => f.slice(0, -3));

  const meta = {};
  for (const n of names) {
    const dir = join(COMP, n);
    const js = read(join(SRC, n + '.js'));
    if (!new RegExp(`define\\('${n}',`).test(js)) errors.push(`${n}.js: missing define('${n}', …)`);
    if (!existsSync(join(SRC, n + '.css'))) errors.push(`${n}: missing src/${n}.css`);
    if (!existsSync(join(SRC, n + '.d.ts'))) errors.push(`${n}: missing src/${n}.d.ts`);
    else if (!new RegExp(`export interface ${n}Props\\b`).test(read(join(SRC, n + '.d.ts')))) errors.push(`${n}.d.ts: missing export interface ${n}Props`);
    if (!existsSync(join(dir, 'README.md'))) errors.push(`${n}: missing ${n}/README.md`);
    if (!existsSync(join(dir, 'preview.html'))) { errors.push(`${n}: missing ${n}/preview.html`); continue; }
    const html = read(join(dir, 'preview.html'));
    const m = html.split('\n')[0].match(/^<!-- @dsCard group="([^"]+)" height=(\d+)(?: subtitle="([^"]*)")? -->$/);
    if (!m) { errors.push(`${n}/preview.html: line 1 must be <!-- @dsCard group="…" height=N subtitle="…" -->`); continue; }
    if (!GROUPS.includes(m[1])) errors.push(`${n}/preview.html: group "${m[1]}" is not one of ${GROUPS.join(', ')}`);
    if (!/<div id="root"/.test(html)) errors.push(`${n}/preview.html: needs <div id="root">`);
    if ((html.match(/<script>/g) || []).length !== 1) errors.push(`${n}/preview.html: exactly one <script>`);
    if (/<script\s+src=|<link\s/i.test(html)) errors.push(`${n}/preview.html: no external scripts or stylesheets`);
    meta[n] = { group: m[1], height: +m[2] };
  }
  for (const d of readdirSync(COMP)) {
    if (d === 'src' || d === 'Cover' || !statSync(join(COMP, d)).isDirectory()) continue;
    if (!names.includes(d)) errors.push(`${d}/: no src/${d}.js`);
  }

  const order = names.slice().sort((a, b) =>
    (GROUPS.indexOf(meta[a]?.group) - GROUPS.indexOf(meta[b]?.group)) || a.localeCompare(b));

  const header = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: NAMESPACE, components: order.map((name) => ({ name })) })} */`;
  const js = [
    header,
    '(function () {',
    indent(read(join(SRC, 'core.js')).trim(), '  '),
    ...readdirSync(SRC).filter((f) => /^_.*\.js$/.test(f)).sort().map((f) => indent(read(join(SRC, f)).trim(), '  ')),
    '',
    ...order.map((n) => `  /* ---- ${n} ---- */\n  (function () {\n${indent(read(join(SRC, n + '.js')).trim(), '    ')}\n  })();\n`),
    `  window.${NAMESPACE} = Object.assign(window.${NAMESPACE} || {}, HY);`,
    '})();',
    '',
  ].join('\n');

  const css = [
    read(join(SRC, 'core.css')).trim(),
    ...order.map((n) => existsSync(join(SRC, n + '.css')) ? read(join(SRC, n + '.css')).trim() : ''),
    read(join(SRC, 'reduced-motion.css')).trim(),
    '',
  ].filter((s, i, a) => s || i === a.length - 1).join('\n\n');

  const dts = [
    read(join(SRC, 'core.d.ts')).trim(),
    ...order.map((n) => existsSync(join(SRC, n + '.d.ts')) ? read(join(SRC, n + '.d.ts')).trim() : ''),
    'declare global {\n  interface Window {\n    ' + NAMESPACE + ': {\n' +
      order.map((n) => `      ${n}: typeof ${n};`).join('\n') + '\n    };\n  }\n}',
    '',
  ].join('\n\n');

  try { new Function(js); } catch (e) { errors.push(`bundle.js: syntax error: ${e.message}`); }
  if (/<\/script|<!--/i.test(js)) errors.push('bundle.js: contains </script or <!-- (consumers inline it)');
  if (/<\/style/i.test(css)) errors.push('bundle.css: contains </style');
  if (/transition:\s*all/.test(css)) errors.push('bundle.css: transition: all (list properties)');
  const dup = order.filter((n) => (js.match(new RegExp(`define\\('${n}',`, 'g')) || []).length > 1);
  if (dup.length) errors.push('duplicate define: ' + dup.join(', '));

  if (write) {
    writeFileSync(join(COMP, 'bundle.js'), js);
    writeFileSync(join(COMP, 'bundle.css'), css);
    writeFileSync(join(COMP, 'index.d.ts'), dts);
  }
  return { order, meta, errors, sizes: { js: js.length, css: css.length, dts: dts.length } };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = build({ write: !process.argv.includes('--check') });
  console.log(`${r.order.length} components · bundle.js ${(r.sizes.js / 1024).toFixed(1)} KB · bundle.css ${(r.sizes.css / 1024).toFixed(1)} KB`);
  if (r.errors.length) { console.error(r.errors.map((e) => '✗ ' + e).join('\n')); process.exit(1); }
  console.log('✓ all checks pass');
}
