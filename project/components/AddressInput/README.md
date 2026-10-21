# AddressInput

A postal-address fieldset whose fields follow the chosen country, with an optional search-as-you-type street field fed by your own suggestions.

**You provide:** `value` + `onChange(address)` or `defaultValue`, where an address is `{ country, line1, line2, city, region, postalCode }`. Optional: `suggestions` (a list filtered as you type, or a function returning a list or Promise) or `provider` (`{ search, details }`) to turn the street field into a search; `countries` to limit the list; `errors` (from `getAddressErrors(address)`, also `AddressInput.getAddressErrors`); `name` (input name prefix, `address` by default); `label`; `locale`; `disabled`.

- Fields and labels follow the country: State and ZIP Code for the US, Province for Canada, Postal Code before City for most of Europe, no postal code for Hong Kong or the UAE.
- Every input has a standard `autocomplete` token, so browsers can fill it in.
- With search, only Country and Street Address show until an address is picked; “Enter Address Manually” reveals the rest, and a failed lookup does the same.
- It never makes network requests itself; plug your own lookup into `provider`.
- Validate on submit and show one plain message per field (“Enter city.”), not a summary at the top.
