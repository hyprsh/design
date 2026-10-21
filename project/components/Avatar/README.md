# Avatar

A round avatar for a person, team or project, with initials or a generated gradient shape, plus `AvatarGroup` for a stacked cluster and `AvatarWithIcon` for a status badge.

**You provide:** `size` (px, default 32) and a name as `title` or `username`. Then `letter` for initials, `placeholder` for a loading shell, or `src` for an image you host; with none of these it draws a gradient seeded by the name. `AvatarGroup` takes `members` (`[{ username, title, letter }]`), `size`, `limit`, `overlap` (`'auto'` by default, or px) and `reverse`. `AvatarWithIcon` adds `icon` and `iconBackground`.

- Use one `Avatar` for one entity. For two or more, use `AvatarGroup`: it handles overlap and gives the cluster one accessible label.
- `title` is the literal name (Platform Team, ci-bot). Letter avatars already announce “Avatar with initials”, so don't write “Avatar of …”.
- Initials are one or two uppercase characters from the name. No emoji, punctuation or “?”.
- Use `placeholder` only while loading, never as a permanent fallback.
- Match the size to nearby type: 20–24px beside `label-14`, 32px beside `label-16`, 48–64px in headers and onboarding.
- Never show photos of real people in demos. Use initials or the generated shape.
