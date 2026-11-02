/**
 * A list pane beside a detail pane. From `sm` (640px) up the list is a column of `listWidth` and the detail fills the
 * rest, with a vertical divider between them. Below `sm` it shows one pane at a time, chosen by `show`; the hidden
 * pane is out of the accessibility tree and the Tab order but keeps its scroll position. There is no transition.
 *
 * It fills the height its container gives it, so give the container one (for example `100dvh`). Each child is
 * normally a `Pane`, and each scrolls on its own. The app switches panes, usually from a TitleBar back button.
 */
export interface SplitViewProps {
  /** The list column's width from `sm` up. A number is px. @default 320 */
  listWidth?: number | string;
  /** Which pane is visible below `sm` (controlled). @default 'list' */
  show?: 'list' | 'detail';
  /** Exactly two children: the list, then the detail. */
  children: [React.ReactNode, React.ReactNode];
  className?: string;
  style?: React.CSSProperties;
}
export declare function SplitView(props: SplitViewProps): React.ReactElement;
