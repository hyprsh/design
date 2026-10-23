# Slider

A track with one thumb for a value or two for a range, with optional number fields beside it for exact input.

**You provide:** `value` + `onValueChange` or `defaultValue` (a number, or `[start, end]` for a range), and `label` or `aria-label`. Optional: `min` (0), `max` (100), `step` (1), `showStartInput` / `showEndInput` for number fields, `onValueCommitted` for when a drag or edit finishes, `formatValue` for screen-reader text, `width` (216px), `name`, `disabled`.

- Use it when the rough position matters more than the exact number (volume, a percentage, a size range). For exact values, pair it with the number fields or use an Input.
- Pick a `step` that snaps to sensible values, and show the live value next to the track.
- Save on `onValueCommitted`, not on every move.
- Arrow keys step, Page Up/Down jump, Home/End go to the ends; the number fields accept typing and arrow keys too.

## Examples

### Default
A track with one thumb and a label.

```jsx
import { Slider } from '@hyprsh/design';

export default function Example() {
  return <Slider label="Function Memory" defaultValue={50} />;
}
```

### Controlled with a Number Field
`showStartInput` adds a field for an exact value.

```jsx
import { useState } from 'react';
import { Slider } from '@hyprsh/design';

export default function Example() {
  const [timeout, setTimeoutValue] = useState(30);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Slider label="Function Timeout (s)" min={1} max={300} step={1} showStartInput value={timeout} onValueChange={setTimeoutValue} />
      <span className="copy-13" role="status">Functions stop after {timeout} seconds.</span>
    </div>
  );
}
```

### Range
Two thumbs choose `[start, end]`.

```jsx
import { useState } from 'react';
import { Slider } from '@hyprsh/design';

export default function Example() {
  const [range, setRange] = useState([20, 80]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Slider label="Traffic Split (%)" showStartInput showEndInput value={range} onValueChange={setRange} />
      <span className="copy-13" role="status">{range[0]}% to {range[1]}%</span>
    </div>
  );
}
```

### Steps and Formatting
`step` snaps the value, and `formatValue` shapes the text a screen reader hears.

```jsx
import { Slider } from '@hyprsh/design';

export default function Example() {
  return (
    <Slider
      label="Build Cache Size"
      min={0}
      max={500}
      step={50}
      defaultValue={150}
      width={280}
      formatValue={(v) => `${v} MB`}
    />
  );
}
```

### When a Change Finishes
`onValueCommitted` fires when a drag or an edit ends. Use it to save.

```jsx
import { useState } from 'react';
import { Slider } from '@hyprsh/design';

export default function Example() {
  const [saved, setSaved] = useState(40);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Slider label="Concurrent Builds" min={1} max={100} defaultValue={40} onValueCommitted={(v) => setSaved(v)} />
      <span className="copy-13" role="status">Saved {saved}</span>
    </div>
  );
}
```
