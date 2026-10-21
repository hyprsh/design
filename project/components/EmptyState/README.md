# EmptyState

A bordered, centred block that fills a view with nothing to show yet, explaining why and offering the next step.

**You provide:** `title`, `description`, an `icon` (a Lucide name or a node, drawn in a bordered tile; `EmptyState.Icon` draws the tile on its own) and children for the actions. Set `headingLevel` (default 3) to fit the page outline.

- Offer one primary call to action and at most one secondary, often a “Learn More” link.
- Write the title in Title Case (No Deployments Yet) and name actions Verb + Noun (Create Project).
- For an empty search, quote the query with curly quotes: No results for “billing”. Suggest clearing filters.
- When filters change what's shown, put the empty state in an `aria-live="polite"` region so the change is announced.
- For a failed load, say what went wrong, give a copyable request ID if you have one, and offer Try Again. Use ErrorCard when the failure is the main message.
