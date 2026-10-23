# Toggle

An on/off control for a single setting that takes effect immediately; it's a native checkbox with `role="switch"`, so the label toggles it too.

**You provide:** the label as `children` (or `aria-label`), and `checked` + `onChange(next)` or `defaultChecked`. Optional: `size` (`small` by default, or `medium`, `large`), `color` (`accent`, blue, by default; other hues fill the track only when the toggle is on, and an off or disabled toggle looks the same whatever the hue), `icon={{ checked, unchecked }}` for the thumb, `direction="switch-first"` to put the switch before the label (the label comes first by default), `labelCasing="normal"` to stop title-casing, and `disabled`.

- Name the “on” state with a short Title Case noun phrase (“Auto-Assign Domains”), not a question or a sentence.
- Apply the change right away and confirm it (a toast works). If it needs a Save button, use Checkbox instead.
- Use Checkbox for picking items in a list, and Switch (the segmented control) to choose between 2–3 views.
- Disable a toggle only when the change is impossible, and say why nearby.
- The thumb moves as well as changing colour, so state isn't shown by colour alone.

## Examples

### Default
A single setting that takes effect immediately.

```jsx
import { Toggle } from '@hyprsh/design';

export default function Example() {
  return <Toggle defaultChecked>Auto-Assign Domains</Toggle>;
}
```

### Controlled
Keep the state yourself and confirm the change nearby.

```jsx
import { useState } from 'react';
import { Toggle } from '@hyprsh/design';

export default function Example() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
      <Toggle checked={enabled} onChange={setEnabled}>Preview Deployments</Toggle>
      <span className="copy-14" role="status">
        {enabled ? 'Every pull request gets a preview URL.' : 'Pull requests are not deployed.'}
      </span>
    </div>
  );
}
```

### Sizes and Colors
Small is the default. A colour other than the accent fills the track only when the toggle is on; off, it looks like the default.

```jsx
import { Toggle } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
      <Toggle size="small" defaultChecked>Small</Toggle>
      <Toggle size="medium" defaultChecked>Medium</Toggle>
      <Toggle size="large" defaultChecked>Large</Toggle>
      <Toggle size="medium" color="purple" defaultChecked>Purple On</Toggle>
      <Toggle size="medium" color="purple">Purple Off</Toggle>
    </div>
  );
}
```

### Switch First
Put the switch before the label, as in a settings list.

```jsx
import { Toggle } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Toggle direction="switch-first" defaultChecked>Automatic Rollbacks</Toggle>
      <Toggle direction="switch-first">Skew Protection</Toggle>
      <Toggle direction="switch-first" disabled>Edge Caching</Toggle>
    </div>
  );
}
```
