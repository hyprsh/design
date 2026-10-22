type StatusDotDeploymentState = 'queued' | 'building' | 'ready' | 'error' | 'canceled' | 'deleted';
type StatusDotSemanticState = 'success' | 'warning' | 'error' | 'neutral' | 'pending' | 'info';
type StatusDotState = StatusDotDeploymentState | StatusDotSemanticState;
export interface StatusDotProps {
  /**
   * A semantic state for any health or status (`success` green, `warning` amber, `error` red, `neutral` grey, `pending` grey and pulsing, `info` blue)
   * or a deployment state (`queued`, `building`, `ready`, `error`, `canceled`, `deleted`), in either case. Default 'ready'.
   */
  state?: StatusDotState | Uppercase<StatusDotState>;
  /** Shown by default (the state word). true shows it, a node replaces it ("Healthy", "Idle"), false hides it (the accessible name stays). */
  label?: React.ReactNode | boolean;
  /**
   * `filled` (default) is a solid dot. `outline` is a ring in the state's colour with a transparent centre, and `dashed` is the same ring dashed.
   * All three are the same size. Visual only: the label, title and accessible name don't change, so say what an outline means in `label` or `title`.
   */
  variant?: 'filled' | 'outline' | 'dashed';
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
