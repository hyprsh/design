# Sheet

A side panel that slides in from an edge to show associated context, such as deployment details, a log row or a member profile, while the page stays usable.

**You provide:** `Sheet` (`open`/`defaultOpen`/`onOpenChange`, `modal`) wrapping `SheetTrigger` (`asChild` to reuse your Button) and `SheetContent` (`side`: `top` | `right` | `bottom` | `left`, default `right`; `noOverlay`). Inside the content: `SheetHeader` with `SheetTitle` and a sentence, `SheetDescription` for the body, `SheetFooter` for actions and `SheetClose` (`asChild`) for the close button. hyprsh adds `floating` on `SheetContent` (inset with the fullscreen material) and `inline` on `Sheet` to render in place.

- Use a Sheet for read-mostly detail that keeps the page useful. For a blocking decision use a Modal; for a mobile bottom sheet use a Drawer. Never confirm destructive actions in a Sheet.
- Sheets are non-modal by default, so toasts and the page stay reachable. Set `modal` only when the sheet owns the screen.
- Pick the side from where the trigger lives: a row inspector from the right, a global filter from the left. Don't switch sides mid-session.
- Outside clicks don't close it, so always render a visible `SheetClose` labelled “Close”. Escape closes it.
- The title names the entity in Title Case (“Deployment Details”). Don't repeat the page header inside the sheet.
