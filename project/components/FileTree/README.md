# FileTree

A nested list of folders and files, for build output, project structure and source browsers.

**You provide:** `FileTree.Folder` items with a `name` and children, and `FileTree.File` items with a `name`. Optional on folders: `defaultOpen`, or `open` with `onOpenChange`. Optional on files: `href` to make the row a link, `type` (`edge-function`, `lambda` or `middleware`) for a function icon, and `active` for the current file.

- Open the path to what matters and leave the rest closed. A fully open tree of a real project is just a long list.
- Folders are buttons with `aria-expanded`; files with an `href` are links, and files without one are plain text. Children of a closed folder are not rendered.
- Use `type` only for outputs that run code, so the icon means something. Ordinary source files keep the file icon.
- Names stay on one line and truncate with an ellipsis. Give the tree enough width for the deepest path you expect.
- Indent guides line up under the parent folder's icon, 24px per level.
