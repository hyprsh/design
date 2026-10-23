# TabBar

A floating pill tab bar for the main screens of an app at phone width. It follows the iOS 26 tab bar pattern, built from hyprsh's tokens (an opaque surface, no blur).

**You provide:** `label` (the name of the `<nav>`) and `TabBar.Item` children, each with a `label` and an `icon`. Use `value` with `onChange` or `onValueChange` (controlled; both are called), or `defaultValue`. Optional: `accessory` (`{ label, icon, onClick?, href? }`), `minimizeOnScroll` with `scrollRef`, and `hideFrom` (`'sm'` by default; `false` shows it at every width). `TabBar.Item` is also exported as `TabBarItem`.

**Items:** an item with a `value` selects it. An item with only `onClick` is an action, such as More opening a Drawer: pair it with `haspopup`. `href` renders a link. `current` takes the selection, for More while a screen that lives in More is open: while any item has it, no item is selected by `value`. The selected item carries `aria-current="page"`.

**Badges:** `badge={true}` is a dot, a number is a count (“99+” above 99, nothing for 0), and a node is rendered as given. Add `badgeLabel` (“3 need attention”) so the badge reaches assistive tech: it joins the item's accessible name. `badgeTone` (`'accent'` by default, `'error'` or `'warning'`) draws a dot or count in red or amber, for a count that is worse than news. A node badge ignores it. The tone is visual only and never changes the accessible name, so say it in `badgeLabel` (“2 blocking”, “1 warning”).

**Minimise on scroll:** with `minimizeOnScroll` the capsule shrinks to the selected item after the content scrolls down 24px. It expands on scrolling up, at the top, or on a tap (the tap doesn't navigate). It watches every scrolling element in the document, except horizontal scrolling and anything inside a dialog or sheet. That includes a layout that scrolls an inner container instead of the window. Pass `scrollRef` to watch only that one container.

- Use it for the 3–5 main destinations on a phone, with More for the rest. Use Tabs to switch sections inside a page.
- Keep labels to one short word in Title Case. They are always visible.
- The bar is fixed to the bottom and takes no layout space, so pad your scroll area with `--tab-bar-height`. It is `0px` when no visible TabBar is mounted (and from `sm` up while the bar is hidden), and it doesn't change when the bar is minimised:

  ```css
  .screen { overflow-y: auto; padding-bottom: var(--tab-bar-height); }
  ```
- Tab moves through every item, then the accessory. Left/Right and Home/End move between the items only.
- The accessory is for an action that isn't a screen, such as Search. It is an icon-only button, so its `label` is its accessible name.
- Every item and the accessory are at least `--touch-target` in both directions.
- Don't put a desktop navigation in it: from `sm` up use a rail or sidebar.
- TabBar has no inline or contained mode: it is always fixed to the viewport. The Examples sit it in a frame by passing `style={{ position: 'relative', inset: 'auto', padding: 0 }}` and `hideFrom={false}`. In an app, leave both off.

## Examples

### Phone Navigation
Three to five destinations, each with a short Title Case label and an icon.

```jsx
import { useState } from 'react';
import { TabBar } from '@hyprsh/design';
import { Activity, Globe, Layers } from 'lucide-react';

export default function Example() {
  const [screen, setScreen] = useState('projects');

  return (
    <div style={{ width: 375, maxWidth: '100%', border: '1px solid var(--gray-alpha-400)', borderRadius: 24, padding: '24px 0 8px', boxSizing: 'border-box' }}>
      <p className="heading-20" style={{ margin: '0 24px 24px', textTransform: 'capitalize' }}>{screen}</p>
      <TabBar label="Screens" hideFrom={false} style={{ position: 'relative', inset: 'auto', padding: 0 }} value={screen} onValueChange={setScreen}>
        <TabBar.Item value="projects" label="Projects" icon={<Layers />} />
        <TabBar.Item value="domains" label="Domains" icon={<Globe />} />
        <TabBar.Item value="activity" label="Activity" icon={<Activity />} />
      </TabBar>
    </div>
  );
}
```

### Badges and Accessory
A count, a dot, or a tone for a count that is worse than news. `badgeLabel` reaches assistive tech. The accessory is for an action that isn’t a screen.

```jsx
import { TabBar } from '@hyprsh/design';
import { Activity, Inbox, Layers, Search } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ width: 375, maxWidth: '100%', border: '1px solid var(--gray-alpha-400)', borderRadius: 24, padding: '24px 0 8px', boxSizing: 'border-box' }}>
      <TabBar
        label="Screens"
        hideFrom={false}
        style={{ position: 'relative', inset: 'auto', padding: 0 }}
        defaultValue="inbox"
        accessory={{ label: 'Search', icon: <Search /> }}
      >
        <TabBar.Item value="inbox" label="Inbox" icon={<Inbox />} badge={3} badgeLabel="3 need attention" />
        <TabBar.Item value="projects" label="Projects" icon={<Layers />} badge badgeTone="warning" badgeLabel="Needs review" />
        <TabBar.Item value="activity" label="Activity" icon={<Activity />} badge={2} badgeTone="error" badgeLabel="2 blocking" />
      </TabBar>
    </div>
  );
}
```

### More Item
An item with only `onClick` is an action. Mark it with `haspopup`, and give it `current` while a screen that lives in More is open.

```jsx
import { useState } from 'react';
import { TabBar } from '@hyprsh/design';
import { Ellipsis, Globe, Layers } from 'lucide-react';

export default function Example() {
  const [screen, setScreen] = useState('projects');

  return (
    <div style={{ width: 375, maxWidth: '100%', border: '1px solid var(--gray-alpha-400)', borderRadius: 24, padding: '24px 0 8px', boxSizing: 'border-box' }}>
      <TabBar label="Screens" hideFrom={false} style={{ position: 'relative', inset: 'auto', padding: 0 }} value={screen} onValueChange={setScreen}>
        <TabBar.Item value="projects" label="Projects" icon={<Layers />} />
        <TabBar.Item value="domains" label="Domains" icon={<Globe />} />
        <TabBar.Item label="More" icon={<Ellipsis />} haspopup onClick={() => setScreen('settings')} current={screen === 'settings'} />
      </TabBar>
    </div>
  );
}
```

### Minimise on Scroll
With `minimizeOnScroll` and a `scrollRef`, the bar shrinks to the selected item as the content scrolls down, and expands on scrolling up or a tap.

```jsx
import { useRef } from 'react';
import { TabBar } from '@hyprsh/design';
import { Activity, Globe, Layers } from 'lucide-react';

const events = ['Deployed main to production', 'Preview ready for docs', 'Domain verified', 'Build failed on feat/tab-bar', 'Branch merged', 'Preview ready for api'];

export default function Example() {
  const scroller = useRef(null);

  return (
    <div style={{ width: 375, maxWidth: '100%', border: '1px solid var(--gray-alpha-400)', borderRadius: 24, padding: '16px 0 8px', boxSizing: 'border-box' }}>
      <div ref={scroller} tabIndex={0} role="region" aria-label="Activity feed" className="copy-14" style={{ height: 96, overflowY: 'auto', padding: '0 24px' }}>
        {events.map((text) => <p key={text} style={{ margin: '0 0 24px' }}>{text}</p>)}
      </div>
      <TabBar
        label="Screens"
        hideFrom={false}
        style={{ position: 'relative', inset: 'auto', padding: '8px 0 0' }}
        minimizeOnScroll
        scrollRef={scroller}
        defaultValue="activity"
      >
        <TabBar.Item value="projects" label="Projects" icon={<Layers />} />
        <TabBar.Item value="domains" label="Domains" icon={<Globe />} />
        <TabBar.Item value="activity" label="Activity" icon={<Activity />} />
      </TabBar>
    </div>
  );
}
```
