# Menu

A button that opens a list of actions, with typeahead and full keyboard support (the WAI-ARIA menu-button pattern).

**You provide:** a `MenuContainer` holding a `MenuButton` (any Button props, plus `showChevron` or `type="unstyled"` for a custom trigger such as an avatar) and a `Menu` (`width`). Fill the menu with `MenuItem` (`onClick`, `href`, `disabled`, `type="error"`, `prefix`, `suffix`, `shortcut`), `MenuLink` (`href`), `MenuItemLocked`, `MenuSection` (`title`) and `MenuDivider`. `MenuContainer` takes `position` (`bottom-start` by default; also `bottom-end`, `top-*`, `left-*`, `right-*`), and `open`/`defaultOpen`/`onOpenChange`. The older one-piece form still works: `<Menu label="Actions" items={[{ label, onSelect, shortcut, prefix, disabled, danger } | { separator: true }]} align="end" />`.

- Use Menu for a visible trigger that opens actions on one resource. Use ContextMenu for right-click, CommandMenu for global ⌘&nbsp;K commands, SplitButton when one action is the clear default, and Select to pick a value.
- Keep it to about 10 items; group longer lists with `MenuSection` (Title Case, one or two words) or move rare actions to a settings page.
- It opens on click, never on hover. The list floats above the page, flips side when there's no room and stays 8px inside the screen, so it works on phones; it is never wider than the screen and long labels end in “…”. On touch screens items are 40px tall. It closes on choosing an item, Escape or a click outside, and focus goes back to the trigger.
- Arrow keys, Home and End move between items; typing a letter jumps to the next item that starts with it, so keep the visible label first.
- Items are Title Case Verb + Noun (“Rename Project”, “Duplicate Deployment”). End with “…” only when the item opens a dialog.
- Put destructive items last, after a divider, as `type="error"` with a full label (“Delete Project”, never just “Delete”), and confirm them.
- Use `MenuItemLocked` for actions the user lacks permission for, so the lock explains why it's inert.
