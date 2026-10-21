# Collapse

A heading that shows and hides the content under it, alone or in a group as an accordion.

**You provide:** `title` and the content as `children`. Optional: `defaultExpanded`, or `expanded` with `onChange`; `size="small"`; `id`; `headingLevel` (default 3). Wrap several in `Collapse.Group` (also exported as `CollapseGroup`) and add `multiple` to let more than one stay open.

- Use it for FAQs, settings with rarely used details and long reference pages. If people need most of the content, show it instead.
- In a group without `multiple`, opening one item closes the others and the open item can't be closed, so one answer is always visible. Use `multiple` when people compare items.
- Titles are real headings with a button inside, so the page outline and screen-reader heading navigation still work. Set `headingLevel` to fit the page.
- Closed content stays in the page as `hidden="until-found"`, so the browser's find-in-page opens the item that matches.
- `size="small"` suits sidebars and cards; the default 24px title suits page sections.
- The content fades in; the height changes at once, without a sliding animation.
