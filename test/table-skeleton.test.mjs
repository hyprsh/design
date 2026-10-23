// Tests for the Table loading state's pure parts: the row count, the caption and the per-column skeleton widths.
// Table.js is plain script that runs inside the bundle's scope, so it runs here in a vm context with a stub `h` that
// returns plain objects, and the parts are read back through the `define` the file calls.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const file = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src/Table.js');
const registry = {};
const context = vm.createContext({
  HY: { Skeleton: 'Skeleton' },
  h: (type, props, ...children) => ({ type, props: props || {}, children: children.flat() }),
  cx: (...a) => a.filter(Boolean).join(' '),
  omit: (o, keys) => Object.fromEntries(Object.entries(o).filter(([k]) => !keys.includes(k))),
  define: (name, fn) => { registry[name] = fn; },
});
vm.runInContext(readFileSync(file, 'utf8'), context, { filename: file });

const cols = [
  { key: 'name', header: 'Name' },
  { key: 'hash', header: 'Hash', mono: true },
  { key: 'path', header: 'Path', truncate: true },
  { key: 'size', header: 'Size', numeric: true },
  { key: 'note', header: 'Note' },
];
const skeletonRow = (props) => registry.TableSkeletonRow(props);
// The width of each cell's Skeleton in one row.
const widths = (props) => skeletonRow(props).children.map((cell) => cell.children[0].props.width);
const pct = (w) => parseFloat(w);

describe('TableSkeletonRow', () => {
  it('renders one aria-hidden row with a cell per column, and is attached as Table.SkeletonRow', () => {
    const row = skeletonRow({ columns: cols });
    assert.equal(row.type, 'tr');
    assert.equal(row.props['aria-hidden'], 'true');
    assert.equal(row.children.length, cols.length);
    assert.equal(registry.Table.SkeletonRow, registry.TableSkeletonRow);
  });

  it('draws count plain cells without columns', () => {
    assert.equal(skeletonRow({ count: 3 }).children.length, 3);
  });

  it('is deterministic', () => {
    assert.deepEqual(widths({ columns: cols, index: 2 }), widths({ columns: cols, index: 2 }));
  });

  it('gives numeric columns shorter, right-aligned blocks', () => {
    for (let i = 0; i < 8; i++) {
      const w = widths({ columns: cols, index: i });
      for (let c = 0; c < cols.length; c++) if (c !== 3) assert.ok(pct(w[3]) < pct(w[c]), `row ${i} col ${c}`);
      assert.equal(skeletonRow({ columns: cols, index: i }).children[3].children[0].props.style.marginLeft, 'auto');
    }
  });

  it('gives mono and truncate columns a medium width, the same on every row', () => {
    const rows = [0, 1, 2, 3, 4].map((i) => widths({ columns: cols, index: i }));
    assert.equal(new Set(rows.map((w) => w[1])).size, 1);
    assert.equal(new Set(rows.map((w) => w[2])).size, 1);
    assert.ok(pct(rows[0][1]) > pct(rows[0][3]));
  });

  it('varies the other columns by row', () => {
    const name = [0, 1, 2, 3, 4].map((i) => widths({ columns: cols, index: i })[0]);
    assert.ok(new Set(name).size > 2);
  });
});

describe('Table loading', () => {
  const render = (props) => {
    const table = registry.Table(Object.assign({ columns: cols, rows: [{ id: 1, name: 'a' }] }, props)).children[0];
    const rows = table.children.find((c) => c && c.type === registry.TableBody).children;
    const caption = table.children.find((c) => c && c.type === 'caption');
    return { table, rows, caption };
  };

  it('draws 5 skeleton rows for true, N for a number, and real rows for false or 0', () => {
    assert.equal(render({ loading: true }).rows.length, 5);
    assert.ok(render({ loading: true }).rows.every((r) => r.type === registry.TableSkeletonRow));
    assert.equal(render({ loading: 3 }).rows.length, 3);
    assert.equal(render({ loading: false }).rows[0].type, registry.TableRow);
    assert.equal(render({ loading: 0 }).rows[0].type, registry.TableRow);
  });

  it('shows no empty message while loading', () => {
    const r = render({ loading: true, rows: [] });
    assert.ok(r.rows.every((row) => row.type === registry.TableSkeletonRow));
  });

  it('sets aria-busy only while loading', () => {
    assert.equal(render({ loading: true }).table.props['aria-busy'], 'true');
    assert.equal(render({}).table.props['aria-busy'], undefined);
  });

  it('announces loading in the caption', () => {
    assert.equal(render({ loading: true, caption: 'Log' }).caption.children[0], 'Log, loading');
    assert.equal(render({ loading: true }).caption.children[0], 'Loading');
    assert.equal(render({ caption: 'Log' }).caption.children[0], 'Log');
    assert.equal(render({}).caption, undefined);
  });
});
