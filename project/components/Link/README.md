# Link

An inline text link in the design's link colour, underlined, with a focus ring.

**You provide:** the text as `children` and an `href`. Optional: `as="button"` for an action that reads as a link (“Show notices”), `disabled`, and any anchor attributes such as `target` and `rel`. It takes a `ref`.

- Use a link to go somewhere and a button to do something. When a sentence points at an action rather than a page, use `as="button"` so it is a real `<button>` with Enter and Space, not an `<a>` without an `href`.
- Navigation uses an `<a>` with an `href`, so Cmd/Ctrl-click and middle-click work. Pass your router's navigation through `onClick` and keep the `href`.
- The label says where it goes or what it does: “Older ones are in the Log”, never “click here”. Keep it a few words inside the sentence.
- It inherits the surrounding font size and line height. For a standalone secondary destination use a Pill; for an action use a Button.
- A link that opens a new tab sets `target="_blank"` and `rel="noopener noreferrer"`, and says so in its text or label.
