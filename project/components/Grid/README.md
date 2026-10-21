# Grid

A two-dimensional cell layout with visible guide lines, solid cells that hide the guides behind them, and crosses on the intersections.

**You provide:** a `GridSystem` wrapper (`guideWidth` 1, optional `dashedGuides` and `debug`) around one or more `Grid`s with `columns` and `rows` (numbers or `{ sm, md, lg }`), optional `height="preserve-aspect-ratio"` for square tracks and `hideGuides="row" | "column"`. Inside, `GridCell` takes `column`/`row` (CSS line values such as `"1/3"`, also per breakpoint) and `solid`; `GridCross` takes the grid line `column`/`row` it sits on. The parts are also `Grid.System`, `Grid.Cell` and `Grid.Cross`.

- Use it where the guides are part of the design: landing pages, docs heroes and feature breakdowns. For an ordinary n-column list of cards, use a plain CSS grid; Grid is too much when nobody sees the lines.
- Don't nest Grids more than one level deep. Overlapping guides read as noise.
- Give `columns` and `rows` a value for each breakpoint when cells must reflow. Breakpoints follow the Grid's own width (`md` from 600px, `lg` from 960px), so it reflows the same in a sidebar or a full page.
- Make a cell `solid` when its content needs an opaque tile. Without it the guides run through the cell.
- Hide row or column guides only when one axis carries the layout. If you'd hide both, you want a plain grid.
- Guides and crosses are decorative and `aria-hidden`. Meaning lives in the cell content, in reading order. If a cell is clickable, put a real link or button in it so it gets the focus ring.
