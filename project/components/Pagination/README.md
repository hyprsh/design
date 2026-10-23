# Pagination

Previous and next links at the end of a page in a sequence, such as docs, a guide or a changelog, showing the neighbouring pages' titles.

**You provide:** `previous` and `next`, each `{ title, href }` (optional `label` and `onClick` for client routing). Leave one out on the first or last page. Optional: `aria-label` (default “Pagination”).

- Use Pagination to move through an ordered set of pages. For long lists of results, use LoadMoreButton or a table's own paging.
- Leave a side out on the first or last page. Don't show a disabled link.
- Each link says where it goes: screen readers hear “Go to next page: Environment Variables”. Pass the real page title, in Title Case.
- Put it at the bottom of the content, after the last section and before the footer.

## Examples

### Default
Previous and next links showing the neighbouring pages’ titles.

```jsx
import { Pagination } from '@hyprsh/design';

export default function Example() {
  return (
    <Pagination
      previous={{ title: 'Environment Variables', href: '#environment-variables' }}
      next={{ title: 'Custom Domains', href: '#custom-domains' }}
    />
  );
}
```

### First Page
Leave out `previous` on the first page.

```jsx
import { Pagination } from '@hyprsh/design';

export default function Example() {
  return <Pagination next={{ title: 'Create a Project', href: '#create-a-project' }} />;
}
```

### Last Page
Leave out `next` on the last page.

```jsx
import { Pagination } from '@hyprsh/design';

export default function Example() {
  return <Pagination previous={{ title: 'Rollbacks', href: '#rollbacks' }} />;
}
```

### Client Routing
`onClick` handles navigation in your router, and `aria-label` names the nav.

```jsx
import { useState } from 'react';
import { Pagination } from '@hyprsh/design';

const pages = ['Overview', 'Builds', 'Deployments', 'Domains'];

export default function Example() {
  const [index, setIndex] = useState(1);
  const go = (i) => (e) => { e.preventDefault(); setIndex(i); };
  const link = (i) => ({ title: pages[i], href: `#${pages[i].toLowerCase()}`, onClick: go(i) });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h2 className="heading-20" style={{ margin: 0 }}>{pages[index]}</h2>
      <Pagination
        aria-label="Guide pages"
        previous={index > 0 ? link(index - 1) : undefined}
        next={index < pages.length - 1 ? link(index + 1) : undefined}
      />
    </div>
  );
}
```
