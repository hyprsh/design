# ActionBar

The bar at the foot of a scrolling area while there is something to act on: ticked rows, or unsaved changes.

**You provide:** `open` and, usually, `label` and `actions` (Buttons). For ticked rows pass `selection` (`{ count, total, onSelectAll, onClear }`) instead of `label`. Optional: `tone` (a dot before the label: `success`, `info`, `warning`, `error` or `neutral`), `secondaryActions` (`{ label, onSelect, disabled }[]`), `onClose` with `closeLabel` (“Close” by default), `error` and `className`. `opaque` is still accepted but does nothing: the capsule is always solid. You own the state: ActionBar doesn't track dirty fields or the selection, it only shows what you tell it.

- **Placement:** make it the last child of the scroll container. It is sticky at the bottom of that container and sits in the flow at the end of the content, so it never covers the last row or field (it keeps its own clearance below it, also on a phone with a safe area) and you add no padding for it. It sits above a mounted TabBar (raised by `--tab-bar-height`) and the safe area. In a Pane, put it at the end of the body and it stays at the pane's foot.
- **Surface:** a capsule that hugs its content and is centred in the scroll container, never wider than the container less 8px on each side. It is inverted (`gray-1000` with `background-100` text), so it reads as a mode and flips with the theme. It appears with a short transform and opacity entrance, and without motion under `prefers-reduced-motion`.
- **Open and closed:** it renders nothing while `open` is false. Close it when the work is done: after Save succeeds, or when the selection is empty.
- **Selection:** `selection` renders a count chip, “{count} selected”, with its own × (“Clear selection”) that calls `onClear`. Then a quiet “Select all {total}”, hidden when `count === total` and when there is no `onSelectAll`, a separator and your `actions`.
- **Unsaved changes:** label it with the count (“3 unsaved changes”) and `tone="warning"`, then Discard and Save. A busy Save is the Button's own `loading`, so the bar has no busy prop.
- **Buttons:** pass ordinary Buttons; the bar restyles them for its surface. Secondary and tertiary are transparent with the inverted text, and `primary` takes the page's colours, so use one `primary` for the main action. Small and medium Buttons are drawn at 32px; under touch sizing they keep that drawing and grow their hit area to the touch target. Keep `actions` to one or two Buttons and put the rest in `secondaryActions`, which show as quiet text buttons before `actions`.
- **Narrow:** when the scroll container is narrower than 480px (measured, not a viewport query), the capsule spans its width and stays on one line. “Select all {total}” and `secondaryActions` fold into a More (…) menu; the count chip and `actions` stay visible.
- **Errors:** `error` shows one line of text inside the capsule, above the row (a string's first sentence in bold), turns the dot to the error tone and keeps the bar open, so the user can retry. Clear it to dismiss it.
- **Focus:** the bar never takes focus when it appears. If it closes while focus is inside it (the user pressed the chip's ×), focus goes back to the element that had it before it entered the bar, or to the scroll container if that element is gone.
- **Announcements:** the label, and an error when it appears, are announced in a polite live region, both when the bar appears and when the text changes (“3 selected” to “4 selected”).
- Use Note or Banner for a message that sits in the content, and Toast for a result that needs no action.

## Examples

### Unsaved Changes
A warning dot, the count, Discard and Save. Save is busy while it saves, and the bar shows an error line if it fails.

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
      setError('Couldn’t save. Check your connection and try again.');
    }, 1200);
  };

  return (
    <div style={{ width: '100%', maxWidth: 560, height: 320, overflowY: 'auto', border: '1px solid var(--gray-alpha-400)', borderRadius: 8 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16 }}>
        <Input label="Project Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Production Branch" value={branch} onChange={(e) => setBranch(e.target.value)} />
      </div>
      <ActionBar
        open={changes > 0}
        tone="warning"
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
Tick rows in an Entity.List. The bar shows the count chip with its clear button, Select all, a secondary action and the main one, and closes when nothing is ticked.

```jsx
import { useState } from 'react';
import { ActionBar, Button, Checkbox, Entity, EntityContent, EntityList } from '@hyprsh/design';

const domains = ['hyprsh.dev', 'docs.hyprsh.dev', 'api.hyprsh.dev', 'status.hyprsh.dev', 'blog.hyprsh.dev', 'app.hyprsh.dev', 'cdn.hyprsh.dev'];

export default function Example() {
  const [selected, setSelected] = useState(['docs.hyprsh.dev']);
  const toggle = (name) => setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));

  return (
    <div style={{ width: '100%', maxWidth: 560, height: 320, overflowY: 'auto', border: '1px solid var(--gray-alpha-400)', borderRadius: 8 }}>
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
        secondaryActions={[{ label: 'Unmonitor', onSelect: () => setSelected([]) }]}
        actions={<Button size="small" variant="primary">Monitor</Button>}
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
    <div style={{ width: '100%', maxWidth: 560, height: 200, overflowY: 'auto', border: '1px solid var(--gray-alpha-400)', borderRadius: 8 }}>
      <div className="copy-14" style={{ padding: 16 }}>
        <Button size="small" variant="secondary" onClick={() => setOpen(true)} disabled={open}>Show Bar</Button>
      </div>
      <ActionBar
        open={open}
        tone="success"
        label="Preview ready for review"
        onClose={() => setOpen(false)}
        closeLabel="Dismiss"
        actions={<Button size="small" variant="secondary">Open Preview</Button>}
      />
    </div>
  );
}
```

### Narrow
In a container under 480px wide the capsule spans the width: Select all and the secondary actions move into the More menu.

```jsx
import { useState } from 'react';
import { ActionBar, Button } from '@hyprsh/design';

const deployments = ['Production', 'Preview: main', 'Preview: docs-nav', 'Preview: fix-cache', 'Preview: api-v2'];

export default function Example() {
  const [selected, setSelected] = useState(['Preview: docs-nav', 'Preview: fix-cache']);

  return (
    <div style={{ width: '100%', maxWidth: 360, height: 240, overflowY: 'auto', border: '1px solid var(--gray-alpha-400)', borderRadius: 8 }}>
      <div className="copy-14" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16 }}>
        {deployments.map((name) => <div key={name}>{name}</div>)}
      </div>
      <ActionBar
        open={selected.length > 0}
        selection={{ count: selected.length, total: deployments.length, onSelectAll: () => setSelected(deployments), onClear: () => setSelected([]) }}
        secondaryActions={[
          { label: 'Promote', onSelect: () => {} },
          { label: 'Cancel Builds', onSelect: () => {}, disabled: true },
        ]}
        actions={<Button size="small" variant="primary">Redeploy</Button>}
      />
    </div>
  );
}
```
