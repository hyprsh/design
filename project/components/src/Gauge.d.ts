export interface GaugeProps {
  /** 0–100. */
  value?: number;
  /** tiny 20px, small 32px, medium 64px (default), large 128px. */
  size?: 'tiny' | 'small' | 'medium' | 'large';
  /** Print the value in the centre (not on tiny). */
  showValue?: boolean;
  /** Threshold → colour ({ 0: 'var(--red-800)', 50: 'var(--green-700)' }), or explicit { primary, secondary }. Default: red below 34, amber to 66, green from 67. */
  colors?: Record<number, string> | { primary?: string; secondary?: string };
  /** 'equal' gives both arcs the same gap at each end. Default: the value arc takes its full length. */
  arcPriority?: 'default' | 'equal';
  /** Value unknown yet: a full gray ring with an activity icon. */
  indeterminate?: boolean;
  /** Replaces the centre with your own content, such as an icon. */
  children?: React.ReactNode;
  /** What the value measures, such as “Performance Score”. Default “Score”. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Gauge(props: GaugeProps): React.ReactElement;
