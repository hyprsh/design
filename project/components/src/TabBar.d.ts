export interface TabBarAccessory {
  /** The accessible name; the accessory shows an icon only. */
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  /** Renders a link instead of a button. */
  href?: string;
}

export interface TabBarItemProps {
  /** Selects the item on press. Leave it off for an action item such as More. */
  value?: string;
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
  /** Takes aria-current and the selected pill: while any item has `current`, no item is selected by `value`. */
  current?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  /** Renders a link instead of a button. */
  href?: string;
  /** The item opens a dialog or sheet (aria-haspopup="dialog"). */
  haspopup?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
/** One destination or action in a TabBar. */
export declare const TabBarItem: (props: TabBarItemProps) => React.ReactElement;

/**
 * The floating pill tab bar for phones. Fixed to the bottom and out of
 * layout; while one is visible, the CSS variable `--tab-bar-height` holds its height (safe area included).
 */
export interface TabBarProps {
  /** The accessible name of the `<nav>`. */
  label: string;
  /** The selected item's value (controlled). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Same as onChange; both are called. */
  onValueChange?: (value: string) => void;
  /** A round button beside the capsule, for an action that isn't a screen. */
  accessory?: TabBarAccessory;
  /** Shrinks the capsule to the selected item while content scrolls down; scrolling up or a tap expands it. */
  minimizeOnScroll?: boolean;
  /** Watch this container instead of every scrolling element in the document. */
  scrollRef?: React.RefObject<HTMLElement>;
  /** 'sm' (default): hidden from 640px up. false: shown at every width. */
  hideFrom?: 'sm' | false;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare const TabBar: ((props: TabBarProps) => React.ReactElement) & { Item: typeof TabBarItem };
