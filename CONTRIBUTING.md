# Adding or changing a component

hyprsh ports Geist (vercel.com/geist). Vercel doesn't publish Geist's component source, so every component here is rebuilt from its public doc page. Match what the page shows: its examples, variants, sizes, states, best-practice notes and the prop names in its "Show code" samples. Never copy Vercel's implementation code, CSS or icons. The usage samples are fine to mirror as an API.

## Files

For a component named `Name` (PascalCase of the Geist page: `/geist/split-button` → `SplitButton`):

| File | What |
|---|---|
| `project/components/src/Name.js` | The implementation. Plain ES5-style JS with `h()`: no JSX, imports, `class` or arrow functions needed. The file ends with `define('Name', Name);` |
| `project/components/src/Name.css` | Its styles, opening with `/* ---------- Name ---------- */` |
| `project/components/src/Name.d.ts` | `export interface NameProps { … }` plus `export declare const Name: …` (or `function`) |
| `project/components/Name/README.md` | Usage guidelines (format below) |
| `project/components/Name/preview.html` | The live card (format below) |

`node scripts/build.mjs` builds `bundle.js`, `bundle.css` and `index.d.ts` from `src/` and checks every component. Never edit those three outputs by hand.

## The JS scope

The build wraps each `src/Name.js` in its own function inside one IIFE, so local names never collide between files. Everything in `src/core.js` and the `src/_*.js` files (`_icons.js`, `_query.js`) is in scope:

- `React`, `ReactDOM`, `h` (createElement), `useState`, `useEffect`, `useRef`, `useId`, `useMemo`, `useLayoutEffect`
- `cx(...classes)` and `omit(obj, keys)`
- `Glyph({ name, size })`, a tiny internal set of strokes (check, minus, chevron, x, copy, search, info, warning, error, success, arrow, enter). For anything else use `h(HY.Icon, { name: 'lucide-name' })`.
- `useControllable(value, defaultValue, onChange)` → `[value, set]`
- `useDismiss(open, [ref, …], onDismiss)` closes on outside pointer-down or Escape
- `useOverlayFocus(open, ref, initialRef)`, `trapTab(e, root)`, `useScrollLock(open)` and `portal(node)` for dialogs and popovers
- `useFloating(open, anchorRef, floatRef, { side, align, offset })` → `{ top, left, side, arrowX, arrowY }` or null, and `floatingStyle(pos, extra)`, for anything that floats next to a trigger (tooltips, hover cards, menus, listboxes). Render the box with `portal()` only while open. It flips and stays 8px inside the screen, so popovers work on phones.
- `copyText(text)` → Promise
- `fieldIds(id)` and `FieldMessage({ ids, error, hint })` for form fields. The field styles `.hy-field*`, `.hy-input*` and `.hy-select*` are in core.css: reuse them for anything input-like.
- `HY` is the registry. Use another component at render time with `h(HY.Button, …)`, never by a bare name.
- `ICONS` holds the Lucide markup that `HY.Icon` renders.
- The query syntax from `_query.js`: `parseQuery`, `suggestQuery`, `termText`, `withValue`, `withoutValue`, `withoutTerm` and `valuesOf` (also on `HY` and exported by the package), plus the filter-menu mapping `queryMenu`, `withQueryMenu`, `querySingle` and `withQuerySingle` that QueryBar uses. Its tests run the file in `node:vm` (`npm test`).

Don't edit `core.js`, `core.css`, `tokens.json` or another component's files. If you need a shared helper, write it inside your own file. If a token is missing, use the closest existing one and say so in your report.

## Conventions

- **API:** mirror Geist's prop names and values from the page's code samples, including compound parts. For `<Switch><SwitchControl/></Switch>`, export `Switch` and attach the part as `Switch.Control`. Also define it as its own component when the samples import it separately (`define('SwitchControl', SwitchControl)`). Support controlled and uncontrolled use (`value`/`defaultValue`, `checked`/`defaultChecked`, `onChange`).
- **Renamed or aligned props:** when you change an existing component's API to match Geist, keep the old prop names working as aliases. Other cards use them.
- **Class names:** prefix with `hy-` and use BEM-ish names (`hy-split-btn__menu`, `--small`, `is-open`).
- **Values:** use tokens only: `var(--gray-…)`, `var(--accent-…)` for anything that shows the accent (never `--pink-…` directly), `var(--space-…)`, `var(--radius-…)`, `var(--shadow-…)`, `var(--font-sans|mono)`, `var(--z-…)`, `var(--touch-target)` for touch sizing and `var(--focus-color)`. Fixed sizes such as control heights (32/40/48) and font sizes (12/13/14/16) are fine as px, because they come from Geist's type and control scale. Never hard-code hex colours.
- **Both themes:** every colour must come from a token so dark mode works on its own. Check that dark mode is legible.
- **Accessibility** (from `project/guidelines.md`):
  - native elements first
  - full keyboard support following the WAI-ARIA pattern
  - a visible focus ring: `outline: 2px solid var(--focus-color); outline-offset: 2px` on `:focus-visible`
  - hit targets of 24px or more
  - labels on every control
  - `aria-live` for async status
  - no state shown by colour alone
  - `prefers-reduced-motion` respected
  - move things only with transform and opacity (short colour and box-shadow transitions on hover are fine), and never `transition: all`
- **Copy:** Title Case for labels, buttons and menu items. Use `…` (never `...`), curly quotes and no emoji. Demo content is neutral developer-tool content (projects, deployments, domains, branches). Never use Vercel's name, logo or brand assets. Avatars show initials or generic shapes, never photos of real people.
- **Media:** no network fetches or external images. Draw placeholder media with CSS or inline SVG.

## preview.html

```html
<!-- @dsCard group="Forms" height=200 subtitle="Short list of what the card shows" -->
<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Name</title></head>
<body>
<div id="root" class="hy-col"></div>
<script>
var H = window.Hyprsh, h = React.createElement, F = React.Fragment;
function Demo() { return h(H.Name, { … }); }
ReactDOM.createRoot(document.getElementById('root')).render(h(Demo));
</script>
</body>
</html>
```

- Line 1 is the marker. `group` is one of: Actions, Forms, Navigation, Status, Feedback, Content, Data, Overlays, Layout, Media.
- `height` is the card height in px: fit the content without clipping or leaving a big empty band.
- Exactly one `<script>`, with no `<style>` blocks, `<link>` tags or external scripts. The frame already loads tokens.css, bundle.css, React 18 and bundle.js, and sets `data-theme` on `<html>`.
- Layout helpers: `.hy-row` (wrapping row with padding), `.hy-col` (column, max 420px; add `style="max-width:none"` for wide demos), and text-style classes such as `.label-13`, `.copy-14` and `.heading-20`.
- Show the variants the Geist page shows (sizes, states, types), compactly. Overlays should render open (`defaultOpen` or `inline`) so the card shows them.

## README.md

```markdown
# Name

One-sentence summary (this becomes the manifest summary).

**You provide:** the props, with defaults, in prose.

- When to use it, and what to use instead.
- Do's and don'ts, adapted from Geist's best-practice notes in our own words.
```

## Components without a Geist page

A hyprsh original (see GLOSSARY.md) has no Geist page to rebuild from, so the rest of this guide applies with these changes:

- Build it from hyprsh's tokens, control scale and `project/guidelines.md`.
- Take its behaviour from the platform pattern its issue names (TabBar: the iOS 26 tab bar). Never copy Apple's assets or the Liquid Glass material.
- The originating GitHub issue is the spec: check the component against its acceptance criteria instead of a Geist page.
- Mark it as a "hyprsh original" in its README and in the doc comment of its `.d.ts`.
- Files, `h()` style, the preview card and tokens-only styling are the same as for any other component.

## Checking your work

```bash
node scripts/build.mjs                 # build + contract checks
node scripts/dev.mjs                   # http://127.0.0.1:4400 (?only=Name,Other)
node scripts/shot.mjs Name Other       # headless Chrome: mount check + .cache/shots/Name-{light,dark}.png
node scripts/mobile.mjs Name Other     # phone: 375px with touch, reports overflow and small targets, .cache/mobile/Name.png
node scripts/touch.mjs                 # touch sizing: drawn sizes and hit areas at desktop, phone width and coarse pointer
```

Look at both screenshots and the phone one. On a phone nothing may be wider than the screen, hover-only behaviour needs a tap equivalent, and controls are at least 44px tall under touch sizing (`@media (pointer: coarse), (max-width: 639px)`, sized with `var(--touch-target)`). Then compare with the Geist page: either open it in a browser or read its text and code samples.
