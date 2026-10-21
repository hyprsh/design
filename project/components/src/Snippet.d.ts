export interface SnippetProps {
  /** One command, or an array for a short multi-line block. */
  text: string | string[];
  /** '$' by default; false hides it for non-shell content. */
  prompt?: string | false;
  /** Inverted: light text on a dark fill. */
  dark?: boolean;
  /** Tinted variants. 'success' is blue, as in Geist. */
  type?: 'default' | 'success' | 'error' | 'warning';
  /** Width of the snippet, e.g. '300px' or '100%'. Defaults to its content (fit-content). */
  width?: string | number;
  /** Controls the checkmark from outside, e.g. when a parent copies different text. */
  copied?: boolean;
  /** Plain-text clipboard payload, when it should differ from what `text` shows. */
  copyText?: string;
  /** Shown when `text` is empty. Not copied. */
  placeholder?: string;
  onCopy?: () => void;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Snippet(props: SnippetProps): React.ReactElement;
