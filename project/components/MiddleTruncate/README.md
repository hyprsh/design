# MiddleTruncate

Shortens text from the middle so both the start and the end stay visible, for URLs, branch names, paths and IDs.

**You provide:** `value`, the full text. Optional: `className` and `style`. Give it, or its parent, a width limit; it fills up to its content and shrinks below that.

- Use it where the end of the value matters: `hyprsh-web-git-feat-…-acme.hyprsh.app`, `src/…/page.tsx`. For prose, use an end ellipsis.
- It refits on resize and after web fonts load, keeping as many characters as fit and splitting them evenly around one “…”.
- Screen readers and copy always get the full value, and hovering a shortened value shows it as a tooltip.
- In a flex row, give its parent `min-width: 0` so it can shrink.
