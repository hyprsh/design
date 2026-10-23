# ClearableInput

An Input that shows an Esc key once it holds a value; clicking the key or pressing Escape empties it.

**You provide:** an `aria-label` or `label`, `placeholder`, and `value` with `onChange` (or `defaultValue`). Clearing fires `onChange` with an empty value, then `onClear`. Pass `cmdk` to show ⌘ K while the field is empty, when a global shortcut focuses it. Every Input prop works, including `size`, `prefix` and `disabled`.

- Use it for filters and quick lookups, where people often start over. For search, use SearchInput, which adds the icon.
- Escape clears the field before it reaches anything else, so pressing it in a Modal empties the filter first and closes the Modal on the next press.
- Only show `cmdk` when the shortcut really works on the page.
- The Esc key is a button named "Clear", so it is reachable without a keyboard shortcut.

## Examples

### Default
An Esc key appears once the field has a value. Clicking it or pressing Escape empties the field.

```jsx
import { ClearableInput } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ maxWidth: 360 }}>
      <ClearableInput aria-label="Filter branches" placeholder="Filter branches…" defaultValue="feat/" />
    </div>
  );
}
```

### Controlled
Clearing fires `onChange` with an empty value, then `onClear`.

```jsx
import { useState } from 'react';
import { ClearableInput } from '@hyprsh/design';

export default function Example() {
  const [value, setValue] = useState('docs');
  const [cleared, setCleared] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
      <ClearableInput
        aria-label="Filter projects"
        placeholder="Filter projects…"
        value={value}
        onChange={(e) => { setValue(e.target.value); setCleared(false); }}
        onClear={() => setCleared(true)}
      />
      <span className="copy-13" role="status">{cleared ? 'Filter cleared' : `Filtering by “${value}”`}</span>
    </div>
  );
}
```

### Command Shortcut
`cmdk` shows ⌘ K while the field is empty, for a global shortcut that focuses it.

```jsx
import { ClearableInput } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ maxWidth: 360 }}>
      <ClearableInput aria-label="Filter" placeholder="Filter…" cmdk />
    </div>
  );
}
```

### Sizes and Disabled
Every Input prop works.

```jsx
import { ClearableInput } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
      <ClearableInput size="small" aria-label="Small" placeholder="Small…" defaultValue="main" />
      <ClearableInput size="large" aria-label="Large" placeholder="Large…" defaultValue="main" />
      <ClearableInput disabled aria-label="Disabled" placeholder="Disabled…" />
    </div>
  );
}
```
