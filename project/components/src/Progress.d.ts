export interface ProgressStop {
  /** Position on the same scale as value. */
  value: number;
  /** Shown on hover and focus. */
  tooltip?: React.ReactNode;
  /** Accessible name of the marker; defaults to the tooltip text. */
  ariaLabel?: string;
}
export interface ProgressSegment {
  value: number;
  /** Colour of StatusDot's state of the same name. */
  tone: 'success' | 'info' | 'warning' | 'error' | 'neutral';
}
interface ProgressBase {
  /** Default 100. */
  max?: number;
  /** Marked points along the bar, each with an optional tooltip. */
  stops?: ProgressStop[];
  /** Bar width (number = px). Default 100%. */
  width?: number | string;
  /** Bar height in px. Default 10. */
  height?: number;
  /** hyprsh: a label row above the bar, with the percentage on the right (none for segments). Names the bar. */
  label?: React.ReactNode;
  /** Accessible name when there is no label. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
/** The value form. With segments, use ProgressSegmentsProps; the Progress component accepts either. */
export interface ProgressProps extends ProgressBase {
  value: number;
  /** Fill colour. success is blue. Default 'default' (gray-1000). */
  type?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
  /** Threshold → colour, e.g. { 0: 'var(--gray-1000)', 80: 'var(--amber-700)', 95: 'var(--red-700)' }. Overrides type. */
  colors?: Record<number, string>;
  /** Older name for type: blue → success, amber → warning, red → error; green stays green. */
  variant?: 'default' | 'blue' | 'green' | 'amber' | 'red';
  segments?: never;
  gap?: never;
}
export interface ProgressSegmentsProps extends ProgressBase {
  /** One bar split into tones, drawn left to right and cut off at max. Replaces value, colors and type. */
  segments: ProgressSegment[];
  /** A 1px gap in the page colour between segments. Default false. */
  gap?: boolean;
  value?: never;
  colors?: never;
  type?: never;
  variant?: never;
}
export declare function Progress(props: ProgressProps | ProgressSegmentsProps): React.ReactElement;
