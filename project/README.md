hyprsh is built on neutral surfaces, near-black type, one blue accent and a strict scale for everything else. The interface stays out of the way so that content, status and code come first. If you’re not sure, use less colour, less weight and less decoration.

## Content fundamentals

hyprsh copy sounds like a precise engineer talking to another engineer: short, concrete and sure of itself, and never cute.

- **Second person, active voice.** “Install the CLI”, not “The CLI will be installed”. Never “we” or “I” in the UI.
- **Title Case for headings, buttons, tabs and menu items** (Chicago style): “Add Domain”, “Environment Variables”. Body copy and notes use sentence case.
- **Specific labels.** A button names its result: “Save API Key” or “Redeploy”, never “Continue” or “OK”. An option that opens a follow-up step ends with an ellipsis: “Rename…”.
- **Numerals for counts:** “8 deployments”, “3 domains”. Format numbers, dates and durations with `Intl.NumberFormat` and `Intl.DateTimeFormat`, never with hand-built strings.
- **Errors give the fix:** “Domain is already in use. Remove it from the other project or use a subdomain.”, never just “Invalid domain”.
- **Loading states end in an ellipsis:** “Deploying…”, “Saving…”. Type the single character `…`, never three dots.
- **Typography.** Curly quotes (“ ”), not straight ones. A non-breaking space between a number and its unit and inside shortcuts: `10&nbsp;MB`, `⌘&nbsp;K`. `&` instead of “and” only where space is tight.
- **No emoji, no exclamation marks, no superlatives.**
- **Names stay as they are.** Set brand names, commands and identifiers in code style or with `translate="no"`, so auto-translation doesn’t garble them.
- **hyprsh is always lowercase**, also at the start of a sentence.

## Visual foundations

The rules behind every surface: colour, type, space, materials, states, motion, layering and imagery.

### Colour

- **Two backgrounds.** `background-100` is the page and every surface on it: cards, inputs, menus and modals. `background-200` sets one region apart: app chrome, sidebars and modal footers. Never stack three greys.
- **Ten steps per scale, each with a job.** In every scale, steps 100–300 are component backgrounds (default, hover, active), 400–600 are borders (default, hover, active), 700–800 are solid fills (default, hover), 900 is secondary text and 1000 is primary text. Pick the step by its job, not by how it looks.
- **Text:** `gray-1000` for primary text and `gray-900` for secondary text, on either background or on `gray-100`–`300`. `gray-700` only for placeholders and disabled labels.
- **Borders are 1px box-shadows in `gray-alpha-400`**, so they sit on any surface. Hover is `gray-alpha-500`. The alpha border is under 3:1, so a field always has a visible label as well.
- **One accent: blue.** The logo, links (`link`), selection, the “on” state of toggles and sliders, checked choiceboxes and highlighted code lines use the accent. Reach it through `accent-100`…`accent-1000`, which alias the `blue` scale, never through `blue-*` directly. Everything else stays grey.
- **The accent is not a status.** Red is the only error and destructive hue. Don’t put the accent next to a red state.
- **Hues are semantic.** `red` means errors and destructive actions, `amber` warnings and in-progress states, `green` success and ready, `purple` new or preview. `blue` is the accent and informational, `teal` is for data series. Never use a hue for decoration.
- **Tinted surfaces** pair 100/200 with 900 text in the same hue, for example `accent-900` on `accent-100`. **Solid fills** pair a fill with a fixed text colour: `white` on `blue-800`, `red-800`, `purple-700`, `pink-800` or `accent-800`; `black` on `amber-700`, `green-700` or `teal-700`; `background-100` on `gray-900` or `gray-1000`. All of these pairs hold 4.5:1 in both themes.
- **Never show status by colour alone.** A status dot carries a label, a note carries an icon and a word, and a badge carries text.

### Type

- **Geist** for everything and **Geist Mono** for code, IDs, hashes, versions and durations. Both are variable fonts that ship as files in `fonts/`.
- Use the named styles, never ad-hoc sizes:
  - **Headings** (`heading-72` … `heading-14`) are semibold 600, with tracking that tightens as the size grows.
  - **Labels** (`label-20` … `label-12`) are for single lines.
  - **Copy** (`copy-24` … `copy-13`) is for paragraphs.
  - **Buttons** (`button-16`/`14`/`12`) are only for buttons.
- **Strong type.** Labels and copy are weight 400. For emphasis inside one, wrap the words in `<strong>` (or `<b>`): in a `label-*` or `copy-*` class it renders at 500, so a row title in `label-14` is `<span class="label-14"><strong>Some Show</strong> · S02E05</span>`. To make a whole line strong, use the `-strong` variant: `label-14-strong`, `copy-14-strong`, `label-13-mono-strong`. Never 600 or bold for body text; 600 is for headings.
- The product defaults are `label-14` for UI text, `copy-14` for descriptions, `heading-24`/`20` for section and card titles and `heading-32` for page titles. Marketing pages use 40 and above.
- `font-variant-numeric: tabular-nums` wherever numbers are compared: tables, counters, prices and durations.
- `text-wrap: balance` on headings. Never set text below 12px. Inputs are 16px on touch devices, so iOS doesn’t zoom in.

### Space and layout

- The grid is 4px. Use `space-1` to `space-32`, never 5px or 10px. The default gap is `space-6` (24px), and `space-3` is a half gap.
- Product pages are at most 1400px wide, with a `space-6` margin (`space-4` on phones).
- Align to the grid, the baseline and the edges on purpose. Nudge by ±1px only where optical alignment beats geometric alignment.
- Lay out with flex and grid, not JS measurement. Flex children that truncate need `min-width: 0`. Every text container plans for very short, average and very long content.
- Respect `env(safe-area-inset-*)` in full-bleed layouts. Avoid unwanted scrollbars.

### Materials: radius and shadow

Every raised thing is a *material*: a `background-100` fill, one of the `shadow-*` tokens and the radius that goes with it.

| Material | Shadow | Radius | For |
|---|---|---|---|
| base | `shadow-border` | `radius-md` | Flat cards and panels |
| small | `shadow-small` | `radius-md` | Slightly raised cards |
| medium / large | `shadow-medium` / `shadow-large` | `radius-xl` | Raised cards |
| tooltip | `shadow-tooltip` | `radius-md` | Popovers |
| menu | `shadow-menu` | `radius-xl` | Menus, dropdowns, toasts |
| modal | `shadow-modal` | `radius-xl` | Modals, command menu |
| fullscreen | `shadow-fullscreen` | `radius-2xl` | Sheets |

Shadows are layered: a 1px translucent border, then an ambient layer, then a 1px ring that crisps the edge. Nested radii are concentric, and a child never rounds more than its parent. Pills (`radius-full`) are only for badges, pills, toggles, avatars and status dots.

### States and focus

- **Hover** raises contrast by one step: a background goes 100 → 200, a border goes `gray-alpha-400` → `500`, and a primary fill lightens slightly.
- **Pressed** goes one more step, to 300 or `gray-alpha-600`.
- **Disabled** controls get a `gray-100` fill, a `gray-700` label and `cursor: not-allowed`.
- **Touch:** under a coarse pointer or at phone width (`@media (pointer: coarse), (max-width: 639px)`) buttons and fields are at least 44px tall (48px for large buttons), menu rows are 44px, and tiny controls keep their drawn size with a 44px hit area. Under a coarse pointer only, text fields use 16px text so iOS doesn’t zoom, anything shown on hover also opens on tap, and every popover stays 8px inside the screen.
- **Focus** is a ring: `outline: 2px solid var(--focus-color); outline-offset: 0`, flush on the control’s edge so it covers the 1px border, shown on `:focus-visible` only. Group it with `:focus-within` on compound controls. Items in a list (menus, listboxes, the command menu) show focus with their highlight background instead. `focus-color` is `gray-800`, a neutral mid-grey in both themes rather than the accent: it holds at least 3.5:1 on both backgrounds and beside solid `gray-1000` buttons. Never remove an outline without replacing it, and never let a sticky header cover a focused element.
- **Selection** uses the `selection` token behind `gray-1000` text.

### Motion

- Motion only clarifies cause and effect. Durations are 150ms for hover and colour, 200ms for overlays entering and 150ms for overlays leaving. Use `cubic-bezier(.4, 0, .2, 1)` for UI and `cubic-bezier(.32, .72, 0, 1)` for sheets and drawers.
- Animate only `transform` and `opacity`. Never `transition: all`: list each property. Set `transform-origin` where the motion physically starts, so a menu grows from its trigger.
- Under `prefers-reduced-motion: reduce`, remove movement and keep the opacity fade. Decorative loops such as the skeleton shimmer stop.

### Layering

`z-drawer` 200 < `z-modal` 300 < `z-menu` 2001 < `z-toast` 5000 < `z-tooltip` 99999. Nothing else goes above 10.

### Imagery

- Product screenshots go inside a `shadow-border` frame with `radius-xl`.
- No stock photos, gradients as decoration or illustration mascots.
- Every `<img>` has explicit `width` and `height`. Images below the fold use `loading="lazy"`.

## Iconography

Every icon is a Lucide icon, drawn on a 16px grid with a constant 1.5px stroke.

- hyprsh uses **Lucide** (ISC licence), vendored at `components/src/_icons.js` with `LUCIDE-LICENSE.txt`.
- In an app, pass a Lucide component: `<Icon icon={GitBranch} />` with `GitBranch` from `lucide-react`. `<Icon name="git-branch" />` draws the icons the components use, and all of Lucide’s ~2,100 once `@hyprsh/design/icons` is imported, or in the plain-HTML bundle.
- Icons use `currentColor`, and the Icon component scales the stroke so it stays 1.5px at any size. Use 16px inline and 20–24px for empty states and banners.
- Decorative icons get `aria-hidden="true"`. Icon-only buttons get an `aria-label` (“Copy to Clipboard”, not “Copy”).
- Never use emoji as icons.

## Logo

The mark is a faceted delta starship: hyprsh is a jump to hyperspace. It is one filled path on a 24px grid, drawn in the same angular style as its sibling kestrel, with a canopy cut and a notched tail.

### Lockup

The mark, then “hyprsh” in Geist semibold 600, lowercase, `-0.04em` tracking, in `gray-1000`. The gap is 0.3× the mark’s height. Use `<Logo />`; `variant="mark"` or `"wordmark"` gives either part alone.

### Colour

The mark is solid `accent-700` blue in both themes. Use `tone="mono"` (`currentColor`) on photos, coloured fills, one-colour print and in dense UI.

### Clear space and size

Keep clear space of half the mark’s height on every side. 16px is the smallest size; at 20–24px the mark sits in the app bar.

### Misuse

Don’t stretch, rotate, outline, shadow or recolour the mark, and don’t set the wordmark in another typeface.

### Files

`brand/logo-mark.svg`, `brand/logo-mark-mono.svg` and `brand/logo-lockup.svg`.
