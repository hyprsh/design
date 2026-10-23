# Tabs

Switches between views of the same object. Follows the WAI-ARIA tabs pattern: arrow keys move between tabs, and Home/End jump to the ends.

**You provide:** `tabs` (`[{ value, title, icon?, disabled?, tooltip?, content? }]`) and `aria-label`. Use `selected` with `setSelected` or `onChange` (controlled), or `defaultSelected`. Optional: `variant` (`primary` underlined tabs, or `secondary` compact pills) and `disabled` to disable every tab. When a tab has `content`, Tabs renders the panel; otherwise render it yourself from `selected`.

- Keep the selected tab in the URL (`?tab=logs`) so the view can be linked and restored.
- 2–7 tabs, with one or two words each in Title Case. Never nest tabs.
- Use `primary` for the sections of a page and `secondary` to switch a view inside a card, chart or toolbar. Use a Switch for settings that change data rather than the view.
- Give a disabled tab a `tooltip` that says why (“Available on Pro”), or leave the tab out.
- Use `disabled` for the whole set only while the content is loading or can't change.
- Under touch sizing `secondary` tabs are drawn 44px tall; `primary` tabs are already 48px.

## Examples

### Sections of a Page
Give each tab its `content` and Tabs renders the panel. Name the set with `aria-label`.

```jsx
import { Tabs } from '@hyprsh/design';

export default function Example() {
  return (
    <Tabs
      aria-label="Project sections"
      defaultSelected="deployments"
      tabs={[
        { value: 'deployments', title: 'Deployments', content: <p className="copy-14">8 deployments in the last 7 days.</p> },
        { value: 'domains', title: 'Domains', content: <p className="copy-14">3 domains are connected to this project.</p> },
        { value: 'settings', title: 'Settings', content: <p className="copy-14">Name, region and build settings.</p> },
      ]}
    />
  );
}
```

### Controlled
Keep the selected tab in state (or in the URL) and render the panel yourself.

```jsx
import { useState } from 'react';
import { Tabs } from '@hyprsh/design';

const tabs = [
  { value: 'build', title: 'Build Logs' },
  { value: 'runtime', title: 'Runtime Logs' },
  { value: 'edge', title: 'Edge Requests' },
];

export default function Example() {
  const [tab, setTab] = useState('build');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Tabs aria-label="Log source" tabs={tabs} selected={tab} onChange={setTab} />
      <p className="copy-14">Showing {tabs.find((t) => t.value === tab).title}.</p>
    </div>
  );
}
```

### Secondary with Icons
Compact pills switch a view inside a card or toolbar.

```jsx
import { useState } from 'react';
import { Tabs } from '@hyprsh/design';
import { Activity, Globe, Layers } from 'lucide-react';

export default function Example() {
  const [view, setView] = useState('traffic');

  return (
    <Tabs
      variant="secondary"
      aria-label="Chart view"
      selected={view}
      onChange={setView}
      tabs={[
        { value: 'traffic', title: 'Traffic', icon: <Activity /> },
        { value: 'regions', title: 'Regions', icon: <Globe /> },
        { value: 'routes', title: 'Routes', icon: <Layers /> },
      ]}
    />
  );
}
```

### Disabled Tab
Say why a tab is disabled in its `tooltip`.

```jsx
import { Tabs } from '@hyprsh/design';

export default function Example() {
  return (
    <Tabs
      aria-label="Team sections"
      defaultSelected="members"
      tabs={[
        { value: 'members', title: 'Members' },
        { value: 'billing', title: 'Billing' },
        { value: 'audit', title: 'Audit Log', disabled: true, tooltip: 'Available on Enterprise' },
      ]}
    />
  );
}
```
