# CommandMenu

A ⌘ K palette for jumping to pages and running actions. It is a modal dialog holding a combobox and a listbox: type to filter, use ↑/↓ to move, ↵ to run and Esc to close. A polite live region announces the result count.

**You provide:** `open` and `setOpen(next)` (`onOpenChange` also works), then the parts: `CommandMenuInput` (`placeholder`), and `CommandMenuList` holding `CommandMenuGroup` (`heading`), `CommandMenuItem` (`callback`, `suffix`, `prefix`, `keywords`, `value`, `disabled`) and `CommandMenuDivider`. The menu closes before an item's `callback` runs. Shorthand: skip the parts and pass `groups` (`[{ heading, items: [{ label, onSelect, keywords?, shortcut?, icon? }] }]`) with an optional `placeholder`. Optional: `label`, `hotkey={false}` to turn off the built-in ⌘/Ctrl + K listener, `inline`, and `empty` on the list to replace the empty-state copy.

- Item labels are Title Case verbs or page names: “Go to Settings”, “Create Project…”. Add `keywords` for synonyms.
- Put shortcuts in `suffix` as `KeyboardInput` keys so the palette teaches them.
- The empty state echoes the query and suggests what to try.
- Every command must also be reachable without the palette.
