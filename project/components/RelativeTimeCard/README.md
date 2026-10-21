# RelativeTimeCard

A relative timestamp (“2m ago”, “5h ago”, “Yesterday”) whose hover card shows how long ago it was and the exact date and time in UTC and in the viewer's time zone, formatted with `Intl`.

**You provide:** `date` (Unix ms, a `Date` or an ISO string). Optional: `side` (default `top`), `align`, `locale`, `children` to replace the default `<time>` trigger, and `defaultOpen` (hyprsh).

- Use it wherever a recent timestamp appears in scannable surfaces: table cells, entity rows, deploy lists and activity feeds. For a fixed date in body prose older than a week, write the date (“Mar 14, 2026”).
- Pass the raw timestamp. Don't pre-format it and don't add “ago” after it: the trigger already reads “2m ago”.
- Use `children` only for states the formatter can't describe (“Just now”, “Pending”, “Queued”) or for a custom trigger.
- Add a leading label when the row is ambiguous (“Last deploy 2m ago”). The card already shows UTC and local time, so don't repeat them elsewhere in the row.
- On touch screens a tap on the timestamp opens the card and a tap elsewhere closes it.
