# QueryInput

A text field whose text is the value, with suggestions that complete the word at the caret, for search and filter queries such as `is:open label:bug,docs crash`.

**You provide:** an accessible name (`aria-label`, `aria-labelledby` or an outside `<label htmlFor>` pointing at `id`), `value` and `onChange(text)` (or `defaultValue` to let the field keep the text). Then either `qualifiers` (the names and values your screen understands) or `suggestions(text, caret)` to compute completions yourself. Optional: `help={false}` to hide the “?” button (`QueryHelpButton` places it elsewhere), `shortcut` (one key, such as `"/"`, that focuses the field), `size` (`small` 32px, `medium` 36px by default, `large` 40px), `placeholder`, `disabled`, `id`, `onKeyDown`, `className`.

- Use it when the text is the value. For picking one option from a list use Combobox, and for a plain search box SearchInput.
- The field is controlled and typing is never reverted, not even by Escape.
- A suggestion carries the whole query after picking it (`text`) and where the caret goes (`caret`), so the field has no syntax of its own. `label` is the row, `match` a range of it drawn bold, `description` a muted second line, and `keepOpen` reopens the list at the new caret, which is how a qualifier name leads into its values.
- With `qualifiers` the field uses the shared syntax: `name:a,b` (values are alternatives), the same qualifier twice must match both, a leading `-` excludes (`excludable: true`), `no:name` finds what has no value (`none: true`; it's flagged for any other qualifier), double quotes protect spaces and commas, and unknown qualifiers are free text. An empty field lists every qualifier name on focus; qualifier names are suggested by prefix, so `la` suggests `label:` and `o` opens no list, and picking a name lists its values.
- Problems (a value the qualifier does not take, an exclude it does not allow) show under the field as a warning once the caret leaves the term, tied to the input with `aria-describedby`. The “?” button opens a popover with each qualifier's `help` line and the rules, so write `help` as one short line.
- Up and Down move through the open list and wrap, Enter or Tab picks, Escape closes it until the next edit, and clicking a row keeps focus in the field. With the list closed the field leaves Enter and Escape to your `onKeyDown`, so submit or run the search there. It never blurs itself.
- **Shortcut.** `shortcut="/"` shows a small key cap at the end of the empty field (hidden once there is text, and on touch-only devices) and sets `aria-keyshortcuts` on the input (an `aria-keyshortcuts` prop of yours wins). Pressing the key anywhere on the page focuses the field and is not typed. It is ignored with Ctrl, ⌘ or Alt held, during an IME composition, while focus is in an input, textarea, select or editable element (so `/` types as usual inside a query), and while the field is `disabled`. One key only, no modifiers. If two mounted fields share a key, which one wins is not defined.
- Suggestions are synchronous. Under touch sizing rows are 44px tall.
- The syntax is also exported for your own code: `parseQuery`, `suggestQuery`, `termText`, `withValue`, `withoutValue`, `withoutTerm`, `valuesOf`, with the types `Qualifier`, `Term`, `Query` and `QuerySuggestion`. Use `parseQuery(value, qualifiers)` to read the query, and `valuesOf(query, name)` for what a qualifier asks for (null when it is absent, an empty list when nothing can match).

## Examples

### Default
Suggestions complete the word at the caret. Type `is:` or `label:` to see them.

```jsx
import { useState } from 'react';
import { QueryInput } from '@hyprsh/design';

const qualifiers = [
  { name: 'is', help: 'Open or closed', values: ['open', 'closed'] },
  { name: 'label', help: 'Has this label', suggestions: ['bug', 'docs', 'enhancement'], excludable: true, none: true },
];

export default function Example() {
  const [query, setQuery] = useState('is:open label:bug');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
      <QueryInput aria-label="Search issues" placeholder="Search issues…" qualifiers={qualifiers} value={query} onChange={setQuery} />
      <span className="copy-13">Query: <code>{query || '(empty)'}</code></span>
    </div>
  );
}
```

### Reading the Query
`parseQuery` turns the text into terms and free text.

```jsx
import { useState } from 'react';
import { QueryInput, parseQuery } from '@hyprsh/design';

const qualifiers = [
  { name: 'is', help: 'Open or closed', values: ['open', 'closed'] },
  { name: 'label', help: 'Has this label', suggestions: ['bug', 'docs'], excludable: true },
];

export default function Example() {
  const [query, setQuery] = useState('is:open -label:docs crash');
  const parsed = parseQuery(query, qualifiers);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
      <QueryInput aria-label="Search issues" qualifiers={qualifiers} value={query} onChange={setQuery} />
      <span className="copy-13" role="status">
        {parsed.terms.length} {parsed.terms.length === 1 ? 'term' : 'terms'}, free text “{parsed.text}”
      </span>
    </div>
  );
}
```

### Your Own Suggestions
`suggestions(text, caret)` computes completions yourself.

```jsx
import { useState } from 'react';
import { QueryInput } from '@hyprsh/design';

const branches = ['main', 'staging', 'feat/tab-bar'];

export default function Example() {
  const [query, setQuery] = useState('');

  function suggestions(text) {
    const word = text.split(/\s+/).pop().toLowerCase();
    if (!word) return [];
    return branches
      .filter((b) => b.includes(word))
      .map((b) => ({ label: b, text: `${text.slice(0, text.length - word.length)}${b}`, caret: text.length - word.length + b.length }));
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <QueryInput aria-label="Find a branch" placeholder="Find a branch…" help={false} suggestions={suggestions} value={query} onChange={setQuery} />
    </div>
  );
}
```

### Sizes
Small, medium and large.

```jsx
import { QueryInput } from '@hyprsh/design';

const qualifiers = [{ name: 'is', help: 'Open or closed', values: ['open', 'closed'] }];

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
      <QueryInput size="small" aria-label="Small query" qualifiers={qualifiers} defaultValue="is:open" />
      <QueryInput size="medium" aria-label="Medium query" qualifiers={qualifiers} defaultValue="is:open" />
      <QueryInput size="large" aria-label="Large query" qualifiers={qualifiers} defaultValue="is:open" />
    </div>
  );
}
```

### Shortcut
`shortcut` focuses the field from anywhere on the page and shows the key while the field is empty.

```jsx
import { QueryInput } from '@hyprsh/design';

const qualifiers = [
  { name: 'is', help: 'Open or closed', values: ['open', 'closed'] },
  { name: 'label', help: 'Has this label', suggestions: ['bug', 'docs', 'enhancement'], excludable: true },
];

export default function Example() {
  return <QueryInput aria-label="Search issues" placeholder="Search issues…" qualifiers={qualifiers} shortcut="/" />;
}
```
