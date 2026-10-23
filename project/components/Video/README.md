# Video

A short product clip with a small floating bar: play/pause, the current time, a seek slider and the length.

**You provide:** `src`, plus `aria-label` describing what the clip shows. By default it's muted, loops, plays inline and autoplays once it's near the viewport. Pass `width` and `height` as numbers to set the aspect ratio (16:9 otherwise).

- Use it for silent demos of a flow: a deploy going green, a command palette opening. It isn't a media player for talks or tutorials with sound. Link to those instead.
- The file only loads when the player comes within 200px of the viewport (`lazy`), so a page full of clips stays light. Give it a `poster` so the frame isn't empty before then.
- It never autoplays when the reader prefers reduced motion. The bar stays up so they can press Play.
- The bar shows while the clip is paused and fades out while it plays, coming back on hover or when anything in it has focus. On touch screens it stays up.
- Clicking the picture plays or pauses it. The button says Play or Pause, and the slider reads out “0:12 of 0:30”.
- Keep clips short (under 30 seconds) and without sound you'd miss. Muted autoplay with no captions has to make sense on its own.
- Without `src` the player draws a placeholder poster, which is handy in mock-ups. Its controls stay disabled.

## Examples

These examples have no `src`, because a component can’t load a clip from the network. Each shows the frame, the floating bar and the placeholder an app replaces with its own clip. In an app, pass `src` and describe the clip in `aria-label`.

### Default
The frame is 16:9 unless you set `width` and `height`.

```jsx
import { Video } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <Video aria-label="Placeholder for a deploy walkthrough clip" />
    </div>
  );
}
```

### Aspect Ratio
Numeric `width` and `height` set the ratio.

```jsx
import { Video } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ width: 240 }}><Video width={4} height={3} aria-label="Placeholder, 4 by 3" /></div>
      <div style={{ width: 120 }}><Video width={9} height={16} aria-label="Placeholder, 9 by 16" /></div>
    </div>
  );
}
```

### Playback Options
A clip is muted and loops by default. `autoPlay={false}` and `loop={false}` change that.

```jsx
import { Video } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <Video autoPlay={false} loop={false} muted controls aria-label="Placeholder for a rollback walkthrough clip" />
    </div>
  );
}
```
