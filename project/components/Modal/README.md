# Modal

A blocking dialog for a decision or a short focused task, with a title, body, optional inset and an actions footer. It traps focus, closes on Escape or a backdrop click, returns focus to the trigger and locks page scroll. Below 600px it becomes a bottom sheet.

**You provide:** `active` (alias `open`) and `onClickOutside` (alias `onClose`), then the parts: `ModalBody` holding `ModalHeader` (`ModalTitle`, optional `ModalSubtitle`), your content and an optional `ModalInset` (`last` makes it flush with the footer), and `ModalActions` holding `ModalAction`s (primary by default, `variant="secondary"` for Cancel, `fullWidth` for a single action, `disabled`, `prefix`). Optional: `initialFocusRef` (alias `initialFocus`), `sticky` to pin the header while the body scrolls, `size` (`small` | `large`), `alert` for `role="alertdialog"`, and `inline` to render in place. The shorthand `title`, `description` and `actions` props still build the same parts for you.

- Use a Modal when a decision must block the page. For context that keeps the page readable use a Sheet (desktop) or a Drawer (mobile). Route routine create flows that have their own page to that page.
- Confirm destructive actions in a Modal, never in a Drawer or Sheet. For deletes and other irreversible actions use DestructiveActionModal, and focus Cancel by default.
- The title is a Title Case statement, never a question: “Transfer Project”. The body is 1–3 sentences in sentence case, consequence first.
- The primary action is Verb + Noun and repeats the title verb (“Transfer Project”). Cancel stays “Cancel”; acknowledgement-only modals use “Done”.
- Keep focus inside after an error so the person can retry. Never open a modal on page load and never stack modals.
- Keys stay inside: the dialog stops the arrows, Home, End, Enter, Space, Escape and Tab from bubbling out of its portal (through the React tree and to the document), so a page's own list shortcuts and an Escape handler on a pane do not react while it is open. Letters and shortcuts such as ⌘&nbsp;K are not stopped.
