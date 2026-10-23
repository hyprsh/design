# Switch

A segmented control for choosing one of two or three views or modes; it behaves like a radio group, so arrow keys move the choice.

**You provide:** `SwitchControl` children (also `Switch.Control`), each with a `label` and a `value`, and `defaultChecked` on exactly one of them. Optional on `Switch`: `name` (generated if left out), `size` (`small` 32px, `medium` 36px by default, `large` 40px), `value` + `onChange(value)` or `defaultValue` to control it from the group, `disabled`, and `style={{ width: '100%' }}` to fill its container. Optional on a control: `icon` (shows the icon alone and keeps `label` for screen readers; `hideLabel={false}` shows the label beside it), `disabled`, `size`.

- Keep it to two or three options. For more, use Tabs or a Select; for a plain on/off setting, use Toggle.
- Labels are one or two Title Case words. Every control needs a `label`, even icon-only ones.
- Wrap icon-only controls in a Tooltip so sighted users get the name too.
- Use it to change what's shown right now (Source / Output, Grid / List), not to fill in a form that's saved later.
- The selected segment changes background and text weight colour, so it reads without colour alone.
- Under touch sizing every size is drawn 44px tall.

## Examples

### Default
Two or three views, with `defaultChecked` on exactly one.

```jsx
import { Switch, SwitchControl } from '@hyprsh/design';

export default function Example() {
  return (
    <Switch>
      <SwitchControl label="Logs" value="logs" defaultChecked />
      <SwitchControl label="Metrics" value="metrics" />
    </Switch>
  );
}
```

### Controlled
Hold the value in state and render the matching view.

```jsx
import { useState } from 'react';
import { Switch, SwitchControl } from '@hyprsh/design';

export default function Example() {
  const [range, setRange] = useState('7d');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <Switch name="range" value={range} onChange={setRange}>
        <SwitchControl label="24 Hours" value="24h" />
        <SwitchControl label="7 Days" value="7d" />
        <SwitchControl label="30 Days" value="30d" />
      </Switch>
      <span className="copy-14" role="status">Showing the last {range}.</span>
    </div>
  );
}
```

### Sizes
Small, medium and large match the control scale.

```jsx
import { Switch, SwitchControl } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <Switch size="small"><SwitchControl label="List" value="list" defaultChecked /><SwitchControl label="Grid" value="grid" /></Switch>
      <Switch size="medium"><SwitchControl label="List" value="list" defaultChecked /><SwitchControl label="Grid" value="grid" /></Switch>
      <Switch size="large"><SwitchControl label="List" value="list" defaultChecked /><SwitchControl label="Grid" value="grid" /></Switch>
    </div>
  );
}
```

### Icons
With `icon` a control shows the icon alone and keeps `label` for screen readers.

```jsx
import { Switch, SwitchControl } from '@hyprsh/design';
import { LayoutGrid, List } from 'lucide-react';

export default function Example() {
  return (
    <Switch name="layout">
      <SwitchControl label="List View" value="list" icon={<List />} defaultChecked />
      <SwitchControl label="Grid View" value="grid" icon={<LayoutGrid />} />
    </Switch>
  );
}
```

### Full Width and Disabled
`style={{ width: '100%' }}` fills the container. A disabled control is skipped.

```jsx
import { Switch, SwitchControl } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', width: '100%', maxWidth: 360 }}>
      <Switch name="mode" style={{ width: '100%' }}>
        <SwitchControl label="Production" value="production" defaultChecked />
        <SwitchControl label="Preview" value="preview" />
        <SwitchControl label="Development" value="development" disabled />
      </Switch>
      <Switch name="locked" disabled>
        <SwitchControl label="Auto" value="auto" defaultChecked />
        <SwitchControl label="Manual" value="manual" />
      </Switch>
    </div>
  );
}
```
