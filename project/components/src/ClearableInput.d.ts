export interface ClearableInputProps extends InputProps {
  /** Called after the field is cleared (Esc key button or Escape). onChange also fires, with an empty value. */
  onClear?: () => void;
  /** Shows ⌘ K while the field is empty, for a search that a global shortcut focuses. */
  cmdk?: boolean;
}
export declare const ClearableInput: React.ForwardRefExoticComponent<ClearableInputProps & React.RefAttributes<HTMLInputElement>>;
