// Local preview of every component card, light and dark, framed the way the artifact frames them.
// Usage: node scripts/dev.mjs [port]  →  http://127.0.0.1:4400
//   /                      all cards, both themes
//   /?only=Button,Toggle   just these
//   /card/<Name>?theme=dark one card on its own (Cover included)
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';
import { compileTokens } from './tokens-css.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = join(ROOT, 'project');
const PORT = +(process.argv[2] || 4400);
const TYPES = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.html': 'text/html', '.md': 'text/markdown', '.txt': 'text/plain' };
const REACT = [
  'https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.development.js',
  'https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.development.js',
];

function card(name, theme) {
  const file = join(PROJECT, 'components', name, 'preview.html');
  if (!existsSync(file)) return null;
  const head = '<link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/project/components/bundle.css">' +
    REACT.map((s) => `<script src="${s}"></script>`).join('') + '<script src="/project/components/bundle.js"></script>' +
    '<script>window.addEventListener("error",function(e){var m=String(e.message);document.documentElement.setAttribute("data-card-error",m);if(parent!==window)parent.postMessage({card:location.pathname,error:m},"*")});</script>';
  return readFileSync(file, 'utf8')
    .replace(/<html([^>]*)>/, `<html$1 data-theme="${theme}">`)
    .replace('</head>', head + '</head>');
}

function index(only) {
  const r = build();
  const names = (only ? only.split(',') : ['Cover', ...r.order]);
  const errs = r.errors.length ? `<pre class="errs">${r.errors.map((e) => '✗ ' + e).join('\n')}</pre>` : '';
  const rows = names.map((n) => {
    const h = n === 'Cover' ? 288 : (r.meta[n]?.height || 200);
    return `<section><h2>${n} <small>${r.meta[n]?.group || ''}</small></h2><div class="pair">` +
      ['light', 'dark'].map((t) => `<iframe src="/card/${n}?theme=${t}" style="height:${h}px" loading="lazy"></iframe>`).join('') + '</div></section>';
  }).join('');
  return `<!doctype html><meta charset="utf-8"><title>hyprsh cards</title><style>
body{margin:0;padding:16px;font:13px system-ui;background:#e5e5e5;color:#111}h2{font-size:13px;margin:16px 0 6px}small{color:#666;font-weight:400}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:8px}iframe{width:100%;border:0;background:#fff;border-radius:6px}
.errs{background:#fee;color:#900;padding:12px;border-radius:6px;white-space:pre-wrap}#log{position:fixed;right:12px;bottom:12px;max-width:40vw;background:#900;color:#fff;padding:8px;border-radius:6px;white-space:pre-wrap;display:none}
</style>${errs}${rows}<pre id="log"></pre><script>
window.cardErrors=[];addEventListener('message',e=>{if(e.data&&e.data.error){cardErrors.push(e.data);const l=document.getElementById('log');l.style.display='block';l.textContent+=e.data.card+': '+e.data.error+'\\n';}});
</script>`;
}

export const handler = (req, res) => {
  const url = new URL(req.url, 'http://x');
  const send = (code, type, body) => { res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' }); res.end(body); };
  try {
    if (url.pathname === '/') return send(200, 'text/html', index(url.searchParams.get('only')));
    if (url.pathname === '/tokens.css') return send(200, 'text/css', compileTokens(JSON.parse(readFileSync(join(PROJECT, 'tokens.json'), 'utf8')), '/project/'));
    if (url.pathname.startsWith('/card/')) {
      const html = card(decodeURIComponent(url.pathname.slice(6)), url.searchParams.get('theme') || 'light');
      return html ? send(200, 'text/html', html) : send(404, 'text/plain', 'no such card');
    }
    const p = normalize(join(ROOT, decodeURIComponent(url.pathname)));
    if (!p.startsWith(ROOT) || !existsSync(p)) return send(404, 'text/plain', 'not found');
    return send(200, TYPES[extname(p)] || 'application/octet-stream', readFileSync(p));
  } catch (e) { return send(500, 'text/plain', String(e.stack || e)); }
};

// Only listen when run directly: scripts/cards.mjs imports the handler.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  createServer(handler).listen(PORT, '127.0.0.1', () => console.log(`hyprsh cards → http://127.0.0.1:${PORT}`));
}
