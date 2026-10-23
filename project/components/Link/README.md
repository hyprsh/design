# Link

An inline text link in the design's link colour, underlined, with a focus ring.

**You provide:** the text as `children` and an `href`. Optional: `as="button"` for an action that reads as a link (“Show notices”), `disabled` for a link that can't be followed right now (it is greyed, takes no focus or clicks, and gets `aria-disabled`; say why nearby), and any anchor attributes such as `target` and `rel`. It takes a `ref`.

- Use a link to go somewhere and a button to do something. When a sentence points at an action rather than a page, use `as="button"` so it is a real `<button>` with Enter and Space, not an `<a>` without an `href`.
- Navigation uses an `<a>` with an `href`, so Cmd/Ctrl-click and middle-click work. Pass your router's navigation through `onClick` and keep the `href`.
- The label says where it goes or what it does: “Older ones are in the Log”, never “click here”. Keep it a few words inside the sentence.
- It inherits the surrounding font size and line height. For a standalone secondary destination use a Pill; for an action use a Button.
- A link that opens a new tab sets `target="_blank"` and `rel="noopener noreferrer"`, and says so in its text or label.

## Examples

### Default
An inline link in the link colour.

```jsx
import { Link } from '@hyprsh/design';

export default function Example() {
  return (
    <p className="copy-14" style={{ margin: 0 }}>
      Read how <Link href="#">environment variables</Link> reach your build.
    </p>
  );
}
```

### External
Open another site in a new tab with `target` and `rel`.

```jsx
import { Link } from '@hyprsh/design';

export default function Example() {
  return (
    <p className="copy-14" style={{ margin: 0 }}>
      Follow the <Link href="https://example.com/status" target="_blank" rel="noreferrer">status page</Link> for incidents.
    </p>
  );
}
```

### As a Button
`as="button"` is for an action that reads as a link.

```jsx
import { useState } from 'react';
import { Link } from '@hyprsh/design';

export default function Example() {
  const [shown, setShown] = useState(false);

  return (
    <div className="copy-14" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
      <Link as="button" onClick={() => setShown((s) => !s)}>{shown ? 'Hide Notices' : 'Show Notices'}</Link>
      {shown ? <span>Build minutes reset on Nov 1.</span> : null}
    </div>
  );
}
```

### Disabled
A disabled link isn’t actionable. Say why nearby.

```jsx
import { Link } from '@hyprsh/design';

export default function Example() {
  return (
    <p className="copy-14" style={{ margin: 0 }}>
      <Link href="#" disabled>View invoice</Link> is available after the first billing cycle.
    </p>
  );
}
```
