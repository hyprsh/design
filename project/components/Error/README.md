# Error

An inline error message: a red icon, an optional bold label and text that says what happened and what to do next.

**You provide:** the message as children. Optional: `label` (default `Error`, or `false` to hide it visually), `size` (`small`, `medium` by default, `large`) and `error` (`{ message, action, link }`) for a message with a recovery link. Pass `aria-live="polite"` (or a `role`) when it appears after a request.

- Use it as the block for a section that failed to load: a panel, a dashboard card, a route boundary. For a failed action use a toast, and for a field use the input's `error` prop.
- Say what happened, then what to do: “Couldn’t load deployments. Try again.” No “Oops” or “Sorry”, and never “Something Went Wrong”.
- Use “Couldn’t” or “Can’t” for user-state errors and “Failed to” for system errors that mirror CLI output. Avoid “Unable to”.
- System errors carry a stable ID (request, deployment or trace ID) in mono, so the user can paste it into a support thread.
- The recovery action does something concrete: Try Again when retrying is safe, a named verb (Reconnect Git, Update Payment Method) when it isn't. Don't retry silently.
