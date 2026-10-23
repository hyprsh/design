# Input

A single-line text field with a label, an optional hint or error, prefix/suffix slots and three sizes.

**You provide:** a `label` in Title Case (or `aria-label` when the context names the field), `name`, `autoComplete`, the right `type` and `inputMode`, and `value` with `onChange`, or `defaultValue`. Optional: `hint`, `error` (a string under the field that also sets `aria-invalid`), `prefix`/`suffix` (text such as `https://` or an icon; pass `prefixStyling={false}` for an icon without the gray tray), `size` (`small` 32px, `medium` 36px, `large` 40px), `rounded`, `mono` (Geist Mono in the value, the placeholder and the error line, for paths, API keys and hashes; the label and hint stay in Geist Sans), `labelPosition="inline"` (the label beside the field instead of above it, for a toolbar; the hint and error stay under the field) and `disabled`. The ref reaches the `<input>`.

- Use Input for one line, Textarea for several, and Combobox when the answer comes from a known list.
- Placeholders show an example value, like `my-app`, never instructions. A placeholder is never the label.
- Hint text is one sentence ending in a period.
- Validate on blur, not on every keystroke. The error names the field and the constraint ("Project Name must be 1–52 characters."), with no "please". On submit, focus the first field with an error.
- Trim values before saving, and keep the field focusable while a save is in flight.
- Turn off `spellCheck` for emails, usernames and codes. Never block paste.
- Don't wrap a labelled field in a Tooltip; put the extra detail in `hint`.
- The text is 16px on touch devices, so iOS doesn't zoom.

## Examples

### Default
A labelled field with a hint. The placeholder shows an example value, never an instruction.

```jsx
import { Input } from '@hyprsh/design';

export default function Example() {
  return (
    <Input
      label="Project Name"
      name="project"
      placeholder="my-app"
      autoComplete="off"
      hint="Lowercase letters, numbers and hyphens."
    />
  );
}
```

### Prefix and Suffix
Text slots sit in a gray tray. Pass `prefixStyling={false}` for an icon, and `mono` for paths, keys and hashes.

```jsx
import { Input } from '@hyprsh/design';
import { Search } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <Input label="Domain" name="domain" prefix="https://" suffix=".hyprsh.dev" placeholder="my-app" autoComplete="off" />
      <Input label="Search Projects" name="q" prefix={<Search />} prefixStyling={false} placeholder="Search projects…" autoComplete="off" />
      <Input label="API Key" name="key" mono defaultValue="hy_live_4f9a1c2e" autoComplete="off" spellCheck={false} />
    </div>
  );
}
```

### Sizes
Small, medium and large follow the control scale, so an Input lines up with a Button of the same size.

```jsx
import { Input } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <Input size="small" label="Branch (Small)" name="branch-s" defaultValue="main" autoComplete="off" />
      <Input size="medium" label="Branch (Medium)" name="branch-m" defaultValue="main" autoComplete="off" />
      <Input size="large" label="Branch (Large)" name="branch-l" defaultValue="main" autoComplete="off" />
    </div>
  );
}
```

### Validation
Validate on blur, not on every keystroke. The error names the field and says how to fix it.

```jsx
import { useState } from 'react';
import { Input } from '@hyprsh/design';

export default function Example() {
  const [name, setName] = useState('My App');
  const [touched, setTouched] = useState(false);
  const invalid = touched && !/^[a-z0-9-]{1,52}$/.test(name.trim());

  return (
    <div style={{ maxWidth: 360 }}>
      <Input
        label="Project Name"
        name="project"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => setTouched(true)}
        error={invalid ? 'Project Name must be 1–52 lowercase letters, numbers or hyphens.' : undefined}
        autoComplete="off"
      />
    </div>
  );
}
```

### In a Form
Fields stack in a column, and the submit button names its result.

```jsx
import { useState } from 'react';
import { Button, Input } from '@hyprsh/design';
import { GitBranch } from 'lucide-react';

export default function Example() {
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSaved(true); }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}
    >
      <Input label="Project Name" name="project" placeholder="my-app" autoComplete="off" required />
      <Input label="Production Branch" name="branch" prefix={<GitBranch />} prefixStyling={false} defaultValue="main" autoComplete="off" spellCheck={false} mono />
      <Input label="Webhook URL" name="webhook" type="url" inputMode="url" placeholder="https://hooks.example.dev/deploy" hint="Called after every successful deployment." autoComplete="off" />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Button variant="default" typeName="submit">Create Project</Button>
        {saved ? <span className="copy-14" role="status">Project created</span> : null}
      </div>
    </form>
  );
}
```
