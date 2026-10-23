# Icon

An icon from the Lucide set (ISC licence, 2,100+ icons), drawn at 16px with a 1.5px stroke in `currentColor`.

**You provide:** `name`, a Lucide name in kebab case (`git-branch`, `circle-check`, `external-link`; browse them at lucide.dev). Optional: `size` (default 16), `strokeWidth` (visual px, default 1.5), `color`, and `label` when the icon carries meaning on its own. `Icon.names` lists every available name.

- Lucide is the only icon set used here.
- Sizes are 16 in UI, 14 in small controls and badges, and 20–24 for empty states. Keep the stroke at 1.5px.
- Decorative by default (`aria-hidden`). Pass `label` only when there's no visible text. Icon-only buttons label the button, not the icon.
- Never mix in icons from another set, and no emoji.

## Examples

### Default
A Lucide icon by its kebab-case name, drawn at 16px.

```jsx
import { Icon } from '@hyprsh/design';

export default function Example() {
  return <Icon name="git-branch" />;
}
```

### Sizes and Stroke
`size` is in pixels, and `strokeWidth` stays constant across sizes.

```jsx
import { Icon } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <Icon name="rocket" size={16} />
      <Icon name="rocket" size={20} />
      <Icon name="rocket" size={24} />
      <Icon name="rocket" size={24} strokeWidth={1} />
      <Icon name="rocket" size={24} strokeWidth={2} />
    </div>
  );
}
```

### Colour
Icons use `currentColor`. Set `color` or the text colour of a parent.

```jsx
import { Icon } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Icon name="circle-check" size={20} color="var(--green-700)" />
      <Icon name="triangle-alert" size={20} color="var(--amber-700)" />
      <Icon name="circle-x" size={20} color="var(--red-700)" />
    </div>
  );
}
```

### Meaning on Its Own
Give a `label` when the icon carries meaning without text.

```jsx
import { Icon } from '@hyprsh/design';

export default function Example() {
  return (
    <div className="copy-14" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Icon name="lock" label="Private" />
      <Icon name="globe" />
      <span>marketing-site</span>
    </div>
  );
}
```

### A Component Instead of a Name
Pass `icon` to draw an icon component, such as one from lucide-react.

```jsx
import { Icon } from '@hyprsh/design';
import { GitBranch } from 'lucide-react';

export default function Example() {
  return <Icon icon={GitBranch} size={24} />;
}
```
