# MonthView

A month of days that each list their entries, for browsing what happens when.

**You provide:** `entries` (each `{ key, date, label, tone?, href?, onOpen? }`). Optional: `month` / `defaultMonth` / `onMonthChange` (any date in the month shown, today by default; the callback gets the first of the new month), `maxPerDay` (entries a day shows before “+N more”, default 3), `onDayOpen(date)`, `selectedDate` / `defaultSelectedDate` / `onSelectedDateChange` (the selected day in the narrow form), `firstDayOfWeek` (0 = Sunday, the default, to 6) and `locale` (month and weekday names; the user's by default, the same props as Calendar) and `label` (names the grid).

- Use it to browse app entries by day: deployments, releases, maintenance windows. To pick a date, use Calendar.
- The grid fills out whole weeks, so the leading and trailing days of the neighbouring months show quieter. Today has a ring and heavier digits.
- The header has the month and year, then Previous Month, Next Month and Today buttons.
- Entries show in the order given. An entry with `href` is a link, one with `onOpen` is a button and one with neither is text. A `tone` adds a small leading mark in the tone's colour; the label carries the meaning, so write it to stand alone.
- Activating a day or its “+N more” calls `onDayOpen(date)`, so the app can show the day's full list.
- The days are a grid with one Tab stop. Arrows move by day, Page Up and Page Down by month, Home and End to the start and end of the week, and Enter opens the day. Tab from the focused day walks its entries and “+N more”; the next Tab leaves the grid. Each day is named like “Tuesday 4 November, 3 entries”.
- Narrow: when the component itself is under 640px (the `sm` width) each day shows a number and up to three dots, one per entry. A day selects instead of opening, and that day's entries list below the grid with their links and buttons. Place it in a container, not the viewport, to decide: a wide viewport with a narrow column gets the narrow form.
- Don't use it for week or day views, to drag entries between days or for entries that span days.

## Examples

### Deployments By Day
A month with links, buttons and plain entries. The day list opens from a day or “+N more”.

```jsx
import { useState } from 'react';
import { MonthView } from '@hyprsh/design';

const now = new Date();
const on = (day) => new Date(now.getFullYear(), now.getMonth(), day, 10);
const entries = [
  { key: 'a', date: on(3), label: 'Deploy web', tone: 'success', href: '#deploy-web' },
  { key: 'b', date: on(6), label: 'Release v2.4', tone: 'info', onOpen: () => {} },
  { key: 'c', date: on(9), label: 'Maintenance window', tone: 'warning' },
  { key: 'd', date: on(12), label: 'Deploy api', tone: 'error', href: '#deploy-api' },
];

export default function Example() {
  const [opened, setOpened] = useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <MonthView entries={entries} label="Deployments" onDayOpen={setOpened} />
      <span className="copy-13">{opened ? opened.toDateString() : 'No day opened'}</span>
    </div>
  );
}
```

### More Than Fits
Three entries show, then “+2 more”.

```jsx
import { MonthView } from '@hyprsh/design';

const now = new Date();
const on = (day) => new Date(now.getFullYear(), now.getMonth(), day, 10);
const entries = ['Deploy web', 'Deploy api', 'Deploy docs', 'Cache purge', 'Database upgrade'].map((label, i) => ({
  key: 'e' + i, date: on(12), label, tone: i === 4 ? 'warning' : 'success',
}));

export default function Example() {
  return <MonthView entries={entries} maxPerDay={3} label="Busy Day" />;
}
```

### Week Starting Monday
`firstDayOfWeek` and `locale` work as they do on Calendar.

```jsx
import { MonthView } from '@hyprsh/design';

export default function Example() {
  return <MonthView entries={[]} firstDayOfWeek={1} locale="en-GB" label="Releases" />;
}
```

### Controlled Month
The app owns the month, for example to load that month's entries.

```jsx
import { useState } from 'react';
import { MonthView } from '@hyprsh/design';

export default function Example() {
  const [month, setMonth] = useState(new Date());
  return <MonthView month={month} onMonthChange={setMonth} entries={[]} label="Releases" />;
}
```

### Narrow Form
In a column under 640px, days show dots and the selected day's entries list below.

```jsx
import { MonthView } from '@hyprsh/design';

const now = new Date();
const on = (day) => new Date(now.getFullYear(), now.getMonth(), day, 10);
const entries = [
  { key: 'a', date: on(12), label: 'Deploy web', tone: 'success', href: '#deploy-web' },
  { key: 'b', date: on(12), label: 'Release v2.5', tone: 'info', onOpen: () => {} },
];

export default function Example() {
  return (
    <div style={{ width: 340 }}>
      <MonthView entries={entries} defaultSelectedDate={on(12)} label="Releases" />
    </div>
  );
}
```
