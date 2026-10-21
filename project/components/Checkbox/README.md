# Checkbox

A 16px checkbox with a 13px label, in checked, indeterminate and disabled states.

**You provide:** the label as children (or `aria-label` when the row names it), and `checked` with `onChange`, or `defaultChecked`. Optional: `indeterminate` (a dash in an empty box, for a parent whose children are partly selected; `checked="indeterminate"` still works), `disabled`, `name`, `value` and `required`.

- Use checkboxes to pick several items, or to acknowledge something before a submit. For a single on/off setting that applies right away, use Toggle.
- Indeterminate is a visual state only. Clicking the parent selects or clears all of its children; you decide which.
- Required checkboxes are checked on submit, not while people are still reading.
- A disabled checkbox needs a reason nearby, in a hint or a Tooltip on the row.
- Group related checkboxes in a `<fieldset>` with a `<legend>`.
- In a table, give each row's checkbox `aria-label="Select {row name}"`.
