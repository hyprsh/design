# QueryBar

A query field with a row of filter menus that read and write the same query, like GitHub's issue filters.

**You provide:** `value` and `onChange(query)` (the query text, owned by your screen; or `defaultValue` to let the bar keep it), `qualifiers` (the same list `QueryInput` takes), an accessible name (`aria-label`) and `placeholder`. Optional: `help` (`true` by default: the “?” button sits beside the field; `false` hides it; `'menus'` puts it last in the menu row), `shortcut` (one key that focuses the field, as in QueryInput), `size` (`small`, `medium` by default, `large`; the menus follow it), `wrap` (`true` by default: the menus wrap onto more rows when they don't fit; `false` keeps them on one row that scrolls sideways), `className`, and the other `QueryInput` props such as `id` and `disabled`. Children are `QueryBar.Menu` elements.

- Use it for a list screen whose filters are also typed. A `QueryBar.Menu` takes everything a `FilterMenu` does except `value`, `defaultValue` and `onChange`, plus `qualifier`, the name it edits: `<QueryBar.Menu qualifier="label" label="Labels" items={…} />`. Rows are the menu's own: `items`, `FilterMenu.Section` and `FilterMenu.Item`. For a query field alone use QueryInput, and for filters shown as pills from URL params, FilterParams.
- A menu is `excludable` when its qualifier is, and `noneLabel` adds a row only when the qualifier has `none: true`. A sort menu is `<QueryBar.Menu qualifier="sort" label="Sort" single defaultOption="newest" items={…} />`.
- **Reading.** The bar parses the query with `parseQuery`. `include` is the values of every `label:` term, `exclude` the values of every `-label:` term, and `none` is whether `no:label` is there. With two `label:` terms the menu shows the values of both. A `single` menu shows the `sort:` term's value, or `defaultOption` when there is none, so it doesn't look active until you pick something else. A typed value that matches no row shows checked at the top of its menu, which is how a qualifier that takes any value (people, say) works.
- **Writing.** Checking a value adds it to the existing `label:` term, or adds a new term at the end. Unchecking takes it out of every `label:` term, and a term left empty goes. Excluding does the same on `-label:`. “No labels” writes `no:label` and removes the qualifier's `label:` and `-label:` terms, and choosing a value removes `no:label`. In a `single` menu the default option removes the `sort:` term and any other option replaces it. Terms no menu owns (`is:open`) and free text are never changed, and each edit calls `onChange` once with the new query. Typing in the field updates the menus on the next render, because the text is the only state.
- **Layout.** The field grows to fill the bar, with the menus in a row after it. The bar is a container: when it is narrower than about 560px (whatever the viewport is) the menus move to their own row under the field, where they wrap onto more rows when they don't fit, so a Sort menu at the end of the row stays visible. `wrap={false}` keeps one row that scrolls sideways (Scroller) instead, and each menu's panel stays on screen. The row is a group named “Filters”.
- **Help button.** `help="menus"` hides the “?” button beside the field and puts it after the last `QueryBar.Menu`, in the row's flow (it wraps with the menus, or scrolls with them when `wrap={false}`). With no menus it stays beside the field. Like the field's, it shows only when there are qualifiers.
- The bar adds no announcements of its own: each FilterMenu announces its changes. Problems in the query show under the field, as in QueryInput.
- Syncing the query to the URL, saving queries and folding the menus into a sheet on phones are left to your app.

## Examples

### Default
A query field with a menu for one qualifier. Checking a value writes it into the query, and typing updates the menu.

```jsx
import { useState } from 'react';
import { QueryBar } from '@hyprsh/design';

const qualifiers = [
  { name: 'label', help: 'Has this label', suggestions: ['bug', 'docs', 'enhancement'], excludable: true, none: true },
];

export default function Example() {
  const [query, setQuery] = useState('label:bug');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <QueryBar aria-label="Search issues" placeholder="Search issues…" qualifiers={qualifiers} value={query} onChange={setQuery}>
        <QueryBar.Menu qualifier="label" label="Labels" noneLabel="No labels" items={['bug', 'docs', 'enhancement']} />
      </QueryBar>
      <span className="copy-13">Query: <code>{query || '(empty)'}</code></span>
    </div>
  );
}
```

### Several Menus and Sort
A `single` menu picks one option, and its default doesn’t add a term. Terms no menu owns, like `is:open`, are left alone.

```jsx
import { useState } from 'react';
import { QueryBar } from '@hyprsh/design';

const qualifiers = [
  { name: 'is', help: 'Open or closed', values: ['open', 'closed'] },
  { name: 'label', help: 'Has this label', suggestions: ['bug', 'docs', 'enhancement', 'wontfix'], excludable: true, none: true },
  { name: 'assignee', help: 'Assigned to', suggestions: ['ada', 'grace', 'linus'], excludable: true, none: true },
  { name: 'sort', help: 'Newest, oldest or most commented', values: ['newest', 'oldest', 'comments'] },
];

export default function Example() {
  const [query, setQuery] = useState('is:open label:bug');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
      <QueryBar aria-label="Search issues" placeholder="Search issues…" qualifiers={qualifiers} value={query} onChange={setQuery}>
        <QueryBar.Menu qualifier="label" label="Labels" noneLabel="No labels" items={['bug', 'docs', 'enhancement', 'wontfix']} />
        <QueryBar.Menu qualifier="assignee" label="Assignees" noneLabel="Unassigned" items={['ada', 'grace', 'linus']} />
        <QueryBar.Menu
          qualifier="sort"
          label="Sort"
          single
          defaultOption="newest"
          align="end"
          items={[
            { value: 'newest', label: 'Newest' },
            { value: 'oldest', label: 'Oldest' },
            { value: 'comments', label: 'Most Commented' },
          ]}
        />
      </QueryBar>
      <span className="copy-13">Query: <code>{query || '(empty)'}</code></span>
    </div>
  );
}
```

### Uncontrolled
Leave out `value` to let the bar keep the query, starting from `defaultValue`.

```jsx
import { QueryBar } from '@hyprsh/design';

const qualifiers = [
  { name: 'branch', help: 'Built from this branch', suggestions: ['main', 'staging', 'feat/tab-bar'], excludable: true },
];

export default function Example() {
  return (
    <QueryBar aria-label="Search deployments" placeholder="Search deployments…" qualifiers={qualifiers} defaultValue="branch:main">
      <QueryBar.Menu qualifier="branch" label="Branches" excludable items={['main', 'staging', 'feat/tab-bar']} />
    </QueryBar>
  );
}
```

### Small, in a Sidebar
`size` follows through to the menus, and the menus wrap under the field when the bar is narrow.

```jsx
import { useState } from 'react';
import { QueryBar } from '@hyprsh/design';

const qualifiers = [
  { name: 'is', help: 'Open or closed', values: ['open', 'closed'] },
  { name: 'label', help: 'Has this label', suggestions: ['bug', 'docs'], excludable: true },
];

export default function Example() {
  const [query, setQuery] = useState('is:open');

  return (
    <div style={{ width: 288, maxWidth: '100%', boxSizing: 'border-box', border: '1px solid var(--gray-alpha-400)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
      <QueryBar size="small" aria-label="Filter issues" placeholder="Filter issues…" qualifiers={qualifiers} value={query} onChange={setQuery}>
        <QueryBar.Menu qualifier="is" label="State" single defaultOption="open" items={[{ value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }]} />
        <QueryBar.Menu qualifier="label" label="Labels" items={['bug', 'docs']} />
      </QueryBar>
    </div>
  );
}
```

### Help in the Menu Row
`help="menus"` moves the “?” button to the end of the menu row.

```jsx
import { QueryBar } from '@hyprsh/design';

const qualifiers = [
  { name: 'is', help: 'Open or closed', values: ['open', 'closed'] },
  { name: 'label', help: 'Has this label', suggestions: ['bug', 'docs'], excludable: true },
];

export default function Example() {
  return (
    <QueryBar aria-label="Search issues" placeholder="Search issues…" qualifiers={qualifiers} help="menus" shortcut="/" defaultValue="is:open">
      <QueryBar.Menu qualifier="is" label="State" single defaultOption="open" items={[{ value: 'open', label: 'Open' }, { value: 'closed', label: 'Closed' }]} />
      <QueryBar.Menu qualifier="label" label="Labels" items={['bug', 'docs']} />
    </QueryBar>
  );
}
```
