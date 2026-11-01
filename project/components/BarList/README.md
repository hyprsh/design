# BarList

Labelled horizontal bars, one row per item, for ranking amounts.

**You provide:** `items` (each with a `label`, a non-negative `value` and optionally an `href` and a `key`) and an accessible name (`aria-label` or `aria-labelledby`; BarList warns in development without one). Bars scale to `max`, or to the largest value. `valueFormatter` defaults to `Intl.NumberFormat`. `unit` (for example "minutes") is spoken after each value. `mono` sets labels in Geist Mono. `empty` shows when `items` is empty, and without it nothing renders.

- Use it for top-N rankings (projects, sources, routes). For change over time or several series, use a chart that has a legend.
- Items render in the order given: sort them before passing them in.
- A zero value draws no bar and a non-zero value is never under 2px. The value is always visible, so there is no tooltip.
- Each row reads "label, value unit" to assistive technology and the bar is hidden. An item with `href` is a link; other rows are plain text.
- Don't use it for negative values or as a progress indicator (use Progress).

## Examples

### Top Projects
Bars scale to the largest value.

```jsx
import { BarList } from '@hyprsh/design';

export default function Example() {
  return (
    <BarList
      aria-label="Top projects by deployments"
      items={[
        { label: 'Marketing Site', value: 1280 },
        { label: 'Docs', value: 940 },
        { label: 'Dashboard', value: 615 },
      ]}
    />
  );
}
```

### With Links
Rows with an `href` are links.

```jsx
import { BarList } from '@hyprsh/design';

export default function Example() {
  return (
    <BarList
      aria-label="Top routes"
      items={[
        { label: '/docs', value: 5200, href: '/docs' },
        { label: '/pricing', value: 3100, href: '/pricing' },
      ]}
    />
  );
}
```

### Unit And Mono
The unit is spoken after each value, and mono suits identifiers.

```jsx
import { BarList } from '@hyprsh/design';

export default function Example() {
  return (
    <BarList
      aria-label="Build minutes by service"
      unit="minutes"
      mono
      items={[
        { label: 'api-gateway', value: 318 },
        { label: 'edge-cache', value: 204 },
        { label: 'build-runner', value: 1 },
      ]}
    />
  );
}
```

### Empty State
Pass `empty` to say why there are no rows.

```jsx
import { BarList } from '@hyprsh/design';

export default function Example() {
  return (
    <BarList
      aria-label="Top sources"
      items={[]}
      empty={<p className="copy-14">No Data Yet</p>}
    />
  );
}
```
