# Pagination

Previous and next links at the end of a page in a sequence, such as docs, a guide or a changelog, showing the neighbouring pages' titles.

**You provide:** `previous` and `next`, each `{ title, href }` (optional `label` and `onClick` for client routing). Leave one out on the first or last page. Optional: `aria-label` (default “Pagination”).

- Use Pagination to move through an ordered set of pages. For long lists of results, use LoadMoreButton or a table's own paging.
- Leave a side out on the first or last page. Don't show a disabled link.
- Each link says where it goes: screen readers hear “Go to next page: Environment Variables”. Pass the real page title, in Title Case.
- Put it at the bottom of the content, after the last section and before the footer.
