# SearchInput

A search field with a magnifier icon, a spinner while results load, and the Esc key from ClearableInput.

**You provide:** an `aria-label`, a `placeholder` that names what is searched ("Search deployments…"), and `value` with `onChange` (or `defaultValue`). Optional: `loading` swaps the icon for a spinner and sets `aria-busy`; `prefix` replaces the icon; `cmdk` shows ⌘ K while empty; `onClear`. Every Input prop works. The input is `type="search"` with autocomplete and spell check off.

- The placeholder names the scope, so people know what they're searching.
- Search as people type, debounced, and set `loading` while a request is in flight. Keep the field enabled meanwhile.
- Escape clears the query; when the field is empty, Escape goes on to the surrounding Modal or Menu.
- Use one search field per view. To filter a short list in place, ClearableInput is enough.
