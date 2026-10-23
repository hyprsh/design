# Popover

A floating panel that opens on click and holds interactive content: buttons, selectable text, a small form. It is a non-modal dialog: focus moves inside and Tab stays there, Escape or a click outside closes it, and focus goes back to the trigger.

**You provide:** `trigger` (an element, usually a Button; text becomes a secondary Button), the content as `children` and a `label` for the dialog's accessible name. Optional: `open`/`defaultOpen`/`onOpenChange`, `position` (`bottom-start` by default; also `bottom-end`, `top-*`, `left-*`, `right-*`, `bottom-center`, `top-center`), `width`, `initialFocusRef`, `className`. `children` can be a function that receives `{ close }`, to close from a button inside and return focus to the trigger.

- Use a Popover for details the person acts on or copies: a file's path, filter syntax help, a small form. Use Tooltip or ContextCard for read-only hints on hover, Menu for a list of actions, Modal when the page must wait, and Sheet or Drawer for larger side content.
- It opens on click, never on hover. It floats above the page, flips when there is no room and stays 8px inside the screen, so it works on phones.
- Focus lands on the element marked `data-autofocus`, else the first focusable element, else the panel. Escape returns focus to the trigger; a click outside leaves focus where the click put it.
- Escape and Tab are handled by the popover alone and don't bubble out of its portal, so an Escape handler on the page does not also fire.
- Keep it short: one task or one block of details. Don't open another popover from inside one.

## Examples

### Default
Opens on click and holds interactive content. `label` names the dialog.

```jsx
import { Button, Popover } from '@hyprsh/design';

export default function Example() {
  return (
    <Popover trigger={<Button variant="secondary">Environment Details</Button>} label="Environment details" width={280}>
      <div className="copy-14" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span><strong>Production</strong> · main</span>
        <span>Last deployed 2 hours ago.</span>
      </div>
    </Popover>
  );
}
```

### Closing from Inside
Pass a function as `children` to get `close`, which also returns focus to the trigger.

```jsx
import { Button, Popover } from '@hyprsh/design';

export default function Example() {
  return (
    <Popover trigger={<Button variant="secondary">Share Deployment</Button>} label="Share deployment" width={300}>
      {({ close }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <code className="label-13-mono" style={{ overflowWrap: 'anywhere', userSelect: 'all' }}>https://marketing-site-4f2a9c1.hyprsh.dev</code>
          <Button size="small" onClick={close}>Done</Button>
        </div>
      )}
    </Popover>
  );
}
```

### Positions
`position` picks the side and alignment. It flips when there is no room.

```jsx
import { Button, Popover } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: '100%', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between' }}>
      <Popover trigger={<Button size="small">Start</Button>} position="bottom-start" label="Start aligned" width={200}>Aligned to the start.</Popover>
      <Popover trigger={<Button size="small">Center</Button>} position="bottom-center" label="Centred" width={200}>Centred under the trigger.</Popover>
      <Popover trigger={<Button size="small">End</Button>} position="bottom-end" label="End aligned" width={200}>Aligned to the end.</Popover>
    </div>
  );
}
```

### Small Form
Focus moves inside, and `initialFocusRef` picks where it lands.

```jsx
import { useRef, useState } from 'react';
import { Button, Input, Popover } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('main');
  const inputRef = useRef(null);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={<Button variant="secondary">Rename Branch</Button>}
      label="Rename branch"
      width={300}
      initialFocusRef={inputRef}
    >
      <form
        onSubmit={(e) => { e.preventDefault(); setOpen(false); }}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <Input ref={inputRef} label="Branch Name" name="branch" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" spellCheck={false} />
        <Button variant="default" size="small" typeName="submit">Save Branch</Button>
      </form>
    </Popover>
  );
}
```
