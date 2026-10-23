# KeyboardInput

Shows a keyboard shortcut. Also exported as `Kbd`.

**You provide:** the key as `children`, plus `meta`, `shift`, `alt` or `ctrl` flags for modifiers. Optional: `small`, `platform` (`mac` or `other`) to override detection, and `alwaysShow`. It gets an accessible name such as “Command K”.

- Put the modifiers and the key in one KeyboardInput: `<Kbd meta shift>P</Kbd>` shows ⌘⇧P. Use a second one only for a sequence, like G then D.
- Modifiers follow the reader's platform: ⌘ ⇧ ⌥ ⌃ on macOS, Ctrl, Shift and Alt elsewhere. Write `meta` for the primary modifier and let it swap.
- One key per `children`. Punctuation in the surrounding sentence stays outside the key.
- Use `small` inside menus, inputs and buttons so the key doesn't crowd the row.
- Shortcut hints are hidden on touch-only devices (`(hover: none) and (pointer: coarse)`), where there is no keyboard to press them on. Touch laptops with a trackpad and narrow desktop windows still show them. Components that embed a hint collapse around it, so don't build your own gap next to one.
- Set `alwaysShow` only when the key itself is the content, such as a keyboard-shortcuts page. A hint is never the only label of a control: give the control its own name or glyph.

## Examples

### Default
A key with a modifier flag. It reads as “Command K” to assistive tech.

```jsx
import { KeyboardInput } from '@hyprsh/design';

export default function Example() {
  return <KeyboardInput meta>K</KeyboardInput>;
}
```

### Modifiers
Combine `meta`, `shift`, `alt` and `ctrl`.

```jsx
import { KeyboardInput } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <KeyboardInput meta shift>L</KeyboardInput>
      <KeyboardInput ctrl>C</KeyboardInput>
      <KeyboardInput alt>↵</KeyboardInput>
      <KeyboardInput>Esc</KeyboardInput>
    </div>
  );
}
```

### Small and Platform
`small` fits inside a button. `platform` overrides detection.

```jsx
import { KeyboardInput } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <KeyboardInput small meta platform="mac">K</KeyboardInput>
      <KeyboardInput small meta platform="other">K</KeyboardInput>
    </div>
  );
}
```

### Beside a Control
A hint is never the only label: the button keeps its own name. It hides on touch-only devices unless `alwaysShow`.

```jsx
import { Button, KeyboardInput } from '@hyprsh/design';

export default function Example() {
  return (
    <Button variant="secondary" suffix={<KeyboardInput meta small>K</KeyboardInput>}>Search…</Button>
  );
}
```
