# CommandMenu

A ⌘ K palette for jumping to pages and running actions. It is a modal dialog holding a combobox and a listbox: type to filter, use ↑/↓ to move, ↵ to run and Esc to close. A polite live region announces the result count.

**You provide:** `open` and `setOpen(next)` (`onOpenChange` also works), then the parts: `CommandMenuInput` (`placeholder`), and `CommandMenuList` holding `CommandMenuGroup` (`heading`), `CommandMenuItem` (`callback`, `suffix`, `prefix`, `keywords`, `value`, `disabled`) and `CommandMenuDivider`. The menu closes before an item's `callback` runs. Shorthand: skip the parts and pass `groups` (`[{ heading, items: [{ label, onSelect, keywords?, shortcut?, icon? }] }]`) with an optional `placeholder`. Optional: `label`, `hotkey={false}` to turn off the built-in ⌘/Ctrl + K listener, `inline`, and `empty` on the list to replace the empty-state copy.

**Your own search:** the query is internal by default. Pass `query` and `onQueryChange(next)` on `CommandMenu` to control it (read it to fetch results, set it, or clear it when a step changes). Pass `shouldFilter={false}` to show every item in the order you render them, or `filter(item, query)` (`item` is `{ value, keywords }`; return a boolean) to replace the built-in word match. `onKeyDown(e)` on `CommandMenu` runs before the built-in ↑/↓/↵/Esc/Tab handling; call `e.preventDefault()` to skip it for that key, e.g. to make Esc go back a step. On `CommandMenuInput`, `prefix` puts a node (a mode badge) before the field and `hideClose` (or `closeButton={false}`) removes the Esc button. On `CommandMenuList`, `loading` shows a spinner row with “Searching…” (or `loadingLabel`) instead of the empty state, marks the list `aria-busy` and announces the row politely. The highlight returns to the first item whenever the visible items change.

- Item labels are Title Case verbs or page names: “Go to Settings”, “Create Project…”. Add `keywords` for synonyms.
- Put shortcuts in `suffix` as `KeyboardInput` keys so the palette teaches them.
- The empty state echoes the query and suggests what to try.
- Every command must also be reachable without the palette.
- With `shouldFilter={false}` the empty state still shows when the query is set and no items render. Show `loading` while a search is in flight so an empty list isn't mistaken for “No results”.
