# hyprsh design

A design system that ports Geist to plain React components, tokens and guidelines for hyprsh products.

## Components

**hyprsh original**:
A component with no Geist doc page behind it, built from hyprsh's tokens and guidelines instead of rebuilt from Geist.
_Avoid_: custom component, non-Geist component

**Tab bar**:
The floating bottom navigation between an app's screens at phone width.
_Avoid_: bottom nav, phone nav, tabs

**Tabs**:
Switches between sections inside one page.
_Avoid_: tab bar

**Accessory**:
The round button beside the tab bar capsule, for an action that isn't a screen.
_Avoid_: FAB, action button

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
