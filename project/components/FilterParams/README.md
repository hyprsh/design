# FilterParams

A filter bar whose state lives in the URL: “Add Filter” opens a two-step picker, active filters show as removable pills, and suggested defaults show as dashed pills.

**You provide:** `params`, one entry per filter with `key` (display name), `type` (`'select'`, `'multi-select'` or `'date-range'`), `options` or `presets`, and optionally `param` (URL key), `label`, `optionLabel`, `encode`/`decode` and `suggestion`. Pass `searchParams` with `onSearchParamsChange` to control it, or leave them out to sync with `location.search`. Optional: `ai` (`{ isThinking, onAbort, onQuery }`), `addLabel` and `defaultOpen`. Helpers: `FilterParams.useSearchParamState`, `encodeDateRangeValue`, `decodeDateRangeValue` and `resolveDateRange`.

- Keep constraints visible and linkable: every active filter is a pill, and a copied URL reproduces the view.
- Each filter encodes only the keys it owns; anything else in the URL is left alone.
- Use short Title Case names (Environment, Branch, Date Range) and specific value labels (Production, Last 7 Days), not “Custom” or “Other”.
- Offer a `suggestion` only when it's a genuinely useful default. It shows as a dashed pill until it's applied or another value is chosen.
- The picker is a combobox: arrows move, Enter picks, Escape closes and returns focus, and Backspace in an empty box goes back a step.
- Store date presets by key and resolve them with `resolveDateRange` when you query, so “Last 7 Days” stays relative.
- The picker floats under the button or pill that opened it, flips when there's no room and stays on screen on phones, where pills and options are 44px tall under touch sizing and the remove button and Back chip keep their drawn size with a 44px hit area.

## Examples

These examples keep the filters in state with `searchParams`, so they don’t change this page’s address. Leave it out in an app and the bar syncs with the URL.

### Default
“Add Filter” opens a two-step picker, and active filters show as removable pills.

```jsx
import { useState } from 'react';
import { FilterParams } from '@hyprsh/design';

const params = [
  { key: 'Environment', param: 'env', type: 'select', options: [{ value: 'production', label: 'Production' }, { value: 'preview', label: 'Preview' }] },
  { key: 'Status', param: 'status', type: 'multi-select', options: [{ value: 'ready', label: 'Ready' }, { value: 'building', label: 'Building' }, { value: 'error', label: 'Error' }] },
];

export default function Example() {
  const [search, setSearch] = useState(new URLSearchParams('status=ready,error'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <FilterParams aria-label="Filter deployments" params={params} searchParams={search} onSearchParamsChange={setSearch} />
      <code className="label-13-mono">?{decodeURIComponent(search.toString())}</code>
    </div>
  );
}
```

### Suggested Defaults
`suggestion` shows a dashed pill for a value that is likely wanted.

```jsx
import { useState } from 'react';
import { FilterParams } from '@hyprsh/design';

const params = [
  {
    key: 'Environment',
    param: 'env',
    type: 'select',
    options: [{ value: 'production', label: 'Production' }, { value: 'preview', label: 'Preview' }],
    suggestion: () => 'production',
  },
  { key: 'Branch', param: 'branch', type: 'select', options: ['main', 'staging', 'feat/tab-bar'] },
];

export default function Example() {
  const [search, setSearch] = useState(new URLSearchParams());

  return <FilterParams aria-label="Filter deployments" params={params} searchParams={search} onSearchParamsChange={setSearch} addLabel="Add Filter" />;
}
```

### Date Range
A `date-range` filter takes presets, each with a `range` function.

```jsx
import { useState } from 'react';
import { FilterParams } from '@hyprsh/design';

const day = 864e5;
const params = [
  {
    key: 'Date Range',
    param: 'range',
    type: 'date-range',
    presets: [
      { value: '24h', label: 'Last 24 Hours', range: () => ({ start: new Date(Date.now() - day), end: new Date() }) },
      { value: '7d', label: 'Last 7 Days', range: () => ({ start: new Date(Date.now() - 7 * day), end: new Date() }) },
      { value: '30d', label: 'Last 30 Days', range: () => ({ start: new Date(Date.now() - 30 * day), end: new Date() }) },
    ],
  },
];

export default function Example() {
  const [search, setSearch] = useState(new URLSearchParams('range=7d'));

  return <FilterParams aria-label="Filter by date" params={params} searchParams={search} onSearchParamsChange={setSearch} />;
}
```

### Picker Open
`defaultOpen` starts with the picker open. Use it for docs, not for an app.

```jsx
import { useState } from 'react';
import { FilterParams } from '@hyprsh/design';

const params = [
  { key: 'Branch', param: 'branch', type: 'select', options: ['main', 'staging', 'feat/tab-bar'] },
];

export default function Example() {
  const [search, setSearch] = useState(new URLSearchParams());

  return (
    <div style={{ minHeight: 240 }}>
      <FilterParams aria-label="Filter branches" params={params} searchParams={search} onSearchParamsChange={setSearch} defaultOpen />
    </div>
  );
}
```
