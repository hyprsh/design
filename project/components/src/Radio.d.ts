export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'value'> {
  /** The option's value. Inside a RadioGroup it is compared with the group's value. */
  value?: string;
  /** Standalone use only; inside a RadioGroup the group decides. */
  checked?: boolean;
  /** The label, 13px. Without it, pass aria-label. */
  children?: React.ReactNode;
}
export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Names the group for assistive tech (visually hidden). Or pass aria-label. */
  label?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  /** Called with the picked option's value. */
  onChange?: (value: string) => void;
  /** The shared input name; generated when omitted. Set it when the group posts with a form. */
  name?: string;
  disabled?: boolean;
  /** Marks every option required, so a native form asks for one. */
  required?: boolean;
  /** Lays the options out in a row. */
  horizontal?: boolean;
  children?: React.ReactNode;
}
export interface RadioGroupItemProps extends RadioProps { value: string }
export interface UseRadioOptions { value: string; disabled?: boolean; id?: string; 'aria-label'?: string }
export declare function RadioGroup(props: RadioGroupProps): React.ReactElement;
export declare function RadioGroupItem(props: RadioGroupItemProps): React.ReactElement;
/** Inside a RadioGroup: the bare radio for a custom layout, and whether it is selected. */
export declare function useRadio(options: UseRadioOptions): { component: React.ReactElement; checked: boolean };
export declare function Radio(props: RadioProps): React.ReactElement;
export declare namespace Radio {
  const Group: typeof RadioGroup;
  const GroupItem: typeof RadioGroupItem;
  const useRadio: (options: UseRadioOptions) => { component: React.ReactElement; checked: boolean };
}
