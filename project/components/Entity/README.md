# Entity

A row that represents one thing (a member, token, domain or integration), with a leading visual, a title and description, and controls on the right.

**You provide:** `left` (an Avatar, icon, Checkbox or Skeleton), children (usually `Entity.Content` with `title` and `description`, plus `fill` to take the free width), `right` (controls or meta text) and optionally `as` (`'div'`, `'li'` or `'button'`) with `onClick`. Wrap several rows in `Entity.List` (or `EntityList`), which draws the card and dividers and renders rows as list items.

- Keep the right side to one or two controls. For more, use a single menu button.
- Name buttons Verb + Noun in Title Case (Revoke Token, Remove Member), not just “Remove”.
- Give a row checkbox a label such as `aria-label="Select ci-bot"`.
- Use `as="button"` when the whole row opens something. It stays reachable by keyboard; when the row also has its own controls, those take focus instead and the stretched button is hidden from assistive tech.
- While loading, keep the row shape and put Skeletons in `left` and `Entity.Content`.
