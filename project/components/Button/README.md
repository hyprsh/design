# Button

Triggers an action such as submitting a form, starting a deploy or opening a dialog.

**You provide:** the label (`children`) and `onClick`. Optional: `variant` (`default` | `secondary` | `tertiary` | `error` | `warning`, default `secondary`; `primary` is the same as `default`), `size` (`tiny` 24px for icons | `small` 32px | `medium` 36px | `large` 40px), `shape` (`square` | `circle` | `rounded`), `shadow`, `prefix`/`suffix` nodes (a plain `<svg>` such as a Lucide component is sized to the button: 16px, 14px on `tiny`; `Icon` keeps its own `size`), `loading`, `disabled`, `svgOnly` (with an `aria-label`), `typeName` for the HTML type (`submit`), `width`, and `badge`/`badgeTone`/`badgeLabel` (see below). Use `ButtonLink` (or `href` on Button) for navigation with the same look. Other attributes pass through, and the ref reaches the element.

- Use Button for actions that change something (Deploy, Save, Delete) and ButtonLink for anything that changes the URL. When several related actions share a row, reach for Menu or SplitButton instead.
- One `default` (solid) button per view, for the thing the page is for. Use `secondary` for supporting actions, `tertiary` in toolbars and rows, and `error` only for confirmed destructive actions.
- Pass `loading` instead of swapping in your own spinner: the label stays, the button is busy and can't be pressed twice.
- Disable only when the action is impossible right now, and say why nearby or in a Tooltip.
- Labels are Title Case and name the result: “Deploy Project”, “Invite Member”, “Rotate Key”. Never “Submit”, “OK” or “Confirm”. A label that opens a follow-up ends with “…”.
- Icon-only buttons need `svgOnly` and an `aria-label` that names the action and its target (“Copy Deployment URL”, not “Copy”). Don't add an `aria-label` to a button that already has visible text.
- `shape="rounded"` with `shadow` is a marketing look; keep product UI square.
- `badge` pins a count or dot to the button's top-right corner, with the meaning and look it has on `TabBar.Item`: `true` is a dot, a number is a count (“99+” above 99, nothing for 0) and a node is rendered as given. `badgeTone` (`'accent'` by default, `'error'` or `'warning'`) recolours a dot or count and is visual only. `badgeLabel` (“3 need attention”) joins the accessible name, after the `aria-label` of an icon-only button; a count without one adds its number. Use it for a desktop rail that shows the count a phone `TabBar` shows.
- Under touch sizing `small` and `medium` buttons are 44px tall (icon-only ones 44px wide too), `large` stays 48px, and `tiny` keeps its drawn size with a 44px hit area.

## Examples

### Primary Action
One solid button per view, for the thing the page is for.

```jsx
import { Button } from '@hyprsh/design';

export default function Example() {
  return <Button variant="default">Deploy Project</Button>;
}
```

### Variants
Solid for the main action, secondary for supporting ones, tertiary in toolbars and rows, error and warning for destructive or risky actions.

```jsx
import { Button } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="default">Deploy Project</Button>
      <Button variant="secondary">View Logs</Button>
      <Button variant="tertiary">Copy Link</Button>
      <Button variant="warning">Rotate Key</Button>
      <Button variant="error">Delete Project</Button>
    </div>
  );
}
```

### Sizes
Tiny is for icons only; small, medium and large share the control scale with Input and Select.

```jsx
import { Button } from '@hyprsh/design';
import { Plus } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button size="tiny" svgOnly aria-label="Add Domain"><Plus /></Button>
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </div>
  );
}
```

### With Icons
Pass an icon as `prefix` or `suffix`. An icon-only button needs `svgOnly` and an `aria-label` that names the action and its target.

```jsx
import { Button } from '@hyprsh/design';
import { ArrowRight, Copy, GitBranch } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button prefix={<GitBranch />}>Create Branch</Button>
      <Button variant="default" suffix={<ArrowRight />}>Continue to Domains</Button>
      <Button svgOnly aria-label="Copy Deployment URL"><Copy /></Button>
    </div>
  );
}
```

### Loading and Disabled
`loading` keeps the label, shows a spinner and blocks a second press. Disable only when the action is impossible right now.

```jsx
import { useState } from 'react';
import { Button } from '@hyprsh/design';

export default function Example() {
  const [deploying, setDeploying] = useState(false);

  function deploy() {
    setDeploying(true);
    setTimeout(() => setDeploying(false), 2000);
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="default" loading={deploying} onClick={deploy}>
        {deploying ? 'Deploying…' : 'Deploy Project'}
      </Button>
      <Button disabled>Promote to Production</Button>
    </div>
  );
}
```

### With a Badge
A count or dot at the button's corner, as on a `TabBar` item. `badgeLabel` reaches assistive tech.

```jsx
import { Button } from '@hyprsh/design';
import { Inbox, Bell } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="tertiary" svgOnly aria-label="Inbox" badge={3} badgeLabel="3 need attention">
        <Inbox />
      </Button>
      <Button variant="tertiary" svgOnly aria-label="Alerts" badge badgeTone="error" badgeLabel="Blocking">
        <Bell />
      </Button>
    </div>
  );
}
```
