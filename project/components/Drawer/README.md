# Drawer

A bottom sheet for small viewports that shows a short, focused view over the page. It traps focus, locks page scroll and closes on a backdrop tap, Escape or a downward swipe.

**You provide:** `show`, `onDismiss` and the content as `children`, with a `DrawerTitle` (or an `aria-label`) to name the dialog. Optional: `height` (px number or CSS length; by default it fits the content up to 90% of the viewport), `verticalScroll={false}` to stop the panel scrolling inside its frame, and `inline` to render in place.

- Use a Drawer only on small viewports. On desktop render a Modal, or a Sheet for side context.
- Good for one short mobile task: a single form, a filter sheet, or a primary action paired with Cancel. Keep both above the fold; reach for `height` only when the default clips them.
- Never confirm destructive actions in a Drawer: it doesn't block hard enough. Use a Modal.
- The title names the view in Title Case (“Filter Logs”), not the page heading. One Verb + Noun primary button and a literal “Cancel”.
- Keep tap-outside and swipe-down dismissal unless the form has unsaved input.
