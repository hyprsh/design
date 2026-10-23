# ProjectBanner

A full-width strip under the page header about the state of the whole project, with the one action that resolves it.

**You provide:** the message as `label` (or `children`) and a `callToAction` object with a `label` and an `href` (a link) or `onClick` (a button styled as a link). Optional: `variant` (`gray` | `success` | `warning` | `error`) and `icon` to replace the variant's icon (`null` hides it).

- Use it for conditions that affect everything on the page: a paused project, a failed payment, a quota that's nearly spent. For a message about one section, use Note; for an announcement, use Banner.
- Show one at a time, at the top of the content. It isn't dismissible: it goes away when the condition is fixed.
- Always give a call to action, a Title Case verb and noun such as “Update Billing”.
- Success is blue. The icon and the landmark name (“Warning”, “Error”) carry the state, so it is never colour alone.
- Below about 560px of available width, the action wraps under the message and lines up with its text.

## Examples

### Default
A strip about the state of the whole project, with the one action that resolves it.

```jsx
import { ProjectBanner } from '@hyprsh/design';

export default function Example() {
  return (
    <ProjectBanner
      label="Production is serving an older deployment."
      callToAction={{ label: 'Promote Latest', href: '#promote' }}
    />
  );
}
```

### Variants
Gray, success, warning and error.

```jsx
import { ProjectBanner } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ProjectBanner variant="gray" label="This project is archived." callToAction={{ label: 'Restore Project', href: '#restore' }} />
      <ProjectBanner variant="success" label="Domain verified. Traffic now reaches this project." callToAction={{ label: 'View Domain', href: '#domain' }} />
      <ProjectBanner variant="warning" label="This project is close to its build minutes limit." callToAction={{ label: 'Upgrade Plan', href: '#upgrade' }} />
      <ProjectBanner variant="error" label="The last production build failed." callToAction={{ label: 'View Logs', href: '#logs' }} />
    </div>
  );
}
```

### Action as a Button
Use `onClick` when the action doesn’t navigate.

```jsx
import { useState } from 'react';
import { ProjectBanner } from '@hyprsh/design';

export default function Example() {
  const [retried, setRetried] = useState(false);

  return (
    <ProjectBanner
      variant="warning"
      label={retried ? 'Redeploying…' : 'The preview build was skipped.'}
      callToAction={{ label: 'Redeploy', onClick: () => setRetried(true) }}
    />
  );
}
```

### Custom Icon
`icon` replaces the variant’s icon, and `null` hides it.

```jsx
import { ProjectBanner } from '@hyprsh/design';
import { Rocket } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ProjectBanner variant="success" icon={<Rocket />} label="Deployed to production." callToAction={{ label: 'Visit Site', href: '#visit' }} />
      <ProjectBanner variant="gray" icon={null} label="Billing moves to the new team on the first." callToAction={{ label: 'Review Billing', href: '#billing' }} />
    </div>
  );
}
```
