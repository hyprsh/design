# EmptyState

A bordered, centred block that fills a view with nothing to show yet, explaining why and offering the next step.

**You provide:** `title`, `description`, an `icon` (a Lucide name or a node, drawn in a bordered tile; `EmptyState.Icon` draws the tile on its own) and children for the actions. Set `headingLevel` (default 3) to fit the page outline.

**Small:** `size="small"` renders one line of text with no border, icon or heading, left-aligned: for a section of a dashboard or a pane where the block would make the page much taller (“Nothing needs attention.”). Pass the sentence as `title` (sentence case, ends with a full stop), optionally a `description` after it and a link as children. It ignores `icon` and `headingLevel`.

- Offer one primary call to action and at most one secondary, often a “Learn More” link.
- Write the title in Title Case (No Deployments Yet) and name actions Verb + Noun (Create Project).
- For an empty search, quote the query with curly quotes: No results for “billing”. Suggest clearing filters.
- When filters change what's shown, put the empty state in an `aria-live="polite"` region so the change is announced.
- For a failed load, say what went wrong, give a copyable request ID if you have one, and offer Try Again. Use ErrorCard when the failure is the main message.

## Examples

### Default
A title, one or two sentences on why it is empty, and one primary action.

```jsx
import { Button, EmptyState } from '@hyprsh/design';

export default function Example() {
  return (
    <EmptyState
      icon="rocket"
      title="No Deployments Yet"
      description="Push to your production branch or deploy from the CLI to create the first one."
    >
      <Button variant="default">Deploy Project</Button>
    </EmptyState>
  );
}
```

### Primary and Secondary
At most one secondary action, often a link.

```jsx
import { Button, EmptyState } from '@hyprsh/design';
import { Globe } from 'lucide-react';

export default function Example() {
  return (
    <EmptyState
      icon={<Globe />}
      title="No Domains Connected"
      description="Add a domain you own to serve this project from your own address."
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="default">Add Domain</Button>
        <Button variant="tertiary">Read the Docs</Button>
      </div>
    </EmptyState>
  );
}
```

### No Results
For a search or filter that matches nothing, offer the way back.

```jsx
import { useState } from 'react';
import { Button, EmptyState } from '@hyprsh/design';

export default function Example() {
  const [query, setQuery] = useState('payments-v2');

  if (!query) {
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <p className="copy-14" style={{ margin: 0 }}>Showing every project.</p>
        <Button size="small" variant="tertiary" onClick={() => setQuery('payments-v2')}>Search Again</Button>
      </div>
    );
  }

  return (
    <EmptyState
      icon="search"
      title="No Projects Found"
      description={`Nothing matches “${query}”. Check the spelling or clear the search.`}
    >
      <Button onClick={() => setQuery('')}>Clear Search</Button>
    </EmptyState>
  );
}
```

### Small
`size="small"` is a single line for a section of a dense page.

```jsx
import { Button, EmptyState } from '@hyprsh/design';

export default function Example() {
  return (
    <EmptyState size="small" title="No environment variables yet.">
      <Button size="small" variant="tertiary">Add Variable</Button>
    </EmptyState>
  );
}
```

### Heading Level
`headingLevel` fits the title into the page outline.

```jsx
import { EmptyState } from '@hyprsh/design';

export default function Example() {
  return (
    <section style={{ width: '100%' }}>
      <h2 className="heading-20" style={{ margin: '0 0 16px' }}>Activity</h2>
      <EmptyState
        headingLevel={3}
        icon="activity"
        title="No Activity Yet"
        description="Deployments, domain changes and member updates appear here."
      />
    </section>
  );
}
```
