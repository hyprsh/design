# Textarea

A multi-line text field with a label, an optional hint or error, and three sizes, styled like Input.

**You provide:** a `label` in Title Case (or `aria-label`), `name`, `rows` (4 by default; pick enough for a typical answer), and `value` with `onChange`, or `defaultValue`. Optional: `hint`, `error` (a string under the field that also sets `aria-invalid`), `size` (`small` | `medium` | `large`), `mono` (Geist Mono in the value, the placeholder and the error line, for config or key material; the label and hint stay in Geist Sans), `disabled` and `readOnly`. The ref reaches the `<textarea>`; `style` sets its `minHeight`.

- Use Textarea for text that runs past one line: descriptions, commit messages, environment notes. For one line, use Input.
- Give it generous default rows, so people can see what they wrote without scrolling.
- Placeholders show an example, never instructions.
- Validate on blur, and trim the value on submit.
- Hint text is one sentence ending in a period, under the field.
- Use `readOnly`, not `disabled`, for text people need to read or copy.
