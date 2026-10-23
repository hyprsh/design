# Icon

An icon from the Lucide set (ISC licence, 2,100+ icons), drawn at 16px with a 1.5px stroke in `currentColor`.

**You provide:** `name`, a Lucide name in kebab case (`git-branch`, `circle-check`, `external-link`; browse them at lucide.dev). Optional: `size` (default 16), `strokeWidth` (visual px, default 1.5), `color`, and `label` when the icon carries meaning on its own. `Icon.names` lists every available name.

- Lucide is the only icon set used here.
- Sizes are 16 in UI, 14 in small controls and badges, and 20–24 for empty states. Keep the stroke at 1.5px.
- Decorative by default (`aria-hidden`). Pass `label` only when there's no visible text. Icon-only buttons label the button, not the icon.
- Never mix in icons from another set, and no emoji.
