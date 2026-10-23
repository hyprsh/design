# hyprsh design system

hyprsh’s design system: a colour scale, the Geist Sans and Geist Mono fonts, type and control scales, materials, interface guidelines and a catalogue of React components.

It is published as a Design System artifact. The `project/` folder is exactly what gets published.

## Layout

```
project/
  README.md            brand book: colour, type, layout, materials, motion, iconography, copy
  guidelines.md        interface rules (accessibility, forms, motion, performance…)
  tokens.json          colour (light + dark), shadows, spacing, radius, z-index, type styles, fonts
  design-system.json   manifest
  fonts/               Geist + Geist Mono variable woff2 (SIL OFL 1.1)
  brand/               logo SVGs: the delta starship mark (nebula and mono) and the lockup
  components/
    src/               component sources (one .js/.css/.d.ts per component, plus core and icons)
    <Name>/            README.md (usage) + preview.html (the live card)
    Cover/             the artifact's cover card
    bundle.js          built: window.Hyprsh, one classic script
    bundle.css         built
    index.d.ts         built: <Name>Props for every component
scripts/
  build.mjs            builds the bundle and checks every component against the artifact contract
  package.mjs          builds the npm package into dist/ (ES module, types, styles, tokens, Tailwind entry, fonts, logo)
  dev.mjs              local card viewer, light and dark side by side
  shot.mjs             headless Chrome mount check + screenshots into .cache/shots
  icons.mjs            vendors Lucide into src/_icons.js
  tokens-css.mjs       compiles tokens.json to CSS the way the artifact does
```

## Commands

Node 20 or newer. There are no dependencies to install.

```bash
npm run build
```

This builds the artifact bundle and the package in `dist/`.

```bash
npm run dev
```

The viewer runs at http://127.0.0.1:4400. Add `?only=Button,Toggle` to show just those cards.

```bash
npm run shots -- Button Toggle
```

```bash
node scripts/mobile.mjs Button Toggle
```

The phone check renders cards at 375px with touch, flags anything wider than the screen and tap targets under 24px, and saves screenshots to `.cache/mobile`.

```bash
node scripts/touch.mjs
```

The touch sizing check measures the controls touch sizing covers at 1280px with a mouse, at 375px with a mouse and with a coarse pointer, and fails when a drawn size or hit area is off (see Touch sizing in `project/guidelines.md`).

Screenshots need Google Chrome installed in `/Applications`.

## Using it in a React app

Install it from this repo. Installing runs `prepare`, which builds `dist/`. The repo is private, so the machine (or CI) needs GitHub access to hyprsh/design.

```bash
npm install github:hyprsh/design#v0.9.0
```

```tsx
import '@hyprsh/design/tokens.css';
import '@hyprsh/design/styles.css';
import { Button, Input, Logo } from '@hyprsh/design';
```

With Tailwind v4, import the Tailwind entry instead of those two CSS files. It replaces the glue an app would write by hand:

```css
@import "tailwindcss";
@import "@hyprsh/design/tailwind.css";
```

- It carries the tokens and `@font-face` rules (unlayered, so custom properties work as usual) and an `@theme inline` block that names the design's values for Tailwind: `bg-background-100`, `text-gray-900`, `border-gray-alpha-400`, `text-blue-700`… for gray, gray-alpha, blue, green, amber, red, purple, pink, teal and accent (100 to 1000), plus `font-sans` and `font-mono`. These replace Tailwind's own `gray-*`, `blue-*` and the like; its other palette names stay.
- Radii: `rounded-sm` to `rounded-2xl` are mapped to the design's `--radius-*`. Their values equal Tailwind's defaults, so nothing changes visibly, but they now follow the tokens. `rounded-full` and Tailwind's `xs`, `3xl` and `4xl` are left alone.
- Shadows: the design's names (`shadow-border`, `shadow-border-inset`, `shadow-small`, `shadow-medium`, `shadow-large`, `shadow-tooltip`, `shadow-menu`, `shadow-modal`, `shadow-fullscreen`, `shadow-focus-ring`) become `shadow-*` utilities. None clashes with Tailwind's `shadow-sm`/`md`/`lg`, which keep their meaning. Spacing and z-index are not mapped: Tailwind's spacing is a multiplier of one step, not a list of names.
- `dark:` follows `.dark` or `data-theme="dark"` on any ancestor.
- The type styles are utilities, so they take variants: `label-14`, `md:heading-24`, `copy-13-mono`. The label and copy styles also come as `-strong` (`label-14-strong`), and `<strong>` or `<b>` inside them is weight 500.
- The component CSS sits in Tailwind's `components` layer (inside the `hyprsh` layer), so utilities on a component's element win without `!important`: `<Table className="max-w-none">`. The document rules (colour scheme, `body`, `::selection`) are in the `base` layer.

Without Tailwind, `styles.css` is wrapped in `@layer hyprsh`. Your own unlayered CSS beats it whatever the specificity, and layered rules still beat browser defaults. To order it against other layers, declare the order first: `@layer base, hyprsh, app;`.

- React and ReactDOM 18 or newer are peer dependencies.
- Dark mode follows `data-theme="dark"` or a `.dark` class on any ancestor, so it works with Tailwind's class-based dark variant.
- `tokens.css` brings the colour, space, radius and shadow variables, the type classes (`.heading-24`, `.copy-14`…) and the Geist fonts through `@font-face`.
- Icons: the main entry carries only the Lucide icons the components use. In an app, pass an icon component, such as `<Icon icon={GitBranch} />` with `GitBranch` from `lucide-react`, or use `lucide-react` directly. `import '@hyprsh/design/icons'` registers the full set for `<Icon name="…">`, at about 450 KB.
- The logo SVGs are at `@hyprsh/design/brand/logo-mark.svg`, `logo-mark-mono.svg` and `logo-lockup.svg`.

To release a version, bump `version` in `package.json`, then tag it (`git tag v0.10.0 && git push --tags`) and point apps at the new tag.

## Using the bundle in plain HTML

The bundle needs React 18 and the compiled tokens on the page:

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="components/bundle.css">
<script src="https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script src="components/bundle.js"></script>
<script>
  const { Button, Toggle } = window.Hyprsh;
</script>
```

Set `data-theme="light"` or `data-theme="dark"` on `<html>`. Without it, the light theme applies.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the component conventions, the preview and README formats, and how to check your work.

## Licence

MIT, see [LICENSE](LICENSE). It also credits the parts by others (fonts, icons, the interface guidelines), which keep their own licences.
