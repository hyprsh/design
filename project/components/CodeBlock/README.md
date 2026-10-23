# CodeBlock

Multi-line, syntax-coloured source with a filename header, line numbers, highlighted or diff lines, a copy button and an optional language switcher.

**You provide:** the code string as `children` and its `language` (`js`, `jsx`, `ts`, `tsx`, `json`, `bash`, `css` or `diff`). Optional: `filename` for the header, `highlightedLinesNumbers`, `addedLinesNumbers` and `removedLinesNumbers` (1-based), `hideLineNumbers`, `switcher` or `tabs` (`{ options: [{ label, value }], value, onChange }`) to switch languages, `aria-label`, `id` and `onCopy`.

- Use it for source the reader will scan or paste. For one token inside a sentence use Code; for a single shell command use Snippet.
- Always pass a language. Colour is the main reason to pick CodeBlock over a plain block.
- Highlight only the lines you are talking about. A block where every line is highlighted reads the same as one with none.
- Mark added and removed lines with the props or the `diff` language, never with `// added` comments, which break copy and paste. Copy leaves removed lines out.
- Show a filename when the code has a place to go (`app/page.tsx`, `hyprsh.json`). Leave it off for throwaway examples.
- Keep examples runnable: no pseudo-code, and no `$` in front of shell commands.
- Clicking a line number marks that line and puts `#<id>-L<n>` in the URL, so the line can be linked.
- The colouring is a small built-in tokenizer, not a full grammar. It covers common syntax; exotic constructs fall back to plain text.

## Examples

### Default
Source with a filename header and line numbers.

```jsx
import { CodeBlock } from '@hyprsh/design';

const code = `import { deploy } from 'hyprsh';

export async function ship() {
  const result = await deploy({ project: 'marketing-site' });
  console.log(result.url);
}`;

export default function Example() {
  return <CodeBlock language="ts" filename="ship.ts">{code}</CodeBlock>;
}
```

### Highlighted Lines
`highlightedLinesNumbers` marks the lines to look at (1-based).

```jsx
import { CodeBlock } from '@hyprsh/design';

const code = `{
  "name": "marketing-site",
  "framework": "next",
  "regions": ["iad1", "fra1"]
}`;

export default function Example() {
  return <CodeBlock language="json" filename="hyprsh.json" highlightedLinesNumbers={[4]}>{code}</CodeBlock>;
}
```

### Diff
Mark added and removed lines.

```jsx
import { CodeBlock } from '@hyprsh/design';

const code = `{
  "name": "marketing-site",
  "regions": ["iad1"],
  "regions": ["iad1", "fra1"]
}`;

export default function Example() {
  return <CodeBlock language="json" filename="hyprsh.json" removedLinesNumbers={[3]} addedLinesNumbers={[4]}>{code}</CodeBlock>;
}
```

### Without Line Numbers
For a short command or output, hide the numbers.

```jsx
import { CodeBlock } from '@hyprsh/design';

export default function Example() {
  return <CodeBlock language="bash" hideLineNumbers>{'hyprsh login\nhyprsh deploy --prod'}</CodeBlock>;
}
```

### Language Switcher
`switcher` swaps the code for each option. Keep the value in state.

```jsx
import { useState } from 'react';
import { CodeBlock } from '@hyprsh/design';

const examples = {
  npm: 'npm install @hyprsh/design',
  pnpm: 'pnpm add @hyprsh/design',
  yarn: 'yarn add @hyprsh/design',
};

export default function Example() {
  const [manager, setManager] = useState('npm');

  return (
    <CodeBlock
      language="bash"
      hideLineNumbers
      switcher={{
        options: [{ label: 'npm', value: 'npm' }, { label: 'pnpm', value: 'pnpm' }, { label: 'yarn', value: 'yarn' }],
        value: manager,
        onChange: setManager,
      }}
    >
      {examples[manager]}
    </CodeBlock>
  );
}
```
