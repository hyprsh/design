# Charts are drawn from plain elements and tokens, without a library

Charts are built without a chart library, from plain elements (`div`s for marks, a real `table` for the data) and the colour tokens. Every chart shares one anatomy: marks at most 24px thick, separated by 2px gaps in the surface colour, with 4px radii on data ends and a square baseline end; text in text colours; a legend only for two or more series; hover and focus tooltips; and gridlines in `gray-alpha-*`. They share one accessibility pattern too: an accessible name, marks hidden from assistive technology, a visually hidden table holding every value (shown by a "View as Table" toggle when a chart has many values), and one Tab stop with ←/→ and Home/End moving between columns or runs. Colour comes from two palettes only: the five tones for outcomes and states, and `chart-seq-*` / `chart-series` for amounts. The rules are in the Charts section of `project/guidelines.md`.

## Considered Options

- **A chart library:** it adds weight to a package that has no dependencies to install, brings its own styling that has to be fought to match the tokens and both themes, and gives little control over focus, keyboard behaviour and the table alternative.
- **One SVG per chart:** it is light and scales well, but a mark inside an SVG is harder to make focusable, to give a tooltip that uses the tooltip material and to theme with the same CSS the components use.

## Consequences

- Each chart component draws its own marks, so the shared anatomy lives in the guidelines and in the components that follow them, not in a library.
- Charts with very many marks are limited by how many elements the page can hold; the "View as Table" toggle is the path for dense data.
- Categorical palettes beyond the five tones are out: a chart that needs them needs a new decision.
