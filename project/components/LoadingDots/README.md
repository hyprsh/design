# LoadingDots

Three softly pulsing dots for a short, indeterminate wait, on their own or after a word.

**You provide:** nothing required. Optional: `children` for the text before the dots (“Deploying”), `size` (`sm` 2px, `md` 3px, `lg` 4px, or a number), and `aria-label` for the announced text when there are no children (default “Loading”).

- Use it inline, in text or a button label, where a Spinner would feel heavy. For a known total use Progress; for whole regions waiting on data use Skeleton.
- The dots take the current text colour (gray-900 by default) and are hidden from screen readers. The wrapper is a polite live region, so the text is announced once.
- Under reduced motion the dots stop pulsing and stay half-visible.

## Examples

### Default
Three softly pulsing dots for a short wait.

```jsx
import { LoadingDots } from '@hyprsh/design';

export default function Example() {
  return <LoadingDots aria-label="Loading deployments" />;
}
```

### After a Word
Children are the text before the dots.

```jsx
import { LoadingDots } from '@hyprsh/design';

export default function Example() {
  return (
    <div className="copy-14" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <LoadingDots>Deploying</LoadingDots>
      <LoadingDots>Verifying Domain</LoadingDots>
    </div>
  );
}
```

### Sizes
Small, medium and large, or a number of pixels.

```jsx
import { LoadingDots } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <LoadingDots size="sm" aria-label="Loading, small" />
      <LoadingDots size="md" aria-label="Loading, medium" />
      <LoadingDots size="lg" aria-label="Loading, large" />
      <LoadingDots size={6} aria-label="Loading, 6 pixels" />
    </div>
  );
}
```

### While Saving
Swap it in while a request runs.

```jsx
import { useState } from 'react';
import { Button, LoadingDots } from '@hyprsh/design';

export default function Example() {
  const [saving, setSaving] = useState(false);

  function save() {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  }

  return (
    <div className="copy-14" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button onClick={save} disabled={saving}>Save Settings</Button>
      {saving ? <LoadingDots>Saving</LoadingDots> : null}
    </div>
  );
}
```
