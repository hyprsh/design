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
import { md, inline, esc } from './md.mjs';
import { componentDocs, pages, writeAgentDocs, kebab } from './docs.mjs';

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

// One page. path is its folder ('' for the root, 'components/button/'), markdown the path of its .md copy.
function page(ctx, { path, title, description = '', body, markdown, live = false }) {
  const rel = '../'.repeat(path.split('/').filter(Boolean).length);
  const c = { ...ctx, rel };
  const mdHref = markdown && rel + markdown;
  const main = body(c);
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
<a class="brand label-16" href="${rel || './'}"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="var(--accent-700)" d="M12 1.5 L22.5 20 L15 16.5 L12 22 L9 16.5 L1.5 20 Z M12 7 L10.7 12.5 L12 14.5 L13.3 12.5 Z"/></svg><span><strong>hyprsh</strong> design</span></a>
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
<p class="eyebrow label-13">${comp.group}</p>
<h1 class="heading-32">${comp.name}</h1>
<p class="lead copy-18">${inline(comp.summary)}</p>
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
<h1 class="heading-32">Components</h1>
<p class="lead copy-18">${c.comps.length} React components, imported from <code>@hyprsh/design</code>. Each page has examples or its card, the props and when to use it.</p>
${GROUPS.map((g) => {
    const list = c.comps.filter((x) => x.group === g);
    return list.length ? `<h2 id="${g.toLowerCase()}" class="heading-24">${g}</h2>
<ul class="comp-grid">${list.map((x) => `<li><a href="${x.kebab}/"><span class="label-14"><strong>${x.name}</strong></span><span class="copy-13 muted">${inline(x.summary)}</span></a></li>`).join('')}</ul>` : '';
  }).join('\n')}
</article>`;
}

function tokensBody(t) {
  const themes = t.color.themes.map((x) => x.id);
  const val = (v) => (v && typeof v === 'object' ? themes.map((th) => v[th]).join(' · ') : String(v));
  const scales = new Map(), single = [];
  for (const c of t.color.tokens) {
    const m = /^(.+)-(\d+)$/.exec(c.name);
    if (m) (scales.get(m[1]) || scales.set(m[1], []).get(m[1])).push(c);
    else single.push(c);
  }
  const usage = (c) => (c.usage ? ` title="${esc(c.usage)}"` : '');
  const row = (name, sample, value, use) => `<tr><td>${sample}</td><td><code>${name}</code></td><td><code class="type">${esc(value)}</code></td><td>${use ? inline(use) : ''}</td></tr>`;
  const table = (rows) => `<div class="table-wrap"><table class="props tokens copy-14"><thead><tr><th><span class="hy-sr">Sample</span></th><th>Token</th><th>Value</th><th>Usage</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  return () => `<article class="prose wide">
<h1 class="heading-32">Tokens</h1>
<p class="lead copy-18">Every token is a CSS custom property and every type style a class. Use them by name. Swatches follow the theme control; values read ${themes.join(' · ')}.</p>
<h2 id="colour" class="heading-24">Colour</h2>
${[...scales].map(([name, list]) => `<h3 id="colour-${name}" class="heading-16">${name}</h3>
<ul class="swatches">${list.map((c) => `<li${usage(c)}><span class="chip" style="background:var(--${c.name})"></span><code class="label-12-mono">${c.name.slice(name.length + 1)}</code><span class="label-12-mono muted">${esc(val(c.value))}</span></li>`).join('')}</ul>`).join('\n')}
<h3 id="colour-other" class="heading-16">Other colours</h3>
${table(single.map((c) => row(c.name, `<span class="chip" style="background:var(--${c.name})"></span>`, val(c.value), c.usage)))}
<h2 id="space" class="heading-24">Space</h2>
${table(t.spacing.tokens.map((c) => row(c.name, `<span class="bar" style="width:var(--${c.name})"></span>`, c.value, c.usage)))}
<h2 id="radius" class="heading-24">Radius</h2>
${table(t.radius.tokens.map((c) => row(c.name, `<span class="box" style="border-radius:var(--${c.name})"></span>`, c.value, c.usage)))}
<h2 id="shadow" class="heading-24">Shadow</h2>
${table(t.shadow.tokens.map((c) => row(c.name, `<span class="box shadow" style="box-shadow:var(--${c.name})"></span>`, val(c.value), c.usage)))}
<h2 id="type" class="heading-24">Type styles</h2>
<p class="copy-16">Classes such as <code>.heading-32</code> and <code>.label-14</code>. The Labels and Copy styles also come as <code>-strong</code>.</p>
${t.type.groups.map((g) => `<h3 id="type-${g.name.toLowerCase()}" class="heading-16">${g.name}</h3>
<ul class="type-list">${g.styles.map((s) => `<li><div class="${s.name} type-sample">${esc(s.sample || s.name)}</div><p class="copy-13 muted"><code>${s.name}</code> ${esc(`${s.fontSize} / ${s.lineHeight}, ${s.fontWeight}`)}${s.usage ? ' · ' + inline(s.usage) : ''}</p></li>`).join('')}</ul>`).join('\n')}
<h2 id="other" class="heading-24">Size, breakpoint and z-index</h2>
${table([...t.size.tokens, ...t.breakpoint.tokens, ...t.zIndex.tokens].map((c) => row(c.name, '', String(c.value), c.usage)))}
</article>`;
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

  const start = byPath['getting-started'];
  page(ctx, { path: '', title: 'hyprsh design', description: start.note, markdown: 'getting-started.md',
    body: (c) => `<article class="prose">${prose(start.markdown, 'docs/getting-started.md', c.rel)}</article>` });
  const log = byPath.changelog;
  page(ctx, { path: 'changelog/', title: log.title, description: log.note, markdown: 'changelog.md',
    body: (c) => `<article class="prose">${prose(log.markdown, 'CHANGELOG.md', c.rel)}</article>` });
  page(ctx, { path: 'foundations/', title: 'Foundations', description: docs.intro.split('\n')[0],
    body: () => `<article class="prose"><h1 class="heading-32">Foundations</h1>${prose(docs.intro, 'project/README.md', '../')}
<ul class="link-list">${foundations.map((f) => `<li><a class="label-16" href="${f.path.slice(12)}/"><strong>${esc(f.title)}</strong></a><span class="copy-14 muted">${inline(f.note)}</span></li>`).join('')}</ul></article>` });
  for (const f of foundations) {
    const body = f.path === 'foundations/tokens' ? tokensBody(tokens)
      : (c) => `<article class="prose">${prose(f.markdown, 'project/README.md', c.rel)}</article>`;
    page(ctx, { path: f.path + '/', title: f.title, description: f.note, markdown: f.path.slice(12) + '.md', body });
  }
  const guide = byPath.guidelines;
  page(ctx, { path: 'guidelines/', title: guide.title, description: guide.note, markdown: 'guidelines.md',
    body: (c) => `<article class="prose">${prose(guide.markdown, 'project/guidelines.md', c.rel)}</article>` });
  page(ctx, { path: 'components/', title: 'Components', description: 'Every hyprsh component by group.', body: componentsIndex });
  for (const comp of comps) {
    page(ctx, { path: `components/${comp.kebab}/`, title: comp.name, description: comp.summary, markdown: `${comp.kebab}.md`,
      body: componentBody(comp), live: comp.examples.length > 0 });
    writeFileSync(join(OUT, 'cards', comp.name + '.html'), card(comp.name, '../'));
  }
  page(ctx, { path: 'patterns/', title: 'Patterns', description: 'Whole screens composed from several components.',
    body: () => `<article class="prose"><h1 class="heading-32">Patterns</h1><p class="lead copy-18">A pattern is a whole screen composed from several components, such as a settings page.</p><p class="copy-16">No patterns yet.</p></article>` });

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
