# Slider

A track with one thumb for a value or two for a range, with optional number fields beside it for exact input.

**You provide:** `value` + `onValueChange` or `defaultValue` (a number, or `[start, end]` for a range), and `label` or `aria-label`. Optional: `min` (0), `max` (100), `step` (1), `showStartInput` / `showEndInput` for number fields, `onValueCommitted` for when a drag or edit finishes, `formatValue` for screen-reader text, `width` (216px), `name`, `disabled`.

- Use it when the rough position matters more than the exact number (volume, a percentage, a size range). For exact values, pair it with the number fields or use an Input.
- Pick a `step` that snaps to sensible values, and show the live value next to the track.
- Save on `onValueCommitted`, not on every move.
- Arrow keys step, Page Up/Down jump, Home/End go to the ends; the number fields accept typing and arrow keys too.
