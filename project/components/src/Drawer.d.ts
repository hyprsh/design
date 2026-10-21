export interface DrawerProps {
  /** Geist name for open. */
  show: boolean;
  /** Called on a backdrop tap, Escape or a downward swipe. */
  onDismiss: () => void;
  /** Fixed panel height: a number in px or any CSS length. Default: fits the content, up to 90dvh. */
  height?: number | string;
  /** The panel scrolls inside its frame. Default true. */
  verticalScroll?: boolean;
  /** Name the dialog when it has no DrawerTitle. */
  'aria-label'?: string;
  /** Render in place instead of in a portal. */
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}
export interface DrawerTitleProps { className?: string; children?: React.ReactNode }
/** Labels the drawer (aria-labelledby). */
export declare function DrawerTitle(props: DrawerTitleProps): React.ReactElement;
export declare const Drawer: ((props: DrawerProps) => React.ReactElement | null) & { Title: typeof DrawerTitle };
