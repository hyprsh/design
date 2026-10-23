export type ToggleColor = 'accent' | 'blue' | 'amber' | 'red' | 'green' | 'teal' | 'purple' | 'pink' | 'gray';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'defaultChecked' | 'onChange' | 'size' | 'type' | 'color'> {
  checked?: boolean;
  /** Uncontrolled starting state. */
  defaultChecked?: boolean;
  /** Called with the new state; the change event comes second. */
  onChange?: (next: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  /** small 28×14 (default), medium 36×20, large 40×24. */
  size?: 'small' | 'medium' | 'large';
  /** Track colour. Any colour but the accent keeps the track tinted when off. Default 'accent' (blue). */
  color?: ToggleColor;
  /** Icons shown inside the thumb for each state. */
  icon?: { checked?: React.ReactNode; unchecked?: React.ReactNode };
  /** 'label-first' (default) or 'switch-first'. */
  direction?: 'label-first' | 'switch-first';
  /** 'title' (default) capitalises each word of the label; 'normal' leaves it alone. */
  labelCasing?: 'title' | 'normal';
  /** The label: a noun phrase naming the "on" state. */
  children?: React.ReactNode;
  'aria-label'?: string;
  className?: string;
}
export declare function Toggle(props: ToggleProps): React.ReactElement;
