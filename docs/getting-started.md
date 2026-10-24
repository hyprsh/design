# Getting started

@hyprsh/design is hyprsh’s design tokens, brand assets and React components for hyprsh products.

## Using it in a React app

Install it from this repo. Installing runs `prepare`, which builds `dist/`.

```bash
npm install github:hyprsh/design#v0.12.0
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

## Coding agents

The package ships `AGENTS.md` at its root. It covers setup, the hard rules and an index of every component. It also ships one markdown file per component in `docs/components/`. They match the installed version, so an agent reads the rules for the version the app uses.

Add this line to the app’s own `CLAUDE.md` or `AGENTS.md`:

```
UI comes from @hyprsh/design. Read node_modules/@hyprsh/design/AGENTS.md before writing UI.
```

The docs site also serves `llms.txt`, `llms-full.txt`, a `.md` version of every component page and `components.json`.
