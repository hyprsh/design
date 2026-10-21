export interface AddressValue {
  /** ISO 3166-1 alpha-2 code, e.g. 'US', 'DE'. */
  country?: string;
  line1?: string;
  line2?: string;
  city?: string;
  /** State, province or emirate code for countries that have a list (US 'CA', CA 'ON', …). */
  region?: string;
  postalCode?: string;
}

export type AddressErrors = Partial<Record<keyof AddressValue, string>>;

export interface AddressProvider {
  /** Look up suggestions for typed text, optionally within a country. */
  search: (query: string, country?: string) => Promise<AddressValue[]>;
  /** Optional: turn a picked suggestion into a full address. */
  details?: (suggestion: AddressValue) => Promise<AddressValue>;
}

export interface AddressInputProps {
  value?: AddressValue;
  defaultValue?: AddressValue;
  onChange?: (address: AddressValue) => void;
  /** Local suggestions for the street search: a list (filtered as you type) or a function returning a list or a Promise. */
  suggestions?: AddressValue[] | ((query: string, country?: string) => AddressValue[] | Promise<AddressValue[]>);
  /** Async lookup you supply; AddressInput itself never touches the network. */
  provider?: AddressProvider;
  /** Limit the country list to these codes. All countries by default. */
  countries?: string[];
  /** Messages per field, e.g. from getAddressErrors(address). */
  errors?: AddressErrors;
  /** Prefix for input names: name.country, name.line1, … Default 'address'. */
  name?: string;
  /** Visible group heading; read by screen readers either way (default "Address"). */
  label?: string;
  /** Placeholder for the street search. */
  placeholder?: string;
  /** BCP 47 locale for country names. */
  locale?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Returns a message for each missing field, worded for the address's country. */
export declare function getAddressErrors(address: AddressValue): AddressErrors;

export declare const AddressInput: ((props: AddressInputProps) => React.ReactElement) & {
  getAddressErrors: typeof getAddressErrors;
  /** A few made-up addresses for demos. */
  demoSuggestions: AddressValue[];
};
