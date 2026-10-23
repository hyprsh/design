# Calendar

A date-range (or single date) picker: a trigger that shows the chosen dates, and a popover with a month grid, Start and End fields, and Apply.

**You provide:** `value` + `onChange` or `defaultValue`, as `{ start, end }` Dates (or one Date with `mode="single"`). Optional: `presets` (a keyed object or array of `{ text, start, end }`, shown in a “Select Period” select joined to the trigger, above it with `stacked`, or as a chevron with `compact`), `allowClear`, `minValue`/`maxValue`, `showTimeInput` (on by default), `showTimezone` and `pinnedTimezone`, `horizontalLayout`, `popoverAlignment` (`start` by default), `size` (`small` or `medium`), `firstDayOfWeek` (Sunday), `locale`, `placeholder`.

- Offer presets for the ranges people pick most (“Last 7 Days”, “Last 30 Days”); they're quicker than the grid.
- Set `minValue`/`maxValue` to the data you actually have, so empty ranges can't be picked.
- Month, weekday and date names follow the user's locale through Intl; dates aren't hard-coded in English.
- Persist the chosen range (in the URL or settings) so it survives a reload.
- Keyboard: arrows move a day, Up/Down a week, Page Up/Down a month (with Shift, a year), Home/End the week; Enter picks. Escape closes and returns to the trigger.

## Examples

### Date Range
A trigger that shows the chosen dates and opens a month grid.

```jsx
import { useState } from 'react';
import { Calendar } from '@hyprsh/design';

function day(offset) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

export default function Example() {
  const [range, setRange] = useState({ start: day(-6), end: day(0) });

  return (
    <div style={{ width: 340 }}>
      <Calendar aria-label="Date range" value={range} onChange={setRange} showTimeInput={false} maxValue={day(0)} />
    </div>
  );
}
```

### Presets
`presets` adds a “Select Period” select joined to the trigger.

```jsx
import { Calendar } from '@hyprsh/design';

function day(offset) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

const presets = {
  last7: { text: 'Last 7 Days', start: day(-6), end: day(0) },
  last30: { text: 'Last 30 Days', start: day(-29), end: day(0) },
  last90: { text: 'Last 90 Days', start: day(-89), end: day(0) },
};

export default function Example() {
  return (
    <div style={{ width: 340 }}>
      <Calendar aria-label="Reporting period" presets={presets} size="small" showTimeInput={false} maxValue={day(0)} />
    </div>
  );
}
```

### Compact Presets
`compact` folds the presets into a chevron on the trigger.

```jsx
import { Calendar } from '@hyprsh/design';

function day(offset) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

const presets = [
  { text: 'Last 24 Hours', start: day(-1), end: day(0) },
  { text: 'Last 7 Days', start: day(-6), end: day(0) },
];

export default function Example() {
  return (
    <div style={{ width: 340 }}>
      <Calendar aria-label="Log period" presets={presets} compact size="small" />
    </div>
  );
}
```

### Single Date
`mode="single"` picks one Date. `allowClear` adds a way back to nothing.

```jsx
import { useState } from 'react';
import { Calendar } from '@hyprsh/design';

export default function Example() {
  const [date, setDate] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 340 }}>
      <Calendar aria-label="Release date" mode="single" allowClear placeholder="Select a date…" showTimeInput={false} value={date} onChange={setDate} />
      <span className="copy-13" role="status">{date ? `Release on ${new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(date)}` : 'No release date'}</span>
    </div>
  );
}
```

### Disabled
A disabled picker shows its value and can’t be opened.

```jsx
import { Calendar } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: 340 }}>
      <Calendar aria-label="Billing period" disabled placeholder="Billing period" />
    </div>
  );
}
```
