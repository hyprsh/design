# Select

A native dropdown with a label, an optional hint or error, a prefix icon and three sizes, styled like Input.

**You provide:** a `label` in Title Case (or `aria-label`), `name`, the choices as `<option>` children (or `options` as data), and `value` with `onChange`, or `defaultValue`. Optional: `placeholder` (a disabled first option, gray until something is picked), `prefix` (an icon), `suffix` (replaces the chevron), `hint`, `error`, `size` (`small` 32px, `medium` 36px, `large` 40px), `required` and `disabled`. The ref reaches the `<select>`.

- Use Select for up to about 10 choices. Past that, use Combobox so people can type to filter; group long lists with native `<optgroup>`.
- For several values, use a multi-select; for 2–3 options that are all worth seeing, use Switch or Radio.
- Option labels are Title Case and parallel. The placeholder says what to do: "Select a region".
- Pre-select a safe default when there is one, instead of a placeholder.
- Validate on blur, and say which choice is missing in the error.
