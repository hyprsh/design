# ThemeSwitcher

Three icon radios (System, Light and Dark), or one cycling icon button, that set the page theme. Picking one sets `data-theme` (and/or a `.dark`/`.light` class) and `color-scheme` on `<html>` and saves the choice.

**You provide:** nothing, usually. It reads the saved choice (or the page's current `data-theme`) on mount and changes nothing then. After that it changes the page when the reader picks, or when the OS theme changes while System is the choice. Use `value`/`onChange` to drive it from your own state, and `storageKey` to rename or turn off (`null`) the saved key. `attribute` chooses what is written on `<html>`: `'data-theme'` (default), `'class'`, or `'both'` (or `['data-theme', 'class']`). `variant` is `'radios'` (default) or `'cycle'`.

- Put it in a footer or a settings menu, not in the main toolbar. People set it once.
- System follows the operating system and keeps following it live while it's the choice, including after a reload with System saved. Light and Dark pin the theme.
- Apply the saved theme in a small inline script in `<head>` too, before the page paints, so a reload doesn't flash the wrong theme. `themeScript({ storageKey, attribute })` returns that script as a string, built from the same code the component uses, so the two can't drift.
- It's a real radio group: Tab moves into it, the arrow keys move between options, and each option has a name (“System”, “Light”, “Dark”) and a tooltip.
- `size="small"` (24px) suits menus and dense footers. `disabled` greys the whole group.

## Class-based dark mode

Apps that style dark mode with a `.dark` class (Tailwind's class strategy) should pass `attribute="class"`. Light removes `.dark` and adds `.light`, Dark does the reverse, and `data-theme` is removed so only one mechanism is in play. Use `'both'` to keep `data-theme` and the class in step.

## Cycle variant

`variant="cycle"` is a single icon button for narrow rails and toolbars. Each press moves System → Light → Dark → System. The icon shows the current choice, the button is named “Theme: Dark” (and so on), and a Tooltip shows the same text. It takes the same `value`, `defaultValue`, `onChange`, `storageKey`, `attribute`, `size` and `disabled` props; the button is at least 44px under touch sizing.

`size` maps straight onto `Button`'s sizes: `medium` (the default) is 36px, like a default Button, and `small` is 32px. Earlier versions rendered one step down (32px by default, 24px for `small`), so existing cycle users get a 4px bigger button by default; pass `size="small"` to keep the old 32px. The icon is 16px at both sizes. The radios keep their own sizes (32px, or 24px for `small`).

The Tooltip opens above by default. In a vertical rail pass `tooltipPosition="right"` (`'top'`, `'bottom'`, `'left'` or `'right'`) so it matches the other buttons, or `tooltip={false}` to get the bare button and wrap it in your own Tooltip.

## Pre-paint script

```jsx
import { themeScript } from '@hyprsh/design';

<script dangerouslySetInnerHTML={{ __html: themeScript({ attribute: 'class' }) }} />
```

In a plain `index.html`, call `Hyprsh.themeScript({ attribute: 'class' })` while building the page, or paste its output into a `<script>` in `<head>`. Pass the same `storageKey` and `attribute` you give the component (defaults `'theme'` and `'data-theme'`).

## Examples

Picking a theme in these examples changes this page’s own theme, because the component sets `data-theme` on `<html>`. They pass `storageKey={null}` so nothing is saved, and the page’s own saved choice comes back on the next load.

### Radios
Three icon radios: System, Light and Dark.

```jsx
import { ThemeSwitcher } from '@hyprsh/design';

export default function Example() {
  return <ThemeSwitcher storageKey={null} />;
}
```

### Cycle
One icon button that cycles through the choices.

```jsx
import { ThemeSwitcher } from '@hyprsh/design';

export default function Example() {
  return <ThemeSwitcher storageKey={null} variant="cycle" />;
}
```

### Sizes and Disabled
Small and medium, and a disabled switcher.

```jsx
import { ThemeSwitcher } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
      <ThemeSwitcher storageKey={null} size="small" />
      <ThemeSwitcher storageKey={null} size="medium" />
      <ThemeSwitcher storageKey={null} disabled defaultValue="dark" />
    </div>
  );
}
```

### Driven by Your Own State
`value` and `onChange` keep the choice in your state.

```jsx
import { useState } from 'react';
import { ThemeSwitcher } from '@hyprsh/design';

export default function Example() {
  const [theme, setTheme] = useState('system');

  return (
    <div className="copy-14" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <ThemeSwitcher storageKey={null} value={theme} onChange={setTheme} />
      <span role="status">Choice: {theme}</span>
    </div>
  );
}
```
