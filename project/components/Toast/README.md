# Toast

A short, temporary message in a polite `aria-live` region at the bottom right. Toasts stack into a pile that expands on hover or focus, and their timers pause while it is expanded.

**You provide:** either the imperative API, `const toasts = useToasts()` then `toasts.message({ text })`, `toasts.success(text)`, `toasts.warning(text)` or `toasts.error(text)`, or a controlled list with `<Toast toasts onDismiss>` (`[{ id, text | message, type?, action?, onUndoAction?, preserve?, duration? }]`). Options: `preserve` keeps the toast until dismissed, `action: 'Retry'` with `onAction` adds one button, and `onUndoAction` turns it into an Undo snackbar (Dismiss + Undo, 8s). Toasts dismiss themselves after 6s. `useToasts()` renders into a `<Toast />` host if you mount one, and mounts its own otherwise. Optional: `inline` to render the list in place.

- Use toasts for non-blocking acknowledgements of the person's own actions: “Domain added”, “Project archived”. Validation goes on the field; persistent warnings go in a Note.
- Pick the method by how the person experienced it, not by HTTP status: a canceled deploy is `message`, a partial deploy is `warning`.
- Completion toasts follow “Noun past-participle” with no full stop and no “successfully”. Errors are two sentences ending in the fix: “Couldn’t verify domain. Try again.”
- Match the verb to the button that caused it (Delete Project → “Project deleted”). Undo snackbars use the literal label “Undo”, and only when rollback is safe.
- Don't narrate one async flow with several toasts, and never put navigation in a toast. Build failures and billing errors also need a persistent row with the fix.
