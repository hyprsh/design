# Progress

A horizontal bar for work with a known total or a quota that fills up.

**You provide:** `value` (and `max`, default 100) plus a name: either `label`, which adds a row above the bar with the percentage, or `aria-label`. Optional: `type` (`default` | `secondary` | `success` | `warning` | `error`), `colors` to change the fill by threshold (`{ 0: 'var(--gray-1000)', 80: 'var(--amber-700)' }`), `stops` (`[{ value, tooltip, ariaLabel }]`) to mark limits along the bar, `width` and `height` (default 10px). The older `variant` names still work: `blue` is `success`, `amber` is `warning`, `red` is `error`.

- Use it when the total is known. For an unknown duration use Spinner or LoadingDots; for a single score or percentage at a glance, use Gauge.
- Success is blue. Warning and error fills mean a quota is close to or past its limit, so say so in the label too (“Bandwidth – 92% used”), not only with colour.
- Stops mark plan limits or thresholds. Each one with a tooltip is a focusable marker, so keep them few.
- Update `value` as real work completes; don't animate a fake bar.
