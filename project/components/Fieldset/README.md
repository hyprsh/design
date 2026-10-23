# Fieldset

A settings card: a title, a subtitle and controls on top, and a gray footer with a status line and actions.

**You provide:** a `Fieldset` holding a `FieldsetContent` (with a `FieldsetTitle`, a `FieldsetSubtitle` and the controls) and a `FieldsetFooter` (with a `FieldsetFooterStatus` and `FieldsetFooterActions` holding one or two `FieldsetFooterAction` buttons). Optional: `type="error"` or `"warning"` on the Fieldset (red or amber border and footer, plus an icon in the status), `disabled` on the content (disables every control inside, natively), `highlight` on the footer, and `as` on the title to set the heading level. The parts also hang off the root: `Fieldset.Content`, `Fieldset.Title`, `Fieldset.Footer.Status` and so on.

- Use one Fieldset per setting, or per small group of settings that save together.
- The title names the setting in Title Case; the subtitle is one or two sentences on what it does.
- Put help links and the current state in the footer status, and the Save button on the right. Disable Save until something changed.
- `type="error"` is for a setting that is broken now (a failed domain check), not for a validation message on one field: put that on the field.
- A disabled Fieldset says why in the footer status ("Only team owners can change this.").
- The content is a native `<fieldset>` named by its title, so screen readers announce the setting with each control.

## Examples

### Default
A title, a subtitle and a control on top, and a footer with a status line and one action.

```jsx
import { Button, Fieldset, FieldsetContent, FieldsetFooter, FieldsetFooterAction, FieldsetFooterActions, FieldsetFooterStatus, FieldsetSubtitle, FieldsetTitle, Input } from '@hyprsh/design';

export default function Example() {
  return (
    <Fieldset>
      <FieldsetContent>
        <FieldsetTitle>Project Name</FieldsetTitle>
        <FieldsetSubtitle>Used in the dashboard and in deployment URLs.</FieldsetSubtitle>
        <Input aria-label="Project Name" name="project" defaultValue="marketing-site" autoComplete="off" />
      </FieldsetContent>
      <FieldsetFooter>
        <FieldsetFooterStatus>Use 1–52 lowercase letters, numbers or hyphens.</FieldsetFooterStatus>
        <FieldsetFooterActions>
          <FieldsetFooterAction variant="default" size="small">Save Name</FieldsetFooterAction>
        </FieldsetFooterActions>
      </FieldsetFooter>
    </Fieldset>
  );
}
```

### Saving
Keep the control in state and enable the action only when something changed.

```jsx
import { useState } from 'react';
import { Fieldset, FieldsetContent, FieldsetFooter, FieldsetFooterAction, FieldsetFooterActions, FieldsetFooterStatus, FieldsetSubtitle, FieldsetTitle, Input } from '@hyprsh/design';

export default function Example() {
  const [saved, setSaved] = useState('main');
  const [branch, setBranch] = useState('main');
  const dirty = branch.trim() !== saved;

  return (
    <Fieldset>
      <FieldsetContent>
        <FieldsetTitle>Production Branch</FieldsetTitle>
        <FieldsetSubtitle>Pushes to this branch deploy to production.</FieldsetSubtitle>
        <Input aria-label="Production Branch" name="branch" mono spellCheck={false} value={branch} onChange={(e) => setBranch(e.target.value)} autoComplete="off" />
      </FieldsetContent>
      <FieldsetFooter highlight={dirty}>
        <FieldsetFooterStatus>{dirty ? 'You have unsaved changes.' : 'Saved'}</FieldsetFooterStatus>
        <FieldsetFooterActions>
          <FieldsetFooterAction variant="default" size="small" disabled={!dirty} onClick={() => setSaved(branch.trim())}>Save Branch</FieldsetFooterAction>
        </FieldsetFooterActions>
      </FieldsetFooter>
    </Fieldset>
  );
}
```

### Warning and Error
`type` tints the border and footer and adds an icon to the status.

```jsx
import { Fieldset, FieldsetContent, FieldsetFooter, FieldsetFooterAction, FieldsetFooterActions, FieldsetFooterStatus, FieldsetSubtitle, FieldsetTitle } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Fieldset type="warning">
        <FieldsetContent>
          <FieldsetTitle>Transfer Project</FieldsetTitle>
          <FieldsetSubtitle>Billing moves to the new team.</FieldsetSubtitle>
        </FieldsetContent>
        <FieldsetFooter>
          <FieldsetFooterStatus>The new team must accept the transfer.</FieldsetFooterStatus>
          <FieldsetFooterActions><FieldsetFooterAction size="small">Transfer Project…</FieldsetFooterAction></FieldsetFooterActions>
        </FieldsetFooter>
      </Fieldset>
      <Fieldset type="error">
        <FieldsetContent>
          <FieldsetTitle>Delete Project</FieldsetTitle>
          <FieldsetSubtitle>Removes every deployment and domain.</FieldsetSubtitle>
        </FieldsetContent>
        <FieldsetFooter>
          <FieldsetFooterStatus>This can’t be undone.</FieldsetFooterStatus>
          <FieldsetFooterActions><FieldsetFooterAction variant="error" size="small">Delete Project…</FieldsetFooterAction></FieldsetFooterActions>
        </FieldsetFooter>
      </Fieldset>
    </div>
  );
}
```

### Disabled Content
`disabled` on the content disables every control inside.

```jsx
import { Fieldset, FieldsetContent, FieldsetFooter, FieldsetFooterStatus, FieldsetSubtitle, FieldsetTitle, Input } from '@hyprsh/design';

export default function Example() {
  return (
    <Fieldset>
      <FieldsetContent disabled>
        <FieldsetTitle>Custom Domain</FieldsetTitle>
        <FieldsetSubtitle>Serve this project from your own address.</FieldsetSubtitle>
        <Input aria-label="Custom Domain" name="domain" placeholder="hyprsh.dev…" autoComplete="off" />
      </FieldsetContent>
      <FieldsetFooter>
        <FieldsetFooterStatus>Custom domains are available on Pro.</FieldsetFooterStatus>
      </FieldsetFooter>
    </Fieldset>
  );
}
```
