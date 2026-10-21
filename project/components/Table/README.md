# Table

A semantic data table with striped, bordered and interactive bodies, a footer for totals and tabular numbers.

**You provide:** either the parts — `TableRoot` (scroll wrapper) › `Table` › `TableColgroup`/`TableCol`, `TableHeader`, `TableBody`, `TableFooter` › `TableRow` › `TableHead`/`TableCell` (also `Table.Root`, `Table.Body`, …) — or the data form: `columns` (`[{ key, header, numeric?, align?, mono?, render? }]`), `rows`, a screen-reader `caption` and an `empty` message. `TableBody` takes `striped`, `bordered`, `interactive` and `virtualize`, all off by default. The last column aligns right.

- Use it for rows that share one shape and can be compared or sorted. For one row of content with an action, use Entity. For a key/value block on a detail page, use Description.
- When the list is empty, show an EmptyState outside the table instead of an empty body.
- Show `—` for unknown or not-applicable values, never `N/A`, `null` or a blank cell.
- Headers are Title Case nouns: Last Used, Requests (7d), Status. Sortable headers are buttons whose arrow is decorative.
- Give numeric columns `hy-num` (or `numeric: true`) so digits align in tabular numerals. Use mono for hashes and IDs.
- Over 50 rows: virtualise or paginate, and keep the page in the URL. Pagination reads Previous and Next, and ranges use an en dash: 21–40 of 142.
