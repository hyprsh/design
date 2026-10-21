export interface MiddleTruncateProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The full text. The middle is replaced with “…” when it doesn't fit its container. */
  value: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function MiddleTruncate(props: MiddleTruncateProps): React.ReactElement;
