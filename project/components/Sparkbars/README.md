# Sparkbars

A compact row of per-run bars, where each bar's height is a value and its colour is the run's outcome.

**You provide:** `runs` (`[{ value, tone, label }]`, oldest first) and `aria-label`. `tone` is `success` | `info` | `warning` | `error` | `neutral`. Optional: `max` (the value that fills the box; default the largest value) and `height` (the box in px, default 24).

- Use it for a job's history or the last status of each job in a list. For one total split by outcome use Progress with `segments`; for amounts over time use a chart.
- Tones mean outcomes and are coloured exactly as Progress segments and StatusDot colour them. Never use a tone as a plain series colour.
- Bars are 6px wide with 2px gaps, bottom-aligned and rounded at the top. A bar is never under 4px, so a zero or skipped run still shows. A value above `max` fills the box.
- Colour is not the only signal: the row's name ends with a count per tone (“Rebuild search index: 27 success, 2 warning, 1 error”), and every run's `label` should say its outcome (“Run 28 – Failed”).
- Hovering a bar, or moving to it with the keyboard, keeps it solid, dims the others to 55% and shows its `label` in a tooltip. On touch a tap does the same.
- The row is one Tab stop. ←/→ move between runs, Home and End jump to the ends, and the focus ring wraps the row.
- No axes, gridlines or legend, and runs aren't clickable. Show a legend next to it if the tones need explaining.

## Examples

### Job History
Thirty runs, oldest first.

```jsx
import { Sparkbars } from '@hyprsh/design';

const tones = ['success', 'success', 'success', 'warning', 'success', 'success', 'error', 'success', 'success', 'info'];
const runs = Array.from({ length: 30 }, (_, i) => {
  const tone = tones[i % tones.length];
  return { value: tone === 'error' ? 4 : 20 + ((i * 7) % 40), tone, label: `Run ${i + 1} – ${tone === 'error' ? 'Failed' : tone === 'warning' ? 'Slow' : 'Passed'}` };
});

export default function Example() {
  return <Sparkbars runs={runs} aria-label="Rebuild Search Index" />;
}
```

### In A List Of Jobs
Each job shows its last runs next to its name.

```jsx
import { Sparkbars, StatusDot } from '@hyprsh/design';

const jobs = [
  { name: 'Build Preview', status: 'success', runs: [12, 14, 13, 30, 12, 15, 14, 13] },
  { name: 'Deploy Production', status: 'error', runs: [40, 42, 38, 5, 5, 41, 39, 6] },
  { name: 'Purge Cache', status: 'neutral', runs: [0, 0, 3, 0, 2, 0, 0, 1] },
];
const tone = (job, value, i) => (job.status === 'error' && value < 10 ? 'error' : value === 0 ? 'neutral' : 'success');

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {jobs.map((job) => (
        <div key={job.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <StatusDot state={job.status}>{job.name}</StatusDot>
          <Sparkbars
            aria-label={`${job.name} history`}
            runs={job.runs.map((value, i) => ({ value, tone: tone(job, value, i), label: `Run ${i + 1}` }))}
          />
        </div>
      ))}
    </div>
  );
}
```

### Custom Height
A taller box, scaled to a fixed `max`.

```jsx
import { Sparkbars } from '@hyprsh/design';

export default function Example() {
  const runs = [30, 45, 60, 20, 80, 100, 55, 70].map((value, i) => ({
    value,
    tone: value === 20 ? 'warning' : 'info',
    label: `Run ${i + 1} – ${value}s`,
  }));
  return <Sparkbars runs={runs} max={120} height={48} aria-label="Build Duration" />;
}
```
