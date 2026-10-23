# Collapse

A heading that shows and hides the content under it, alone or in a group as an accordion.

**You provide:** `title` and the content as `children`. Optional: `defaultExpanded`, or `expanded` with `onChange`; `size="small"`; `id`; `headingLevel` (default 3). `variant="inline"` is a light disclosure with no border: a chevron before a 14px label, the content indented under it, for “Show files” inside a list or an inline “Details”. It has no heading by default, since it isn't a section; pass `headingLevel` if it is one. Wrap several in `Collapse.Group` (also exported as `CollapseGroup`) and add `multiple` to let more than one stay open.

- Use it for FAQs, settings with rarely used details and long reference pages. If people need most of the content, show it instead.
- In a group without `multiple`, opening one item closes the others and the open item can't be closed, so one answer is always visible. Use `multiple` when people compare items.
- Titles are real headings with a button inside, so the page outline and screen-reader heading navigation still work. Set `headingLevel` to fit the page.
- Closed content stays in the page as `hidden="until-found"`, so the browser's find-in-page opens the item that matches.
- Inline disclosures are for supporting detail the row doesn't need to show. Make the label name what opens (“Show files”, “Details”) and keep it the same when open.
- `size="small"` suits sidebars and cards; the default 24px title suits page sections.
- The content fades in; the height changes at once, without a sliding animation.

## Examples

### Default
A heading that shows and hides the content under it.

```jsx
import { Collapse } from '@hyprsh/design';

export default function Example() {
  return (
    <Collapse title="Build Settings">
      <p className="copy-14" style={{ margin: 0 }}>Framework preset, build command and output directory.</p>
    </Collapse>
  );
}
```

### Controlled
Keep the state yourself and react to it.

```jsx
import { useState } from 'react';
import { Collapse } from '@hyprsh/design';

export default function Example() {
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Collapse title="Environment Variables" expanded={expanded} onChange={setExpanded}>
        <p className="copy-14" style={{ margin: 0 }}>3 variables for Production.</p>
      </Collapse>
      <span className="copy-13" role="status">{expanded ? 'Expanded' : 'Collapsed'}</span>
    </div>
  );
}
```

### Accordion Group
A group keeps one open at a time. `multiple` lets more than one stay open.

```jsx
import { Collapse } from '@hyprsh/design';

export default function Example() {
  return (
    <Collapse.Group>
      <Collapse title="How Are Builds Billed?" defaultExpanded>
        <p className="copy-14" style={{ margin: 0 }}>Builds use build minutes, shared across the team.</p>
      </Collapse>
      <Collapse title="Can I Use My Own Domain?">
        <p className="copy-14" style={{ margin: 0 }}>Yes. Add it in Project Settings, then verify it.</p>
      </Collapse>
      <Collapse title="Where Do Functions Run?">
        <p className="copy-14" style={{ margin: 0 }}>In the region you choose, or at the edge.</p>
      </Collapse>
    </Collapse.Group>
  );
}
```

### Small
`size="small"` for a dense page.

```jsx
import { Collapse } from '@hyprsh/design';

export default function Example() {
  return (
    <Collapse size="small" title="Advanced Options">
      <p className="copy-14" style={{ margin: 0 }}>Root directory and ignored build step.</p>
    </Collapse>
  );
}
```

### Inline
`variant="inline"` is a light disclosure with no border, for “Show Files” inside a list.

```jsx
import { Collapse } from '@hyprsh/design';

export default function Example() {
  return (
    <Collapse variant="inline" title="Show Files">
      <ul className="copy-14" style={{ margin: 0, paddingLeft: 20 }}>
        <li>index.html</li>
        <li>assets/app.js</li>
      </ul>
    </Collapse>
  );
}
```
