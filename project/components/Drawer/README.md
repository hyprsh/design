# Drawer

A bottom sheet for small viewports that shows a short, focused view over the page. It traps focus, locks page scroll and closes on a backdrop tap, Escape or a downward swipe.

**You provide:** `show` (`open` also works), `onDismiss` and the content as `children`, with a `DrawerTitle` (or an `aria-label`) to name the dialog. Optional: `height` (px number or CSS length; by default it fits the content up to 90% of the viewport), `verticalScroll={false}` to stop the panel scrolling inside its frame, and `inline` to render in place.

- Use a Drawer only on small viewports. On desktop render a Modal, or a Sheet for side context.
- Good for one short mobile task: a single form, a filter sheet, or a primary action paired with Cancel. Keep both above the fold; reach for `height` only when the default clips them.
- Never confirm destructive actions in a Drawer: it doesn't block hard enough. Use a Modal.
- The title names the view in Title Case (“Filter Logs”), not the page heading. One Verb + Noun primary button and a literal “Cancel”.
- Keep tap-outside and swipe-down dismissal unless the form has unsaved input.

## Examples

### Default
A bottom sheet opened from a button. Name it with a `DrawerTitle`.

```jsx
import { useState } from 'react';
import { Button, Drawer, DrawerTitle } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Deployment Details</Button>
      <Drawer show={open} onDismiss={() => setOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <DrawerTitle>Deployment Details</DrawerTitle>
            <p className="copy-14" style={{ margin: '4px 0 0', color: 'var(--gray-900)' }}>marketing-site on main, promoted to production.</p>
          </div>
          <Button variant="default" onClick={() => setOpen(false)}>Done</Button>
        </div>
      </Drawer>
    </>
  );
}
```

### With a Form
Keep the task short and focused.

```jsx
import { useState } from 'react';
import { Button, Drawer, DrawerTitle, Input } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Filter Logs</Button>
      <Drawer show={open} onDismiss={() => setOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <DrawerTitle>Filter Logs</DrawerTitle>
            <p className="copy-14" style={{ margin: '4px 0 0', color: 'var(--gray-900)' }}>Show requests from the last 24 hours that match a path.</p>
          </div>
          <Input label="Path" name="path" autoComplete="off" spellCheck={false} placeholder="/api/deployments…" />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button style={{ flex: 1 }} onClick={() => setOpen(false)}>Cancel</Button>
            <Button style={{ flex: 1 }} variant="default" onClick={() => setOpen(false)}>Apply Filter</Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}
```

### Fixed Height
`height` fixes the panel; by default it fits the content up to 90% of the viewport.

```jsx
import { useState } from 'react';
import { Button, Drawer, DrawerTitle } from '@hyprsh/design';

const events = ['Deployed main to production', 'Preview ready for docs', 'Domain verified', 'Build failed on feat/tab-bar', 'Branch merged', 'Preview ready for api'];

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Recent Activity</Button>
      <Drawer show={open} onDismiss={() => setOpen(false)} height={360}>
        <div style={{ padding: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}><DrawerTitle>Recent Activity</DrawerTitle></div>
          <ul className="copy-14" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {events.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </div>
      </Drawer>
    </>
  );
}
```

### More Item
On a phone the trigger is usually the More item of a TabBar; a Button stands in for it here. The Drawer holds the screens that don’t fit in the bar.

```jsx
import { useState } from 'react';
import { Button, Drawer, DrawerTitle } from '@hyprsh/design';

const screens = ['Domains', 'Usage', 'Settings', 'Team'];

export default function Example() {
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState('Domains');

  return (
    <>
      <Button onClick={() => setOpen(true)}>More…</Button>
      <span className="copy-14" style={{ marginLeft: 12 }}>Screen: {screen}</span>
      <Drawer show={open} onDismiss={() => setOpen(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}><DrawerTitle>More</DrawerTitle></div>
          {screens.map((name) => (
            <Button key={name} variant="tertiary" onClick={() => { setScreen(name); setOpen(false); }}>{name}</Button>
          ))}
        </div>
      </Drawer>
    </>
  );
}
```
