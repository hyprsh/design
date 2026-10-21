# JsonView

A collapsible, colour-coded view of a JSON value, for API responses, logs and config.

**You provide:** `data`. Optional: `defaultExpandDepth` (levels open at first, default 1), `highlightPattern` from `makeJsonViewHighlightPattern(terms)` to mark search matches, and `aria-label`.

- Open only what the reader needs: the default shows the top-level keys with nested objects closed as `{…}`. Use 0 when the JSON sits next to more important content.
- Pair it with a search field and pass `makeJsonViewHighlightPattern(query)`. Matches in keys and values are marked; the helper escapes the terms, so a query like `a.b` is literal.
- It is a tree: Tab lands on one row, the arrow keys move and open or close objects, Home and End jump to the ends. Clicking a row toggles it unless you are selecting text.
- Keys are shown without quotes when they are plain identifiers. Objects with one short value stay on one line: `{ name: "web" }`.
- Long strings wrap rather than scroll. For JSON people will copy, use CodeBlock with `language="json"` instead.
- The view is inline-block, so it can sit inside a table cell or a sentence.
