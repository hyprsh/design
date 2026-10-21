# Label

A 13px form label that names a control by its id, or wraps the control itself.

**You provide:** the label text as `value` (or as children), and the control's `id` (or `htmlFor`) so clicking the label focuses it. Pass `withInput` with the control as children to wrap it, which also works without ids. The text is capitalized word by word; pass `bypassCasing` for names that keep their own casing, like `npm` or `iOS`.

- Labels are short Title Case nouns: "Email Address", not "Enter your email".
- Input, Textarea and Select already take a `label` prop. Reach for Label when you build a custom control or lay out the label yourself.
- Every control needs a label. When the context names it and a visible label would repeat it, use `aria-label` on the control instead.
- Don't put help text in the label. Put it in a hint under the field.
