# Toast

A short, temporary message in a polite `aria-live` region at the bottom right, lifted by `--tab-bar-height` so it clears a `TabBar`. Toasts stack into a pile that expands on hover or focus, and their timers pause while it is expanded.

**You provide:** either the imperative API, `const toasts = useToasts()` then `toasts.message({ text })`, `toasts.success(text)`, `toasts.warning(text)` or `toasts.error(text)`, or a controlled list with `<Toast toasts onDismiss>` (`[{ id, text | message, type?, action?, onUndoAction?, preserve?, duration? }]`). Options: `preserve` keeps the toast until dismissed, `action: 'Retry'` with `onAction` adds one button, and `onUndoAction` turns it into an Undo snackbar (Dismiss + Undo, 8s). Toasts dismiss themselves after 6s. `useToasts()` renders into a `<Toast />` host if you mount one, and mounts its own otherwise. Mount `<Toast />` once at the app root anyway: it renders on the server, and the toasts stack in one predictable place. `progress: { value, max? }` draws a bar below the text. `toasts.update(id, changes)` changes a shown toast in place (text, type, action, progress, duration, preserve) and returns `false` for an unknown id. Optional: `inline` to render the list in place.

- Use toasts for non-blocking acknowledgements of the person's own actions: “Domain added”, “Project archived”. Validation goes on the field; persistent warnings go in a Note.
- Pick the method by how the person experienced it, not by HTTP status: a canceled deploy is `message`, a partial deploy is `warning`.
- Completion toasts follow “Noun past-participle” with no full stop and no “successfully”. Errors are two sentences ending in the fix: “Couldn’t verify domain. Try again.”
- Match the verb to the button that caused it (Delete Project → “Project deleted”). Undo snackbars use the literal label “Undo”, and only when rollback is safe.
- Narrate one async flow with one toast, updated in place, never with several. Text and type changes are announced once; progress alone is not, so put the milestones in the text (“Searching 3 of 10…”). The timer carries on through an update unless it has `duration` or `preserve`: update a preserved toast with `preserve: false` to let it leave after the default duration. Never put navigation in a toast, and build failures and billing errors also need a persistent row with the fix.

## Examples

### Show a Toast
Call `useToasts()` and trigger a toast from the action that caused it. Completion toasts are “Noun past-participle”.

```jsx
import { Button, useToasts } from '@hyprsh/design';

export default function Example() {
  const toasts = useToasts();

  return <Button onClick={() => toasts.message({ text: 'Project archived' })}>Archive Project</Button>;
}
```

### Types
Pick the method by how the person experienced it. Errors give the fix.

```jsx
import { Button, useToasts } from '@hyprsh/design';

export default function Example() {
  const toasts = useToasts();

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button onClick={() => toasts.message('Deployment canceled')}>Message</Button>
      <Button onClick={() => toasts.success('Domain added')}>Success</Button>
      <Button onClick={() => toasts.warning('Some routes were skipped during the build')}>Warning</Button>
      <Button onClick={() => toasts.error('Couldn’t verify domain. Try again.')}>Error</Button>
    </div>
  );
}
```

### Undo
`onUndoAction` turns the toast into an Undo snackbar, only where rollback is safe.

```jsx
import { Button, useToasts } from '@hyprsh/design';

export default function Example() {
  const toasts = useToasts();

  function deleteVariable() {
    toasts.message({
      text: 'Environment variable deleted',
      onUndoAction: () => toasts.success('Environment variable restored'),
    });
  }

  return <Button variant="error" onClick={deleteVariable}>Delete Variable</Button>;
}
```

### Action and Preserve
One action button, and `preserve` keeps the toast until it is dismissed.

```jsx
import { Button, useToasts } from '@hyprsh/design';

export default function Example() {
  const toasts = useToasts();

  function failBuild() {
    toasts.error({
      text: 'Build failed on main. Check the logs and redeploy.',
      action: 'Retry',
      onAction: () => toasts.message('Redeploying…'),
      preserve: true,
    });
  }

  return <Button onClick={failBuild}>Deploy Project</Button>;
}
```

### Progress and Update
Show a preserved toast with `progress`, change it in place with `update`, and finish it with `preserve: false` so it leaves on its own.

```jsx
import { Button, useToasts } from '@hyprsh/design';

export default function Example() {
  const toasts = useToasts();

  function search() {
    const id = toasts.message({ text: 'Searching 0 of 10…', preserve: true, progress: { value: 0, max: 10 } });
    let n = 0;
    const timer = setInterval(() => {
      n += 1;
      if (n < 10) {
        toasts.update(id, { text: `Searching ${n} of 10…`, progress: { value: n, max: 10 } });
      } else {
        clearInterval(timer);
        toasts.update(id, { text: 'Search done', type: 'success', progress: null, preserve: false });
      }
    }, 600);
  }

  return <Button onClick={search}>Search Deployments</Button>;
}
```

### Controlled List
Render a `Toast` in place from your own list. `inline` makes it a plain column instead of the fixed stack.

```jsx
import { useState } from 'react';
import { Toast } from '@hyprsh/design';

export default function Example() {
  const [list, setList] = useState([
    { id: 1, text: 'Domain added', preserve: true },
    { id: 2, text: 'Deployment promoted to production', type: 'success', preserve: true },
  ]);

  return (
    <div style={{ maxWidth: 360 }}>
      <Toast inline toasts={list} onDismiss={(id) => setList((l) => l.filter((t) => t.id !== id))} />
    </div>
  );
}
```
