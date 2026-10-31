# Bubble

A presentational chat message bubble, aligned by who sent it.

**You provide:** the message as `children`. Optional: `direction` (`received` | `sent`, default `received`), `position` (`single` | `first` | `middle` | `last`, default `single`) for consecutive messages from one side, `time` for a small secondary time after the content, and `className` and `style`.

- Bubble has no state, scrolling or list. Put bubbles in a column you control (a flex column with a small `gap`); a sent bubble aligns to the end of the row and a received one to the start.
- Mark a run from one side as `first`, `middle` and `last`: the corners on the sender's side tighten where bubbles meet. Use `single` for a lone message.
- A bubble is at most 80% of its container wide, and long words and URLs wrap inside it.
- Sent bubbles use the accent fill and received ones `gray-100`, so both follow the theme.
- Keep the text short and plain. For read receipts, reactions, replies or attachments, compose your own around it.

## Examples

### Received
The default direction, at the start of the row.

```jsx
import { Bubble } from '@hyprsh/design';

export default function Example() {
  return <Bubble>The build for feat/search is green.</Bubble>;
}
```

### Sent
The accent fill, at the end of the row.

```jsx
import { Bubble } from '@hyprsh/design';

export default function Example() {
  return <Bubble direction="sent">Promoting it to production now.</Bubble>;
}
```

### With Time
The time is drawn small and secondary after the content.

```jsx
import { Bubble } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Bubble time="10:41">Did the preview deployment finish?</Bubble>
      <Bubble direction="sent" time="10:42">Yes, it just went live.</Bubble>
    </div>
  );
}
```

### Conversation
Consecutive messages from one side use first, middle and last so they read as a group.

```jsx
import { Bubble } from '@hyprsh/design';

export default function Example() {
  const col = { display: 'flex', flexDirection: 'column', gap: 2 };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
      <div style={col}>
        <Bubble position="first">Did the preview deployment finish?</Bubble>
        <Bubble position="last" time="10:41">The build for feat/search is green.</Bubble>
      </div>
      <div style={col}>
        <Bubble direction="sent" position="first">Yes, it just went live.</Bubble>
        <Bubble direction="sent" position="middle">Checks passed on all three regions.</Bubble>
        <Bubble direction="sent" position="last" time="10:42">I’ll merge after review.</Bubble>
      </div>
      <Bubble time="10:43">Thanks, merging now.</Bubble>
    </div>
  );
}
```

### Long URL
Unbroken text wraps inside the bubble.

```jsx
import { Bubble } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ maxWidth: 320 }}>
      <Bubble direction="sent" time="10:44">
        https://app.example.com/projects/web/deployments/dpl_8f3a91c2b7d04e56a1b2c3d4e5f6a7b8
      </Bubble>
    </div>
  );
}
```
