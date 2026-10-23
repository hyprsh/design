# Radio

A 16px radio with a 13px label: RadioGroup with RadioGroupItem for a set of choices, or a standalone Radio.

**You provide:** a `RadioGroup` with a `label` (it names the group for assistive tech and stays visually hidden) or `aria-label`, `value` with `onChange` (called with the picked value) or `defaultValue`, and one `RadioGroupItem` per choice, each with a `value` and a label as children. Optional: `required` and `disabled` on the group, `disabled` on an item, `name` when the group posts with a form, and `horizontal`. For a custom item layout, call `useRadio({ value })` inside the group and render its `component`. A standalone `Radio` takes `checked`, `onChange`, `value` and an `aria-label`. Also available as `Radio.Group`, `Radio.GroupItem` and `Radio.useRadio`.

- Use radios for 2–6 mutually exclusive options that are all worth seeing. Past 6, use Select; for a single on/off, use Toggle; for options with descriptions, use Choicebox.
- Pre-select the safe default, so the group always has an answer.
- Put `required` on the group, not on single items.
- Arrow keys move between options and skip disabled ones; Tab leaves the group.
- Keep option labels parallel: all nouns, or all verbs.
- A disabled option needs a reason nearby.
- When a visible group label helps, render it as a heading or `<legend>` above the group and point `aria-labelledby` at it.

## Examples

### Default
A group names itself with `label` (visually hidden) and holds one item per choice.

```jsx
import { RadioGroup, RadioGroupItem } from '@hyprsh/design';

export default function Example() {
  return (
    <RadioGroup label="Deployment environment" defaultValue="production">
      <RadioGroupItem value="production">Production</RadioGroupItem>
      <RadioGroupItem value="preview">Preview</RadioGroupItem>
      <RadioGroupItem value="development">Development</RadioGroupItem>
    </RadioGroup>
  );
}
```

### Controlled
`onChange` receives the picked value.

```jsx
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@hyprsh/design';

export default function Example() {
  const [region, setRegion] = useState('iad1');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <RadioGroup label="Function region" value={region} onChange={setRegion}>
        <RadioGroupItem value="iad1">Washington, D.C. (iad1)</RadioGroupItem>
        <RadioGroupItem value="fra1">Frankfurt (fra1)</RadioGroupItem>
        <RadioGroupItem value="sin1">Singapore (sin1)</RadioGroupItem>
      </RadioGroup>
      <span className="copy-14" role="status">Functions run in {region}.</span>
    </div>
  );
}
```

### Horizontal
Lay a short set out in a row.

```jsx
import { RadioGroup, RadioGroupItem } from '@hyprsh/design';

export default function Example() {
  return (
    <RadioGroup label="Build cache" horizontal defaultValue="on">
      <RadioGroupItem value="on">Use Cache</RadioGroupItem>
      <RadioGroupItem value="off">Skip Cache</RadioGroupItem>
    </RadioGroup>
  );
}
```

### Disabled
Disable the whole group, or a single item with a reason nearby.

```jsx
import { RadioGroup, RadioGroupItem } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
      <RadioGroup label="Plan" defaultValue="pro">
        <RadioGroupItem value="hobby">Hobby</RadioGroupItem>
        <RadioGroupItem value="pro">Pro</RadioGroupItem>
        <RadioGroupItem value="enterprise" disabled>Enterprise (Contact Sales)</RadioGroupItem>
      </RadioGroup>
      <RadioGroup label="Visibility" disabled defaultValue="private">
        <RadioGroupItem value="private">Private</RadioGroupItem>
        <RadioGroupItem value="public">Public</RadioGroupItem>
      </RadioGroup>
    </div>
  );
}
```

### In a Form
Give the group a `name` so it posts with the form, and `required` so a native form asks for a choice.

```jsx
import { useState } from 'react';
import { Button, RadioGroup, RadioGroupItem } from '@hyprsh/design';

export default function Example() {
  const [done, setDone] = useState(false);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setDone(true); }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}
    >
      <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
        <legend id="branch-legend" className="label-14" style={{ marginBottom: 12, padding: 0 }}>Production Branch</legend>
        <RadioGroup aria-labelledby="branch-legend" name="branch" required defaultValue="main">
          <RadioGroupItem value="main">main</RadioGroupItem>
          <RadioGroupItem value="release">release</RadioGroupItem>
        </RadioGroup>
      </fieldset>
      <Button variant="default" typeName="submit">Save Branch</Button>
      {done ? <span className="copy-14" role="status">Production branch saved</span> : null}
    </form>
  );
}
```
