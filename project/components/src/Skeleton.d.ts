export interface SkeletonProps {
  /** CSS width (number = px). Default: full width, or the children's width when wrapping. */
  width?: number | string;
  /** Minimum height (number = px). Default 24, or the children's height when wrapping. */
  height?: number | string;
  /** The height of the real content's box, when the placeholder is shorter: the rest becomes bottom margin. */
  boxHeight?: number;
  /** Fully rounded ends, for avatars and pills. */
  pill?: boolean;
  /** Fully rounded (radius-full), like pill. */
  rounded?: boolean;
  /** Square corners. */
  squared?: boolean;
  /** Shimmer. Default true; false leaves a static gray block. */
  animated?: boolean;
  /** Placeholder over a Button: extends past its border ring and uses its radius. */
  button?: boolean;
  /** Default true. false renders the children instead. */
  show?: boolean;
  /** The real content: hidden but sizing the placeholder while loading, shown when show={false}. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Skeleton(props: SkeletonProps): React.ReactElement | null;
