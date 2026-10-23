# Banner

A centred, one-line announcement at the top of a page or section, with a single link to read more.

**You provide:** the announcement as `children`, usually a bold lead and one short clause (`<b>Build Cache</b> – Now shared across every branch`), and an optional `button` object with `content` (the link text) and `href` or `onClick`. Pad it with your own `className` or `style`.

- One banner per page, about something new. For a problem with the current project, use ProjectBanner; for an inline message next to the thing it concerns, use Note.
- Keep the text to one line at desktop width. The lead is one or two Title Case words; the link text is a short verb such as “Read More”.
- Below about 560px of available width, the text and link merge into one rounded button that truncates, so the whole banner stays one tap target.
- It fills the width of its parent and measures that width, so put it in a block with a width (a block or `width: 100%`), not in a shrink-to-fit flex item.
- It is not dismissible and doesn't animate in.

## Examples

### Default
A bold lead, one short clause and one link.

```jsx
import { Banner } from '@hyprsh/design';

export default function Example() {
  return (
    <Banner button={{ content: 'Read More', href: '#' }} style={{ padding: 12 }}>
      <b>Build Cache</b> – Now shared across every branch
    </Banner>
  );
}
```

### Without a Link
The announcement can stand on its own.

```jsx
import { Banner } from '@hyprsh/design';

export default function Example() {
  return (
    <Banner style={{ padding: 12 }}>
      <b>Scheduled Maintenance</b> – Builds pause on Oct 28 at 02:00 UTC
    </Banner>
  );
}
```

### With an Action
Use `onClick` when the link does something on the page instead of navigating.

```jsx
import { useState } from 'react';
import { Banner } from '@hyprsh/design';

export default function Example() {
  const [opened, setOpened] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      <Banner button={{ content: 'View Changelog', onClick: () => setOpened(true) }} style={{ padding: 12 }}>
        <b>Version 0.9</b> – Query bar menus wrap onto more rows
      </Banner>
      {opened ? <span className="copy-14" role="status">Changelog opened.</span> : null}
    </div>
  );
}
```

### At the Top of a Page
Pad it with your own `style` and place it above the content.

```jsx
import { Banner } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ width: '100%', border: '1px solid var(--gray-alpha-400)', borderRadius: 8, overflow: 'hidden' }}>
      <Banner button={{ content: 'Upgrade Plan', href: '#' }} style={{ padding: 12 }}>
        <b>Bandwidth</b> – 90% of your monthly limit is used
      </Banner>
      <div style={{ padding: 16 }}>
        <h2 className="heading-20" style={{ margin: 0 }}>Usage</h2>
      </div>
    </div>
  );
}
```
