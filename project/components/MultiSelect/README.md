# MultiSelect

A compact filter button that opens a checklist; each row also offers a one-click “Only” to narrow to that item, or “Select All” to undo it.

**You provide:** either the shortcut, `items` (strings or `{ value, label }`) with `label` (a plural noun such as “Environments”) and `value` + `onChange(values)` or `defaultValue` (everything is selected by default); or the parts, `MultiSelectRoot` > `MultiSelectTrigger` (button text) + `MultiSelectContent` > `MultiSelectRow` with `name`, `checked`, `onChange(checked)`, `onSelectOnly`, `onSelectAll`, `selectedCount` and `totalCount` (also `MultiSelect.Root`, `.Trigger`, `.Content`, `.Row`). Optional: `align="end"`, `open`/`defaultOpen`/`onOpenChange`, `size`, `disabled`.

- Use it to filter a view (environments, regions, log levels); for picking values in a form, use Checkboxes or a Choicebox.
- For a filter that starts empty and adds values (include, exclude, search, sections), use FilterMenu: MultiSelect starts with everything selected and narrows down.
- Let the trigger name the selection: “All Environments”, the single item when one is picked, or the label with a count.
- Each checkbox is named after its item, and each action button reads as “Preview. Only”.
- Arrow keys move between rows and between the checkbox and its action; Escape closes and returns focus to the trigger.
- The panel floats above the page, flips above the trigger when there's no room below and stays on screen on phones, where rows are 44px tall under touch sizing and the Only / Select All action is always shown.

## Examples

### Default
Everything is selected until someone narrows it. `label` is a plural noun.

```jsx
import { MultiSelect } from '@hyprsh/design';

export default function Example() {
  return <MultiSelect label="Environments" items={['Production', 'Preview', 'Development']} />;
}
```

### Controlled
Keep the selected values in state and use them to filter a list.

```jsx
import { useState } from 'react';
import { MultiSelect } from '@hyprsh/design';

const deployments = [
  { id: 'dpl_8f2a', env: 'production' },
  { id: 'dpl_71cd', env: 'preview' },
  { id: 'dpl_03be', env: 'preview' },
  { id: 'dpl_5a90', env: 'development' },
];

export default function Example() {
  const [envs, setEnvs] = useState(['production', 'preview', 'development']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <MultiSelect
        label="Environments"
        items={[
          { value: 'production', label: 'Production' },
          { value: 'preview', label: 'Preview' },
          { value: 'development', label: 'Development' },
        ]}
        value={envs}
        onChange={setEnvs}
      />
      <ul className="copy-14" style={{ margin: 0, paddingLeft: 20 }}>
        {deployments.filter((d) => envs.includes(d.env)).map((d) => <li key={d.id}>{d.id} ({d.env})</li>)}
      </ul>
    </div>
  );
}
```

### Starting Narrowed
Pass `defaultValue` to start with some items selected, and `align="end"` to open toward the end.

```jsx
import { MultiSelect } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <MultiSelect align="end" size="small" label="Branches" items={['main', 'staging', 'feat/tab-bar']} defaultValue={['main']} />
    </div>
  );
}
```

### Parts
Build the rows yourself when each one needs its own behaviour.

```jsx
import { useState } from 'react';
import { MultiSelectContent, MultiSelectRoot, MultiSelectRow, MultiSelectTrigger } from '@hyprsh/design';

const names = ['Build', 'Runtime', 'Edge'];

export default function Example() {
  const [on, setOn] = useState(names);
  const toggle = (name, checked) => setOn((s) => (checked ? [...s, name] : s.filter((x) => x !== name)));

  return (
    <MultiSelectRoot>
      <MultiSelectTrigger variant="secondary">{on.length === names.length ? 'All Log Sources' : `${on.length} Log Sources`}</MultiSelectTrigger>
      <MultiSelectContent aria-label="Log sources">
        {names.map((name) => (
          <MultiSelectRow
            key={name}
            name={name}
            checked={on.includes(name)}
            selectedCount={on.length}
            totalCount={names.length}
            onChange={(checked) => toggle(name, checked)}
            onSelectOnly={() => setOn([name])}
            onSelectAll={() => setOn(names)}
          />
        ))}
      </MultiSelectContent>
    </MultiSelectRoot>
  );
}
```
