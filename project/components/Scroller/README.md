# Scroller

A scroll area for an overflowing list of peer items on one axis (or both), with edge fades and optional step buttons.

**You provide:** `children`, `overflow` (`"y"` by default, `"x"` or `"both"`), `width` and `height` (px numbers or CSS lengths). Optional: `withButtons` to step between direct children, `childrenContainerClassName` for the gap between them, and `aria-label` to name the region and its buttons.

- Use vertical for stacked feeds and logs, horizontal for rails of chips or tiles, and `both` only when the content really runs both ways, such as logs with very long lines.
- Hundreds of items belong in a virtualised list inside the Scroller, not as plain DOM nodes.
- The buttons step to *direct* children, so don't wrap the items in an extra layout node.
- The edge fade appears only on a side that has more content. Fades blend into `background-100`; set `--hy-scroller-fade` when the Scroller sits on another surface.
- Keep item widths and gaps even on a horizontal rail, so it steps with a steady rhythm.
- Put items in reading order: tab order follows the DOM, and focusing an off-screen item scrolls it into view. When the content overflows, the scroll area itself takes focus so the arrow keys can scroll it.
- Name the buttons by their content with `aria-label` (“Scroll Deployments Right”), not a bare “Next”.
