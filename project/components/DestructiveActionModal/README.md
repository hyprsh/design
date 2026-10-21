# DestructiveActionModal

A confirmation modal for destructive actions: submit stays disabled until the person types a verification phrase exactly, and an optional red band says what cannot be undone.

**You provide:** `open`, `onCancel`, `onConfirm`, `title`, `confirmLabel`, `verificationPhrase`, and usually `description`, `verificationLabel` (e.g. `"project name"`) and `irreversibleDescription`. Optional: `cancelLabel` (default “Cancel”), `loading` (disables both buttons and shows a spinner on confirm), `error` (a string or an `Error`, shown under the input) and `inline`.

- Use it for delete, rotate, revoke, disconnect, downgrade or disabling a security setting. For routine confirmations (discard draft, close without saving) use a plain Modal.
- Keep the typed gate for reversible destructive actions too, but omit `irreversibleDescription`: its absence is the signal.
- For entity deletes the phrase is the resource name with `verificationLabel="project name"`. Fall back to a lowercase verb phrase (“disable preview protection”) only when there is no entity.
- `title` and `confirmLabel` match 1:1 as Verb + Noun (“Delete Project”), never “Confirm” or a bare verb. The description names the resource and the consequence.
- `irreversibleDescription` names the action and resource and ends with “cannot be undone.”
- You own `open`: don't close from inside `onConfirm`. Close after the request settles, or keep it open with `error` so the person can retry. Pair the success toast verb with the button (“Project deleted”).
