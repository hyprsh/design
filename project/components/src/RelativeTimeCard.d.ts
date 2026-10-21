export interface RelativeTimeCardProps {
  /** The timestamp: Unix ms, a Date or an ISO string. Don't pre-format it. */
  date: number | Date | string;
  /** Side of the trigger. Default 'top'. */
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  /** BCP 47 locale for the Intl formatters. Default: the browser's. */
  locale?: string;
  /** Trigger. Default: the short relative time (2m ago, 5h ago, Yesterday) in a <time>. Use only for non-time labels or a custom trigger. */
  children?: React.ReactNode;
  /** hyprsh: start open; for docs and previews. */
  defaultOpen?: boolean;
  className?: string;
}
export declare function RelativeTimeCard(props: RelativeTimeCardProps): React.ReactElement;
