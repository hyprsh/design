// Tests for SettingRow (hyprsh/design#88). SettingRow.js is plain script that runs in the bundle's scope,
// so it runs here in a vm context with stubs; the vnode tree it returns is inspected directly.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const src = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src');
const registry = {};
const context = vm.createContext({
  React: {
    isValidElement: (e) => !!e && typeof e === 'object' && 'props' in e,
    cloneElement: (e, p) => ({ ...e, props: { ...e.props, ...p } }),
  },
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity) }),
  cx: (...a) => a.filter(Boolean).join(' '),
  useId: () => 'r1',
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(join(src, 'SettingRow.js'), 'utf8'), context, { filename: 'SettingRow.js' });

const control = (props) => ({ type: 'input', props: props || {}, children: [] });
const row = (props, child) => registry.SettingRow({ label: 'Project Name', children: child || control(), ...props });
const find = (node, pred) => {
  if (!node || typeof node !== 'object') return null;
  if (pred(node)) return node;
  for (const c of node.children || []) { const f = find(c, pred); if (f) return f; }
  return null;
};
const byClass = (node, cls) => find(node, (n) => (n.props.className || '').split(' ').includes(cls));
const ids = (v) => (v || '').split(' ').filter(Boolean);
const css = readFileSync(join(src, 'SettingRow.css'), 'utf8');

describe('SettingRow labelling', () => {
  it('renders a label whose for matches the control id', () => {
    const r = row();
    const label = find(r, (n) => n.type === 'label');
    const input = find(r, (n) => n.type === 'input');
    assert.ok(input.props.id);
    assert.equal(label.props.htmlFor, input.props.id);
    assert.deepEqual(label.children, ['Project Name']);
  });
  it('keeps the control id when it has one', () => {
    const r = row({}, control({ id: 'mine' }));
    assert.equal(find(r, (n) => n.type === 'input').props.id, 'mine');
    assert.equal(find(r, (n) => n.type === 'label').props.htmlFor, 'mine');
  });
  it('points the control description at the help', () => {
    const r = row({ help: 'Shown in the dashboard.' });
    const input = find(r, (n) => n.type === 'input');
    const help = byClass(r, 'hy-setting-row__help');
    assert.ok(help.props.id);
    assert.deepEqual(help.children, ['Shown in the dashboard.']);
    assert.deepEqual(ids(input.props['aria-describedby']), [help.props.id]);
  });
  it('merges the help id into an existing aria-describedby', () => {
    const r = row({ help: 'Help' }, control({ 'aria-describedby': 'other' }));
    const input = find(r, (n) => n.type === 'input');
    const help = byClass(r, 'hy-setting-row__help');
    assert.deepEqual(ids(input.props['aria-describedby']), ['other', help.props.id]);
  });
  it('leaves aria-describedby off without help or a change', () => {
    const input = find(row(), (n) => n.type === 'input');
    assert.equal(input.props['aria-describedby'], undefined);
    assert.equal(byClass(row(), 'hy-setting-row__help'), null);
  });
});

describe('SettingRow naming a group control', () => {
  const sw = (props) => ({ type: 'Switch', props: props || {}, children: [] });
  it('gives the label an id and points aria-labelledby at it', () => {
    const r = row({ help: 'Help' }, sw());
    const label = find(r, (n) => n.type === 'label');
    const s = find(r, (n) => n.type === 'Switch');
    assert.ok(label.props.id);
    assert.equal(s.props['aria-labelledby'], label.props.id);
    assert.equal(label.props.htmlFor, s.props.id);
    assert.deepEqual(ids(s.props['aria-describedby']), [byClass(r, 'hy-setting-row__help').props.id]);
  });
  it('keeps an existing aria-labelledby or aria-label', () => {
    assert.equal(find(row({}, sw({ 'aria-labelledby': 'x' })), (n) => n.type === 'Switch').props['aria-labelledby'], 'x');
    assert.equal(find(row({}, sw({ 'aria-label': 'Name' })), (n) => n.type === 'Switch').props['aria-labelledby'], undefined);
  });
});

describe('SettingRow changed state', () => {
  it('is not marked by default and has no description text', () => {
    const r = row();
    assert.ok(!r.props.className.includes('is-changed'));
    assert.equal(byClass(r, 'hy-setting-row__changed'), null);
  });
  it('marks the row and adds the default changed label to the description', () => {
    const r = row({ changed: true, help: 'Help' });
    assert.ok(r.props.className.includes('is-changed'));
    const note = byClass(r, 'hy-setting-row__changed');
    assert.deepEqual(note.children, ['Unsaved change']);
    assert.ok(note.props.className.split(' ').includes('hy-sr'));
    const input = find(r, (n) => n.type === 'input');
    const help = byClass(r, 'hy-setting-row__help');
    assert.deepEqual(ids(input.props['aria-describedby']), [help.props.id, note.props.id]);
  });
  it('uses changedLabel', () => {
    const note = byClass(row({ changed: true, changedLabel: 'Edited' }), 'hy-setting-row__changed');
    assert.deepEqual(note.children, ['Edited']);
  });
  it('always draws the edge mark in CSS, so toggling moves nothing', () => {
    assert.match(css, /\.hy-setting-row::before\s*\{[^}]*opacity:\s*0/);
    assert.match(css, /\.hy-setting-row\.is-changed::before\s*\{[^}]*opacity:\s*1/);
    assert.match(css, /\.hy-setting-row::before\s*\{[^}]*var\(--accent-/);
  });
});

describe('SettingRow layout', () => {
  it('passes className through', () => {
    assert.ok(row({ className: 'extra' }).props.className.split(' ').includes('extra'));
  });
  it('stacks below sm and sits side by side from sm up', () => {
    assert.match(css, /\.hy-setting-row\s*\{[^}]*flex-direction:\s*column/);
    assert.match(css, /@media \(min-width: 640px\)\s*\{[^@]*\.hy-setting-row\s*\{[^}]*flex-direction:\s*row/);
  });
  it('divides consecutive rows only', () => {
    assert.match(css, /\.hy-setting-row \+ \.hy-setting-row\s*\{[^}]*border-top:\s*1px solid var\(--gray-alpha-400\)/);
    assert.ok(!/\n\.hy-setting-row\s*\{[^}]*border-top/.test(css));
  });
});
