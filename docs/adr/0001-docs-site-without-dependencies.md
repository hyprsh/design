# Docs site without dependencies

The docs site at hyprsh.github.io/design is built by a hand-written `scripts/site.mjs`, not by Storybook, Astro or VitePress, so the repo keeps its rule of no dependencies to install. Examples are fenced `jsx` blocks in each component's README, compiled in the browser by Babel from a CDN. One file then serves the site, the coding agents reading `.md` pages or `dist/docs/`, and the artifact.

## Considered Options

- **Storybook:** stories live in separate files that agents and the artifact never see, and it brings a large dependency tree.
- **Astro Starlight or VitePress:** good sites with little effort, but each needs dependencies and a build toolchain the rest of the repo doesn't have.
- **Examples generated from cards:** cards render every variant in one `h()` script, so they can't be cut into copyable JSX.

## Consequences

- Examples are only checked by mounting them in headless Chrome before a deploy, not type-checked against the `.d.ts` files, since that would need the TypeScript compiler.
- The site's markdown converter only handles the small subset of markdown the READMEs use.
