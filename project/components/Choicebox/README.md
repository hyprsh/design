# Choicebox

A group of large tiles with a title and description, for choices that need explaining (plans, regions, runtimes); it's a fieldset of native radios or checkboxes.

**You provide:** a `label` naming the group (hidden unless `showLabel`), and `ChoiceboxGroupItem` children (also `Choicebox.Item`), each with `title`, `value` and an optional `description`. Use `value` + `onChange(value)` or `defaultValue`. Optional: `type="checkbox"` to allow several (the value becomes an array; `radio` is the default), `direction="row"` to put tiles side by side (stacked by default), `disabled` on the group or on a tile, and children on a tile for extra content shown only while it's selected.

- Keep it to four to six tiles. For longer lists, use a Select or Radio-style list.
- The whole tile is the target; the corner indicator shows radio (round) or checkbox (square) behaviour.
- If a tile is disabled, say why (the `tooltip` text, or a hint nearby).
- Selected tiles change border, background, text colour and indicator, so the state never rests on colour alone.
- Radio groups move with arrow keys; checkbox tiles toggle with Space.

## Examples

### Default
Tiles for choices that need explaining. The `label` names the group.

```jsx
import { Choicebox, ChoiceboxGroupItem } from '@hyprsh/design';

export default function Example() {
  return (
    <Choicebox label="Runtime" defaultValue="node" style={{ maxWidth: 420 }}>
      <ChoiceboxGroupItem value="node" title="Node.js" description="Full Node APIs. Best for most functions." />
      <ChoiceboxGroupItem value="edge" title="Edge" description="Starts instantly, with a smaller API." />
    </Choicebox>
  );
}
```

### Controlled
Keep the value in state and use it.

```jsx
import { useState } from 'react';
import { Choicebox, ChoiceboxGroupItem } from '@hyprsh/design';

export default function Example() {
  const [plan, setPlan] = useState('pro');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
      <Choicebox label="Plan" showLabel value={plan} onChange={setPlan}>
        <ChoiceboxGroupItem value="hobby" title="Hobby" description="For personal projects." />
        <ChoiceboxGroupItem value="pro" title="Pro" description="For teams shipping to production." />
      </Choicebox>
      <span className="copy-14" role="status">Selected {plan}.</span>
    </div>
  );
}
```

### Row Direction
`direction="row"` puts the tiles side by side, sharing the width of the group. They stack again when the group is narrow.

```jsx
import { Choicebox, ChoiceboxGroupItem } from '@hyprsh/design';

export default function Example() {
  return (
    <Choicebox label="Region" direction="row" defaultValue="iad1" style={{ width: '100%' }}>
      <ChoiceboxGroupItem value="iad1" title="iad1" description="Washington, D.C." />
      <ChoiceboxGroupItem value="fra1" title="fra1" description="Frankfurt" />
      <ChoiceboxGroupItem value="sin1" title="sin1" description="Singapore" />
    </Choicebox>
  );
}
```

### Several Choices
`type="checkbox"` allows more than one, and the value becomes an array.

```jsx
import { useState } from 'react';
import { Choicebox, ChoiceboxGroupItem } from '@hyprsh/design';

export default function Example() {
  const [events, setEvents] = useState(['deploy']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
      <Choicebox label="Notify me about" showLabel type="checkbox" value={events} onChange={setEvents}>
        <ChoiceboxGroupItem value="deploy" title="Deployments" description="When a deployment is ready or fails." />
        <ChoiceboxGroupItem value="domain" title="Domains" description="When a domain needs attention." />
      </Choicebox>
      <span className="copy-14" role="status">{events.length} selected</span>
    </div>
  );
}
```

### Disabled Tile
Disable a tile, and say why in its description.

```jsx
import { Choicebox, ChoiceboxGroupItem } from '@hyprsh/design';

export default function Example() {
  return (
    <Choicebox label="Build machine" defaultValue="standard" style={{ maxWidth: 420 }}>
      <ChoiceboxGroupItem value="standard" title="Standard" description="4 vCPU, 8 GB." />
      <ChoiceboxGroupItem value="turbo" title="Turbo" description="30 vCPU, 60 GB. Available on Enterprise." disabled />
    </Choicebox>
  );
}
```
