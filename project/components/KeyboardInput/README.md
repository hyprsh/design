# KeyboardInput

Shows a keyboard shortcut. Also exported as `Kbd`.

**You provide:** the key as `children`, plus `meta`, `shift`, `alt` or `ctrl` flags for modifiers. Optional: `small`, and `platform` (`mac` or `other`) to override detection. It gets an accessible name such as “Command K”.

- Put the modifiers and the key in one KeyboardInput: `<Kbd meta shift>P</Kbd>` shows ⌘⇧P. Use a second one only for a sequence, like G then D.
- Modifiers follow the reader's platform: ⌘ ⇧ ⌥ ⌃ on macOS, Ctrl, Shift and Alt elsewhere. Write `meta` for the primary modifier and let it swap.
- One key per `children`. Punctuation in the surrounding sentence stays outside the key.
- Use `small` inside menus, inputs and buttons so the key doesn't crowd the row.
