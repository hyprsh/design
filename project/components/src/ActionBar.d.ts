export interface ActionBarSelection {
  /** How many rows are ticked. The label reads “{count} selected”. */
  count: number;
  /** How many rows there are. Select All is hidden when `count === total`. */
  total: number;
  /** Ticks every row. Without it there is no Select All. */
  onSelectAll?: () => void;
  onClear: () => void;
}

/**
 * The bar at the foot of a scrolling area while there is something to act on: ticked rows, or unsaved changes.
 * It renders only while `open`, and the app owns both the selection and the dirty state.
 *
 * Put it as the last child of the scroll container. It is sticky at the bottom of that container, in the normal flow at
 * the end of the content, so it never covers the last row and the app adds no padding. It sits above a mounted TabBar
 * and the safe area. Its surface is translucent and blurred, solid with `opaque`, under
 * `prefers-reduced-transparency: reduce` and without `backdrop-filter`.
 *
 * It never takes focus when it appears. Its label (and an error, when one appears) is announced politely, also when the
 * text changes. When it closes with focus inside, focus returns to the element that had it before it entered the bar,
 * or to the scroll container if that element is gone.
 */
export interface ActionBarProps {
  /** The bar renders only while this is true. */
  open: boolean;
  /** The leading text, such as “3 unsaved changes”. `selection` replaces it with “{count} selected”. */
  label?: React.ReactNode;
  /** Buttons for what to do. A busy Save is a Button with `loading`. */
  actions?: React.ReactNode;
  /** Adds a × button that calls this. */
  onClose?: () => void;
  /** The close button's accessible name. @default 'Close' */
  closeLabel?: string;
  /** Selection mode: the count, Select All (hidden when all are selected), Clear, then `actions`. */
  selection?: ActionBarSelection;
  /** A problem to show in the bar, with an error icon. The bar stays open until the app closes it. */
  error?: React.ReactNode;
  /**
   * Restores the solid surface: a plain `background-100` fill with no blur. It is also solid under
   * `prefers-reduced-transparency: reduce` and without `backdrop-filter` support, whatever this is.
   * @default false
   */
  opaque?: boolean;
  className?: string;
}
export declare function ActionBar(props: ActionBarProps): React.ReactElement | null;
