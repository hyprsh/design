export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** Visible label, Title Case. Without it, pass aria-label or aria-labelledby. */
  label?: React.ReactNode;
  /** One sentence under the field, wired up with aria-describedby. */
  hint?: React.ReactNode;
  /** Error text under the field, announced with role="alert"; also sets aria-invalid. `true` shows the red ring only. */
  error?: React.ReactNode;
  /** Text or an icon before the value: `https://`, a search icon. */
  prefix?: React.ReactNode;
  /** Text or an icon after the value: `.hyprsh.dev`, a kbd. */
  suffix?: React.ReactNode;
  /** false drops the gray background and divider behind the prefix (use for icons). */
  prefixStyling?: boolean;
  suffixStyling?: boolean;
  /** false renders the prefix with no wrapper at all, for a node that brings its own layout. */
  prefixContainer?: boolean;
  suffixContainer?: boolean;
  /** small 32px, medium 36px (default), large 40px. */
  size?: Size;
  /** Pill corners. */
  rounded?: boolean;
  /** HTML type; an alias for `type`, matching Button. */
  typeName?: string;
  /** 'inline' puts the label beside the field instead of above it, for toolbars (“Monitor [select]”). The hint and error stay under the field. Needs `label`. Default 'top'. */
  labelPosition?: 'top' | 'inline';
  /** Class for the bordered frame; `className` goes on the outer field. */
  wrapperClassName?: string;
}
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
