# SplitButton

A default action with a chevron beside it that opens related alternatives, such as Deploy with Deploy Without Cache.

**You provide:** the label (`children`), `buttonProps` for the default action (`onClick`, `size`, `variant` `default` | `secondary`), `menuButtonLabel` (the chevron's accessible name) and `menuItems`: `SplitButtonMenuItem` elements with `title`, optional `description`, `icon` and `menuItemProps` (`onClick`, `href`). Optional: `menuProps.width`, `menuAlignment` (`bottom-start` by default, or `bottom-end` near the right edge), `disabled`.

- Use SplitButton only when one action is clearly the usual choice and the others are variations of it. If no option dominates, use Menu; if there is only one action, use Button.
- The default action runs on its own click and never opens the menu. The chevron opens the menu and behaves exactly like Menu: arrow keys, typeahead, Escape returns focus to the chevron.
- `menuButtonLabel` names what the chevron offers, such as “More Deploy Options”, not just “More”.
- Keep it to 2–5 items. Titles are Title Case Verb + Noun, and the description is one short sentence on how the item differs from the default.
- Use the `default` variant for the main action of the page, and `secondary` everywhere else.

## Examples

### Default
A default action with a chevron that opens related alternatives.

```jsx
import { SplitButton } from '@hyprsh/design';

export default function Example() {
  return (
    <SplitButton
      menuButtonLabel="More Deploy Options"
      buttonProps={{ variant: 'default' }}
      menuItems={[
        { title: 'Deploy Without Cache', description: 'Rebuild every step from scratch.' },
        { title: 'Deploy to Preview', description: 'Skip the production alias.' },
      ]}
    >
      Deploy
    </SplitButton>
  );
}
```

### Item Parts
Compose `SplitButton.MenuItem` elements to give each item an icon and a handler.

```jsx
import { useState } from 'react';
import { SplitButton, SplitButtonMenuItem } from '@hyprsh/design';
import { GitBranch, Rocket } from 'lucide-react';

export default function Example() {
  const [last, setLast] = useState('Nothing yet');

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <SplitButton
        menuButtonLabel="More Deploy Options"
        buttonProps={{ variant: 'secondary', onClick: () => setLast('Deployed') }}
        menuItems={[
          <SplitButtonMenuItem key="cache" title="Deploy Without Cache" icon={<Rocket />} menuItemProps={{ onClick: () => setLast('Deployed without cache') }} />,
          <SplitButtonMenuItem key="branch" title="Deploy Another Branch…" icon={<GitBranch />} menuItemProps={{ onClick: () => setLast('Choosing a branch') }} />,
        ]}
      >
        Deploy
      </SplitButton>
      <span className="copy-14" role="status">Last action: {last}</span>
    </div>
  );
}
```

### Alignment
`menuAlignment="bottom-end"` opens the menu toward the end, near the right edge.

```jsx
import { SplitButton } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <SplitButton
        menuAlignment="bottom-end"
        menuButtonLabel="More Redeploy Options"
        menuProps={{ width: 220 }}
        menuItems={[{ title: 'Redeploy Without Cache' }, { title: 'Redeploy to Preview' }]}
      >
        Redeploy
      </SplitButton>
    </div>
  );
}
```

### Disabled
`disabled` turns off both the action and the chevron.

```jsx
import { SplitButton } from '@hyprsh/design';

export default function Example() {
  return (
    <SplitButton disabled menuButtonLabel="More Deploy Options" menuItems={[{ title: 'Deploy Without Cache' }]}>
      Deploy
    </SplitButton>
  );
}
```
