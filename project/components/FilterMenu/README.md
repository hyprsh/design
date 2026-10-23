# FilterMenu

A filter menu that starts empty and adds values: each row is included, or excluded, and the menu can search, group rows into sections and offer a “none” row.

**You provide:** `label` (a plural noun such as “Labels”) and the rows, either `items` (strings or `{ value, label, description, prefix, suffix, disabled }`) or `FilterMenu.Item` and `FilterMenu.Section title` parts (also `FilterMenuItem`, `FilterMenuSection`). The value is `{ include: string[], exclude: string[], none: boolean }`, empty by default, controlled with `value` + `onChange(value)` or uncontrolled with `defaultValue`. Optional: `noneLabel` (adds a none row, e.g. “No labels”), `excludable`, `searchable` (on by default above 8 rows), `size`, `align="end"`, `width`, `open`/`defaultOpen`/`onOpenChange`, `disabled`. With `single` the value is one string, `defaultOption` names the value that counts as nothing chosen, and picking a row closes the menu.

- Use it for a filter that starts empty and narrows a list by adding values: labels, authors, branches. For a filter that starts with everything selected and narrows down, use MultiSelect; for picking values in a form, use Checkboxes or a Choicebox; for one value among several in a form, use Select.
- Clicking a row, or Space or Enter on it, includes it, and again turns it off. With `excludable`, each row has an Exclude action (always shown on touch screens) and Shift+Enter excludes the highlighted row. An excluded row has a strike and a minus mark, and its name ends in “, excluded”. Excluding is for ruling values out, not for a second kind of selection.
- The none row stands for “no value at all”. Picking it clears every other value, and picking any value clears it. It can't be excluded.
- Put the likeliest values in a “Suggestions” section above the full list. While the search box has text, sections are dropped and each match is listed once, matches at the start of a word first.
- A chosen value that matches no row is shown at the top, so it can still be unchecked.
- The trigger shows the label when nothing is chosen, the value when there is one (“bug”, “Not bug”), and “Labels · 3” for more. It gets an active style while anything is chosen. Its accessible name lists the selection (“Labels: bug, not docs”), and it has `aria-expanded` but not `aria-pressed`.
- `single` suits sort menus: the trigger reads “Sort: Newest” and is only styled as active when the option isn't `defaultOption`.
- The search box is a combobox over a listbox: focus stays in it, `aria-activedescendant` follows the highlight, and without search focus goes to the listbox itself. Arrow keys, Home and End move the highlight; Escape closes and returns focus to the trigger; Tab closes. Each change is announced (“bug included”, “bug excluded”, “bug removed”, “No labels selected”).
- The panel floats above the page, flips above the trigger when there's no room below and stays 8px inside the screen on phones, where rows are 44px tall under touch sizing.

## Examples

### Default
A menu that starts empty. Each row you check is included.

```jsx
import { FilterMenu } from '@hyprsh/design';

export default function Example() {
  return <FilterMenu label="Labels" items={['bug', 'docs', 'enhancement', 'wontfix']} />;
}
```

### Controlled
The value is `{ include, exclude, none }`. Excluding and a none row are optional.

```jsx
import { useState } from 'react';
import { FilterMenu } from '@hyprsh/design';

export default function Example() {
  const [value, setValue] = useState({ include: ['bug'], exclude: [], none: false });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <FilterMenu label="Labels" excludable noneLabel="No labels" items={['bug', 'docs', 'enhancement', 'wontfix']} value={value} onChange={setValue} />
      <span className="copy-13" role="status">
        Include: {value.include.join(', ') || 'none'} · Exclude: {value.exclude.join(', ') || 'none'}{value.none ? ' · No labels' : ''}
      </span>
    </div>
  );
}
```

### Sections and Rows
Group rows into sections and give each a description.

```jsx
import { FilterMenu } from '@hyprsh/design';

export default function Example() {
  return (
    <FilterMenu label="Environments">
      <FilterMenu.Section title="Primary">
        <FilterMenu.Item value="production" label="Production" description="Serves live traffic" />
      </FilterMenu.Section>
      <FilterMenu.Section title="Other">
        <FilterMenu.Item value="preview" label="Preview" />
        <FilterMenu.Item value="development" label="Development" />
      </FilterMenu.Section>
    </FilterMenu>
  );
}
```

### Single Choice
`single` picks one option, like a sort menu. `defaultOption` is the value that counts as nothing chosen.

```jsx
import { useState } from 'react';
import { FilterMenu } from '@hyprsh/design';

export default function Example() {
  const [sort, setSort] = useState('newest');

  return (
    <FilterMenu
      single
      label="Sort"
      defaultOption="newest"
      value={sort}
      onChange={setSort}
      items={[
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'comments', label: 'Most Commented' },
      ]}
    />
  );
}
```

### Sizes and Disabled
`size` follows the control scale.

```jsx
import { FilterMenu } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <FilterMenu size="small" label="Branches" items={['main', 'staging']} />
      <FilterMenu size="large" label="Branches" items={['main', 'staging']} />
      <FilterMenu disabled label="Branches" items={['main', 'staging']} />
    </div>
  );
}
```
