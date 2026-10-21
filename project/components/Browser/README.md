# Browser

A browser-window frame (window dots, back/forward/reload and an address bar) around a screenshot, demo or recording.

**You provide:** `address` (a full URL; the bar shows the host and path, and its button copies the URL) and `children` for the page, usually an image or video. It fills the width it's given.

- Use it as presentation chrome on landing pages, docs and changelog posts. Don't put live product UI inside it, because the frame says “this is a screenshot”.
- The frame follows the theme, so it sits quietly on light and dark pages. Keep a Browser and a Phone shown side by side on the same theme.
- Give the image or video inside real alt text that describes what's on screen, not “browser screenshot”. Fix the image's aspect ratio so the frame doesn't jump while it loads.
- The dots and the back/forward/reload icons are `aria-hidden` and can't be focused. The only control is the copy button, which says when the URL has been copied.
- Below 600px of width the navigation icons hide and the address bar takes the room.
- For very long URLs, the address truncates with an ellipsis and shows the full URL as its tooltip.
