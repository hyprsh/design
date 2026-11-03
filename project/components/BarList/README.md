# BarList

Labelled horizontal bars, one row per item, for ranking amounts.

**You provide:** `items` (each with a `label`, a non-negative `value` and optionally an `href` and a `key`) and an accessible name (`aria-label` or `aria-labelledby`; BarList warns in development without one). Bars scale to `max`, or to the largest value. `valueFormatter` defaults to `Intl.NumberFormat`. `unit` (for example “minutes”) is spoken after each value. `mono` sets labels in Geist Mono. `empty` shows when `items` is empty, and without it nothing renders. Optional `columns` (each `{ key, label, priority?, hideable? }`, with figures in `item.columns`), `labelHeader` and `valueHeader` add labelled figures under a header row, and `onOpen(item)` makes rows openable.

- Use it for top-N rankings (projects, sources, routes). For change over time or several series, use a chart that has a legend.
- Items render in the order given: sort them before passing them in.
- A zero value draws no bar and a non-zero value is never under 2px. The value is always visible, so there is no tooltip.
- Each row reads “label, value unit” to assistive technology and the bar is hidden. An item with `href` is a link; other rows are plain text.
- With `columns`, a header row names the label, the bar and value, and each extra column, and assistive technology reads the list as a table. Figures are right-aligned in tabular numbers, and an item without a figure shows an empty cell. Which columns fit is decided from measured widths: each extra column needs its widest cell (header or figure), and the label, bar and value need an 80px label, a 48px bar and the value's own width. When the list is too narrow, columns hide one at a time by `priority`: the largest number first, ties from the right, and a column without a `priority` before any column with one. It follows the list's own width, not the viewport. The label, bar and value never hide.
- A hidden column's figures show on a second line under each row's label, as “Label figure” pairs in column order (“Answer 310 ms · Failed 12”). A row with none of them has no second line. The line is for sighted users only: the hidden column's cells stay in the table, so assistive technology reads each figure once.
- Set `hideable: false` on a column that must stay (a hit rate, say). If the kept columns still don't fit, the bar narrows to 24px and then the label truncates further. The list never scrolls sideways, and BarList warns once in development when even that doesn't fit.
- With `onOpen`, a row is a button, and a row with an `href` stays a link that also calls `onOpen` (with the click event second, so an app can `preventDefault` and route in-app). The whole row is the target, and its name starts with the label.
- Don't use it for negative values or as a progress indicator (use Progress).

## Examples

### Top Projects
Bars scale to the largest value.

```jsx
import { BarList } from '@hyprsh/design';

export default function Example() {
  return (
    <BarList
      aria-label="Top projects by deployments"
      items={[
        { label: 'Marketing Site', value: 1280 },
        { label: 'Docs', value: 940 },
        { label: 'Dashboard', value: 615 },
      ]}
    />
  );
}
```

### With Links
Rows with an `href` are links.

```jsx
import { BarList } from '@hyprsh/design';

export default function Example() {
  return (
    <BarList
      aria-label="Top routes"
      items={[
        { label: '/docs', value: 5200, href: '/docs' },
        { label: '/pricing', value: 3100, href: '/pricing' },
      ]}
    />
  );
}
```

### Columns And Open
Extra figures under a header row, hidden by `priority` when the list is narrow. Click a row, or press Enter or Space on it, to open it.

```jsx
import { useState } from 'react';
import { BarList } from '@hyprsh/design';

const columns = [
  { key: 'p50', label: 'P50', priority: 3 },
  { key: 'p99', label: 'P99', priority: 2 },
  { key: 'errors', label: 'Errors', priority: 1 },
];

export default function Example() {
  const [opened, setOpened] = useState('Nothing opened');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <BarList
        aria-label="Requests by service"
        labelHeader="Service"
        valueHeader="Requests"
        columns={columns}
        onOpen={(item) => setOpened(item.label)}
        items={[
          { label: 'api-gateway', value: 5200, columns: { p50: '12 ms', p99: '240 ms', errors: '3' } },
          { label: 'edge-cache', value: 3100, columns: { p50: '9 ms', p99: '80 ms', errors: '0' } },
          { label: 'build-runner', value: 640, columns: { p50: '4 s', p99: '9 s' } },
        ]}
      />
      <span className="copy-14">{opened}</span>
    </div>
  );
}
```

### Kept Column
A column with `hideable: false` stays at any width, and the others hide by `priority`. Their figures show on a second line under the label.

```jsx
import { BarList } from '@hyprsh/design';

const columns = [
  { key: 'hit', label: 'Hit', hideable: false },
  { key: 'answer', label: 'Answer', priority: 2 },
  { key: 'failed', label: 'Failed', priority: 1 },
];

export default function Example() {
  return (
    <div style={{ width: 360, maxWidth: '100%' }}>
      <BarList
        aria-label="Requests by indexer"
        labelHeader="Indexer"
        valueHeader="Requests"
        columns={columns}
        items={[
          { label: 'indexer-alpha', value: 5200, columns: { hit: '94%', answer: '310 ms', failed: '12' } },
          { label: 'indexer-beta', value: 3100, columns: { hit: '81%', answer: '95 ms', failed: '0' } },
          { label: 'indexer-gamma', value: 640, columns: { hit: '60%' } },
        ]}
      />
    </div>
  );
}
```

### Unit And Mono
The unit is spoken after each value, and mono suits identifiers.

```jsx
import { BarList } from '@hyprsh/design';

export default function Example() {
  return (
    <BarList
      aria-label="Build minutes by service"
      unit="minutes"
      mono
      items={[
        { label: 'api-gateway', value: 318 },
        { label: 'edge-cache', value: 204 },
        { label: 'build-runner', value: 1 },
      ]}
    />
  );
}
```

### Empty State
Pass `empty` to say why there are no rows.

```jsx
import { BarList } from '@hyprsh/design';

export default function Example() {
  return (
    <BarList
      aria-label="Top sources"
      items={[]}
      empty={<p className="copy-14">No Data Yet</p>}
    />
  );
}
```
