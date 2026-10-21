# DotsMenu

A three-dot icon button that opens a Menu of secondary actions for one row, card or object.

**You provide:** `MenuItem` children (and `MenuLink`, `MenuItemLocked`, `MenuSection`, `MenuDivider`) and an `aria-label` that names the object (“Deployment Actions”). Optional: `iconSize` (`10` | `12` | `18`, default `18`), `size`, `disabled`, `position` (`bottom-end` by default), `width`, `open`/`defaultOpen`/`onOpenChange`.

- Use DotsMenu at the end of a table row, list item or card, where a labelled Menu button would be too heavy. Anywhere with room for text, use Menu with a visible label.
- Always pass an `aria-label` naming what the actions apply to. Every row's button otherwise reads the same.
- The most common action should also be reachable without the menu, such as clicking the row. Don't hide the only way to do something here.
- Items follow Menu's rules: Title Case Verb + Noun, destructive items last after a divider with `type="error"`, “…” only when a dialog follows.
