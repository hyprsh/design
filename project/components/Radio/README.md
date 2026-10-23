# Radio

A 16px radio with a 13px label: RadioGroup with RadioGroupItem for a set of choices, or a standalone Radio.

**You provide:** a `RadioGroup` with a `label` (it names the group for assistive tech and stays visually hidden) or `aria-label`, `value` with `onChange` (called with the picked value) or `defaultValue`, and one `RadioGroupItem` per choice, each with a `value` and a label as children. Optional: `required` and `disabled` on the group, `disabled` on an item, `name` when the group posts with a form, and `horizontal`. For a custom item layout, call `useRadio({ value })` inside the group and render its `component`. A standalone `Radio` takes `checked`, `onChange`, `value` and an `aria-label`. Also available as `Radio.Group`, `Radio.GroupItem` and `Radio.useRadio`.

- Use radios for 2–6 mutually exclusive options that are all worth seeing. Past 6, use Select; for a single on/off, use Toggle; for options with descriptions, use Choicebox.
- Pre-select the safe default, so the group always has an answer.
- Put `required` on the group, not on single items.
- Arrow keys move between options and skip disabled ones; Tab leaves the group.
- Keep option labels parallel: all nouns, or all verbs.
- A disabled option needs a reason nearby.
- When a visible group label helps, render it as a heading or `<legend>` above the group and point `aria-labelledby` at it.
