# ShowMore

A centred pill button between two divider lines that reveals the rest of a list or section.

**You provide:** `expanded` and `onClick`, or leave both out and it keeps its own state (`defaultExpanded`, `onChange`). Optional: `noBorder` to drop the lines, `count` for “Show 12 More”, `moreLabel`/`lessLabel`, and `aria-controls` pointing at the list.

- Show 5 to 10 items first, then ShowMore. Truncating after 2 items hides the point of the list.
- Say how many are hidden with `count` when you know it.
- Set `aria-controls` to the list's `id`. After expanding, move focus to the first new item so keyboard users don't have to find it.
- Use LoadMoreButton instead when the next items still have to be fetched.
- Use `noBorder` where the section already has its own dividers, for example at the bottom of a card.

## Examples

### Default
A pill between two lines. It keeps its own state.

```jsx
import { ShowMore } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 360 }}>
      <ShowMore />
    </div>
  );
}
```

### Controlling a List
Keep `expanded` in state and point `aria-controls` at the list.

```jsx
import { useState } from 'react';
import { ShowMore } from '@hyprsh/design';

const domains = ['hyprsh.dev', 'docs.hyprsh.dev', 'api.hyprsh.dev', 'status.hyprsh.dev', 'blog.hyprsh.dev', 'app.hyprsh.dev', 'cdn.hyprsh.dev', 'mail.hyprsh.dev'];

export default function Example() {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? domains : domains.slice(0, 5);

  return (
    <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ul id="domain-list" className="copy-14" style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {shown.map((d) => <li key={d}>{d}</li>)}
      </ul>
      <ShowMore expanded={expanded} onClick={() => setExpanded((e) => !e)} count={domains.length - 5} aria-controls="domain-list" />
    </div>
  );
}
```

### Labels
`moreLabel` and `lessLabel` replace the defaults. `noBorder` drops the lines.

```jsx
import { ShowMore } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ShowMore moreLabel="Show All Branches" lessLabel="Show Fewer Branches" />
      <ShowMore noBorder count={12} />
    </div>
  );
}
```
