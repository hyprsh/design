# Table

A semantic data table with striped, bordered and interactive bodies, a footer for totals and tabular numbers.

**You provide:** either the parts — `TableRoot` (scroll wrapper) › `Table` › `TableColgroup`/`TableCol`, `TableHeader`, `TableBody`, `TableFooter` › `TableRow` › `TableHead`/`TableCell` (also `Table.Root`, `Table.Body`, …) — or the data form: `columns` (`[{ key, header, numeric?, align?, mono?, wrap?, truncate?, sortable?, render? }]`), `rows`, a screen-reader `caption` and an `empty` message. `TableBody` takes `striped`, `bordered`, `interactive` and `virtualize`, all off by default.

**Alignment:** columns align left unless you say otherwise: `align="left" | "center" | "right"` on a `TableHead` or `TableCell` (`align` on a column in the data form), or `numeric`, which right-aligns with tabular digits. Earlier versions right-aligned the last column of every table, whatever it held; that is gone, so add `align="right"` to the last head and cells (or `align: 'right'` on the column) where you relied on it.

**Long text:** cells are one line, at most 320px, and end in “…”. Put `wrap` on a `TableCell` (or a column) to let the text wrap with no width limit, or `truncate` to have it fill the rest of the row and end in “…” (it needs a width: use it on one column and give the others short content). With both, `wrap` wins. Show the full text in a `title` or a Tooltip when you truncate.

**Sticky header:** `stickyHeader` on `Table` keeps the header row visible while the nearest scrolling ancestor, such as a pane with `overflow: auto`, scrolls. The `TableRoot` wrapper then clips sideways instead of scrolling, so fit wide tables with `wrap` or `truncate`.

**Sorting:** `Table` never reorders `rows`; the app sorts them and passes them back. With the parts, give a `TableHead` `sort="ascending" | "descending" | "none"` (it becomes `aria-sort` on the cell) and `onSort`, which turns the label into a button that fills the cell and fires on click, Enter and Space. Give the active column its direction and every other sortable one `"none"`; leave `sort` off a head that can't be sorted. The arrow after the label is decorative (`aria-hidden`), so the direction is announced only through `aria-sort`. A column that isn't the active sort shows a muted arrow on hover and keyboard focus (always, on a touch-only device). Right-aligned heads put the arrow before the label so the label lines up with the numbers below. `onSort` and the data form's `onSortChange` also receive the button's click event as their last argument; Enter and Space fire a click with `event.detail === 0`, which tells a keyboard press from a pointer click.

```js
var _s = useState({ key: 'name', direction: 'ascending' }), sort = _s[0], setSort = _s[1];
function head(key, label, props) {
  var active = sort && sort.key === key;
  return h(TableHead, Object.assign({ sort: active ? sort.direction : 'none', onSort: function () {
    setSort({ key: key, direction: active && sort.direction === 'ascending' ? 'descending' : 'ascending' });
  } }, props), label);
}
// head('name', 'Name'), head('requests', 'Requests', { align: 'right' }); sort rows by `sort` before rendering them.
```

In the data form set `sortable: true` on a column, pass the active `sort` (`{ key, direction }` or `null`) and handle `onSortChange(next)`. Clicking a column that isn't active emits `{ key, direction: 'ascending' }`; clicking the active one flips it. To offer a way back to the default order, let a third click clear the sort: a click on the column that is currently descending would flip it back to ascending, so set `sort` to `null` instead and show the rows in their default order.

```js
onSortChange: function (next) {
  var again = sort && sort.key === next.key && sort.direction === 'descending';
  setSort(again ? null : next);   // ascending, descending, back to default
}
```

**Loading:** `loading` on the data form draws skeleton rows under the real header instead of `rows` or `empty`: `true` for 5 rows, or a number. Each cell holds a Skeleton sized to its column: `numeric` columns get a short, right-aligned block, `mono` and `truncate` columns a medium one, the rest widths that vary by row. The rows are the same height as real ones (also under touch sizing), so nothing shifts when data arrives. Sortable headers keep their look but are inert, the table gets `aria-busy="true"`, the skeleton rows are hidden from screen readers and the caption reads “Projects, loading” (“Loading” without a `caption`). With the parts, repeat `TableSkeletonRow` (`Table.SkeletonRow`) with `columns` for the same sizing, or `count` for plain cells, and give it `index` so the widths vary; set `aria-busy` on the table yourself.

**Selected and current rows:** `selected` on `TableRow` sets `aria-selected="true"` and `current` sets `aria-current="true"` (or pass a token such as `current="location"`); both use the same tint as a highlighted menu item and a 2px marker on the first cell, so the state isn't shown by colour alone. Use `selected` for a chosen row and `current` for the keyboard cursor of a j/k list. In the data form pass `isSelected(row)` and `isCurrent(row)`. For a selectable grid, also set `role="grid"` on `Table` and manage focus yourself.

- Use it for rows that share one shape and can be compared or sorted. For one row of content with an action, use Entity. For a key/value block on a detail page, use Description.
- When the list is empty, show an EmptyState outside the table instead of an empty body.
- Show `—` for unknown or not-applicable values, never `N/A`, `null` or a blank cell.
- Headers are Title Case nouns: Last Used, Requests (7d), Status. Sortable headers are buttons whose arrow is decorative.
- Give numeric columns `hy-num` (or `numeric: true`) so digits align in tabular numerals. Use mono for hashes and IDs.
- Over 50 rows: virtualise or paginate, and keep the page in the URL. Pagination reads Previous and Next, and ranges use an en dash: 21–40 of 142.

## Examples

### Data Form
Describe `columns` and pass `rows`. Numeric columns get tabular digits, and `—` stands for an unknown value.

```jsx
import { Table } from '@hyprsh/design';

const columns = [
  { key: 'name', header: 'Project' },
  { key: 'branch', header: 'Branch', mono: true },
  { key: 'status', header: 'Status' },
  { key: 'requests', header: 'Requests (7d)', numeric: true },
];

const rows = [
  { id: 1, name: 'marketing-site', branch: 'main', status: 'Ready', requests: '128,402' },
  { id: 2, name: 'docs', branch: 'main', status: 'Building', requests: '54,310' },
  { id: 3, name: 'api', branch: 'staging', status: 'Ready', requests: '9,871' },
  { id: 4, name: 'dashboard', branch: 'feat/tab-bar', status: 'Error', requests: '—' },
];

export default function Example() {
  return <Table caption="Projects" columns={columns} rows={rows} />;
}
```

### Loading
`loading` draws skeleton rows in the table's shape under the real header. Pass a number for a different row count.

```jsx
import { useEffect, useState } from 'react';
import { Table } from '@hyprsh/design';

const columns = [
  { key: 'name', header: 'Project', sortable: true },
  { key: 'branch', header: 'Branch', mono: true },
  { key: 'requests', header: 'Requests (7d)', numeric: true },
];

const data = [
  { id: 1, name: 'marketing-site', branch: 'main', requests: '128,402' },
  { id: 2, name: 'docs', branch: 'main', requests: '54,310' },
  { id: 3, name: 'api', branch: 'staging', requests: '9,871' },
];

export default function Example() {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setRows(data), 2000);
    return () => clearTimeout(t);
  }, []);

  return <Table caption="Projects" columns={columns} rows={rows || []} loading={rows ? false : 3} />;
}
```

### Striped, Bordered and Interactive
Body options are off by default and combine freely.

```jsx
import { Table } from '@hyprsh/design';

const columns = [
  { key: 'domain', header: 'Domain' },
  { key: 'project', header: 'Project' },
  { key: 'added', header: 'Added', align: 'right' },
];

const rows = [
  { id: 1, domain: 'hyprsh.dev', project: 'marketing-site', added: 'Oct 3' },
  { id: 2, domain: 'docs.hyprsh.dev', project: 'docs', added: 'Oct 9' },
  { id: 3, domain: 'api.hyprsh.dev', project: 'api', added: 'Oct 21' },
];

export default function Example() {
  return <Table caption="Domains" columns={columns} rows={rows} striped bordered interactive />;
}
```

### Sorting
The table never reorders `rows`: sort them yourself and pass the active `sort`. A third click clears it.

```jsx
import { useState } from 'react';
import { Table } from '@hyprsh/design';

const columns = [
  { key: 'name', header: 'Project', sortable: true },
  { key: 'deployments', header: 'Deployments', numeric: true, sortable: true },
  { key: 'updated', header: 'Last Deployed' },
];

const rows = [
  { id: 1, name: 'marketing-site', deployments: 214, updated: '2 hours ago' },
  { id: 2, name: 'docs', deployments: 88, updated: '1 day ago' },
  { id: 3, name: 'api', deployments: 302, updated: '15 minutes ago' },
];

export default function Example() {
  const [sort, setSort] = useState({ key: 'name', direction: 'ascending' });

  const sorted = sort
    ? [...rows].sort((a, b) => {
        const order = a[sort.key] > b[sort.key] ? 1 : a[sort.key] < b[sort.key] ? -1 : 0;
        return sort.direction === 'ascending' ? order : -order;
      })
    : rows;

  function onSortChange(next) {
    const again = sort && sort.key === next.key && sort.direction === 'descending';
    setSort(again ? null : next);
  }

  return <Table caption="Projects" columns={columns} rows={sorted} sort={sort} onSortChange={onSortChange} />;
}
```

### Composed Parts with a Footer
Build the table from its parts when a cell needs more than text, such as a link or a badge.

```jsx
import { Badge, Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@hyprsh/design';

const usage = [
  { id: 1, project: 'marketing-site', plan: 'Pro', bandwidth: 412 },
  { id: 2, project: 'docs', plan: 'Hobby', bandwidth: 96 },
  { id: 3, project: 'api', plan: 'Pro', bandwidth: 278 },
];

export default function Example() {
  const total = usage.reduce((sum, row) => sum + row.bandwidth, 0);

  return (
    <Table caption="Bandwidth by project">
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead align="right">Bandwidth (GB)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody bordered>
        {usage.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.project}</TableCell>
            <TableCell><Badge variant={row.plan === 'Pro' ? 'blue' : 'gray'} contrast="low">{row.plan}</Badge></TableCell>
            <TableCell align="right" className="hy-num">{row.bandwidth}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
          <TableCell />
          <TableCell align="right" className="hy-num">{total}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
```

### Selected Rows
`selected` on a row sets `aria-selected` and a tint with a marker, so the state isn't shown by colour alone.

```jsx
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@hyprsh/design';

const deployments = [
  { id: 'dpl_8f2a', branch: 'main', status: 'Ready' },
  { id: 'dpl_71cd', branch: 'staging', status: 'Ready' },
  { id: 'dpl_03be', branch: 'feat/tab-bar', status: 'Canceled' },
];

export default function Example() {
  const [selectedId, setSelectedId] = useState('dpl_71cd');

  return (
    <Table caption="Deployments">
      <TableHeader>
        <TableRow>
          <TableHead>Deployment</TableHead>
          <TableHead>Branch</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody interactive>
        {deployments.map((row) => (
          <TableRow key={row.id} selected={row.id === selectedId} onClick={() => setSelectedId(row.id)}>
            <TableCell className="label-13-mono">{row.id}</TableCell>
            <TableCell>{row.branch}</TableCell>
            <TableCell>{row.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```
