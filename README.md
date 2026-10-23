# hyprsh design system

hyprsh’s design system: a colour scale, the Geist Sans and Geist Mono fonts, type and control scales, materials, interface guidelines and a catalogue of React components.

The docs, with live examples, are at https://hyprsh.github.io/design/.

It is published as a Design System artifact. The `project/` folder is exactly what gets published.

## Layout

```
project/
  README.md            brand book: colour, type, layout, materials, motion, iconography, copy
  guidelines.md        interface rules (accessibility, forms, motion, performance…)
  tokens.json          colour (light + dark), shadows, spacing, radius, z-index, type styles, fonts
  design-system.json   manifest
  fonts/               Geist + Geist Mono variable woff2 (SIL OFL 1.1)
  brand/               logo SVGs: the delta starship mark (blue and mono) and the lockup
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
  site.mjs             builds the docs site into .cache/site (--serve to view it)
  examples.mjs         mounts every docs example in headless Chrome
docs/
  getting-started.md   the docs site home page, also shipped to coding agents
  adr/                 architecture decisions
```

## Commands

Node 20 or newer (22 or newer for the scripts that drive Chrome, which use its built-in WebSocket). There are no dependencies to install.

```bash
npm run build
```

This builds the artifact bundle and the package in `dist/`.

```bash
npm run dev
```

The viewer runs at http://127.0.0.1:4400. Add `?only=Button,Toggle` to show just those cards.

```bash
npm run site
```

This builds the docs site into `.cache/site`.

```bash
npm run site -- --serve
```

This serves it at http://127.0.0.1:4401.

```bash
node scripts/examples.mjs
```

This checks that every example mounts.

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

## Using it

Install it with:

```bash
npm install github:hyprsh/design#v0.9.0
```

The getting started guide, with live examples, is at https://hyprsh.github.io/design/. The same page is in [docs/getting-started.md](docs/getting-started.md).

## Releasing

Bump `version` in `package.json`, then tag it (`git tag v0.10.0 && git push --tags`) and point apps at the new tag. Pushing the tag also deploys the docs site through GitHub Actions.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the component conventions, the preview and README formats, and how to check your work.

## Licence

MIT, see [LICENSE](LICENSE). It also credits the parts by others (fonts, icons, the interface guidelines), which keep their own licences.
