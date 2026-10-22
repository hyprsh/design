# Input

A single-line text field with a label, an optional hint or error, prefix/suffix slots and three sizes.

**You provide:** a `label` in Title Case (or `aria-label` when the context names the field), `name`, `autoComplete`, the right `type` and `inputMode`, and `value` with `onChange`, or `defaultValue`. Optional: `hint`, `error` (a string under the field that also sets `aria-invalid`), `prefix`/`suffix` (text such as `https://` or an icon; pass `prefixStyling={false}` for an icon without the gray tray), `size` (`small` 32px, `medium` 36px, `large` 40px), `rounded`, `mono` (Geist Mono in the value, the placeholder and the error line, for paths, API keys and hashes; the label and hint stay in Geist), `labelPosition="inline"` (the label beside the field instead of above it, for a toolbar; the hint and error stay under the field) and `disabled`. The ref reaches the `<input>`.

- Use Input for one line, Textarea for several, and Combobox when the answer comes from a known list.
- Placeholders show an example value, like `my-app`, never instructions. A placeholder is never the label.
- Hint text is one sentence ending in a period.
- Validate on blur, not on every keystroke. The error names the field and the constraint ("Project Name must be 1–52 characters."), with no "please". On submit, focus the first field with an error.
- Trim values before saving, and keep the field focusable while a save is in flight.
- Turn off `spellCheck` for emails, usernames and codes. Never block paste.
- Don't wrap a labelled field in a Tooltip; put the extra detail in `hint`.
- The text is 16px on touch devices, so iOS doesn't zoom.
