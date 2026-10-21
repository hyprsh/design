export interface ComboboxOptionData {
  value: string;
  label?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Id of the text field, for an outside <label htmlFor>. */
  id?: string;
  /** Selected option value; null when nothing is picked. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** Called with the typed text. */
  onInputChange?: (text: string) => void;
  /** Shortcut for ComboboxList + ComboboxOption children. */
  options?: Array<ComboboxOptionData | string>;
  placeholder?: string;
  /** small 32px, medium 36px (default), large 40px. */
  size?: 'small' | 'medium' | 'large';
  /** CSS width of the field; full width by default. */
  width?: number | string;
  /** Shows a clear button once something is picked. */
  clearable?: boolean;
  /** Red ring and aria-invalid. */
  errored?: boolean;
  disabled?: boolean;
  /** Shows a spinner instead of the options while results load. */
  loading?: boolean;
  /** Shown when nothing matches; a function gets the typed text. */
  emptyMessage?: React.ReactNode | ((query: string) => React.ReactNode);
  /** Submit the value in forms under this name. */
  name?: string;
  /** Start with the list open. */
  defaultOpen?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children?: React.ReactNode;
}

export interface ComboboxInputProps { onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void; }
export interface ComboboxListProps {
  emptyMessage?: React.ReactNode | ((query: string) => React.ReactNode);
  maxWidth?: number | string;
  width?: number | string;
  children?: React.ReactNode;
}
export interface ComboboxOptionProps {
  value: string;
  /** Text used for filtering when children aren't plain text. */
  textValue?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
}

export declare const ComboboxInput: (props: ComboboxInputProps) => null;
export declare const ComboboxList: (props: ComboboxListProps) => null;
export declare const ComboboxOption: (props: ComboboxOptionProps) => null;
export declare const Combobox: ((props: ComboboxProps) => React.ReactElement) & {
  Input: typeof ComboboxInput;
  List: typeof ComboboxList;
  Option: typeof ComboboxOption;
};
