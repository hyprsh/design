# Browser

A browser-window frame (window dots, back/forward/reload and an address bar) around a screenshot, demo or recording.

**You provide:** `address` (a full URL; the bar shows the host and path, and its button copies the URL) and `children` for the page, usually an image or video. It fills the width it's given.

- Use it as presentation chrome on landing pages, docs and changelog posts. Don't put live product UI inside it, because the frame says “this is a screenshot”.
- The frame follows the theme, so it sits quietly on light and dark pages. Keep a Browser and a Phone shown side by side on the same theme.
- Give the image or video inside real alt text that describes what's on screen, not “browser screenshot”. Fix the image's aspect ratio so the frame doesn't jump while it loads.
- The dots and the back/forward/reload icons are `aria-hidden` and can't be focused. The only control is the copy button, which says when the URL has been copied.
- Below 600px of width the navigation icons hide and the address bar takes the room.
- For very long URLs, the address truncates with an ellipsis and shows the full URL as its tooltip.

## Examples

These examples draw the page with plain elements, because a component can’t load an image or recording from the network. The frame fills the width it is given, so each one sits in a block wrapper.

### Default
A window frame around a page. `address` shows the host and path.

```jsx
import { Browser } from '@hyprsh/design';

function Bar({ w, h = 12, c = 'var(--gray-200)' }) {
  return <div style={{ height: h, width: w, borderRadius: 4, background: c }} />;
}

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <Browser address="https://hyprsh.dev/deployments">
        <div role="img" aria-label="Project overview with a deployment list" style={{ padding: 24, display: 'grid', gridTemplateColumns: '140px 1fr', gap: 24, height: 180, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Bar w="70%" h={16} c="var(--gray-300)" />
            <Bar w="90%" />
            <Bar w="60%" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Bar w="40%" h={16} c="var(--gray-300)" />
            <div style={{ flex: 1, borderRadius: 6, background: 'var(--background-100)', boxShadow: 'var(--shadow-border)' }} />
          </div>
        </div>
      </Browser>
    </div>
  );
}
```

### Live Content
The page can be real components. Here a deployment list sits inside the frame.

```jsx
import { Badge, Browser, Entity, EntityContent, EntityList } from '@hyprsh/design';
import { Rocket } from 'lucide-react';

const deployments = [
  { name: 'marketing-site', state: 'Ready', variant: 'green' },
  { name: 'docs', state: 'Building', variant: 'amber' },
];

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <Browser address="https://hyprsh.dev/deployments">
        <div style={{ padding: 16 }}>
          <EntityList aria-label="Deployments">
            {deployments.map((d) => (
              <Entity key={d.name} left={<Rocket />} right={<Badge variant={d.variant} contrast="low">{d.state}</Badge>}>
                <EntityContent title={d.name} description="From main" />
              </Entity>
            ))}
          </EntityList>
        </div>
      </Browser>
    </div>
  );
}
```

### Without an Address
Leave out `address` for an empty bar.

```jsx
import { Browser } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 560 }}>
      <Browser>
        <div className="copy-14" style={{ padding: 24 }}>A blank page.</div>
      </Browser>
    </div>
  );
}
```
