// Tests that TitleBar's title stays on the bar's centre line (hyprsh/design#85), measured in headless Chrome: layout
// needs the built bundle and real CSS. Needs network access for React (a CDN) and Chrome (see scripts/chrome.mjs);
// without Chrome the suite is skipped, or fails when CI is set.
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { build } from '../scripts/build.mjs';
import { handler } from '../scripts/dev.mjs';
import { openChrome, CHROME } from '../scripts/chrome.mjs';

const PAGE = `<!doctype html><html lang="en" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/project/components/bundle.css">
<script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.development.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="/project/components/bundle.js"></script></head><body style="margin:0">
<div id="root"></div><script>
var H = window.Hyprsh, h = React.createElement;
var root = ReactDOM.createRoot(document.getElementById('root'));
function icon(label) { return h(H.Button, { svgOnly: true, variant: 'tertiary', 'aria-label': label }, h(H.Icon, { name: 'share', size: 16 })); }
function show(props) {
  props = Object.assign({ hideFrom: false }, props);
  if (props.withActions === 1) props.actions = icon('Share');
  if (props.withActions === 2) props.actions = h(React.Fragment, null, icon('Share'), icon('More'), icon('Edit'));
  if (props.withBack) props.back = { label: 'Back' };
  root.render(h(H.TitleBar, props));
}
</script></body></html>`;

const LONG = 'Preview deployment for feat/title-bar in the docs site with a very long name, '.repeat(3);
const SHORT = 'Domains';
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

let server, chrome, port;
const canRun = existsSync(CHROME);
const skipNoChrome = !canRun && !process.env.CI && 'Chrome not found';
describe('Chrome', () => {
  it('is installed when CI is set', { skip: !process.env.CI && 'only enforced in CI' }, () => {
    assert.ok(canRun, 'Chrome not found at ' + CHROME + ': the Chrome-driven tests cannot run');
  });
});
before(async () => {
  if (!canRun) return;
  build();
  server = createServer((req, res) => {
    if (req.url.startsWith('/__t')) { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(PAGE); }
    return handler(req, res);
  });
  await new Promise((res) => server.listen(0, '127.0.0.1', res));
  port = server.address().port;
  chrome = await openChrome();
  await chrome.emulate({ width: 375, height: 700, scale: 1 });
  await chrome.goto(`http://127.0.0.1:${port}/__t`);
});
after(async () => {
  if (chrome) await chrome.close();
  if (server) server.close();
});

/* The title box's centre minus the bar's centre, in px, the gaps either side of the title, and whether it is truncated. */
async function measure(props) {
  await chrome.evaluate(`show(${JSON.stringify(props)})`);
  for (let i = 0; i < 40; i++) { if (await chrome.evaluate(`!!document.querySelector('.hy-titlebar__title')`)) break; await sleep(50); }
  return chrome.evaluate(`(function () {
    var t = document.querySelector('.hy-titlebar__title'), b = document.querySelector('.hy-titlebar__bar');
    var tr = t.getBoundingClientRect(), br = b.getBoundingClientRect();
    return { offset: (tr.left + tr.right) / 2 - (br.left + br.right) / 2, truncated: t.scrollWidth > t.clientWidth, left: tr.left - br.left, right: br.right - tr.right };
  })()`);
}

const cases = [
  ['only a back button', { withBack: true }],
  ['only actions', { withActions: 1 }],
  ['several actions and nothing else', { withActions: 2 }],
  ['a back button and actions', { withBack: true, withActions: 2 }],
  ['nothing on either side', {}],
];
/* 375px is a phone (touch sizing); 800px has a mouse's smaller control sizes, where only the touch-target floor keeps them equal. */
for (const width of [375, 800]) describe(`TitleBar centring at ${width}px`, { skip: skipNoChrome }, () => {
  before(async () => {
    if (!chrome) return;
    await chrome.emulate({ width, height: 700, scale: 1 });
    await chrome.goto(`http://127.0.0.1:${port}/__t`);
  });
  for (const [name, props] of cases) {
    it(`centres a short title with ${name}`, async () => {
      const m = await measure({ ...props, title: SHORT });
      assert.ok(Math.abs(m.offset) < 0.5, `off centre by ${m.offset}px`);
    });
    it(`centres and truncates a long title with ${name}`, async () => {
      const m = await measure({ ...props, title: LONG });
      assert.ok(m.truncated, 'the long title is truncated');
      assert.ok(Math.abs(m.offset) < 0.5, `off centre by ${m.offset}px`);
      assert.ok(Math.abs(m.left - m.right) < 0.5, `unequal gaps ${m.left} and ${m.right}`);
    });
  }
});
