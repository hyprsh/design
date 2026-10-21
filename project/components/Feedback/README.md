# Feedback

A “Was this helpful?” widget that collects a reaction and a short note, either from a trigger button's popover or inline as an expanding pill.

**You provide:** `onSubmit`, which receives `{ emotion, text, topic, metadata }` and may return a Promise (the component never makes a network request), plus optional `type` (`'popover'` or `'inline'`), `label`, `copy`, `metadata`, `showTopics` with `topics`, `prefix`/`suffix` icons, `defaultOpen` and `dryRun`.

- Put it at the end of a flow or page, not in the way of the main task, and keep it collapsed until someone opens it.
- Write `label` in Title Case without a question mark (Feedback, Docs Feedback). Write `copy` in sentence case (Was this helpful?).
- The four reactions are native radios: arrow keys move between them, and each has a spoken name (Hate It, Not Great, It’s Okay, Love It).
- ⌘ or Ctrl + Enter sends from the text box. Escape and clicking outside close the popover and return focus to the trigger.
- `metadata` travels with every submission. Keep it to context like the page path or release, never personal data.
