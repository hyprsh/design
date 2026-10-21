export interface ErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** small 13px, medium 14px (default), large 16px. */
  size?: Size;
  /** Bold prefix, default 'Error'. false hides it (screen readers still hear “Error”). */
  label?: string | false;
  /** Structured form: a message plus an optional recovery link. Replaces children. */
  error?: { message: React.ReactNode; action?: React.ReactNode; link?: string };
  children?: React.ReactNode;
}
/** Exported as `Error`; implemented as `ErrorMessage` so the global constructor is never shadowed at runtime. */
export declare function Error(props: ErrorProps): React.ReactElement;
