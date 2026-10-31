# Pager

Previous and next buttons with a range such as “51–100 of 240”, for paging through a long set of results in place.

**You provide:** `page` (starting at 1), `pageSize`, `total` and `onPageChange(page)`. The pager is controlled only: slice or fetch the rows yourself, and it calls `onPageChange` only after the user pressed a button. Optional: `loading`, which disables both buttons and keeps the last range, and `aria-label` (default “Pages”).

- Use Pager under a long table or list when people stay on the same page as the results. For links between documents in a sequence, use [Pagination](../Pagination/README.md). For feeds without a known total, use LoadMoreButton.
- Keep `page` in the app's URL (for example `?page=2`), so a reload, a shared link and the back button land on the same page. The one exception is results shown inside a dialog or popover, which have no URL of their own: there the page may stay in component state.
- Reset to page 1 when the sort or a filter changes.
- Previous and next stay in place and are disabled at the ends, so nothing moves under the pointer. When everything fits on one page the range shows alone, and with a `total` of 0 the pager renders nothing.
- A `page` beyond the last one, for example after a filter shrinks `total`, shows the last page's range with next disabled. Correct the page in your own state when you want the URL to follow.
- Numbers follow the viewer's locale, and the range uses an en dash with tabular digits. The visible range is hidden from screen readers; a polite live region announces “Showing 51–100 of 240” after `page` changes, and stays silent on the first render and when only `total` changes.
- The buttons are named “Previous Page” and “Next Page”, and grow to the touch target size on touch devices. The pager fits a 320px wide container.

## Examples

### Default
The range on the left and previous and next on the right.

```jsx
import { useState } from 'react';
import { Pager } from '@hyprsh/design';

export default function Example() {
  const [page, setPage] = useState(2);
  return <Pager page={page} pageSize={50} total={240} onPageChange={setPage} />;
}
```

### Under a Sortable Table
Keep `page` in the URL, and go back to page 1 when the sort changes.

```jsx
import { useEffect, useState } from 'react';
import { Pager, Table } from '@hyprsh/design';

const columns = [
  { key: 'name', header: 'Project', sortable: true },
  { key: 'branch', header: 'Branch', mono: true },
  { key: 'requests', header: 'Requests (7d)', numeric: true, sortable: true },
];

const projects = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  name: `project-${String(i + 1).padStart(2, '0')}`,
  branch: i % 3 === 0 ? 'staging' : 'main',
  requests: (i * 7919) % 10000,
}));

const pageSize = 10;
const readPage = () => Number(new URLSearchParams(window.location.search).get('page')) || 1;

export default function Example() {
  const [page, setPage] = useState(readPage);
  const [sort, setSort] = useState({ key: 'name', direction: 'ascending' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', String(page));
    window.history.replaceState(null, '', `?${params}`);
  }, [page]);

  const sorted = [...projects].sort((a, b) => {
    const order = a[sort.key] < b[sort.key] ? -1 : a[sort.key] > b[sort.key] ? 1 : 0;
    return sort.direction === 'ascending' ? order : -order;
  });
  const rows = sorted.slice((page - 1) * pageSize, page * pageSize);

  function onSortChange(next) {
    setSort(next);
    setPage(1);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Table caption="Projects" columns={columns} rows={rows} sort={sort} onSortChange={onSortChange} />
      <Pager page={page} pageSize={pageSize} total={projects.length} onPageChange={setPage} />
    </div>
  );
}
```

### Loading
`loading` disables both buttons and keeps the range while the next page loads.

```jsx
import { useState } from 'react';
import { Pager } from '@hyprsh/design';

export default function Example() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  function onPageChange(next) {
    setLoading(true);
    setTimeout(() => {
      setPage(next);
      setLoading(false);
    }, 800);
  }

  return <Pager page={page} pageSize={25} total={3400} loading={loading} onPageChange={onPageChange} />;
}
```

### One Page
When everything fits on one page, only the range shows.

```jsx
import { Pager } from '@hyprsh/design';

export default function Example() {
  return <Pager page={1} pageSize={50} total={12} onPageChange={() => {}} />;
}
```

### Last Page
The range ends at `total` and next is disabled.

```jsx
import { Pager } from '@hyprsh/design';

export default function Example() {
  return <Pager page={5} pageSize={50} total={240} onPageChange={() => {}} aria-label="Project pages" />;
}
```
