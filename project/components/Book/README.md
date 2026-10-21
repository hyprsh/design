# Book

A 3D book cover with a title, which tilts on hover to show its pages. Use it for guides, reports and docs collections.

**You provide:** `title`. Optional: `variant` (`"stripe"` by default, or `"simple"`), `color` and `textColor` (tokens), `icon` (stripe), `illustration`, `width` (196 by default, a number or `{ sm, md, lg }`) and `textured`.

- Use Book on landing pages, docs indexes and changelog heroes, where the content reads as a volume. For product cards and dashboard tiles use a plain card, because a row of books is too decorative for repeated UI.
- Pick `stripe` when an icon or a colour band carries a category, and `simple` when the title alone carries the design.
- Set `color` from tokens (`var(--red-800)`, `var(--teal-700)`) so the cover follows the theme. For `simple` covers on a strong colour, pick a `textColor` from the brand book's fill pairs, such as white on `red-800` or black on `teal-700`.
- Save `textured` for a single hero cover. On a row of books the weave fights with the titles.
- Change `width` rather than squeezing the cover. The 49:60 proportion is what makes it read as a book.
- The cover is decoration around a real title: the title stays as text, and art and icons are `aria-hidden`. When a Book is a link, wrap it in an `<a>`, which gets the focus ring; the cover tilts on keyboard focus as well as on hover. The tilt is instant under reduced motion.
