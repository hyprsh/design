# Snippet

A copyable shell command or short code fragment.

**You provide:** `text`, a string or an array of lines. Optional: `prompt` (`false` to hide the `$`, or a custom string), `dark` for the inverted style, `type` (`success`, `error` or `warning`) for a tinted variant, `width`, `copyText` when the clipboard should get something other than what is shown, `copied` to drive the checkmark from outside, `placeholder` for an empty state, and `onCopy`.

- Never type the `$` yourself. The prompt can't be selected, so copying gives only the command. Use `prompt={false}` for anything that isn't a shell command.
- One command per line. For anything longer than about 5 lines, use CodeBlock.
- The snippet fits its content by default. Pass `width` (`"100%"`, `300`) to line several up.
- Use `type` sparingly: `success` (blue) for the command that finishes a setup, `warning` or `error` for a destructive one.
- The copy button is labelled “Copy to Clipboard”. The result is announced politely, and a failure tells the reader to copy by hand.
- A `placeholder` shows while `text` is empty, for example before a token has been generated. It is never copied.

## Examples

### Default
A copyable shell command with a `$` prompt.

```jsx
import { Snippet } from '@hyprsh/design';

export default function Example() {
  return <Snippet text="npm i -g hyprsh" />;
}
```

### Several Lines
Pass an array of lines.

```jsx
import { Snippet } from '@hyprsh/design';

export default function Example() {
  return <Snippet text={['npm i -g hyprsh', 'hyprsh login', 'hyprsh deploy']} />;
}
```

### Styles
`dark` inverts it, `type` tints it, and `prompt={false}` hides the `$`.

```jsx
import { Snippet } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
      <Snippet dark text="hyprsh deploy --prod" />
      <Snippet type="success" text="hyprsh domains verify hyprsh.dev" />
      <Snippet type="warning" text="hyprsh env rm DATABASE_URL" />
      <Snippet type="error" text="hyprsh rollback dpl_8f2a" />
      <Snippet prompt={false} text="https://marketing-site-4f2a9c1.hyprsh.dev" />
    </div>
  );
}
```

### Copy a Different Value
`copyText` puts something else on the clipboard, and `onCopy` reports the copy.

```jsx
import { useState } from 'react';
import { Snippet } from '@hyprsh/design';

export default function Example() {
  const [copied, setCopied] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
      <Snippet
        text="hyprsh env pull .env.local"
        copyText="hyprsh env pull .env.local --environment=development"
        onCopy={() => setCopied(true)}
      />
      {copied ? <span className="copy-13" role="status">Command copied</span> : null}
    </div>
  );
}
```
