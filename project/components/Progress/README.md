# Progress

A horizontal bar for work with a known total or a quota that fills up.

**You provide:** `value` (and `max`, default 100) plus a name: either `label`, which adds a row above the bar with the percentage, or `aria-label`. Optional: `type` (`default` | `secondary` | `success` | `warning` | `error`), `colors` to change the fill by threshold (`{ 0: 'var(--gray-1000)', 80: 'var(--amber-700)' }`), `stops` (`[{ value, tooltip, ariaLabel }]`) to mark limits along the bar, `width` and `height` (default 10px). The older `variant` names still work: `blue` is `success`, `amber` is `warning`, `red` is `error`.

- Use it when the total is known. For an unknown duration use Spinner or LoadingDots; for a single score or percentage at a glance, use Gauge.
- Success is blue. Warning and error fills mean a quota is close to or past its limit, so say so in the label too (“Bandwidth – 92% used”), not only with colour.
- Stops mark plan limits or thresholds. Each one with a tooltip is a focusable marker, so keep them few.
- Under touch sizing a stop trigger keeps its drawn size and its hit area grows to at least 44px.
- Update `value` as real work completes; don't animate a fake bar.

## Examples

### Default
A `label` adds a row above the bar with the percentage.

```jsx
import { Progress } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Progress label="Build Minutes" value={64} />
    </div>
  );
}
```

### Types
`type` tints the bar for the meaning of the state.

```jsx
import { Progress } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <Progress label="Default" type="default" value={40} />
      <Progress label="Secondary" type="secondary" value={40} />
      <Progress label="Success" type="success" value={40} />
      <Progress label="Warning" type="warning" value={40} />
      <Progress label="Error" type="error" value={40} />
    </div>
  );
}
```

### Thresholds
`colors` changes the fill as the value passes each key.

```jsx
import { useState } from 'react';
import { Button, Progress } from '@hyprsh/design';

export default function Example() {
  const [used, setUsed] = useState(70);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <Progress
        label="Bandwidth"
        value={used}
        colors={{ 0: 'var(--gray-1000)', 80: 'var(--amber-700)', 95: 'var(--red-700)' }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="small" onClick={() => setUsed((u) => Math.min(100, u + 10))}>Use More</Button>
        <Button size="small" variant="tertiary" onClick={() => setUsed(70)}>Reset</Button>
      </div>
    </div>
  );
}
```

### Stops and a Maximum
`max` sets the total, and `stops` mark limits along the bar.

```jsx
import { Progress } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Progress
        aria-label="Function invocations"
        value={620}
        max={1000}
        stops={[{ value: 500, tooltip: 'Free tier: 500 invocations', ariaLabel: 'Free tier limit' }]}
      />
    </div>
  );
}
```

### Height and Width
A thin bar with an `aria-label` when a row names it already.

```jsx
import { Progress } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <span className="label-14">api</span>
      <Progress aria-label="api usage" value={35} width={160} height={4} />
    </div>
  );
}
```
