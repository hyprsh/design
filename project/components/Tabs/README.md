# Tabs

Switches between views of the same object. Follows the WAI-ARIA tabs pattern: arrow keys move between tabs, and Home/End jump to the ends.

**You provide:** `tabs` (`[{ value, title, icon?, disabled?, tooltip?, content? }]`) and `aria-label`. Use `selected` with `setSelected` or `onChange` (controlled), or `defaultSelected`. Optional: `variant` (`primary` underlined tabs, or `secondary` compact pills) and `disabled` to disable every tab. When a tab has `content`, Tabs renders the panel; otherwise render it yourself from `selected`.

- Keep the selected tab in the URL (`?tab=logs`) so the view can be linked and restored.
- 2–7 tabs, with one or two words each in Title Case. Never nest tabs.
- Use `primary` for the sections of a page and `secondary` to switch a view inside a card, chart or toolbar. Use a Switch for settings that change data rather than the view.
- Give a disabled tab a `tooltip` that says why (“Available on Pro”), or leave the tab out.
- Use `disabled` for the whole set only while the content is loading or can't change.
- Under touch sizing `secondary` tabs are drawn 44px tall; `primary` tabs are already 48px.
