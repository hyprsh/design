# Spinner

An indeterminate loading indicator: a ring of fading bars, gray-700 by default.

**You provide:** nothing required. Optional: `size` (`sm` 12px, `md` 16px by default, `lg` 20px, `xl` 24px, `2xl` 32px, `3xl` 40px, `4xl` 56px; a number of px still works), `label` (or `aria-label`), and a colour through `style` or `className`. With a label it becomes a `status` region with that name; without one it is decorative.

- Show it only after about 300ms, so fast responses don't flash. Pair it with text such as “Loading…” wherever there's room.
- Inside a Button it takes the button's text colour; use the Button's `loading` prop rather than placing one yourself.
- For content with a known shape, use Skeleton. For a known amount of progress, use Progress. Inline in text, LoadingDots is lighter.
- Under reduced motion the bars cycle at half speed.

## Examples

### Default
Decorative: pair it with visible text, or give it a `label`.

```jsx
import { Spinner } from '@hyprsh/design';

export default function Example() {
  return <Spinner label="Loading deployments" />;
}
```

### Sizes
From `sm` (12px) to `4xl` (56px).

```jsx
import { Spinner } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
      <Spinner size="2xl" />
      <Spinner size="3xl" />
      <Spinner size="4xl" />
    </div>
  );
}
```

### Colour
The ring follows `color`: set it with `style` or a class.

```jsx
import { Spinner } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner size="xl" />
      <Spinner size="xl" style={{ color: 'var(--gray-1000)' }} />
      <Spinner size="xl" style={{ color: 'var(--blue-700)' }} />
      <Spinner size="xl" style={{ color: 'var(--red-700)' }} />
    </div>
  );
}
```

### Beside a Label
A spinner beside text, for a status that ends in “…”.

```jsx
import { Spinner } from '@hyprsh/design';

export default function Example() {
  return (
    <div className="copy-14" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Spinner />
      <span>Deploying…</span>
    </div>
  );
}
```

### Loading a Section
Show it while data loads, then swap in the content.

```jsx
import { useEffect, useState } from 'react';
import { Spinner } from '@hyprsh/design';

export default function Example() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ minHeight: 48, display: 'flex', alignItems: 'center' }}>
      {ready ? <span className="copy-14">8 deployments in the last 7 days.</span> : <Spinner size="lg" label="Loading deployments" />}
    </div>
  );
}
```
