# Skeleton

A placeholder that matches the shape of the content it replaces, so the layout doesn't shift when the data arrives.

**You provide:** either a size (`width`, and `height`, default 24px) or the real content as `children`, which then sizes the placeholder while staying hidden. Pass `show={false}` to swap in the children. Optional: `pill` or `rounded` for fully round ends, `squared` for square corners, `animated={false}` for a static block, `button` when wrapping a Button, and `boxHeight` when the content's box is taller than its visible shape.

- Match the final content's size exactly. Wrapping the real content is the easiest way. Never show a generic block.
- For a table, use `loading` on Table, which draws skeleton rows in the table's own shape (see Table › Loading).
- Use it for content with a known shape. For a short wait with no shape, use Spinner or LoadingDots.
- Skeletons are decorative and hidden from screen readers; announce loading elsewhere if it takes long.
- The shimmer stops under reduced motion.

## Examples

### Default
A sized block that stands in for text or a box.

```jsx
import { Skeleton } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 320 }}>
      <Skeleton width="60%" height={20} />
      <Skeleton height={14} />
      <Skeleton height={14} width="80%" />
    </div>
  );
}
```

### Shapes
`pill` rounds the ends, `squared` removes the corners, and `animated={false}` leaves a static block.

```jsx
import { Skeleton } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <Skeleton pill width={40} height={40} />
      <Skeleton width={120} height={32} />
      <Skeleton squared width={120} height={32} />
      <Skeleton animated={false} width={120} height={32} />
    </div>
  );
}
```

### Wrapping Content
The real content sizes the placeholder, so nothing shifts when it arrives. `show={false}` swaps it in.

```jsx
import { useEffect, useState } from 'react';
import { Skeleton } from '@hyprsh/design';

export default function Example() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ maxWidth: 320 }}>
      <Skeleton show={loading}>
        <p className="heading-20" style={{ margin: 0 }}>marketing-site</p>
      </Skeleton>
      <Skeleton show={loading}>
        <p className="copy-14" style={{ margin: '4px 0 0' }}>Deployed from main 2 hours ago.</p>
      </Skeleton>
    </div>
  );
}
```

### Over a Button
`button` extends the placeholder past the button’s border ring.

```jsx
import { Button, Skeleton } from '@hyprsh/design';

export default function Example() {
  return (
    <Skeleton button>
      <Button variant="default">Deploy Project</Button>
    </Skeleton>
  );
}
```

### A Row
Match the shape of the final row: an avatar, two lines and a badge.

```jsx
import { Skeleton } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: '100%', maxWidth: 360 }}>
      <Skeleton pill width={40} height={40} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Skeleton width="50%" height={16} />
        <Skeleton width="80%" height={12} />
      </div>
      <Skeleton pill width={56} height={24} />
    </div>
  );
}
```
