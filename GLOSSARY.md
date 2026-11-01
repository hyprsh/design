# hyprsh design

hyprsh's design system: plain React components, tokens and guidelines for hyprsh products.

## Components

**Tab bar**:
The floating bottom navigation between an app's screens at phone width.
_Avoid_: bottom nav, phone nav, tabs

**Tabs**:
Switches between sections inside one page.
_Avoid_: tab bar

**Accessory**:
The round button beside the tab bar capsule, for an action that isn't a screen.
_Avoid_: FAB, action button

**Tone**:
The colour of a semantic status: success, info, warning, error or neutral. One tone looks the same on every component that shows it, so a dot and a bar about the same thing match.
_Avoid_: state colour, variant, type (those are a component's own look)

**Segment**:
One tone's share of a total, drawn as part of a bar beside the others.
_Avoid_: slice, chunk, stack

**Presence**:
Whether a person is online, away or offline, shown as a dot on their avatar.
_Avoid_: status, state (those are StatusDot's), availability

**Reaction**:
A quick response to a message, such as an emoji, chosen from a row above a context menu's items.
_Avoid_: emoji, quick action

**Resize handle**:
The draggable edge at the end of a column header that changes the column's width.
_Avoid_: resizer, grip, splitter, separator (that's the divider component)

**Pinned column**:
A table column that keeps its index in the default order: it can't be dragged or moved, and the other columns reorder around it.
_Avoid_: frozen column, locked column, sticky column (that is a sticky header)

**Pager**:
Moves through a long set of results one page at a time, in place, showing which range is on screen.
_Avoid_: table pagination, paginator

**Pagination**:
Links to the previous and next page in a sequence of documents, such as a guide.
_Avoid_: pager

## Documentation

**Card**:
The live demo of one component showing its variants together, as the artifact and the dev viewer show it.
_Avoid_: preview, demo, story

**Example**:
One live use of a component shown with the JSX that produces it, for an app to copy.
_Avoid_: snippet (that is the Snippet component), demo, sample

**Pattern**:
A whole screen composed from several components, such as a settings page.
_Avoid_: template, recipe, layout (that is a card group)

## Queries

**Query**:
The whole text of a query field, terms and free text together: `is:open label:bug,docs crash`.
_Avoid_: filter (that is the screen feature a query drives), search string

**Qualifier**:
A name an app understands in a query, written before a colon: `label`, `sort`.
_Avoid_: key, facet, operator

**Term**:
One qualifier with its values as typed: `-label:bug,docs`. Values after one qualifier are alternatives; the same qualifier twice must match both.
_Avoid_: token, chip, filter

**Free text**:
The words of a query that are not terms.
_Avoid_: search text, keywords

**Exclude**:
What a leading `-` does to a term: leave its values out instead of asking for them.
_Avoid_: negate, not

**Filter menu**:
A dropdown that owns one qualifier's values: it starts empty, and each value checked in it includes or excludes that value.
_Avoid_: multi-select (that one starts with everything selected and narrows down), facet, dropdown

**Query bar**:
A query field with a row of filter menus beside it, all reading and writing the same query.
_Avoid_: filter bar (that is the URL-bound filter pills), search bar

**Suggestion**:
A completion offered for the word at the caret of a query field, which rewrites the query when picked.
_Avoid_: option (that is a choice in a list that holds the value), autocomplete

## Touch

**Touch target**:
The smallest size a control may be tapped at under touch sizing: 44px in both directions.
_Avoid_: tap target, touch size, min touch

**Hit area**:
The region of a control that responds to a pointer. It can reach past the drawn box when a control is meant to look small.
_Avoid_: tap area, click area

**Drawn size**:
The visible box of a control, as opposed to its hit area.
_Avoid_: visual size, rendered size

**Phone width**:
A viewport narrower than 640px (the `sm` breakpoint).
_Avoid_: mobile, small screen

**Touch sizing**:
The rules that apply when the pointer is coarse or the viewport is at phone width, so a narrow window with a mouse gets what a phone gets.
_Avoid_: mobile mode, touch mode

**Touch-only device**:
A device used by touch alone, with no mouse, trackpad or keyboard to hover or press keys: a phone or a tablet on its own. Narrower than touch sizing: a touch laptop or a narrow desktop window is not one.
_Avoid_: mobile, touch device

**Shortcut hint**:
A key shown beside a control or in a menu row to teach its keyboard shortcut. Hidden on touch-only devices.
_Avoid_: kbd, keyboard hint
