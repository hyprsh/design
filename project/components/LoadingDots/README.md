# LoadingDots

Three softly pulsing dots for a short, indeterminate wait, on their own or after a word.

**You provide:** nothing required. Optional: `children` for the text before the dots (“Deploying”), `size` (`sm` 2px, `md` 3px, `lg` 4px, or a number), and `aria-label` for the announced text when there are no children (default “Loading”).

- Use it inline, in text or a button label, where a Spinner would feel heavy. For a known total use Progress; for whole regions waiting on data use Skeleton.
- The dots take the current text colour (gray-900 by default) and are hidden from screen readers. The wrapper is a polite live region, so the text is announced once.
- Under reduced motion the dots stop pulsing and stay half-visible.
