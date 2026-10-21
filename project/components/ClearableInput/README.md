# ClearableInput

An Input that shows an Esc key once it holds a value; clicking the key or pressing Escape empties it.

**You provide:** an `aria-label` or `label`, `placeholder`, and `value` with `onChange` (or `defaultValue`). Clearing fires `onChange` with an empty value, then `onClear`. Pass `cmdk` to show ⌘ K while the field is empty, when a global shortcut focuses it. Every Input prop works, including `size`, `prefix` and `disabled`.

- Use it for filters and quick lookups, where people often start over. For search, use SearchInput, which adds the icon.
- Escape clears the field before it reaches anything else, so pressing it in a Modal empties the filter first and closes the Modal on the next press.
- Only show `cmdk` when the shortcut really works on the page.
- The Esc key is a button named "Clear", so it is reachable without a keyboard shortcut.
