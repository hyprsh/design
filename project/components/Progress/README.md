# Progress

A horizontal bar for work with a known total or a quota that fills up.

**You provide:** `value` (and `max`, default 100) plus a name: either `label`, which adds a row above the bar with the percentage, or `aria-label`. Optional: `type` (`default` | `secondary` | `success` | `warning` | `error`), `colors` to change the fill by threshold (`{ 0: 'var(--gray-1000)', 80: 'var(--amber-700)' }`), `stops` (`[{ value, tooltip, ariaLabel }]`) to mark limits along the bar, `width` and `height` (default 10px). The older `variant` names still work: `blue` is `success`, `amber` is `warning`, `red` is `error`.

**Segments:** instead of `value`, pass `segments` (`[{ value, tone, scale, tooltip, ariaLabel }]`) to split one bar into parts of a known total, plus `max` and a name. `tone` is `success` | `info` | `warning` | `error` | `neutral`. `scale` (`seq-1` … `seq-5` | `series`) colours a segment from the amount palette instead; set `tone` or `scale`, not both. Optional: `gap` (default off) draws a 2px gap in the page colour between segments. `value`, `colors` and `type` are not allowed with `segments`; if they arrive anyway, `segments` wins.

- Use it when the total is known. For an unknown duration use Spinner or LoadingDots; for a single score or percentage at a glance, use Gauge.
- Success is blue. Warning and error fills mean a quota is close to or past its limit, so say so in the label too (“Bandwidth – 92% used”), not only with colour.
- Stops mark plan limits or thresholds. Each one with a tooltip is a focusable marker, so keep them few.
- Under touch sizing a stop trigger keeps its drawn size and its hit area grows to at least 44px.
- `tone` follows StatusDot's colours: a `success` segment is green, a `info` one blue, `warning` amber, `error` red and `neutral` gray. `type` doesn't follow them: `type="success"` stays blue.
- Segments draw left to right in the order given, on the same track. Under `max`, the rest of the track is empty; over `max`, later segments are cut off. A segment above 0 is at least 2px wide, so a small share stays visible; the other segments give up the space, and the bar's width doesn't change.
- `tone` is a status and never a series colour: use it for outcomes (filled, missing, failed). Use `scale` for a breakdown of amounts (formats, regions, types).
- A segmented bar with no `tooltip` or `ariaLabel` on any segment is one image, named by `label` or `aria-label`, with no percentage: put the counts in the name (“21 of 40 filled, 2 downloading…”), because colour alone doesn't carry them. Segments aren't focusable or announced on their own; `stops` still draw on top and stay focusable.
- A segment with a `tooltip` or an `ariaLabel` is focusable and named by `ariaLabel`, else the tooltip text. Such a bar is a named group instead of an image. Its focusable segments share one Tab stop (←/→ move between them, Home/End jump to the ends, segments with neither are skipped) and show their tooltip on hover and focus. The segments' Tab stop comes before any stops.
- Update `value` as real work completes; don't animate a fake bar.

## Examples

### Default
A `label` adds a row above the bar with the percentage.

```jsx
import { Progress } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: 360, maxWidth: '100%' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 360, maxWidth: '100%' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 360, maxWidth: '100%' }}>
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
    <div style={{ width: 360, maxWidth: '100%' }}>
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

### Segmented
`segments` splits a known total into tones; the label carries the counts.

```jsx
import { Progress } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: 360, maxWidth: '100%' }}>
      <Progress
        label="21 of 40 filled, 2 downloading, 1 wanted, 1 long missing, 15 not counted"
        max={40}
        gap
        segments={[
          { value: 21, tone: 'success' },
          { value: 2, tone: 'info' },
          { value: 1, tone: 'warning' },
          { value: 1, tone: 'error' },
          { value: 15, tone: 'neutral' },
        ]}
      />
    </div>
  );
}
```

### Breakdown
`scale` colours segments from the amount palette, and a `tooltip` makes each one focusable.

```jsx
import { Progress } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: 360, maxWidth: '100%' }}>
      <Progress
        label="Library by Format"
        max={1084}
        gap
        segments={[
          { value: 412, scale: 'seq-1', tooltip: 'Remux: 412 Titles, 38 %' },
          { value: 356, scale: 'seq-3', tooltip: 'Web-DL: 356 Titles, 33 %' },
          { value: 316, scale: 'seq-5', tooltip: 'Encode: 316 Titles, 29 %' },
        ]}
      />
    </div>
  );
}
```
