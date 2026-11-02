# TitleBar

The header of a phone-width screen: a centred title, an optional back button and trailing actions. Its surface is translucent and blurred like the TabBar's, so content scrolling under it shows through.

**You provide:** `title` (a node, drawn as the screen's heading). Optional: `back` (`{ label?, onClick?, href? }`), `actions` (icon buttons), `opaque` (`false` by default), `hideFrom` (`'sm'` by default; `false` shows it at every width) and `headingLevel` (`1` by default; `2` or `3`).

- Use it at the top of each screen at phone width, with a TabBar below for the app's main screens. From `sm` up use a rail or sidebar for navigation and a pane header for the content.
- The title is the screen's heading, so a screen has one `h1`. When the bar sits inside a section of a larger page, set `headingLevel` to fit the outline.
- The title is centred in the bar even when only one side has content, and is truncated with an ellipsis when it doesn't fit. Keep it to a few words.
- `back` draws a chevron icon button. `label` is its accessible name and defaults to “Back”: name where it goes when that helps (“Projects”). With `href` it is a link; otherwise give it `onClick`. Show it on a pushed screen, not on a top-level one.
- `actions` is a slot for icon buttons: pass `Button` with `svgOnly`, `variant="tertiary"` and an `aria-label`. Keep it to one or two. The back button and the actions are at least `--touch-target` in both directions at every width.
- The bar is `position: sticky` at the top of its scroll container, with `env(safe-area-inset-top)` padding, and has a hairline at its bottom edge. Put it as the first child of the element that scrolls. It takes its own space in the flow.
- The surface is `background-100` at 85% opacity with a blur. It is solid, a plain `background-100` fill with no blur, under `prefers-reduced-transparency: reduce` and in browsers without `backdrop-filter`. Set `opaque` to keep it solid everywhere.
- Don't put a search field or a large collapsing title in it.

## Examples

### Top-Level Screen
A title with one trailing action and no back button.

```jsx
import { Button, TitleBar } from '@hyprsh/design';
import { Plus } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ width: 375, maxWidth: '100%', border: '1px solid var(--gray-alpha-400)', borderRadius: 24, overflow: 'hidden', boxSizing: 'border-box' }}>
      <TitleBar
        hideFrom={false}
        title="Projects"
        actions={<Button svgOnly variant="tertiary" aria-label="New Project"><Plus /></Button>}
      />
    </div>
  );
}
```

### Pushed Screen
A back button, a title and one action. `back.label` names where the button goes.

```jsx
import { Button, TitleBar } from '@hyprsh/design';
import { Share } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ width: 375, maxWidth: '100%', border: '1px solid var(--gray-alpha-400)', borderRadius: 24, overflow: 'hidden', boxSizing: 'border-box' }}>
      <TitleBar
        hideFrom={false}
        back={{ label: 'Projects', onClick: () => {} }}
        title="docs-site"
        actions={<Button svgOnly variant="tertiary" aria-label="Share"><Share /></Button>}
      />
    </div>
  );
}
```

### Back Link
With `href` the back button is a link.

```jsx
import { TitleBar } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: 375, maxWidth: '100%', border: '1px solid var(--gray-alpha-400)', borderRadius: 24, overflow: 'hidden', boxSizing: 'border-box' }}>
      <TitleBar hideFrom={false} back={{ href: '/projects' }} title="Domains" />
    </div>
  );
}
```

### Long Title
The title stays centred and is truncated with an ellipsis.

```jsx
import { Button, TitleBar } from '@hyprsh/design';
import { Ellipsis, Share } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ width: 375, maxWidth: '100%', border: '1px solid var(--gray-alpha-400)', borderRadius: 24, overflow: 'hidden', boxSizing: 'border-box' }}>
      <TitleBar
        hideFrom={false}
        back={{ onClick: () => {} }}
        title="Preview deployment for feat/title-bar in the docs site"
        actions={(
          <>
            <Button svgOnly variant="tertiary" aria-label="Share"><Share /></Button>
            <Button svgOnly variant="tertiary" aria-label="More"><Ellipsis /></Button>
          </>
        )}
      />
    </div>
  );
}
```

### With a Tab Bar
A phone screen with a TitleBar sticky at the top of the scrolling content and a floating TabBar below. Pad the content with `--tab-bar-height`; the TabBar here is placed in its frame with `position: absolute`.

```jsx
import { Button, TabBar, TitleBar } from '@hyprsh/design';
import { Activity, Globe, Layers, Plus } from 'lucide-react';

const rows = ['Deployed main to production', 'Preview ready for docs', 'Domain verified', 'Build failed on feat/title-bar', 'Branch merged', 'Preview ready for api'];

export default function Example() {
  return (
    <div style={{ position: 'relative', width: 375, maxWidth: '100%', height: 320, overflow: 'hidden', border: '1px solid var(--gray-alpha-400)', borderRadius: 24, boxSizing: 'border-box' }}>
      <div tabIndex={0} role="region" aria-label="Activity feed" style={{ height: '100%', overflowY: 'auto', paddingBottom: 'var(--tab-bar-height)', boxSizing: 'border-box' }}>
        <TitleBar
          hideFrom={false}
          title="Activity"
          actions={<Button svgOnly variant="tertiary" aria-label="New Deployment"><Plus /></Button>}
        />
        <div className="copy-14" style={{ padding: '16px 24px 0' }}>
          {rows.map((text) => <p key={text} style={{ margin: '0 0 24px' }}>{text}</p>)}
        </div>
      </div>
      <TabBar label="Screens" hideFrom={false} style={{ position: 'absolute' }} defaultValue="activity">
        <TabBar.Item value="projects" label="Projects" icon={<Layers />} />
        <TabBar.Item value="domains" label="Domains" icon={<Globe />} />
        <TabBar.Item value="activity" label="Activity" icon={<Activity />} />
      </TabBar>
    </div>
  );
}
```
