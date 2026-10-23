# Menu

A button that opens a list of actions, with typeahead and full keyboard support (the WAI-ARIA menu-button pattern).

**You provide:** a `MenuContainer` holding a `MenuButton` (any Button props, plus `showChevron` or `type="unstyled"` for a custom trigger such as an avatar) and a `Menu` (`width`). Fill the menu with `MenuItem` (`onClick`, `href`, `disabled`, `description`, `title`, `type="error"`, `prefix`, `suffix`, `shortcut`), `MenuLink` (`href`), `MenuItemLocked`, `MenuSection` (`title`) and `MenuDivider`. `MenuContainer` takes `position` (`bottom-start` by default; also `bottom-end`, `top-*`, `left-*`, `right-*`), and `open`/`defaultOpen`/`onOpenChange`. The older one-piece form still works: `<Menu label="Actions" items={[{ label, onSelect, shortcut, prefix, disabled, danger } | { separator: true }]} align="end" />`.

- Use Menu for a visible trigger that opens actions on one resource. Use ContextMenu for right-click, CommandMenu for global ⌘&nbsp;K commands, SplitButton when one action is the clear default, and Select to pick a value.
- Keep it to about 10 items; group longer lists with `MenuSection` (Title Case, one or two words) or move rare actions to a settings page.
- It opens on click, never on hover. The list floats above the page, flips side when there's no room and stays 8px inside the screen, so it works on phones; it is never wider than the screen and long labels end in “…”. Under touch sizing items are 44px tall. It closes on choosing an item, Escape or a click outside, and focus goes back to the trigger.
- Arrow keys, Home and End move between items; typing a letter jumps to the next item that starts with it, so keep the visible label first.
- Items are Title Case Verb + Noun (“Rename Project”, “Duplicate Deployment”). End with “…” only when the item opens a dialog.
- Put destructive items last, after a divider, as `type="error"` with a full label (“Delete Project”, never just “Delete”), and confirm them.
- Use `MenuItemLocked` for actions the user lacks permission for, so the lock explains why it's inert.

**Hints on items:** `description` adds a second line under the label (linked to the item with `aria-describedby`, so a screen reader reads it after the label), and `title` sets the native tooltip. Use a description for the reason an item is disabled: “No file to delete”, “Nothing here is Wanted”. Typeahead matches the label only.

**Disabled items and the keyboard:** a disabled item is `aria-disabled` and never runs on click, Enter or Space. A disabled item with a `description` still takes focus from the arrow keys, Home, End and typeahead, so keyboard users can read why (WAI-ARIA allows focusable disabled menu items); a disabled item without one is skipped, as before. There is no separate prop: add the description. When the menu opens, focus goes to the first (or last) enabled item.

**Keys stay inside:** the open list stops the keys it handles itself (arrows, Home, End, Enter, Space, Escape, Tab, and plain letters for typeahead) from bubbling out of the portal, through the React tree and to the document. A page's own j/k list or Escape-closes-the-pane handler does not react while the menu is open; Escape closes the menu only. Keys pressed on the trigger button are not stopped.

## Examples

### Default
A button that opens a short list of actions.

```jsx
import { Menu, MenuButton, MenuContainer, MenuItem } from '@hyprsh/design';

export default function Example() {
  return (
    <MenuContainer>
      <MenuButton variant="secondary" showChevron>Actions</MenuButton>
      <Menu>
        <MenuItem>Rename Project</MenuItem>
        <MenuItem>Duplicate Deployment</MenuItem>
        <MenuItem>Transfer Project…</MenuItem>
      </Menu>
    </MenuContainer>
  );
}
```

### Sections, Shortcuts and Destructive Items
Group longer lists with sections. Destructive items go last, after a divider, with a full label.

```jsx
import { Menu, MenuButton, MenuContainer, MenuDivider, MenuItem, MenuSection } from '@hyprsh/design';
import { Copy, GitBranch, Trash2 } from 'lucide-react';

export default function Example() {
  return (
    <MenuContainer>
      <MenuButton variant="secondary" showChevron>Deployment</MenuButton>
      <Menu width={240}>
        <MenuSection title="Share">
          <MenuItem prefix={<Copy />} shortcut="⌘ C">Copy Deployment URL</MenuItem>
          <MenuItem prefix={<GitBranch />}>View Branch</MenuItem>
        </MenuSection>
        <MenuDivider />
        <MenuItem type="error" prefix={<Trash2 />}>Delete Deployment…</MenuItem>
      </Menu>
    </MenuContainer>
  );
}
```

### Descriptions and Locked Items
A description says why an item is disabled. A locked item shows the permission is missing.

```jsx
import { Menu, MenuButton, MenuContainer, MenuItem, MenuItemLocked } from '@hyprsh/design';

export default function Example() {
  return (
    <MenuContainer>
      <MenuButton variant="secondary" showChevron>Domain</MenuButton>
      <Menu width={260}>
        <MenuItem>Verify Domain</MenuItem>
        <MenuItem disabled description="No certificate to renew">Renew Certificate</MenuItem>
        <MenuItemLocked>Remove Domain</MenuItemLocked>
      </Menu>
    </MenuContainer>
  );
}
```

### Choosing and Reporting
Run the choice in `onClick`. Here the last action is shown beside the trigger, and the menu opens toward the end.

```jsx
import { useState } from 'react';
import { Menu, MenuButton, MenuContainer, MenuItem } from '@hyprsh/design';

export default function Example() {
  const [last, setLast] = useState('Nothing yet');

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <MenuContainer position="bottom-start">
        <MenuButton variant="secondary" showChevron>Redeploy</MenuButton>
        <Menu>
          <MenuItem onClick={() => setLast('Redeployed with cache')}>Redeploy with Cache</MenuItem>
          <MenuItem onClick={() => setLast('Redeployed without cache')}>Redeploy without Cache</MenuItem>
        </Menu>
      </MenuContainer>
      <span className="copy-14" role="status">Last action: {last}</span>
    </div>
  );
}
```

### Icon Trigger
An icon-only trigger needs `svgOnly` and an `aria-label`.

```jsx
import { Menu, MenuButton, MenuContainer, MenuItem } from '@hyprsh/design';
import { Ellipsis } from 'lucide-react';

export default function Example() {
  return (
    <MenuContainer position="bottom-end">
      <MenuButton variant="tertiary" svgOnly aria-label="Project Actions"><Ellipsis /></MenuButton>
      <Menu>
        <MenuItem>Rename Project</MenuItem>
        <MenuItem>Archive Project…</MenuItem>
      </Menu>
    </MenuContainer>
  );
}
```
