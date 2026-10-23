# Entity

A row that represents one thing (a member, token, domain or integration), with a leading visual, a title and description, and controls on the right.

**You provide:** `left` (an Avatar, icon, Checkbox or Skeleton), children (usually `Entity.Content` with `title` and `description`, plus `fill` to take the free width), `right` (controls or meta text) and optionally `as` (`'div'`, `'li'` or `'button'`) with `onClick`. Wrap several rows in `Entity.List` (or `EntityList`), which draws the card and dividers and renders rows as list items.

- Keep the right side to one or two controls. For more, use a single menu button.
- Name buttons Verb + Noun in Title Case (Revoke Token, Remove Member), not just “Remove”.
- Give a row checkbox a label such as `aria-label="Select ci-bot"`.
- Use `as="button"` when the whole row opens something. It stays reachable by keyboard; when the row also has its own controls, those take focus instead and the stretched button is hidden from assistive tech.
- While loading, keep the row shape and put Skeletons in `left` and `Entity.Content`.

## Examples

### Default
A leading visual, a title and description, and meta text on the right. `Entity.List` draws the card and dividers.

```jsx
import { Avatar, Entity, EntityContent, EntityList } from '@hyprsh/design';

export default function Example() {
  return (
    <EntityList aria-label="Members">
      <Entity left={<Avatar title="Ada Lovelace" letter="AL" />} right="Joined Oct 3">
        <EntityContent title="Ada Lovelace" description="ada@example.dev" />
      </Entity>
      <Entity left={<Avatar title="Grace Hopper" letter="GH" />} right="Joined Oct 9">
        <EntityContent title="Grace Hopper" description="grace@example.dev" />
      </Entity>
    </EntityList>
  );
}
```

### With Controls
Put a control on the right, such as a small Button.

```jsx
import { Button, Entity, EntityContent, EntityList } from '@hyprsh/design';
import { KeyRound } from 'lucide-react';

const tokens = [
  { id: 'ci', name: 'ci-deploy', scope: 'Full access · Created Mar 2' },
  { id: 'pr', name: 'preview-bot', scope: 'Read only · Created Jan 18' },
];

export default function Example() {
  return (
    <EntityList aria-label="Access tokens">
      {tokens.map((t) => (
        <Entity key={t.id} left={<KeyRound />} right={<Button size="small" variant="secondary">Revoke Token</Button>}>
          <EntityContent title={t.name} description={t.scope} />
        </Entity>
      ))}
    </EntityList>
  );
}
```

### Selectable
A Checkbox on the left, with `fill` so the title takes the free width.

```jsx
import { useState } from 'react';
import { Checkbox, Entity, EntityContent, EntityList } from '@hyprsh/design';

const domains = ['hyprsh.dev', 'docs.hyprsh.dev', 'api.hyprsh.dev'];

export default function Example() {
  const [selected, setSelected] = useState(['docs.hyprsh.dev']);
  const toggle = (name) => setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));

  return (
    <EntityList aria-label="Domains">
      {domains.map((name) => (
        <Entity key={name} left={<Checkbox aria-label={`Select ${name}`} checked={selected.includes(name)} onChange={() => toggle(name)} />}>
          <EntityContent title={name} fill />
        </Entity>
      ))}
    </EntityList>
  );
}
```

### Clickable Row
`as="button"` with `onClick` makes the whole row a button.

```jsx
import { useState } from 'react';
import { Entity, EntityContent, EntityList } from '@hyprsh/design';
import { GitBranch } from 'lucide-react';

export default function Example() {
  const [picked, setPicked] = useState('main');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <EntityList aria-label="Branches">
        {['main', 'staging'].map((b) => (
          <Entity key={b} as="button" left={<GitBranch />} onClick={() => setPicked(b)}>
            <EntityContent title={b} description={b === 'main' ? 'Production branch' : 'Preview branch'} />
          </Entity>
        ))}
      </EntityList>
      <span className="copy-14" role="status">Selected {picked}.</span>
    </div>
  );
}
```

### Loading
Use Skeletons in the same slots so nothing shifts.

```jsx
import { Entity, EntityContent, EntityList, Skeleton } from '@hyprsh/design';

export default function Example() {
  return (
    <EntityList aria-label="Loading members">
      <Entity left={<Skeleton pill width={32} height={32} />}>
        <EntityContent title={<Skeleton width={120} height={14} />} description={<Skeleton width={180} height={14} />} />
      </Entity>
    </EntityList>
  );
}
```
