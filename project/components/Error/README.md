# Error

An inline error message: a red icon, an optional bold label and text that says what happened and what to do next.

**You provide:** the message as children. Optional: `label` (default `Error`, or `false` to hide it visually), `size` (`small`, `medium` by default, `large`) and `error` (`{ message, action, link }`) for a message with a recovery link. Pass `aria-live="polite"` (or a `role`) when it appears after a request.

- Use it as the block for a section that failed to load: a panel, a dashboard card, a route boundary. For a failed action use a toast, and for a field use the input's `error` prop.
- Say what happened, then what to do: “Couldn’t load deployments. Try again.” No “Oops” or “Sorry”, and never “Something Went Wrong”.
- Use “Couldn’t” or “Can’t” for user-state errors and “Failed to” for system errors that mirror CLI output. Avoid “Unable to”.
- System errors carry a stable ID (request, deployment or trace ID) in mono, so the user can paste it into a support thread.
- The recovery action does something concrete: Try Again when retrying is safe, a named verb (Reconnect Git, Update Payment Method) when it isn't. Don't retry silently.

## Examples

The component is named `Error`, so these examples import it as `ErrorMessage` to keep the global `Error` available.

### Default
A red icon, a label and a message that says what to do next.

```jsx
import { Error as ErrorMessage } from '@hyprsh/design';

export default function Example() {
  return <ErrorMessage>Domain is already in use. Remove it from the other project or use a subdomain.</ErrorMessage>;
}
```

### Sizes
Small, medium and large.

```jsx
import { Error as ErrorMessage } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ErrorMessage size="small">Project Name must be 1–52 characters.</ErrorMessage>
      <ErrorMessage size="medium">Project Name must be 1–52 characters.</ErrorMessage>
      <ErrorMessage size="large">Project Name must be 1–52 characters.</ErrorMessage>
    </div>
  );
}
```

### Custom Label
Change the label, or hide it visually with `label={false}`.

```jsx
import { Error as ErrorMessage } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ErrorMessage label="Build Failed">Missing DATABASE_URL. Add it in Project Settings, then redeploy.</ErrorMessage>
      <ErrorMessage label={false}>Couldn’t verify domain. Try again.</ErrorMessage>
    </div>
  );
}
```

### With a Recovery Link
`error` takes a message, an action and a link.

```jsx
import { Error as ErrorMessage } from '@hyprsh/design';

export default function Example() {
  return <ErrorMessage error={{ message: 'The certificate expired.', action: 'Renew Certificate', link: '#renew' }} />;
}
```

### After a Request
Announce an error that appears after an action.

```jsx
import { useState } from 'react';
import { Button, Error as ErrorMessage } from '@hyprsh/design';

export default function Example() {
  const [failed, setFailed] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <Button onClick={() => setFailed(true)}>Verify Domain</Button>
      {failed ? <ErrorMessage aria-live="polite">Couldn’t verify hyprsh.dev. Add the TXT record, then try again.</ErrorMessage> : null}
    </div>
  );
}
```
