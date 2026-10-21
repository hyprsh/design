# Video

A short product clip with a small floating bar: play/pause, the current time, a seek slider and the length.

**You provide:** `src`, plus `aria-label` describing what the clip shows. By default it's muted, loops, plays inline and autoplays once it's near the viewport. Pass `width` and `height` as numbers to set the aspect ratio (16:9 otherwise).

- Use it for silent demos of a flow: a deploy going green, a command palette opening. It isn't a media player for talks or tutorials with sound. Link to those instead.
- The file only loads when the player comes within 200px of the viewport (`lazy`), so a page full of clips stays light. Give it a `poster` so the frame isn't empty before then.
- It never autoplays when the reader prefers reduced motion. The bar stays up so they can press Play.
- The bar shows while the clip is paused and fades out while it plays, coming back on hover or when anything in it has focus. On touch screens it stays up.
- Clicking the picture plays or pauses it. The button says Play or Pause, and the slider reads out “0:12 of 0:30”.
- Keep clips short (under 30 seconds) and without sound you'd miss. Muted autoplay with no captions has to make sense on its own.
- Without `src` the player draws a placeholder poster, which is handy in mock-ups. Its controls stay disabled.
