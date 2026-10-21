# Snippet

A copyable shell command or short code fragment.

**You provide:** `text`, a string or an array of lines. Optional: `prompt` (`false` to hide the `$`, or a custom string), `dark` for the inverted style, `type` (`success`, `error` or `warning`) for a tinted variant, `width`, `copyText` when the clipboard should get something other than what is shown, `copied` to drive the checkmark from outside, `placeholder` for an empty state, and `onCopy`.

- Never type the `$` yourself. The prompt can't be selected, so copying gives only the command. Use `prompt={false}` for anything that isn't a shell command.
- One command per line. For anything longer than about 5 lines, use CodeBlock.
- The snippet fits its content by default. Pass `width` (`"100%"`, `300`) to line several up.
- Use `type` sparingly: `success` (blue) for the command that finishes a setup, `warning` or `error` for a destructive one.
- The copy button is labelled “Copy to Clipboard”. The result is announced politely, and a failure tells the reader to copy by hand.
- A `placeholder` shows while `text` is empty, for example before a token has been generated. It is never copied.
