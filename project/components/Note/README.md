# Note

An inline message that sits in the page flow: a tip, a warning, an error with its fix.

**You provide:** the message as `children`. Optional: `variant` (`default` | `secondary` | `success` | `warning` | `error` | `violet` | `cyan`), `fill` for a tinted background, `size` (`small` | `medium` | `large`), `label` for a short bold prefix, one `action` node such as a small Button, `icon` to replace the variant's icon (`null` hides it), and `disabled`. For richer layouts, compose `Note.Content`, `Note.Label` and `Note.Action` (also exported as `NoteContent`, `NoteLabel` and `NoteAction`). The older `type` prop still works and adds the variant's word (“Warning:”) unless `label={false}`.

- One concept per note, one sentence or two, and at most one action. Error notes say how to fix the problem.
- Labels are one or two Title Case words that add meaning (“Region Change”), never “Note” or “FYI”.
- Notes are not dismissible: if the message can go away, it belongs in a Toast or a ProjectBanner.
- Success notes are blue, not green: the accent stays the accent.
- `variant="error"` has `role="alert"` and `variant="success"` has `role="status"`, so a note that appears after an action is announced without a wrapper. Pass `role` to replace that (`role="note"` for one that is there on load), and `aria-label`, `aria-live`, `id` or `data-*` to put them on the note. The other variants have no role. `disabled` greys the note, drops the role and disables the controls in its action.

## Examples

### Default
An inline message in the page flow.

```jsx
import { Note } from '@hyprsh/design';

export default function Example() {
  return <Note>Environment variables apply to new deployments only.</Note>;
}
```

### Variants
Success is blue, error says how to fix the problem, and warning flags a risk.

```jsx
import { Note } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Note variant="secondary">Builds run in the region closest to your Git provider.</Note>
      <Note variant="success">Domain verified. It can take a minute for the certificate to issue.</Note>
      <Note variant="warning">This project is close to its monthly build minutes limit.</Note>
      <Note variant="error">Couldn’t verify domain. Add the TXT record to your DNS provider, then try again.</Note>
    </div>
  );
}
```

### Fill and Size
`fill` tints the background. Sizes follow the type scale.

```jsx
import { Note } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Note fill size="small" variant="warning">Preview deployments are paused.</Note>
      <Note fill size="medium" variant="warning">Preview deployments are paused.</Note>
      <Note fill size="large" variant="warning">Preview deployments are paused.</Note>
    </div>
  );
}
```

### Label and Action
A short Title Case label adds meaning, and at most one action sits inline.

```jsx
import { Button, Note } from '@hyprsh/design';

export default function Example() {
  return (
    <Note
      fill
      variant="warning"
      label="Region Change"
      action={<Button size="small">Review Changes</Button>}
    >
      Moving to Frankfurt redeploys every function.
    </Note>
  );
}
```

### Composed Parts
Use the parts when the layout needs more control.

```jsx
import { Button, Note } from '@hyprsh/design';

export default function Example() {
  return (
    <Note variant="error" fill>
      <Note.Content>
        <Note.Label>Build Failed:</Note.Label>
        Missing environment variable DATABASE_URL. Add it in Project Settings, then redeploy.
      </Note.Content>
      <Note.Action>
        <Button size="small" variant="error">Redeploy</Button>
      </Note.Action>
    </Note>
  );
}
```
