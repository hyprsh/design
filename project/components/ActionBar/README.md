# ActionBar

The bar at the foot of a scrolling area while there is something to act on: ticked rows, or unsaved changes.

**You provide:** `open` and, usually, `label` and `actions` (Buttons). For ticked rows pass `selection` (`{ count, total, onSelectAll, onClear }`) instead of `label`. Optional: `onClose` with `closeLabel` (“Close” by default), `error`, `opaque` (`false` by default) and `className`. You own the state: ActionBar doesn't track dirty fields or the selection, it only shows what you tell it.

- **Placement:** make it the last child of the scroll container. It is sticky at the bottom of that container and sits in the flow at the end of the content, so it never covers the last row or field and you add no padding. It sits above a mounted TabBar (raised by `--tab-bar-height`) and the safe area. In a Pane, put it at the end of the body and it stays at the pane's foot.
- **Open and closed:** it renders nothing while `open` is false. Close it when the work is done: after Save succeeds, or when the selection is empty.
- **Selection:** `selection` renders “{count} selected” as the label, then Select All (hidden when `count === total`, and when there is no `onSelectAll`), Clear, then your `actions`.
- **Unsaved changes:** label it with the count (“3 unsaved changes”), then Discard and Save. A busy Save is the Button's own `loading`, so the bar has no busy prop.
- **Errors:** `error` shows a problem in the bar with an error icon and keeps the bar open, so the user can retry. Clear it to dismiss it.
- **Focus:** the bar never takes focus when it appears. If it closes while focus is inside it (the user pressed Clear), focus goes back to the element that had it before it entered the bar, or to the scroll container if that element is gone.
- **Announcements:** the label, and an error when it appears, are announced in a polite live region, both when the bar appears and when the text changes (“3 selected” to “4 selected”).
- **Surface:** the same translucent, blurred surface as TabBar, with `opaque` and the same solid fallbacks under reduced transparency and without `backdrop-filter`. It appears with a short transform and opacity entrance, and without motion under `prefers-reduced-motion`.
- Use Note or Banner for a message that sits in the content, and Toast for a result that needs no action. Keep the actions to two or three Buttons, with at most one `primary`.

## Examples

### Unsaved Changes
A count, Discard and Save. Save is busy while it saves, and the bar shows an error if it fails.

```jsx
import { useState } from 'react';
import { ActionBar, Button, Input } from '@hyprsh/design';

export default function Example() {
  const [name, setName] = useState('hyprsh-docs');
  const [branch, setBranch] = useState('main');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const saved = { name: 'hyprsh-docs', branch: 'main' };
  const changes = (name !== saved.name ? 1 : 0) + (branch !== saved.branch ? 1 : 0);

  const discard = () => { setName(saved.name); setBranch(saved.branch); setError(null); };
  const save = () => {
    setSaving(true);
    setError(null);
    setTimeout(() => {
      setSaving(false);
      setError('Couldn’t save the changes. Check your connection and try again.');
    }, 1200);
  };

  return (
    <div style={{ width: '100%', maxWidth: 420, height: 320, overflowY: 'auto', border: '1px solid var(--gray-alpha-400)', borderRadius: 8 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
        <Input label="Project Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Production Branch" value={branch} onChange={(e) => setBranch(e.target.value)} />
      </div>
      <ActionBar
        open={changes > 0}
        label={`${changes} unsaved ${changes === 1 ? 'change' : 'changes'}`}
        error={error}
        actions={
          <>
            <Button size="small" variant="tertiary" onClick={discard} disabled={saving}>Discard</Button>
            <Button size="small" variant="primary" onClick={save} loading={saving}>Save</Button>
          </>
        }
      />
    </div>
  );
}
```

### Selected Rows
Tick rows in an Entity.List. The bar shows the count, Select All, Clear and your actions, and closes when nothing is ticked.

```jsx
import { useState } from 'react';
import { ActionBar, Button, Checkbox, Entity, EntityContent, EntityList } from '@hyprsh/design';

const domains = ['hyprsh.dev', 'docs.hyprsh.dev', 'api.hyprsh.dev', 'status.hyprsh.dev', 'blog.hyprsh.dev', 'app.hyprsh.dev', 'cdn.hyprsh.dev'];

export default function Example() {
  const [selected, setSelected] = useState(['docs.hyprsh.dev']);
  const toggle = (name) => setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));

  return (
    <div style={{ width: '100%', maxWidth: 420, height: 320, overflowY: 'auto', border: '1px solid var(--gray-alpha-400)', borderRadius: 8 }}>
      <EntityList aria-label="Domains">
        {domains.map((name) => (
          <Entity key={name} left={<Checkbox aria-label={`Select ${name}`} checked={selected.includes(name)} onChange={() => toggle(name)} />}>
            <EntityContent title={name} fill />
          </Entity>
        ))}
      </EntityList>
      <ActionBar
        open={selected.length > 0}
        selection={{ count: selected.length, total: domains.length, onSelectAll: () => setSelected(domains), onClear: () => setSelected([]) }}
        actions={
          <>
            <Button size="small" variant="secondary">Monitor</Button>
            <Button size="small" variant="secondary">Unmonitor</Button>
          </>
        }
      />
    </div>
  );
}
```

### Dismissible
`onClose` adds a close button. The app decides what closing means.

```jsx
import { useState } from 'react';
import { ActionBar, Button } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ width: '100%', maxWidth: 420, height: 200, overflowY: 'auto', border: '1px solid var(--gray-alpha-400)', borderRadius: 8 }}>
      <div className="copy-14" style={{ padding: 16 }}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)} disabled={open}>Show Bar</Button>
      </div>
      <ActionBar
        open={open}
        label="Preview ready for review"
        onClose={() => setOpen(false)}
        closeLabel="Dismiss"
        actions={<Button size="small" variant="primary">Open Preview</Button>}
      />
    </div>
  );
}
```

### Opaque
`opaque` keeps the surface solid, for a screen where nothing scrolls under the bar.

```jsx
import { ActionBar, Button } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 420, height: 120, overflowY: 'auto', border: '1px solid var(--gray-alpha-400)', borderRadius: 8 }}>
      <ActionBar
        open
        opaque
        label="2 unsaved changes"
        actions={
          <>
            <Button size="small" variant="tertiary">Discard</Button>
            <Button size="small" variant="primary">Save</Button>
          </>
        }
      />
    </div>
  );
}
```
