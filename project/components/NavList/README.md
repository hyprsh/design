# NavList

A vertical list of destinations for a sidebar or a settings page, with one row marked current.

**You provide:** an accessible name on `NavList` (`aria-label` or `aria-labelledby`, required) and `NavItem` children. Each `NavItem` takes a label as children, an optional `icon`, an optional `trailing` node (a number is shown as a count) with `trailingLabel` for its spoken text, `current`, and either `href` (renders a link) or `onClick` (renders a button). Group items under a heading with `NavList.Group` (or `NavGroup`) and its `title`.

- Use it for the destinations of a sidebar or settings page from `sm` up. At phone width use a TabBar instead. To switch sections inside one page use Tabs, not a NavList.
- Give each item `href` when it goes to a URL, so Cmd/Ctrl-click and middle-click work. Use `onClick` only when the app switches views in place.
- You decide which item is current: NavList doesn't read the URL. `current` sets `aria-current="page"`; pass `'step'`, `'location'` or `'true'` when another token fits.
- A numeric `trailing` joins the accessible name after a separator (“Downloads, 3”). For a StatusDot or other node, set `trailingLabel` (“Health, Failing”) so the state isn't shown by the dot alone.
- Long labels truncate with an ellipsis and never push the trailing node out of the row.
- Keep it flat. For a tree use FileTree; there is no collapsible rail or nested item.
- Rows are 34px tall, and `var(--touch-target)` under touch sizing.

## Examples

### Sidebar With Counts
Views with a trailing count, and the current one marked.

```jsx
import { NavList, NavItem } from '@hyprsh/design';
import { Inbox, Download, Archive } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ width: 240 }}>
      <NavList aria-label="Views">
        <NavItem href="/inbox" icon={<Inbox />} trailing={12} current>Inbox</NavItem>
        <NavItem href="/downloads" icon={<Download />} trailing={3}>Downloads</NavItem>
        <NavItem href="/archive" icon={<Archive />}>Archive</NavItem>
      </NavList>
    </div>
  );
}
```

### Settings Sections With Groups
Groups with visible headings that label their lists.

```jsx
import { NavList, NavItem } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: 240 }}>
      <NavList aria-label="Settings">
        <NavList.Group title="Account">
          <NavItem href="/settings/profile" current>Profile</NavItem>
          <NavItem href="/settings/security">Security</NavItem>
        </NavList.Group>
        <NavList.Group title="Project">
          <NavItem href="/settings/domains">Domains</NavItem>
          <NavItem href="/settings/environment-variables">Environment Variables</NavItem>
        </NavList.Group>
      </NavList>
    </div>
  );
}
```

### Status Trailing Node
A StatusDot as the trailing node, with text for assistive tech.

```jsx
import { NavList, NavItem, StatusDot } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: 240 }}>
      <NavList aria-label="Project">
        <NavItem href="/health" trailing={<StatusDot state="error" />} trailingLabel="Failing">Health</NavItem>
        <NavItem href="/deployments" trailing={<StatusDot state="ready" />} trailingLabel="Ready">Deployments</NavItem>
      </NavList>
    </div>
  );
}
```

### Controlled Current
The app keeps the current item in state and switches views with buttons.

```jsx
import { useState } from 'react';
import { NavList, NavItem } from '@hyprsh/design';

export default function Example() {
  const [view, setView] = useState('all');
  const views = [['all', 'All Deployments'], ['production', 'Production'], ['preview', 'Preview']];
  return (
    <div style={{ width: 240 }}>
      <NavList aria-label="Deployment views">
        {views.map(([id, label]) => (
          <NavItem key={id} current={view === id} onClick={() => setView(id)}>{label}</NavItem>
        ))}
      </NavList>
    </div>
  );
}
```
