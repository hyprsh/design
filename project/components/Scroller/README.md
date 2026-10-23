# Scroller

A scroll area for an overflowing list of peer items on one axis (or both), with edge fades and optional step buttons.

**You provide:** `children`, `overflow` (`"y"` by default, `"x"` or `"both"`), `width` and `height` (px numbers or CSS lengths). Optional: `withButtons` to step between direct children, `childrenContainerClassName` for the gap between them, and `aria-label` to name the region and its buttons.

- Use vertical for stacked feeds and logs, horizontal for rails of chips or tiles, and `both` only when the content really runs both ways, such as logs with very long lines.
- Hundreds of items belong in a virtualised list inside the Scroller, not as plain DOM nodes.
- The buttons step to *direct* children, so don't wrap the items in an extra layout node.
- The edge fade appears only on a side that has more content. Fades blend into `background-100`; set `--hy-scroller-fade` when the Scroller sits on another surface.
- Keep item widths and gaps even on a horizontal rail, so it steps with a steady rhythm.
- Put items in reading order: tab order follows the DOM, and focusing an off-screen item scrolls it into view. When the content overflows, the scroll area itself takes focus so the arrow keys can scroll it.
- Name the buttons by their content with `aria-label` (“Scroll Deployments Right”), not a bare “Next”.

## Examples

### Vertical
A scroll area with edge fades. Give it a height.

```jsx
import { Scroller } from '@hyprsh/design';

const events = ['Deployed main to production', 'Preview ready for docs', 'Domain verified', 'Build failed on feat/tab-bar', 'Branch merged', 'Preview ready for api', 'Cache cleared'];

export default function Example() {
  return (
    <Scroller aria-label="Activity" height={140} width={320}>
      {events.map((e) => <p key={e} className="copy-14" style={{ margin: '0 0 12px' }}>{e}</p>)}
    </Scroller>
  );
}
```

### Horizontal with Buttons
`overflow="x"` with `withButtons` steps between children.

```jsx
import { Scroller } from '@hyprsh/design';

const branches = ['main', 'staging', 'feat/tab-bar', 'feat/search', 'release', 'docs/search', 'fix/cache'];

export default function Example() {
  return (
    <Scroller aria-label="Branches" overflow="x" withButtons width={360}>
      {branches.map((b) => <span key={b} className="label-14-mono" style={{ whiteSpace: 'nowrap', padding: '4px 8px', marginRight: 8, boxShadow: 'var(--shadow-border)', borderRadius: 6 }}>{b}</span>)}
    </Scroller>
  );
}
```

### Both Axes
`overflow="both"` scrolls either way.

```jsx
import { Scroller } from '@hyprsh/design';

export default function Example() {
  return (
    <Scroller aria-label="Wide log" overflow="both" height={120} width={320}>
      <div className="label-13-mono" style={{ whiteSpace: 'pre' }}>
        {Array.from({ length: 12 }, (_, i) => `${String(i + 1).padStart(2, '0')}  GET /api/deployments?page=${i + 1} 200 in ${30 + i}ms from iad1 cache HIT`).join('\n')}
      </div>
    </Scroller>
  );
}
```
