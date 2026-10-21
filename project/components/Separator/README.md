# Separator

A 1px divider between sections, horizontal or vertical.

**You provide:** `orientation` (`horizontal` by default, or `vertical`), `inset` for a stronger line that runs edge to edge inside a framed card, and `aria-hidden` (or `decorative`) when the line is only visual. The parent sets the spacing around it.

- Use it to split related groups of content: sections of a settings panel, a card header from its body, links in an inline nav.
- Prefer whitespace first. Add a separator only when spacing alone doesn't make the grouping clear.
- Mark it `aria-hidden` when it only decorates, such as under a card header. Keep the role when it divides sections a screen reader should hear as separate.
- A vertical separator needs a flex row with a height: it stretches to fill it.
