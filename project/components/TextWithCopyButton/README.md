# TextWithCopyButton

A piece of text that copies itself, with a copy icon after it, for IDs, hashes and URLs shown inline.

**You provide:** `textToCopy`. Optional: `textLabel` when the shown text differs from what is copied, `successMessage` for the announcement, `ellipsis` to truncate a long value on one line, and `onCopy`.

- The whole element is one button, so the text is the hit target. It inherits the surrounding font size, so it works in a heading row or a dense table cell alike.
- Use it for values people paste elsewhere: deployment IDs, commit hashes, URLs. For a shell command use Snippet; for a standalone icon button use CopyButton.
- Shorten the label, never the payload: `textLabel="bld_8fK2…Qa"` with the full ID in `textToCopy`.
- After a copy the icon turns into a check for 2 seconds and the success message is announced politely. Show a toast yourself from `onCopy` if the page needs a visible confirmation.
- Its accessible name is the label plus “Copy to Clipboard”, unless the label already starts with “Copy”.
