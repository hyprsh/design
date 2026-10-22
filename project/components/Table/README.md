# Table

A semantic data table with striped, bordered and interactive bodies, a footer for totals and tabular numbers.

**You provide:** either the parts — `TableRoot` (scroll wrapper) › `Table` › `TableColgroup`/`TableCol`, `TableHeader`, `TableBody`, `TableFooter` › `TableRow` › `TableHead`/`TableCell` (also `Table.Root`, `Table.Body`, …) — or the data form: `columns` (`[{ key, header, numeric?, align?, mono?, wrap?, truncate?, render? }]`), `rows`, a screen-reader `caption` and an `empty` message. `TableBody` takes `striped`, `bordered`, `interactive` and `virtualize`, all off by default.

**Alignment:** columns align left unless you say otherwise: `align="left" | "center" | "right"` on a `TableHead` or `TableCell` (`align` on a column in the data form), or `numeric`, which right-aligns with tabular digits. Earlier versions right-aligned the last column of every table, whatever it held; that is gone, so add `align="right"` to the last head and cells (or `align: 'right'` on the column) where you relied on it.

**Long text:** cells are one line, at most 320px, and end in “…”. Put `wrap` on a `TableCell` (or a column) to let the text wrap with no width limit, or `truncate` to have it fill the rest of the row and end in “…” (it needs a width: use it on one column and give the others short content). With both, `wrap` wins. Show the full text in a `title` or a Tooltip when you truncate.

**Sticky header:** `stickyHeader` on `Table` keeps the header row visible while the nearest scrolling ancestor, such as a pane with `overflow: auto`, scrolls. The `TableRoot` wrapper then clips sideways instead of scrolling, so fit wide tables with `wrap` or `truncate`.

**Selected and current rows:** `selected` on `TableRow` sets `aria-selected="true"` and `current` sets `aria-current="true"` (or pass a token such as `current="location"`); both use the same tint as a highlighted menu item and a 2px marker on the first cell, so the state isn't shown by colour alone. Use `selected` for a chosen row and `current` for the keyboard cursor of a j/k list. In the data form pass `isSelected(row)` and `isCurrent(row)`. For a selectable grid, also set `role="grid"` on `Table` and manage focus yourself.

- Use it for rows that share one shape and can be compared or sorted. For one row of content with an action, use Entity. For a key/value block on a detail page, use Description.
- When the list is empty, show an EmptyState outside the table instead of an empty body.
- Show `—` for unknown or not-applicable values, never `N/A`, `null` or a blank cell.
- Headers are Title Case nouns: Last Used, Requests (7d), Status. Sortable headers are buttons whose arrow is decorative.
- Give numeric columns `hy-num` (or `numeric: true`) so digits align in tabular numerals. Use mono for hashes and IDs.
- Over 50 rows: virtualise or paginate, and keep the page in the URL. Pagination reads Previous and Next, and ranges use an en dash: 21–40 of 142.
