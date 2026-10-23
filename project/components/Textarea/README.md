# Textarea

A multi-line text field with a label, an optional hint or error, and three sizes, styled like Input.

**You provide:** a `label` in Title Case (or `aria-label`), `name`, `rows` (4 by default; pick enough for a typical answer), and `value` with `onChange`, or `defaultValue`. Optional: `hint`, `error` (a string under the field that also sets `aria-invalid`), `size` (`small` | `medium` | `large`), `mono` (Geist Mono in the value, the placeholder and the error line, for config or key material; the label and hint stay in Geist Sans), `disabled` and `readOnly`. The ref reaches the `<textarea>`; `style` sets its `minHeight`.

- Use Textarea for text that runs past one line: descriptions, commit messages, environment notes. For one line, use Input.
- Give it generous default rows, so people can see what they wrote without scrolling.
- Placeholders show an example, never instructions.
- Validate on blur, and trim the value on submit.
- Hint text is one sentence ending in a period, under the field.
- Use `readOnly`, not `disabled`, for text people need to read or copy.

## Examples

### Default
A labelled field with a hint. The placeholder shows an example, never an instruction.

```jsx
import { Textarea } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <Textarea
        label="Deployment Note"
        name="note"
        rows={4}
        placeholder="Promoted after the migration finished…"
        hint="Shown next to the deployment in the activity log."
      />
    </div>
  );
}
```

### Sizes
Small and medium use 14px text, large uses 16px.

```jsx
import { Textarea } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 420 }}>
      <Textarea size="small" label="Note (Small)" name="note-s" rows={2} defaultValue="Hotfix for the login redirect." />
      <Textarea size="medium" label="Note (Medium)" name="note-m" rows={2} defaultValue="Hotfix for the login redirect." />
      <Textarea size="large" label="Note (Large)" name="note-l" rows={2} defaultValue="Hotfix for the login redirect." />
    </div>
  );
}
```

### Monospace
`mono` suits config and key material. Turn spell check off.

```jsx
import { Textarea } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <Textarea
        mono
        label="Environment Variables"
        name="env"
        rows={4}
        spellCheck={false}
        defaultValue={'DATABASE_URL=postgres://localhost:5432/app\nLOG_LEVEL=info'}
        hint="One KEY=value pair per line."
      />
    </div>
  );
}
```

### Character Limit
Keep the value in state and show the count. The error appears on blur and says how to fix it.

```jsx
import { useState } from 'react';
import { Textarea } from '@hyprsh/design';

const limit = 200;

export default function Example() {
  const [text, setText] = useState('');
  const [touched, setTouched] = useState(false);
  const tooLong = text.length > limit;

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <Textarea
        label="Rollback Reason"
        name="reason"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => setTouched(true)}
        hint={`${text.length} of ${limit} characters`}
        error={touched && tooLong ? `Rollback Reason must be ${limit} characters or fewer. Remove ${text.length - limit}.` : undefined}
      />
    </div>
  );
}
```

### Read Only and Disabled
Use `readOnly` for text people can select and copy, and `disabled` when it can’t be edited right now.

```jsx
import { Textarea } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 420 }}>
      <Textarea mono readOnly label="Build Output" name="out" rows={2} defaultValue={'Compiled in 4.2s\nDeployed to iad1'} />
      <Textarea disabled label="Release Notes" name="notes" rows={2} defaultValue="Locked while the deployment is building." />
    </div>
  );
}
```
