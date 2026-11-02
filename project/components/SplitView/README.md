# SplitView

A list pane beside a detail pane, showing one pane at a time at phone width.

**You provide:** exactly two children, the list and then the detail, normally both `Pane`s. Optional: `listWidth` (a number in px, or any CSS length, `320` by default), `show` (`'list'` or `'detail'`, `'list'` by default), `className` and `style`. The container needs a height, for example `100dvh`, because a SplitView fills it.

- **From `sm` (640px) up:** the list is a column of `listWidth` and the detail fills the rest, with a vertical divider between them. Each pane scrolls on its own. `show` has no effect here.
- **Below `sm`:** one pane shows at a time, chosen by the controlled `show`. The app switches it, usually with a back button in the detail's header. Set `show="detail"` when an item is open and `show="list"` when none is. The hidden pane is out of the accessibility tree and the Tab order, but keeps its scroll position, so the list is where the user left it when they come back. There is no transition.
- **Surfaces:** the list can be app chrome. Set `--hy-pane-background: var(--background-200)` on the list Pane (through its `style` or your class) and leave the detail on `background-100`.
- **Not resizable:** the column width is fixed. There is no drag handle, no third pane, and no routing: keep which item is open in the URL yourself.
- Use a Pane alone for a screen with one region. Use a NavList in the list pane for destinations, or an Entity.List for items.

## Examples

### List and Detail
Rows in the list pane, the open item in the detail. From `sm` up they sit side by side; below it only one shows.

```jsx
import { useState } from 'react';
import { Entity, EntityContent, EntityList, Pane, SplitView } from '@hyprsh/design';

const projects = ['hyprsh-docs', 'hyprsh-api', 'hyprsh-edge', 'hyprsh-billing', 'hyprsh-teams', 'hyprsh-status', 'hyprsh-blog', 'hyprsh-cdn'];

export default function Example() {
  const [open, setOpen] = useState('hyprsh-docs');

  return (
    <div style={{ width: '100%', height: 320, border: '1px solid var(--gray-alpha-400)', borderRadius: 8, overflow: 'hidden' }}>
      <SplitView listWidth={220} show={open ? 'detail' : 'list'}>
        <Pane label="Projects" header={<strong className="label-14">Projects</strong>} style={{ '--hy-pane-background': 'var(--background-200)' }}>
          <EntityList aria-label="Projects">
            {projects.map((name) => (
              <Entity key={name} as="button" current={name === open} onClick={() => setOpen(name)}>
                <EntityContent title={name} fill />
              </Entity>
            ))}
          </EntityList>
        </Pane>
        <Pane label="Project" header={<strong className="label-14">{open}</strong>} footer={<span className="copy-13">Updated 2 minutes ago</span>}>
          <p className="copy-14" style={{ margin: 0, padding: 16 }}>Deployments, domains and settings for {open}.</p>
        </Pane>
      </SplitView>
    </div>
  );
}
```

### Back To The List
Below `sm` the detail replaces the list. The app owns `show` and switches it from a back button.

```jsx
import { useState } from 'react';
import { Button, Pane, SplitView } from '@hyprsh/design';

const branches = ['main', 'feat/billing', 'fix/edge-cache', 'docs/cli', 'feat/teams'];

export default function Example() {
  const [open, setOpen] = useState(null);

  return (
    <div style={{ width: '100%', maxWidth: 360, height: 280, border: '1px solid var(--gray-alpha-400)', borderRadius: 8, overflow: 'hidden' }}>
      <SplitView show={open ? 'detail' : 'list'} listWidth={140}>
        <Pane label="Branches" header={<strong className="label-14">Branches</strong>}>
          {branches.map((b) => (
            <div key={b} style={{ padding: '4px 8px' }}>
              <Button size="small" variant="tertiary" onClick={() => setOpen(b)}>{b}</Button>
            </div>
          ))}
        </Pane>
        <Pane label="Branch" header={<Button size="small" variant="tertiary" onClick={() => setOpen(null)}>Back</Button>}>
          <p className="copy-14" style={{ margin: 0, padding: 16 }}>Latest deployment of {open}.</p>
        </Pane>
      </SplitView>
    </div>
  );
}
```
