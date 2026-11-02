# Entity

A row that represents one thing (a member, token, domain or integration), with a leading visual, a title and description, and controls on the right.

**You provide:** `left` (an Avatar, icon, Checkbox or Skeleton), children (usually `Entity.Content` with `title` and `description`, plus `fill` to take the free width), `right` (controls or meta text) and optionally `as` (`'div'`, `'li'` or `'button'`) with `onClick`, `current` for a keyboard cursor, and `detail` to make the row expandable. Wrap several rows in `Entity.List` (or `EntityList`), which draws the card and dividers and renders rows as list items.

- Keep the right side to one or two controls. For more, use a single menu button.
- Name buttons Verb + Noun in Title Case (Revoke Token, Remove Member), not just “Remove”.
- Give a row checkbox a label such as `aria-label="Select ci-bot"`.
- Use `as="button"` when the whole row opens something. It stays reachable by keyboard; when the row also has its own controls, those take focus instead and the stretched button is hidden from assistive tech.
- **Current rows:** `current` sets `aria-current="true"` and draws the same tint and 2px marker at the row's start as `current` on `TableRow` (see Table's “Selected and current rows”), so the state isn't shown by colour alone. Use it for the row that holds the keyboard cursor of a j/k list, in or out of `Entity.List`, with any `as`. You move the cursor and focus yourself.
- **Expandable rows:** pass `detail` and the row's `left`, content and `right` become one disclosure button (`aria-expanded`, `aria-controls`, named by the left and content text) that opens the detail under the row, inside the same list item. Control it with `expanded`/`onExpandedChange`, or start it with `defaultExpanded`. The detail is out of sight and out of the Tab order while collapsed, and opens with a short fade and slide that reduced motion removes. The button is the whole row, so `left` and `right` hold content only, such as an icon or a timestamp; put controls (buttons, links, inputs) in the detail. `current` still marks the row, not its detail. Several rows can be open at once; for one at a time, control `expanded` yourself. `as="button"` is ignored.
- While loading, keep the row shape and put Skeletons in `left` and `Entity.Content`.

## Examples

### Default
A leading visual, a title and description, and meta text on the right. `Entity.List` draws the card and dividers.

```jsx
import { Avatar, Entity, EntityContent, EntityList } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <EntityList aria-label="Members">
        <Entity left={<Avatar title="Ada Lovelace" letter="AL" />} right="Joined Oct 3">
          <EntityContent title="Ada Lovelace" description="ada@example.dev" />
        </Entity>
        <Entity left={<Avatar title="Grace Hopper" letter="GH" />} right="Joined Oct 9">
          <EntityContent title="Grace Hopper" description="grace@example.dev" />
        </Entity>
      </EntityList>
    </div>
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
    <div style={{ width: '100%', maxWidth: 480 }}>
      <EntityList aria-label="Access tokens">
        {tokens.map((t) => (
          <Entity key={t.id} left={<KeyRound />} right={<Button size="small" variant="secondary">Revoke Token</Button>}>
            <EntityContent title={t.name} description={t.scope} fill />
          </Entity>
        ))}
      </EntityList>
    </div>
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
    <div style={{ width: '100%', maxWidth: 420 }}>
      <EntityList aria-label="Domains">
        {domains.map((name) => (
          <Entity key={name} left={<Checkbox aria-label={`Select ${name}`} checked={selected.includes(name)} onChange={() => toggle(name)} />}>
            <EntityContent title={name} fill />
          </Entity>
        ))}
      </EntityList>
    </div>
  );
}
```

### Current Row
`current` marks the keyboard cursor of a j/k list with the same tint and marker as a current table row. Click the list, then press j or k.

```jsx
import { useState } from 'react';
import { Entity, EntityContent, EntityList } from '@hyprsh/design';

const domains = ['hyprsh.dev', 'docs.hyprsh.dev', 'api.hyprsh.dev'];

export default function Example() {
  const [cursor, setCursor] = useState(0);
  const onKeyDown = (e) => {
    if (e.key === 'j') setCursor((i) => Math.min(i + 1, domains.length - 1));
    if (e.key === 'k') setCursor((i) => Math.max(i - 1, 0));
  };

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div tabIndex={0} onKeyDown={onKeyDown} aria-label="Domains, press j or k to move" role="group">
        <EntityList aria-label="Domains">
          {domains.map((name, i) => (
            <Entity key={name} current={i === cursor}>
              <EntityContent title={name} fill />
            </Entity>
          ))}
        </EntityList>
      </div>
    </div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 420 }}>
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

### Expandable Row
`detail` makes the whole row a disclosure button. The first row starts open, and the right side holds a timestamp, not a control.

```jsx
import { Entity, EntityContent, EntityList } from '@hyprsh/design';
import { Rocket } from 'lucide-react';

const deployments = [
  { id: 'a1', name: 'Production Deploy', note: 'main · 3 files changed', time: '2m ago', log: 'Build completed in 41s. 12 routes, 3 functions.' },
  { id: 'b2', name: 'Preview Deploy', note: 'feat/billing · 9 files changed', time: '1h ago', log: 'Build completed in 38s. 12 routes, 2 functions.' },
  { id: 'c3', name: 'Preview Deploy', note: 'fix/redirects · 1 file changed', time: 'Yesterday', log: 'Build failed at step 3 of 5: type check.' },
];

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <EntityList aria-label="Deployments">
        {deployments.map((d, i) => (
          <Entity key={d.id} left={<Rocket />} right={d.time} defaultExpanded={i === 0} detail={d.log}>
            <EntityContent title={d.name} description={d.note} fill />
          </Entity>
        ))}
      </EntityList>
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
    <div style={{ width: '100%', maxWidth: 420 }}>
      <EntityList aria-label="Loading members">
        <Entity left={<Skeleton pill width={32} height={32} />}>
          <EntityContent title={<Skeleton width={120} height={14} />} description={<Skeleton width={180} height={14} />} />
        </Entity>
      </EntityList>
    </div>
  );
}
```
