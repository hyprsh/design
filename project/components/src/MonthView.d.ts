export interface MonthViewEntry {
  /** Unique among the entries. */
  key: string;
  /** The day it belongs to (the time of day is ignored). */
  date: Date;
  label: React.ReactNode;
  /** A small leading mark, coloured as StatusDot and Progress segments of the same name. The label carries the meaning. */
  tone?: 'success' | 'info' | 'warning' | 'error' | 'neutral';
  /**
   * How the mark is drawn: `filled` (default), `outline` (a ring in the tone's colour with a transparent centre) or `dashed` (the same ring, dashed). Same size; visual only, so the label carries the meaning.
   * Use it to tell two states of one tone apart, such as a waiting and an ignored `neutral`.
   */
  variant?: 'filled' | 'outline' | 'dashed';
  /** Makes the entry a link. */
  href?: string;
  /** Makes the entry a button, or runs on a link's click as well. */
  onOpen?: (event: React.MouseEvent) => void;
}

export interface MonthViewProps {
  /** The month shown: any date in it. Controlled with `onMonthChange`. */
  month?: Date;
  defaultMonth?: Date;
  /** Called with the first day of the new month. */
  onMonthChange?: (month: Date) => void;
  /** Every entry, in the order a day should list them. */
  entries: MonthViewEntry[];
  /** Entries a day shows before "+N more". Default 3. */
  maxPerDay?: number;
  /** A day, or its "+N more", was activated. In the narrow form a day selects instead. */
  onDayOpen?: (date: Date) => void;
  /** The selected day in the narrow form, whose entries list below the grid. */
  selectedDate?: Date;
  defaultSelectedDate?: Date;
  onSelectedDateChange?: (date: Date) => void;
  /** 0 = Sunday (default) … 6 = Saturday. */
  firstDayOfWeek?: number;
  /** BCP 47 locale for month and weekday names; the user's by default. */
  locale?: string;
  /** Names the grid, before the month and year. */
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function MonthView(props: MonthViewProps): React.ReactElement;
