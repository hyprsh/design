export interface TextWithCopyButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onCopy'> {
  /** What goes on the clipboard. */
  textToCopy: string;
  /** What is shown, when it differs from `textToCopy` (a shortened ID, a friendly name). Defaults to `textToCopy`. */
  textLabel?: React.ReactNode;
  /** Announced to screen readers after a copy. Defaults to “Copied to clipboard”. */
  successMessage?: string;
  /** Keep the label on one line and truncate it with an ellipsis. The full label shows as a tooltip. */
  ellipsis?: boolean;
  /** hyprsh: called with the copied text after the clipboard write succeeds. */
  onCopy?: (text: string) => void;
}
export declare function TextWithCopyButton(props: TextWithCopyButtonProps): React.ReactElement;
