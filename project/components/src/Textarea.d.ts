export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label, Title Case. Without it, pass aria-label. */
  label?: React.ReactNode;
  /** One sentence under the field, wired up with aria-describedby. */
  hint?: React.ReactNode;
  /** Error text under the field, announced with role="alert"; also sets aria-invalid. `true` shows the red ring only. */
  error?: React.ReactNode;
  /** small and medium are 14px text, large is 16px. */
  size?: Size;
  /** Geist Mono in the value, the placeholder and the error line, for paths, keys and hashes. Default false. */
  mono?: boolean;
  /** Class for the bordered frame; `className` goes on the outer field. */
  wrapperClassName?: string;
}
export declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;
