# Select

A native dropdown with a label, an optional hint or error, a prefix icon and three sizes, styled like Input.

**You provide:** a `label` in Title Case (or `aria-label`), `name`, the choices as `<option>` children (or `options` as data), and `value` with `onChange`, or `defaultValue`. Optional: `placeholder` (a disabled first option, gray until something is picked), `prefix` (an icon), `suffix` (replaces the chevron), `hint`, `error`, `size` (`small` 32px, `medium` 36px, `large` 40px), `labelPosition="inline"` (the label beside the select instead of above it: “Monitor [select]” in a toolbar), `required` and `disabled`. The ref reaches the `<select>`.

- Use Select for up to about 10 choices. Past that, use Combobox so people can type to filter; group long lists with native `<optgroup>`.
- For several values, use a multi-select; for 2–3 options that are all worth seeing, use Switch or Radio.
- Option labels are Title Case and parallel. The placeholder says what to do: "Select a region".
- Pre-select a safe default when there is one, instead of a placeholder.
- Validate on blur, and say which choice is missing in the error.

## Examples

### Default
Pass the choices as `<option>` children. A pre-selected safe default beats a placeholder.

```jsx
import { Select } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ maxWidth: 280 }}>
      <Select label="Region" name="region" defaultValue="iad1">
        <option value="iad1">Washington, D.C. (iad1)</option>
        <option value="fra1">Frankfurt (fra1)</option>
        <option value="sin1">Singapore (sin1)</option>
      </Select>
    </div>
  );
}
```

### Options as Data
Use `options` for a list that comes from data, and `placeholder` when no safe default exists.

```jsx
import { Select } from '@hyprsh/design';

const frameworks = [
  { value: 'next', label: 'Next.js' },
  { value: 'astro', label: 'Astro' },
  { value: 'vite', label: 'Vite' },
  { value: 'remix', label: 'Remix', disabled: true },
];

export default function Example() {
  return (
    <div style={{ maxWidth: 280 }}>
      <Select label="Framework" name="framework" placeholder="Select a framework" options={frameworks} defaultValue="" />
    </div>
  );
}
```

### Sizes and Icon
Three sizes, and a decorative `prefix` icon.

```jsx
import { Select } from '@hyprsh/design';
import { GitBranch } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 280 }}>
      <Select size="small" label="Branch (Small)" name="branch-s" prefix={<GitBranch />} options={['main', 'staging']} />
      <Select size="medium" label="Branch (Medium)" name="branch-m" prefix={<GitBranch />} options={['main', 'staging']} />
      <Select size="large" label="Branch (Large)" name="branch-l" prefix={<GitBranch />} options={['main', 'staging']} />
    </div>
  );
}
```

### Controlled with Validation
Keep the value in state and say which choice is missing in the error.

```jsx
import { useState } from 'react';
import { Select } from '@hyprsh/design';

export default function Example() {
  const [region, setRegion] = useState('');
  const [touched, setTouched] = useState(false);

  return (
    <div style={{ maxWidth: 320 }}>
      <Select
        label="Primary Region"
        name="primary-region"
        placeholder="Select a region"
        options={['Washington, D.C.', 'Frankfurt', 'Singapore']}
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        onBlur={() => setTouched(true)}
        hint="Functions run here unless a route overrides it."
        error={touched && !region ? 'Primary Region is required. Select where functions should run.' : undefined}
      />
    </div>
  );
}
```

### Inline Label
`labelPosition="inline"` puts the label beside the select, for a toolbar.

```jsx
import { Select } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <Select size="small" labelPosition="inline" label="Environment" name="env" defaultValue="production" options={[{ value: 'production', label: 'Production' }, { value: 'preview', label: 'Preview' }, { value: 'development', label: 'Development' }]} />
      <Select size="small" labelPosition="inline" label="Range" name="range" defaultValue="7d" options={[{ value: '24h', label: 'Last 24 Hours' }, { value: '7d', label: 'Last 7 Days' }, { value: '30d', label: 'Last 30 Days' }]} />
    </div>
  );
}
```
