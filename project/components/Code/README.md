# Code

Inline code for a single token in running text, or a plain bordered block for a short unhighlighted listing.

**You provide:** the code as `children`. A string that contains a line break, or the `syntax` or `block` prop, renders the block; anything else renders inline.

- Use inline code for env var names, file paths, flags and function names inside a sentence: `PUBLIC_URL`, `--frozen-lockfile`.
- For a command the reader will copy, use Snippet. For multi-line source that needs colour, line numbers or a filename, use CodeBlock.
- Keep inline code to one token. Don’t wrap whole sentences or put punctuation that belongs to the sentence inside it.
- Code is set with `translate="no"` so auto-translation leaves it alone.

## Examples

### Inline
A single token in running text.

```jsx
import { Code } from '@hyprsh/design';

export default function Example() {
  return (
    <p className="copy-14" style={{ margin: 0 }}>
      Run <Code>hyprsh deploy --prod</Code> to promote the current branch.
    </p>
  );
}
```

### Block
A string with a line break, or `block`, renders a plain bordered listing.

```jsx
import { Code } from '@hyprsh/design';

export default function Example() {
  return <Code block>{'HYPRSH_REGION=iad1\nHYPRSH_LOG_LEVEL=info'}</Code>;
}
```

### In a Sentence
Set identifiers and commands in code so auto-translation leaves them alone.

```jsx
import { Code } from '@hyprsh/design';

export default function Example() {
  return (
    <ul className="copy-14" style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <li>Set <Code>DATABASE_URL</Code> for the Production environment.</li>
      <li>Branches such as <Code>feat/tab-bar</Code> get a preview deployment.</li>
      <li>Ignored files go in <Code>.hyprshignore</Code>.</li>
    </ul>
  );
}
```
