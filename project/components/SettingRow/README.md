# SettingRow

A label and help text beside a control, with a changed mark, for the rows of a settings card.

**You provide:** a `label` and the control as the single child (an Input, Select, Switch, Checkbox or Textarea, without a label of its own). Optional: `help` (one line under the label), `changed` (`false` by default) and `changedLabel` (“Unsaved change” by default).

**Layout:** from `sm` up the label and help sit on the left and the control on the right, top-aligned. Below `sm` they stack, with the control under the help. Consecutive rows are divided by a hairline, as `Entity.List` rows are, and a single row has none, so rows dropped into a `Fieldset` read as one list.

**Labelling:** the row renders a `<label for>` tied to the control. It gives the child an `id` when it has none, and merges the help's id (and the changed words') into the child's `aria-describedby`, so the label is the control's name and the help is its description. A child that sets its own `id` or `aria-describedby` keeps them.

**Changed:** `changed` draws a 2px accent mark on the row's leading edge and adds `changedLabel` to the control's description, so the state doesn't rely on colour. The mark is always in place and only fades in, so toggling it doesn't move anything. The row doesn't track what changed or save it: set `changed` from your own state.

- Use it for settings that sit in a list, one value per row. Use a plain Input with a `label` for a single field in a form.
- Don't give the child its own `label` or `aria-label`: the row names it. Errors stay on the control, with its own `error` prop.
- Keep labels in Title Case and help to one short sentence.
- A Switch (a radio group) is named by the row's label through `aria-labelledby`, which the row sets unless the Switch has its own `aria-labelledby` or `aria-label`.

## Examples

### Settings Card
Rows in a Fieldset: an input, a select and a checkbox, one marked as changed.

```jsx
import { useState } from 'react';
import { Fieldset, Input, Select, Checkbox, SettingRow } from '@hyprsh/design';

export default function Example() {
  const [name, setName] = useState('docs-site');
  return (
    <Fieldset>
      <Fieldset.Content>
        <Fieldset.Title>General</Fieldset.Title>
        <Fieldset.Subtitle>How this project appears and deploys.</Fieldset.Subtitle>
        <SettingRow label="Project Name" help="Shown on the dashboard and in the CLI." changed={name !== 'docs-site'}>
          <Input name="name" value={name} onChange={(e) => setName(e.target.value)} />
        </SettingRow>
        <SettingRow label="Region" help="Where builds and functions run.">
          <Select name="region" defaultValue="iad1" options={[{ value: 'iad1', label: 'Washington, D.C.' }, { value: 'sfo1', label: 'San Francisco' }]} />
        </SettingRow>
        <SettingRow label="Preview Deployments" help="Deploy every branch.">
          <Checkbox name="previews" defaultChecked />
        </SettingRow>
      </Fieldset.Content>
    </Fieldset>
  );
}
```

### Single Row
One row has no divider.

```jsx
import { SettingRow, Input } from '@hyprsh/design';

export default function Example() {
  return (
    <SettingRow label="Production Branch" help="Pushes to this branch deploy to production.">
      <Input name="branch" defaultValue="main" />
    </SettingRow>
  );
}
```

### Changed Row
`changed` adds the edge mark and the words “Unsaved change” to the control's description. `changedLabel` replaces them.

```jsx
import { SettingRow, Input } from '@hyprsh/design';

export default function Example() {
  return (
    <SettingRow label="Root Directory" help="Where the project's code lives." changed changedLabel="Edited, not saved">
      <Input name="root" defaultValue="apps/web" />
    </SettingRow>
  );
}
```
