# CommandMenu

A ⌘ K palette for jumping to pages and running actions. It is a modal dialog holding a combobox and a listbox: type to filter, use ↑/↓ to move, ↵ to run and Esc to close. A polite live region announces the result count.

**You provide:** `open` and `setOpen(next)` (`onOpenChange` also works), then the parts: `CommandMenuInput` (`placeholder`), and `CommandMenuList` holding `CommandMenuGroup` (`heading`), `CommandMenuItem` (`callback`, `suffix`, `prefix`, `keywords`, `value`, `disabled`) and `CommandMenuDivider`. The menu closes before an item's `callback` runs. Shorthand: skip the parts and pass `groups` (`[{ heading, items: [{ label, onSelect, keywords?, shortcut?, icon? }] }]`) with an optional `placeholder`. Optional: `label`, `hotkey={false}` to turn off the built-in ⌘/Ctrl + K listener, `inline`, and `empty` on the list to replace the empty-state copy.

**Your own search:** the query is internal by default. Pass `query` and `onQueryChange(next)` on `CommandMenu` to control it (read it to fetch results, set it, or clear it when a step changes). Pass `shouldFilter={false}` to show every item in the order you render them, or `filter(item, query)` (`item` is `{ value, keywords }`; return a boolean) to replace the built-in word match. `onKeyDown(e)` on `CommandMenu` runs first for every key pressed inside the menu, before the built-in ↑/↓/Ctrl+N/Ctrl+P/↵/Esc/Tab handling. The event type is exported as `CommandMenuKeyEvent` (type-only), so a separate handler can be written `(e: CommandMenuKeyEvent) => void`. Call `e.skipMenu()` to skip the menu's handling of that key and leave the browser default alone, e.g. to make Esc go back a step while Enter and Space still press a button. `e.preventDefault()` also skips the menu's handling (as before), but cancels the default too, so native keys on buttons and radios stop working; Tab is still trapped after `skipMenu()` but not after `preventDefault()`. Keys whose target is inside content other than the input and the list, such as a panel you render in place of the list, are never handled by the menu (your hook still sees them), so buttons and radios there keep their native keys; Tab stays trapped in the menu everywhere. On `CommandMenuInput`, `prefix` puts a node (a mode badge) before the field and `hideClose` (or `closeButton={false}`) removes the Esc button. On `CommandMenuList`, `loading` shows a spinner row with “Searching…” (or `loadingLabel`) instead of the empty state, marks the list `aria-busy` and announces the row politely. The highlight returns to the first item whenever the visible items change.

**Focusing the input:** the input autofocuses when the menu opens. To focus it later, after swapping the menu body or after a row click, pass `inputRef` on `CommandMenu` (a ref object or callback) or a `ref` on `CommandMenuInput`; both receive the `<input>` and work together. `inputRef` is the one to use with the `groups` shorthand. The ref is `null` while the body shows no input, so focus in an effect after the swap.

**Keys:** ↑/↓ and Ctrl+N/Ctrl+P move the highlight, Ctrl+Home/Ctrl+End jump to the first and last item, ↵ runs the item and Esc closes. The built-in ⌘/Ctrl + K toggle is separate and unaffected.

- Item labels are Title Case verbs or page names: “Go to Settings”, “Create Project…”. Add `keywords` for synonyms.
- Put shortcuts in `suffix` as `KeyboardInput` keys so the palette teaches them.
- The default empty state echoes the query: “No results for “q”.” It makes no assumption about what you search; pass `empty` on `CommandMenuList` to suggest what to try.
- Every command must also be reachable without the palette.
- With `shouldFilter={false}` the empty state still shows when the query is set and no items render. Show `loading` while a search is in flight so an empty list isn't mistaken for “No results”.

## Examples

### Default
Open it from a trigger. ⌘ K also opens it unless `hotkey={false}`.

```jsx
import { useState } from 'react';
import { Button, CommandMenu, CommandMenuGroup, CommandMenuInput, CommandMenuItem, CommandMenuList, KeyboardInput } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" size="small" onClick={() => setOpen(true)} suffix={<KeyboardInput meta small>K</KeyboardInput>}>Search…</Button>
      <CommandMenu open={open} setOpen={setOpen}>
        <CommandMenuInput placeholder="Search for a command or page…" />
        <CommandMenuList>
          <CommandMenuGroup heading="Projects">
            <CommandMenuItem callback={() => {}}>marketing-site</CommandMenuItem>
            <CommandMenuItem callback={() => {}}>docs</CommandMenuItem>
          </CommandMenuGroup>
          <CommandMenuGroup heading="Actions">
            <CommandMenuItem keywords={['new']} callback={() => {}}>Create Project…</CommandMenuItem>
            <CommandMenuItem keywords={['ship', 'release']} callback={() => {}}>Deploy to Production</CommandMenuItem>
          </CommandMenuGroup>
        </CommandMenuList>
      </CommandMenu>
    </>
  );
}
```

### Shorthand Groups
Pass `groups` instead of the parts for a simple palette.

```jsx
import { useState } from 'react';
import { Button, CommandMenu } from '@hyprsh/design';
import { GitBranch, Settings } from 'lucide-react';

export default function Example() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Open Command Menu</Button>
      <CommandMenu
        open={open}
        setOpen={setOpen}
        placeholder="Search for a command…"
        groups={[
          { heading: 'Navigation', items: [
            { label: 'Go to Settings', icon: <Settings />, keywords: ['preferences'] },
            { label: 'Go to Branches', icon: <GitBranch /> },
          ] },
          { heading: 'Actions', items: [
            { label: 'Switch Theme', shortcut: '⌘ ⇧ L', keywords: ['dark', 'light'] },
            { label: 'Delete Project', disabled: true },
          ] },
        ]}
      />
    </>
  );
}
```

### Running an Item
The menu closes before an item’s `callback` runs.

```jsx
import { useState } from 'react';
import { Button, CommandMenu, CommandMenuInput, CommandMenuItem, CommandMenuList } from '@hyprsh/design';

export default function Example() {
  const [open, setOpen] = useState(false);
  const [last, setLast] = useState('Nothing yet');

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="secondary" onClick={() => setOpen(true)}>Run a Command</Button>
      <span className="copy-14" role="status">Last command: {last}</span>
      <CommandMenu open={open} setOpen={setOpen} hotkey={false}>
        <CommandMenuInput placeholder="Run a command…" />
        <CommandMenuList empty="No commands match.">
          <CommandMenuItem callback={() => setLast('Redeploy')}>Redeploy</CommandMenuItem>
          <CommandMenuItem callback={() => setLast('Rollback')}>Roll Back Deployment</CommandMenuItem>
          <CommandMenuItem callback={() => setLast('Clear Cache')}>Clear Build Cache</CommandMenuItem>
        </CommandMenuList>
      </CommandMenu>
    </div>
  );
}
```

### Loading Results
`loading` on the list shows a spinner while results load.

```jsx
import { useEffect, useState } from 'react';
import { Button, CommandMenu, CommandMenuInput, CommandMenuItem, CommandMenuList } from '@hyprsh/design';

const all = ['hyprsh-web', 'hyprsh-api', 'hyprsh-docs', 'hyprsh-edge', 'hyprsh-billing'];

export default function Example() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(all.slice(0, 3));

  useEffect(() => {
    if (!open) return undefined;
    setLoading(true);
    const t = setTimeout(() => {
      const q = query.trim().toLowerCase();
      setResults(q ? all.filter((n) => n.includes(q)) : all.slice(0, 3));
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [open, query]);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Find Repository</Button>
      <CommandMenu open={open} setOpen={setOpen} query={query} onQueryChange={setQuery} shouldFilter={false}>
        <CommandMenuInput placeholder="Search repositories…" />
        <CommandMenuList loading={loading} loadingLabel="Searching…" empty="No repositories match.">
          {results.map((name) => <CommandMenuItem key={name} callback={() => {}}>{name}</CommandMenuItem>)}
        </CommandMenuList>
      </CommandMenu>
    </>
  );
}
```
