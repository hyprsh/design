# Code

Inline code for a single token in running text, or a plain bordered block for a short unhighlighted listing.

**You provide:** the code as `children`. A string that contains a line break, or the `syntax` or `block` prop, renders the block; anything else renders inline.

- Use inline code for env var names, file paths, flags and function names inside a sentence: `NEXT_PUBLIC_URL`, `--prebuilt`.
- For a command the reader will copy, use Snippet. For multi-line source that needs colour, line numbers or a filename, use CodeBlock.
- Keep inline code to one token. Don’t wrap whole sentences or put punctuation that belongs to the sentence inside it.
- Code is set with `translate="no"` so auto-translation leaves it alone.
