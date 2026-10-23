# MiddleTruncate

Shortens text from the middle so both the start and the end stay visible, for URLs, branch names, paths and IDs.

**You provide:** `value`, the full text. Optional: `className` and `style`. Give it, or its parent, a width limit; it fills up to its content and shrinks below that.

- Use it where the end of the value matters: `hyprsh-web-git-feat-…-acme.hyprsh.app`, `src/…/page.tsx`. For prose, use an end ellipsis.
- It refits on resize and after web fonts load, keeping as many characters as fit and splitting them evenly around one “…”.
- Screen readers and copy always get the full value, and hovering a shortened value shows it as a tooltip.
- In a flex row, give its parent `min-width: 0` so it can shrink.

## Examples

### Default
Both the start and the end stay visible. Give it, or its parent, a width limit.

```jsx
import { MiddleTruncate } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: 240 }}>
      <MiddleTruncate value="https://marketing-site-4f2a9c1-platform-team.hyprsh.dev/api/health" />
    </div>
  );
}
```

### Branch Names and IDs
Useful wherever the end carries meaning.

```jsx
import { MiddleTruncate } from '@hyprsh/design';

export default function Example() {
  return (
    <div className="label-14-mono" style={{ width: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <MiddleTruncate value="feat/tab-bar-minimise-on-scroll-for-phone-width" />
      <MiddleTruncate value="dpl_8f2a91c4e7b3d5a6f0c2" />
    </div>
  );
}
```

### Resizing
It shortens as the container shrinks.

```jsx
import { useState } from 'react';
import { MiddleTruncate, Slider } from '@hyprsh/design';

export default function Example() {
  const [width, setWidth] = useState(260);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Slider label="Width" min={80} max={360} value={width} onValueChange={setWidth} />
      <div className="label-14" style={{ width }}>
        <MiddleTruncate value="/projects/marketing-site/deployments/dpl_8f2a91c4e7b3d5a6f0c2" />
      </div>
    </div>
  );
}
```
