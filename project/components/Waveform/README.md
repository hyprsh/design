# Waveform

A static, decorative waveform that draws an audio clip's levels and how much of it has played.

**You provide:** `levels`, an array of numbers from 0 (silent) to 1 (loudest), one bar each. Optional: `progress` from 0 to 1 (default 0), the fraction of bars drawn in the played colour, and `height` in px (default 32). It fills the width of its container.

- Use it next to an audio player, such as a voice message with a play Button. It only draws the bars: decode the audio and compute the levels yourself.
- Silent entries still draw a minimal bar so the clip's length stays visible. Levels and `progress` outside 0–1 are clamped.
- It is decorative: `aria-hidden`, not focusable and with no pointer handling. The player next to it carries the name, time and controls, so don't use it to seek.
- Played bars use gray-1000 and unplayed bars a lighter gray, so it reads in light and dark themes.

## Examples

### Default
Bars rise and fall with the clip's levels.

```jsx
import { Waveform } from '@hyprsh/design';

const levels = [0.2, 0.4, 0.7, 0.5, 0.9, 0.6, 0.3, 0.8, 1, 0.55, 0.35, 0.65, 0.45, 0.25, 0.1, 0.3];

export default function Example() {
  return (
    <div style={{ width: 280, maxWidth: '100%' }}>
      <Waveform levels={levels} />
    </div>
  );
}
```

### Progress
`progress` colours the bars that have played.

```jsx
import { Waveform } from '@hyprsh/design';

const levels = [0.2, 0.4, 0.7, 0.5, 0.9, 0.6, 0.3, 0.8, 1, 0.55, 0.35, 0.65, 0.45, 0.25, 0.1, 0.3];

export default function Example() {
  return (
    <div style={{ width: 280, maxWidth: '100%' }}>
      <Waveform levels={levels} progress={0.5} />
    </div>
  );
}
```

### Height
`height` sets the tallest a bar can be, in px.

```jsx
import { Waveform } from '@hyprsh/design';

const levels = [0.3, 0.6, 0.9, 0.5, 0.7, 1, 0.4, 0.2, 0.6, 0.8, 0.35, 0.15];

export default function Example() {
  return (
    <div style={{ width: 240, maxWidth: '100%' }}>
      <Waveform levels={levels} progress={0.33} height={56} />
    </div>
  );
}
```

### Next to a Play Button
The Button carries the name and control; the waveform only shows the clip.

```jsx
import { useState } from 'react';
import { Button, Waveform } from '@hyprsh/design';
import { Pause, Play } from 'lucide-react';

const levels = [0.2, 0.4, 0.7, 0.5, 0.9, 0.6, 0.3, 0.8, 1, 0.55, 0.35, 0.65, 0.45, 0.25, 0.1, 0.3, 0.5, 0.7, 0.4, 0.2];

export default function Example() {
  const [playing, setPlaying] = useState(false);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 320, maxWidth: '100%' }}>
      <Button
        variant="secondary"
        aria-label={playing ? 'Pause Voice Message' : 'Play Voice Message'}
        onClick={() => setPlaying(!playing)}
      >
        {playing ? <Pause /> : <Play />}
      </Button>
      <Waveform levels={levels} progress={0.35} />
    </div>
  );
}
```
