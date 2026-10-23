# Phone

A phone-shaped frame, with bezel, island, side keys and an optional mobile browser toolbar, for showing mobile screenshots and recordings.

**You provide:** `children` for the screen (an image or video that fills it; a neutral placeholder shows without it) and optionally `address` to show a mobile browser toolbar. It scales to the width it's given, so set that on the parent (around 320px is typical).

- Use it as chrome around a mobile capture on landing pages and docs, not around live, interactive mobile UI.
- Pair it with Browser to show desktop and mobile side by side.
- Crop screen content to a real device ratio (about 19.5:9) so the bezel doesn't cut anything off. Content is `object-fit: cover`.
- The phone already has a rim, so don't add a shadow to its container.
- The frame is decorative and `aria-hidden`. Put the accessible name on the content: alt text such as “Deployments list on a phone”, not “phone mockup”.
- A video inside should respect reduced motion and show a paused poster. Use Video, which does this.
- The device is always dark hardware, in both themes.

## Examples

These examples draw the screen with plain elements, because a component can’t load an image or recording from the network.

### Default
Without children, the frame shows a neutral placeholder screen. It scales to the width you give it.

```jsx
import { Phone } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: 200 }}>
      <Phone />
    </div>
  );
}
```

### With an Address Bar
`address` adds a mobile browser toolbar.

```jsx
import { Phone } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: 200 }}>
      <Phone address="https://hyprsh.dev" />
    </div>
  );
}
```

### A Screen
Children fill the screen. Here, a deployment list.

```jsx
import { Phone } from '@hyprsh/design';

function Row({ w, h = 10, c = 'var(--gray-300)' }) {
  return <div style={{ height: h, width: w, borderRadius: 4, background: c }} />;
}

export default function Example() {
  return (
    <div style={{ width: 200 }}>
      <Phone>
        <div role="img" aria-label="Deployment list on a phone" style={{ position: 'absolute', inset: 0, background: 'var(--background-100)', padding: '56px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Row w="55%" h={14} c="var(--gray-1000)" />
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ borderRadius: 6, boxShadow: 'var(--shadow-border)', padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Row w="60%" c="var(--gray-400)" />
              <Row w="35%" h={8} c={i ? 'var(--gray-200)' : 'var(--green-700)'} />
            </div>
          ))}
        </div>
      </Phone>
    </div>
  );
}
```

### Side by Side
Two frames in a row.

```jsx
import { Phone } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div style={{ width: 160 }}><Phone address="https://hyprsh.dev" /></div>
      <div style={{ width: 160 }}><Phone address="https://docs.hyprsh.dev" /></div>
    </div>
  );
}
```
