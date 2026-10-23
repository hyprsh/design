# Modal

A blocking dialog for a decision or a short focused task, with a title, body, optional inset and an actions footer. It traps focus, closes on Escape or a backdrop click, returns focus to the trigger and locks page scroll. Below 600px it becomes a bottom sheet.

**You provide:** `active` (alias `open`) and `onClickOutside` (alias `onClose`), then the parts: `ModalBody` holding `ModalHeader` (`ModalTitle`, optional `ModalSubtitle`), your content and an optional `ModalInset` (`last` makes it flush with the footer), and `ModalActions` holding `ModalAction`s (primary by default, `variant="secondary"` for Cancel, `fullWidth` for a single action, `disabled`, `prefix`). Optional: `initialFocusRef` (alias `initialFocus`), `sticky` to pin the header while the body scrolls, `size` (`small` | `large`), `alert` for `role="alertdialog"`, and `inline` to render in place. The shorthand `title`, `description` and `actions` props still build the same parts for you.

- Use a Modal when a decision must block the page. For context that keeps the page readable use a Sheet (desktop) or a Drawer (mobile). Route routine create flows that have their own page to that page.
- Confirm destructive actions in a Modal, never in a Drawer or Sheet. For deletes and other irreversible actions use DestructiveActionModal, and focus Cancel by default.
- The title is a Title Case statement, never a question: “Transfer Project”. The body is 1–3 sentences in sentence case, consequence first.
- The primary action is Verb + Noun and repeats the title verb (“Transfer Project”). Cancel stays “Cancel”; acknowledgement-only modals use “Done”.
- Keep focus inside after an error so the person can retry. Never open a modal on page load and never stack modals.
- Keys stay inside: the dialog stops the arrows, Home, End, Enter, Space, Escape and Tab from bubbling out of its portal (through the React tree and to the document), so a page's own list shortcuts and an Escape handler on a pane do not react while it is open. Letters and shortcuts such as ⌘&nbsp;K are not stopped.

## Examples

### Confirm a Decision
Open it from a button. The title is a Title Case statement and the primary action repeats its verb.

```jsx
import { useState } from 'react';
import { Button, Modal, ModalAction, ModalActions, ModalBody, ModalHeader, ModalSubtitle, ModalTitle } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Transfer Project…</Button>
      <Modal active={open} onClickOutside={() => setOpen(false)}>
        <ModalBody>
          <ModalHeader>
            <ModalTitle>Transfer Project</ModalTitle>
            <ModalSubtitle>The project keeps its domains and deployments, and billing moves to the new team.</ModalSubtitle>
          </ModalHeader>
        </ModalBody>
        <ModalActions>
          <ModalAction variant="secondary" onClick={() => setOpen(false)}>Cancel</ModalAction>
          <ModalAction onClick={() => setOpen(false)}>Transfer Project</ModalAction>
        </ModalActions>
      </Modal>
    </>
  );
}
```

### Shorthand Props
`title`, `description` and `actions` build the same parts for you.

```jsx
import { useState } from 'react';
import { Button, Modal, ModalAction } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Archive Project…</Button>
      <Modal
        active={open}
        onClickOutside={() => setOpen(false)}
        title="Archive Project"
        description="Archived projects stop building and serving traffic. You can restore it at any time."
        actions={
          <>
            <ModalAction variant="secondary" onClick={() => setOpen(false)}>Cancel</ModalAction>
            <ModalAction onClick={() => setOpen(false)}>Archive Project</ModalAction>
          </>
        }
      />
    </>
  );
}
```

### With a Form
An inset holds the field and focus starts on it. The body keeps the explanation short.

```jsx
import { useRef, useState } from 'react';
import { Button, Input, Modal, ModalAction, ModalActions, ModalBody, ModalHeader, ModalInset, ModalSubtitle, ModalTitle } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);
  const nameRef = useRef(null);

  return (
    <>
      <Button variant="default" onClick={() => setOpen(true)}>Add Domain…</Button>
      <Modal active={open} onClickOutside={() => setOpen(false)} initialFocusRef={nameRef}>
        <ModalBody>
          <ModalHeader>
            <ModalTitle>Add Domain</ModalTitle>
            <ModalSubtitle>Connect a domain you own to this project.</ModalSubtitle>
          </ModalHeader>
          <ModalInset>
            <Input ref={nameRef} label="Domain" name="domain" placeholder="hyprsh.dev…" autoComplete="off" spellCheck={false} />
          </ModalInset>
          <p style={{ margin: '20px 0 0' }}>Point an A record at 192.0.2.1 after you add it.</p>
        </ModalBody>
        <ModalActions>
          <ModalAction variant="secondary" onClick={() => setOpen(false)}>Cancel</ModalAction>
          <ModalAction onClick={() => setOpen(false)}>Add Domain</ModalAction>
        </ModalActions>
      </Modal>
    </>
  );
}
```

### Destructive Confirmation
`alert` makes it an alert dialog. Focus Cancel by default, and use the error variant for the action.

```jsx
import { useRef, useState } from 'react';
import { Button, Modal, ModalAction } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);
  const cancelRef = useRef(null);

  return (
    <>
      <Button variant="error" onClick={() => setOpen(true)}>Delete Branch…</Button>
      <Modal
        alert
        active={open}
        onClickOutside={() => setOpen(false)}
        initialFocusRef={cancelRef}
        title="Delete Branch"
        description="Deleting feat/tab-bar also removes its preview deployments. This can’t be undone."
        actions={
          <>
            <ModalAction ref={cancelRef} variant="secondary" onClick={() => setOpen(false)}>Cancel</ModalAction>
            <ModalAction variant="error" onClick={() => setOpen(false)}>Delete Branch</ModalAction>
          </>
        }
      />
    </>
  );
}
```
