# Menu

A button that opens a list of actions, with typeahead and full keyboard support (the WAI-ARIA menu-button pattern).

**You provide:** a `MenuContainer` holding a `MenuButton` (any Button props, plus `showChevron` or `type="unstyled"` for a custom trigger such as an avatar) and a `Menu` (`width`). Fill the menu with `MenuItem` (`onClick`, `href`, `disabled`, `description`, `title`, `type="error"`, `prefix`, `suffix`, `shortcut`), `MenuLink` (`href`), `MenuItemLocked`, `MenuSection` (`title`) and `MenuDivider`. `MenuContainer` takes `position` (`bottom-start` by default; also `bottom-end`, `top-*`, `left-*`, `right-*`), and `open`/`defaultOpen`/`onOpenChange`. The older one-piece form still works: `<Menu label="Actions" items={[{ label, onSelect, shortcut, prefix, disabled, danger } | { separator: true }]} align="end" />`.

- Use Menu for a visible trigger that opens actions on one resource. Use ContextMenu for right-click, CommandMenu for global ⌘&nbsp;K commands, SplitButton when one action is the clear default, and Select to pick a value.
- Keep it to about 10 items; group longer lists with `MenuSection` (Title Case, one or two words) or move rare actions to a settings page.
- It opens on click, never on hover. The list floats above the page, flips side when there's no room and stays 8px inside the screen, so it works on phones; it is never wider than the screen and long labels end in “…”. On touch screens items are 40px tall. It closes on choosing an item, Escape or a click outside, and focus goes back to the trigger.
- Arrow keys, Home and End move between items; typing a letter jumps to the next item that starts with it, so keep the visible label first.
- Items are Title Case Verb + Noun (“Rename Project”, “Duplicate Deployment”). End with “…” only when the item opens a dialog.
- Put destructive items last, after a divider, as `type="error"` with a full label (“Delete Project”, never just “Delete”), and confirm them.
- Use `MenuItemLocked` for actions the user lacks permission for, so the lock explains why it's inert.

**Hints on items:** `description` adds a second line under the label (linked to the item with `aria-describedby`, so a screen reader reads it after the label), and `title` sets the native tooltip. Use a description for the reason an item is disabled: “No file to delete”, “Nothing here is Wanted”. Typeahead matches the label only.

**Disabled items and the keyboard:** a disabled item is `aria-disabled` and never runs on click, Enter or Space. A disabled item with a `description` still takes focus from the arrow keys, Home, End and typeahead, so keyboard users can read why (WAI-ARIA allows focusable disabled menu items); a disabled item without one is skipped, as before. There is no separate prop: add the description. When the menu opens, focus goes to the first (or last) enabled item.

**Keys stay inside:** the open list stops the keys it handles itself (arrows, Home, End, Enter, Space, Escape, Tab, and plain letters for typeahead) from bubbling out of the portal, through the React tree and to the document. A page's own j/k list or Escape-closes-the-pane handler does not react while the menu is open; Escape closes the menu only. Keys pressed on the trigger button are not stopped.
