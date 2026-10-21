# ContextCard

A floating card that appears on hover or focus of its trigger and can hold richer content than a tooltip, such as an entity preview with a few metadata rows. Escape closes it and returns focus to the trigger.

**You provide:** `content` and the trigger as `children`. Optional: `side` (`top` | `bottom` | `left` | `right`, default `top`), `align` (`start` | `center` | `end`), `render` (an element such as an `<a>` to use as the trigger instead of the default `<div>`), `delay` (ms, default 150), `tip={false}` and `defaultOpen` (hyprsh). Geist calls it `ContextCardTrigger`; both names work.

- Use it to reveal entity metadata (a user, deployment, project or API key) from a name link or avatar in dense data. For a one-line “why” use a Tooltip; for long content or forms use a Drawer or a page.
- Lead with the entity name and one identifying line, then 2–4 “Label: value” rows with Title Case keys. Show unknown values as “—”, never “N/A”.
- At most one action (“View Project”). Never put destructive actions in it: it can close when the pointer leaves.
- Don't repeat what the trigger already shows, and never nest it in a Tooltip or another ContextCard.
- The trigger keeps its own accessible name; the card is supplementary.
