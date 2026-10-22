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

**Selected and current rows:** `selected` on `TableRow` sets `aria-selected="true"` and `current` sets `aria-current="true"` (or pass a token such as `current="location"`); both use the same tint as a highlighted menu item and a 2px marker on the first cell, so the state isn't shown by colour alone. Use `selected` for a chosen row and `current` for the keyboard cursor of a j/k list. In the data form pass `isSelected(row)` and `isCurrent(row)`. For a selectable grid, also set `role="grid"` on `Table` and manage focus yourself.

- Use it for rows that share one shape and can be compared or sorted. For one row of content with an action, use Entity. For a key/value block on a detail page, use Description.
- When the list is empty, show an EmptyState outside the table instead of an empty body.
- Show `—` for unknown or not-applicable values, never `N/A`, `null` or a blank cell.
- Headers are Title Case nouns: Last Used, Requests (7d), Status. Sortable headers are buttons whose arrow is decorative.
- Give numeric columns `hy-num` (or `numeric: true`) so digits align in tabular numerals. Use mono for hashes and IDs.
- Over 50 rows: virtualise or paginate, and keep the page in the URL. Pagination reads Previous and Next, and ranges use an en dash: 21–40 of 142.
