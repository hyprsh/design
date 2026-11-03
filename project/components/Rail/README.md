# Rail

The vertical strip of icon-only destinations at the edge of an app from `sm` up: TabBar's counterpart at wider widths, with the same items.

**You provide:** `label` (the name of the `<nav>`) and `Rail.Item` children, each with a `label` and an `icon`. Use `value` with `onChange` or `onValueChange` (controlled; both are called), or `defaultValue`. Optional: `showFrom` (`'sm'` by default, which hides the rail below 640px; `false` shows it at every width). `Rail.Item` is also exported as `RailItem` and `Rail.Spacer` as `RailSpacer`.

**Items:** `Rail.Item` takes the props of `TabBar.Item` and follows the same rules, so one array of item data can render a TabBar below `sm` and a Rail from `sm` up. An item with a `value` selects it. An item with only `onClick` is an action: pair it with `haspopup` when it opens a dialog. `href` renders a link. `current` takes the selection, and while any item has it no item is selected by `value`. The selected item carries `aria-current="page"`. Badges work as in TabBar: `badge` (`true` for a dot, a number for a count, “99+” above 99, nothing for 0, or a node), `badgeTone` and `badgeLabel`, which joins the accessible name.

**Labels:** an item shows its icon only. Its `label` is its accessible name and appears in a Tooltip on its right, on hover and on focus.

**Groups:** `Rail.Spacer` pushes the children after it to the bottom, giving a top group and a bottom group. A Rail accepts any children, such as a ThemeSwitcher in the bottom group.

- Use it for the main destinations of an app on a wide screen: the same ones as the TabBar below `sm`. Use a Nav list in a sidebar for a long list of destinations with text, and Tabs to switch sections inside a page.
- Keep labels to one short word in Title Case, since they appear only in the tooltip.
- The rail sits in the page flow at full height and is sticky, so your layout places it: put it first in a flex row beside the content. It uses the `background-200` app-chrome surface with a divider on its trailing edge.
- Every item is a Tab stop. Up/Down and Home/End move between the items only, and other children are reached by Tab.
- Every item is at least `--touch-target` in both directions.
- Don't use it for nested destinations or text labels: it doesn't expand.

## Examples

### App Navigation
A top group, a spacer and a bottom group. Pair it with a TabBar below `sm`.

```jsx
import { useState } from 'react';
import { Rail } from '@hyprsh/design';
import { Activity, Globe, Layers, Settings } from 'lucide-react';

export default function Example() {
  const [screen, setScreen] = useState('projects');

  return (
    <div style={{ display: 'flex', height: 280, border: '1px solid var(--gray-alpha-400)', borderRadius: 8, overflow: 'hidden' }}>
      <Rail label="Screens" showFrom={false} style={{ height: 'auto', position: 'static' }} value={screen} onValueChange={setScreen}>
        <Rail.Item value="projects" label="Projects" icon={<Layers />} />
        <Rail.Item value="domains" label="Domains" icon={<Globe />} />
        <Rail.Item value="activity" label="Activity" icon={<Activity />} />
        <Rail.Spacer />
        <Rail.Item value="settings" label="Settings" icon={<Settings />} />
      </Rail>
      <p className="heading-20" style={{ margin: 24, textTransform: 'capitalize' }}>{screen}</p>
    </div>
  );
}
```

### Badges
A count, a dot, or a tone for a count that is worse than news. `badgeLabel` reaches assistive tech.

```jsx
import { Rail } from '@hyprsh/design';
import { Activity, Inbox, Layers } from 'lucide-react';

export default function Example() {
  return (
    <Rail label="Screens" showFrom={false} style={{ height: 'auto', position: 'static', width: 64 }} defaultValue="inbox">
      <Rail.Item value="inbox" label="Inbox" icon={<Inbox />} badge={3} badgeLabel="3 need attention" />
      <Rail.Item value="projects" label="Projects" icon={<Layers />} badge badgeTone="warning" badgeLabel="Needs review" />
      <Rail.Item value="activity" label="Activity" icon={<Activity />} badge={2} badgeTone="error" badgeLabel="2 blocking" />
    </Rail>
  );
}
```

### Actions and Other Children
An item with only `onClick` is an action, and the rail takes other elements, such as a ThemeSwitcher in the bottom group.

```jsx
import { useState } from 'react';
import { Rail, ThemeSwitcher } from '@hyprsh/design';
import { Globe, Layers, Settings } from 'lucide-react';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: 240, border: '1px solid var(--gray-alpha-400)', borderRadius: 8, overflow: 'hidden' }}>
      <Rail label="Screens" showFrom={false} style={{ height: 'auto', position: 'static' }} defaultValue="projects">
        <Rail.Item value="projects" label="Projects" icon={<Layers />} />
        <Rail.Item value="domains" label="Domains" icon={<Globe />} />
        <Rail.Spacer />
        <ThemeSwitcher variant="cycle" storageKey={null} tooltipPosition="right" />
        <Rail.Item label="Settings" icon={<Settings />} haspopup onClick={() => setOpen(!open)} current={open} />
      </Rail>
      <p className="copy-14" style={{ margin: 24 }}>{open ? 'Settings are open.' : 'Press Settings.'}</p>
    </div>
  );
}
```
