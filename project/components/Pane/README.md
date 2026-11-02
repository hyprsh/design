# Pane

One region of a screen: a header, a body that scrolls on its own, and a footer.

**You provide:** the body as `children`. Optional: `header`, `footer` (both nodes), `label` (names the body for assistive tech), `className` and `style`. A Pane fills its container's height, so the container needs one, for example `100dvh` on the screen or a fixed height in a frame.

- **Fixed bars:** the header and footer never scroll. A hairline divides each from the body. Leave either off and the body takes the space.
- **The body scrolls, not the page:** the body is the pane's scroll container. It is a focusable region, so keyboard users can scroll it with the arrow keys. Give it a `label` (“Deployments”) when a screen has more than one Pane: it becomes a named region.
- **With an ActionBar:** put an ActionBar as the last child of the body and it sticks to the pane's foot while there are more rows above it, without covering the last row.
- **Surface:** a Pane is `background-100`. To use `background-200` as app chrome (usually the list pane of a SplitView), set `--hy-pane-background: var(--background-200)` through `style` or your own class. The detail stays `background-100`.
- **On its own:** a Pane works without a SplitView, for a single-pane screen. Put it in a SplitView to put a list beside a detail.
- Use Scroller for a scrolling strip inside a Pane's content. A Pane is for a region of the screen.
- Put long or wide content inside the body, not the header: the header stays one row, with `min-height` 48px, and the title and actions in it should truncate.

## Examples

### Header, Body and Footer
The header and footer stay while the body scrolls.

```jsx
import { Button, Pane } from '@hyprsh/design';

const deployments = ['Production', 'Preview for docs', 'Preview for api', 'Preview for billing', 'Production', 'Preview for teams', 'Preview for edge', 'Production'];

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 420, height: 280, border: '1px solid var(--gray-alpha-400)', borderRadius: 8, overflow: 'hidden' }}>
      <Pane
        label="Deployments"
        header={<strong className="label-14">Deployments</strong>}
        footer={<Button size="small" variant="secondary">Load More</Button>}
      >
        {deployments.map((name, i) => (
          <p key={i} className="copy-14" style={{ margin: 0, padding: '12px 16px', borderBottom: '1px solid var(--gray-alpha-400)' }}>{name}</p>
        ))}
      </Pane>
    </div>
  );
}
```

### With an Action Bar
An ActionBar at the end of the body stays at the pane's foot, above the footer.

```jsx
import { ActionBar, Button, Pane } from '@hyprsh/design';

const domains = ['hyprsh.dev', 'docs.hyprsh.dev', 'api.hyprsh.dev', 'status.hyprsh.dev', 'blog.hyprsh.dev', 'app.hyprsh.dev', 'cdn.hyprsh.dev'];

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 420, height: 280, border: '1px solid var(--gray-alpha-400)', borderRadius: 8, overflow: 'hidden' }}>
      <Pane label="Domains" header={<strong className="label-14">Domains</strong>} footer={<span className="copy-13">7 domains</span>}>
        {domains.map((name) => (
          <p key={name} className="copy-14" style={{ margin: 0, padding: '12px 16px', borderBottom: '1px solid var(--gray-alpha-400)' }}>{name}</p>
        ))}
        <ActionBar
          open
          label="2 unsaved changes"
          actions={
            <>
              <Button size="small" variant="tertiary">Discard</Button>
              <Button size="small" variant="primary">Save</Button>
            </>
          }
        />
      </Pane>
    </div>
  );
}
```

### App Chrome Surface
`--hy-pane-background` sets the pane to `background-200`.

```jsx
import { Pane } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 420, height: 160, border: '1px solid var(--gray-alpha-400)', borderRadius: 8, overflow: 'hidden' }}>
      <Pane label="Projects" header={<strong className="label-14">Projects</strong>} style={{ '--hy-pane-background': 'var(--background-200)' }}>
        <p className="copy-14" style={{ margin: 0, padding: 16 }}>hyprsh-docs</p>
      </Pane>
    </div>
  );
}
```
