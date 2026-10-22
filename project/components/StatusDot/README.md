# StatusDot

A coloured dot and a word for a status: a deployment's lifecycle state, or any health or result.

**You provide:** `state`, either a semantic state for any status (`success` green, `warning` amber, `error` red, `neutral` grey, `pending` grey and pulsing, `info` blue for informational, not a problem) or a deployment state (`queued` | `building` | `ready` | `error` | `canceled` | `deleted`), in either case, so `READY` works too. Optional: `variant`, `filled` (default), `outline` or `dashed`, a ring in the same colour for a dot that is wanted or not yet there (the size stays the same, and the name doesn't change); `label` (shown by default; pass a node to replace the word, such as “Healthy” or “Idle”, or `false` for a dot alone in a dense column), `titlePrefix`, a noun phrase for the title and accessible name, and `title`, the whole accessible name. For deployment states the name is “This deployment is ready.” unless you set `titlePrefix`; for semantic states, and for `error` with a custom `label`, it is the label (“Healthy”), or “api: Healthy” with `titlePrefix="api"`. `error` without a label keeps the deployment wording, so set `title` for a dot-only error on something that isn't a deployment.

- Use it for a status the reader scans in a list: a deployment, a service's health, an indexer's last check. Pick the semantic state by meaning (`success` for healthy or done, `warning` for degraded, `error` for failing, `neutral` for idle or off, `pending` for waiting or in flight) and put the app's own word in `label`. For a category or a count use a Badge; for a number such as uptime, use Gauge; for work with a known total, use Progress.
- The dot pulses while `building`, `queued` or `pending` and stays still once the state is final, so don't put a Spinner next to it. Update it only when the state actually changes, not on every polling tick.
- In lists, pass the entity as `titlePrefix` (“api-gateway production”). Keep it a noun phrase, with no verb or full stop.
- Don't wrap it in prose such as “Status: Ready”; the label already names the state.
- A dot without a label still has an accessible name. If text next to it already names the state, set `aria-hidden` so screen readers don't hear it twice.
- Use `info` for an update or a note that isn't a problem, such as a new version being available. Don't use it for a warning.
- `outline` and `dashed` don't say anything by themselves, since the name is the same for every variant. Put the meaning in `label` or `title`, for example “4K: wanted”, and don't rely on the ring alone.

## Row of dots

For a row of dots that share one meaning, such as a set of versions or slots, use several `StatusDot`s with `label={false}` and `aria-hidden`, inside a wrapper with one accessible name. Screen readers then hear one phrase instead of each dot.

```jsx
<span role="img" aria-label="4K: wanted, 1080p: on disk, 720p: downloading" className="hy-row" style={{ padding: 0, gap: 8 }}>
  <StatusDot state="info" variant="outline" label={false} aria-hidden />
  <StatusDot state="success" label={false} aria-hidden />
  <StatusDot state="pending" variant="dashed" label={false} aria-hidden />
</span>
```

Give each dot a visible caption if the reader needs to see which dot is which, and set `aria-hidden` on the captions too.
