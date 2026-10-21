export interface CopyButtonProps extends Omit<ButtonProps, 'children' | 'svgOnly' | 'prefix' | 'suffix'> {
  /** The text written to the clipboard. */
  textToCopy: string;
  /** Accessible name; say what is copied, such as 'Copy Deployment URL'. Default 'Copy to Clipboard'. */
  label?: string;
  /** Called with the text after it reaches the clipboard. */
  onCopy?: (text: string) => void;
}
export declare function CopyButton(props: CopyButtonProps): React.ReactElement;
