# CommandMenuTrigger

A button that looks like a small search field and opens the command menu, with the ⌘K hint on the right.

**You provide:** `onClick` (open the menu), and optionally `children` as the label (default "Search…"), `size` (`small` 32px or `medium` 36px, default `medium`, the same heights as Input, and 40px on touch screens), `prefix` (default the search icon; `null` or `false` hides it) and `shortcut` (default a ⌘K key; `false` hides it, a node replaces it). Other button attributes (`disabled`, `aria-*`, `className`) pass through, and `ref` reaches the button. It fills its container and truncates a long label with an ellipsis.

- It is a native `<button>` with `aria-haspopup="dialog"`, not a read-only Input, so screen readers announce a button that opens a dialog instead of an uneditable text box.
- The accessible name is the label alone. The prefix and shortcut are hidden from screen readers; the default shortcut adds `aria-keyshortcuts`.
- The label names what the menu does: "Search or Run a Command…". Keep it short, it shares the row with the shortcut.
- Pair it with CommandMenu, which already listens for ⌘K / Ctrl + K. If you replace the shortcut or turn the menu's hotkey off, change the hint to match.
- Use SearchInput when people type a query in place. Use this when the click opens a separate palette.
