# Fieldset

A settings card: a title, a subtitle and controls on top, and a gray footer with a status line and actions.

**You provide:** a `Fieldset` holding a `FieldsetContent` (with a `FieldsetTitle`, a `FieldsetSubtitle` and the controls) and a `FieldsetFooter` (with a `FieldsetFooterStatus` and `FieldsetFooterActions` holding one or two `FieldsetFooterAction` buttons). Optional: `type="error"` or `"warning"` on the Fieldset (red or amber border and footer, plus an icon in the status), `disabled` on the content (disables every control inside, natively), `highlight` on the footer, and `as` on the title to set the heading level. The parts also hang off the root: `Fieldset.Content`, `Fieldset.Title`, `Fieldset.Footer.Status` and so on.

- Use one Fieldset per setting, or per small group of settings that save together.
- The title names the setting in Title Case; the subtitle is one or two sentences on what it does.
- Put help links and the current state in the footer status, and the Save button on the right. Disable Save until something changed.
- `type="error"` is for a setting that is broken now (a failed domain check), not for a validation message on one field: put that on the field.
- A disabled Fieldset says why in the footer status ("Only team owners can change this.").
- The content is a native `<fieldset>` named by its title, so screen readers announce the setting with each control.
