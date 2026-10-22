# Checkbox

A 16px checkbox with a 13px label, in checked, indeterminate and disabled states.

**You provide:** the label as children (or `aria-label` when the row names it), and `checked` with `onChange`, or `defaultChecked`. Optional: `indeterminate` (a dash in an empty box, for a parent whose children are partly selected; `checked="indeterminate"` still works), `description`, `disabled`, `name`, `value` and `required`. `description` adds a hint line under the label, wired to the input with `aria-describedby` (“Check for Updates”, then a sentence on what it sends); it is read after the label, not as part of it. With a description, `className` and `style` apply to the wrapper that holds the label and the hint.

- Use checkboxes to pick several items, or to acknowledge something before a submit. For a single on/off setting that applies right away, use Toggle.
- Indeterminate is a visual state only. Clicking the parent selects or clears all of its children; you decide which.
- Required checkboxes are checked on submit, not while people are still reading.
- A disabled checkbox needs a reason nearby, in a hint or a Tooltip on the row.
- A hint is one sentence in sentence case that says what turning the setting on does. Keep the label short and move the detail into `description`.
- Group related checkboxes in a `<fieldset>` with a `<legend>`.
- In a table, give each row's checkbox `aria-label="Select {row name}"`.
