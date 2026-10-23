# DestructiveActionModal

A confirmation modal for destructive actions: submit stays disabled until the person types a verification phrase exactly, and an optional red band says what cannot be undone.

**You provide:** `open`, `onCancel`, `onConfirm`, `title`, `confirmLabel`, `verificationPhrase`, and usually `description`, `verificationLabel` (e.g. `"project name"`) and `irreversibleDescription`. Optional: `cancelLabel` (default “Cancel”), `loading` (disables both buttons and shows a spinner on confirm), `error` (a string or an `Error`, shown under the input) and `inline`.

- Use it for delete, rotate, revoke, disconnect, downgrade or disabling a security setting. For routine confirmations (discard draft, close without saving) use a plain Modal.
- Keep the typed gate for reversible destructive actions too, but omit `irreversibleDescription`: its absence is the signal.
- For entity deletes the phrase is the resource name with `verificationLabel="project name"`. Fall back to a lowercase verb phrase (“disable preview protection”) only when there is no entity.
- `title` and `confirmLabel` match 1:1 as Verb + Noun (“Delete Project”), never “Confirm” or a bare verb. The description names the resource and the consequence.
- `irreversibleDescription` names the action and resource and ends with “cannot be undone.”
- You own `open`: don't close from inside `onConfirm`. Close after the request settles, or keep it open with `error` so the person can retry. Pair the success toast verb with the button (“Project deleted”).

## Examples

### Default
Confirm stays disabled until the person types the phrase exactly. Open it from the button that asks for it.

```jsx
import { useState } from 'react';
import { Button, DestructiveActionModal } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="error" onClick={() => setOpen(true)}>Delete Project…</Button>
      <DestructiveActionModal
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        title="Delete Project"
        description="Deleting marketing-site removes its deployments, domains and environment variables."
        verificationLabel="project name"
        verificationPhrase="marketing-site"
        confirmLabel="Delete Project"
      />
    </>
  );
}
```

### Irreversible Warning
`irreversibleDescription` adds a red band that says what can’t be undone.

```jsx
import { useState } from 'react';
import { Button, DestructiveActionModal } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="error" onClick={() => setOpen(true)}>Remove Domain…</Button>
      <DestructiveActionModal
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        title="Remove Domain"
        description="hyprsh.dev stops serving this project."
        irreversibleDescription="Its certificate is revoked and can’t be restored."
        verificationLabel="domain"
        verificationPhrase="hyprsh.dev"
        confirmLabel="Remove Domain"
      />
    </>
  );
}
```

### Loading and Error
`loading` disables both buttons and shows a spinner on confirm. `error` shows under the input.

```jsx
import { useState } from 'react';
import { Button, DestructiveActionModal } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function confirm() {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setLoading(false);
      setError('Couldn’t delete the branch. Close any open deployments and try again.');
    }, 1200);
  }

  return (
    <>
      <Button variant="error" onClick={() => setOpen(true)}>Delete Branch…</Button>
      <DestructiveActionModal
        open={open}
        onCancel={() => { setOpen(false); setError(null); }}
        onConfirm={confirm}
        loading={loading}
        error={error}
        title="Delete Branch"
        description="Deleting feat/tab-bar also removes its preview deployments."
        verificationLabel="branch name"
        verificationPhrase="feat/tab-bar"
        confirmLabel="Delete Branch"
        cancelLabel="Keep Branch"
      />
    </>
  );
}
```
