# LoadMoreButton

A full-width button at the end of a list that appends the next page of results.

**You provide:** `onClick` and `loading` while the request runs. Optional: the label (`children`, default “Load More”), `noGap` to drop the 16px space above it, `noBorderRadius` when it closes off a bordered container, `disabled`. Other Button props pass through.

- Use it for feeds and logs that people scan from the top. Use numbered pages or Pagination when people need to come back to a specific page.
- Set `loading` while fetching. It keeps the label, shows a spinner and blocks double requests.
- Hide the button once there is nothing left to load, rather than disabling it, and say “No More Deployments” or similar if the end needs stating.
- After loading, keep focus on the button so keyboard users can keep going, and announce the new count nearby if it matters.
- The label is Title Case: “Load More”, or “Load More Deployments” when the page has several lists.
