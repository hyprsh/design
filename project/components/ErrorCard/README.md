# ErrorCard

A red, centred card for an error that takes over a region: an icon, a title and a message.

**You provide:** `title` and `message`. Optional: children for a recovery action such as a Try Again button. It has `role="alert"`; pass another `role` (or `aria-live="polite"`) when it shouldn't interrupt.

- Use it where a whole card or panel can't show its content: no credits left, a usage chart that failed to load. For one line of error text, use Error. For a field, use the input's `error` prop.
- The title names what failed (“Couldn’t Load Usage”, “No Build Minutes Left”). The message says what to do next.
- Offer one way forward: a Try Again button when retrying is safe, or a named action like Upgrade Plan.
- Never joke or apologise. Keep the copy plain and specific.
