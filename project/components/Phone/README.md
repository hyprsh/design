# Phone

A phone-shaped frame, with bezel, island, side keys and an optional mobile browser toolbar, for showing mobile screenshots and recordings.

**You provide:** `children` for the screen (an image or video that fills it; a neutral placeholder shows without it) and optionally `address` to show a mobile browser toolbar. It scales to the width it's given, so set that on the parent (around 320px is typical).

- Use it as chrome around a mobile capture on landing pages and docs, not around live, interactive mobile UI.
- Pair it with Browser to show desktop and mobile side by side.
- Crop screen content to a real device ratio (about 19.5:9) so the bezel doesn't cut anything off. Content is `object-fit: cover`.
- The phone already has a rim, so don't add a shadow to its container.
- The frame is decorative and `aria-hidden`. Put the accessible name on the content: alt text such as “Deployments list on a phone”, not “phone mockup”.
- A video inside should respect reduced motion and show a paused poster. Use Video, which does this.
- The device is always dark hardware, in both themes.
