export interface CalendarRange { start: Date | null; end: Date | null; }
export interface CalendarPreset { key?: string; text: string; start: Date | string; end: Date | string; }

export interface CalendarProps {
  /** 'range' (default) picks a start and end; 'single' picks one day. */
  mode?: 'range' | 'single';
  /** A { start, end } range, or a Date in single mode. */
  value?: CalendarRange | Date | null;
  defaultValue?: CalendarRange | Date | null;
  onChange?: (value: CalendarRange | Date | null) => void;
  /** Shows a clear button in the trigger once dates are set. */
  allowClear?: boolean;
  /** Earliest and latest selectable days. */
  minValue?: Date;
  maxValue?: Date;
  /** Start and end time fields in the popover (range mode). Default true. */
  showTimeInput?: boolean;
  /** Timezone menu under Apply when time fields show. Default true. */
  showTimezone?: boolean;
  /** Calendar and fields side by side. */
  horizontalLayout?: boolean;
  /** Where the popover lines up with the trigger. Default 'start'. */
  popoverAlignment?: 'start' | 'center' | 'end';
  /** small 32px, medium 40px (default). */
  size?: 'small' | 'medium';
  /** Quick ranges shown in a "Select Period" select, as a keyed object or an array. */
  presets?: Record<string, CalendarPreset> | CalendarPreset[];
  /** Preset to show selected while no value is set. */
  presetIndex?: number;
  onPresetChange?: (key: string) => void;
  /** Presets as a chevron after the trigger. */
  compact?: boolean;
  /** Presets above the trigger. */
  stacked?: boolean;
  /** Extra timezone offered in the menu, e.g. 'America/Los_Angeles'; also the default choice. */
  pinnedTimezone?: string;
  timezone?: string;
  defaultTimezone?: string;
  onTimezoneChange?: (timezone: string) => void;
  /** 0 = Sunday (default) … 6 = Saturday. */
  firstDayOfWeek?: number;
  /** BCP 47 locale for month and weekday names; the user's by default. */
  locale?: string;
  placeholder?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Calendar(props: CalendarProps): React.ReactElement;
