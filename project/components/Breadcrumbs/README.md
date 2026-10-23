# Breadcrumbs

Shows where the current page sits in the app, from the team down to the page, with a link back to each level.

**You provide:** `BreadcrumbItem` children, each with `href` and the text, from the top level down. Mark the current page with `active`, and use `disabled` for a level the user can't open. Optional: `type` (`text` path with chevrons, or `menu` chips), `prefix` on an item for an icon or avatar, and `aria-label` (default “Breadcrumb”). `Breadcrumb` is an alias for the same component.

- Use Breadcrumbs on pages two or more levels deep, such as Team / Project / Deployment. Skip it on top-level pages.
- The last item is the current page: give it `active` and usually no `href`. Screen readers hear it as the current page.
- Use the real names of things (“acme-web”, “Production”), not generic labels like “Project”. Long names are truncated with “…”.
- Keep it to one line. For very deep paths, show the first level and the last two.
- Use `type="menu"` in dense headers and toolbars. Use the default `text` type in page headers.

## Examples

### Default
The path from the team down to the current page, with a link back to each level.

```jsx
import { Breadcrumbs, BreadcrumbItem } from '@hyprsh/design';

export default function Example() {
  return (
    <Breadcrumbs>
      <BreadcrumbItem href="#">Platform Team</BreadcrumbItem>
      <BreadcrumbItem href="#">marketing-site</BreadcrumbItem>
      <BreadcrumbItem href="#" active>Deployments</BreadcrumbItem>
    </Breadcrumbs>
  );
}
```

### Menu Chips
`type="menu"` draws each level as a chip.

```jsx
import { Breadcrumbs, BreadcrumbItem } from '@hyprsh/design';

export default function Example() {
  return (
    <Breadcrumbs type="menu" aria-label="Project path">
      <BreadcrumbItem href="#">Platform Team</BreadcrumbItem>
      <BreadcrumbItem href="#">marketing-site</BreadcrumbItem>
      <BreadcrumbItem href="#" active>Settings</BreadcrumbItem>
    </Breadcrumbs>
  );
}
```

### With Icons and Avatars
`prefix` puts an icon or an avatar before the label.

```jsx
import { Avatar, Breadcrumbs, BreadcrumbItem } from '@hyprsh/design';
import { Globe } from 'lucide-react';

export default function Example() {
  return (
    <Breadcrumbs>
      <BreadcrumbItem href="#" prefix={<Avatar size={20} title="Platform Team" letter="PT" />}>Platform Team</BreadcrumbItem>
      <BreadcrumbItem href="#" prefix={<Globe />}>Domains</BreadcrumbItem>
      <BreadcrumbItem href="#" active>hyprsh.dev</BreadcrumbItem>
    </Breadcrumbs>
  );
}
```

### Disabled Level
Use `disabled` for a level the person can’t open.

```jsx
import { Breadcrumbs, BreadcrumbItem } from '@hyprsh/design';

export default function Example() {
  return (
    <Breadcrumbs>
      <BreadcrumbItem href="#">Platform Team</BreadcrumbItem>
      <BreadcrumbItem disabled>Billing</BreadcrumbItem>
      <BreadcrumbItem href="#" active>Invoices</BreadcrumbItem>
    </Breadcrumbs>
  );
}
```
