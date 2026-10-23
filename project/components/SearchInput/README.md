# SearchInput

A search field with a magnifier icon, a spinner while results load, and the Esc key from ClearableInput.

**You provide:** an `aria-label`, a `placeholder` that names what is searched ("Search deployments…"), and `value` with `onChange` (or `defaultValue`). Optional: `loading` swaps the icon for a spinner and sets `aria-busy`; `prefix` replaces the icon; `cmdk` shows ⌘ K while empty; `onClear`. Every Input prop works. The input is `type="search"` with autocomplete and spell check off.

- The placeholder names the scope, so people know what they're searching.
- Search as people type, debounced, and set `loading` while a request is in flight. Keep the field enabled meanwhile.
- Escape clears the query; when the field is empty, Escape goes on to the surrounding Modal or Menu.
- Use one search field per view. To filter a short list in place, ClearableInput is enough.

## Examples

### Default
A magnifier, a placeholder that names what is searched, and an `aria-label`.

```jsx
import { SearchInput } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ maxWidth: 360 }}>
      <SearchInput aria-label="Search deployments" placeholder="Search deployments…" />
    </div>
  );
}
```

### Controlled
Keep the query in state. Esc clears the field.

```jsx
import { useState } from 'react';
import { SearchInput } from '@hyprsh/design';

const projects = ['marketing-site', 'docs', 'api', 'dashboard', 'billing-worker'];

export default function Example() {
  const [query, setQuery] = useState('');
  const matches = projects.filter((p) => p.includes(query.trim().toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
      <SearchInput aria-label="Search projects" placeholder="Search projects…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <span className="copy-14" role="status">{matches.length} {matches.length === 1 ? 'project' : 'projects'}</span>
    </div>
  );
}
```

### Loading
`loading` swaps the icon for a spinner and sets `aria-busy`.

```jsx
import { SearchInput } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ maxWidth: 360 }}>
      <SearchInput aria-label="Search domains" placeholder="Search domains…" loading defaultValue="hyprsh" />
    </div>
  );
}
```

### Command Shortcut
`cmdk` shows ⌘ K while the field is empty.

```jsx
import { SearchInput } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ maxWidth: 360 }}>
      <SearchInput aria-label="Search" placeholder="Search…" cmdk />
    </div>
  );
}
```
