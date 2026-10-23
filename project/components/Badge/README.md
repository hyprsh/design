# Badge

A short, static label for status, plan, environment or role that sits next to the thing it describes.

**You provide:** the text as `children`. Optional: `variant` (`gray`, `blue`, `purple`, `amber`, `red`, `pink`, `green`, `teal`, `inverted`; default `gray`), `contrast="low"` for the subtle tint (the older `variant="blue-subtle"` form also works), `size` (`sm` | `md` | `lg`, default `md`; `small` | `medium` | `large` also work), an `icon` node, and `title` for an ambiguous badge.

- Badges are labels, not controls. Never put an `onClick` on one: use Pill for a link that looks like a badge, or a Button.
- For a coloured dot without text, use StatusDot.
- Use the subtle tint in dense UI and a solid fill for the one status that matters most on screen. One badge per row; two side by side usually means the row needs another column.
- The hue carries the meaning: green healthy, red error, amber warning, blue informational or production, purple new or preview, gray neutral. The text must say the same thing, so don't add a check or a cross icon as well.
- Title Case, one word if possible and two at most: “Production”, “Read Only”. Use the exact term the API and logs use (“Canceled”, not “Cancelled”).
- Pair lifecycle badges such as “Beta” with a Tooltip that names the limit.
- Solid fills use the brand book's fill and text pairs, so every badge holds 4.5:1 in both themes.

## Examples

### Default
A short, static label next to the thing it describes.

```jsx
import { Badge } from '@hyprsh/design';

export default function Example() {
  return <Badge>Production</Badge>;
}
```

### Variants
The hue carries the meaning, and the text says the same thing.

```jsx
import { Badge } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="gray">Draft</Badge>
      <Badge variant="blue">Production</Badge>
      <Badge variant="green">Ready</Badge>
      <Badge variant="amber">Building</Badge>
      <Badge variant="red">Error</Badge>
      <Badge variant="purple">Preview</Badge>
      <Badge variant="teal">Beta</Badge>
      <Badge variant="pink">New</Badge>
      <Badge variant="inverted">Pro</Badge>
    </div>
  );
}
```

### Subtle Tint
Use `contrast="low"` in dense UI and keep a solid fill for the one status that matters most.

```jsx
import { Badge } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge variant="green" contrast="low">Ready</Badge>
      <Badge variant="amber" contrast="low">Building</Badge>
      <Badge variant="red" contrast="low">Error</Badge>
      <Badge variant="blue" contrast="low">Production</Badge>
      <Badge variant="purple" contrast="low">Preview</Badge>
    </div>
  );
}
```

### Sizes and Icons
Small, medium and large, with an optional leading icon.

```jsx
import { Badge } from '@hyprsh/design';
import { GitBranch, Lock } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
      <Badge icon={<GitBranch />} contrast="low">main</Badge>
      <Badge icon={<Lock />} variant="amber" contrast="low">Read Only</Badge>
    </div>
  );
}
```

### In a Row
A badge sits beside the name it describes, one per row.

```jsx
import { Badge } from '@hyprsh/design';

const deployments = [
  { name: 'marketing-site', status: 'Ready', variant: 'green' },
  { name: 'docs', status: 'Building', variant: 'amber' },
  { name: 'dashboard', status: 'Error', variant: 'red' },
];

export default function Example() {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {deployments.map((d) => (
        <li key={d.name} className="label-14" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {d.name}
          <Badge variant={d.variant} contrast="low">{d.status}</Badge>
        </li>
      ))}
    </ul>
  );
}
```
