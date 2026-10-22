export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'type'> {
  /** Controlled state. 'indeterminate' is the older spelling of `indeterminate`. */
  checked?: boolean | 'indeterminate';
  /** Shows a dash in an empty box and reports "mixed" to assistive tech. A visual state only: clicking still toggles `checked`. */
  indeterminate?: boolean;
  /** A hint line under the label (13px, grey), linked to the input with `aria-describedby`: what the setting does or sends. Clicking it toggles the box. With it, `className` and `style` go on the wrapper around both. */
  description?: React.ReactNode;
  /** The label, 13px. Without it, pass aria-label (e.g. "Select acme-web" for a table row). */
  children?: React.ReactNode;
}
export declare function Checkbox(props: CheckboxProps): React.ReactElement;
