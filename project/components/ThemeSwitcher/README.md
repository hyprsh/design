# ThemeSwitcher

Three icon radios (System, Light and Dark) that set the page theme. Picking one sets `data-theme` and `color-scheme` on `<html>` and saves the choice.

**You provide:** nothing, usually. It reads the saved choice (or the page's current `data-theme`) on mount and changes nothing until the reader picks. Use `value`/`onChange` to drive it from your own state, and `storageKey` to rename or turn off (`null`) the saved key.

- Put it in a footer or a settings menu, not in the main toolbar. People set it once.
- System follows the operating system and keeps following it live while it's picked. Light and Dark pin the theme.
- Apply the saved theme in a small inline script in `<head>` too, before the page paints, so a reload doesn't flash the wrong theme.
- It's a real radio group: Tab moves into it, the arrow keys move between options, and each option has a name (“System”, “Light”, “Dark”) and a tooltip.
- `size="small"` (24px) suits menus and dense footers. `disabled` greys the whole group.
