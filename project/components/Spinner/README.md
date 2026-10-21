# Spinner

An indeterminate loading indicator: a ring of fading bars, gray-700 by default.

**You provide:** nothing required. Optional: `size` (`sm` 12px, `md` 16px by default, `lg` 20px, `xl` 24px, `2xl` 32px, `3xl` 40px, `4xl` 56px; a number of px still works), `label` (or `aria-label`), and a colour through `style` or `className`. With a label it becomes a `status` region with that name; without one it is decorative.

- Show it only after about 300ms, so fast responses don't flash. Pair it with text such as “Loading…” wherever there's room.
- Inside a Button it takes the button's text colour; use the Button's `loading` prop rather than placing one yourself.
- For content with a known shape, use Skeleton. For a known amount of progress, use Progress. Inline in text, LoadingDots is lighter.
- Under reduced motion the bars cycle at half speed.
