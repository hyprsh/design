export interface SparkbarsRun {
  /** Bar height, scaled to max. */
  value: number;
  /** The run's outcome, coloured as StatusDot and Progress segments of the same name. */
  tone: 'success' | 'info' | 'warning' | 'error' | 'neutral';
  /** The run's accessible name and its tooltip text. */
  label: string;
}
export interface SparkbarsProps {
  /** One bar per run, oldest first, drawn left to right. */
  runs: SparkbarsRun[];
  /** The value that fills the box. Default: the largest value. A bar is never under 4px. */
  max?: number;
  /** Height of the box in px. Default 24. */
  height?: number;
  /** Names the row; the component adds a per-tone summary, such as "27 success, 2 warning, 1 error". */
  'aria-label': string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Sparkbars(props: SparkbarsProps): React.ReactElement;
