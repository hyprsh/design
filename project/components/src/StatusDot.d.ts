type StatusDotState = 'queued' | 'building' | 'ready' | 'error' | 'canceled' | 'deleted';
export interface StatusDotProps {
  /** Deployment state, in either case: 'READY' or 'ready'. Default 'ready'. */
  state?: StatusDotState | Uppercase<StatusDotState>;
  /** Shown by default (the state word). true shows it, a node replaces it, false hides it (the accessible name stays). */
  label?: React.ReactNode | boolean;
  /** Noun phrase for the title and accessible name. Default 'This deployment' → “This deployment is ready.” */
  titlePrefix?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
  className?: string;
}
export declare function StatusDot(props: StatusDotProps): React.ReactElement;
