# MultiSelect

A compact filter button that opens a checklist; each row also offers a one-click “Only” to narrow to that item, or “Select All” to undo it.

**You provide:** either the shortcut, `items` (strings or `{ value, label }`) with `label` (a plural noun such as “Environments”) and `value` + `onChange(values)` or `defaultValue` (everything is selected by default); or the parts, `MultiSelectRoot` > `MultiSelectTrigger` (button text) + `MultiSelectContent` > `MultiSelectRow` with `name`, `checked`, `onChange(checked)`, `onSelectOnly`, `onSelectAll`, `selectedCount` and `totalCount` (also `MultiSelect.Root`, `.Trigger`, `.Content`, `.Row`). Optional: `align="end"`, `open`/`defaultOpen`/`onOpenChange`, `size`, `disabled`.

- Use it to filter a view (environments, regions, log levels); for picking values in a form, use Checkboxes or a Choicebox.
- For a filter that starts empty and adds values (include, exclude, search, sections), use FilterMenu: MultiSelect starts with everything selected and narrows down.
- Let the trigger name the selection: “All Environments”, the single item when one is picked, or the label with a count.
- Each checkbox is named after its item, and each action button reads as “Preview. Only”.
- Arrow keys move between rows and between the checkbox and its action; Escape closes and returns focus to the trigger.
- The panel floats above the page, flips above the trigger when there's no room below and stays on screen on phones, where rows are 44px tall under touch sizing and the Only / Select All action is always shown.
