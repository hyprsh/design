# Description

A key and its value, as a definition list: a quiet title over a medium-weight value.

**You provide:** `title` (the key) and `content` (the value, or pass it as children). Optional: `tooltip` for a one-sentence definition behind an info button, `right` to right-align both lines, and `ellipsis` to keep a long value on one line.

- Use it for metadata on a detail page: Last Deployed, Region, Plan. For help under a form field, use the field's hint instead. For rows you compare, use Table.
- It renders `<dl>`, `<dt>` and `<dd>`, so screen readers announce each pair. Don't wrap it in paragraphs that break the list.
- The title is a Title Case noun (Build Duration). The value is sentence case unless it's an ID, hash or timestamp, which stays verbatim.
- Add `tooltip` only when the title is ambiguous. Write it as one sentence that ends with a period.
- Keep buttons, menus and links out of the title. They belong in the value or the surrounding layout.
