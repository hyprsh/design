# TabBar

A floating pill tab bar for the main screens of an app at phone width. It follows the iOS 26 tab bar pattern, built from hyprsh's tokens (an opaque surface, no blur).

**You provide:** `label` (the name of the `<nav>`) and `TabBar.Item` children, each with a `label` and an `icon`. Use `value` with `onChange` or `onValueChange` (controlled; both are called), or `defaultValue`. Optional: `accessory` (`{ label, icon, onClick?, href? }`), `minimizeOnScroll` with `scrollRef`, and `hideFrom` (`'sm'` by default; `false` shows it at every width). `TabBar.Item` is also exported as `TabBarItem`.

**Items:** an item with a `value` selects it. An item with only `onClick` is an action, such as More opening a Drawer: pair it with `haspopup`. `href` renders a link. `current` takes the selection, for More while a screen that lives in More is open: while any item has it, no item is selected by `value`. The selected item carries `aria-current="page"`.

**Badges:** `badge={true}` is a dot, a number is a count (“99+” above 99, nothing for 0), and a node is rendered as given. Add `badgeLabel` (“3 need attention”) so the badge reaches assistive tech: it joins the item's accessible name. `badgeTone` (`'accent'` by default, `'error'` or `'warning'`) draws a dot or count in red or amber, for a count that is worse than news. A node badge ignores it. The tone is visual only and never changes the accessible name, so say it in `badgeLabel` (“2 blocking”, “1 warning”).

**Minimise on scroll:** with `minimizeOnScroll` the capsule shrinks to the selected item after the content scrolls down 24px. It expands on scrolling up, at the top, or on a tap (the tap doesn't navigate). It watches every scrolling element in the document, except horizontal scrolling and anything inside a dialog or sheet. That includes a layout that scrolls an inner container instead of the window. Pass `scrollRef` to watch only that one container.

- Use it for the 3–5 main destinations on a phone, with More for the rest. Use Tabs to switch sections inside a page.
- Keep labels to one short word in Title Case. They are always visible.
- The bar is fixed to the bottom and takes no layout space, so pad your scroll area with `--tab-bar-height`. It is `0px` when no visible TabBar is mounted (and from `sm` up while the bar is hidden), and it doesn't change when the bar is minimised:

  ```css
  .screen { overflow-y: auto; padding-bottom: var(--tab-bar-height); }
  ```
- Tab moves through every item, then the accessory. Left/Right and Home/End move between the items only.
- The accessory is for an action that isn't a screen, such as Search. It is an icon-only button, so its `label` is its accessible name.
- Every item and the accessory are at least `--touch-target` in both directions.
- Don't put a desktop navigation in it: from `sm` up use a rail or sidebar.
