# Pill

A link styled like a Badge: a light, rounded way to point somewhere that doesn't need the weight of a button.

**You provide:** the label as `children` and an `href`. Optional: `size` (`sm` | `md` | `lg`, default `md`; `small` | `medium` | `large` also work), an `icon` node before the label, and any anchor attributes such as `target`. Without `href`, an `onClick` renders a `<button>`. For a toggle in a filter row, pass `pressed` with `onPressedChange(pressed)`, or `defaultPressed` to let the pill keep its own state; a pressed pill is drawn in the pressed style and reports it with `aria-pressed`.

**Toggle chip:** `pressed` with `onPressedChange(next)` (or `defaultPressed`) makes the pill a `<button aria-pressed>` for filters, where several chips can be on at once. A pressed chip gets a darker ring, a light tint and a leading check (unless you pass an `icon`), so the state doesn't rely on colour. Use it instead of a `Button variant="primary"` for “on”, which breaks the one-primary-per-view rule. For a single choice among a few, use Tabs or a Radio group.

- Use a Pill for secondary destinations: a changelog entry, a filter shortcut, a “Join the Discussion” link. Use a Button for actions that change something.
- Keep the label to one to three words in Title Case, and make it name the destination.
- Badge is for static labels; never make a Badge clickable when a Pill fits.
- The small size draws at 20px but keeps a 24px hit area. Under touch sizing every size keeps its drawn size and the hit area grows to at least 44px.

## Examples

### Default
A link styled like a Badge.

```jsx
import { Pill } from '@hyprsh/design';

export default function Example() {
  return <Pill href="#">View Changelog</Pill>;
}
```

### Sizes and Icons
Small, medium and large, with an optional leading icon.

```jsx
import { Pill } from '@hyprsh/design';
import { ExternalLink, GitBranch } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Pill href="#" size="sm">Small</Pill>
      <Pill href="#" size="md">Medium</Pill>
      <Pill href="#" size="lg">Large</Pill>
      <Pill href="#" icon={<GitBranch />}>main</Pill>
      <Pill href="https://example.com/status" target="_blank" rel="noreferrer" icon={<ExternalLink />}>Status Page</Pill>
    </div>
  );
}
```

### As a Button
Without `href`, an `onClick` renders a `<button>`.

```jsx
import { useState } from 'react';
import { Pill } from '@hyprsh/design';

export default function Example() {
  const [clicks, setClicks] = useState(0);

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Pill onClick={() => setClicks((c) => c + 1)}>Refresh</Pill>
      <span className="copy-13" role="status">Refreshed {clicks} {clicks === 1 ? 'time' : 'times'}</span>
    </div>
  );
}
```

### Pressed Filters
`pressed` and `onPressedChange` turn a pill into a toggle, for a filter row.

```jsx
import { useState } from 'react';
import { Pill } from '@hyprsh/design';

export default function Example() {
  const [on, setOn] = useState(['Production']);
  const toggle = (name) => (pressed) => setOn((s) => (pressed ? [...s, name] : s.filter((x) => x !== name)));

  return (
    <div role="group" aria-label="Environment filters" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {['Production', 'Preview', 'Development'].map((name) => (
        <Pill key={name} pressed={on.includes(name)} onPressedChange={toggle(name)}>{name}</Pill>
      ))}
    </div>
  );
}
```
