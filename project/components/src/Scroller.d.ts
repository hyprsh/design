export interface ScrollerProps {
  /** Scroll axis. Default "y". */
  overflow?: 'x' | 'y' | 'both';
  /** Number (px) or any CSS length. */
  width?: number | string;
  height?: number | string;
  /** Adds buttons that step to the previous or next direct child: up/down above a vertical scroller, left/right below a horizontal one. */
  withButtons?: boolean;
  /** Class for the element that wraps children (it is a flex row for "x", a column for "y"). */
  childrenContainerClassName?: string;
  /** Names the scroll region, and is folded into the button labels (“Scroll Deployments Right”). */
  'aria-label'?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Scroller(props: ScrollerProps): React.ReactElement;
