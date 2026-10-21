# hyprsh design system

hyprsh’s design system, closely based on Vercel’s [Geist](https://vercel.com/geist/introduction). It covers the Geist colour scale, the Geist Sans and Geist Mono fonts, the type and control scales, materials, and React rebuilds of the Geist component catalogue. The interface rules come from Vercel’s [web interface guidelines](https://github.com/vercel-labs/web-interface-guidelines).

hyprsh is not affiliated with or endorsed by Vercel. Geist is Vercel’s name for its design system and typeface.

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
  package.mjs          builds the npm package into dist/ (ES module, types, styles, tokens, fonts, logo)
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

Screenshots need Google Chrome installed in `/Applications`.

## Using it in a React app

Install it from this repo. Installing runs `prepare`, which builds `dist/`. The repo is private, so the machine (or CI) needs GitHub access to hyprsh/design.

```bash
npm install github:hyprsh/design#v0.3.0
```

```tsx
import '@hyprsh/design/tokens.css';
import '@hyprsh/design/styles.css';
import { Button, Input, Logo } from '@hyprsh/design';
```

- React and ReactDOM 18 or newer are peer dependencies.
- Dark mode follows `data-theme="dark"` or a `.dark` class on any ancestor, so it works with Tailwind's class-based dark variant.
- `tokens.css` brings the colour, space, radius and shadow variables, the type classes (`.heading-24`, `.copy-14`…) and Geist through `@font-face`.
- Icons: the main entry carries only the Lucide icons the components use. In an app, pass an icon component, such as `<Icon icon={GitBranch} />` with `GitBranch` from `lucide-react`, or use `lucide-react` directly. `import '@hyprsh/design/icons'` registers the full set for `<Icon name="…">`, at about 450 KB.
- The logo SVGs are at `@hyprsh/design/brand/logo-mark.svg`, `logo-mark-mono.svg` and `logo-lockup.svg`.

To release a version, bump `version` in `package.json`, then tag it (`git tag v0.4.0 && git push --tags`) and point apps at the new tag.

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

## Why rebuilds and not ports

Vercel publishes Geist’s fonts (OFL, the `geist` npm package) and its documentation, but not its React components or icons. The `@vercel/geistcn` packages that the docs import from aren’t public. So every component here is rebuilt from its public doc page: same names, props, variants and look, with our own implementation. `@geist-ui/core` is an unofficial older clone and isn’t used.

Icons are [Lucide](https://lucide.dev) (ISC), vendored with its licence in `project/components/src/LUCIDE-LICENSE.txt`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the component conventions, the preview and README formats, and how to check your work.

## Licence

MIT, see `LICENSE`. Parts by others keep their own licences:

- Geist and Geist Mono fonts: SIL Open Font License 1.1, `project/fonts/OFL.txt`.
- Lucide icons: ISC, `project/components/src/LUCIDE-LICENSE.txt`.
- `project/guidelines.md`, adapted from Vercel Labs' Web Interface Guidelines: MIT, notice at the end of that file.
