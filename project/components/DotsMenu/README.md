# DotsMenu

A three-dot icon button that opens a Menu of secondary actions for one row, card or object.

**You provide:** `MenuItem` children (and `MenuLink`, `MenuItemLocked`, `MenuSection`, `MenuDivider`) and an `aria-label` that names the object (“Deployment Actions”). Optional: `iconSize` (`10` | `12` | `18`, default `18`), `size`, `disabled`, `tabIndex`, `onFocus`, `position` (`bottom-end` by default), `width`, `open`/`defaultOpen`/`onOpenChange`.

- Use DotsMenu at the end of a table row, list item or card, where a labelled Menu button would be too heavy. Anywhere with room for text, use Menu with a visible label.
- Always pass an `aria-label` naming what the actions apply to. Every row's button otherwise reads the same.
- The most common action should also be reachable without the menu, such as clicking the row. Don't hide the only way to do something here.
- Inside a widget that manages focus itself, such as a roving-focus grid or a listbox, pass `tabIndex={-1}` to take the button out of the tab order and `onFocus` to hand focus back to the widget's cell. The button still opens the menu by click, and by keyboard once it has focus.
- Items follow Menu's rules: Title Case Verb + Noun, destructive items last after a divider with `type="error"`, “…” only when a dialog follows.

## Examples

### Default
Secondary actions for one row. The `aria-label` names the object.

```jsx
import { DotsMenu, MenuItem } from '@hyprsh/design';

export default function Example() {
  return (
    <DotsMenu aria-label="Deployment Actions">
      <MenuItem>Copy Deployment URL</MenuItem>
      <MenuItem>Redeploy</MenuItem>
      <MenuItem>Promote to Production</MenuItem>
    </DotsMenu>
  );
}
```

### Sections and Destructive Items
Destructive items go last, after a divider.

```jsx
import { DotsMenu, MenuDivider, MenuItem, MenuSection } from '@hyprsh/design';

export default function Example() {
  return (
    <DotsMenu aria-label="Domain Actions" width={220}>
      <MenuSection title="Domain">
        <MenuItem>Verify Domain</MenuItem>
        <MenuItem>Set as Primary</MenuItem>
      </MenuSection>
      <MenuDivider />
      <MenuItem type="error">Remove Domain…</MenuItem>
    </DotsMenu>
  );
}
```

### In a Row
The usual home is the end of an Entity row.

```jsx
import { useState } from 'react';
import { DotsMenu, Entity, EntityContent, EntityList, MenuItem } from '@hyprsh/design';
import { Globe } from 'lucide-react';

export default function Example() {
  const [last, setLast] = useState('Nothing yet');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <EntityList aria-label="Domains">
        <Entity
          left={<Globe />}
          right={
            <DotsMenu aria-label="hyprsh.dev Actions">
              <MenuItem onClick={() => setLast('Domain verified')}>Verify Domain</MenuItem>
              <MenuItem onClick={() => setLast('Domain removed')}>Remove Domain</MenuItem>
            </DotsMenu>
          }
        >
          <EntityContent title="hyprsh.dev" description="Primary domain" />
        </Entity>
      </EntityList>
      <span className="copy-13" role="status">Last action: {last}</span>
    </div>
  );
}
```

### Sizes and Disabled
`size` and `iconSize` follow the density, and `disabled` turns it off.

```jsx
import { DotsMenu, MenuItem } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <DotsMenu aria-label="Tiny Actions" size="tiny" iconSize={12}><MenuItem>Rename</MenuItem></DotsMenu>
      <DotsMenu aria-label="Small Actions" size="small"><MenuItem>Rename</MenuItem></DotsMenu>
      <DotsMenu aria-label="Medium Actions" size="medium"><MenuItem>Rename</MenuItem></DotsMenu>
      <DotsMenu aria-label="Disabled Actions" disabled><MenuItem>Rename</MenuItem></DotsMenu>
    </div>
  );
}
```
