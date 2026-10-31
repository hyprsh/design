# Table columns resize into the truncate column

Resizable Table columns take their width from the table's one `truncate` column, which fills the rest of the row and has no resize handle of its own; only when it reaches its minimum, or a table has none, does the table grow wider and `TableRoot` scroll sideways. With `stickyHeader` the drag is clamped at the container's width instead, because the sticky header needs `TableRoot` to clip rather than scroll. This keeps `truncate` meaning "the rest of the row" and `stickyHeader` meaning what it did before resizing existed.

## Considered Options

- **The table always grows:** spreadsheet behaviour, but a log table would scroll sideways as soon as any column is widened, while the long message column could have given up the room.
- **The neighbouring column shrinks:** the table never scrolls, but widening one column squeezes an unrelated one and quickly hits its minimum.
- **`TableRoot` scrolls both ways when resizable and sticky:** changes what `stickyHeader` sticks to and forces the table to have a fixed height.

## Consequences

- A resizable table is laid out with `table-layout: fixed` and `<col>` widths, so the 320px cell cap and the `truncate` `max-width: 0` technique no longer apply to it.
- Columns without a declared width are measured once on first render to give them a default.
