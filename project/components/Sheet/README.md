# Sheet

A side panel that slides in from an edge to show associated context, such as deployment details, a log row or a member profile, while the page stays usable.

**You provide:** `Sheet` (`open`/`defaultOpen`/`onOpenChange`, `modal`) wrapping `SheetTrigger` (`asChild` to reuse your Button) and `SheetContent` (`side`: `top` | `right` | `bottom` | `left`, default `right`; `noOverlay`). Inside the content: `SheetHeader` with `SheetTitle` and a sentence, `SheetDescription` for the body, `SheetFooter` for actions and `SheetClose` (`asChild`) for the close button. hyprsh adds `floating` on `SheetContent` (inset with the fullscreen material) and `inline` on `Sheet` to render in place.

- Use a Sheet for read-mostly detail that keeps the page useful. For a blocking decision use a Modal; for a mobile bottom sheet use a Drawer. Never confirm destructive actions in a Sheet.
- Sheets are non-modal by default, so toasts and the page stay reachable. Set `modal` only when the sheet owns the screen.
- Pick the side from where the trigger lives: a row inspector from the right, a global filter from the left. Don't switch sides mid-session.
- Outside clicks don't close it, so always render a visible `SheetClose` labelled “Close”. Escape closes it.
- The title names the entity in Title Case (“Deployment Details”). Don't repeat the page header inside the sheet.

## Examples

### Default
A side panel with a title, body and footer. `SheetTrigger asChild` reuses your Button.

```jsx
import { Button, Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@hyprsh/design';

export default function Example() {
  return (
    <Sheet>
      <SheetTrigger asChild><Button>Deployment Details</Button></SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Deployment Details</SheetTitle>
          <p className="copy-14">marketing-site on main, promoted to production.</p>
        </SheetHeader>
        <SheetDescription>
          <p className="copy-14">Built in 42s from commit 4f2a9c1.</p>
        </SheetDescription>
        <SheetFooter>
          <SheetClose asChild><Button variant="secondary">Close</Button></SheetClose>
          <Button variant="default">Redeploy</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

### Floating
`floating` insets the panel with the fullscreen material.

```jsx
import { Button, Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@hyprsh/design';

export default function Example() {
  return (
    <Sheet>
      <SheetTrigger asChild><Button variant="secondary">Member Profile</Button></SheetTrigger>
      <SheetContent floating>
        <SheetHeader>
          <SheetTitle>Member Profile</SheetTitle>
          <p className="copy-14">Ada Lovelace · Owner · Joined Oct 3</p>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild><Button variant="secondary">Close</Button></SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

### Sides
`side` picks the edge it slides in from.

```jsx
import { useState } from 'react';
import { Button, Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@hyprsh/design';

export default function Example() {
  const [side, setSide] = useState(null);

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {['left', 'right', 'top', 'bottom'].map((s) => (
        <Button key={s} variant="secondary" onClick={() => setSide(s)}>{s[0].toUpperCase() + s.slice(1)}</Button>
      ))}
      <Sheet open={side !== null} onOpenChange={(o) => { if (!o) setSide(null); }}>
        <SheetContent side={side || 'right'}>
          <SheetHeader>
            <SheetTitle>From the {side}</SheetTitle>
            <p className="copy-14">The sheet slides in from the {side} edge.</p>
          </SheetHeader>
          <SheetFooter>
            <SheetClose asChild><Button variant="secondary">Close</Button></SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

### Modal
`modal` dims the page, traps focus and locks scroll. Use it only when the sheet owns the screen.

```jsx
import { Button, Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@hyprsh/design';

export default function Example() {
  return (
    <Sheet modal>
      <SheetTrigger asChild><Button variant="secondary">Log Row</Button></SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Log Row</SheetTitle>
          <p className="copy-14">GET /api/deployments 200 in 38ms</p>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild><Button variant="secondary">Close</Button></SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```
