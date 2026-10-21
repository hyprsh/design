# Gauge

A circular meter for one 0–100 value, such as a performance score or a cache hit rate.

**You provide:** `value` (0–100) and an `aria-label` naming what it measures. Optional: `size` (`tiny` | `small` | `medium` | `large`), `showValue` to print the number in the centre, `colors` (a threshold map such as `{ 0: 'var(--red-800)', 50: 'var(--green-700)' }`, or `{ primary, secondary }`), `arcPriority="equal"` for even gaps, `indeterminate` while the value is unknown, and `children` to put an icon in the centre.

- The default colours read as a score: red below 34, amber to 66, green from 67. Pass `colors` when higher isn't better.
- Show the number (`showValue`) or put it next to the gauge; the arc alone is colour and length only. `tiny` never prints a value, so pair it with text.
- For progress through a task with a known end, use Progress. For a deployment's state, use StatusDot.
- `indeterminate` is for a score that is still being computed, not for loading in general.
