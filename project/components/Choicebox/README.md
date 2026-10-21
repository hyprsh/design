# Choicebox

A group of large tiles with a title and description, for choices that need explaining (plans, regions, runtimes); it's a fieldset of native radios or checkboxes.

**You provide:** a `label` naming the group (hidden unless `showLabel`), and `ChoiceboxGroupItem` children (also `Choicebox.Item`), each with `title`, `value` and an optional `description`. Use `value` + `onChange(value)` or `defaultValue`. Optional: `type="checkbox"` to allow several (the value becomes an array; `radio` is the default), `direction="row"` to put tiles side by side (stacked by default), `disabled` on the group or on a tile, and children on a tile for extra content shown only while it's selected.

- Keep it to four to six tiles. For longer lists, use a Select or Radio-style list.
- The whole tile is the target; the corner indicator shows radio (round) or checkbox (square) behaviour.
- If a tile is disabled, say why (the `tooltip` text, or a hint nearby).
- Selected tiles change border, background, text colour and indicator, so the state never rests on colour alone.
- Radio groups move with arrow keys; checkbox tiles toggle with Space.
