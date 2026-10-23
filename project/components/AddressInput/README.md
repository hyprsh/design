# AddressInput

A postal-address fieldset whose fields follow the chosen country, with an optional search-as-you-type street field fed by your own suggestions.

**You provide:** `value` + `onChange(address)` or `defaultValue`, where an address is `{ country, line1, line2, city, region, postalCode }`. Optional: `suggestions` (a list filtered as you type, or a function returning a list or Promise) or `provider` (`{ search, details }`) to turn the street field into a search; `countries` to limit the list; `errors` (from `getAddressErrors(address)`, also `AddressInput.getAddressErrors`); `name` (input name prefix, `address` by default); `label`; `locale`; `disabled`.

- Fields and labels follow the country: State and ZIP Code for the US, Province for Canada, Postal Code before City for most of Europe, no postal code for Hong Kong or the UAE.
- Every input has a standard `autocomplete` token, so browsers can fill it in.
- With search, only Country and Street Address show until an address is picked; “Enter Address Manually” reveals the rest, and a failed lookup does the same.
- It never makes network requests itself; plug your own lookup into `provider`.
- Validate on submit and show one plain message per field (“Enter city.”), not a summary at the top.

## Examples

### Default
Fields follow the chosen country. Keep the address in state.

```jsx
import { useState } from 'react';
import { AddressInput } from '@hyprsh/design';

export default function Example() {
  const [address, setAddress] = useState({ country: 'US' });

  return (
    <div style={{ maxWidth: 400 }}>
      <AddressInput label="Billing Address" value={address} onChange={setAddress} countries={['US', 'CA', 'AU', 'DE']} />
    </div>
  );
}
```

### Validation
`getAddressErrors` returns a message for each missing field. It checks presence only, not format.

```jsx
import { useState } from 'react';
import { AddressInput, getAddressErrors } from '@hyprsh/design';

export default function Example() {
  const [address, setAddress] = useState({ country: 'US', line1: '123 Market Street', city: '', region: '', postalCode: '94105' });

  return (
    <div style={{ maxWidth: 400 }}>
      <AddressInput label="Billing Address" value={address} onChange={setAddress} errors={getAddressErrors(address)} countries={['US', 'CA']} />
    </div>
  );
}
```

### Street Suggestions
Pass `suggestions` to turn the street field into a search. It can also be a function that returns a list or a Promise.

```jsx
import { useState } from 'react';
import { AddressInput } from '@hyprsh/design';

const known = [
  { country: 'US', line1: '123 Market Street', city: 'San Francisco', region: 'CA', postalCode: '94105' },
  { country: 'US', line1: '125 Market Street', city: 'San Francisco', region: 'CA', postalCode: '94105' },
  { country: 'US', line1: '40 Mission Street', city: 'San Francisco', region: 'CA', postalCode: '94105' },
];

export default function Example() {
  const [address, setAddress] = useState({ country: 'US' });

  return (
    <div style={{ maxWidth: 400 }}>
      <AddressInput
        label="Shipping Address"
        name="shipping"
        value={address}
        onChange={setAddress}
        countries={['US']}
        suggestions={(query) => known.filter((a) => a.line1.toLowerCase().includes(query.trim().toLowerCase()))}
      />
    </div>
  );
}
```

### Disabled
A disabled address shows its value and can’t be edited.

```jsx
import { AddressInput } from '@hyprsh/design';

export default function Example() {
  return (
    <div style={{ maxWidth: 400 }}>
      <AddressInput
        disabled
        label="Company Address"
        defaultValue={{ country: 'DE', line1: 'Beispielstraße 1', city: 'Berlin', postalCode: '10115' }}
        countries={['DE', 'US']}
      />
    </div>
  );
}
```
