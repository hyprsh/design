# SplitButton

A default action with a chevron beside it that opens related alternatives, such as Deploy with Deploy Without Cache.

**You provide:** the label (`children`), `buttonProps` for the default action (`onClick`, `size`, `variant` `default` | `secondary`), `menuButtonLabel` (the chevron's accessible name) and `menuItems`: `SplitButtonMenuItem` elements with `title`, optional `description`, `icon` and `menuItemProps` (`onClick`, `href`). Optional: `menuProps.width`, `menuAlignment` (`bottom-start` by default, or `bottom-end` near the right edge), `disabled`.

- Use SplitButton only when one action is clearly the usual choice and the others are variations of it. If no option dominates, use Menu; if there is only one action, use Button.
- The default action runs on its own click and never opens the menu. The chevron opens the menu and behaves exactly like Menu: arrow keys, typeahead, Escape returns focus to the chevron.
- `menuButtonLabel` names what the chevron offers, such as “More Deploy Options”, not just “More”.
- Keep it to 2–5 items. Titles are Title Case Verb + Noun, and the description is one short sentence on how the item differs from the default.
- Use the `default` variant for the main action of the page, and `secondary` everywhere else.
