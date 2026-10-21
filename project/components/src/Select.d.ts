export interface SelectOption { value: string; label: React.ReactNode; disabled?: boolean }

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'prefix'> {
  /** Visible label, Title Case. Without it, pass aria-label. */
  label?: React.ReactNode;
  /** One sentence under the field, wired up with aria-describedby. */
  hint?: React.ReactNode;
  /** Error text under the field, announced with role="alert"; also sets aria-invalid. `true` shows the red ring only. */
  error?: React.ReactNode;
  /** Options as data. Or pass `<option>` / `<optgroup>` children. */
  options?: Array<string | SelectOption>;
  /** A disabled first option shown in gray until something is picked: "Select a region". */
  placeholder?: string;
  /** An icon before the value (decorative). */
  prefix?: React.ReactNode;
  /** Replaces the chevron (decorative). */
  suffix?: React.ReactNode;
  /** small 32px, medium 36px (default), large 40px. */
  size?: Size;
  /** Class for the bordered frame; `className` goes on the outer field. */
  wrapperClassName?: string;
}
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;
