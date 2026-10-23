# Description

A key and its value, as a definition list: a quiet title over a medium-weight value.

**You provide:** `title` (the key) and `content` (the value, or pass it as children). Optional: `tooltip` for a one-sentence definition behind an info button, `right` to right-align both lines, and `ellipsis` to keep a long value on one line. `layout="horizontal"` puts the title and the value on one row, for version and licence lists or a summary; give each `termWidth` (px or a CSS length), or set the CSS variable `--hy-description-term` once on a wrapper, so the values of stacked descriptions line up.

- Use it for metadata on a detail page: Last Deployed, Region, Plan. For help under a form field, use the field's hint instead. For rows you compare, use Table.
- It renders `<dl>`, `<dt>` and `<dd>`, so screen readers announce each pair. Don't wrap it in paragraphs that break the list.
- The title is a Title Case noun (Build Duration). The value is sentence case unless it's an ID, hash or timestamp, which stays verbatim.
- Add `tooltip` only when the title is ambiguous. Write it as one sentence that ends with a period.
- Keep buttons, menus and links out of the title. They belong in the value or the surrounding layout.

## Examples

### Default
A quiet title over a medium-weight value.

```jsx
import { Description } from '@hyprsh/design';

export default function Example() {
  return <Description title="Production Branch" content="main" />;
}
```

### Stacked Details
Several descriptions make a key and value block for a detail page.

```jsx
import { Description } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, maxWidth: 560 }}>
      <Description title="Status" content="Ready" />
      <Description title="Region" content="Washington, D.C. (iad1)" />
      <Description title="Duration" content="42s" />
      <Description title="Commit" content="4f2a9c1" />
    </div>
  );
}
```

### Horizontal
Title and value on one row, with `termWidth` so the values line up.

```jsx
import { Description } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
      <Description layout="horizontal" termWidth={96} title="Version" content="0.9.0" />
      <Description layout="horizontal" termWidth={96} title="Licence" content="MIT" />
      <Description layout="horizontal" termWidth={96} title="Node" content="22 or later" />
    </div>
  );
}
```

### With a Tooltip
`tooltip` adds a one-sentence definition behind an info button.

```jsx
import { Description } from '@hyprsh/design';

export default function Example() {
  return <Description title="Edge Requests" tooltip="Requests served from the nearest region." content="128,402" />;
}
```

### Right-Aligned and Truncated
`right` aligns both lines to the end, and `ellipsis` keeps a long value on one line.

```jsx
import { Description } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 24, justifyContent: 'space-between', maxWidth: 420 }}>
      <Description ellipsis title="Deployment URL" content="https://marketing-site-4f2a9c1-platform-team.hyprsh.dev" />
      <Description right title="Total" content="786 GB" />
    </div>
  );
}
```
