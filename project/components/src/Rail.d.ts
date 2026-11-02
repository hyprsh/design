export interface RailItemProps {
  /** Selects the item on press. Leave it off for an action item such as Settings opening a dialog. */
  value?: string;
  /** The item's accessible name and its tooltip: the item shows its icon only. */
  label: string;
  icon: React.ReactNode;
  /** `true`: a dot. A number: a count bubble ("99+" above 99, nothing for 0). Any other node is rendered as given. */
  badge?: boolean | number | React.ReactNode;
  /**
   * The colour of a dot or count badge: `'accent'` (default), `'error'` (red) or `'warning'` (amber). It is visual only
   * and a node badge ignores it, so say the tone in `badgeLabel` ("2 blocking").
   */
  badgeTone?: 'accent' | 'error' | 'warning';
  /** Added to the item's accessible name, such as "3 need attention". */
  badgeLabel?: string;
  /** Takes aria-current and the selected state: while any item has `current`, no item is selected by `value`. */
  current?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  /** Renders a link instead of a button. */
  href?: string;
  /** The item opens a dialog or sheet (aria-haspopup="dialog"). */
  haspopup?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
/** One icon-only destination or action in a Rail, with its label in a tooltip on its right. Takes the same props as TabBar.Item. */
export declare const RailItem: (props: RailItemProps) => React.ReactElement;
/** Pushes the children after it to the bottom of the Rail. */
export declare const RailSpacer: () => React.ReactElement;

/**
 * The vertical strip of icon-only destinations at the edge of an app, from `sm` up: TabBar's counterpart at wider
 * widths, with the same items. It sits in the page flow at full height and is sticky, so the app's layout places it.
 */
export interface RailProps {
  /** The accessible name of the `<nav>`. */
  label: string;
  /** The selected item's value (controlled). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Same as onChange; both are called. */
  onValueChange?: (value: string) => void;
  /** 'sm' (default): hidden below 640px. false: shown at every width. */
  showFrom?: 'sm' | false;
  /** Rail.Item and Rail.Spacer, and any other element, such as a ThemeSwitcher in the bottom group. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare const Rail: ((props: RailProps) => React.ReactElement) & { Item: typeof RailItem; Spacer: typeof RailSpacer };
