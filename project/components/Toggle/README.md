# Toggle

An on/off control for a single setting that takes effect immediately; it's a native checkbox with `role="switch"`, so the label toggles it too.

**You provide:** the label as `children` (or `aria-label`), and `checked` + `onChange(next)` or `defaultChecked`. Optional: `size` (`small` by default, or `medium`, `large`), `color` (`accent`, pink, by default; other hues, `blue` among them, tint the track even when off), `icon={{ checked, unchecked }}` for the thumb, `direction="switch-first"` to put the switch before the label (the label comes first by default), `labelCasing="normal"` to stop title-casing, and `disabled`.

- Name the “on” state with a short Title Case noun phrase (“Auto-Assign Domains”), not a question or a sentence.
- Apply the change right away and confirm it (a toast works). If it needs a Save button, use Checkbox instead.
- Use Checkbox for picking items in a list, and Switch (the segmented control) to choose between 2–3 views.
- Disable a toggle only when the change is impossible, and say why nearby.
- The thumb moves as well as changing colour, so state isn't shown by colour alone.
