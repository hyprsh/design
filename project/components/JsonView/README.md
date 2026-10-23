# JsonView

A collapsible, colour-coded view of a JSON value, for API responses, logs and config.

**You provide:** `data`. Optional: `defaultExpandDepth` (levels open at first, default 1), `highlightPattern` from `makeJsonViewHighlightPattern(terms)` to mark search matches, and `aria-label`.

- Open only what the reader needs: the default shows the top-level keys with nested objects closed as `{…}`. Use 0 when the JSON sits next to more important content.
- Pair it with a search field and pass `makeJsonViewHighlightPattern(query)`. Matches in keys and values are marked; the helper escapes the terms, so a query like `a.b` is literal.
- It is a tree: Tab lands on one row, the arrow keys move and open or close objects, Home and End jump to the ends. Clicking a row toggles it unless you are selecting text.
- Keys are shown without quotes when they are plain identifiers. Objects with one short value stay on one line: `{ name: "web" }`.
- Long strings wrap rather than scroll. For JSON people will copy, use CodeBlock with `language="json"` instead.
- The view is inline-block, so it can sit inside a table cell or a sentence.

## Examples

### Default
A collapsible, colour-coded view of a response. One level is open at first.

```jsx
import { JsonView } from '@hyprsh/design';

const data = {
  id: 'dpl_8f2a91c4',
  state: 'READY',
  url: 'marketing-site-4f2a9c1.hyprsh.dev',
  regions: ['iad1', 'fra1'],
  build: { durationMs: 41250, cached: false, error: null },
};

export default function Example() {
  return <JsonView data={data} aria-label="Deployment response" />;
}
```

### Expand Depth
`defaultExpandDepth` sets how many levels start open. `0` starts collapsed.

```jsx
import { JsonView } from '@hyprsh/design';

const data = { project: 'marketing-site', build: { cached: true, steps: ['install', 'compile', 'upload'] } };

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <JsonView data={data} defaultExpandDepth={0} aria-label="Collapsed response" />
      <JsonView data={data} defaultExpandDepth={3} aria-label="Fully expanded response" />
    </div>
  );
}
```

### Highlighting Matches
`makeJsonViewHighlightPattern` marks search terms.

```jsx
import { useState } from 'react';
import { Input, JsonView, makeJsonViewHighlightPattern } from '@hyprsh/design';

const data = {
  deployment: { branch: 'main', region: 'iad1', state: 'READY' },
  previous: { branch: 'staging', region: 'fra1', state: 'CANCELED' },
};

export default function Example() {
  const [term, setTerm] = useState('main');
  const pattern = term.trim() ? makeJsonViewHighlightPattern(term.trim()) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
      <Input label="Find in Response" name="find" value={term} onChange={(e) => setTerm(e.target.value)} autoComplete="off" />
      <JsonView data={data} defaultExpandDepth={3} highlightPattern={pattern} aria-label="Deployments, matches highlighted" />
    </div>
  );
}
```

### Other Values
`data` can be any JSON value, such as a list.

```jsx
import { JsonView } from '@hyprsh/design';

export default function Example() {
  return <JsonView data={['iad1', 'fra1', 'sin1']} aria-label="Regions" />;
}
```
