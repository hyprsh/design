# ErrorCard

A red, centred card for an error that takes over a region: an icon, a title and a message.

**You provide:** `title` and `message`. Optional: children for a recovery action such as a Try Again button. It has `role="alert"`; pass another `role` (or `aria-live="polite"`) when it shouldn't interrupt.

- Use it where a whole card or panel can't show its content: no credits left, a usage chart that failed to load. For one line of error text, use Error. For a field, use the input's `error` prop.
- The title names what failed (“Couldn’t Load Usage”, “No Build Minutes Left”). The message says what to do next.
- Offer one way forward: a Try Again button when retrying is safe, or a named action like Upgrade Plan.
- Never joke or apologise. Keep the copy plain and specific.

## Examples

### Default
A red card for an error that takes over a region.

```jsx
import { ErrorCard } from '@hyprsh/design';

export default function Example() {
  return <ErrorCard title="Couldn’t Load Deployments" message="The request timed out. Check your connection and try again." />;
}
```

### With a Recovery Action
Children hold the action.

```jsx
import { useState } from 'react';
import { Button, ErrorCard } from '@hyprsh/design';

export default function Example() {
  const [tries, setTries] = useState(0);

  return (
    <ErrorCard title="Couldn’t Load Logs" message={`The log stream disconnected. ${tries ? `Retried ${tries} ${tries === 1 ? 'time' : 'times'}.` : 'Try again.'}`}>
      <Button onClick={() => setTries((n) => n + 1)}>Try Again</Button>
    </ErrorCard>
  );
}
```

### Not Interrupting
Pass `role="status"` for an error that is there on load and shouldn’t interrupt.

```jsx
import { ErrorCard } from '@hyprsh/design';

export default function Example() {
  return <ErrorCard role="status" title="Usage Unavailable" message="Usage data is delayed. It will update within an hour." />;
}
```

### Inside a Container
Give it a width like any block.

```jsx
import { Button, ErrorCard } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ maxWidth: 420 }}>
      <ErrorCard title="Build Failed" message="Missing environment variable DATABASE_URL. Add it in Project Settings, then redeploy.">
        <Button variant="default">Redeploy</Button>
      </ErrorCard>
    </div>
  );
}
```
