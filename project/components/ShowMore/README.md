# ShowMore

A centred pill button between two divider lines that reveals the rest of a list or section.

**You provide:** `expanded` and `onClick`, or leave both out and it keeps its own state (`defaultExpanded`, `onChange`). Optional: `noBorder` to drop the lines, `count` for “Show 12 More”, `moreLabel`/`lessLabel`, and `aria-controls` pointing at the list.

- Show 5 to 10 items first, then ShowMore. Truncating after 2 items hides the point of the list.
- Say how many are hidden with `count` when you know it.
- Set `aria-controls` to the list's `id`. After expanding, move focus to the first new item so keyboard users don't have to find it.
- Use LoadMoreButton instead when the next items still have to be fetched.
- Use `noBorder` where the section already has its own dividers, for example at the bottom of a card.
