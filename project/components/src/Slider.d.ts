export interface SliderProps {
  /** One number, or [start, end] for a range. Geist's single-value [50] also works. */
  value?: number | number[];
  defaultValue?: number | number[];
  /** Called while dragging or typing, with the same shape as value. */
  onValueChange?: (value: number | number[]) => void;
  /** Alias of onValueChange. */
  onChange?: (value: number | number[]) => void;
  /** Called once a drag, key press or typed value is finished. */
  onValueCommitted?: (value: number | number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Visible label above the track; also the accessible name. */
  label?: React.ReactNode;
  'aria-label'?: string;
  /** Show a number field before the track (bound to the first value). */
  showStartInput?: boolean;
  /** Show a number field after the track (bound to the last value). */
  showEndInput?: boolean;
  /** Text for screen readers, e.g. v => v + '%'. */
  formatValue?: (value: number) => string;
  disabled?: boolean;
  /** Track width; default 216px. */
  width?: number | string;
  /** Form field name; a range submits name[0] and name[1]. */
  name?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Slider(props: SliderProps): React.ReactElement;
