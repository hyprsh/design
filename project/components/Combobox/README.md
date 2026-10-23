# Combobox

A search field that filters a list as you type and picks one option from it, for lists too long to scan in a Select.

**You provide:** an accessible name (`aria-label`, or an outside `<label htmlFor>` pointing at `id`), and options as `ComboboxList` > `ComboboxOption value` children (also `Combobox.List`, `Combobox.Option`) or an `options` array. Use `value` + `onChange(value)` or `defaultValue`. Optional: `placeholder`, `size` (`small` 32px, `medium` 36px by default, `large` 40px), `width` (full width by default), `clearable`, `errored`, `disabled`, `loading`, `emptyMessage` (on the list or the root), `name` to submit it in a form, and `prefix`/`suffix` on options.

- Use a placeholder that says what to search for (“Search frameworks…”).
- Write the empty state with the query in it, for example “No frameworks match ‘nuxt’”; pass a function to `emptyMessage` to get the text.
- Show `loading` while results arrive instead of an empty list.
- Arrow keys move through options, Enter picks, Escape closes and puts back the last choice. Enter never submits the form while the list is open.
- For fewer than about seven options, a Select or Switch is quicker.
- Under touch sizing options are 44px tall, and the clear and chevron buttons keep their drawn size with a 44px hit area.
- When the typed text is the value, such as a search or filter query, use QueryInput. Combobox only picks one option from its list.

## Examples

### Default
Type to filter a list too long to scan. Name it with `aria-label`.

```jsx
import { Combobox } from '@hyprsh/design';

const projects = ['marketing-site', 'docs', 'api', 'dashboard', 'billing-worker', 'edge-config'];

export default function Example() {
  return <Combobox aria-label="Project" placeholder="Search projects…" options={projects} width={300} />;
}
```

### Option Parts
Use `ComboboxList` and `ComboboxOption` for a prefix or suffix on a row.

```jsx
import { Combobox, ComboboxList, ComboboxOption } from '@hyprsh/design';
import { GitBranch } from 'lucide-react';

export default function Example() {
  return (
    <Combobox aria-label="Branch" placeholder="Select a branch…" defaultValue="main" width={300}>
      <ComboboxList emptyMessage="No branches match.">
        <ComboboxOption value="main" prefix={<GitBranch />} suffix="Production">main</ComboboxOption>
        <ComboboxOption value="staging" prefix={<GitBranch />}>staging</ComboboxOption>
        <ComboboxOption value="feat/tab-bar" prefix={<GitBranch />}>feat/tab-bar</ComboboxOption>
        <ComboboxOption value="release" prefix={<GitBranch />} disabled>release</ComboboxOption>
      </ComboboxList>
    </Combobox>
  );
}
```

### Controlled and Clearable
`clearable` adds a clear button once something is picked. The value is `null` when nothing is.

```jsx
import { useState } from 'react';
import { Combobox } from '@hyprsh/design';

const regions = [
  { value: 'iad1', label: 'Washington, D.C. (iad1)' },
  { value: 'fra1', label: 'Frankfurt (fra1)' },
  { value: 'sin1', label: 'Singapore (sin1)' },
  { value: 'syd1', label: 'Sydney (syd1)' },
];

export default function Example() {
  const [region, setRegion] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 300 }}>
      <Combobox aria-label="Region" placeholder="Select a region…" clearable options={regions} value={region} onChange={setRegion} />
      <span className="copy-14" role="status">{region ? `Selected ${region}.` : 'No region selected.'}</span>
    </div>
  );
}
```

### Sizes and Error
`errored` adds the red ring. Say what is wrong next to the field.

```jsx
import { Combobox } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 300 }}>
      <Combobox size="small" aria-label="Domain (Small)" placeholder="Small…" options={['hyprsh.dev', 'docs.hyprsh.dev']} />
      <Combobox size="large" aria-label="Domain (Large)" placeholder="Large…" options={['hyprsh.dev', 'docs.hyprsh.dev']} />
      <Combobox errored aria-label="Domain (Error)" placeholder="Select a domain…" options={['hyprsh.dev', 'docs.hyprsh.dev']} />
      <span className="copy-13" role="alert">Select a domain to continue.</span>
    </div>
  );
}
```

### Loading Results
`loading` shows a spinner in place of the options while a request is in flight, and `emptyMessage` can use the typed text.

```jsx
import { useEffect, useState } from 'react';
import { Combobox } from '@hyprsh/design';

const all = ['hyprsh-web', 'hyprsh-api', 'hyprsh-docs', 'hyprsh-edge', 'hyprsh-billing'];

export default function Example() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(all);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setResults(all.filter((n) => n.includes(text.trim().toLowerCase())));
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <Combobox
      aria-label="Repository"
      placeholder="Search repositories…"
      width={300}
      loading={loading}
      options={results}
      onInputChange={setText}
      emptyMessage={(query) => `No repositories match “${query}”.`}
    />
  );
}
```
