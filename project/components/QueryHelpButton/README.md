# QueryHelpButton

The “?” button that opens the Query Help popover: each qualifier's help line and the rules of the query syntax.

**You provide:** `qualifiers` (the same list `QueryInput` takes) and, to match its neighbours, `size` (`small`, `medium` by default, `large`). Its accessible name is “Query Help”.

- `QueryInput` and `QueryBar` already draw it beside the field. Use it on its own only to place it elsewhere, with `help={false}` on the field. In a `QueryBar`, `help="menus"` puts it at the end of the menu row without any code.
- Write each qualifier's `help` as one short line: that is what the popover shows. It lists nothing when there are no qualifiers, so render it only when you have some.

## Examples

### Default
The button opens a popover that explains each qualifier.

```jsx
import { QueryHelpButton } from '@hyprsh/design';

const qualifiers = [
  { name: 'is', help: 'Open or closed', values: ['open', 'closed'] },
  { name: 'label', help: 'Has this label', suggestions: ['bug', 'docs'], excludable: true },
];

export default function Example() {
  return <QueryHelpButton qualifiers={qualifiers} />;
}
```

### Beside A Title
With the field's own button hidden, the button goes wherever the layout needs it.

```jsx
import { QueryHelpButton, QueryInput } from '@hyprsh/design';

const qualifiers = [
  { name: 'is', help: 'Open or closed', values: ['open', 'closed'] },
  { name: 'label', help: 'Has this label', suggestions: ['bug', 'docs'], excludable: true },
];

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="label-14">Issues</span>
        <QueryHelpButton qualifiers={qualifiers} />
      </div>
      <QueryInput aria-label="Search issues" placeholder="Search issues…" qualifiers={qualifiers} help={false} />
    </div>
  );
}
```
