export interface SwitchProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Radio group name; a unique one is generated when left out. */
  name?: string;
  /** small 32px, medium 36px (default), large 40px. */
  size?: 'small' | 'medium' | 'large';
  /** Controlled selected value. */
  value?: string;
  /** Uncontrolled starting value (or put defaultChecked on one SwitchControl). */
  defaultValue?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Disables every control. */
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export interface SwitchControlProps {
  /** Visible text; with `icon` it becomes the screen-reader name. Always required. */
  label: string;
  /** Submitted value; defaults to the label. */
  value?: string;
  /** Shows only this icon (label read by screen readers). Pair with a Tooltip. */
  icon?: React.ReactNode;
  /** Show the label next to the icon instead of hiding it. */
  hideLabel?: boolean;
  defaultChecked?: boolean;
  checked?: boolean;
  disabled?: boolean;
  /** Overrides the group size for this control. */
  size?: 'small' | 'medium' | 'large';
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export declare const SwitchControl: (props: SwitchControlProps) => React.ReactElement;
export declare const Switch: ((props: SwitchProps) => React.ReactElement) & { Control: typeof SwitchControl };
