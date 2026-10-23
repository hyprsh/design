# Logo

The hyprsh mark, a faceted delta starship, alone or locked up with the “hyprsh” wordmark.

**You provide:** nothing required. Optional: `variant` (`lockup` by default, `mark` or `wordmark`), `size` (the mark’s height in px, default 24; the wordmark scales with it), `tone` (`accent` by default, the solid blue mark; `mono` fills with `currentColor`; `nebula` still works as the old name of `accent`) and `aria-label` (default “hyprsh”).

- Use the lockup in headers, sign-in screens and docs. Use the mark alone where space is tight: the app bar at 20–24px, avatars and favicons.
- The mark is the accent blue. Don’t recolour it; use `mono` where blue doesn’t fit.
- Use `mono` on photos, on coloured fills and anywhere one colour is printed. It takes the text colour around it.
- Keep clear space of at least half the mark’s height on every side. Don’t stretch, rotate, outline or recolour the mark, and don’t set the wordmark in another typeface.
- The mark reads down to 16px. Below that, use the mono mark or leave it out.
- The source SVGs are in `brand/`: `logo-mark.svg`, `logo-mark-mono.svg`, `logo-lockup.svg`.

## Examples

### Lockup
The mark with the “hyprsh” wordmark.

```jsx
import { Logo } from '@hyprsh/design';

export default function Example() {
  return <Logo />;
}
```

### Variants
The lockup, the mark alone and the wordmark alone.

```jsx
import { Logo } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
      <Logo variant="lockup" />
      <Logo variant="mark" />
      <Logo variant="wordmark" />
    </div>
  );
}
```

### Sizes
`size` is the mark’s height in pixels. 16px is the smallest.

```jsx
import { Logo } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
      <Logo size={16} />
      <Logo size={24} />
      <Logo size={40} />
    </div>
  );
}
```

### Mono
`tone="mono"` fills with `currentColor`, for dense UI and one-colour print.

```jsx
import { Logo } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Logo tone="mono" />
      <span style={{ color: 'var(--gray-900)' }}><Logo tone="mono" variant="mark" size={32} /></span>
    </div>
  );
}
```
