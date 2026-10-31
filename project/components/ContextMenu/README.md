# ContextMenu

A menu that opens where the user right-clicks or long-presses an area, with actions for what is under the pointer.

**You provide:** a `ContextMenu` holding a `ContextMenuTrigger` (the area, any content) and a `ContextMenuContent` (`width`, `aria-label`) filled with `ContextMenuItem`s (`onClick`, `onSelect` + `value`, `href`, `disabled`, `type="error"`, `prefix`, `suffix`, `shortcut`). `MenuSection` and `MenuDivider` work inside it too. Optional: `disabled` on the trigger; `open`, `onOpenChange` and `anchorPoint` on the `ContextMenu` to control it (below); `defaultOpen` for docs.

- A context menu is a shortcut, never the only way in. Every action in it must also be reachable from a visible control, such as a DotsMenu on the same row.
- It opens at the pointer on right-click and after a half-second press on touch screens (moving the finger more than 10px cancels it, and the trigger suppresses the browser's own callout and text selection). The menu stays 8px inside the screen, and its items grow to 44px under touch sizing. From the keyboard, focus the trigger and press Shift+F10 or the Menu key; the first item takes focus.
- Controlled or not: without `open` the menu opens and closes itself and `onOpenChange(open)` only reports it. With `open`, the menu is open only while `open` is true, and its own gestures (right-click, long-press, Shift+F10, the Menu key, Escape, a click elsewhere, choosing an item, scrolling) call `onOpenChange` and leave the state to you. `defaultOpen` is ignored then.
- `anchorPoint` (`{ x, y }`, viewport pixels) places the menu at that point. Without it, a menu you open is placed at the point the built-in gesture just gave, or 8px in from the trigger's top-left corner. It flips to stay on screen either way. Use this to open the menu from your own gesture handling or from a button.
- Keep the items about what was clicked: “Open in New Tab”, “Copy Link”, “Rename File…”. Don't repeat the page's global actions.
- It closes on choosing an item, Escape, a click elsewhere or scrolling, and focus returns to the trigger.
- Items follow Menu's rules: Title Case Verb + Noun, destructive items last after a divider with `type="error"`.

## Examples

### Default
Right-click or long-press the area to open it.

```jsx
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@hyprsh/design';

export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="copy-14" style={{ padding: 32, border: '1px dashed var(--gray-alpha-400)', borderRadius: 8, textAlign: 'center' }}>
          Right-click this deployment row
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent aria-label="Deployment actions">
        <ContextMenuItem>Open Deployment</ContextMenuItem>
        <ContextMenuItem>Copy Deployment URL</ContextMenuItem>
        <ContextMenuItem>Redeploy</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

### Sections and Destructive Items
Group with `MenuSection`, and put destructive items last after a divider.

```jsx
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, MenuDivider, MenuSection } from '@hyprsh/design';
import { Copy, Trash2 } from 'lucide-react';

export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="copy-14" style={{ padding: 32, border: '1px dashed var(--gray-alpha-400)', borderRadius: 8, textAlign: 'center' }}>
          Right-click this domain
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent width={240} aria-label="Domain actions">
        <MenuSection title="Domain">
          <ContextMenuItem prefix={<Copy />} shortcut="⌘ C">Copy Domain</ContextMenuItem>
          <ContextMenuItem>Verify Domain</ContextMenuItem>
        </MenuSection>
        <MenuDivider />
        <ContextMenuItem type="error" prefix={<Trash2 />}>Remove Domain…</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

### Reporting the Choice
Run the choice in `onClick`.

```jsx
import { useState } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@hyprsh/design';

export default function Example() {
  const [last, setLast] = useState('Nothing yet');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="copy-14" style={{ padding: 32, border: '1px dashed var(--gray-alpha-400)', borderRadius: 8, textAlign: 'center' }}>
            Right-click this branch
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label="Branch actions">
          <ContextMenuItem onClick={() => setLast('Branch checked out')}>Check Out Branch</ContextMenuItem>
          <ContextMenuItem onClick={() => setLast('Branch merged')}>Merge Branch</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <span className="copy-13" role="status">Last action: {last}</span>
    </div>
  );
}
```

### Disabled
`disabled` on the trigger leaves the browser’s own menu.

```jsx
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@hyprsh/design';

export default function Example() {
  return (
    <ContextMenu>
      <ContextMenuTrigger disabled>
        <div className="copy-14" style={{ padding: 32, border: '1px dashed var(--gray-alpha-400)', borderRadius: 8, textAlign: 'center', color: 'var(--gray-700)' }}>
          Archived project, no actions
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent aria-label="Project actions">
        <ContextMenuItem>Restore Project</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

### Controlled
Own the state with `open` and `onOpenChange`; right-click asks to open, and you decide.

```jsx
import { useState } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <ContextMenu open={open} onOpenChange={setOpen}>
      <ContextMenuTrigger>
        <div className="copy-14" style={{ padding: 32, border: '1px dashed var(--gray-alpha-400)', borderRadius: 8, textAlign: 'center' }}>
          Right-click this deployment row
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent aria-label="Deployment actions">
        <ContextMenuItem>Open Deployment</ContextMenuItem>
        <ContextMenuItem>Copy Deployment URL</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
```

### Opened from a Button
Open it from a button elsewhere on the page, at the point you give it.

```jsx
import { useState } from 'react';
import { Button, ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button variant="default" onClick={() => setOpen(true)}>Open Menu</Button>
      <ContextMenu open={open} onOpenChange={setOpen} anchorPoint={{ x: 200, y: 120 }}>
        <ContextMenuTrigger>
          <div className="copy-14" style={{ padding: 32, border: '1px dashed var(--gray-alpha-400)', borderRadius: 8, textAlign: 'center' }}>
            Message from the build bot
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent aria-label="Message actions">
          <ContextMenuItem>Copy Message</ContextMenuItem>
          <ContextMenuItem>Pin Message</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
```
