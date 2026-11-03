export interface ActionBarSelection {
  /** How many rows are ticked. The count chip reads “{count} selected”. */
  count: number;
  /** How many rows there are. “Select All {total}” is hidden when `count === total`. */
  total: number;
  /** Ticks every row. Without it there is no “Select All {total}”. */
  onSelectAll?: () => void;
  /** Called by the × inside the count chip (accessible name “Clear Selection”). */
  onClear: () => void;
}

/** A quiet action of the bar: a text button when the bar is wide, an item of its More menu when narrow. */
export interface ActionBarSecondaryAction {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
}

/**
 * The bar at the foot of a scrolling area while there is something to act on: ticked rows, or unsaved changes.
 * It renders only while `open`, and the app owns both the selection and the dirty state.
 *
 * It is a capsule on an inverted surface (`gray-1000` with `background-100` text, so it flips with the theme) that hugs
 * its content and is centred in its scroll container, never wider than the container less an 8px gap on each side.
 * Buttons passed in `actions` are restyled for that surface: secondary and tertiary are transparent with the inverted
 * text, primary takes the page's colours, and small and medium Buttons are drawn at 32px (under touch sizing they keep
 * that drawing and grow their hit area to the touch target).
 *
 * Put it as the last child of the scroll container. It is sticky at the bottom of that container, in the normal flow at
 * the end of the content, so it never covers the last row and the app adds no padding. It sits above a mounted TabBar
 * and the safe area.
 *
 * When the container is narrower than 480px the capsule spans its width: “Select All {total}” and `secondaryActions`
 * move into a More (…) menu, and the count chip and `actions` stay visible. The label is never cut short: when it doesn't
 * fit on one line with the controls, it takes a line of its own and the controls wrap below it, right-aligned.
 *
 * It never takes focus when it appears. Its label (and an error, when one appears) is announced politely, also when the
 * text changes. When it closes with focus inside, focus returns to the element that had it before it entered the bar,
 * or to the scroll container if that element is gone.
 */
export interface ActionBarProps {
  /** The bar renders only while this is true. */
  open: boolean;
  /** The leading text, such as “3 unsaved changes”. `selection` replaces it with the count chip. */
  label?: React.ReactNode;
  /** A dot in this tone before the label. An `error` shows the error tone whatever this is. */
  tone?: 'success' | 'info' | 'warning' | 'error' | 'neutral';
  /** Buttons for what to do, after a separator. A busy Save is a Button with `loading`. Keep it to one or two. */
  actions?: React.ReactNode;
  /** Quiet text buttons before `actions` when the bar is wide, folded into the More menu when it is narrow. */
  secondaryActions?: ActionBarSecondaryAction[];
  /** Adds a × button at the end of the capsule that calls this. */
  onClose?: () => void;
  /** The close button's accessible name. @default 'Close' */
  closeLabel?: string;
  /** Selection mode: the count chip with its clear ×, “Select All {total}” (hidden when all are selected), then `actions`. */
  selection?: ActionBarSelection;
  /**
   * A problem to show as text inside the capsule, above the row, wrapped at the row's width and never cut short; a
   * string's first sentence is bold. The dot turns to the error tone, and the bar stays open until the app closes it.
   */
  error?: React.ReactNode;
  /**
   * No effect: the capsule is always solid. Kept so existing code that passes it keeps working.
   * @deprecated
   */
  opaque?: boolean;
  className?: string;
}
export declare function ActionBar(props: ActionBarProps): React.ReactElement | null;
