# Getting started

The tokens, fonts, brand assets and React components that every hyprsh product is built from: neutral surfaces, near-black type and one blue accent.

## Setup

### Install the package

Install it from this repo, pinned to a version tag. Installing runs `prepare`, which builds `dist/`. React and ReactDOM 18 or newer are peer dependencies.

```bash
npm install github:hyprsh/design#v0.15.0
```

### Import the styles

Import the tokens, then the component styles, once at the app’s root. With Tailwind v4, import the Tailwind entry instead (see below).

```tsx
import '@hyprsh/design/tokens.css';
import '@hyprsh/design/styles.css';
```

`styles.css` is wrapped in `@layer hyprsh`, so your own unlayered CSS beats it whatever the specificity, while layered rules still beat browser defaults. To order it against other layers, declare the order first: `@layer base, hyprsh, app;`.

### Use a component

```tsx
import { Button } from '@hyprsh/design';

<Button variant="default">Deploy Project</Button>
```

Use an existing component, and its props, before writing your own. Anything new you build follows the Interface guidelines, as every component does.

## Tokens and themes

- Every token is a CSS custom property, such as `var(--gray-1000)`, `var(--space-6)` or `var(--shadow-menu)`, and every text style is a class, such as `.heading-24`, `.copy-14` or `.label-13-mono`. Use them by name and never copy a value. `tokens.css` carries them all, plus the Geist fonts through `@font-face`.
- Set the theme with `data-theme="light"` or `data-theme="dark"` (or a `.dark` class) on an ancestor, usually `<html>`. Light is the fallback.
- Set `color-scheme` to match the theme, and set `<meta name="theme-color">` to `background-100`.

## Tailwind v4

Import the Tailwind entry instead of `tokens.css` and `styles.css`:

```css
@import "tailwindcss";
@import "@hyprsh/design/tailwind.css";
```

- It carries the tokens and fonts (unlayered, so custom properties work as usual) and names the design’s values for Tailwind: `bg-background-100`, `text-gray-900`, `border-gray-alpha-400`… for gray, gray-alpha, blue, green, amber, red, purple, pink, teal and accent (100 to 1000), plus `font-sans` and `font-mono`. These replace Tailwind’s own `gray-*`, `blue-*` and the like; its other colours stay.
- `rounded-sm` to `rounded-2xl` follow the `--radius-*` tokens, with the same values as Tailwind’s. The design’s shadows become utilities (`shadow-border`, `shadow-menu`, `shadow-modal`…), and Tailwind’s `shadow-sm`, `md` and `lg` keep their meaning. Spacing and z-index are not mapped.
- The type styles are utilities, so they take variants: `label-14`, `md:heading-24`, `label-14-strong`.
- `dark:` follows `.dark` or `data-theme="dark"` on any ancestor.
- The component CSS sits in Tailwind’s `components` layer, so a utility on a component wins without `!important`: `<Table className="max-w-none">`.

## Icons and the logo

- The main entry carries only the Lucide icons the components use. Pass an icon component, such as `<Icon icon={GitBranch} />` with `GitBranch` from `lucide-react`, or use `lucide-react` directly. `import '@hyprsh/design/icons'` registers the full set for `<Icon name="…">`, at about 450 KB.
- The logo is `<Logo />`. Its SVG files are `@hyprsh/design/brand/logo-mark.svg`, `logo-mark-mono.svg` and `logo-lockup.svg`.

## Plain HTML

Outside a React build, the components come as one script, `components/bundle.js`, which sets `window.Hyprsh`. It needs React 18 on the page, the compiled tokens, and `components/bundle.css` after them:

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

## Coding agents

The package ships `AGENTS.md` at its root, with the setup, the hard rules and an index of every component, and one markdown file per component in `docs/components/`. They match the installed version, so an agent reads the rules for the version the app uses. Add this line to the app’s own `CLAUDE.md` or `AGENTS.md`:

```
UI comes from @hyprsh/design. Read node_modules/@hyprsh/design/AGENTS.md before writing UI.
```

The docs site also serves `llms.txt`, `llms-full.txt`, a `.md` version of every page and `components.json`.
