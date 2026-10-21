# Badge

A short, static label for status, plan, environment or role that sits next to the thing it describes.

**You provide:** the text as `children`. Optional: `variant` (`gray`, `blue`, `purple`, `amber`, `red`, `pink`, `green`, `teal`, `inverted`, `trial`, `turbo`; default `gray`), `contrast="low"` for the subtle tint (the older `variant="blue-subtle"` form also works), `size` (`sm` | `md` | `lg`, default `md`; `small` | `medium` | `large` also work), an `icon` node, and `title` for an ambiguous badge.

- Badges are labels, not controls. Never put an `onClick` on one: use Pill for a link that looks like a badge, or a Button.
- For a coloured dot without text, use StatusDot.
- Use the subtle tint in dense UI and a solid fill for the one status that matters most on screen. One badge per row; two side by side usually means the row needs another column.
- The hue carries the meaning: green healthy, red error, amber warning, blue informational or production, purple new or preview, gray neutral. The text must say the same thing, so don't add a check or a cross icon as well.
- Title Case, one word if possible and two at most: “Production”, “Pro Trial”. Use the exact term the API and logs use (“Canceled”, not “Cancelled”).
- Pair lifecycle badges such as “Beta” with a Tooltip that names the limit.
- Solid fills use the brand book's fill and text pairs, so every badge holds 4.5:1 in both themes. `trial` and `turbo` are gradient fills with white text.
