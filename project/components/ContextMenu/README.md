# ContextMenu

A menu that opens where the user right-clicks or long-presses an area, with actions for what is under the pointer.

**You provide:** a `ContextMenu` holding a `ContextMenuTrigger` (the area, any content) and a `ContextMenuContent` (`width`, `aria-label`) filled with `ContextMenuItem`s (`onClick`, `onSelect` + `value`, `href`, `disabled`, `type="error"`, `prefix`, `suffix`, `shortcut`). `MenuSection` and `MenuDivider` work inside it too. Optional: `disabled` on the trigger, `onOpenChange`, `defaultOpen` for docs.

- A context menu is a shortcut, never the only way in. Every action in it must also be reachable from a visible control, such as a DotsMenu on the same row.
- It opens at the pointer on right-click and after a half-second press on touch screens (moving the finger more than 10px cancels it, and the trigger suppresses the browser's own callout and text selection). The menu stays 8px inside the screen, and its items grow to 44px under touch sizing. From the keyboard, focus the trigger and press Shift+F10 or the Menu key; the first item takes focus.
- Keep the items about what was clicked: “Open in New Tab”, “Copy Link”, “Rename File…”. Don't repeat the page's global actions.
- It closes on choosing an item, Escape, a click elsewhere or scrolling, and focus returns to the trigger.
- Items follow Menu's rules: Title Case Verb + Noun, destructive items last after a divider with `type="error"`.
