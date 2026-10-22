# FilterParams

A filter bar whose state lives in the URL: “Add Filter” opens a two-step picker, active filters show as removable pills, and suggested defaults show as dashed pills.

**You provide:** `params`, one entry per filter with `key` (display name), `type` (`'select'`, `'multi-select'` or `'date-range'`), `options` or `presets`, and optionally `param` (URL key), `label`, `optionLabel`, `encode`/`decode` and `suggestion`. Pass `searchParams` with `onSearchParamsChange` to control it, or leave them out to sync with `location.search`. Optional: `ai` (`{ isThinking, onAbort, onQuery }`), `addLabel` and `defaultOpen`. Helpers: `FilterParams.useSearchParamState`, `encodeDateRangeValue`, `decodeDateRangeValue` and `resolveDateRange`.

- Keep constraints visible and linkable: every active filter is a pill, and a copied URL reproduces the view.
- Each filter encodes only the keys it owns; anything else in the URL is left alone.
- Use short Title Case names (Environment, Branch, Date Range) and specific value labels (Production, Last 7 Days), not “Custom” or “Other”.
- Offer a `suggestion` only when it's a genuinely useful default. It shows as a dashed pill until it's applied or another value is chosen.
- The picker is a combobox: arrows move, Enter picks, Escape closes and returns focus, and Backspace in an empty box goes back a step.
- Store date presets by key and resolve them with `resolveDateRange` when you query, so “Last 7 Days” stays relative.
- The picker floats under the button or pill that opened it, flips when there's no room and stays on screen on phones, where pills and options are 44px tall under touch sizing.
