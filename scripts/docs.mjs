// The docs for coding agents, shared by the docs site (scripts/site.mjs) and the package (scripts/package.mjs), so both
// write identical files: a markdown page per component (its README plus a Props table generated from src/<Name>.d.ts),
// markdown copies of Getting started, the foundations and the guidelines, components.json and AGENTS.md.
// Usage: import { componentDocs, writeAgentDocs } from './docs.mjs';
//   writeAgentDocs(dir, 'package')  dir/AGENTS.md and dir/docs/…
//   writeAgentDocs(dir, 'site')     dir/AGENTS.md, dir/llms.txt, dir/llms-full.txt and the rest at dir/…
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sections } from './md.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = join(ROOT, 'project');
const COMP = join(PROJECT, 'components');
const read = (p) => readFileSync(p, 'utf8');
export const SITE_URL = 'https://hyprsh.github.io/design/';
export const kebab = (n) => n.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();

// ---------- README ----------

// { title, summary, examples: [{ title, description, code }], guidance }: guidance is the README after the summary,
// without the H1 and the Examples section.
export function splitReadme(src) {
  const parts = sections(src.replace(/\r\n?/g, '\n'), 2);
  const head = parts[0].body.split('\n');
  const title = (head.find((l) => /^# /.test(l)) || '').slice(2).trim();
  const rest = head.filter((l) => !/^# /.test(l)).join('\n').trim();
  const [summary, ...more] = rest.split(/\n\s*\n/);
  const ex = parts.find((p) => p.title === 'Examples');
  const guidance = [more.join('\n\n'), ...parts.slice(1).filter((p) => p !== ex).map((p) => p.body)].filter((s) => s.trim()).join('\n\n').trim();
  return { title, summary: (summary || '').replace(/\s*\n\s*/g, ' ').trim(), examples: ex ? parseExamples(ex.body) : [], guidance };
}

// The ### blocks of an Examples section: a title, an optional description and one ```jsx fence.
export function parseExamples(section) {
  return sections(section, 3).slice(1).map((s) => {
    const lines = s.body.split('\n').slice(1);
    const open = lines.findIndex((l) => /^```(jsx|tsx|js)?\s*$/.test(l));
    const close = open < 0 ? -1 : lines.findIndex((l, i) => i > open && /^```\s*$/.test(l));
    return {
      title: s.title,
      description: (open < 0 ? lines : lines.slice(0, open)).join(' ').replace(/\s+/g, ' ').trim(),
      code: open < 0 || close < 0 ? '' : lines.slice(open + 1, close).join('\n'),
    };
  });
}

// ---------- Props from .d.ts ----------

// Splits text at separators that sit outside brackets, strings and comments.
function topLevel(text, isSep) {
  const out = [];
  let depth = 0, cur = '', q = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { cur += c; if (c === q && text[i - 1] !== '\\') q = null; continue; }
    if (c === "'" || c === '"' || c === '`') { q = c; cur += c; continue; }
    if (c === '/' && text[i + 1] === '*') { const end = text.indexOf('*/', i + 2) + 2; cur += text.slice(i, end); i = end - 1; continue; }
    if (c === '/' && text[i + 1] === '/') { const end = text.indexOf('\n', i); i = (end < 0 ? text.length : end) - 1; continue; }
    if ('{([<'.includes(c)) depth++;
    else if ('})]'.includes(c) || (c === '>' && text[i - 1] !== '=')) depth--;
    if (depth === 0 && isSep(c, i, cur)) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

// Ends a member at a newline too, unless the type goes on (a trailing | or : or a leading | on the next line).
const code = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').trim();
const memberEnd = (text) => (c, i, cur) => c === ';' || (c === '\n' && code(cur) && !/[|&:,(<{=]$/.test(code(cur)) && !/^\s*[|&]/.test(text.slice(i + 1)));

const ELEMENTS = { Anchor: 'a', UList: 'ul', OList: 'ol', LI: 'li', DList: 'dl', TextArea: 'textarea', FieldSet: 'fieldset', TableRow: 'tr', Paragraph: 'p', Image: 'img' };
const element = (attrs, el) => {
  if (el === 'HTMLElement') return 'any HTML element';
  if (el === 'HTMLTableCellElement') return '`<' + (/Th/.test(attrs) ? 'th' : 'td') + '>`';
  if (el === 'HTMLTableSectionElement') return '`<thead>`, `<tbody>` or `<tfoot>`';
  const n = el.replace(/^HTML|Element$/g, '');
  return '`<' + (ELEMENTS[n] || n.toLowerCase()) + '>`';
};
const names = (list) => list.map((n) => '`' + n + '`').join(', ').replace(/, ([^,]*)$/, ' and $1');

// "Also takes the attributes of `<button>` except `type` and `prefix`." for one part of an extends clause.
function extendsNote(part, aliases) {
  let base = part, omit = [];
  const om = /^Omit<([\s\S]+),\s*((?:'[^']*'\s*\|?\s*)+)>$/.exec(part);
  if (om) { base = om[1].trim(); omit = [...om[2].matchAll(/'([^']*)'/g)].map((m) => m[1]); }
  const al = /^(\w+)<(\w+)>$/.exec(base);
  if (al && aliases[al[1]]) base = aliases[al[1]].body.replaceAll(aliases[al[1]].param, al[2]);
  const except = omit.length ? ` except ${names(omit)}` : '';
  const html = /React\.(\w*)HTMLAttributes<(\w+)>/.exec(base);
  if (html) return `the attributes of ${element(html[1], html[2])}${except}`;
  if (/^\w+Props$/.test(base)) return `the props of \`${base}\`${except}`;
  return `\`${part}\``;
}

// Every exported …Props interface in a .d.ts: [{ name, extends, note, props: [{ name, type, optional, description }] }].
export function parseProps(dts) {
  const aliases = {};
  for (const m of dts.matchAll(/^type (\w+)<(\w+)> = ([^;]+);/gm)) aliases[m[1]] = { param: m[2], body: m[3] };
  const out = [];
  for (const m of dts.matchAll(/^export interface (\w+Props)\b(<[^{]*?>)?\s*(?:extends ([^{]+?))?\s*\{/gm)) {
    let depth = 1, j = m.index + m[0].length;
    for (; j < dts.length && depth; j++) depth += dts[j] === '{' ? 1 : dts[j] === '}' ? -1 : 0;
    const body = dts.slice(m.index + m[0].length, j - 1);
    const props = topLevel(body, memberEnd(body)).map((raw) => {
      const doc = [...raw.matchAll(/\/\*\*([\s\S]*?)\*\//g)].map((d) => d[1].replace(/^\s*\*\s?/gm, '').replace(/\s+/g, ' ').trim()).join(' ');
      const decl = raw.replace(/\/\*[\s\S]*?\*\//g, '').trim().replace(/[;,]$/, '');
      const pm = /^(?:readonly\s+)?(\[[^\]]+\]|'[^']+'|"[^"]+"|[\w$]+)(\?)?\s*(\([^)]*\))?\s*:\s*([\s\S]+)$/.exec(decl);
      if (!pm) return null;
      const type = (pm[3] ? `${pm[3]} => ${pm[4]}` : pm[4]).replace(/\s+/g, ' ').replace(/^\| /, '').trim();
      return { name: pm[1].replace(/^['"]|['"]$/g, ''), type, optional: !!pm[2], description: doc };
    }).filter(Boolean);
    const ext = m[3] ? topLevel(m[3], (c) => c === ',') : [];
    out.push({ name: m[1], extends: ext.join(', ') || undefined, note: ext.length ? `Also takes ${ext.map((p) => extendsNote(p, aliases)).join(', and ')}.` : '', props });
  }
  return out;
}

const cell = (s) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');
export function propsMarkdown(interfaces) {
  const out = ['## Props'];
  for (const it of interfaces) {
    out.push('', `### ${it.name}`);
    if (it.note) out.push('', it.note);
    if (it.props.length) {
      out.push('', '| Prop | Type | Required | Description |', '|---|---|---|---|');
      for (const p of it.props) out.push(`| \`${cell(p.name)}\` | \`${cell(p.type)}\` | ${p.optional ? 'No' : 'Yes'} | ${cell(p.description)} |`);
    }
  }
  return out.join('\n') + '\n';
}

// ---------- Components ----------

// One entry per component, in the build's order. Takes build()'s { order, meta }.
export function componentDocs({ order, meta }) {
  return order.map((name) => {
    const readme = read(join(COMP, name, 'README.md')).replace(/\r\n?/g, '\n').trim() + '\n';
    const r = splitReadme(readme);
    const dtsFile = join(COMP, 'src', name + '.d.ts');
    const interfaces = existsSync(dtsFile) ? parseProps(read(dtsFile)) : [];
    const main = interfaces.find((i) => i.name === name + 'Props');
    return {
      name, kebab: kebab(name), group: meta[name]?.group, height: meta[name]?.height || 200,
      summary: r.summary, examples: r.examples, guidance: r.guidance, interfaces,
      props: main ? main.props : [], extends: main?.extends,
      markdown: readme + '\n' + propsMarkdown(interfaces),
    };
  });
}

// ---------- Pages ----------

const PLACEHOLDER = '# Getting started\n\nThis page is not written yet. See the README in the repo.\n';

// The markdown of the docs pages other than components: [{ path, title, note, markdown }], paths without .md.
export function pages() {
  const gs = join(ROOT, 'docs/getting-started.md');
  const start = existsSync(gs) ? read(gs).trim() + '\n' : PLACEHOLDER;
  const brand = sections(read(join(PROJECT, 'README.md')).replace(/\r\n?/g, '\n'), 2);
  // A one-line note for llms.txt: the first sentence of the text before the subheadings, then the subheadings.
  const sentence = (src) => {
    const body = src.replace(/^#.*\n/, '');
    const subs = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    const lead = subs.length > 2 ? body.split(/^## /m)[0] : body;
    const line = (lead.split('\n').map((l) => l.trim()).find((l) => l && !/^(#|\||```)/.test(l)) || '')
      .replace(/^[-*]\s+/, '').replace(/^\*\*[^*]+\.\*\*\s*/, '').replace(/\*\*/g, '');
    const first = (line.match(/^.*?\.(\s|$)/) || [line])[0].trim();
    return [first, subs.length > 2 ? `Sections: ${subs.join(', ').replace(/, ([^,]*)$/, ' and $1')}.` : ''].filter(Boolean).join(' ');
  };
  const out = [{ path: 'getting-started', title: 'Getting started', markdown: start, note: sentence(start) }];
  for (const s of brand.slice(1)) {
    // Each section stands alone: ## becomes # and every deeper heading moves up a level.
    const markdown = s.body.replace(/^(#{2,6}) /gm, (_, h) => h.slice(1) + ' ');
    out.push({ path: `foundations/${s.slug}`, title: s.title, markdown, note: sentence(markdown) });
  }
  out.push({ path: 'foundations/tokens', title: 'Tokens', markdown: tokensMarkdown(), note: 'Every token by name: colours per theme, space, radius, shadows, z-index and type styles.' });
  const guide = read(join(PROJECT, 'guidelines.md')).trim() + '\n';
  out.push({ path: 'guidelines', title: 'Interface guidelines', markdown: guide, note: sentence(guide) });
  return { intro: brand[0].body.trim(), pages: out };
}

export function tokensMarkdown(t = JSON.parse(read(join(PROJECT, 'tokens.json')))) {
  const themes = t.color.themes.map((x) => x.id);
  const v = (x) => (x && typeof x === 'object' ? themes.map((th) => x[th]).join(' / ') : String(x));
  const table = (head, rows) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.map((c) => cell(String(c ?? ''))).join(' | ')} |`)].join('\n');
  const out = ['# Tokens', '', 'Every token is a CSS custom property (`var(--gray-1000)`) and every type style a class (`.label-14`). Use them by name; never copy a value.', ''];
  out.push('## Colour', '', `Values are ${themes.join(' / ')}.`, '', table(['Token', 'Value', 'Usage'], t.color.tokens.map((c) => ['`' + c.name + '`', v(c.value), c.usage || ''])), '');
  out.push('## Shadow', '', table(['Token', 'Value', 'Usage'], t.shadow.tokens.map((c) => ['`' + c.name + '`', v(c.value), c.usage || ''])), '');
  for (const [k, fam] of Object.entries(t)) {
    if (['name', 'version', 'meta', 'color', 'type', 'shadow'].includes(k) || !fam?.tokens) continue;
    const title = { spacing: 'Space', zIndex: 'Z-index' }[k] || k[0].toUpperCase() + k.slice(1);
    out.push(`## ${title}`, '', table(['Token', 'Value', 'Usage'], fam.tokens.map((c) => ['`' + c.name + '`', typeof c.value === 'number' ? c.value + 'px' : c.value, c.usage || ''])), '');
  }
  out.push('## Type styles', '', 'Classes: `.heading-32`, `.label-14`… The Labels and Copy styles also come as `-strong`.', '');
  const rows = t.type.groups.flatMap((g) => g.styles.map((s) => ['`' + s.name + '`', `${s.fontSize} / ${s.lineHeight}, ${s.fontWeight}${s.letterSpacing ? ', ' + s.letterSpacing : ''}${(s.family || g.family) === 'mono' ? ', mono' : ''}`, s.usage || '']));
  out.push(table(['Class', 'Size / line, weight', 'Usage'], rows), '');
  return out.join('\n');
}

// ---------- Index files ----------

const pkg = () => JSON.parse(read(join(ROOT, 'package.json')));

export function componentsJson(comps) {
  return JSON.stringify(comps.map((c) => ({
    name: c.name, group: c.group, summary: c.summary, import: `import { ${c.name} } from '@hyprsh/design';`,
    doc: `components/${c.kebab}.md`, props: c.props, ...(c.extends ? { extends: c.extends } : {}),
  })), null, 2) + '\n';
}

// AGENTS.md. docs is the path from the file to the docs folder: 'docs/' in the package, '' on the site.
export function agentsMd(comps, docs) {
  const p = pkg();
  return `# ${p.name}

hyprsh's design system for React apps: tokens, the Geist fonts, brand assets and ${comps.length} components. This file is generated from version ${p.version} (scripts/docs.mjs); the docs it links match that version.

## Setup

- CSS, once at the app's root: \`import '@hyprsh/design/tokens.css';\` then \`import '@hyprsh/design/styles.css';\`.
- With Tailwind v4, instead of those two: \`@import "tailwindcss";\` then \`@import "@hyprsh/design/tailwind.css";\`. Utilities such as \`bg-background-100\`, \`text-gray-900\`, \`label-14\` and \`shadow-menu\` then name the tokens.
- Components: \`import { Button, Input } from '@hyprsh/design';\`. React and ReactDOM 18 or newer are peer dependencies.
- Themes: \`data-theme="dark"\` (or a \`.dark\` class) on an ancestor, usually \`<html>\`. Light is the default.
- Icons: \`<Icon icon={GitBranch} />\` with \`GitBranch\` from \`lucide-react\`, or Lucide components directly.
- Setup in full: ${docs}getting-started.md.

## Rules

- Tokens only: \`var(--gray-1000)\`, \`var(--space-4)\`, \`var(--radius-md)\`, \`var(--shadow-menu)\`, and the type classes (\`heading-24\`, \`label-14\`, \`copy-14\`). Never hard-code a hex colour or an ad-hoc font size. Names: ${docs}foundations/tokens.md.
- Reach anything that shows the accent through \`accent-*\`, never \`blue-*\`. Red is only for errors and destructive actions.
- Title Case for labels, buttons, tabs and menu items; sentence case for body copy. Buttons name their result (“Deploy Project”, never “Submit” or “OK”).
- Type \`…\`, never \`...\`. Curly quotes. No emoji, no exclamation marks.
- Icons come from Lucide only, through \`Icon\` or \`lucide-react\`. Icon-only buttons get an \`aria-label\`.
- Use an existing component before writing one, and use its props before overriding its CSS. Check its doc for when to use it and what to use instead.
- Check every screen in both themes and at phone width (375px).
- Follow ${docs}guidelines.md (accessibility, forms, motion, touch sizing). Copy and visual rules: ${docs}foundations/.

## Docs

- ${docs}components.json: every component with its group, summary, import line and props.
- ${docs}components/<name>.md: one per component, with examples and a Props table.

## Components

${comps.map((c) => `- ${c.name}: ${c.summary} → ${docs}components/${c.kebab}.md`).join('\n')}
`;
}

export function llmsTxt(comps, { intro, pages: list }) {
  const link = (pg) => `- [${pg.title}](${pg.path}.md)${pg.note ? ': ' + pg.note : ''}`;
  const by = (pre) => list.filter((pg) => pg.path.startsWith(pre));
  return `# hyprsh design

> hyprsh's design system for React apps: tokens, the Geist fonts, brand assets and ${comps.length} components, installed as the @hyprsh/design package.

${intro.split('\n')[0]}

## Getting started

${by('getting-started').map(link).join('\n')}
- [AGENTS.md](AGENTS.md): the setup, the hard rules and an index of every component, as the package ships it.

## Foundations

${by('foundations/').map(link).join('\n')}

## Guidelines

${by('guidelines').map(link).join('\n')}

## Components

${comps.map((c) => `- [${c.name}](components/${c.kebab}.md): ${c.summary}`).join('\n')}

## Optional

- [components.json](components.json): every component with its group, summary, import line and props, as JSON.
- [llms-full.txt](llms-full.txt): all of the above in one file.
`;
}

// Every file of the agent docs as { path: content }, paths relative to the output folder.
export function agentFiles(comps, target) {
  const docs = target === 'package' ? 'docs/' : '';
  const pg = pages();
  const files = { 'AGENTS.md': agentsMd(comps, docs), [docs + 'components.json']: componentsJson(comps) };
  for (const p of pg.pages) files[`${docs}${p.path}.md`] = p.markdown;
  for (const c of comps) files[`${docs}components/${c.kebab}.md`] = c.markdown;
  if (target === 'site') {
    files['llms.txt'] = llmsTxt(comps, pg);
    files['llms-full.txt'] = [...pg.pages.map((p) => p.markdown), ...comps.map((c) => c.markdown)].map((s) => s.trim()).join('\n\n---\n\n') + '\n';
  }
  return files;
}

export function writeAgentDocs(dir, target, comps) {
  const files = agentFiles(comps, target);
  for (const [p, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), content);
  }
  return Object.keys(files);
}

