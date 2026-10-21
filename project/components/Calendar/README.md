# Calendar

A date-range (or single date) picker: a trigger that shows the chosen dates, and a popover with a month grid, Start and End fields, and Apply.

**You provide:** `value` + `onChange` or `defaultValue`, as `{ start, end }` Dates (or one Date with `mode="single"`). Optional: `presets` (a keyed object or array of `{ text, start, end }`, shown in a “Select Period” select joined to the trigger, above it with `stacked`, or as a chevron with `compact`), `allowClear`, `minValue`/`maxValue`, `showTimeInput` (on by default), `showTimezone` and `pinnedTimezone`, `horizontalLayout`, `popoverAlignment` (`start` by default), `size` (`small` or `medium`), `firstDayOfWeek` (Sunday), `locale`, `placeholder`.

- Offer presets for the ranges people pick most (“Last 7 Days”, “Last 30 Days”); they're quicker than the grid.
- Set `minValue`/`maxValue` to the data you actually have, so empty ranges can't be picked.
- Month, weekday and date names follow the user's locale through Intl; dates aren't hard-coded in English.
- Persist the chosen range (in the URL or settings) so it survives a reload.
- Keyboard: arrows move a day, Up/Down a week, Page Up/Down a month (with Shift, a year), Home/End the week; Enter picks. Escape closes and returns to the trigger.
