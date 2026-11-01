# Table pinned columns keep their index, and the Columns menu is placed by the app

Reorderable Table columns can be pinned: a pinned column keeps the index it has in the default order, can't be dragged or moved, and other columns can't be moved into its slot, so they reorder around it. Reordering has two keyboard paths, Alt+←/→ on a focused head and the exported `Table.ColumnsMenu`, and the menu is a `Menu` the app places, for example in a toolbar, rather than something the header builds in. Both keyboard paths exist because Alt+←/→ is invisible and clashes with some screen readers and browsers, while the menu is the path for touch, where the drag is only what pointer events give for free.

## Considered Options

- **Pinned columns move to the start or end:** the usual spreadsheet "freeze", but it changes where a column sits, and an actions column or a checkbox column wants to stay where the app put it, not be collected at an edge.
- **Pinned columns can be moved but not dragged over:** the order then depends on who moved last and a pinned column can end up anywhere, which defeats pinning.
- **Alt+←/→ only:** nothing on screen says it exists, and touch has no keyboard.
- **A built-in header menu button:** the header is already crowded with the sort button and the resize handle, would need a column of its own, and the table can't know where the app wants the control.

## Consequences

- The order resolves around pinned columns: a pinned key in `columnOrder` is ignored, and moving a column steps over a pinned one.
- `Table.ColumnsMenu` is controlled: it takes `columns`, `columnOrder` and `onColumnOrderChange` and keeps no order of its own, so a table using it needs the controlled form. It announces its own moves, because it lives outside the table.
- Widths stay keyed by column key, so a resized column keeps its width when moved; the table measures its columns again after a move.
- Hiding and showing columns can later join the same menu.
