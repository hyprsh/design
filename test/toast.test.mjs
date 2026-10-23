// Tests for the Toast fallback host (hyprsh/design#29). Run with `npm test` (node --test).
// useToasts() mounts its own <Toast /> when none is mounted. That needs createRoot, which React 19 only exports from
// react-dom/client: the package entry imports it from there, the browser bundle takes it off window.ReactDOM.
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { buildPackage } from '../scripts/package.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const toastSource = join(ROOT, 'project/components/src/Toast.js');

describe('the package entry', () => {
  let js;
  before(() => { buildPackage(); js = readFileSync(join(ROOT, 'dist/index.js'), 'utf8'); });

  it('imports createRoot from react-dom/client, which React 19 needs', () => {
    assert.match(js, /^import \{ createRoot \} from 'react-dom\/client';$/m);
  });

  it('keeps the react-dom namespace for portals', () => {
    assert.match(js, /^import \* as ReactDOM from 'react-dom';$/m);
  });

  it('does not read window.React or window.ReactDOM', () => {
    assert.doesNotMatch(js, /window\.React/);
  });
});

// Runs Toast.js the way the bundle does: as plain script in a scope that holds React, h, HY, define and createRoot.
// `ReactDOM` is React 19's react-dom: it has no createRoot. `hosted` stands in for a mounted <Toast /> host.
function load({ createRoot, env, hosted } = {}) {
  const warnings = [];
  const appended = [];
  const scope = {
    React: { isValidElement: () => false },
    ReactDOM: {},
    h: (type) => ({ type }),
    HY: {},
    define(name, c) { scope.HY[name] = c; },
    document: { body: { appendChild: (el) => appended.push(el) }, createElement: () => ({ setAttribute() {} }) },
    console: { warn: (m) => warnings.push(m) },
    process: env === undefined ? undefined : { env: { NODE_ENV: env } },
    createRoot,
  };
  const context = vm.createContext(scope);
  vm.runInContext(readFileSync(toastSource, 'utf8') + (hosted ? '\ntoastStore.hosts = 1;' : ''), context, { filename: toastSource });
  return { api: scope.HY.useToasts(), HY: scope.HY, warnings, appended };
}

describe('useToasts() with no <Toast /> mounted', () => {
  it('renders a host with the createRoot it was given, not the one on ReactDOM', () => {
    const rendered = [];
    const { api, HY, appended, warnings } = load({ createRoot: (el) => ({ render: (node) => rendered.push(node) }) });
    api.success('Domain added');
    assert.equal(rendered.length, 1);
    assert.equal(rendered[0].type, HY.Toast);
    assert.equal(appended.length, 1);
    assert.deepEqual(warnings, []);
  });

  it('mounts the host once, however many toasts follow', () => {
    let calls = 0;
    const { api } = load({ createRoot: () => ({ render: () => { calls++; } }) });
    api.success('One');
    api.error('Two');
    assert.equal(calls, 1);
  });

  it('mounts nothing when a <Toast /> host is already mounted', () => {
    let calls = 0;
    const { api, warnings } = load({ hosted: true, createRoot: () => ({ render: () => { calls++; } }) });
    api.success('Hosted');
    assert.equal(calls, 0);
    assert.deepEqual(warnings, []);
  });
});

describe('when no host can be mounted', () => {
  it('warns once, naming the fix', () => {
    const { api, warnings } = load();
    api.success('One');
    api.success('Two');
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /<Toast \/>/);
  });

  it('stays quiet in production', () => {
    const { api, warnings } = load({ env: 'production' });
    api.success('One');
    assert.deepEqual(warnings, []);
  });
});
