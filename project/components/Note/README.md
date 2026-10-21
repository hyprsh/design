# Note

An inline message that sits in the page flow: a tip, a warning, an error with its fix.

**You provide:** the message as `children`. Optional: `variant` (`default` | `secondary` | `success` | `warning` | `error` | `violet` | `cyan`), `fill` for a tinted background, `size` (`small` | `medium` | `large`), `label` for a short bold prefix, one `action` node such as a small Button, `icon` to replace the variant's icon (`null` hides it), and `disabled`. For richer layouts, compose `Note.Content`, `Note.Label` and `Note.Action` (also exported as `NoteContent`, `NoteLabel` and `NoteAction`). The older `type` prop still works and adds the variant's word (“Warning:”) unless `label={false}`.

- One concept per note, one sentence or two, and at most one action. Error notes say how to fix the problem.
- Labels are one or two Title Case words that add meaning (“Region Change”), never “Note” or “FYI”.
- Notes are not dismissible: if the message can go away, it belongs in a Toast or a ProjectBanner.
- Success notes are blue, not green: the accent stays the accent.
- `variant="error"` is announced as an alert. `disabled` greys the note and disables the controls in its action.
