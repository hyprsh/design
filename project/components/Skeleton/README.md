# Skeleton

A placeholder that matches the shape of the content it replaces, so the layout doesn't shift when the data arrives.

**You provide:** either a size (`width`, and `height`, default 24px) or the real content as `children`, which then sizes the placeholder while staying hidden. Pass `show={false}` to swap in the children. Optional: `pill` or `rounded` for fully round ends, `squared` for square corners, `animated={false}` for a static block, `button` when wrapping a Button, and `boxHeight` when the content's box is taller than its visible shape.

- Match the final content's size exactly. Wrapping the real content is the easiest way. Never show a generic block.
- Use it for content with a known shape. For a short wait with no shape, use Spinner or LoadingDots.
- Skeletons are decorative and hidden from screen readers; announce loading elsewhere if it takes long.
- The shimmer stops under reduced motion.
