# Switch

A segmented control for choosing one of two or three views or modes; it behaves like a radio group, so arrow keys move the choice.

**You provide:** `SwitchControl` children (also `Switch.Control`), each with a `label` and a `value`, and `defaultChecked` on exactly one of them. Optional on `Switch`: `name` (generated if left out), `size` (`small` 32px, `medium` 36px by default, `large` 40px), `value` + `onChange(value)` or `defaultValue` to control it from the group, `disabled`, and `style={{ width: '100%' }}` to fill its container. Optional on a control: `icon` (shows the icon alone and keeps `label` for screen readers), `disabled`, `size`.

- Keep it to two or three options. For more, use Tabs or a Select; for a plain on/off setting, use Toggle.
- Labels are one or two Title Case words. Every control needs a `label`, even icon-only ones.
- Wrap icon-only controls in a Tooltip so sighted users get the name too.
- Use it to change what's shown right now (Source / Output, Grid / List), not to fill in a form that's saved later.
- The selected segment changes background and text weight colour, so it reads without colour alone.
