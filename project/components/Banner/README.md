# Banner

A centred, one-line announcement at the top of a page or section, with a single link to read more.

**You provide:** the announcement as `children`, usually a bold lead and one short clause (`<b>Build Cache</b> – Now shared across every branch`), and an optional `button` object with `content` (the link text) and `href` or `onClick`. Pad it with your own `className` or `style`.

- One banner per page, about something new. For a problem with the current project, use ProjectBanner; for an inline message next to the thing it concerns, use Note.
- Keep the text to one line at desktop width. The lead is one or two Title Case words; the link text is a short verb such as “Read More”.
- Below about 560px of available width, the text and link merge into one rounded button that truncates, so the whole banner stays one tap target.
- It is not dismissible and doesn't animate in.
