# Button

Triggers an action such as submitting a form, starting a deploy or opening a dialog.

**You provide:** the label (`children`) and `onClick`. Optional: `variant` (`default` | `secondary` | `tertiary` | `error` | `warning`, default `secondary`; `primary` is the same as `default`), `size` (`tiny` 24px for icons | `small` 32px | `medium` 36px | `large` 40px), `shape` (`square` | `circle` | `rounded`), `shadow`, `prefix`/`suffix` nodes (a plain `<svg>` such as a Lucide component is sized to the button: 16px, 14px on `tiny`; `Icon` keeps its own `size`), `loading`, `disabled`, `svgOnly` (with an `aria-label`), `typeName` for the HTML type (`submit`), and `width`. Use `ButtonLink` (or `href` on Button) for navigation with the same look. Other attributes pass through, and the ref reaches the element.

- Use Button for actions that change something (Deploy, Save, Delete) and ButtonLink for anything that changes the URL. When several related actions share a row, reach for Menu or SplitButton instead.
- One `default` (solid) button per view, for the thing the page is for. Use `secondary` for supporting actions, `tertiary` in toolbars and rows, and `error` only for confirmed destructive actions.
- Pass `loading` instead of swapping in your own spinner: the label stays, the button is busy and can't be pressed twice.
- Disable only when the action is impossible right now, and say why nearby or in a Tooltip.
- Labels are Title Case and name the result: “Deploy Project”, “Invite Member”, “Rotate Key”. Never “Submit”, “OK” or “Confirm”. A label that opens a follow-up ends with “…”.
- Icon-only buttons need `svgOnly` and an `aria-label` that names the action and its target (“Copy Deployment URL”, not “Copy”). Don't add an `aria-label` to a button that already has visible text.
- `shape="rounded"` with `shadow` is a marketing look; keep product UI square.
- Under touch sizing `small` and `medium` buttons are 44px tall (icon-only ones 44px wide too), `large` stays 48px, and `tiny` keeps its drawn size with a 44px hit area.
