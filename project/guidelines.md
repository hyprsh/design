# Interface guidelines

These are the rules every hyprsh interface follows. They are adapted from Vercel's Web Interface Guidelines. **Must** is required, **should** is the default unless you have a reason, and **never** is a defect. When you review UI, check it against this list and report findings as `file:line — issue`.

## Keyboard and focus

- **Must:** everything works from the keyboard, following the WAI-ARIA Authoring Practices pattern for that widget (tabs, menu, dialog, combobox, switch).
- **Must:** focus is visible. Use the `focus-color` outline on `:focus-visible`, and `:focus-within` for compound controls. Never `outline: none` without a replacement.
- **Must:** dialogs and menus trap focus while open and return it to the trigger when they close. Escape closes them.
- **Must:** sticky and fixed elements never cover the focused element. Give heading anchors `scroll-margin-top`.
- **Must:** add a “Skip to Content” link and use heading levels in order (`h1`–`h6`).

## Targets and input

- **Must:** hit targets are at least 24px, and at least 44px under touch sizing (see below). If the visual is smaller, expand the hit area.
- **Must:** a checkbox or radio and its label form one hit target, with no dead zones.
- **Must:** inputs are 16px or larger on touch devices. Never disable zoom (`user-scalable=no`, `maximum-scale=1`).
- **Must:** set `touch-action: manipulation`. Set `-webkit-tap-highlight-color` on purpose.
- **Must:** drag, swipe and pinch gestures have a click and keyboard alternative. While dragging, disable text selection and make the dragged element `inert`.
- **Should:** autofocus only on desktop, and only when there is one primary input.

## Touch sizing

Touch sizing applies under `@media (pointer: coarse), (max-width: 639px)`: a coarse pointer or phone width, so a narrow window with a mouse gets what a phone gets. Its touch target is 44px, the `--touch-target` token.

- **Must:** write the touch target as `var(--touch-target)`, never as `44px`. Media queries can't read custom properties, so the query writes `max-width: 639px` itself.
- **Must:** keep rules that aren't about size (16px field text so iOS doesn't zoom, hover on tap, popovers staying 8px inside the screen) under `(pointer: coarse)` alone.
- **Must:** these are drawn at the touch target: Button (small and default; icon-only Buttons are 44px wide too), Input, Select, Menu items and Menu's unstyled trigger, Checkbox, Radio and Toggle rows, Switch (every size), secondary Tabs, Combobox, MultiSelect, SearchInput, AddressInput, CommandMenuTrigger, ContextMenu and FilterParams.
- **Must:** these keep their drawn size and grow only their hit area to the touch target: tiny Button, interactive Pills (links and buttons, every size), the Progress stop trigger, CommandMenu's Esc key, Combobox's clear and chevron buttons, and FilterParams' remove button and Back chip.
- Large Buttons (48px), primary Tabs (48px) and CommandMenu items (44px) are already at or above the touch target and don't change. Calendar and the Video seek bar still have their own 40px rules under `(pointer: coarse)`.

## Forms

- **Must:** every control has a `<label>` or an `aria-label`, and clicking a label focuses or toggles its control.
- **Must:** set `autocomplete`, a meaningful `name`, the right `type` and `inputmode`. Turn off spellcheck on emails, codes and usernames. Use `autocomplete="off"` on fields that aren't for sign-in, so password managers stay quiet.
- **Never:** block paste. Accept free text and validate afterwards. Trim values.
- **Must:** submit stays enabled until the request starts, then shows a spinner and keeps its label. Enter submits a single input, and ⌘/Ctrl + Enter submits a textarea.
- **Must:** errors appear inline next to their field. On submit, focus the first error. Error text says how to fix it.
- **Should:** placeholders show an example and end with `…`, for example `hyprsh.dev…`.
- **Must:** warn before leaving a page with unsaved changes.

## Feedback and state

- **Must:** toasts and inline validation are announced through a polite `aria-live` region.
- **Must:** destructive actions ask for confirmation or offer an Undo window. Never act on them immediately.
- **Should:** use optimistic UI, then reconcile with the response. If it fails, roll back or offer Undo.
- **Must:** the URL holds the state: filters, tabs, pagination and expanded panels can be linked, and Back/Forward restores the scroll position.
- **Must:** navigation uses `<a>` so that Cmd/Ctrl-click and middle-click work. Never use `<div onClick>` for navigation or actions.
- **Must:** if something looks clickable, it is clickable. Interactive states raise contrast: hover, active and focus are each more prominent than rest.
- **Must:** tooltips wait before the first one shows, and their neighbours then show instantly. Prefer inline help, and use tooltips last.

## Animation

- **Must:** honour `prefers-reduced-motion`. Animate only `transform` and `opacity`, never layout properties.
- **Never:** `transition: all`.
- **Must:** animations can be interrupted and respond to input mid-way. Set `transform-origin` correctly. Put SVG transforms on a `<g>` with `transform-box: fill-box`.
- **Must:** autoplaying motion longer than 5s has a pause control. Muted decorative loops stop under reduced motion.

## Content

- **Must:** design the empty, sparse, dense and error states. There are no dead ends: always offer the next step.
- **Must:** skeletons match the shape of the final content, so nothing shifts.
- **Must:** text containers handle long content (truncate, `line-clamp`, `overflow-wrap: anywhere`), and flex children have `min-width: 0`.
- **Must:** status has redundant cues and never relies on colour alone. Icon-only buttons have an `aria-label`, and decorative icons are `aria-hidden`.
- **Must:** prefer native elements (`button`, `a`, `label`, `table`) to ARIA.
- **Must:** dates, times and numbers are locale-aware. `<title>` matches the current context.
- **Must:** use `…`, curly quotes, non-breaking spaces in `10&nbsp;MB` and `⌘&nbsp;K`, and `tabular-nums` for compared numbers.

## Performance

- **Must:** virtualise lists of more than 50 items, or use `content-visibility: auto`.
- **Must:** never read layout during render. Batch DOM reads and writes.
- **Must:** mutations respond in under 500ms. Profile with CPU and network throttling, and test on Safari and in iOS Low Power Mode.
- **Must:** images have explicit dimensions. Preload above-the-fold images and lazy-load the rest. Prefer a muted looping `<video>` to a GIF.
- **Should:** preconnect to asset domains, and preload the Geist fonts with `font-display: swap`.

## Theming

- **Must:** set `color-scheme: dark` on `<html>` in dark mode, and set `<meta name="theme-color">` to `background-100`.
- **Must:** a native `<select>` sets its `background-color` and `color` explicitly.
- **Should:** use layered shadows (the `shadow-*` tokens), crisp edges from translucent borders, and concentric radii.

## Anti-patterns to flag

- `user-scalable=no` or `maximum-scale=1`
- `onPaste` with `preventDefault`
- `transition: all`
- `outline: none` without a focus replacement
- A clickable `<div>` or `<span>`
- Images without dimensions
- An unvirtualised `.map()` over a large list
- Inputs without labels, or icon buttons without an `aria-label`
- Hard-coded date or number formats
- Unjustified `autoFocus`
- Gesture-only actions
- `...` instead of `…`

## Licence

These rules are adapted from [Vercel's Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines), used under the MIT licence:

```
MIT License

Copyright (c) 2025 Vercel Labs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
