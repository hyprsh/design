# Pill

A link styled like a Badge: a light, rounded way to point somewhere that doesn't need the weight of a button.

**You provide:** the label as `children` and an `href`. Optional: `size` (`sm` | `md` | `lg`, default `md`; `small` | `medium` | `large` also work), an `icon` node before the label, and any anchor attributes such as `target`. Without `href`, an `onClick` renders a `<button>`.

- Use a Pill for secondary destinations: a changelog entry, a filter shortcut, a “Join the Discussion” link. Use a Button for actions that change something.
- Keep the label to one to three words in Title Case, and make it name the destination.
- Badge is for static labels; never make a Badge clickable when a Pill fits.
- The small size draws at 20px but keeps a 24px hit area.
