# FileTree

A nested list of folders and files, for build output, project structure and source browsers.

**You provide:** `FileTree.Folder` items with a `name` and children, and `FileTree.File` items with a `name`. Optional on folders: `defaultOpen`, or `open` with `onOpenChange`. Optional on files: `href` to make the row a link, `type` (`edge-function`, `lambda` or `middleware`) for a function icon, and `active` for the current file.

- Open the path to what matters and leave the rest closed. A fully open tree of a real project is just a long list.
- Folders are buttons with `aria-expanded`; files with an `href` are links, and files without one are plain text. Children of a closed folder are not rendered.
- Use `type` only for outputs that run code, so the icon means something. Ordinary source files keep the file icon.
- Names stay on one line and truncate with an ellipsis. Give the tree enough width for the deepest path you expect.
- Indent guides line up under the parent folder's icon, 24px per level.

## Examples

### Default
Nested folders and files, as for build output.

```jsx
import { FileTree } from '@hyprsh/design';

export default function Example() {
  return (
    <FileTree aria-label="Build output">
      <FileTree.Folder name="app" defaultOpen>
        <FileTree.File name="layout.tsx" />
        <FileTree.File name="page.tsx" />
      </FileTree.Folder>
      <FileTree.Folder name="public">
        <FileTree.File name="favicon.ico" />
      </FileTree.Folder>
      <FileTree.File name="package.json" />
    </FileTree>
  );
}
```

### Function Types
`type` shows a function icon for lambdas, edge functions and middleware.

```jsx
import { FileTree } from '@hyprsh/design';

export default function Example() {
  return (
    <FileTree aria-label="Functions">
      <FileTree.Folder name="api" defaultOpen>
        <FileTree.File name="deploy.ts" type="lambda" />
        <FileTree.File name="health.ts" type="edge-function" />
      </FileTree.Folder>
      <FileTree.File name="middleware.ts" type="middleware" />
    </FileTree>
  );
}
```

### Links and the Current File
`href` makes a row a link, and `active` marks the current file.

```jsx
import { FileTree } from '@hyprsh/design';

export default function Example() {
  return (
    <FileTree aria-label="Source files">
      <FileTree.Folder name="src" defaultOpen>
        <FileTree.File name="index.ts" href="#index" />
        <FileTree.File name="routes.ts" href="#routes" active />
        <FileTree.File name="config.ts" href="#config" />
      </FileTree.Folder>
    </FileTree>
  );
}
```

### Controlled Folder
Hold a folder’s open state yourself.

```jsx
import { useState } from 'react';
import { Button, FileTree } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      <Button size="small" variant="secondary" onClick={() => setOpen((o) => !o)}>{open ? 'Collapse Assets' : 'Expand Assets'}</Button>
      <FileTree aria-label="Static assets">
        <FileTree.Folder name="assets" open={open} onOpenChange={setOpen}>
          <FileTree.File name="logo.svg" />
          <FileTree.File name="app.css" />
        </FileTree.Folder>
      </FileTree>
    </div>
  );
}
```
