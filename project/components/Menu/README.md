# Menu

A button that opens a list of actions, with typeahead and full keyboard support (the WAI-ARIA menu-button pattern).

**You provide:** a `MenuContainer` holding a `MenuButton` (any Button props, plus `showChevron` or `type="unstyled"` for a custom trigger such as an avatar) and a `Menu` (`width`). Fill the menu with `MenuItem` (`onClick`, `href`, `checked`, `role`, `disabled`, `description`, `title`, `type="error"`, `prefix`, `suffix`, `shortcut`), `MenuLink` (`href`), `MenuItemLocked`, `MenuSection` (`title`), `MenuDivider` and `MenuSub` (see Submenus). `MenuContainer` takes `position` (`bottom-start` by default; also `bottom-end`, `top-*`, `left-*`, `right-*`), and `open`/`defaultOpen`/`onOpenChange`. The older one-piece form still works: `<Menu label="Actions" items={[{ label, onSelect, shortcut, prefix, disabled, danger, checked, role } | { separator: true }]} align="end" />`.

- Use Menu for a visible trigger that opens actions on one resource. Use ContextMenu for right-click, CommandMenu for global ⌘&nbsp;K commands, SplitButton when one action is the clear default, and Select to pick a value.
- Keep it to about 10 items; group longer lists with `MenuSection` (Title Case, one or two words) or move rare actions to a settings page.
- It opens on click, never on hover. The list floats above the page, flips side when there's no room and stays 8px inside the screen, so it works on phones; it is never wider than the screen and long labels end in “…”. Under touch sizing items are 44px tall. It closes on choosing an item, Escape or a click outside, and focus goes back to the trigger.
- Arrow keys, Home and End move between items; typing a letter jumps to the next item that starts with it, so keep the visible label first.
- Items are Title Case Verb + Noun (“Rename Project”, “Duplicate Deployment”). End with “…” only when the item opens a dialog.
- Put destructive items last, after a divider, as `type="error"` with a full label (“Delete Project”, never just “Delete”), and confirm them.
- Use `MenuItemLocked` for actions the user lacks permission for, so the lock explains why it's inert.

**Hints on items:** `description` adds a second line under the label (linked to the item with `aria-describedby`, so a screen reader reads it after the label), and `title` sets the native tooltip. Use a description for the reason an item is disabled: “No file to delete”, “Nothing here is Wanted”. Typeahead matches the label only.

**Disabled items and the keyboard:** a disabled item is `aria-disabled` and never runs on click, Enter or Space. A disabled item with a `description` still takes focus from the arrow keys, Home, End and typeahead, so keyboard users can read why (WAI-ARIA allows focusable disabled menu items); a disabled item without one is skipped, as before. There is no separate prop: add the description. When the menu opens, focus goes to the first (or last) enabled item.

**Checked items:** `checked` gives an item a state. `<MenuItem checked={on}>` is a `menuitemcheckbox` and `<MenuItem role="radio" checked={on}>` a `menuitemradio`, both with `aria-checked`; without `checked` the item is a plain `menuitem` and `role` is ignored. A checked item draws a checkmark at the start, an unchecked one (`checked={false}`) leaves the same space so labels line up, and `prefix` follows the checkmark. The mark is decorative: screen readers get the state from `aria-checked`. The menu doesn't track the value. You pass `checked` and update it from `onClick` or `onSelect`. Group a radio set in a `MenuSection`. Choosing a radio item closes the menu like any item; choosing a checkbox item runs its handlers and leaves the menu open with focus on it, so several can be toggled. Checked items take part in arrow keys, Home, End and typeahead like any other item. Links can't be checked: `checked` and `role` are ignored on an item with `href` and on `MenuLink`, and the types reject them. Use Select to pick a value from a form field.

**Keys stay inside:** the open list stops the keys it handles itself (arrows, Home, End, Enter, Space, Escape, Tab, and plain letters for typeahead) from bubbling out of the portal, through the React tree and to the document. A page's own j/k list or Escape-closes-the-pane handler does not react while the menu is open; Escape closes the menu only. Keys pressed on the trigger button are not stopped.

**Submenus:** `MenuSub` (also `Menu.Sub`) wraps a `MenuSubTrigger` (`children`, `prefix`, `disabled`, `description`) and a `Menu` of the same item parts, sections, dividers, checked items and links included. Submenus nest to any depth and work in `MenuContainer`, `ContextMenu` and `DotsMenu`. The trigger is a `menuitem` with `aria-haspopup="menu"` and `aria-expanded`; the submenu is a `menu` labelled by it. With a pointer, hovering or clicking the trigger opens the submenu beside its parent (it flips to the left near the edge of the window), and moving diagonally toward it doesn't close it. → , Enter or Space opens it with focus on its first item; ← or Escape closes only that submenu and refocuses its trigger. Choosing an item closes the whole chain and refocuses the top trigger. Under touch sizing, tapping the trigger replaces the open list's items in place, headed by a Back row with the trigger's label, and nothing opens to the side. Group a few related actions behind a trigger (“Open In ›”) rather than hiding common ones, and stay within two levels. It isn't available in the older `items` form, CommandMenu, FilterMenu or Select.

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
Run the choice in `onClick`. Here the last action is shown beside the trigger.

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

### Radio Items
One choice from a set. Group the set in a section and keep the value in state.

```jsx
import { useState } from 'react';
import { Menu, MenuButton, MenuContainer, MenuItem, MenuSection } from '@hyprsh/design';

export default function Example() {
  const [interval, setInterval] = useState('1m');
  const options = [['30s', 'Every 30 Seconds'], ['1m', 'Every Minute'], ['5m', 'Every 5 Minutes']];

  return (
    <MenuContainer>
      <MenuButton variant="secondary" showChevron>Monitoring</MenuButton>
      <Menu width={220}>
        <MenuSection title="Check Interval">
          {options.map(([value, label]) => (
            <MenuItem key={value} role="radio" checked={interval === value} onClick={() => setInterval(value)}>{label}</MenuItem>
          ))}
        </MenuSection>
      </Menu>
    </MenuContainer>
  );
}
```

### Checkbox Items
Each item toggles on its own and the menu stays open.

```jsx
import { useState } from 'react';
import { Menu, MenuButton, MenuContainer, MenuItem } from '@hyprsh/design';

export default function Example() {
  const [columns, setColumns] = useState({ branch: true, author: false, duration: true });
  const toggle = (key) => setColumns((c) => ({ ...c, [key]: !c[key] }));

  return (
    <MenuContainer>
      <MenuButton variant="secondary" showChevron>Columns</MenuButton>
      <Menu width={200}>
        <MenuItem checked={columns.branch} onClick={() => toggle('branch')}>Branch</MenuItem>
        <MenuItem checked={columns.author} onClick={() => toggle('author')}>Author</MenuItem>
        <MenuItem checked={columns.duration} onClick={() => toggle('duration')}>Duration</MenuItem>
      </Menu>
    </MenuContainer>
  );
}
```

### Submenu
An Open In item whose submenu holds the places a project can open. On a phone its items replace the list under a Back row.

```jsx
import { Menu, MenuButton, MenuContainer, MenuItem, MenuSub, MenuSubTrigger } from '@hyprsh/design';

export default function Example() {
  return (
    <MenuContainer>
      <MenuButton variant="secondary" showChevron>Project</MenuButton>
      <Menu width={220}>
        <MenuItem>Rename Project</MenuItem>
        <MenuSub>
          <MenuSubTrigger>Open In</MenuSubTrigger>
          <Menu>
            <MenuItem>Editor</MenuItem>
            <MenuItem>Terminal</MenuItem>
            <MenuItem>Browser</MenuItem>
          </Menu>
        </MenuSub>
        <MenuItem>Duplicate Project</MenuItem>
      </Menu>
    </MenuContainer>
  );
}
```
