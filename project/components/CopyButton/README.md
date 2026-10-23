# CopyButton

An icon button that copies a value to the clipboard and confirms with a check for two seconds.

**You provide:** `textToCopy` and `label` (the accessible name, such as “Copy Deployment URL”). Optional: `variant` (`secondary` by default; `tertiary` inside rows and code blocks), `size`, `onCopy(text)`, `disabled`. Other Button props pass through.

- Put CopyButton right next to the value it copies: a URL, a key, a command. Use Snippet when the value should be shown and copied together.
- The `label` names what is copied, never just “Copy”, because the button has no visible text.
- The check icon is the only confirmation. Screen readers hear “Copied” from a polite live region; don't add a Toast as well.
- Never copy a secret the user can't see on screen without saying so in the label (“Copy Hidden Token”).

## Examples

### Default
An icon button that copies and confirms with a check for two seconds.

```jsx
import { CopyButton } from '@hyprsh/design';

export default function Example() {
  return <CopyButton label="Copy Deployment URL" textToCopy="https://marketing-site-4f2a9c1.hyprsh.dev" />;
}
```

### Beside a Value
Put it next to the thing it copies, as a tertiary button.

```jsx
import { CopyButton } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <code className="label-13-mono">dpl_8f2a91c4</code>
      <CopyButton variant="tertiary" size="small" label="Copy Deployment ID" textToCopy="dpl_8f2a91c4" />
    </div>
  );
}
```

### Variants and Sizes
Secondary by default, tertiary in rows and code blocks.

```jsx
import { CopyButton } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <CopyButton variant="secondary" label="Copy API Key" textToCopy="hy_live_4f9a1c2e" />
      <CopyButton variant="tertiary" label="Copy API Key" textToCopy="hy_live_4f9a1c2e" />
      <CopyButton size="small" label="Copy API Key" textToCopy="hy_live_4f9a1c2e" />
    </div>
  );
}
```

### Reporting a Copy
`onCopy` receives the copied text. Report it with a status line.

```jsx
import { useState } from 'react';
import { CopyButton } from '@hyprsh/design';

export default function Example() {
  const [copied, setCopied] = useState('');

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <CopyButton label="Copy Install Command" textToCopy="npm i -g hyprsh" onCopy={setCopied} />
      <span className="copy-13" role="status">{copied ? `Copied “${copied}”` : 'Nothing copied yet'}</span>
    </div>
  );
}
```
