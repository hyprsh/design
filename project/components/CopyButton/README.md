# CopyButton

An icon button that copies a value to the clipboard and confirms with a check for two seconds.

**You provide:** `textToCopy` and `label` (the accessible name, such as “Copy Deployment URL”). Optional: `variant` (`secondary` by default; `tertiary` inside rows and code blocks), `size`, `onCopy(text)`, `disabled`. Other Button props pass through.

- Put CopyButton right next to the value it copies: a URL, a key, a command. Use Snippet when the value should be shown and copied together.
- The `label` names what is copied, never just “Copy”, because the button has no visible text.
- The check icon is the only confirmation. Screen readers hear “Copied” from a polite live region; don't add a Toast as well.
- Never copy a secret the user can't see on screen without saying so in the label (“Copy Hidden Token”).
