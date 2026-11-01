# Changelog

What changed in each version, newest first; the same notes are on the [GitHub releases](https://github.com/hyprsh/design/releases). To use a version, install its tag: `npm install github:hyprsh/design#<tag>`.

## v0.17.0

2026-11-01

### New Components

- **ColumnChart:** stacked columns with a legend, tooltips, one roving Tab stop and a View as Table toggle.
- **BarList:** labelled horizontal bars for ranking amounts, with optional links.
- **Sparkbars:** per-run bars sized by value and coloured by outcome, with keyboard navigation and a tooltip.
- **NavList** and **NavItem:** navigation rows for sidebars and settings section lists, with icons, trailing counts and a current item.
- **QueryHelpButton:** the query help button and popover as a component of its own.

### Features

- **menu:** nested submenus (`Menu.Sub`, `Menu.SubTrigger`) that open to the side on desktop and drill in place under touch sizing.
- **query-input:** a `shortcut` prop that shows a key cap in the empty field and focuses it from anywhere on the page.
- **query-bar:** `help={false}` hides the help button and `help="menus"` moves it to the end of the menu row.
- **table:** column reordering with pinned columns, drag, Alt+←/→ and an exported `Table.ColumnsMenu`.
- **toast:** `toast.update()` changes a toast in place, with an optional progress bar.
- **progress:** segments get a 2px gap and a 2px minimum, so a small share stays visible.
- **tokens:** `chart-seq-1`…`chart-seq-5` and `chart-series` colour tokens for amounts.

### Docs

- **guidelines:** a Charts section on marks, colour, legends, tooltips, keyboard and accessibility.
- **adr:** pinned columns and the Columns menu (0003), and charts without a library (0004).

## v0.16.0

2026-10-31

### Features

- **table:** resizable columns and a pager for long tables

### Docs

- **table:** record resize and pager decisions

## v0.15.0

2026-10-31

### Features

- **release:** a script that bumps, changelogs, commits and tags a release
- **chrome:** add --clean to kill orphaned hy-chrome Chrome processes
- **chrome:** stop the Chrome scripts after HY_DEADLINE seconds
- **chrome:** add emulate, measure and screenshot probe helpers
- **components:** chat parts, checked menu items, segmented progress and smaller props

### Fixes

- **release:** show plain paths in the dry-run diff
- **chrome:** kill Chrome and remove its profile when the script exits or is interrupted
- **chrome:** --clean kills only orphaned Chromes, not ones a running script drives
- **cards:** heights that fit their content
- **chrome:** a 600s default deadline, since the card check takes about 4 minutes
- **touch:** expect the round close button in place of the Esc hint on touch-only devices

### Docs

- **readme:** rewrite Releasing around scripts/release.mjs
- **contributing:** allow edits to shared files when the ticket asks for them
- **glossary:** add tone and segment
- **glossary:** add presence and reaction

### Other

- fail when install tags or the changelog disagree with package.json
- check every card fits its declared height

## v0.14.0

2026-10-24

### Features

- **site:** page headers, an on-this-page list and prev/next links
- **site:** specimens for the Foundations pages, a card overview and copyable tokens

### Fixes

- **site:** give code blocks' Copy button its own strip on phones

### Docs

- **getting-started:** setup in three steps, tokens and themes, and a shorter Tailwind section
- **guidelines:** move the shortcut-hint rule after the general keyboard rules
- **foundations:** tighten the brand book, split the logo rules and drop Using this system

## v0.13.0

2026-10-24

### Features

- **docs:** a changelog page, shipped in the package
- **site:** follow the system theme, with a System, Light and Dark switch

### Fixes

- **release-notes:** a plain error for a version already in the changelog, and today's local date
- **chrome:** wait up to 30s for Chrome to start, and say why it didn't

## v0.12.0

2026-10-24

### Features

- **toast:** lift the stack by --tab-bar-height so it clears a TabBar
- **dots-menu:** forward tabIndex and onFocus to the button
- **button:** badge, badgeTone and badgeLabel, as on TabBar.Item
- **entity:** a current state for the keyboard cursor row

### Docs

- **readme:** lead with getting started, for first-time users

### Other

- **pages:** publish a GitHub release for each version tag
- **button:** indent the link branch like the rest of renderButton

## v0.11.0

2026-10-23

### Features

- **site:** show the version in the header, and draw the mark in the accent
- **table:** a loading state with skeleton rows

### Fixes

- **toast:** mount the fallback host with react-dom/client's createRoot
- **toggle:** take the colour only when on
- **status-dot:** draw the outline and dashed rings as SVG
- tighten the ticket work after review
- **shot:** fail without the dev server, on a non-card page, or when no screenshot is written

### Other

- smoke-test the npm entry against React 18 and 19 in headless Chrome

## v0.10.0

2026-10-23

### Breaking changes

- remove the Book component
- a blue accent, and a solid blue logo

### Features

- **query-bar:** wrap the menus onto more rows instead of scrolling them
- **docs:** a docs site with live examples, and docs for coding agents
- **site:** search in the header instead of the sidebar filter
- **site:** link to the repo from the header

### Fixes

- **query-input:** key the no:name hint in the query help
- **ci:** run the Pages workflow on Node 22
- **site:** let the components' focus styles win inside examples
- **feedback:** place the popover with useFloating so it stays on screen
- **site:** keep the theme toggle in step with any data-theme change
- **site:** render live examples as they would sit in an app
- **tokens:** draw shadow-focus-ring in focus-color
- components that didn't match their docs
- flush focus rings, and no ring on list items
- **tokens:** a neutral mid-grey focus ring
- **empty-state,fieldset:** underline links at rest

### Docs

- credit Geist in the licence instead of throughout the docs
- examples for 20 more components
- examples for 20 more components
- examples for the last 28 components
- make examples show what their descriptions say

### Other

- untrack .claude/, which holds local preview settings
- **pages:** move the actions to their Node 24 majors

## v0.9.0

2026-10-22

### Features

- **tab-bar:** an error or warning tone for count and dot badges
- **table:** pass the click event to onSort and onSortChange

### Fixes

- **query:** suggest qualifier names by prefix, not by any substring

## v0.8.0

2026-10-22

### Features

- **status-dot:** info state and outline and dashed variants
- **table:** sortable column headers
- FilterMenu, a filter dropdown that includes, excludes and searches
- TabBar, a floating pill tab bar for phones
- QueryInput, a query field with suggestions, and the query syntax
- **keyboard-input:** hide shortcut hints on touch-only devices
- QueryBar, filter menus bound to a query

### Fixes

- size controls for touch from --touch-target under a coarse pointer or at phone width
- give Combobox's and FilterParams' small buttons a touch target hit area
- **query-bar:** keep no:name a term of its own, in place of the qualifier's terms
- **query:** flag no:name where no qualifier can be empty
- follow-ups from the review of #15-#21

### Docs

- add a glossary with the touch sizing terms
- add the tab bar and hyprsh original terms to the glossary
- add query, filter menu and touch-only terms to the glossary (#22)
- list _query.js in the JS scope, call FilterMenu a filter menu, and say TabBar watches inner containers by default

## v0.7.0

2026-10-22

### Features

- **command-menu:** export the onKeyDown event type as CommandMenuKeyEvent
- **table:** wrapping and truncating cells, sticky header, selected row and opt-in alignment
- **menu:** keep keys inside the portal, item description and title, focusable disabled items
- Popover, Link and toggle chips on Pill
- compact variants for EmptyState, Collapse, Description, Input and Select
- StatusDot semantic states, Checkbox description, mono fields, Note roles, svg sizing in Button and strong type

### Fixes

- **popover:** read the trigger's ref from props on React 19

## v0.6.0

2026-10-22

### Features

- ship the component CSS in a cascade layer and add a Tailwind v4 entry

## v0.5.0

2026-10-22

### Features

- **theme-switcher:** Button-sized cycle button and a tooltip position
- **command-menu:** skip keys without cancelling them, an input ref, Ctrl+N/P and a neutral empty state

### Fixes

- **theme-switcher:** follow the OS from mount while System is stored

## v0.4.0

2026-10-22

### Features

- **command-menu:** controlled query, optional filtering and a key hook
- **theme-switcher:** class-based dark mode, a cycle button and a pre-paint script
- add CommandMenuTrigger, a search-field button that opens the command menu

## v0.3.0

2026-10-21

### Breaking changes

- drop the trial and turbo badges and Vercel-style demo content

### Docs

- license under MIT, list third-party licences and say hyprsh isn't affiliated with Vercel

## v0.2.0

2026-10-21

### Features

- make every component work in phone browsers

## v0.1.1

2026-10-21

### Fixes

- alias package exports so Error never shadows the global

## v0.1.0

2026-10-21

### Features

- add hyprsh design system on Geist
- build an installable React package
