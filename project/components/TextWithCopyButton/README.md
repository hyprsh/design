# TextWithCopyButton

A piece of text that copies itself, with a copy icon after it, for IDs, hashes and URLs shown inline.

**You provide:** `textToCopy`. Optional: `textLabel` when the shown text differs from what is copied, `successMessage` for the announcement, `ellipsis` to truncate a long value on one line, and `onCopy`.

- The whole element is one button, so the text is the hit target. It inherits the surrounding font size, so it works in a heading row or a dense table cell alike.
- Use it for values people paste elsewhere: deployment IDs, commit hashes, URLs. For a shell command use Snippet; for a standalone icon button use CopyButton.
- Shorten the label, never the payload: `textLabel="bld_8fK2…Qa"` with the full ID in `textToCopy`.
- After a copy the icon turns into a check for 2 seconds and the success message is announced politely. Show a toast yourself from `onCopy` if the page needs a visible confirmation.
- Its accessible name is the label plus “Copy to Clipboard”, unless the label already starts with “Copy”.

## Examples

### Default
A piece of text that copies itself, with a copy icon after it.

```jsx
import { TextWithCopyButton } from '@hyprsh/design';

export default function Example() {
  return <TextWithCopyButton textToCopy="dpl_8f2a91c4e7b3">dpl_8f2a91c4e7b3</TextWithCopyButton>;
}
```

### Different Shown and Copied Text
`textLabel` is what is shown. `textToCopy` is what is copied.

```jsx
import { TextWithCopyButton } from '@hyprsh/design';

export default function Example() {
  return (
    <TextWithCopyButton
      textLabel="4f2a9c1"
      textToCopy="4f2a9c1e7b3d5a6f0c2d1b9a8e7f6c5d4b3a2e1f"
      successMessage="Commit hash copied"
    />
  );
}
```

### Truncated
`ellipsis` keeps a long value on one line.

```jsx
import { TextWithCopyButton } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ maxWidth: 240 }}>
      <TextWithCopyButton ellipsis textToCopy="https://marketing-site-4f2a9c1-platform-team.hyprsh.dev">
        https://marketing-site-4f2a9c1-platform-team.hyprsh.dev
      </TextWithCopyButton>
    </div>
  );
}
```

### Reporting a Copy
`onCopy` receives the copied text.

```jsx
import { useState } from 'react';
import { TextWithCopyButton } from '@hyprsh/design';

export default function Example() {
  const [copied, setCopied] = useState('');

  return (
    <div className="copy-14" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
      <TextWithCopyButton textToCopy="hy_live_4f9a1c2e" onCopy={setCopied}>hy_live_4f9a1c2e</TextWithCopyButton>
      <span role="status">{copied ? `Copied ${copied}` : 'Nothing copied yet'}</span>
    </div>
  );
}
```
