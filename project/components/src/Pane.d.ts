/**
 * One region of a screen: a column that fills its container's height, with an optional `header`, a body that scrolls
 * on its own and an optional `footer`. The header and footer are divided from the body by hairlines and never scroll.
 *
 * The body is the pane's scroll container, so an `ActionBar` placed at the end of the body sticks to the pane's foot.
 * With a `label` the body is also a focusable, named region. A Pane fills the height its container gives it, so give the container one (for example
 * `100dvh`). It works on its own for a single-pane screen.
 *
 * It is `background-100`. To use `background-200` as app chrome (usually the list pane), set
 * `--hy-pane-background: var(--background-200)` in the app's class or in `style`.
 */
export interface PaneProps {
  /** A bar above the body, such as a title and its actions. It never scrolls. */
  header?: React.ReactNode;
  /** A bar below the body. It never scrolls. */
  footer?: React.ReactNode;
  /** Makes the body a named region and a Tab stop, so keyboard users can reach and scroll it. Give it whenever the body can scroll. */
  label?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Pane(props: PaneProps): React.ReactElement;
