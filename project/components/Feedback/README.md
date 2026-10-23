# Feedback

A “Was this helpful?” widget that collects a reaction and a short note, either from a trigger button's popover or inline as an expanding pill.

**You provide:** `onSubmit`, which receives `{ emotion, text, topic, metadata }` and may return a Promise (the component never makes a network request), plus optional `type` (`'popover'` or `'inline'`), `label`, `copy`, `metadata`, `showTopics` with `topics`, `prefix`/`suffix` icons, `defaultOpen` and `dryRun`.

- Put it at the end of a flow or page, not in the way of the main task, and keep it collapsed until someone opens it.
- Write `label` in Title Case without a question mark (Feedback, Docs Feedback). Write `copy` in sentence case (Was this helpful?).
- The four reactions are native radios: arrow keys move between them, and each has a spoken name (Hate It, Not Great, It’s Okay, Love It).
- ⌘ or Ctrl + Enter sends from the text box. Escape and clicking outside close the popover and return focus to the trigger.
- `metadata` travels with every submission. Keep it to context like the page path or release, never personal data.

## Examples

`onSubmit` receives the reaction and note, and the component never makes a request itself. These examples wait 600 ms to stand in for one.

### Popover
A trigger button opens a popover with a reaction and a note.

```jsx
import { Feedback } from '@hyprsh/design';

const send = () => new Promise((resolve) => setTimeout(resolve, 600));

export default function Example() {
  return <Feedback onSubmit={send} metadata={{ page: '/docs/deployments' }} />;
}
```

### Inline
An expanding pill at the end of a page.

```jsx
import { Feedback } from '@hyprsh/design';

const send = () => new Promise((resolve) => setTimeout(resolve, 600));

export default function Example() {
  return <Feedback type="inline" onSubmit={send} metadata={{ page: '/docs/domains' }} />;
}
```

### With Topics
`showTopics` adds a topic picker. Use `topics` for the choices.

```jsx
import { Feedback } from '@hyprsh/design';

const send = () => new Promise((resolve) => setTimeout(resolve, 600));

export default function Example() {
  return (
    <Feedback
      onSubmit={send}
      showTopics
      topics={['Documentation', { value: 'dashboard', label: 'Dashboard' }, 'CLI']}
    />
  );
}
```

### Reading the Payload
`onSubmit` gets `{ emotion, text, topic, metadata }`.

```jsx
import { useState } from 'react';
import { Feedback } from '@hyprsh/design';
import { MessageSquare } from 'lucide-react';

export default function Example() {
  const [last, setLast] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <Feedback
        prefix={<MessageSquare />}
        label="Feedback"
        metadata={{ page: '/docs/rollbacks' }}
        onSubmit={(payload) => { setLast(payload); }}
      />
      <span className="copy-13" role="status">{last ? `Received “${last.emotion || 'no reaction'}” with ${last.text.length} characters` : 'Nothing sent yet'}</span>
    </div>
  );
}
```
