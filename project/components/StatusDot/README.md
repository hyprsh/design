# StatusDot

A coloured dot and a word for the lifecycle state of a deployment.

**You provide:** `state` (`queued` | `building` | `ready` | `error` | `canceled` | `deleted`, in either case, so `READY` works too). Optional: `label` (shown by default; pass a node to replace the word, or `false` for a dot alone in a dense column), and `titlePrefix`, a noun phrase for the title and accessible name (default “This deployment”, giving “This deployment is ready.”).

- Use it for deployment states only. For workflow runs, jobs or cron results, use a Badge with that system's own vocabulary. For a number such as uptime, use Gauge; for work with a known total, use Progress.
- The dot pulses while `building` or `queued` and stays still once the state is final, so don't put a Spinner next to it. Update it only when the state actually changes, not on every polling tick.
- In lists, pass the entity as `titlePrefix` (“api-gateway production”). Keep it a noun phrase, with no verb or full stop.
- Don't wrap it in prose such as “Status: Ready”; the label already names the state.
- A dot without a label still has an accessible name. If text next to it already names the state, set `aria-hidden` so screen readers don't hear it twice.
