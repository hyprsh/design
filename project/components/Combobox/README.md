# Combobox

A search field that filters a list as you type and picks one option from it, for lists too long to scan in a Select.

**You provide:** an accessible name (`aria-label`, or an outside `<label htmlFor>` pointing at `id`), and options as `ComboboxList` > `ComboboxOption value` children (also `Combobox.List`, `Combobox.Option`) or an `options` array. Use `value` + `onChange(value)` or `defaultValue`. Optional: `placeholder`, `size` (`small` 32px, `medium` 36px by default, `large` 40px), `width` (full width by default), `clearable`, `errored`, `disabled`, `loading`, `emptyMessage` (on the list or the root), `name` to submit it in a form, and `prefix`/`suffix` on options.

- Use a placeholder that says what to search for (“Search frameworks…”).
- Write the empty state with the query in it, for example “No frameworks match ‘nuxt’”; pass a function to `emptyMessage` to get the text.
- Show `loading` while results arrive instead of an empty list.
- Arrow keys move through options, Enter picks, Escape closes and puts back the last choice. Enter never submits the form while the list is open.
- For fewer than about seven options, a Select or Switch is quicker.
- Under touch sizing options are 44px tall, and the clear and chevron buttons keep their drawn size with a 44px hit area.
- When the typed text is the value, such as a search or filter query, use QueryInput. Combobox only picks one option from its list.
