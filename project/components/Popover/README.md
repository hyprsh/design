# Popover

A floating panel that opens on click and holds interactive content: buttons, selectable text, a small form. It is a non-modal dialog: focus moves inside and Tab stays there, Escape or a click outside closes it, and focus goes back to the trigger.

**You provide:** `trigger` (an element, usually a Button; text becomes a secondary Button), the content as `children` and a `label` for the dialog's accessible name. Optional: `open`/`defaultOpen`/`onOpenChange`, `position` (`bottom-start` by default; also `bottom-end`, `top-*`, `left-*`, `right-*`, `bottom-center`, `top-center`), `width`, `initialFocusRef`, `className`. `children` can be a function that receives `{ close }`, to close from a button inside and return focus to the trigger.

- Use a Popover for details the person acts on or copies: a file's path, filter syntax help, a small form. Use Tooltip or ContextCard for read-only hints on hover, Menu for a list of actions, Modal when the page must wait, and Sheet or Drawer for larger side content.
- It opens on click, never on hover. It floats above the page, flips when there is no room and stays 8px inside the screen, so it works on phones.
- Focus lands on the element marked `data-autofocus`, else the first focusable element, else the panel. Escape returns focus to the trigger; a click outside leaves focus where the click put it.
- Escape and Tab are handled by the popover alone and don't bubble out of its portal, so an Escape handler on the page does not also fire.
- Keep it short: one task or one block of details. Don't open another popover from inside one.
