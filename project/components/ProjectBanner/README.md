# ProjectBanner

A full-width strip under the page header about the state of the whole project, with the one action that resolves it.

**You provide:** the message as `label` (or `children`) and a `callToAction` object with a `label` and an `href` (a link) or `onClick` (a button styled as a link). Optional: `variant` (`gray` | `success` | `warning` | `error`) and `icon` to replace the variant's icon (`null` hides it).

- Use it for conditions that affect everything on the page: a paused project, a failed payment, a quota that's nearly spent. For a message about one section, use Note; for an announcement, use Banner.
- Show one at a time, at the top of the content. It isn't dismissible: it goes away when the condition is fixed.
- Always give a call to action, a Title Case verb and noun such as “Update Billing”.
- Success is blue. The icon and the landmark name (“Warning”, “Error”) carry the state, so it is never colour alone.
- Below about 560px of available width, the action wraps under the message and lines up with its text.
