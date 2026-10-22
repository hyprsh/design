// Compiles project/tokens.json to CSS the way the Design System artifact does:
// colours + shadows per theme, then spacing/radius/other families, font stacks,
// one class per type style and an @font-face per font.
// Usage: node scripts/tokens-css.mjs > tokens.css
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const px = (v) => (typeof v === 'number' ? v + 'px' : v);

// The declarations of every type style, as [name, 'prop: value; …'] pairs.
export function typeStyles(t) {
  const out = [];
  for (const g of t.type.groups) {
    for (const s of g.styles) {
      const fam = s.family || g.family;
      const p = [fam && `font-family: var(--font-${fam})`, s.fontSize !== undefined && `font-size: ${px(s.fontSize)}`,
        s.lineHeight !== undefined && `line-height: ${typeof s.lineHeight === 'number' && s.lineHeight >= 10 ? s.lineHeight + 'px' : s.lineHeight}`,
        s.fontWeight !== undefined && `font-weight: ${s.fontWeight}`, s.letterSpacing !== undefined && `letter-spacing: ${px(s.letterSpacing)}`].filter(Boolean);
      out.push([s.name, p.join('; ') + ';']);
    }
  }
  return out;
}

// classes: false leaves out the type classes (the Tailwind entry ships them as @utility instead).
export function compileTokens(t, base = '', { classes = true } = {}) {
  const themes = t.color.themes.map((x) => x.id);
  const val = (v, th) => {
    if (v && typeof v === 'object') v = v[th] ?? v[themes[0]];
    const m = /^\{(.+)\}$/.exec(v);
    return m ? `var(--${m[1]})` : v;
  };
  const out = [];
  themes.forEach((th, i) => {
    const sel = i === 0 ? `:root, [data-theme="${th}"]` : `[data-theme="${th}"]`;
    const decl = [...t.color.tokens, ...(t.shadow?.tokens || [])].map((c) => `  --${c.name}: ${val(c.value, th)};`);
    out.push(`${sel} {\n${decl.join('\n')}\n}`);
  });
  const other = [];
  for (const [k, fam] of Object.entries(t)) {
    if (['name', 'version', 'meta', 'color', 'type', 'shadow'].includes(k) || !fam?.tokens) continue;
    for (const c of fam.tokens) other.push(`  --${c.name}: ${px(c.value)};`);
  }
  for (const [k, v] of Object.entries(t.type.families)) other.push(`  --font-${k}: ${v};`);
  out.push(`:root {\n${other.join('\n')}\n}`);
  if (classes) for (const [name, decl] of typeStyles(t)) out.push(`.${name} { ${decl} }`);
  for (const f of t.type.fonts) {
    const file = f.file.includes('/') ? f.file : 'fonts/' + f.file;
    out.push(`@font-face { font-family: "${f.family}"; src: url("${base}${file}") format("woff2"); font-weight: ${f.weight}; font-style: ${f.style || 'normal'}; font-display: swap; }`);
  }
  return out.join('\n') + '\n';
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  process.stdout.write(compileTokens(JSON.parse(readFileSync(join(root, 'project/tokens.json'), 'utf8'))));
}
