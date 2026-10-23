# CommandMenuTrigger

A button that looks like a small search field and opens the command menu, with the ⌘K hint on the right.

**You provide:** `onClick` (open the menu), and optionally `children` as the label (default "Search…"), `size` (`small` 32px or `medium` 36px, default `medium`, the same heights as Input, and 44px under touch sizing), `prefix` (default the search icon; `null` or `false` hides it) and `shortcut` (default a ⌘K key; `false` hides it, a node replaces it). Other button attributes (`disabled`, `aria-*`, `className`) pass through, and `ref` reaches the button. It fills its container and truncates a long label with an ellipsis.

- It is a native `<button>` with `aria-haspopup="dialog"`, not a read-only Input, so screen readers announce a button that opens a dialog instead of an uneditable text box.
- The accessible name is the label alone. The prefix and shortcut are hidden from screen readers; the default shortcut adds `aria-keyshortcuts`.
- The label names what the menu does: "Search or Run a Command…". Keep it short, it shares the row with the shortcut.
- Pair it with CommandMenu, which already listens for ⌘K / Ctrl + K. If you replace the shortcut or turn the menu's hotkey off, change the hint to match.
- Use SearchInput when people type a query in place. Use this when the click opens a separate palette.

## Examples

### Default
A button that looks like a small search field. It fills its container.

```jsx
import { useState } from 'react';
import { CommandMenu, CommandMenuInput, CommandMenuItem, CommandMenuList, CommandMenuTrigger } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ width: '100%', maxWidth: 320 }}>
      <CommandMenuTrigger onClick={() => setOpen(true)} />
      <CommandMenu open={open} setOpen={setOpen}>
        <CommandMenuInput placeholder="Search for a command or page…" />
        <CommandMenuList>
          <CommandMenuItem callback={() => {}}>Create Project…</CommandMenuItem>
          <CommandMenuItem callback={() => {}}>Deploy to Production</CommandMenuItem>
        </CommandMenuList>
      </CommandMenu>
    </div>
  );
}
```

### Label and Size
Change the label, and pick `small` for a dense toolbar.

```jsx
import { CommandMenuTrigger } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
      <CommandMenuTrigger size="small">Search Projects…</CommandMenuTrigger>
      <CommandMenuTrigger>Jump to a Domain…</CommandMenuTrigger>
    </div>
  );
}
```

### Without the Hint or Icon
`shortcut={false}` hides the key, and `prefix={null}` hides the icon.

```jsx
import { CommandMenuTrigger } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
      <CommandMenuTrigger shortcut={false}>Search…</CommandMenuTrigger>
      <CommandMenuTrigger prefix={null}>Search…</CommandMenuTrigger>
    </div>
  );
}
```

### Disabled
A disabled trigger can’t open the menu.

```jsx
import { CommandMenuTrigger } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 320 }}>
      <CommandMenuTrigger disabled>Search…</CommandMenuTrigger>
    </div>
  );
}
```
