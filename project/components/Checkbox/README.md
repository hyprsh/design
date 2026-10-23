# Checkbox

A 16px checkbox with a 13px label, in checked, indeterminate and disabled states.

**You provide:** the label as children (or `aria-label` when the row names it), and `checked` with `onChange`, or `defaultChecked`. Optional: `indeterminate` (a dash in an empty box, for a parent whose children are partly selected; `checked="indeterminate"` still works), `description`, `disabled`, `name`, `value` and `required`. `description` adds a hint line under the label, wired to the input with `aria-describedby` (“Check for Updates”, then a sentence on what it sends); it is read after the label, not as part of it. With a description, `className` and `style` apply to the wrapper that holds the label and the hint.

- Use checkboxes to pick several items, or to acknowledge something before a submit. For a single on/off setting that applies right away, use Toggle.
- Indeterminate is a visual state only. Clicking the parent selects or clears all of its children; you decide which.
- Required checkboxes are checked on submit, not while people are still reading.
- A disabled checkbox needs a reason nearby, in a hint or a Tooltip on the row.
- A hint is one sentence in sentence case that says what turning the setting on does. Keep the label short and move the detail into `description`.
- Group related checkboxes in a `<fieldset>` with a `<legend>`.
- In a table, give each row's checkbox `aria-label="Select {row name}"`.

## Examples

### Default
The label is the hit target too.

```jsx
import { Checkbox } from '@hyprsh/design';

export default function Example() {
  return <Checkbox name="terms" defaultChecked>Redeploy on Push</Checkbox>;
}
```

### With a Description
Keep the label short and move the detail into `description`.

```jsx
import { Checkbox } from '@hyprsh/design';

export default function Example() {
  return (
    <Checkbox
      name="telemetry"
      description="Sends build durations and error counts. Never your source code."
    >
      Share Build Telemetry
    </Checkbox>
  );
}
```

### States
Unchecked, checked, indeterminate and disabled.

```jsx
import { Checkbox } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Checkbox name="a">Unchecked</Checkbox>
      <Checkbox name="b" defaultChecked>Checked</Checkbox>
      <Checkbox name="c" indeterminate>Indeterminate</Checkbox>
      <Checkbox name="d" disabled>Disabled</Checkbox>
      <Checkbox name="e" disabled defaultChecked>Disabled and Checked</Checkbox>
    </div>
  );
}
```

### Select All
A parent that shows a dash while its children are partly selected. Clicking it selects or clears them all.

```jsx
import { useState } from 'react';
import { Checkbox } from '@hyprsh/design';

const environments = ['Production', 'Preview', 'Development'];

export default function Example() {
  const [selected, setSelected] = useState(['Production']);
  const all = selected.length === environments.length;

  function toggle(name) {
    setSelected((s) => (s.includes(name) ? s.filter((x) => x !== name) : [...s, name]));
  }

  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <legend className="label-14" style={{ marginBottom: 12 }}>Environment Variables</legend>
      <Checkbox
        checked={all}
        indeterminate={!all && selected.length > 0}
        onChange={() => setSelected(all ? [] : environments)}
      >
        All Environments
      </Checkbox>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 24 }}>
        {environments.map((name) => (
          <Checkbox key={name} checked={selected.includes(name)} onChange={() => toggle(name)}>{name}</Checkbox>
        ))}
      </div>
    </fieldset>
  );
}
```

### Acknowledge Before Submit
A required checkbox is checked when the form submits, not while people are still reading.

```jsx
import { useState } from 'react';
import { Button, Checkbox } from '@hyprsh/design';

export default function Example() {
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}
    >
      <Checkbox
        name="overwrite"
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
        description="The existing production alias moves to this deployment."
      >
        Replace Production Alias
      </Checkbox>
      <Button variant="default" typeName="submit">Promote Deployment</Button>
      {submitted && !agreed ? <span className="copy-14" role="alert">Confirm that the production alias will move.</span> : null}
    </form>
  );
}
```
