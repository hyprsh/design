# RelativeTimeCard

A relative timestamp (“2m ago”, “5h ago”, “Yesterday”) whose hover card shows how long ago it was and the exact date and time in UTC and in the viewer's time zone, formatted with `Intl`.

**You provide:** `date` (Unix ms, a `Date` or an ISO string). Optional: `side` (default `top`), `align`, `locale`, `children` to replace the default `<time>` trigger, and `defaultOpen` (hyprsh).

- Use it wherever a recent timestamp appears in scannable surfaces: table cells, entity rows, deploy lists and activity feeds. For a fixed date in body prose older than a week, write the date (“Mar 14, 2026”).
- Pass the raw timestamp. Don't pre-format it and don't add “ago” after it: the trigger already reads “2m ago”.
- Use `children` only for states the formatter can't describe (“Just now”, “Pending”, “Queued”) or for a custom trigger.
- Add a leading label when the row is ambiguous (“Last deploy 2m ago”). The card already shows UTC and local time, so don't repeat them elsewhere in the row.
- On touch screens a tap on the timestamp opens the card and a tap elsewhere closes it.

## Examples

### Default
A relative time. Hover or focus it for the exact date and time.

```jsx
import { RelativeTimeCard } from '@hyprsh/design';

export default function Example() {
  return <RelativeTimeCard date={Date.now() - 5 * 60 * 1000} />;
}
```

### In a Row
It sits beside what it dates.

```jsx
import { RelativeTimeCard } from '@hyprsh/design';

const hour = 60 * 60 * 1000;

export default function Example() {
  return (
    <ul className="copy-14" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <li style={{ display: 'flex', gap: 8 }}>Deployed to production <RelativeTimeCard date={Date.now() - 2 * hour} /></li>
      <li style={{ display: 'flex', gap: 8 }}>Domain verified <RelativeTimeCard date={Date.now() - 26 * hour} /></li>
    </ul>
  );
}
```

### Other Date Types
`date` can be a `Date` or an ISO string.

```jsx
import { RelativeTimeCard } from '@hyprsh/design';

export default function Example() {
  return (
    <div className="copy-14" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      <RelativeTimeCard date={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)} />
      <RelativeTimeCard date="2026-09-01T12:00:00Z" />
    </div>
  );
}
```

### Side and Locale
`side` places the card, and `locale` formats the date.

```jsx
import { RelativeTimeCard } from '@hyprsh/design';

export default function Example() {
  return (
    <div className="copy-14" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', padding: '8px 0 96px' }}>
      <RelativeTimeCard date={Date.now() - 90 * 60 * 1000} side="bottom" />
      <RelativeTimeCard date={Date.now() - 90 * 60 * 1000} side="bottom" locale="de-DE" />
    </div>
  );
}
```
