# LoadMoreButton

A full-width button at the end of a list that appends the next page of results.

**You provide:** `onClick` and `loading` while the request runs. Optional: the label (`children`, default “Load More”), `noGap` to drop the 16px space above it, `noBorderRadius` when it closes off a bordered container, `disabled`. Other Button props pass through.

- Use it for feeds and logs that people scan from the top. Use numbered pages or Pagination when people need to come back to a specific page.
- Set `loading` while fetching. It keeps the label, shows a spinner and blocks double requests.
- Hide the button once there is nothing left to load, rather than disabling it, and say “No More Deployments” or similar if the end needs stating.
- After loading, keep focus on the button so keyboard users can keep going, and announce the new count nearby if it matters.
- The label is Title Case: “Load More”, or “Load More Deployments” when the page has several lists.

## Examples

### Default
A full-width button at the end of a list.

```jsx
import { LoadMoreButton } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: 360, maxWidth: '100%' }}>
      <LoadMoreButton onClick={() => {}} />
    </div>
  );
}
```

### Loading Pages
`loading` while the request runs. Each press appends the next page.

```jsx
import { useState } from 'react';
import { LoadMoreButton } from '@hyprsh/design';

export default function Example() {
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);

  function load() {
    setLoading(true);
    setTimeout(() => { setCount((c) => c + 3); setLoading(false); }, 800);
  }

  return (
    <div style={{ width: 360, maxWidth: '100%' }}>
      <ul className="copy-14" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {Array.from({ length: count }, (_, i) => <li key={i} style={{ padding: '8px 0' }}>Deployment {count - i}</li>)}
      </ul>
      <LoadMoreButton loading={loading} onClick={load}>Load More Deployments</LoadMoreButton>
    </div>
  );
}
```

### Closing a Bordered List
`noGap` and `noBorderRadius` attach it to a bordered container.

```jsx
import { LoadMoreButton } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: 360, maxWidth: '100%', border: '1px solid var(--gray-alpha-400)', borderRadius: 8, overflow: 'hidden' }}>
      <div className="copy-14" style={{ padding: 16 }}>marketing-site, docs and api</div>
      <LoadMoreButton noGap noBorderRadius>Show More Projects</LoadMoreButton>
    </div>
  );
}
```

### Disabled
At the end of the list there is nothing more to load.

```jsx
import { LoadMoreButton } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: 360, maxWidth: '100%' }}>
      <LoadMoreButton disabled>No More Deployments</LoadMoreButton>
    </div>
  );
}
```
