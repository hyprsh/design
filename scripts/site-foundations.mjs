// The Foundations pages of the docs site: the overview, each brand-book page with its specimens, Tokens, and the
// redirect left where a page used to be. The rules stay in project/README.md; the specimens here are keyed to its
// headings and rendered at build time as static HTML from tokens.json, the brand SVGs and the library's classes.
// Usage (scripts/site.mjs): foundationsIndex(docs, foundations), foundationBody(f, prose), tokensBody(tokens),
//   writeRedirects(dir), FOUNDATION_NOTES
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inline, esc, sections } from './md.mjs';
import { SITE_URL } from './docs.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(p, 'utf8');
const TOKENS = JSON.parse(read(join(ROOT, 'project/tokens.json')));
const ICONS = new Function(read(join(ROOT, 'project/components/src/_icons.js')) + '\nreturn ICONS;')();
const MARK_PATH = 'M12 1.5 L22.5 20 L15 16.5 L12 22 L9 16.5 L1.5 20 Z M12 7 L10.7 12.5 L12 14.5 L13.3 12.5 Z';

// A Lucide icon as the Icon component draws it: the stroke scales so it stays 1.5px at any size.
const lucide = (name, size = 16, cls = '') => {
  if (!ICONS[name]) throw new Error(`site-foundations: no Lucide icon named ${name}`);
  return `<svg class="fd-ico${cls ? ' ' + cls : ''}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${+(1.5 * 24 / size).toFixed(3)}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
};
const mark = (size, fill = 'var(--accent-700)', extra = '') => `<svg class="fd-mark" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"${extra}><path d="${MARK_PATH}" fill="${fill}"/></svg>`;
// The Logo component's markup (src/Logo.js), static.
const logo = ({ variant = 'lockup', size = 24, mono = false, label = 'hyprsh', wordStyle = '' }) => `<span class="hy-logo hy-logo--${variant}${mono ? ' hy-logo--mono' : ''}" role="img" aria-label="${esc(label)}" style="--hy-logo-size:${size}px">` +
  (variant === 'wordmark' ? '' : `<svg class="hy-logo__mark" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" focusable="false"><path d="${MARK_PATH}" fill="${mono ? 'currentColor' : 'var(--accent-700)'}"/></svg>`) +
  (variant === 'mark' ? '' : `<span class="hy-logo__word" aria-hidden="true"${wordStyle ? ` style="${wordStyle}"` : ''}>hyprsh</span>`) + '</span>';
// Badge (src/Badge.js), static.
const badge = (variant, text, iconName) => `<span class="hy-badge hy-badge--${variant} hy-badge--small">${iconName ? `<span class="hy-badge__icon" aria-hidden="true">${lucide(iconName, 12)}</span>` : ''}${text}</span>`;
const code = (s) => `<code>${esc(s)}</code>`;

// page() writes each Foundations page's header (eyebrow, h1, lead); these give it the title and lead.
export const TOKENS_LEAD = 'Every token is a CSS custom property and every type style a class. Use them by name. Swatches and values follow the theme control; select a name to copy it.';
export function foundationHead(f) { const { title, lead } = splitPage(f.markdown); return { heading: title, lead }; }

// The one-line descriptions on the overview and in each page's meta description.
export const FOUNDATION_NOTES = {
  'foundations/content-fundamentals': 'How hyprsh copy reads: active voice, Title Case labels, errors that give the fix and careful typography.',
  'foundations/visual-foundations': 'Colour, type, space, materials, states, motion and layering, each shown next to its rules.',
  'foundations/iconography': 'Lucide icons on a 16px grid with a constant 1.5px stroke, and how to size and label them.',
  'foundations/logo': 'The delta starship mark and the lockup: colour, clear space, sizes, misuse and the SVG files.',
  'foundations/tokens': 'Every colour, space, radius, shadow, z-index and type token by name, in the current theme, ready to copy.',
};

// ---------- Overview ----------

const scaleStrip = (hue, steps = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]) =>
  `<span class="fd-thumb-strip">${steps.map((s) => `<span style="background:var(--${hue}-${s})"></span>`).join('')}</span>`;

const THUMBS = {
  'content-fundamentals': () => `<span class="fd-thumb-copy">
<span class="label-14">${lucide('check', 16, 'fd-ok')}“Install the CLI”</span>
<span class="label-14 muted">${lucide('x', 16, 'fd-no')}<s>“The CLI will be installed”</s></span>
</span>`,
  'visual-foundations': () => `<span class="fd-thumb-visual"><span class="heading-48">Aa</span>${scaleStrip('gray')}</span>`,
  iconography: () => `<span class="fd-thumb-icons">${['git-branch', 'rocket', 'globe', 'terminal', 'lock', 'bell'].map((n) => lucide(n, 24)).join('')}</span>`,
  logo: () => mark(48),
  tokens: () => `<span class="fd-thumb-token"><span class="fd-thumb-chip" style="background:var(--gray-1000)"></span><code class="label-13-mono">var(--gray-1000)</code></span>`,
};

export function foundationsIndex(docs, foundations) {
  return () => `<article class="prose fd-page">
<ul class="fd-cards">${foundations.map((f) => {
    const key = f.path.slice(12);
    return `<li><a class="fd-card" href="${key}/"><span class="fd-thumb" aria-hidden="true">${THUMBS[key] ? THUMBS[key]() : ''}</span><span class="fd-card-text"><span class="heading-16">${esc(f.title)}</span><span class="copy-14 muted">${inline(FOUNDATION_NOTES[f.path] || f.note)}</span></span></a></li>`;
  }).join('\n')}</ul>
</article>`;
}

// ---------- Brand-book pages ----------

// "# Title", then the first paragraph as the lead (unless the page opens with a list or a table), then the rest.
function splitPage(src) {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const title = lines[0].replace(/^#\s+/, '').trim();
  const body = lines.slice(1).join('\n').trim();
  const [first, ...more] = body.split(/\n\s*\n/);
  if (first && !/^([-*+|#]|\d+[.)]|```)/.test(first.trim())) return { title, lead: first.replace(/\s*\n\s*/g, ' '), rest: more.join('\n\n') };
  return { title, lead: '', rest: body };
}

// Puts a specimen into a section's HTML: 'top' just under its heading, 'end' after its text, 'table' in place of
// its first table (the markdown keeps the table for agents; the site shows the specimen instead).
function place(html, at, specimen) {
  if (at === 'table') return html.replace(/<div class="table-wrap">[\s\S]*?<\/table><\/div>/, specimen);
  if (at === 'top') {
    const m = /^\s*<h2[^>]*>[\s\S]*?<\/h2>/.exec(html);
    return m ? html.slice(0, m[0].length) + '\n' + specimen + html.slice(m[0].length) : specimen + '\n' + html;
  }
  return html + specimen + '\n';
}

// prose(markdown, rel) renders markdown the way the site does, with links rewritten.
export function foundationBody(f, prose) {
  const key = f.path.slice(12);
  const specs = SPECIMENS[key] || {};
  return (c) => {
    const { rest } = splitPage(f.markdown);
    const html = sections(rest, 2).map((s) => {
      let out = s.body.trim() ? prose(s.body, c.rel) : '';
      const sp = specs[s.title === null ? '' : s.slug];
      if (sp) out = place(out, sp.at, sp.html(c, s.body));
      return out;
    }).join('\n');
    return `<article class="prose fd-page">
${html}
</article>`;
  };
}

// ---------- Specimens ----------

const STEPS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
const JOBS = [['Backgrounds', 3], ['Borders', 3], ['Fills', 2], ['Text', 2]];
const HUES = [['gray', 'gray'], ['gray-alpha', 'gray-alpha'], ['accent', 'accent · blue'], ['red', 'red'], ['amber', 'amber'], ['green', 'green'], ['teal', 'teal'], ['purple', 'purple'], ['pink', 'pink']];

function colourSpecimen() {
  const row = ([hue, name]) => `<div class="fd-scale-row"><span class="fd-scale-name label-13-mono">${esc(name)}</span>` +
    `<span class="fd-scale-cells" role="img" aria-label="${esc(hue)}, steps 100 to 1000">${STEPS.map((s) => `<span style="background:var(--${hue}-${s})"></span>`).join('')}</span></div>`;
  return `<figure class="fd-figure">
<div class="fd-bgs">${[['background-100', 'The page and every surface on it'], ['background-200', 'One region set apart']].map(([n, u]) => `<div class="fd-bg"><span class="fd-bg-chip" style="background:var(--${n})"></span><span class="label-13-mono">${n}</span><span class="copy-13 muted">${u}</span></div>`).join('')}</div>
<div class="fd-scale">
<div class="fd-scale-row fd-scale-head" aria-hidden="true"><span class="fd-scale-name"></span><span class="fd-scale-cells">${STEPS.map((s) => `<span class="label-12-mono">${s}</span>`).join('')}</span></div>
${HUES.map(row).join('\n')}
<div class="fd-scale-row fd-scale-legend"><span class="fd-scale-name"></span><span class="fd-scale-cells">${JOBS.map(([j, n]) => `<span class="label-12" style="grid-column:span ${n}">${j}</span>`).join('')}</span></div>
</div>
<figcaption class="copy-13 muted">Every scale, steps 100–1000, in the current theme. A step’s job is the same in every hue.</figcaption>
</figure>`;
}

const MARKETING = new Set(['heading-72', 'heading-64', 'heading-56']);
function typeSpecimen() {
  const groups = TOKENS.type.groups.filter((g) => ['Headings', 'Labels', 'Copy'].includes(g.name));
  const row = (s) => `<li class="fd-ramp-row"><span class="fd-ramp-meta"><code class="label-12-mono">${esc(s.name)}</code><span class="label-12-mono muted">${esc(`${parseInt(s.fontSize)}/${parseInt(s.lineHeight)}`)}</span></span><span class="fd-ramp-sample ${s.name}">${esc(s.sample || s.name)}</span></li>`;
  return `<figure class="fd-figure fd-ramp">
${groups.map((g) => `<p class="fd-ramp-group label-12 muted">${esc(g.name)}</p>
<ul>${g.styles.filter((s) => !MARKETING.has(s.name)).map(row).join('')}${g.name === 'Labels' ? `<li class="fd-ramp-row"><span class="fd-ramp-meta"><code class="label-12-mono">label-14</code><span class="label-12-mono muted">+ strong</span></span><span class="fd-ramp-sample label-14"><strong>Some Show</strong> · S02E05</span></li>` : ''}</ul>`).join('\n')}
<figcaption class="copy-13 muted">Each style in its own class, with its size and line height in px. The marketing sizes, <code>heading-72</code>, <code>64</code> and <code>56</code>, are on the Tokens page.</figcaption>
</figure>`;
}

function spaceSpecimen() {
  const note = { 'space-3': 'Half gap', 'space-6': 'Default gap' };
  return `<figure class="fd-figure"><ul class="fd-space">${TOKENS.spacing.tokens.map((t) => `<li><code class="label-13-mono">${t.name}</code><span class="label-12-mono muted">${esc(t.value)}</span><span class="fd-space-bar" style="width:var(--${t.name})"></span>${note[t.name] ? badge('gray-subtle', note[t.name]) : ''}</li>`).join('')}</ul>
<figcaption class="copy-13 muted">The 4px grid. Every gap, padding and margin is one of these.</figcaption></figure>`;
}

// The materials table of the section, as samples: each one a real background-100 surface with its shadow and radius.
function materialsSpecimen(c, src) {
  const rows = src.split('\n').filter((l) => /^\|/.test(l.trim())).slice(2)
    .map((l) => l.trim().replace(/^\||\|$/g, '').split('|').map((x) => x.trim()));
  const items = rows.flatMap(([name, shadow, radius, use]) => {
    const names = name.split('/').map((s) => s.trim());
    const shadows = [...shadow.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
    const r = (/`([^`]+)`/.exec(radius) || [])[1];
    return shadows.map((s, i) => ({ name: names[i] || names[0], shadow: s, radius: r, use }));
  });
  return `<div class="fd-stage"><ul class="fd-materials">${items.map((m) => `<li class="fd-material" style="box-shadow:var(--${m.shadow});border-radius:var(--${m.radius})"><span class="label-14"><strong>${esc(m.name)}</strong></span><span class="copy-13 muted">${inline(m.use)}</span><span class="fd-material-tokens"><code class="label-12-mono">${m.shadow}</code><code class="label-12-mono">${m.radius}</code></span></li>`).join('')}</ul></div>`;
}

function statesSpecimen() {
  const states = [
    ['Rest', 'fd-st-rest', 'gray-100 · alpha-400'],
    ['Hover', 'fd-st-hover', 'gray-200 · alpha-500'],
    ['Pressed', 'fd-st-pressed', 'gray-300 · alpha-600'],
    ['Focus', 'fd-st-focus', 'focus-color ring'],
    ['Disabled', 'fd-st-disabled', 'gray-100 · gray-700'],
  ];
  return `<figure class="fd-figure"><ul class="fd-states">${states.map(([n, cls, t]) => `<li><span class="fd-state ${cls} label-14" aria-hidden="true">Deploy</span><span class="label-13">${n}</span><span class="label-12-mono muted">${t}</span></li>`).join('')}</ul>
<figcaption class="copy-13 muted">One control through its states: each step raises contrast by one.</figcaption></figure>`;
}

function motionSpecimen() {
  const durations = [['Hover and colour', 150], ['Overlay entering', 200], ['Overlay leaving', 150]];
  const curve = (x1, y1, x2, y2) => `<svg class="fd-curve" viewBox="-4 -4 108 108" width="96" height="96" aria-hidden="true" focusable="false"><path class="fd-curve-ref" d="M0 100 L100 0"/><path class="fd-curve-handle" d="M0 100 L${x1 * 100} ${100 - y1 * 100} M100 0 L${x2 * 100} ${100 - y2 * 100}"/><path class="fd-curve-line" d="M0 100 C${x1 * 100} ${100 - y1 * 100} ${x2 * 100} ${100 - y2 * 100} 100 0"/></svg>`;
  const eases = [['UI', '.4, 0, .2, 1', [0.4, 0, 0.2, 1]], ['Sheets and drawers', '.32, .72, 0, 1', [0.32, 0.72, 0, 1]]];
  return `<figure class="fd-figure fd-motion">
<ul class="fd-durations">${durations.map(([n, ms]) => `<li><span class="label-13">${n}</span><span class="fd-duration"><span class="fd-duration-bar" style="width:calc((100% - 64px) * ${ms / 200})"></span><span class="label-12-mono muted">${ms}ms</span></span></li>`).join('')}</ul>
<ul class="fd-eases">${eases.map(([n, v, p]) => `<li>${curve(...p)}<span class="label-13">${n}</span><code class="label-12-mono muted">cubic-bezier(${v})</code></li>`).join('')}</ul>
<figcaption class="copy-13 muted">Durations to scale, and the two easing curves.</figcaption>
</figure>`;
}

function layeringSpecimen() {
  const layers = [{ name: 'page content', value: '≤ 10' }, ...TOKENS.zIndex.tokens.map((t) => ({ name: t.name, value: t.value }))];
  return `<figure class="fd-figure"><ol class="fd-stack" style="--n:${layers.length}">${layers.map((l, i) => `<li style="--i:${i}"><code class="label-13-mono">${esc(l.name)}</code><span class="label-12-mono muted">${esc(l.value)}</span></li>`).join('')}</ol>
<figcaption class="copy-13 muted">From the page up: each layer sits above the ones before it.</figcaption></figure>`;
}

function imagerySpecimen() {
  return `<figure class="fd-figure"><div class="fd-stage"><div class="fd-frame" role="img" aria-label="A placeholder screenshot in a shadow-border frame with radius-xl"><span class="fd-frame-bar"><span></span><span></span><span></span></span><span class="fd-frame-body"><span class="fd-frame-line" style="width:40%"></span><span class="fd-frame-line" style="width:72%"></span><span class="fd-frame-line" style="width:56%"></span></span></div></div>
<figcaption class="copy-13 muted">A screenshot frame: <code>shadow-border</code> and <code>radius-xl</code>.</figcaption></figure>`;
}

const PAIRS = [
  ['Active voice', 'Install the CLI', 'The CLI will be installed'],
  ['Labels name the result', 'Save API Key', 'Continue'],
  ['Title Case for buttons', 'Add Domain', 'Add domain'],
  ['Errors give the fix', 'Domain is already in use. Remove it from the other project or use a subdomain.', 'Invalid domain'],
  ['One ellipsis character', 'Deploying…', 'Deploying...'],
  ['Calm, without exclamation', 'Your project is live.', 'Awesome! Your project is live!'],
];
function pairsSpecimen() {
  return `<h2 id="do-and-dont" class="heading-24">Do and don’t</h2>
<ul class="fd-pairs">${PAIRS.map(([topic, yes, no]) => `<li class="fd-pair"><p class="label-13 muted">${esc(topic)}</p><div class="fd-pair-cards">
<div class="fd-pair-card">${badge('green-subtle', 'Do', 'check')}<p class="copy-16">${esc(yes)}</p></div>
<div class="fd-pair-card">${badge('red-subtle', 'Don’t', 'x')}<p class="copy-16">${esc(no)}</p></div>
</div></li>`).join('')}</ul>`;
}

const ICON_SET = ['git-branch', 'rocket', 'globe', 'server', 'terminal', 'database', 'lock', 'users', 'bell', 'settings', 'search', 'copy'];
function iconSpecimen() {
  return `<figure class="fd-figure"><ul class="fd-icons">${ICON_SET.map((n) => `<li><span class="fd-icon-sizes">${[16, 20, 24].map((s) => lucide(n, s)).join('')}</span><code class="label-12-mono muted">${n}</code></li>`).join('')}</ul>
<figcaption class="copy-13 muted">Each icon at 16, 20 and 24px, with the same 1.5px stroke.</figcaption></figure>`;
}

function logoTiles() {
  const tiles = [
    ['Mark', 'logo-mark.svg', (th) => logo({ variant: 'mark', size: 40, label: `hyprsh mark on ${th}` })],
    ['Mono Mark', 'logo-mark-mono.svg', (th) => logo({ variant: 'mark', size: 40, mono: true, label: `hyprsh mono mark on ${th}` })],
    ['Lockup', 'logo-lockup.svg', (th) => logo({ size: 28, label: `hyprsh lockup on ${th}` })],
  ];
  return `<ul class="fd-logos">${tiles.map(([n, file, draw]) => `<li><div class="fd-logo-pair">${['light', 'dark'].map((th) => `<div class="fd-logo-surface" data-theme="${th}">${draw(th)}</div>`).join('')}</div><span class="label-14"><strong>${n}</strong></span><code class="label-12-mono muted">${file}</code></li>`).join('')}</ul>`;
}

function clearSpaceSpecimen() {
  return `<div class="fd-stage fd-logo-space">
<figure class="fd-clear"><div class="fd-clear-zone"><span class="fd-clear-dim fd-clear-dim--top label-12-mono">½h</span><span class="fd-clear-dim fd-clear-dim--left label-12-mono">½h</span><span class="fd-clear-mark">${mark(64)}</span></div><figcaption class="copy-13 muted">Clear space: half the mark’s height on every side.</figcaption></figure>
<figure class="fd-sizes"><ul>${[32, 24, 20, 16].map((s) => `<li>${mark(s)}<span class="label-12-mono muted">${s}${s === 16 ? ' min' : ''}</span></li>`).join('')}</ul><figcaption class="copy-13 muted">20–24px in the app bar; never below 16px.</figcaption></figure>
</div>`;
}

function misuseSpecimen() {
  const items = [
    ['Stretch', mark(40, 'var(--accent-700)', ' style="transform:scaleX(1.6)"')],
    ['Rotate', mark(40, 'var(--accent-700)', ' style="transform:rotate(-24deg)"')],
    ['Outline', `<svg class="fd-mark" width="40" height="40" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${MARK_PATH}" fill="none" stroke="var(--accent-700)" stroke-width="1" stroke-linejoin="round"/></svg>`],
    ['Shadow', mark(40, 'var(--accent-700)', ' style="filter:drop-shadow(0 4px 4px var(--gray-alpha-700))"')],
    ['Recolour', mark(40, 'var(--purple-700)')],
    ['Retype', logo({ size: 24, label: 'hyprsh lockup in another typeface', wordStyle: 'font-family:var(--font-mono)' })],
  ];
  return `<ul class="fd-misuse">${items.map(([n, art]) => `<li><span class="fd-misuse-art" aria-hidden="true">${art}</span><span class="fd-misuse-label label-13">${lucide('x', 16)}Don’t ${n.toLowerCase()}</span></li>`).join('')}</ul>`;
}

function filesSpecimen(c) {
  const files = [['Download Mark', 'logo-mark.svg'], ['Download Mono Mark', 'logo-mark-mono.svg'], ['Download Lockup', 'logo-lockup.svg']];
  return `<div class="fd-downloads">${files.map(([label, file]) => `<a class="hy-btn hy-btn--secondary hy-btn--medium" href="${c.rel}brand/${file}" download><span class="hy-btn__affix" aria-hidden="true">${lucide('download', 16)}</span><span class="hy-btn__label">${label}</span></a>`).join('')}</div>`;
}

// page key → { section slug ('' for the text before the first ##): { at, html(c, sectionMarkdown) } }
const SPECIMENS = {
  'content-fundamentals': { '': { at: 'end', html: pairsSpecimen } },
  'visual-foundations': {
    colour: { at: 'top', html: colourSpecimen },
    type: { at: 'top', html: typeSpecimen },
    'space-and-layout': { at: 'top', html: spaceSpecimen },
    'materials-radius-and-shadow': { at: 'table', html: materialsSpecimen },
    'states-and-focus': { at: 'top', html: statesSpecimen },
    motion: { at: 'top', html: motionSpecimen },
    layering: { at: 'end', html: layeringSpecimen },
    imagery: { at: 'top', html: imagerySpecimen },
  },
  iconography: { '': { at: 'top', html: iconSpecimen } },
  logo: {
    '': { at: 'top', html: logoTiles },
    'clear-space-and-size': { at: 'end', html: clearSpaceSpecimen },
    misuse: { at: 'end', html: misuseSpecimen },
    files: { at: 'end', html: filesSpecimen },
  },
};

// ---------- Tokens ----------

// A value that differs per theme shows the current theme's only; CSS picks it from <html data-theme>.
function themed(v, themes) {
  if (!v || typeof v !== 'object') return `<span class="fd-val">${esc(String(v))}</span>`;
  return themes.map((th) => `<span class="fd-val fd-val--${th}">${esc(v[th])}</span>`).join('');
}
// The token name as a button that copies var(--name) (or .class for a type style). Its label says what it copies.
const copyName = (name, text = `var(--${name})`, cls = 'label-13-mono') =>
  `<button type="button" class="fd-copy ${cls}" data-copy="${esc(text)}"><span class="hy-sr">Copy </span><code>${esc(name)}</code><span class="fd-copy-icon" aria-hidden="true">${lucide('copy', 14)}${lucide('check', 14, 'fd-copied-icon')}</span></button>`;

const COPY_SCRIPT = `<p class="hy-sr" aria-live="polite" id="fd-copy-status"></p>
<script>(function(){var st=document.getElementById('fd-copy-status');document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-copy]');if(!b||!navigator.clipboard)return;var t=b.getAttribute('data-copy');navigator.clipboard.writeText(t).then(function(){b.classList.add('is-copied');st.textContent='Copied '+t;setTimeout(function(){b.classList.remove('is-copied')},1500)},function(){st.textContent='Copy failed'})})})();</script>`;

export function tokensBody(t) {
  const themes = t.color.themes.map((x) => x.id);
  const scales = new Map(), single = [];
  for (const c of t.color.tokens) {
    const m = /^(.+)-(\d+)$/.exec(c.name);
    if (m) (scales.get(m[1]) || scales.set(m[1], []).get(m[1])).push(c);
    else single.push(c);
  }
  const swatch = (c, use = false) => `<li class="fd-swatch"${c.usage && !use ? ` title="${esc(c.usage)}"` : ''}><span class="fd-swatch-chip" style="background:var(--${c.name})"></span>${copyName(c.name, undefined, "label-12-mono")}<span class="label-12-mono muted">${themed(c.value, themes)}</span>${use && c.usage ? `<span class="copy-13 muted">${inline(c.usage)}</span>` : ''}</li>`;
  const row = (c, sample, name = copyName(c.name)) => `<tr><td>${sample}</td><td>${name}</td><td><code class="type">${themed(typeof c.value === 'number' ? c.value + 'px' : c.value, themes)}</code></td><td>${c.usage ? inline(c.usage) : ''}</td></tr>`;
  const table = (rows) => `<div class="table-wrap"><table class="props tokens copy-14"><thead><tr><th><span class="hy-sr">Sample</span></th><th>Token</th><th>Value</th><th>Usage</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  return () => `<article class="prose wide fd-page">
<h2 id="colour" class="heading-24">Colour</h2>
${[...scales].map(([name, list]) => `<h3 id="colour-${name}" class="heading-16">${name}</h3>
<ul class="fd-swatches">${list.map((c) => swatch(c)).join('')}</ul>`).join('\n')}
<h3 id="colour-other" class="heading-16">Other colours</h3>
<ul class="fd-swatches fd-swatches--wide">${single.map((c) => swatch(c, true)).join('')}</ul>
<h2 id="space" class="heading-24">Space</h2>
${table(t.spacing.tokens.map((c) => row(c, `<span class="bar" style="width:var(--${c.name})"></span>`)))}
<h2 id="radius" class="heading-24">Radius</h2>
${table(t.radius.tokens.map((c) => row(c, `<span class="box" style="border-radius:var(--${c.name})"></span>`)))}
<h2 id="shadow" class="heading-24">Shadow</h2>
${table(t.shadow.tokens.map((c) => row(c, `<span class="box shadow" style="box-shadow:var(--${c.name})"></span>`)))}
<h2 id="type" class="heading-24">Type styles</h2>
<p class="copy-16">Classes such as <code>.heading-32</code> and <code>.label-14</code>. The Labels and Copy styles also come as <code>-strong</code>.</p>
${t.type.groups.map((g) => `<h3 id="type-${g.name.toLowerCase()}" class="heading-16">${g.name}</h3>
<ul class="type-list">${g.styles.map((s) => `<li><div class="${s.name} type-sample">${esc(s.sample || s.name)}</div><p class="copy-13 muted">${copyName(s.name, '.' + s.name, 'label-12-mono')} ${esc(`${s.fontSize} / ${s.lineHeight}, ${s.fontWeight}`)}${s.usage ? ' · ' + inline(s.usage) : ''}</p></li>`).join('')}</ul>`).join('\n')}
<h2 id="other" class="heading-24">Size, breakpoint and z-index</h2>
${table([...t.size.tokens, ...t.breakpoint.tokens, ...t.zIndex.tokens].map((c) => row(c, '')))}
${COPY_SCRIPT}
</article>`;
}

// ---------- Redirects ----------

// Pages that moved: their old folder gets a page that sends the reader on, so old links keep working.
const REDIRECTS = [['foundations/using-this-system/', '', 'Getting started']];

export function writeRedirects(dir) {
  for (const [from, to, title] of REDIRECTS) {
    const rel = '../'.repeat(from.split('/').filter(Boolean).length) + to;
    const file = join(dir, from, 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · hyprsh design</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${SITE_URL}${to}">
<meta http-equiv="refresh" content="0; url=${rel || './'}">
<link rel="stylesheet" href="${'../'.repeat(from.split('/').filter(Boolean).length)}tokens.css">
</head>
<body class="copy-16" style="margin:0;padding:var(--space-10) var(--space-4);background:var(--background-100);color:var(--gray-1000)">
<p>This page moved to <a href="${rel || './'}" style="color:var(--link)">${esc(title)}</a>.</p>
</body>
</html>
`);
  }
  return REDIRECTS.map(([from]) => from);
}
