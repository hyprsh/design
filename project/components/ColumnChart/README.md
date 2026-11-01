# ColumnChart

A stacked column chart with a legend, tooltips, a keyboard path and a table view.

**You provide:** `series` (the stacked series, bottom first, each with a `key`, a `label` and an optional `tone`), `data` (the columns in x order, each with a `label` and `values` by series key; a missing value is 0) and an accessible name (`aria-label` or `aria-labelledby`). Optional: `height` (plot height in px, default 200), `legend` (shown for two or more series; `false` hides it), `valueFormatter` (default `Intl.NumberFormat`), `view` / `defaultView` / `onViewChange` (`'chart'` or `'table'`) and `empty` (shown when `data` is empty, default “No Data”).

- Use it for amounts over an ordered axis, split by outcome or kind: deployments per day by result, requests per day by status. For ranked bars use BarList.
- Give a `tone` to a series that means an outcome or state. The tones colour exactly as `Progress` segments do. A series without a tone uses `--chart-series`, the single-series colour, so leave the tone off for a one-series chart.
- Values are never negative, and the y scale always starts at 0 with at most five clean ticks (compact from 1,000: 1K, 2K). The y-axis ticks use their own compact format, not `valueFormatter`.
- Two or more series get a legend above the plot; one series has none.
- Hovering or focusing a column tints its slot and opens a tooltip with each series from the top of the stack down and a Total.
- The plot is one Tab stop. ←/→ move between columns, Home and End jump to the ends, and each column is named like “Oct 28: 25 Ready, 1 Canceled, 0 Error”. Under touch sizing a tap opens the tooltip.
- X labels thin out to every nth label on a narrow chart. For dense data, “View as Table” swaps the plot for a table with a row per column, a column per series and a Total. A visually hidden copy of the table is always there for screen readers in chart view.
- Do put a name on every chart. Don't use more than the five tones as series colours, or reach for it for grouped columns, lines or areas.

## Examples

### Deployments By Outcome
Stacked by tone, with a legend. Hover or focus a column for its tooltip.

```jsx
import { ColumnChart } from '@hyprsh/design';

const series = [
  { key: 'ready', label: 'Ready', tone: 'success' },
  { key: 'canceled', label: 'Canceled', tone: 'neutral' },
  { key: 'error', label: 'Error', tone: 'error' },
];
const data = [
  { label: 'Oct 26', values: { ready: 4, canceled: 0, error: 0 } },
  { label: 'Oct 27', values: { ready: 6, canceled: 1, error: 0 } },
  { label: 'Oct 28', values: { ready: 25, canceled: 1, error: 0 } },
  { label: 'Oct 29', values: { ready: 33, canceled: 3, error: 1 } },
  { label: 'Oct 30', values: { ready: 27, canceled: 2, error: 0 } },
];

export default function Example() {
  return <ColumnChart series={series} data={data} aria-label="Deployments per day, by outcome" />;
}
```

### Single Series
One untoned series: no legend, drawn in the single-series colour.

```jsx
import { ColumnChart } from '@hyprsh/design';

const data = [
  { label: 'Mon', values: { requests: 1200 } },
  { label: 'Tue', values: { requests: 3400 } },
  { label: 'Wed', values: { requests: 2800 } },
  { label: 'Thu', values: { requests: 4100 } },
  { label: 'Fri', values: { requests: 900 } },
];

export default function Example() {
  return <ColumnChart series={[{ key: 'requests', label: 'Requests' }]} data={data} height={160} aria-label="Requests per day" />;
}
```

### Controlled Table View
Hold the view in state, for example to keep it in the URL.

```jsx
import { useState } from 'react';
import { ColumnChart } from '@hyprsh/design';

const series = [
  { key: 'ready', label: 'Ready', tone: 'success' },
  { key: 'error', label: 'Error', tone: 'error' },
];
const data = [
  { label: 'Oct 28', values: { ready: 25, error: 0 } },
  { label: 'Oct 29', values: { ready: 33, error: 1 } },
  { label: 'Oct 30', values: { ready: 27, error: 0 } },
];

export default function Example() {
  const [view, setView] = useState('table');
  return <ColumnChart series={series} data={data} view={view} onViewChange={setView} aria-label="Deployments per day" />;
}
```

### Custom Value Format
Format the tooltip, the table and the accessible names.

```jsx
import { ColumnChart } from '@hyprsh/design';

const data = [
  { label: 'Oct 28', values: { bandwidth: 2.4 } },
  { label: 'Oct 29', values: { bandwidth: 3.1 } },
  { label: 'Oct 30', values: { bandwidth: 1.8 } },
];

export default function Example() {
  return (
    <ColumnChart
      series={[{ key: 'bandwidth', label: 'Bandwidth' }]}
      data={data}
      valueFormatter={(v) => `${v} GB`}
      aria-label="Bandwidth per day"
    />
  );
}
```

### Empty
Shows `empty` instead of the plot.

```jsx
import { ColumnChart } from '@hyprsh/design';

export default function Example() {
  return (
    <ColumnChart
      series={[{ key: 'ready', label: 'Ready', tone: 'success' }]}
      data={[]}
      empty="No Deployments Yet"
      aria-label="Deployments per day"
    />
  );
}
```
