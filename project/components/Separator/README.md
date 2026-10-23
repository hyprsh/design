# Separator

A 1px divider between sections, horizontal or vertical.

**You provide:** `orientation` (`horizontal` by default, or `vertical`), `inset` for a stronger line that runs edge to edge inside a framed card, and `aria-hidden` (or `decorative`) when the line is only visual. The parent sets the spacing around it.

- Use it to split related groups of content: sections of a settings panel, a card header from its body, links in an inline nav.
- Prefer whitespace first. Add a separator only when spacing alone doesn't make the grouping clear.
- Mark it `aria-hidden` when it only decorates, such as under a card header. Keep the role when it divides sections a screen reader should hear as separate.
- A vertical separator needs a flex row with a height: it stretches to fill it.

## Examples

### Horizontal
A 1px divider between sections. The parent sets the spacing.

```jsx
import { Separator } from '@hyprsh/design';

export default function Example() {
  return (
    <div className="copy-14" style={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span>Deployments</span>
      <Separator />
      <span>Domains</span>
    </div>
  );
}
```

### Vertical
Between inline items, in a row with a fixed height.

```jsx
import { Separator } from '@hyprsh/design';

export default function Example() {
  return (
    <div className="label-14" style={{ display: 'flex', gap: 12, alignItems: 'center', height: 24 }}>
      <span>Overview</span>
      <Separator orientation="vertical" />
      <span>Usage</span>
      <Separator orientation="vertical" />
      <span>Settings</span>
    </div>
  );
}
```

### Inset in a Card
`inset` runs edge to edge inside a framed card with a stronger line.

```jsx
import { Separator } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ maxWidth: 320, boxShadow: 'var(--shadow-border)', borderRadius: 8 }}>
      <div className="copy-14" style={{ padding: 16 }}>marketing-site</div>
      <Separator inset />
      <div className="copy-13" style={{ padding: 16 }}>Deployed from main 2 hours ago.</div>
    </div>
  );
}
```

### Decorative
Mark a line that is only visual so assistive tech skips it.

```jsx
import { Separator } from '@hyprsh/design';

export default function Example() {
  return (
    <div className="copy-14" style={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <span>Production</span>
      <Separator decorative />
      <span>Preview</span>
    </div>
  );
}
```
