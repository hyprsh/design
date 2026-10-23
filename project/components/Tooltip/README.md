# Tooltip

A small floating label that appears on hover and keyboard focus to add context to an element. The first tooltip waits about 150ms, its neighbours then show instantly, and Escape hides it. On touch screens a tap toggles it and a tap elsewhere closes it; the box flips to the other side and stays inside the screen.

**You provide:** `text` (a string or rich content, such as a KeyboardInput) and the trigger as `children` (usually an icon-only Button with its own `aria-label`; plain text is wrapped in a focusable span). Optional: `position` (`top` | `bottom` | `left` | `right`), `boxAlign` (`left` | `center` | `right`), `delay` (`false` for none, or ms), `type` (`success` | `error` | `warning` | `violet`), `tip={false}` to hide the arrow, `center={false}` to left-align the text, and `defaultOpen` (hyprsh) for docs.

- Explain why something exists or what limits it, not what it is: the visible label names the thing. Skip tooltips that repeat the label or describe the click.
- One sentence or fragment, sentence case, no full stop on a single fragment. For entity metadata use a ContextCard; for anything longer use a Drawer or a page.
- Lifecycle tooltips (Beta, Early Access) follow “Label: one-line meaning. Specific limit.”
- Don't wrap a labelled Input in a Tooltip: put help on a sibling icon button. Never put primary actions or essential information only in a tooltip, since touch users can't hover.

## Examples

### Icon Button
Explain why something exists or what limits it. The trigger keeps its own `aria-label`.

```jsx
import { Button, Tooltip } from '@hyprsh/design';
import { Copy } from 'lucide-react';

export default function Example() {
  return (
    <Tooltip text="Copies the production URL">
      <Button svgOnly aria-label="Copy Deployment URL"><Copy /></Button>
    </Tooltip>
  );
}
```

### Positions
`position` picks the side, and the box flips when there is no room.

```jsx
import { Button, Tooltip } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 72, flexWrap: 'wrap', alignItems: 'center', padding: '32px 64px' }}>
      <Tooltip text="Top" position="top"><Button>Top</Button></Tooltip>
      <Tooltip text="Bottom" position="bottom"><Button>Bottom</Button></Tooltip>
      <Tooltip text="Left" position="left"><Button>Left</Button></Tooltip>
      <Tooltip text="Right" position="right"><Button>Right</Button></Tooltip>
    </div>
  );
}
```

### Why It Is Disabled
A disabled button can’t take focus, so wrap it in a span that can.

```jsx
import { Button, Tooltip } from '@hyprsh/design';

export default function Example() {
  return (
    <Tooltip text="Add a domain before promoting to production">
      <span tabIndex={0} style={{ display: 'inline-flex' }}>
        <Button disabled>Promote to Production</Button>
      </span>
    </Tooltip>
  );
}
```

### Types and Rich Content
A type tints the box. `text` can hold a shortcut hint.

```jsx
import { Badge, Button, KeyboardInput, Tooltip } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', padding: '32px 0' }}>
      <Tooltip type="violet" text="Beta: runs on preview builds only. Limited to 3 regions.">
        <Badge variant="purple">Beta</Badge>
      </Tooltip>
      <Tooltip text={<>Open Command Menu <KeyboardInput meta>K</KeyboardInput></>} center={false}>
        <Button variant="tertiary">Search…</Button>
      </Tooltip>
    </div>
  );
}
```
