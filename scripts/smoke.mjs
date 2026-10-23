// Smoke test of the npm entry: loads dist/index.js in headless Chrome the way an app does, through an import map onto
// React 18 and React 19 (ES modules from a CDN, one React instance each), mounts a few components and calls useToasts()
// with no <Toast /> mounted. Fails on an uncaught error, a console.error, a component that didn't render, or no toast.
// Needs dist/ (npm run build) and network access to the CDN.
// Usage: node scripts/smoke.mjs [18|19]   (no argument = both). Exits 1 on any failure.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './site.mjs';
import { openChrome } from './chrome.mjs';

// React version → where its ES modules come from. `?external=react` (and react-dom) leave the bare `react` imports in
// place so the import map resolves them all to one instance, which hooks need. `dev` serves the development builds,
// the only ones that print React's warnings (a missing key, say) to console.error. Moving to a new React is a one-line change.
const REACTS = {
  18: { version: '18.3.1', cdn: 'https://esm.sh' },
  19: { version: '19.3.1', cdn: 'https://esm.sh' },
};
const importMap = ({ version, cdn }) => ({
  imports: {
    'react': `${cdn}/react@${version}?dev`,
    'react/jsx-runtime': `${cdn}/react@${version}/jsx-runtime?dev&external=react`,
    'react-dom': `${cdn}/react-dom@${version}?dev&external=react`,
    'react-dom/client': `${cdn}/react-dom@${version}/client?dev&external=react,react-dom`,
  },
});

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.cache/smoke');
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

// What must be in the DOM for each case once the app has mounted: [name, selector]. Everything is looked up in the
// whole document, because the Modal renders through a portal.
const CASES = [
  ['Button', '[data-case="Button"] .hy-btn'],
  ['Toggle', '[data-case="Toggle"] input[role="switch"]'],
  ['Input', '[data-case="Input"] .hy-input input'],
  ['Modal', '[role="dialog"].hy-modal'],
  ['Table', '[data-case="Table"] table tbody tr'],
];
const TOAST = '.hy-toast';

// The app, as an app would write it: only the package and react-dom/client are imported, never window.React.
const page = (react) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>smoke ${react.version}</title>
<script>
  // Before anything else: every way the page can go wrong lands in window.__smoke.errors.
  window.__smoke = { errors: [], done: false };
  var fmt = function (a) { return a instanceof Error ? a.message : typeof a === 'string' ? a : (function () { try { return JSON.stringify(a); } catch (e) { return String(a); } })(); };
  window.addEventListener('error', function (e) { window.__smoke.errors.push('uncaught error: ' + (e.message || fmt(e.error))); });
  window.addEventListener('unhandledrejection', function (e) { window.__smoke.errors.push('unhandled rejection: ' + fmt(e.reason)); });
  var consoleError = console.error;
  console.error = function () { window.__smoke.errors.push('console.error: ' + [].map.call(arguments, fmt).join(' ').split('\\n')[0]); return consoleError.apply(console, arguments); };
</script>
<script type="importmap">${JSON.stringify(importMap(react))}</script>
<link rel="stylesheet" href="/dist/styles.css">
</head>
<body>
<div id="root"></div>
<script type="module">
  try {
    const React = await import('react');
    const { createRoot } = await import('react-dom/client');
    const { Button, Toggle, Input, Modal, Table, useToasts } = await import('/dist/index.js');
    const h = React.createElement;

    // A case that throws while rendering is caught here, so the failure names it.
    class Case extends React.Component {
      constructor(p) { super(p); this.state = { error: null }; }
      static getDerivedStateFromError(error) { return { error }; }
      componentDidCatch(error) { window.__smoke.errors.push('component ' + this.props.name + ' threw: ' + error.message); }
      render() { return this.state.error ? null : h('div', { 'data-case': this.props.name }, this.props.children); }
    }
    const isCase = (name, node) => h(Case, { name }, node);

    function ToastCase() {
      const toasts = useToasts();
      React.useEffect(() => { toasts.success('Smoke test'); }, []);
      return null;
    }

    function App() {
      return h(React.Fragment, null,
        isCase('Button', h(Button, { variant: 'default' }, 'Deploy Project')),
        isCase('Toggle', h(Toggle, { 'aria-label': 'Auto Deploy', defaultChecked: true })),
        isCase('Input', h(Input, { 'aria-label': 'Project Name', defaultValue: 'hyprsh' })),
        isCase('Modal', h(Modal, { open: true, title: 'Delete Project', description: 'This cannot be undone.', onClose: function () {}, actions: h(Button, null, 'Cancel') })),
        isCase('Table', h(Table, { caption: 'Projects', columns: [{ key: 'name', header: 'Project' }, { key: 'branch', header: 'Branch' }],
          rows: [{ id: 'a', name: 'api', branch: 'main' }, { id: 'b', name: 'web', branch: 'docs' }] })),
        isCase('Toast', h(ToastCase)));
    }

    createRoot(document.getElementById('root')).render(h(App));
  } catch (e) {
    window.__smoke.errors.push('the page failed to load: ' + (e && e.message || e));
  }
  window.__smoke.ready = true;
</script>
</body>
</html>
`;

const wanted = process.argv.slice(2);
const versions = Object.keys(REACTS).filter((v) => !wanted.length || wanted.includes(v));
if (!versions.length || wanted.some((w) => !REACTS[w])) { console.error(`Usage: node scripts/smoke.mjs [${Object.keys(REACTS).join('|')}]`); process.exit(1); }
if (!existsSync(join(ROOT, 'dist/index.js'))) { console.error('No dist/index.js: run npm run build first.'); process.exit(1); }

mkdirSync(OUT, { recursive: true });
for (const v of versions) writeFileSync(join(OUT, `${v}.html`), page(REACTS[v]));

const server = await serve(ROOT, 0);
const base = `http://127.0.0.1:${server.address().port}/`;
const { send, goto, evaluate, close } = await openChrome();
await send('Page.enable');
let failed = 0;

try {
  for (const v of versions) {
    const label = `React ${REACTS[v].version}`;
    await goto(`${base}.cache/smoke/${v}.html`);
    for (let i = 0; i < 100 && !(await evaluate('window.__smoke.ready === true')); i++) await sleep(100);
    // The toast shows a moment after the effect that asked for it: give it up to 3s.
    for (let i = 0; i < 30 && !(await evaluate(`!!document.querySelector('${TOAST}')`)); i++) await sleep(100);
    const r = await evaluate(`({
      ready: window.__smoke.ready === true,
      errors: window.__smoke.errors,
      missing: ${JSON.stringify(CASES)}.filter(function (c) { return !document.querySelector(c[1]); }).map(function (c) { return c[0]; }),
      toast: !!document.querySelector('${TOAST}'),
    })`);
    const problems = [
      ...(r.ready ? [] : ['the page never finished loading']),
      ...r.errors.map((e) => `error: ${e}`),
      ...r.missing.map((c) => `${c}: the component did not render`),
      ...(r.toast ? [] : ['Toast: useToasts().success() rendered no toast, so the toast never rendered']),
    ];
    if (problems.length) { failed++; console.log(`✗ ${label}\n${problems.map((p) => '    ' + p).join('\n')}`); }
    else console.log(`✓ ${label}: ${CASES.map((c) => c[0]).join(', ')} and the fallback toast host`);
  }
} finally {
  await close();
  server.close();
}
console.log(failed ? `✗ ${failed} of ${versions.length} React versions failed` : `✓ dist/index.js works on ${versions.map((v) => 'React ' + REACTS[v].version).join(' and ')}`);
process.exit(failed ? 1 : 0);
