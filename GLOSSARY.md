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
