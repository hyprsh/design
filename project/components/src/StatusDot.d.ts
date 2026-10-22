type StatusDotDeploymentState = 'queued' | 'building' | 'ready' | 'error' | 'canceled' | 'deleted';
type StatusDotSemanticState = 'success' | 'warning' | 'error' | 'neutral' | 'pending';
type StatusDotState = StatusDotDeploymentState | StatusDotSemanticState;
export interface StatusDotProps {
  /**
   * A semantic state for any health or status (`success` green, `warning` amber, `error` red, `neutral` grey, `pending` grey and pulsing)
   * or a deployment state (`queued`, `building`, `ready`, `error`, `canceled`, `deleted`), in either case. Default 'ready'.
   */
  state?: StatusDotState | Uppercase<StatusDotState>;
  /** Shown by default (the state word). true shows it, a node replaces it ("Healthy", "Idle"), false hides it (the accessible name stays). */
  label?: React.ReactNode | boolean;
  /**
   * Noun phrase for the title and accessible name. Deployment states: default 'This deployment' → “This deployment is ready.”
   * Semantic states: optional; “api: Success”.
   */
  titlePrefix?: string;
  /** The whole title and accessible name, replacing the generated one. Use it for a dot without a label. */
  title?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
  className?: string;
}
export declare function StatusDot(props: StatusDotProps): React.ReactElement;
