# Tooltip

A small floating label that appears on hover and keyboard focus to add context to an element. The first tooltip waits about 150ms, its neighbours then show instantly, and Escape hides it.

**You provide:** `text` (a string or rich content, such as a KeyboardInput) and the trigger as `children` (usually an icon-only Button with its own `aria-label`; plain text is wrapped in a focusable span). Optional: `position` (`top` | `bottom` | `left` | `right`), `boxAlign` (`left` | `center` | `right`), `delay` (`false` for none, or ms), `type` (`success` | `error` | `warning` | `violet`), `tip={false}` to hide the arrow, `center={false}` to left-align the text, and `defaultOpen` (hyprsh) for docs.

- Explain why something exists or what limits it, not what it is: the visible label names the thing. Skip tooltips that repeat the label or describe the click.
- One sentence or fragment, sentence case, no full stop on a single fragment. For entity metadata use a ContextCard; for anything longer use a Drawer or a page.
- Lifecycle tooltips (Beta, Early Access) follow “Label: one-line meaning. Specific limit.”
- Don't wrap a labelled Input in a Tooltip: put help on a sibling icon button. Never put primary actions or essential information only in a tooltip, since touch users can't hover.
