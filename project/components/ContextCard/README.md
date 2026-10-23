# ContextCard

A floating card that appears on hover or focus of its trigger and can hold richer content than a tooltip, such as an entity preview with a few metadata rows. Escape closes it and returns focus to the trigger.

**You provide:** `content` and the trigger as `children`. Optional: `side` (`top` | `bottom` | `left` | `right`, default `top`), `align` (`start` | `center` | `end`), `render` (an element such as an `<a>` to use as the trigger instead of the default `<div>`), `delay` (ms, default 150), `tip={false}` and `defaultOpen` (hyprsh). `ContextCardTrigger` is an alias; both names work.

- Use it to reveal entity metadata (a user, deployment, project or API key) from a name link or avatar in dense data. For a one-line “why” use a Tooltip; for long content or forms use a Drawer or a page.
- Lead with the entity name and one identifying line, then 2–4 “Label: value” rows with Title Case keys. Show unknown values as “—”, never “N/A”.
- At most one action (“View Project”). Never put destructive actions in it: it can close when the pointer leaves.
- Don't repeat what the trigger already shows, and never nest it in a Tooltip or another ContextCard.
- On touch screens there is no hover: a tap on the trigger toggles the card (the first tap on a link opens the card, a second tap follows the link) and a tap outside closes it. The card flips sides and stays 8px inside the screen.
- The trigger keeps its own accessible name; the card is supplementary.

## Examples

### Default
Hover or focus the trigger for richer content than a tooltip.

```jsx
import { Badge, ContextCard } from '@hyprsh/design';

export default function Example() {
  return (
    <ContextCard
      content={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 200 }}>
          <strong className="label-14">marketing-site</strong>
          <span className="copy-13">Deployed 2 hours ago from main.</span>
          <span><Badge variant="green" contrast="low">Ready</Badge></span>
        </div>
      }
    >
      <a className="label-14" href="#" style={{ color: 'var(--link)' }}>marketing-site</a>
    </ContextCard>
  );
}
```

### Link Trigger
`render` uses an element you provide as the trigger, so a real link keeps its semantics.

```jsx
import { ContextCard } from '@hyprsh/design';

export default function Example() {
  return (
    <ContextCard
      render={<a href="#" style={{ color: 'var(--link)' }} />}
      content={<span className="copy-13">Ada Lovelace · Owner · Joined Oct 3</span>}
    >
      @ada
    </ContextCard>
  );
}
```

### Sides and Alignment
`side` and `align` place the card.

```jsx
import { Button, ContextCard } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '56px 8px' }}>
      <ContextCard side="top" content={<span className="copy-13">Above the trigger</span>}><Button variant="secondary">Top</Button></ContextCard>
      <ContextCard side="bottom" align="start" content={<span className="copy-13">Below, aligned to the start</span>}><Button variant="secondary">Bottom</Button></ContextCard>
      <ContextCard side="right" content={<span className="copy-13">To the right</span>}><Button variant="secondary">Right</Button></ContextCard>
    </div>
  );
}
```

### Delay and No Arrow
`delay` sets the wait in milliseconds, and `tip={false}` hides the arrow.

```jsx
import { Button, ContextCard } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ padding: '48px 8px' }}>
      <ContextCard delay={400} tip={false} content={<span className="copy-13">Waits 400 ms before it shows.</span>}>
        <Button variant="secondary">Slow Card</Button>
      </ContextCard>
    </div>
  );
}
```
