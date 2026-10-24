// Builds the static docs site into .cache/site (wiped each run) for GitHub Pages at https://hyprsh.github.io/design/.
// Every link is relative, so the same files work under /design/ and locally. Pages are plain HTML; JavaScript only runs
// the live examples, the theme control, the search field and the copy buttons. See docs/adr/0001-docs-site-without-dependencies.md.
// Usage: node scripts/site.mjs [--serve [port]]   (--serve builds, then serves at http://127.0.0.1:4401)
import { createServer } from 'node:http';
import vm from 'node:vm';
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, copyFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname, normalize, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, GROUPS } from './build.mjs';
import { compileTokens } from './tokens-css.mjs';
import { md, inline, esc, sections, slug } from './md.mjs';
import { componentDocs, pages, writeAgentDocs, kebab } from './docs.mjs';
import { foundationsIndex, foundationBody, foundationHead, tokensBody, writeRedirects, FOUNDATION_NOTES, TOKENS_LEAD } from './site-foundations.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = join(ROOT, 'project');
const COMP = join(PROJECT, 'components');
export const OUT = join(ROOT, '.cache/site');
const read = (p) => readFileSync(p, 'utf8');
const CDN = 'https://cdn.jsdelivr.net/npm/';
const REACT = [CDN + 'react@18.3.1/umd/react.production.min.js', CDN + 'react-dom@18.3.1/umd/react-dom.production.min.js'];
const BABEL = CDN + '@babel/standalone@7.26.4/babel.min.js';
const PROSE = { h1: 'heading-32', h2: 'heading-24', h3: 'heading-20', h4: 'heading-16', p: 'copy-16', li: 'copy-16', table: 'copy-14', pre: 'copy-13-mono' };
const ICONS = new Function(read(join(COMP, 'src/_icons.js')) + '\nreturn ICONS;')();
const REPO = 'https://github.com/hyprsh/design';
const VERSION = JSON.parse(read(join(ROOT, 'package.json'))).version;
// The GitHub mark (Octicons mark-github): Lucide has no brand icons. Linking to the repo is what GitHub allows it for.
const GITHUB_MARK = '<svg class="ico" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/></svg>';
// The logo mark, one path on a 24px grid (project/brand/logo-mark.svg).
const MARK_PATH = 'M12 1.5 L22.5 20 L15 16.5 L12 22 L9 16.5 L1.5 20 Z M12 7 L10.7 12.5 L12 14.5 L13.3 12.5 Z';
const icon = (n, cls = '') => `<svg class="ico ${cls}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

// The page a repo file becomes, for rewriting links between docs: '' (Getting started), 'guidelines/', 'components/button/'…
function pageOf(repoPath) {
  const c = /^project\/components\/(\w+)\/README\.md$/.exec(repoPath);
  if (c) return `components/${kebab(c[1])}/`;
  return { 'docs/getting-started.md': '', 'project/guidelines.md': 'guidelines/', 'project/README.md': 'foundations/' }[repoPath];
}
const linker = (fromRepo, rel) => (href) => {
  if (/^([a-z]+:|#|\/\/)/i.test(href)) return href;
  const [p, hash] = href.split('#');
  const repo = posix.normalize(posix.join(posix.dirname(fromRepo), p));
  const page = pageOf(repo);
  return (page === undefined ? `${REPO}/blob/main/${repo}` : rel + page) + (hash ? '#' + hash : '');
};

// ---------- Chrome ----------

// The theme key shared by the pre-paint script, site.js and the cards.
const THEME_KEY = 'hyprsh-docs-theme';
// ThemeSwitcher.js is plain script for the bundle's scope. Running it here with stub hooks yields the bundle's own
// themeScript(), so the pre-paint script resolves System exactly as the component does (stored 'light' or 'dark' are
// kept, anything else is System). The choice itself goes on <html data-choice> so the header icon is right from the start.
function themeScriptOf() {
  const defined = {};
  const stub = () => {};
  vm.runInNewContext(read(join(COMP, 'src/ThemeSwitcher.js')), { define: (n, c) => { defined[n] = c; }, useState: stub, useRef: stub, useId: stub, useEffect: stub, useControllable: stub, cx: stub, omit: stub, h: stub, HY: {} });
  return defined.themeScript({ storageKey: THEME_KEY });
}
const THEME_SCRIPT = `window.__pageErrors=[];addEventListener('error',function(e){__pageErrors.push(e.message||('Failed to load '+((e.target&&(e.target.src||e.target.href))||'a resource')))},true);addEventListener('unhandledrejection',function(e){__pageErrors.push(String(e.reason))});
${themeScriptOf()};
(function(d){var c;try{c=localStorage.getItem(${JSON.stringify(THEME_KEY)})}catch(e){}d.setAttribute('data-choice',c==='light'||c==='dark'?c:'system');d.className='js'})(document.documentElement);`;

function nav(ctx, current) {
  const a = (href, label) => `<a href="${ctx.rel}${href}"${href === current ? ' aria-current="page"' : ''}>${esc(label)}</a>`;
  const groups = GROUPS.map((g) => {
    const list = ctx.comps.filter((c) => c.group === g);
    return list.length ? `<div class="nav-group"><p class="nav-h label-12">${g}</p>${list.map((c) => a(`components/${c.kebab}/`, c.name)).join('')}</div>` : '';
  }).join('');
  return `<nav id="nav" class="nav label-14" aria-label="Docs">
${a('', 'Getting started')}
${a('changelog/', 'Changelog')}
<p class="nav-h label-12">Foundations</p>${a('foundations/', 'Overview')}${ctx.foundations.map((f) => a(f.path + '/', f.title)).join('')}
<p class="nav-h label-12">Guidelines</p>${a('guidelines/', 'Interface guidelines')}
<p class="nav-h label-12">Components</p>${a('components/', 'All Components')}
${groups}
<p class="nav-h label-12">Patterns</p>${a('patterns/', 'Patterns')}
</nav>`;
}

// The header's search field: a combobox over search-index.json, which site.js loads on first focus. At phone width
// it folds into an icon button that opens it over the header.
const search = (rel) => `<div class="search" data-base="${rel}">
<button class="icon-btn search-toggle" type="button" aria-label="Search" aria-expanded="false" aria-controls="search-box">${icon('search')}</button>
<div class="search-box" id="search-box">
<div class="hy-input hy-input--small search-field">${icon('search', 'search-icon')}<input id="search-input" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="search-list" aria-label="Search the docs" placeholder="Search…" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go"><kbd class="hy-kbd hy-kbd--small search-hint" aria-hidden="true">/</kbd></div>
<button class="icon-btn search-close" type="button" aria-label="Close Search">${icon('x')}</button>
<ul id="search-list" class="hy-menu__list search-list" role="listbox" aria-label="Search results" hidden></ul>
<p class="hy-sr" aria-live="polite" id="search-status"></p>
</div>
</div>`;

// What a page belongs to, as the search results group it: Getting started, Changelog, Foundations, Guidelines, Components, Patterns.
const sectionOf = (path) => ({ foundations: 'Foundations', changelog: 'Changelog', guidelines: 'Guidelines', components: 'Components', patterns: 'Patterns' })[path.split('/')[0]] || 'Getting started';
const GENERIC = new Set(['Examples', 'Card', 'Props', 'Usage']);
const text = (html) => html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').trim();

// ---------- The page system ----------
// Every page is a column with an optional header, the body, prev/next links and, at 1280px and up, an "On this page"
// list beside it. page() builds all of it; a body only writes its content:
//   page(ctx, { path, title, eyebrow: 'Foundations', lead: 'One or two sentences, inline markdown.', body })
//   - eyebrow or lead given: page() writes the header (eyebrow label-13, title as a heading-40 h1, lead copy-18), so
//     the body must not write its own h1. Pass heading: '…' when the h1 should differ from <title>.
//   - neither given: no header, and the body writes its own h1 (the home page's hero does).
//   - the list appears by itself on a page with 3 or more <h2 id>s; prev/next links appear on the pages in ctx.sequence.
// For a markdown page, splitHead(src) takes its # heading and first paragraph off as { title, lead, rest }.

export function splitHead(src) {
  const lines = src.replace(/\r\n?/g, '\n').trim().split('\n');
  if (!/^# /.test(lines[0])) return { title: null, lead: '', rest: src };
  let i = 1;
  while (i < lines.length && !lines[i].trim()) i++;
  const para = [];
  if (!/^(#|```|~~~|\||\s*([-*+]|\d+[.)])\s)/.test(lines[i] || '')) for (; i < lines.length && lines[i].trim(); i++) para.push(lines[i].trim());
  return { title: lines[0].slice(2).trim(), lead: para.join(' '), rest: lines.slice(i).join('\n') + '\n' };
}

const pageHead = ({ eyebrow, heading, lead }, rel, from) => `<header class="page-head">
${eyebrow ? `<p class="eyebrow label-13">${esc(eyebrow)}</p>\n` : ''}<h1 class="heading-40">${esc(heading)}</h1>
${lead ? `<p class="lead copy-18">${inline(lead, { link: from ? linker(from, rel) : undefined })}</p>\n` : ''}</header>`;

// The "On this page" list: every h2 with an id, in order. site.js marks the one being read.
function toc(main) {
  const items = [...main.matchAll(/<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => [m[1], text(m[2])]);
  if (items.length < 3) return '';
  return `<nav class="toc" aria-labelledby="toc-title">
<p class="toc-title label-13" id="toc-title"><strong>On This Page</strong></p>
<ul>${items.map(([id, name]) => `<li><a class="label-13" href="#${id}">${esc(name)}</a></li>`).join('')}</ul>
</nav>`;
}

// Previous / next along ctx.sequence, in the markup of the library's Pagination.
function pager(ctx, path, rel) {
  const seq = ctx.sequence || [];
  const at = seq.findIndex((s) => s.path === path);
  if (at < 0) return '';
  const link = (s, dir) => {
    const prev = dir === 'prev';
    return `<a class="hy-pagination__link hy-pagination__link--${dir}" href="${rel + s.path || './'}" rel="${dir}" aria-label="Go to ${prev ? 'previous' : 'next'} page: ${esc(s.title)}"><span class="hy-pagination__icon" aria-hidden="true">${icon(prev ? 'chevron-left' : 'chevron-right', 'ico-20')}</span><span class="hy-pagination__label">${prev ? 'Previous' : 'Next'}</span><span class="hy-pagination__title">${esc(s.title)}</span></a>`;
  };
  return `<nav class="hy-pagination pager" aria-label="Pagination">${at > 0 ? link(seq[at - 1], 'prev') : '<span></span>'}${at < seq.length - 1 ? link(seq[at + 1], 'next') : '<span></span>'}</nav>`;
}

// One page. path is its folder ('' for the root, 'components/button/'), markdown the path of its .md copy.
// eyebrow, lead and heading: see the page system above. from: the repo file the lead's links are relative to.
function page(ctx, { path, title, description = '', body, markdown, live = false, eyebrow, lead, heading = title, from }) {
  const rel = '../'.repeat(path.split('/').filter(Boolean).length);
  const c = { ...ctx, rel };
  const mdHref = markdown && rel + markdown;
  const content = body(c);
  const head = eyebrow !== undefined || lead !== undefined ? pageHead({ eyebrow, heading, lead }, rel, from) : '';
  const list = toc(content);
  const main = `<div class="page${list ? ' has-toc' : ''}${/class="prose wide"/.test(content) ? ' is-wide' : ''}">
<div class="page-col">
${head}${content}
${pager(ctx, path, rel)}
</div>
${list}</div>`;
  // Every h2 and h3 goes into the search index, except the headings every component page repeats.
  for (const m of main.matchAll(/<h([23]) id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)) {
    const name = text(m[3]);
    if (path.startsWith('components/') && path !== 'components/' && GENERIC.has(name)) continue;
    if (path === 'changelog/' && m[1] === '3') continue; // Features, Fixes… repeat under every version
    ctx.index.push({ type: 'heading', name, page: title === 'hyprsh design' ? 'Getting started' : title, section: sectionOf(path), url: `${path}#${m[2]}` });
  }
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}${title === 'hyprsh design' ? '' : ' · hyprsh design'}</title>
${description ? `<meta name="description" content="${esc(description)}">\n` : ''}<link rel="icon" href="${rel}brand/logo-mark.svg" type="image/svg+xml">
${mdHref ? `<link rel="alternate" type="text/markdown" href="${mdHref}">\n` : ''}<script>${THEME_SCRIPT}</script>
<link rel="stylesheet" href="${rel}tokens.css">
<link rel="stylesheet" href="${rel}bundle.css">
<link rel="stylesheet" href="${rel}site.css">
</head>
<body>
<a class="skip label-14" href="#main">Skip to Content</a>
<header class="top">
<button class="icon-btn menu-btn" type="button" aria-label="Menu" aria-controls="nav" aria-expanded="false">${icon('menu')}</button>
<a class="brand label-16" href="${rel || './'}"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="var(--accent-700)" d="${MARK_PATH}"/></svg><span><strong>hyprsh</strong> design</span></a>
<span class="top-version hy-badge hy-badge--small hy-badge--gray-subtle">v${VERSION}</span>
<span class="top-gap"></span>
${search(rel)}
${mdHref ? `<a class="top-link label-14" href="${mdHref}">Markdown</a>` : ''}
<a class="icon-btn" href="${REPO}" aria-label="hyprsh/design on GitHub">${GITHUB_MARK}</a>
<span class="theme-wrap"><button class="icon-btn theme-btn" type="button" aria-label="Theme: System">${icon('monitor', 'when-system')}${icon('sun', 'when-light')}${icon('moon', 'when-dark')}</button><span class="hy-tooltip__box hy-tooltip__box--bottom theme-tip" aria-hidden="true">Theme: System<svg class="hy-tooltip__tip" width="14" height="7" viewBox="0 0 14 7" aria-hidden="true" focusable="false"><path d="M0 0h14L8.4 6.1a1.9 1.9 0 0 1-2.8 0z"/></svg></span></span>
</header>
<div class="layout">
${nav(c, path)}
<main id="main" class="main">
${main}
</main>
</div>
${live ? [...REACT, `${rel}bundle.js`, BABEL].map((s) => `<script src="${s}"></script>`).join('\n') + '\n' : ''}<script src="${rel}site.js"></script>
</body>
</html>
`;
  const file = join(OUT, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

// ---------- Page bodies ----------

const prose = (src, from, rel, shift = 0) => md(src, { classes: PROSE, link: linker(from, rel), shift });

function propsHtml(interfaces) {
  if (!interfaces.length) return '<p class="copy-16">This component has no props of its own.</p>';
  return interfaces.map((it) => `<h3 id="${esc(it.name.toLowerCase())}" class="heading-20"><code>${it.name}</code></h3>
${it.note ? `<p class="copy-14 muted">${inline(it.note)}</p>` : ''}
${it.props.length ? `<div class="table-wrap"><table class="props copy-14"><thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead><tbody>
${it.props.map((p) => `<tr><td><code>${esc(p.name)}</code>${p.optional ? '' : ' <span class="req label-12">Required</span>'}</td><td><code class="type">${esc(p.type)}</code></td><td>${p.description ? inline(p.description) : '<span class="muted">—</span>'}</td></tr>`).join('\n')}
</tbody></table></div>` : ''}`).join('\n');
}

function componentBody(comp) {
  return (c) => {
    const from = `project/components/${comp.name}/README.md`;
    const examples = comp.examples.length
      ? comp.examples.map((ex, i) => `<section class="example" aria-labelledby="ex-${i}">
<h3 id="ex-${i}" class="heading-20">${esc(ex.title)}</h3>
${ex.description ? `<p class="copy-14 muted">${inline(ex.description)}</p>` : ''}
<div class="example-box" data-example data-component="${comp.name}" data-title="${esc(ex.title)}"><noscript><p class="copy-14 muted">The live example needs JavaScript. The code is below.</p></noscript></div>
<pre class="copy-13-mono" data-lang="jsx"><code>${esc(ex.code)}</code></pre>
</section>`).join('\n')
      : `<p class="copy-14 muted">No examples yet. This is the component’s card, showing its variants.</p>
<iframe class="card" src="${c.rel}cards/${comp.name}.html" title="${comp.name} card" style="height:${comp.height}px" loading="lazy"></iframe>`;
    return `<article class="prose">
<pre class="copy-13-mono" data-lang="jsx"><code>import { ${comp.name} } from '@hyprsh/design';</code></pre>
<h2 id="examples" class="heading-24">${comp.examples.length ? 'Examples' : 'Card'}</h2>
${examples}
<h2 id="props" class="heading-24">Props</h2>
${propsHtml(comp.interfaces)}
${comp.guidance ? `<h2 id="usage" class="heading-24">Usage</h2>\n${prose(comp.guidance, from, c.rel, 1)}` : ''}
</article>`;
  };
}

function componentsIndex(c) {
  return `<article class="prose wide">
${GROUPS.map((g) => {
    const list = c.comps.filter((x) => x.group === g);
    return list.length ? `<h2 id="${g.toLowerCase()}" class="heading-24">${g}</h2>
<ul class="comp-grid">${list.map((x) => `<li><a href="${x.kebab}/"><span class="label-14"><strong>${x.name}</strong></span><span class="copy-13 muted">${inline(x.summary)}</span></a></li>`).join('')}</ul>` : '';
  }).join('\n')}
</article>`;
}

// ---------- Getting started, Changelog and Interface guidelines ----------

// The home page: a hero, the Setup section as numbered steps, a "What's inside" grid, then the rest of
// docs/getting-started.md as it is. The markdown keeps the facts; the hero and the cards live only here.
const START = 'docs/getting-started.md';
function homeBody(src) {
  const parts = sections(src.replace(/\r\n?/g, '\n'), 2);
  const intro = splitHead(parts[0].body);
  const setup = parts.find((p) => p.slug === 'setup');
  const rest = parts.slice(1).filter((p) => p !== setup);
  const install = (/```bash\n(.+)\n```/.exec(src) || [])[1] || '';
  return (c) => {
    const steps = setup ? sections(setup.body, 3) : [];
    const setupHtml = setup ? `<h2 id="setup" class="heading-24">${esc(setup.title)}</h2>
${steps[0].body.replace(/^##.*\n/, '').trim() ? prose(steps[0].body.replace(/^##.*\n/, ''), START, c.rel) : ''}<ol class="steps">${steps.slice(1).map((s) => `<li class="step">${prose(s.body, START, c.rel)}</li>`).join('')}</ol>` : '';
    return `<section class="hero" aria-labelledby="hero-title">
<svg class="hero-mark" width="40" height="40" viewBox="0 0 24 24" aria-hidden="true"><path fill="var(--accent-700)" d="${MARK_PATH}"/></svg>
<h1 id="hero-title" class="heading-48">hyprsh design</h1>
<p class="hero-pitch copy-20">${inline(intro.lead)}</p>
<div class="hero-actions"><a class="hy-btn hy-btn--primary hy-btn--large" href="#setup"><span class="hy-btn__label">Get Started</span></a><a class="hy-btn hy-btn--secondary hy-btn--large" href="${c.rel}components/"><span class="hy-btn__label">Browse Components</span></a></div>
${install ? snippet(install) : ''}
</section>
<article class="prose">
${setupHtml}
<h2 id="whats-inside" class="heading-24">What’s inside</h2>
${inside(c)}
${rest.map((s) => prose(s.body, START, c.rel)).join('\n')}
</article>`;
  };
}

// A static Snippet (src/Snippet.js markup); site.js wires its copy button.
const snippet = (cmd) => `<div class="hy-snippet hero-snippet" translate="no"><pre class="hy-snippet__pre"><code class="hy-snippet__line"><span class="hy-snippet__prompt" aria-hidden="true">$ </span>${esc(cmd)}</code></pre><button type="button" class="hy-snippet__copy" aria-label="Copy to Clipboard" data-copy="${esc(cmd)}"><span class="hy-snippet__icon" aria-hidden="true">${icon('copy')}</span><span class="hy-snippet__icon is-hidden" aria-hidden="true">${icon('check')}</span></button><span class="hy-sr" aria-live="polite"></span></div>`;

// The cards under "What's inside", each with a small drawing made of tokens and library classes.
function inside(c) {
  const line = (w) => `<i class="art-line" style="width:${w}%"></i>`;
  const cards = [
    ['foundations/', 'Foundations', 'Colour, type, space, materials and motion, and the copy rules.',
      `<span class="heading-32 art-aa">Aa</span><span class="art-dots"><i class="art-dot art-fg"></i><i class="art-dot art-accent"></i><i class="art-dot art-border"></i><i class="art-dot art-bg"></i></span>`],
    ['foundations/tokens/', 'Tokens', 'Every colour, space, radius and shadow by name, as CSS variables.',
      `<span class="art-stack"><code class="label-12-mono art-chip">var(--gray-1000)</code><code class="label-12-mono art-chip">var(--space-6)</code></span>`],
    ['components/', 'Components', `${c.comps.length} React components, each with live examples and its props.`,
      `<span class="hy-btn hy-btn--primary hy-btn--small art-btn"><span class="hy-btn__label">Deploy</span></span><span class="hy-badge hy-badge--small hy-badge--green-subtle">Ready</span>`],
    ['guidelines/', 'Interface guidelines', 'Keyboard, forms, touch, motion and performance rules to build and review by.',
      `<span class="art-stack">${['Must', 'Should', 'Never'].map((w, i) => `<span class="art-row"><span class="hy-badge hy-badge--small ${['hy-badge--gray-subtle', 'hy-badge--pill', 'hy-badge--red-subtle'][i]}">${w}</span>${line([70, 52, 60][i])}</span>`).join('')}</span>`],
    ['changelog/', 'Changelog', 'What changed in each version, including breaking changes.',
      `<span class="art-stack"><span class="art-row"><span class="hy-badge hy-badge--small hy-badge--gray-subtle art-mono">v${VERSION}</span>${line(40)}</span><span class="art-row art-indent">${line(76)}</span><span class="art-row art-indent">${line(58)}</span></span>`],
    ['#coding-agents', 'Coding agents', 'AGENTS.md and a markdown page per component, matching the installed version.',
      `<span class="art-file">${icon('file-text')}<span class="label-13-mono">AGENTS.md</span></span>`],
  ];
  return `<ul class="inside">${cards.map(([href, title, desc, art]) => `<li><a class="inside-card" href="${href.startsWith('#') ? href : c.rel + href}"><span class="inside-art" aria-hidden="true">${art}</span><span class="inside-text"><span class="label-16"><strong>${esc(title)}</strong></span><span class="copy-14 muted">${esc(desc)}</span></span></a></li>`).join('')}</ul>`;
}

// The changelog: each version a section with its date beside the heading, scopes as small badges. The version
// headings keep their ids (#v0-13-0); the group headings get the version in front, so no id repeats.
function changelogBody(src, rel) {
  const parts = sections(src, 2);
  const classes = { ...PROSE, h3: 'heading-14 release-group', li: 'copy-14' };
  const scope = (html) => html.replace(/<li class="copy-14"><strong>([\w.,-]+):<\/strong>\s*/g, '<li class="copy-14"><span class="hy-badge hy-badge--small hy-badge--gray-subtle release-scope" translate="no">$1<span class="hy-sr">:</span></span> ');
  const before = parts[0].body.trim() ? prose(parts[0].body, 'CHANGELOG.md', rel) : '';
  return `<article class="prose">${before}${parts.slice(1).map((s) => {
    const lines = s.body.split('\n').slice(1);
    const at = lines.findIndex((l) => l.trim());
    const date = at > -1 && /^\d{4}-\d{2}-\d{2}$/.test(lines[at].trim()) ? lines.splice(at, 1)[0].trim() : '';
    const body = md(lines.join('\n'), { classes, link: linker('CHANGELOG.md', rel) }).replace(/<h3 id="([^"]+)"/g, `<h3 id="${s.slug}-$1"`);
    return `<section class="release" aria-labelledby="${s.slug}">
<div class="release-head"><h2 id="${s.slug}" class="heading-24">${inline(s.title)}</h2>${date ? `<time class="label-13-mono muted" datetime="${date}">${date}</time>` : ''}</div>
${scope(body)}</section>`;
  }).join('\n')}</article>`;
}

// The interface guidelines: Must / Should / Never as badges in front of each rule (the word stays, so the badge is
// not colour alone), the anti-patterns as a checklist and the licence text behind a disclosure. With the word set apart
// as a badge, the rule after it starts with a capital.
const RULE_TONE = { Must: 'gray-subtle', Should: 'pill', Never: 'red-subtle' };
function guidelinesBody(src, rel) {
  const from = 'project/guidelines.md';
  const rules = (html) => html.replace(/<ul>([\s\S]*?)<\/ul>/g, (all, inner) => !/<strong>(Must|Should|Never):<\/strong>/.test(inner) ? all
    : `<ul class="rules">${inner.replace(/<li class="copy-16"><strong>(Must|Should|Never):<\/strong>\s*([\s\S]*?)<\/li>/g,
      (_, w, t) => `<li class="copy-16 rule"><span class="hy-badge hy-badge--small hy-badge--${RULE_TONE[w]} rule-tag">${w}<span class="hy-sr">:</span></span><span class="rule-text">${t.replace(/^[a-z]/, (ch) => ch.toUpperCase())}</span></li>`)}</ul>`);
  const parts = sections(src, 2);
  return `<article class="prose">${parts.map((s) => {
    if (s.slug === 'anti-patterns-to-flag') {
      const [head, ...lines] = s.body.split('\n');
      const items = lines.filter((l) => /^[-*]\s+/.test(l)).map((l) => l.replace(/^[-*]\s+/, ''));
      const other = lines.filter((l) => !/^[-*]\s+/.test(l)).join('\n');
      return `${prose(head + '\n\n' + other, from, rel)}<ul class="checklist">${items.map((t) => `<li class="copy-14">${icon('ban', 'checklist-icon')}<span>${inline(t)}</span></li>`).join('')}</ul>`;
    }
    if (s.slug === 'licence') {
      const fence = /```[^\n]*\n([\s\S]*?)\n```/.exec(s.body);
      const html = prose(s.body.replace(/```[^\n]*\n[\s\S]*?\n```/, ''), from, rel);
      return html + (fence ? `<details class="licence"><summary class="label-14">${icon('chevron-right', 'licence-chevron')}Show the MIT Licence</summary><pre class="copy-13-mono"><code>${esc(fence[1])}</code></pre></details>` : '');
    }
    return rules(prose(s.body, from, rel));
  }).join('\n')}</article>`;
}

// A card on its own page, framed the way dev.mjs frames it. The theme comes from ?theme=, else from the page around it,
// and follows that page's theme control through postMessage. Framed on its own it uses the stored choice, else the OS.
function card(name, rel) {
  const head = `<script>(function(d){var q=new URLSearchParams(location.search).get('theme'),t=q;if(!t){try{t=parent.document.documentElement.getAttribute('data-theme')}catch(e){}}if(t==='light'||t==='dark'){d.setAttribute('data-theme',t)}else{var mq=matchMedia('(prefers-color-scheme: dark)'),pick=function(){var s;try{s=localStorage.getItem(${JSON.stringify(THEME_KEY)})}catch(e){}return s==='light'||s==='dark'?s:mq.matches?'dark':'light'};d.setAttribute('data-theme',pick());if(!q){var f=function(){d.setAttribute('data-theme',pick())};if(mq.addEventListener)mq.addEventListener('change',f);addEventListener('storage',f)}}addEventListener('message',function(e){if(e.data&&(e.data.theme==='light'||e.data.theme==='dark'))d.setAttribute('data-theme',e.data.theme)})})(document.documentElement);` +
    `window.addEventListener("error",function(e){var m=String(e.message);document.documentElement.setAttribute("data-card-error",m);if(parent!==window)parent.postMessage({card:location.pathname,error:m},"*")});</script>` +
    `<link rel="stylesheet" href="${rel}tokens.css"><link rel="stylesheet" href="${rel}bundle.css">` +
    REACT.map((s) => `<script src="${s}"></script>`).join('') + `<script src="${rel}bundle.js"></script>`;
  return read(join(COMP, name, 'preview.html')).replace(/^<!-- @dsCard[^\n]*\n/, '').replace('</head>', head + '</head>');
}

// ---------- Build ----------

export function buildSite() {
  const r = build();
  if (r.errors.length) throw new Error(r.errors.join('\n'));
  rmSync(OUT, { recursive: true, force: true });
  for (const d of ['fonts', 'brand', 'cards']) mkdirSync(join(OUT, d), { recursive: true });
  const tokens = JSON.parse(read(join(PROJECT, 'tokens.json')));
  writeFileSync(join(OUT, 'tokens.css'), compileTokens(tokens));
  copyFileSync(join(COMP, 'bundle.css'), join(OUT, 'bundle.css'));
  copyFileSync(join(COMP, 'bundle.js'), join(OUT, 'bundle.js'));
  for (const d of ['fonts', 'brand']) for (const f of readdirSync(join(PROJECT, d))) copyFileSync(join(PROJECT, d, f), join(OUT, d, f));
  for (const f of ['site.css', 'site.js']) copyFileSync(join(ROOT, 'scripts/site', f), join(OUT, f));
  writeFileSync(join(OUT, '.nojekyll'), '');

  const comps = componentDocs(r);
  const docs = pages();
  const files = writeAgentDocs(OUT, 'site', comps);
  const foundations = docs.pages.filter((p) => p.path.startsWith('foundations/'));
  const index = [];
  const ctx = { comps, foundations, index };
  const byPath = Object.fromEntries(docs.pages.map((p) => [p.path, p]));

  // The reading order of the first pages, for their prev/next links.
  ctx.sequence = [{ path: '', title: 'Getting started' }, { path: 'changelog/', title: 'Changelog' }, { path: 'foundations/', title: 'Foundations' },
    ...foundations.map((f) => ({ path: f.path + '/', title: f.title })), { path: 'guidelines/', title: 'Interface guidelines' }];

  const start = byPath['getting-started'];
  page(ctx, { path: '', title: 'hyprsh design', description: start.note, markdown: 'getting-started.md', body: homeBody(start.markdown) });
  const log = byPath.changelog;
  const logHead = splitHead(log.markdown);
  page(ctx, { path: 'changelog/', title: log.title, description: log.note, markdown: 'changelog.md', eyebrow: 'Releases', lead: logHead.lead, from: 'CHANGELOG.md',
    body: (c) => changelogBody(logHead.rest, c.rel) });
  page(ctx, { path: 'foundations/', title: 'Foundations', description: docs.intro.split('\n')[0], lead: docs.intro.split('\n')[0], from: 'project/README.md', body: foundationsIndex(docs, foundations) });
  for (const f of foundations) {
    const body = f.path === 'foundations/tokens' ? tokensBody(tokens) : foundationBody(f, (src, rel) => prose(src, 'project/README.md', rel));
    const head = f.path === 'foundations/tokens' ? { heading: 'Tokens', lead: TOKENS_LEAD } : foundationHead(f);
    page(ctx, { path: f.path + '/', title: f.title, description: FOUNDATION_NOTES[f.path] || f.note, markdown: f.path.slice(12) + '.md', eyebrow: 'Foundations', ...head, from: 'project/README.md', body });
  }
  writeRedirects(OUT);
  const guide = byPath.guidelines;
  const guideHead = splitHead(guide.markdown);
  page(ctx, { path: 'guidelines/', title: guide.title, description: guide.note, markdown: 'guidelines.md', eyebrow: 'Guidelines', lead: guideHead.lead, from: 'project/guidelines.md',
    body: (c) => guidelinesBody(guideHead.rest, c.rel) });
  page(ctx, { path: 'components/', title: 'Components', description: 'Every hyprsh component by group.', body: componentsIndex,
    lead: `${comps.length} React components, imported from \`@hyprsh/design\`. Each page has examples or its card, the props and when to use it.` });
  for (const comp of comps) {
    page(ctx, { path: `components/${comp.kebab}/`, title: comp.name, description: comp.summary, markdown: `${comp.kebab}.md`,
      body: componentBody(comp), live: comp.examples.length > 0, eyebrow: comp.group, lead: comp.summary });
    writeFileSync(join(OUT, 'cards', comp.name + '.html'), card(comp.name, '../'));
  }
  page(ctx, { path: 'patterns/', title: 'Patterns', description: 'Whole screens composed from several components.',
    lead: 'A pattern is a whole screen composed from several components, such as a settings page.',
    body: () => `<article class="prose"><p class="copy-16">No patterns yet.</p></article>` });

  // The search index: components and pages first, then the headings page() collected as it wrote each page.
  const entries = [
    ...comps.map((c) => ({ type: 'component', name: c.name, group: c.group, summary: c.summary.replace(/`/g, ''), section: 'Components', url: `components/${c.kebab}/` })),
    ...[['', 'Getting started', start.note], ...docs.pages.filter((p) => p.path !== 'getting-started').map((p) => [p.path + '/', p.title, p.note]), ['patterns/', 'Patterns', 'Whole screens composed from several components.']]
      .map(([url, name, summary]) => ({ type: 'page', name, summary: (summary || '').replace(/`/g, ''), section: sectionOf(url), url })),
    ...index,
  ];
  writeFileSync(join(OUT, 'search-index.json'), JSON.stringify(entries));

  return { search: entries.length, comps: comps.length, examples: comps.reduce((n, c) => n + c.examples.length, 0), withExamples: comps.filter((c) => c.examples.length).length, files: files.length };
}

// ---------- Serving ----------

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };

// Serves dir; port 0 picks a free one. Resolves to the server once it listens.
export function serve(dir = OUT, port = 4401) {
  const server = createServer((req, res) => {
    let p = normalize(join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
    if (!p.startsWith(dir)) { res.writeHead(403); return res.end(); }
    if (existsSync(p) && statSync(p).isDirectory()) {
      if (!req.url.split('?')[0].endsWith('/')) { res.writeHead(301, { location: req.url.replace(/(\?|$)/, '/$1') }); return res.end(); }
      p = join(p, 'index.html');
    }
    if (!existsSync(p)) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('not found'); }
    res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(p));
  });
  return new Promise((ok) => server.listen(port, '127.0.0.1', () => ok(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = buildSite();
  console.log(`.cache/site · ${r.comps} components · ${r.examples} examples on ${r.withExamples} pages · ${r.files} agent docs · ${r.search} search entries`);
  const at = process.argv.indexOf('--serve');
  if (at > -1) {
    const server = await serve(OUT, +(process.argv[at + 1] || 4401));
    console.log(`hyprsh docs → http://127.0.0.1:${server.address().port}/`);
  }
}
