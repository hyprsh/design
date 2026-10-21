export interface SearchInputProps extends ClearableInputProps {
  /** Swaps the search icon for a spinner and sets aria-busy, while results load. */
  loading?: boolean;
  /** Replaces the search icon. */
  prefix?: React.ReactNode;
}
export declare const SearchInput: React.ForwardRefExoticComponent<SearchInputProps & React.RefAttributes<HTMLInputElement>>;
