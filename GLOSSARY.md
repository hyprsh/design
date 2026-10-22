# hyprsh design

A design system that ports Geist to plain React components, tokens and guidelines for hyprsh products.

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
