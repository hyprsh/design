# Gauge

A circular meter for one 0–100 value, such as a performance score or a cache hit rate.

**You provide:** `value` (0–100) and an `aria-label` naming what it measures. Optional: `size` (`tiny` | `small` | `medium` | `large`), `showValue` to print the number in the centre, `colors` (a threshold map such as `{ 0: 'var(--red-800)', 50: 'var(--green-700)' }`, or `{ primary, secondary }`), `arcPriority="equal"` for even gaps, `indeterminate` while the value is unknown, and `children` to put an icon in the centre.

- The default colours read as a score: red below 34, amber to 66, green from 67. Pass `colors` when higher isn't better.
- Show the number (`showValue`) or put it next to the gauge; the arc alone is colour and length only. `tiny` never prints a value, so pair it with text.
- For progress through a task with a known end, use Progress. For a deployment's state, use StatusDot.
- `indeterminate` is for a score that is still being computed, not for loading in general.

## Examples

### Default
A circular meter for one value from 0 to 100. Name what it measures.

```jsx
import { Gauge } from '@hyprsh/design';

export default function Example() {
  return <Gauge value={72} showValue aria-label="Cache hit rate" />;
}
```

### Sizes
Tiny, small, medium and large.

```jsx
import { Gauge } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <Gauge size="tiny" value={72} aria-label="Cache hit rate" />
      <Gauge size="small" value={72} aria-label="Cache hit rate" />
      <Gauge size="medium" value={72} showValue aria-label="Cache hit rate" />
      <Gauge size="large" value={72} showValue aria-label="Cache hit rate" />
    </div>
  );
}
```

### Thresholds
`colors` changes the arc as the value passes each key.

```jsx
import { Gauge } from '@hyprsh/design';

const colors = { 0: 'var(--red-800)', 50: 'var(--amber-700)', 90: 'var(--green-700)' };

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Gauge size="large" showValue colors={colors} value={32} aria-label="Performance score, low" />
      <Gauge size="large" showValue colors={colors} value={64} aria-label="Performance score, medium" />
      <Gauge size="large" showValue colors={colors} value={96} aria-label="Performance score, high" />
    </div>
  );
}
```

### Indeterminate and Icon
`indeterminate` while the value is unknown. Children put an icon in the centre.

```jsx
import { Gauge } from '@hyprsh/design';
import { Rocket } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Gauge size="large" indeterminate aria-label="Measuring performance" />
      <Gauge size="large" value={80} aria-label="Deployment progress"><Rocket /></Gauge>
    </div>
  );
}
```
