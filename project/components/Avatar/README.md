# Avatar

A round avatar for a person, team or project, with initials or a generated gradient shape, plus `AvatarGroup` for a stacked cluster and `AvatarWithIcon` for a status badge.

**You provide:** `size` (px, default 32) and a name as `title` or `username`. Then `letter` for initials, `placeholder` for a loading shell, or `src` for an image you host; with none of these it draws a gradient seeded by the name. `AvatarGroup` takes `members` (`[{ username, title, letter }]`), `size`, `limit`, `overlap` (`'auto'` by default, or px) and `reverse`. `AvatarWithIcon` adds `icon` and `iconBackground`.

- Use one `Avatar` for one entity. For two or more, use `AvatarGroup`: it handles overlap and gives the cluster one accessible label.
- `title` is the literal name (Platform Team, ci-bot). Letter avatars already announce “Avatar with initials”, so don't write “Avatar of …”.
- Initials are one or two uppercase characters from the name. No emoji, punctuation or “?”.
- Use `placeholder` only while loading, never as a permanent fallback.
- Match the size to nearby type: 20–24px beside `label-14`, 32px beside `label-16`, 48–64px in headers and onboarding.
- Never show photos of real people in demos. Use initials or the generated shape.

## Examples

### Initials and Generated Shapes
Pass `letter` for initials. Without one, the avatar draws a gradient seeded by the name.

```jsx
import { Avatar } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Avatar title="Ada Lovelace" letter="AL" />
      <Avatar title="Platform Team" letter="PT" />
      <Avatar title="marketing-site" />
      <Avatar username="docs" />
    </div>
  );
}
```

### Sizes
`size` is a diameter in pixels.

```jsx
import { Avatar } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Avatar size={20} title="Grace Hopper" letter="GH" />
      <Avatar size={32} title="Grace Hopper" letter="GH" />
      <Avatar size={48} title="Grace Hopper" letter="GH" />
      <Avatar size={64} title="Grace Hopper" letter="GH" />
    </div>
  );
}
```

### Loading Placeholder
A blank shell holds the space while the entity loads.

```jsx
import { Avatar } from '@hyprsh/design';

export default function Example() {
  return <Avatar placeholder size={40} />;
}
```

### Group
A stacked cluster with a “+N” counter past `limit`.

```jsx
import { AvatarGroup } from '@hyprsh/design';

const members = [
  { title: 'Ada Lovelace', letter: 'AL' },
  { title: 'Grace Hopper', letter: 'GH' },
  { title: 'Linus Torvalds', letter: 'LT' },
  { title: 'Margaret Hamilton', letter: 'MH' },
  { title: 'Dennis Ritchie', letter: 'DR' },
  { title: 'Barbara Liskov', letter: 'BL' },
];

export default function Example() {
  return <AvatarGroup aria-label="Project members" members={members} limit={4} size={32} />;
}
```

### With a Status Icon
`AvatarWithIcon` adds a small icon in the corner. Put it on a disc with `iconBackground` so it reads.

```jsx
import { AvatarWithIcon } from '@hyprsh/design';
import { Lock } from 'lucide-react';

export default function Example() {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <AvatarWithIcon size={48} title="Platform Team" letter="PT" icon={<Lock />} iconBackground />
      <AvatarWithIcon size={48} title="marketing-site" icon={<Lock />} iconBackground />
    </div>
  );
}
```
